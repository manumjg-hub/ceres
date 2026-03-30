import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapea Price IDs → nombre del plan
const PLAN_MAP = {
  [process.env.STRIPE_PRICE_BASIC]: "Básico",
  [process.env.STRIPE_PRICE_PRO]:   "Pro",
};

async function upsertSubscription(userId, subscriptionId, status, priceId, periodEnd) {
  const plan = PLAN_MAP[priceId] || "Básico";
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    subscription_status: status,
    stripe_subscription_id: subscriptionId,
    plan,
    plan_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  });
  if (error) console.error("Supabase upsert error:", error.message);
}

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
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log("Stripe webhook event:", stripeEvent.type);

  try {
    switch (stripeEvent.type) {

      // ── Pago completado → activar suscripción
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const userId  = session.metadata?.userId;
        if (!userId) { console.warn("checkout.session.completed: no userId in metadata"); break; }

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const item = subscription.items.data[0];

        await upsertSubscription(
          userId,
          subscription.id,
          "active",
          item.price.id,
          subscription.current_period_end
        );
        console.log(`✅ Suscripción activada para usuario ${userId}`);
        break;
      }

      // ── Suscripción actualizada (renovación, cambio de plan)
      case "customer.subscription.updated": {
        const sub    = stripeEvent.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) { console.warn("subscription.updated: no userId in metadata"); break; }

        const item   = sub.items.data[0];
        const status = sub.status === "active"   ? "active"
                     : sub.status === "past_due" ? "past_due"
                     : "inactive";

        await upsertSubscription(userId, sub.id, status, item.price.id, sub.current_period_end);
        console.log(`🔄 Suscripción actualizada para usuario ${userId}: ${status}`);
        break;
      }

      // ── Suscripción cancelada / eliminada
      case "customer.subscription.deleted": {
        const sub    = stripeEvent.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) { console.warn("subscription.deleted: no userId in metadata"); break; }

        await supabase.from("profiles").update({
          subscription_status:    "inactive",
          stripe_subscription_id: null,
          plan:                   null,
          plan_period_end:        null,
        }).eq("id", userId);

        console.log(`❌ Suscripción desactivada para usuario ${userId}`);
        break;
      }

      // ── Pago fallido (aviso de impago)
      case "invoice.payment_failed": {
        const invoice    = stripeEvent.data.object;
        const customerId = invoice.customer;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase.from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id);
          console.log(`⚠️ Pago fallido para cliente ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Evento no manejado: ${stripeEvent.type}`);
    }
  } catch (err) {
    console.error("Error en webhook handler:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
