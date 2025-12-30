import { motion } from 'framer-motion';
import { DollarSign, Music, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '../components/animations';

const mockStats = [
  { label: 'Total Earnings', value: '$2,847.32', change: '+12.5%', up: true, icon: DollarSign },
  { label: 'Active Tracks', value: '24', change: '+3', up: true, icon: Music },
  { label: 'Monthly Streams', value: '156.2K', change: '+8.2%', up: true, icon: TrendingUp },
  { label: 'Royalty Sources', value: '5', change: '', up: true, icon: BarChart3 },
];

const mockEarnings = [
  { month: 'Jul', amount: 320 },
  { month: 'Aug', amount: 450 },
  { month: 'Sep', amount: 380 },
  { month: 'Oct', amount: 520 },
  { month: 'Nov', amount: 610 },
  { month: 'Dec', amount: 567 },
];

const mockActivity = [
  { type: 'earning', title: 'Performance royalty payment', amount: '+$124.50', time: '2 hours ago' },
  { type: 'track', title: 'New track registered', amount: 'Midnight Dreams', time: '1 day ago' },
  { type: 'earning', title: 'Mechanical royalty payment', amount: '+$67.80', time: '3 days ago' },
  { type: 'milestone', title: '100K streams milestone', amount: 'Summer Vibes', time: '1 week ago' },
];

export default function Dashboard() {
  const maxAmount = Math.max(...mockEarnings.map(e => e.amount));

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
        {mockStats.map((stat, i) => (
          <StaggerItem key={i}>
            <TiltCard>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-royal-600/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-royal-400" />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  )}
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
              {mockEarnings.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    className="w-full bg-gradient-to-t from-royal-600 to-royal-400 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.amount / maxAmount) * 100}%` }}
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
            <div className="space-y-4">
              {mockActivity.map((item, i) => (
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
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
}