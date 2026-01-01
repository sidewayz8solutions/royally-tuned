import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';

// Check for required environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
  : null;

// Map Stripe subscription status to our DB enum values
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
      return 'pro';
  }
}

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Supabase not configured'
    });
  }

  if (!stripe) {
    console.error('Missing Stripe environment variables');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Stripe not configured'
    });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user from Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      console.error('User lookup failed:', userError);
      return res.status(404).json({ error: 'User not found', details: userError?.message });
    }

    const user = userData.user;
    const email = user.email;

    // Check if user has a Stripe customer ID in app_metadata
    const appMeta = (user.app_metadata || {}) as Record<string, unknown>;
    let stripeCustomerId = appMeta.stripe_customer_id as string | undefined;

    // If no customer ID in metadata, search Stripe by email
    if (!stripeCustomerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      }
    }

    if (!stripeCustomerId) {
      // No Stripe customer found - ensure profile exists with free status
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({ id: userId, email: email || '', subscription_status: 'free' }, { onConflict: 'id' });
      
      if (upsertError) {
        console.error('Failed to upsert profile:', upsertError);
      }
      
      return res.status(200).json({ 
        status: 'free', 
        message: 'No Stripe subscription found',
        profileCreated: !upsertError
      });
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1,
    });

    let subscriptionStatus = 'free';
    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      subscriptionStatus = mapStripeStatusToDbStatus(sub.status);
    }

    // Update user's app_metadata
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { 
        ...appMeta, 
        stripe_customer_id: stripeCustomerId,
        subscription_status: subscriptionStatus 
      },
    });

    // Upsert profile with subscription status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        email: email || '',
        stripe_customer_id: stripeCustomerId,
        subscription_status: subscriptionStatus 
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Failed to upsert profile:', profileError);
    }

    return res.status(200).json({ 
      status: subscriptionStatus,
      stripeCustomerId,
      profileUpdated: !profileError
    });

  } catch (error) {
    console.error('verify-subscription error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

