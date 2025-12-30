import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Plus, MoreVertical, Play, DollarSign, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '../components/animations';

const mockTracks = [
  { id: 1, title: 'Midnight Dreams', streams: 45200, earnings: 127.50, status: 'complete', isrc: 'USRC12345678' },
  { id: 2, title: 'Summer Vibes', streams: 102300, earnings: 287.40, status: 'complete', isrc: 'USRC12345679' },
  { id: 3, title: 'Electric Soul', streams: 8900, earnings: 24.80, status: 'pending', isrc: 'USRC12345680' },
  { id: 4, title: 'Neon Nights', streams: 31500, earnings: 88.20, status: 'complete', isrc: 'USRC12345681' },
  { id: 5, title: 'Golden Hour', streams: 67800, earnings: 189.90, status: 'complete', isrc: 'USRC12345682' },
];

export default function Tracks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTracks = mockTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6">
      <FadeInOnScroll>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tracks</h1>
            <p className="text-white/50">Manage your songs and view performance</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Track
          </button>
        </div>
      </FadeInOnScroll>

      {/* Search */}
      <FadeInOnScroll delay={0.1}>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
          />
        </div>
      </FadeInOnScroll>

      {/* Tracks List */}
      <StaggerContainer className="space-y-3">
        {filteredTracks.map((track) => (
          <StaggerItem key={track.id}>
            <div className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-royal-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-royal-600/30 to-gold-500/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-royal-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">{track.title}</h3>
                  {track.status === 'complete' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-white/50">ISRC: {track.isrc}</p>
              </div>

              <div className="hidden sm:flex items-center gap-8">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white/60">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">{(track.streams / 1000).toFixed(1)}K</span>
                  </div>
                  <span className="text-xs text-white/40">streams</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{track.earnings.toFixed(2)}</span>
                  </div>
                  <span className="text-xs text-white/40">earnings</span>
                </div>
              </div>

              <button className="p-2 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Add Track Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Add New Track</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Track Title</label>
                <input type="text" placeholder="Enter track title" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">ISRC Code</label>
                <input type="text" placeholder="e.g., USRC12345678" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-3">Add Track</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}