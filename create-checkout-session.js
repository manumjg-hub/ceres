// netlify/functions/create-checkout-session.js
// POST /api/create-checkout-session
// Body: { priceId, userId, userEmail }

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_NAMES = {
  [process.env.VITE_STRIPE_PRICE_BASICO]:   "Básico",
  [process.env.VITE_STRIPE_PRICE_PRO]:      "Pro",
  [process.env.VITE_STRIPE_PRICE_PREMIUM]:  "Premium",
};

export const handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { priceId, userId, userEmail } = JSON.parse(event.body);

    if (!priceId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan parámetros: priceId y userId son obligatorios" }),
      };
    }

    // Buscar o crear customer en Stripe
    let customerId;
    const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const appUrl = process.env.VITE_APP_URL || "https://ceresnutri.netlify.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,           // 14 días de prueba gratis
        metadata: { userId },
      },
      allow_promotion_codes: true,       // Acepta cupones
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
      cancel_url:  `${appUrl}/?upgrade=cancel`,
      metadata: { userId, priceId },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };

  } catch (err) {
    console.error("create-checkout-session error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
