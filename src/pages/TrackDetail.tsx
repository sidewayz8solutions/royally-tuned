import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Loader2, Music, Calendar, Hash,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import SyncChecklist from '../components/SyncChecklist';
import WriterPublisherInput from '../components/WriterPublisherInput';
import type {
  WriterDetailed, PublisherDetailed, SyncChecklist as SyncChecklistType,
  SyncFiles
} from '../types';
import { FadeInOnScroll } from '../components/animations';

const DEFAULT_SYNC_CHECKLIST: SyncChecklistType = {
  mp3_ready: false,
  master_wav_ready: false,
  acapella_wav_ready: false,
  instrumental_wav_ready: false,
  splits_sheet_ready: false,
  one_stop_ready: false,
};

const DEFAULT_SYNC_FILES: SyncFiles = {
  mp3_url: null,
  master_wav_url: null,
  acapella_wav_url: null,
  instrumental_wav_url: null,
  splits_sheet_url: null,
  one_stop_url: null,
};

interface TrackData {
  id: string;
  title: string;
  album: string | null;
  genre: string | null;
  release_date: string | null;
  isrc: string | null;
  iswc: string | null;
  writers_detailed: WriterDetailed[];
  publishers_detailed: PublisherDetailed[];
  sync_checklist: SyncChecklistType;
  sync_files: SyncFiles;
  is_one_stop: boolean;
  has_instrumental: boolean;
  is_clean_master: boolean;
  notes: string | null;
}

export default function TrackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [track, setTrack] = useState<TrackData | null>(null);

  // Fetch track data
  useEffect(() => {
    if (!id || !user || !supabase) {
      setLoading(false);
      return;
    }

    const fetchTrack = async () => {
      if (!supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        setError('Track not found');
        setTrack(null);
      } else {
        setTrack({
          ...data,
          writers_detailed: data.writers_detailed || [],
          publishers_detailed: data.publishers_detailed || [],
          sync_checklist: data.sync_checklist || DEFAULT_SYNC_CHECKLIST,
          sync_files: data.sync_files || DEFAULT_SYNC_FILES,
          is_one_stop: data.is_one_stop || false,
          has_instrumental: data.has_instrumental || false,
          is_clean_master: data.is_clean_master || false,
        });
      }
      setLoading(false);
    };

    fetchTrack();
  }, [id, user]);

  // Save track
  const handleSave = async () => {
    if (!track || !supabase) return;
    
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    const { error } = await supabase
      .from('tracks')
      .update({
        title: track.title,
        album: track.album,
        genre: track.genre,
        release_date: track.release_date,
        isrc: track.isrc,
        iswc: track.iswc,
        writers_detailed: track.writers_detailed,
        publishers_detailed: track.publishers_detailed,
        sync_checklist: track.sync_checklist,
        sync_files: track.sync_files,
        is_one_stop: track.is_one_stop,
        has_instrumental: track.has_instrumental,
        is_clean_master: track.is_clean_master,
        notes: track.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', track.id);

    if (error) {
      setError('Failed to save changes');
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  const updateField = <K extends keyof TrackData>(field: K, value: TrackData[K]) => {
    if (!track) return;
    setTrack({ ...track, [field]: value });
  };

  const handleSyncChecklistChange = (key: keyof SyncChecklistType, value: boolean) => {
    if (!track) return;
    setTrack({
      ...track,
      sync_checklist: { ...track.sync_checklist, [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-royal-500" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl text-white mb-2">{error || 'Track not found'}</h2>
        <button onClick={() => navigate('/app/tracks')} className="btn-secondary mt-4">
          Back to Tracks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-12">
      {/* Header */}
      <FadeInOnScroll>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/tracks')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Music className="w-6 h-6 text-royal-400" />
                {track.title}
              </h1>
              <p className="text-white/50 text-sm">Edit track details & sync metadata</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </FadeInOnScroll>

      <div className="space-y-8">
        {/* Basic Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Track Title</label>
              <input
                type="text"
                value={track.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Album</label>
              <input
                type="text"
                value={track.album || ''}
                onChange={(e) => updateField('album', e.target.value || null)}
                placeholder="Single or album name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Genre</label>
              <input
                type="text"
                value={track.genre || ''}
                onChange={(e) => updateField('genre', e.target.value || null)}
                placeholder="e.g., Hip-Hop, R&B, Pop"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Release Date
              </label>
              <input
                type="date"
                value={track.release_date || ''}
                onChange={(e) => updateField('release_date', e.target.value || null)}
                className="input-field"
              />
            </div>
          </div>
        </motion.section>

        {/* Industry Identifiers Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-royal-400" /> Industry Identifiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                ISRC <span className="text-white/40">(Recording Code)</span>
              </label>
              <input
                type="text"
                value={track.isrc || ''}
                onChange={(e) => updateField('isrc', e.target.value.toUpperCase() || null)}
                placeholder="e.g., USRC12345678"
                className="input-field font-mono"
                maxLength={12}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                ISWC <span className="text-white/40">(Work Code)</span>
              </label>
              <input
                type="text"
                value={track.iswc || ''}
                onChange={(e) => updateField('iswc', e.target.value.toUpperCase() || null)}
                placeholder="e.g., T-123456789-0"
                className="input-field font-mono"
              />
            </div>
          </div>
        </motion.section>

        {/* Writers & Publishers Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Writers & Publishers</h2>
          <WriterPublisherInput
            writers={track.writers_detailed}
            publishers={track.publishers_detailed}
            onWritersChange={(w) => updateField('writers_detailed', w)}
            onPublishersChange={(p) => updateField('publishers_detailed', p)}
          />
        </motion.section>

        {/* Sync Checklist Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <SyncChecklist
            checklist={track.sync_checklist}
            files={track.sync_files}
            onChange={handleSyncChecklistChange}
          />
        </motion.section>

        {/* Notes Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          <textarea
            value={track.notes || ''}
            onChange={(e) => updateField('notes', e.target.value || null)}
            placeholder="Add any additional notes about this track..."
            className="input-field min-h-[100px] resize-y"
            rows={4}
          />
        </motion.section>
      </div>
    </div>
  );
}
