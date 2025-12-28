import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';

async function postJson(path: string, body: any) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Billing() {
  const { user, subscriptionStatus } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (!supabase) throw new Error('Auth not configured');
      const { data: session } = await supabase.auth.getSession();
      const { url } = await postJson('/api/create-checkout-session', {
        userId: user.id,
        accessToken: session.session?.access_token,
      });
      window.location.href = url;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (!supabase) throw new Error('Auth not configured');
      const { data: session } = await supabase.auth.getSession();
      const { url } = await postJson('/api/create-portal-session', {
        userId: user.id,
        accessToken: session.session?.access_token,
      });
      window.location.href = url;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  return (
    <div className="glass-card rounded-2xl p-6 max-w-2xl">
      {!hasSupabaseConfig() && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-purple-400" />
        Billing
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {isActive ? 'You have an active subscription.' : 'Upgrade to Pro to unlock AI parsing and advanced tools.'}
      </p>

      <div className="p-4 rounded-xl bg-black/40 border border-purple-700/20 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status</span>
          <span className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
            {subscriptionStatus ?? 'none'}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {!isActive ? (
          <button onClick={handleSubscribe} disabled={loading} className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Subscribe
          </button>
        ) : (
          <button onClick={handleManage} disabled={loading} className="px-4 py-3 rounded-xl border border-purple-700/20 hover:bg-white/5 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage Billing
          </button>
        )}
      </div>
    </div>
  );
}

