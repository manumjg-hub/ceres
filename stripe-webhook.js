// netlify/functions/stripe-webhook.js
// POST /webhook/stripe-webhook
// Stripe envía eventos aquí — configura en Stripe Dashboard → Webhooks

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Usa service_role para escribir desde el servidor (ignora RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapea priceId → nombre de plan
const getPlanFromPriceId = (priceId) => {
  if (priceId === process.env.VITE_STRIPE_PRICE_BASICO)  return "basico";
  if (priceId === process.env.VITE_STRIPE_PRICE_PRO)     return "pro";
  if (priceId === process.env.VITE_STRIPE_PRICE_PREMIUM) return "premium";
  return "basico";
};

const activateSubscription = async (userId, subscriptionId, priceId, customerId, endsAt) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status:     "active",
      stripe_subscription_id:  subscriptionId,
      stripe_customer_id:      customerId,
      subscription_plan:       getPlanFromPriceId(priceId),
      subscription_ends_at:    endsAt ? new Date(endsAt * 1000).toISOString() : null,
    })
    .eq("id", userId);
  if (error) console.error("activateSubscription error:", error);
};

const updateSubscriptionStatus = async (subscriptionId, status, endsAt) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status:  status,
      subscription_ends_at: endsAt ? new Date(endsAt * 1000).toISOString() : null,
    })
    .eq("stripe_subscription_id", subscriptionId);
  if (error) console.error("updateSubscriptionStatus error:", error);
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log("Stripe event received:", stripeEvent.type);

  try {
    switch (stripeEvent.type) {

      // ✅ Pago completado → activar suscripción
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const userId  = session.metadata?.userId;
        if (!userId) break;

        // Recuperar detalles de la suscripción para obtener priceId
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = sub.items.data[0]?.price?.id;

        await activateSubscription(
          userId,
          session.subscription,
          priceId,
          session.customer,
          sub.current_period_end
        );
        console.log(`✅ Suscripción activada para usuario ${userId}`);
        break;
      }

      // 🔄 Suscripción actualizada (cambio de plan, renovación)
      case "customer.subscription.updated": {
        const sub    = stripeEvent.data.object;
        const userId = sub.metadata?.userId;
        const status = sub.status === "active" ? "active"
                     : sub.status === "trialing" ? "trialing"
                     : sub.status === "past_due"  ? "past_due"
                     : "inactive";

        if (userId) {
          const priceId = sub.items.data[0]?.price?.id;
          await supabase.from("profiles").update({
            subscription_status:  status,
            subscription_plan:    getPlanFromPriceId(priceId),
            subscription_ends_at: new Date(sub.current_period_end * 1000).toISOString(),
          }).eq("id", userId);
        } else {
          await updateSubscriptionStatus(sub.id, status, sub.current_period_end);
        }
        break;
      }

      // ❌ Suscripción cancelada
      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object;
        await updateSubscriptionStatus(sub.id, "canceled", sub.current_period_end);
        console.log(`❌ Suscripción cancelada: ${sub.id}`);
        break;
      }

      // 💳 Pago fallido
      case "invoice.payment_failed": {
        const invoice = stripeEvent.data.object;
        await updateSubscriptionStatus(invoice.subscription, "past_due", null);
        console.log(`⚠️  Pago fallido para suscripción: ${invoice.subscription}`);
        break;
      }

      // 🔁 Factura pagada (renovación mensual)
      case "invoice.paid": {
        const invoice = stripeEvent.data.object;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        await updateSubscriptionStatus(sub.id, "active", sub.current_period_end);
        break;
      }

      default:
        console.log(`Evento no manejado: ${stripeEvent.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    // Devolvemos 200 para que Stripe no reintente — logeamos el error
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
