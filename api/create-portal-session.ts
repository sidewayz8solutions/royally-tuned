import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !userData?.user) throw new Error(error?.message || 'User not found');

    const user = userData.user;
    const customerId = (user.app_metadata as any)?.stripe_customer_id as string | undefined;
    if (!customerId) return res.status(400).json({ error: 'No Stripe customer for user' });

    const origin = req.headers.origin || process.env.PUBLIC_APP_URL || 'http://localhost:5173';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/?portal=return`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (e) {
    console.error('create-portal-session error', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
}

