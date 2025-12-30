import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (!process.env.PRICE_ID_PRO) return res.status(500).json({ error: 'Missing PRICE_ID_PRO' });

  try {
    const origin = req.headers.origin || process.env.PUBLIC_APP_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.PRICE_ID_PRO as string, quantity: 1 }],
      success_url: `${origin}/create-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-guest-checkout error', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
}

