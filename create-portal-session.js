// netlify/functions/create-portal-session.js
// POST /api/create-portal-session
// Abre el portal de Stripe para que el usuario gestione su suscripción
// (cambiar plan, cancelar, actualizar tarjeta)

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { customerId } = JSON.parse(event.body);

    if (!customerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "customerId es obligatorio" }),
      };
    }

    const appUrl = process.env.VITE_APP_URL || "https://ceresnutri.netlify.app";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: appUrl,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: portalSession.url }),
    };

  } catch (err) {
    console.error("create-portal-session error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
