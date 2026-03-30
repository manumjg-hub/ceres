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

  const origin = event.headers.origin || "https://tudominio.netlify.app";

  try {
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "userId requerido" }) };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se encontró cliente de Stripe para este usuario" }),
      };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   profile.stripe_customer_id,
      return_url: `${origin}/`,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url: portalSession.url }),
    };
  } catch (err) {
    console.error("customer-portal error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
