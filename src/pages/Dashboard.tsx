import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Music, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '../components/animations';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Track {
  id: string;
  title: string;
  total_streams: number;
  total_earnings: number;
  monthly_earnings: number;
  created_at: string;
}

interface Earning {
  id: string;
  amount: number;
  source: string;
  payment_date: string;
  created_at: string;
  track_id: string;
  tracks?: { title: string };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshUser, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // After successful checkout, refresh user to get updated subscription status
  // Retry multiple times in case webhook is delayed
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryRefresh = async () => {
        attempts++;
        await refreshUser();
        
        // Check if we got a valid subscription status
        // If not and we haven't exhausted attempts, try again
        if (attempts < maxAttempts) {
          setTimeout(tryRefresh, 2000);
        } else {
          // Done trying - clear the query param
          setSearchParams({}, { replace: true });
        }
      };
      
      // Start after initial delay for webhook processing
      const timer = setTimeout(tryRefresh, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams, refreshUser]);

  // Fetch real data from Supabase
  useEffect(() => {
    if (!user || !supabase) return;
    
    const fetchData = async () => {
      if (!supabase) return; // Add null check here
      
      setLoading(true);
      try {
        // Fetch tracks
        const { data: tracksData } = await supabase
          .from('tracks')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        // Fetch earnings with track titles
        const { data: earningsData } = await supabase
          .from('earnings')
          .select('*, tracks(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setTracks(tracksData || []);
        setEarnings(earningsData || []);
        setNotifications(notificationsData || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalEarnings = tracks.reduce((sum, t) => sum + Number(t.total_earnings || 0), 0);
    const totalStreams = tracks.reduce((sum, t) => sum + Number(t.total_streams || 0), 0);
    const activeTrackCount = tracks.length;
    const uniqueSources = [...new Set(earnings.map(e => e.source))].length;

    // Format stream count
    const formatStreams = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
      return n.toString();
    };

    return [
      { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign },
      { label: 'Active Tracks', value: activeTrackCount.toString(), icon: Music },
      { label: 'Total Streams', value: formatStreams(totalStreams), icon: TrendingUp },
      { label: 'Royalty Sources', value: uniqueSources.toString(), icon: BarChart3 },
    ];
  }, [tracks, earnings]);

  // Calculate monthly earnings for chart (last 6 months)
  const monthlyEarnings = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth(),
      });
    }

    return last6Months.map(({ month, year, monthNum }) => {
      const monthEarnings = earnings
        .filter(e => {
          const eDate = new Date(e.payment_date || e.created_at);
          return eDate.getMonth() === monthNum && eDate.getFullYear() === year;
        })
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return { month, amount: monthEarnings };
    });
  }, [earnings]);

  const maxAmount = Math.max(...monthlyEarnings.map(e => e.amount), 1);

  // Format recent activity
  const recentActivity = useMemo(() => {
    const activity: { type: string; title: string; amount: string; time: string }[] = [];
    
    // Add recent earnings
    earnings.slice(0, 5).forEach(e => {
      const timeAgo = getTimeAgo(new Date(e.created_at));
      activity.push({
        type: 'earning',
        title: `${e.source} royalty payment`,
        amount: `+$${Number(e.amount).toFixed(2)}`,
        time: timeAgo,
      });
    });

    // Add recent notifications
    notifications.slice(0, 3).forEach(n => {
      activity.push({
        type: n.type === 'success' ? 'milestone' : 'track',
        title: n.title,
        amount: n.message.slice(0, 30),
        time: getTimeAgo(new Date(n.created_at)),
      });
    });

    // Sort by recency and take top 5
    return activity.slice(0, 5);
  }, [earnings, notifications]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-royal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <FadeInOnScroll>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/50">Track your earnings and royalty performance</p>
        </div>
      </FadeInOnScroll>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StaggerItem key={i}>
            <TiltCard>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-royal-600/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-royal-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <FadeInOnScroll delay={0.2} className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Earnings Overview</h2>
            <div className="flex items-end gap-4 h-48">
              {monthlyEarnings.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-white/60 mb-1">${item.amount.toFixed(0)}</div>
                  <motion.div
                    className="w-full bg-gradient-to-t from-royal-600 to-royal-400 rounded-t-lg min-h-[4px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((item.amount / maxAmount) * 100, 2)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                  <span className="text-xs text-white/50">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Recent Activity */}
        <FadeInOnScroll delay={0.3}>
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-white/50 text-sm">No recent activity. Add tracks and earnings to see updates here.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.type === 'earning' ? 'bg-green-400' :
                      item.type === 'track' ? 'bg-royal-400' : 'bg-gold-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.title}</p>
                      <p className="text-xs text-white/50">{item.time}</p>
                    </div>
                    <span className={`text-sm ${item.type === 'earning' ? 'text-green-400' : 'text-white/60'}`}>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}