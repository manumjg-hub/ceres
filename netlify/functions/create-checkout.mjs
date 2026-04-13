import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const origin = event.headers.origin || event.headers.referer || "https://tudominio.netlify.app";

  try {
    const { priceId, userId, email } = JSON.parse(event.body);

    if (!priceId || !userId || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan campos requeridos: priceId, userId, email" }),
      };
    }

    // Buscar si el usuario ya tiene cliente Stripe
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Si no tiene, crear uno nuevo
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_id: userId },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // Crear sesión de pago
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      locale: "es",
      allow_promotion_codes: true,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("create-checkout error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
