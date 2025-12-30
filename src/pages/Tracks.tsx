import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Plus, MoreVertical, Play, DollarSign, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '../components/animations';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Track {
  id: string;
  title: string;
  isrc: string | null;
  total_streams: number;
  total_earnings: number;
  registration_status: {
    pro?: string;
    sound_exchange?: string;
    mlc?: string;
    distributor?: string;
  };
}

export default function Tracks() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTrack, setNewTrack] = useState({ title: '', isrc: '' });
  const supabaseMissing = !supabase;

  // Fetch tracks from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const fetchTracks = async () => {
      setLoading(true);
      const client = supabase!;
      const { data, error } = await client
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setTracks(data);
      }
      setLoading(false);
    };

    fetchTracks();
  }, [user]);

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if all registrations are complete
  const isComplete = (status: Track['registration_status']) => {
    if (!status) return false;
    return Object.values(status).every(v => v === 'verified' || v === 'submitted');
  };

  // Handle add track
  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase || !newTrack.title.trim()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from('tracks')
      .insert({
        user_id: user.id,
        title: newTrack.title.trim(),
        isrc: newTrack.isrc.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setTracks(prev => [data, ...prev]);
      setNewTrack({ title: '', isrc: '' });
      setShowAddModal(false);
    }
    setSaving(false);
  };

  if (supabaseMissing) {
    return (
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[400px] text-white/70">
        Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing). Add env vars and redeploy.
      </div>
    );
  }

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

      {/* Empty State */}
      {filteredTracks.length === 0 && !loading && (
        <div className="text-center py-16">
          <Music className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
          <p className="text-white/50 mb-6">Add your first track to start tracking royalties</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your First Track
          </button>
        </div>
      )}

      {/* Tracks List */}
      <StaggerContainer className="space-y-3">
        {filteredTracks.map((track) => (
          <StaggerItem key={track.id}>
            <div className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-royal-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-royal-600/30 to-gold-500/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-royal-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">{track.title}</h3>
                  {isComplete(track.registration_status) ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-white/50">{track.isrc ? `ISRC: ${track.isrc}` : 'No ISRC'}</p>
              </div>

              <div className="hidden sm:flex items-center gap-8">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white/60">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">
                      {track.total_streams >= 1000 
                        ? `${(track.total_streams / 1000).toFixed(1)}K` 
                        : track.total_streams}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">streams</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{Number(track.total_earnings || 0).toFixed(2)}</span>
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
            <form onSubmit={handleAddTrack} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Track Title</label>
                <input 
                  type="text" 
                  value={newTrack.title}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter track title" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">ISRC Code (optional)</label>
                <input 
                  type="text" 
                  value={newTrack.isrc}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, isrc: e.target.value }))}
                  placeholder="e.g., USRC12345678" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Add Track
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}