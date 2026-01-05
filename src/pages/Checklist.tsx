import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronDown, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '../components/animations';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  external_link: string | null;
  completed: boolean;
  category: string;
  sort_order: number;
}

interface ChecklistCategory {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

// Default checklist template for new users
const defaultCategories: Omit<ChecklistCategory, 'items'>[] = [
  { id: 'registration', title: 'Performance Rights (PRO)', description: 'Register with a PRO to collect performance royalties' },
  { id: 'setup', title: 'Mechanical Royalties (MLC)', description: 'Collect mechanical royalties from streaming services' },
  { id: 'verification', title: 'Neighboring Rights (SoundExchange)', description: 'Collect royalties for digital radio and streaming as a performer' },
  { id: 'distribution', title: 'Distribution', description: 'Get your music on streaming platforms' },
];

const defaultItems: Omit<ChecklistItem, 'id'>[] = [
  { title: 'Join a PRO (BMI, ASCAP, or SESAC)', description: 'Register as a songwriter to collect performance royalties', category: 'registration', completed: false, external_link: null, sort_order: 1 },
  { title: 'Register all songs with your PRO', description: 'Submit song metadata and ownership information', category: 'registration', completed: false, external_link: null, sort_order: 2 },
  { title: 'Set up direct deposit with PRO', description: 'Ensure payments go directly to your bank', category: 'registration', completed: false, external_link: null, sort_order: 3 },
  { title: 'Register with The MLC', description: 'The Mechanical Licensing Collective handles US mechanical royalties', category: 'setup', completed: false, external_link: 'https://themlc.com', sort_order: 1 },
  { title: 'Claim your songs in MLC database', description: 'Match your songs to collect mechanical royalties', category: 'setup', completed: false, external_link: null, sort_order: 2 },
  { title: 'Register with SoundExchange', description: 'Required for US digital radio royalties', category: 'verification', completed: false, external_link: 'https://soundexchange.com', sort_order: 1 },
  { title: 'Register your recordings with SoundExchange', description: 'Submit ISRCs and recording information', category: 'verification', completed: false, external_link: null, sort_order: 2 },
  // Legal / Sync forms
  { title: 'Create TV Music Rights License', description: 'Prepare a TV music rights license to clear sync/TV uses', category: 'verification', completed: false, external_link: '/app/forms/tv-music-rights-license', sort_order: 3 },
  { title: 'Prepare Co-Production Agreement', description: 'Create and save a co-production agreement for collaborations', category: 'verification', completed: false, external_link: '/app/forms/co-production-agreement', sort_order: 4 },
  { title: 'Choose a distributor', description: 'Select from DistroKid, TuneCore, CD Baby, etc.', category: 'distribution', completed: false, external_link: null, sort_order: 1 },
  { title: 'Upload your catalog', description: 'Distribute all your music to streaming platforms', category: 'distribution', completed: false, external_link: null, sort_order: 2 },
];

export default function Checklist() {
  const { user } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('registration');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseMissing = !supabase;

  // Fetch checklist items from Supabase with timeout protection
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchChecklist = async () => {
      setLoading(true);
      try {
        const client = supabase!;
        console.debug('[Checklist] fetching items for user', user.id);
        const { data, error } = await client
          .from('checklist_items')
          .select('*')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true });

        if (!isMounted) return;

        if (error) {
          console.warn('[Checklist] fetch error:', error);
          // Fall back to local defaults on error
          const localItems = defaultItems.map((item, i) => ({
            ...item,
            id: `local-${i}`,
          }));
          setItems(localItems as ChecklistItem[]);
        } else if (data && data.length > 0) {
          setItems(data);
          console.debug('[Checklist] loaded existing items:', data.length);
        } else {
          // No items - try to create defaults or use local fallback
          try {
            const newItems = defaultItems.map(item => ({
              ...item,
              user_id: user.id,
            }));

            const { data: inserted, error: insertError } = await client
              .from('checklist_items')
              .insert(newItems)
              .select();

            if (!isMounted) return;

            if (insertError) {
              console.warn('[Checklist] insert error, using local fallback:', insertError);
              const localItems = defaultItems.map((item, i) => ({
                ...item,
                id: `local-${i}`,
              }));
              setItems(localItems as ChecklistItem[]);
            } else if (inserted) {
              setItems(inserted);
              console.debug('[Checklist] seeded default items:', inserted.length);
            }
          } catch (insertErr) {
            console.warn('[Checklist] insert failed, using local fallback:', insertErr);
            const localItems = defaultItems.map((item, i) => ({
              ...item,
              id: `local-${i}`,
            }));
            setItems(localItems as ChecklistItem[]);
          }
        }
      } catch (err) {
        console.error('[Checklist] fetch failed:', err);
        if (isMounted) {
          // Fallback to local defaults
          const localItems = defaultItems.map((item, i) => ({
            ...item,
            id: `local-${i}`,
          }));
          setItems(localItems as ChecklistItem[]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[Checklist] fetch timeout - using local defaults');
        const localItems = defaultItems.map((item, i) => ({
          ...item,
          id: `local-${i}`,
        }));
        setItems(localItems as ChecklistItem[]);
        setLoading(false);
      }
    }, 10000);

    fetchChecklist().finally(() => clearTimeout(timeoutId));

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user]);

  // Toggle item completion
  const toggleItem = async (itemId: string) => {
    if (!supabase) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;
    
    // Optimistic update
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null } : i
    ));

    // Update in database
    await supabase
      .from('checklist_items')
      .update({ 
        completed: newCompleted, 
        completed_at: newCompleted ? new Date().toISOString() : null 
      })
      .eq('id', itemId);
  };

  // Group items by category
  const categories: ChecklistCategory[] = defaultCategories.map(cat => ({
    ...cat,
    items: (items || []).filter(item => item.category === cat.id),
  }));

  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (supabaseMissing) {
    return (
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-center min-h-[400px] text-white/70">
        Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing). Add env vars and redeploy.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-royal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      <FadeInOnScroll>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Registration Checklist</h1>
          <p className="text-white/50">Complete these steps to capture all your royalties</p>
        </div>
      </FadeInOnScroll>

      {/* Progress Bar */}
      <FadeInOnScroll delay={0.1}>
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Overall Progress</span>
            <span className="text-gold-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-royal-600 to-gold-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-white/50 mt-2">{completedItems} of {totalItems} tasks completed</p>
        </div>
      </FadeInOnScroll>

      {/* Checklist Categories */}
      <StaggerContainer className="space-y-4">
        {categories.map((category) => {
          const catCompleted = category.items.filter(i => i.completed).length;
          const isExpanded = expandedCategory === category.id;

          return (
            <StaggerItem key={category.id}>
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full p-6 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    catCompleted === category.items.length && category.items.length > 0 ? 'bg-green-500/20' : 'bg-yellow-400/20'
                  }`}>
                    {catCompleted === category.items.length && category.items.length > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{category.title}</h3>
                    <p className="text-sm text-white/50">{catCompleted}/{category.items.length} completed</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-4 space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => toggleItem(item.id)}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${item.completed ? 'text-white/50 line-through' : 'text-white'}`}>{item.title}</p>
                            <p className="text-sm text-white/40">{item.description}</p>
                          </div>
                          {item.external_link && (
                            <a href={item.external_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-royal-400 hover:text-royal-300">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}