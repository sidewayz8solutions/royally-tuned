import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

async function updateUser(userId: string, fields: Record<string, unknown>) {
  // Update auth.users app_metadata
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { ...(fields || {}) },
  });
  
  // Also update profiles table for immediate access
  const profileFields: Record<string, unknown> = {};
  if (fields.stripe_customer_id) profileFields.stripe_customer_id = fields.stripe_customer_id;
  if (fields.subscription_status) profileFields.subscription_status = fields.subscription_status;
  
  if (Object.keys(profileFields).length > 0) {
    await supabaseAdmin
      .from('profiles')
      .update(profileFields)
      .eq('id', userId);
  }
}

export default async function handler(req: any, res: any) {
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
    return res.status(400).send(`Webhook Error: ${(err as any).message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.client_reference_id as string) || (session.metadata?.supabase_user_id as string);
        const customerId = (session.customer as string) || undefined;
        if (userId) {
          // Set subscription_status to 'active' immediately on checkout completion
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
        const userId = (sub.metadata?.supabase_user_id as string) || undefined;
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

