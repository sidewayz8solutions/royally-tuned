import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

async function updateUser(userId: string, fields: Record<string, unknown>) {
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { ...(fields || {}) },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string | undefined;
  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      // Read raw body
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const rawBody = Buffer.concat(chunks);
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // Fallback (dev) without signature verification
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.client_reference_id as string) || (session.metadata?.supabase_user_id as string);
        const customerId = (session.customer as string) || undefined;
        if (userId) {
          // Set subscription_status to 'active' on checkout completion as a fallback
          // This ensures users get access even if subscription events are delayed
          await updateUser(userId, {
            stripe_customer_id: customerId,
            subscription_status: 'active',
          });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        // Try to get userId from subscription metadata, or look it up from customer
        let userId = (sub.metadata?.supabase_user_id as string) || undefined;
        
        // If no userId in subscription metadata, try to find user by customer ID
        if (!userId && customerId) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const matchingUser = users?.users?.find(
            u => (u.app_metadata as Record<string, unknown>)?.stripe_customer_id === customerId
          );
          if (matchingUser) {
            userId = matchingUser.id;
          }
        }
        
        const status = sub.status; // 'active' | 'trialing' | 'canceled' | ...
        if (userId) {
          await updateUser(userId, {
            stripe_customer_id: customerId,
            subscription_status: status,
          });
        }
        break;
      }
      default:
        // Ignore other events
        break;
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handler error', e);
    res.status(500).send('Server error');
  }
}

