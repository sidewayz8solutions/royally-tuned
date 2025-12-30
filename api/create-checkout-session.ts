import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

interface AppMetadata {
  stripe_customer_id?: string;
  [key: string]: unknown;
}

interface CheckoutRequestBody {
  userId?: string;
}

interface CheckoutRequest {
  method: string;
  body?: CheckoutRequestBody;
  headers: {
    origin?: string;
    [key: string]: string | undefined;
  };
}

interface CheckoutResponse {
  status: (code: number) => CheckoutResponse;
  json: (data: { error?: string; url?: string | null }) => void;
  send: (message: string) => void;
}

export default async function handler(req: CheckoutRequest, res: CheckoutResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  if (!process.env.PRICE_ID_PRO) return res.status(500).json({ error: 'Missing PRICE_ID_PRO' });

  try {
    // Fetch user to get or set stripe customer id
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user) throw new Error(userErr?.message || 'User not found');

    const user = userData.user;
    const email = (user.email as string) || undefined;
    let customerId = (user.app_metadata as AppMetadata)?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: user.id } });
      customerId = customer.id;
      // Store in app_metadata (requires service role)
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        app_metadata: {
          ...(user.app_metadata || {}),
          stripe_customer_id: customerId,
        },
      });
    }

	    const origin = req.headers.origin || process.env.PUBLIC_APP_URL || 'http://localhost:5173';
	
	    const session = await stripe.checkout.sessions.create({
	      mode: 'subscription',
	      customer: customerId,
	      client_reference_id: user.id,
	      subscription_data: { metadata: { supabase_user_id: user.id } },
	      line_items: [{ price: process.env.PRICE_ID_PRO as string, quantity: 1 }],
	      // After successful checkout, send users straight into the Premium Hub
	      success_url: `${origin}/app?checkout=success`,
	      // If they cancel, send them back to the pricing page
	      cancel_url: `${origin}/pricing?checkout=cancelled`,
	      allow_promotion_codes: true,
	    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('create-checkout-session error', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
}

