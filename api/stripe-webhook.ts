import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';

// Disable Vercel's automatic body parsing - required for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

// Map Stripe subscription status to our DB enum values
// DB ENUM: 'free', 'pro', 'enterprise', 'cancelled', 'past_due'
function mapStripeStatusToDbStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'pro';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'cancelled';
    case 'past_due':
    case 'incomplete':
      return 'past_due';
    default:
      return 'pro'; // Default to pro for any active-like status
  }
}

async function updateUser(userId: string, fields: Record<string, unknown>) {
  // Update auth.users app_metadata (can store any string)
  // Preserve existing app_metadata instead of overwriting it entirely.
  let userEmail: string | null = null;
  try {
    const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !existingUser?.user) {
      console.error('stripe-webhook: failed to fetch user before updateUser', userError);
    } else {
      userEmail = existingUser.user.email || null;
      const currentMeta = (existingUser.user.app_metadata || {}) as Record<string, unknown>;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { ...currentMeta, ...(fields || {}) },
      });
    }
  } catch (e) {
    console.error('stripe-webhook: error updating auth app_metadata', e);
  }

  // Also update profiles table - must use valid ENUM value
  // Include email since it's a NOT NULL field required for upsert
  const profileFields: Record<string, unknown> = { id: userId };
  if (userEmail) profileFields.email = userEmail;
  if (fields.stripe_customer_id) profileFields.stripe_customer_id = fields.stripe_customer_id;
  if (fields.subscription_status) {
    // Map to valid DB enum value
    profileFields.subscription_status = mapStripeStatusToDbStatus(fields.subscription_status as string);
  }

  // Only upsert if we have the required email field
  if (profileFields.email && Object.keys(profileFields).length > 2) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileFields, { onConflict: 'id' });
    if (error) {
      console.error('Failed to upsert profiles table:', error);
    } else {
      console.log('stripe-webhook: successfully upserted profile for user', userId);
    }
  } else if (!profileFields.email) {
    console.warn('stripe-webhook: skipping profile upsert - no email available for user', userId);
  }
}

// Helper to read raw body from request stream
async function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string | undefined;
  let event: Stripe.Event;

  try {
    // Read raw body for signature verification
    const rawBody = await getRawBody(req);

    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // Fallback (dev) without signature verification - parse the raw body as JSON
      console.warn('stripe-webhook: No webhook secret configured, skipping signature verification');
      event = JSON.parse(rawBody.toString());
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

