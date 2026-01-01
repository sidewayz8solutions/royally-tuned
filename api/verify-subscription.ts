import Stripe from 'stripe';
import { supabaseAdmin } from './_supabaseAdmin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-12-15.clover' });

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

  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user from Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      return res.status(404).json({ error: 'User not found' });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}

