import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '../components/animations';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

const mockChecklist: ChecklistCategory[] = [
  {
    id: 'pro',
    title: 'Performance Rights (PRO)',
    description: 'Register with a PRO to collect performance royalties',
    items: [
      { id: '1', title: 'Join a PRO (BMI, ASCAP, or SESAC)', description: 'Register as a songwriter to collect performance royalties', completed: true },
      { id: '2', title: 'Register all songs with your PRO', description: 'Submit song metadata and ownership information', completed: true },
      { id: '3', title: 'Set up direct deposit', description: 'Ensure payments go directly to your bank', completed: false },
    ],
  },
  {
    id: 'mechanical',
    title: 'Mechanical Royalties (MLC)',
    description: 'Collect mechanical royalties from streaming services',
    items: [
      { id: '4', title: 'Register with The MLC', description: 'The Mechanical Licensing Collective handles US mechanical royalties', link: 'https://themlc.com', completed: true },
      { id: '5', title: 'Claim your songs', description: 'Match your songs in the MLC database', completed: false },
    ],
  },
  {
    id: 'neighboring',
    title: 'Neighboring Rights (SoundExchange)',
    description: 'Collect royalties for digital radio and streaming as a performer',
    items: [
      { id: '6', title: 'Register with SoundExchange', description: 'Required for US digital radio royalties', link: 'https://soundexchange.com', completed: false },
      { id: '7', title: 'Register your recordings', description: 'Submit ISRCs and recording information', completed: false },
    ],
  },
  {
    id: 'distribution',
    title: 'Distribution',
    description: 'Get your music on streaming platforms',
    items: [
      { id: '8', title: 'Choose a distributor', description: 'Select from DistroKid, TuneCore, CD Baby, etc.', completed: true },
      { id: '9', title: 'Upload your catalog', description: 'Distribute all your music to streaming platforms', completed: true },
    ],
  },
];

export default function Checklist() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('pro');
  const [items, setItems] = useState(mockChecklist);

  const toggleItem = (categoryId: string, itemId: string) => {
    setItems(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) }
        : cat
    ));
  };

  const totalItems = items.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = items.reduce((acc, cat) => acc + cat.items.filter(i => i.completed).length, 0);
  const progressPercent = Math.round((completedItems / totalItems) * 100);

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
        {items.map((category) => {
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
                    catCompleted === category.items.length ? 'bg-green-500/20' : 'bg-royal-600/20'
                  }`}>
                    {catCompleted === category.items.length ? (
                      <CheckCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
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
                          onClick={() => toggleItem(category.id, item.id)}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${item.completed ? 'text-white/50 line-through' : 'text-white'}`}>{item.title}</p>
                            <p className="text-sm text-white/40">{item.description}</p>
                          </div>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-royal-400 hover:text-royal-300">
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