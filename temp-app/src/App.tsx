import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, DollarSign, TrendingUp, Users, Crown,
  Plus, ChevronDown, ChevronUp, ExternalLink, Download,
  CheckCircle2, Circle, Calculator, Sparkles, BarChart3,
  Mic2, FileText, Settings, Home, ListMusic, Zap,
  Play, Award, Target, Disc3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Profile, Track, Split } from './types';
import { defaultProfile, defaultTracks, monthlyRevenueData, platformStats, registrationSteps, proOptions, distributorOptions } from './data';

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) => {
  const [count, setCount] = useState(value);
  useEffect(() => {
    if (value === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

// Brand Logo Component
const BrandLogo = () => (
  <div className="flex items-center gap-3">
    <img
      src="/rt1.png"
      alt="Royally Tuned"
      className="w-12 h-12 object-contain"
      onError={(e) => {
        // Fallback to crown SVG if logo.png doesn't exist
        (e.target as HTMLImageElement).src = '/crown.svg';
      }}
    />
  </div>
);

// Floating Orb Component
const FloatingOrb = ({ delay = 0, size = 'lg', color = 'dark red' }: { delay?: number; size?: string; color?: string }) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-96 h-96'
  };
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600/20 via-purple-600/10 to-transparent',
    magenta: 'from-purple-500/15 via-purple-400/5 to-transparent',
    blue: 'from-sky-400/10 via-sky-300/5 to-transparent',
    cream: 'from-amber-100/10 via-amber-50/5 to-transparent'
  };
  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} rounded-full bg-gradient-radial ${colorClasses[color]} blur-3xl pointer-events-none`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Equalizer Bars Animation
const EqualizerBars = () => (
  <div className="flex items-end gap-0.5 h-4">
    {[0.6, 1, 0.4, 0.8, 0.5].map((height, i) => (
      <motion.div
        key={i}
        className="w-1 bg-gradient-to-t from-purple-600 via-purple-500 to-sky-400 rounded-full"
        animate={{ height: [`${height * 100}%`, '100%', `${height * 60}%`] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
  </div>
);

// Color schemes for different elements - Royally Tuned Brand (Purple/Magenta/Blue)
const kpiColors = [
  { bg: 'from-red-600/20 to-red-600/10', icon: 'text-red-500', glow: 'shadow-red-600/20' },
  { bg: 'from-purple-500/20 to-purple-600/10', icon: 'text-purple-400', glow: 'shadow-purple-500/20' },
  { bg: 'from-sky-400/20 to-sky-500/10', icon: 'text-sky-400', glow: 'shadow-sky-400/20' },
  { bg: 'from-emerald-500/20 to-emerald-600/10', icon: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
];

const chartColors = ['#860202', '#e879f9', '#7dd3fc', '#22c55e', '#f5f0e6'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('royallytuned-profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('royallytuned-tracks');
    return saved ? JSON.parse(saved) : defaultTracks;
  });
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [streamCount, setStreamCount] = useState(100000);

  // Persist data
  useEffect(() => {
    localStorage.setItem('royallytuned-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('royallytuned-tracks', JSON.stringify(tracks));
  }, [tracks]);

  // Calculate totals
  const totalRevenue = tracks.reduce((sum, t) => sum + (t.revenue || 0), 0);
  const totalStreams = tracks.reduce((sum, t) => sum + (t.streams || 0), 0);
  const avgStreamRate = totalStreams > 0 ? (totalRevenue / totalStreams) * 1000 : 0;

  // Tab content
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tracks', label: 'Tracks', icon: ListMusic },
    { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
    { id: 'toolkit', label: 'Toolkit', icon: Calculator },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  // Add new track
  const addTrack = () => {
    const newTrack: Track = {
      id: crypto.randomUUID(),
      title: 'New Track',
      isrc: '', iswc: '', upc: '',
      releaseDate: '', creationYear: new Date().getFullYear(),
      copyrightNumber: '', completedSteps: [],
      splits: [{ id: '1', name: 'You', role: 'Writer', share: 100 }],
      streams: 0, revenue: 0
    };
    setTracks([newTrack, ...tracks]);
    setExpandedTrack(newTrack.id);
  };

  // Update track
  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Add split to track
  const addSplit = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    const newSplit: Split = {
      id: crypto.randomUUID(),
      name: '', role: 'Co-Writer', share: 0
    };
    updateTrack(trackId, { splits: [...track.splits, newSplit] });
  };

  // Update split
  const updateSplit = (trackId: string, splitId: string, updates: Partial<Split>) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    const updatedSplits = track.splits.map(s => 
      s.id === splitId ? { ...s, ...updates } : s
    );
    updateTrack(trackId, { splits: updatedSplits });
  };

  // Remove split
  const removeSplit = (trackId: string, splitId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    updateTrack(trackId, { splits: track.splits.filter(s => s.id !== splitId) });
  };

  // Toggle step completion
  const toggleStep = (trackId: string, stepId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    const completed = track.completedSteps.includes(stepId)
      ? track.completedSteps.filter(s => s !== stepId)
      : [...track.completedSteps, stepId];
    updateTrack(trackId, { completedSteps: completed });
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Title', 'ISRC', 'ISWC', 'Copyright', 'Streams', 'Revenue'];
    const rows = tracks.map(t => [t.title, t.isrc, t.iswc, t.copyrightNumber, t.streams, t.revenue]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'royallytuned-export.csv';
    a.click();
  };

  // Royalty calculation
  const calculateRoyalties = (streams: number) => ({
    master: streams * 0.0035,
    mechanical: streams * 0.0005,
    performance: streams * 0.0003,
    total: streams * 0.0043
  });

  const royalties = calculateRoyalties(streamCount);

  // Page transition
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Step colors - Purple/Magenta theme
  const stepColors = ['#c026d3', '#e879f9', '#7dd3fc', '#22c55e', '#f5f0e6', '#ef4444'];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none mesh-bg">
        <FloatingOrb delay={0} size="xl" color="purple" />
        <FloatingOrb delay={2} size="lg" color="magenta" />
        <FloatingOrb delay={4} size="md" color="blue" />
        <div className="absolute top-1/4 right-1/4">
          <FloatingOrb delay={1} size="lg" color="cream" />
        </div>
        <div className="absolute bottom-1/4 left-1/3">
          <FloatingOrb delay={3} size="md" color="purple" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <div>
              <h1 className="text-2xl font-bold tracking-tight brand-script neon-purple">
                <span className="text-purple-600">Royally</span>
                <span className="text-purple-400 ml-1">Tuned</span>
              </h1>
              <p className="text-xs text-gray-400">Music Rights Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <EqualizerBars />
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-sky-400 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-600/30"
              whileHover={{ scale: 1.05 }}
            >
              {profile.artistName?.[0]?.toUpperCase() || 'R'}
            </motion.div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="glass-card rounded-2xl p-2 mb-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-sky-400 text-white shadow-lg shadow-purple-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Earnings', value: totalRevenue, prefix: '$', decimals: 2, icon: DollarSign },
                    { label: 'Active Tracks', value: tracks.length, icon: Music, decimals: 0 },
                    { label: 'Avg. Stream Rate', value: avgStreamRate, prefix: '$', suffix: '/1K', decimals: 2, icon: TrendingUp },
                    { label: 'Total Streams', value: totalStreams, suffix: '', icon: Users, decimals: 0 },
                  ].map((kpi, i) => (
                    <motion.div
                      key={i}
                      className="glass-card rounded-2xl p-5 relative overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpiColors[i].bg} rounded-bl-full opacity-50`} />
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${kpiColors[i].bg}`}>
                          <kpi.icon className={`w-5 h-5 ${kpiColors[i].icon}`} />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                      </div>
                      <p className="text-2xl lg:text-3xl font-bold text-white">
                        <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} />
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Revenue Trend
                      </h3>
                      <span className="text-xs text-gray-500">Last 6 months</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyRevenueData}>
                          <defs>
                            <linearGradient id="masterGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="mechGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                          <Tooltip
                            contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px' }}
                            labelStyle={{ color: '#a855f7' }}
                          />
                          <Area type="monotone" dataKey="master" stroke="#a855f7" strokeWidth={2} fill="url(#masterGrad)" />
                          <Area type="monotone" dataKey="mechanical" stroke="#ec4899" strokeWidth={2} fill="url(#mechGrad)" />
                          <Area type="monotone" dataKey="performance" stroke="#22c55e" strokeWidth={2} fill="url(#perfGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-4 justify-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-700" /><span className="text-xs text-gray-400">Master</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-900" /><span className="text-xs text-gray-400">Mechanical</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-400">Performance</span></div>
                    </div>
                  </div>

                  {/* Platform Breakdown */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Platforms
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={platformStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="revenue"
                          >
                            {platformStats.map((_, index) => (
                              <Cell key={index} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {platformStats.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[i] }} />
                            <span className="text-gray-400">{p.platform}</span>
                          </div>
                          <span className="text-white font-medium">${p.revenue.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Tracks */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Disc3 className="w-5 h-5 text-purple-400" />
                      Recent Tracks
                    </h3>
                    <button
                      onClick={() => setActiveTab('tracks')}
                      className="text-sm text-purple-500 hover:text-purple-400 transition-colors"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tracks.slice(0, 3).map((track, i) => (
                      <motion.div
                        key={track.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-purple-600/10 hover:border-purple-600/30 transition-all group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${['from-purple-600 to-purple-400', 'from-purple-700 to-purple-500', 'from-emerald-500 to-cyan-500'][i % 3]} flex items-center justify-center shadow-lg`}>
                            <Play className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">{track.title}</h4>
                            <p className="text-xs text-gray-500">{track.isrc || 'No ISRC'} • {track.genre || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-400">${(track.revenue || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{(track.streams || 0).toLocaleString()} streams</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tracks */}
            {activeTab === 'tracks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Music className="w-7 h-7 text-purple-500" />
                    Track Manager
                  </h2>
                  <motion.button
                    onClick={addTrack}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-400 rounded-xl font-medium shadow-lg shadow-purple-600/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Track
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {tracks.map((track, i) => (
                    <motion.div
                      key={track.id}
                      className="glass-card rounded-2xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {/* Track Header */}
                      <div
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${['from-purple-600 to-purple-400', 'from-purple-700 to-purple-500', 'from-emerald-500 to-cyan-500'][i % 3]} flex items-center justify-center shadow-lg`}>
                            <Mic2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-white">{track.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              {track.isrc && <span className="font-mono">{track.isrc}</span>}
                              {track.genre && <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">{track.genre}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="font-semibold text-emerald-400">${(track.revenue || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{(track.streams || 0).toLocaleString()} streams</p>
                          </div>
                          {expandedTrack === track.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedTrack === track.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-purple-600/10"
                          >
                            <div className="p-6 space-y-6">
                              {/* Track Details */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-2">Title</label>
                                  <input
                                    type="text"
                                    value={track.title}
                                    onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                                    className="w-full bg-black/50 border border-purple-600/20 rounded-lg px-3 py-2 text-sm focus:border-purple-600 focus:outline-none transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-2">ISRC</label>
                                  <input
                                    type="text"
                                    value={track.isrc}
                                    onChange={(e) => updateTrack(track.id, { isrc: e.target.value })}
                                    placeholder="USRC11234567"
                                    className="w-full bg-black/50 border border-pink-500/20 rounded-lg px-3 py-2 text-sm font-mono focus:border-pink-500 focus:outline-none transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-2">ISWC</label>
                                  <input
                                    type="text"
                                    value={track.iswc}
                                    onChange={(e) => updateTrack(track.id, { iswc: e.target.value })}
                                    placeholder="T-012.345.678-C"
                                    className="w-full bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm font-mono focus:border-amber-500 focus:outline-none transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-2">Copyright #</label>
                                  <input
                                    type="text"
                                    value={track.copyrightNumber}
                                    onChange={(e) => updateTrack(track.id, { copyrightNumber: e.target.value })}
                                    placeholder="SR 1-234-567"
                                    className="w-full bg-black/50 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                                  />
                                </div>
                              </div>

                              {/* Splits */}
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium text-gray-300 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    Splits
                                  </h4>
                                  <button
                                    onClick={() => addSplit(track.id)}
                                    className="text-sm text-purple-400 hover:text-pink-300 flex items-center gap-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Split
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {track.splits.map((split, si) => (
                                    <div key={split.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-purple-600/10">
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${chartColors[si % chartColors.length]}30`, color: chartColors[si % chartColors.length] }}>
                                        {split.name?.[0]?.toUpperCase() || '?'}
                                      </div>
                                      <input
                                        type="text"
                                        value={split.name}
                                        onChange={(e) => updateSplit(track.id, split.id, { name: e.target.value })}
                                        placeholder="Name"
                                        className="flex-1 bg-transparent border-none text-sm focus:outline-none text-white"
                                      />
                                      <select
                                        value={split.role}
                                        onChange={(e) => updateSplit(track.id, split.id, { role: e.target.value as Split['role'] })}
                                        className="bg-black/50 border border-purple-600/20 rounded-lg px-2 py-1 text-xs focus:outline-none"
                                      >
                                        <option value="Writer">Writer</option>
                                        <option value="Producer">Producer</option>
                                        <option value="Publisher">Publisher</option>
                                        <option value="Co-Writer">Co-Writer</option>
                                        <option value="Performer">Performer</option>
                                      </select>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          value={split.share}
                                          onChange={(e) => updateSplit(track.id, split.id, { share: Number(e.target.value) })}
                                          className="w-16 bg-black/50 border border-purple-600/20 rounded-lg px-2 py-1 text-sm text-center focus:outline-none"
                                          min="0"
                                          max="100"
                                        />
                                        <span className="text-gray-500">%</span>
                                      </div>
                                      {track.splits.length > 1 && (
                                        <button
                                          onClick={() => removeSplit(track.id, split.id)}
                                          className="text-gray-500 hover:text-red-400 transition-colors text-lg"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Total</span>
                                  <span className={`font-bold ${track.splits.reduce((s, sp) => s + sp.share, 0) === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {track.splits.reduce((s, sp) => s + sp.share, 0)}%
                                  </span>
                                </div>
                              </div>

                              {/* Registration Checklist */}
                              <div>
                                <h4 className="font-medium text-gray-300 mb-4 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-400" />
                                  Registration Status
                                </h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                  {registrationSteps.slice(0, 4).map((step) => (
                                    <button
                                      key={step.id}
                                      onClick={() => toggleStep(track.id, step.id)}
                                      className={`p-3 rounded-xl border transition-all text-left ${
                                        track.completedSteps.includes(step.id)
                                          ? 'border-emerald-500/40 bg-emerald-500/10'
                                          : 'bg-black/30 border-purple-600/10 hover:border-purple-600/30'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        {track.completedSteps.includes(step.id) ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-500" />
                                        )}
                                        <span className="text-xs font-medium">{step.title}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Target className="w-7 h-7 text-purple-400" />
                  Registration Hub
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {registrationSteps.map((step, i) => (
                    <motion.a
                      key={step.id}
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card rounded-2xl p-5 group hover:border-purple-600/40 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${stepColors[i % stepColors.length]}20` }}>
                          <Zap className="w-6 h-6" style={{ color: stepColors[i % stepColors.length] }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{step.title}</h3>
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-500 transition-colors" />
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                          <p className="text-xs" style={{ color: stepColors[i % stepColors.length] }}>💡 {step.tip}</p>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}

            {/* Toolkit */}
            {activeTab === 'toolkit' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Award className="w-7 h-7 text-amber-400" />
                  Royalty Toolkit
                </h2>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Stream Calculator
                  </h3>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400">Streams</span>
                      <span className="text-2xl font-bold gradient-text">{streamCount.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="1000"
                      value={streamCount}
                      onChange={(e) => setStreamCount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0</span>
                      <span>1M</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Master Royalty', value: royalties.master, desc: 'From recordings', color: 'fuchsia' },
                      { label: 'Mechanical', value: royalties.mechanical, desc: 'Composition rights', color: 'pink' },
                      { label: 'Performance', value: royalties.performance, desc: 'PRO payments', color: 'emerald' },
                      { label: 'Total Estimate', value: royalties.total, desc: 'Combined earnings', color: 'amber' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className={`p-4 rounded-xl bg-black/40 border border-${item.color}-500/20`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className={`text-xl font-bold text-${item.color}-400`}>${item.value.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      onClick={exportCSV}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-purple-400/20 text-purple-400 hover:from-purple-600/30 hover:to-purple-400/30 transition-colors border border-purple-600/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Settings className="w-7 h-7 text-purple-500" />
                  Profile Settings
                </h2>

                <div className="glass-card rounded-2xl p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Legal Name</label>
                      <input
                        type="text"
                        value={profile.legalName}
                        onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
                        className="w-full bg-black/50 border border-purple-600/20 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors"
                        placeholder="Your legal name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Artist Name</label>
                      <input
                        type="text"
                        value={profile.artistName}
                        onChange={(e) => setProfile({ ...profile, artistName: e.target.value })}
                        className="w-full bg-black/50 border border-pink-500/20 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none transition-colors"
                        placeholder="Your stage name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">IPI Number</label>
                      <input
                        type="text"
                        value={profile.ipiNumber}
                        onChange={(e) => setProfile({ ...profile, ipiNumber: e.target.value })}
                        className="w-full bg-black/50 border border-emerald-500/20 rounded-xl px-4 py-3 font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="00123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">PRO Affiliation</label>
                      <select
                        value={profile.pro}
                        onChange={(e) => setProfile({ ...profile, pro: e.target.value })}
                        className="w-full bg-black/50 border border-purple-600/20 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors"
                      >
                        {proOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Distributor</label>
                      <select
                        value={profile.distributor}
                        onChange={(e) => setProfile({ ...profile, distributor: e.target.value })}
                        className="w-full bg-black/50 border border-pink-500/20 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none transition-colors"
                      >
                        {distributorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-purple-600/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-12 h-6 rounded-full transition-colors ${profile.isSelfPublished ? 'bg-gradient-to-r from-purple-600 to-purple-400' : 'bg-gray-700'}`}>
                        <motion.div
                          className="w-6 h-6 rounded-full bg-white shadow-lg"
                          animate={{ x: profile.isSelfPublished ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                      <span className="text-gray-300">Self-Published</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-purple-600/10 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="gradient-text font-medium">Royally Tuned</span>
            <span className="text-gray-500">— Own Your Rights</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
