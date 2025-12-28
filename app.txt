import React, { useState, useEffect, useMemo } from 'react';
import { 
  Music, 
  ShieldCheck, 
  Globe, 
  Radio, 
  Settings, 
  FileText, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  Save,
  Copy,
  Plus,
  Trash2,
  Info,
  ChevronRight,
  ChevronDown,
  DollarSign,
  PieChart,
  Download,
  Users,
  Calculator
} from 'lucide-react';

const App = () => {
  // --- State Initialization with Persistence ---
  const [activeTab, setActiveTab] = useState('profile');
  
  // Load initial state from localStorage or use defaults
  const loadState = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [profile, setProfile] = useState(() => loadState('rights_sync_profile', {
    legalName: '',
    artistName: '',
    ipiNumber: '',
    pro: 'ASCAP',
    email: '',
    publisherName: '',
    isSelfPublished: true,
    distributor: 'DistroKid' 
  }));

  const [tracks, setTracks] = useState(() => loadState('rights_sync_tracks', [
    {
      id: crypto.randomUUID(),
      title: 'Demo Track 1',
      isrc: '',
      iswc: '',
      upc: '',
      releaseDate: '',
      creationYear: new Date().getFullYear(),
      copyrightNumber: '',
      completedSteps: [],
      splits: [{ id: 1, name: 'Myself', role: 'Writer', share: 100 }]
    }
  ]));

  const [selectedTrackId, setSelectedTrackId] = useState(null);
  
  // Calculator State
  const [streamCount, setStreamCount] = useState(100000);

  // --- Effects for Persistence ---
  useEffect(() => {
    localStorage.setItem('rights_sync_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('rights_sync_tracks', JSON.stringify(tracks));
  }, [tracks]);

  // --- Helpers ---
  const activeTrack = useMemo(() => 
    tracks.find(t => t.id === selectedTrackId) || tracks[0], 
  [tracks, selectedTrackId]);

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addTrack = () => {
    const newTrack = {
      id: crypto.randomUUID(),
      title: 'New Track',
      isrc: '',
      iswc: '',
      upc: '',
      releaseDate: '',
      creationYear: new Date().getFullYear(),
      copyrightNumber: '',
      completedSteps: [],
      splits: [{ id: Date.now(), name: profile.artistName || 'Me', role: 'Writer', share: 100 }]
    };
    setTracks([...tracks, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  const deleteTrack = (id) => {
    if (confirm('Are you sure you want to delete this track?')) {
       setTracks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTrack = (id, field, value) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...prev.find(x => x.id === id), [field]: value } : t));
  };

  const updateSplit = (trackId, splitId, field, value) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const newSplits = t.splits.map(s => s.id === splitId ? { ...s, [field]: value } : s);
      return { ...t, splits: newSplits };
    }));
  };

  const addSplit = (trackId) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      return { ...t, splits: [...t.splits, { id: Date.now(), name: 'Collaborator', role: 'Co-Writer', share: 0 }] };
    }));
  };

  const removeSplit = (trackId, splitId) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      return { ...t, splits: t.splits.filter(s => s.id !== splitId) };
    }));
  };

  const toggleStep = (trackId, stepId) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        const steps = t.completedSteps.includes(stepId)
          ? t.completedSteps.filter(s => s !== stepId)
          : [...t.completedSteps, stepId];
        return { ...t, completedSteps: steps };
      }
      return t;
    }));
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const exportCSV = () => {
    const headers = ['Title', 'ISRC', 'ISWC', 'UPC', 'Release Date', 'Copyright #', 'Splits'];
    const rows = tracks.map(t => [
      t.title,
      t.isrc,
      t.iswc,
      t.upc,
      t.releaseDate,
      t.copyrightNumber,
      t.splits.map(s => `${s.name} (${s.share}%)`).join(' | ')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_music_catalog.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Smart Data Packet Generator ---
  const generatePacket = (stepId, track) => {
    let header = `--- ${track.title} ---\n`;
    let body = "";
    const splitInfo = track.splits.map(s => `${s.name}: ${s.share}% (${s.role})`).join('\n');

    switch(stepId) {
      case 'copyright':
        body = `
FORM: US Copyright Office (eCO) - Sound Recording
TITLE: ${track.title}
AUTHORS/SPLITS:
${splitInfo}
YEAR OF CREATION: ${track.creationYear}
DATE OF PUBLICATION: ${track.releaseDate || 'Unpublished'}
ISRC: ${track.isrc}
        `;
        break;
      case 'distro':
        body = `
PLATFORM: ${profile.distributor}
TRACK TITLE: ${track.title}
ARTIST: ${profile.artistName}
RELEASE DATE: ${track.releaseDate}
ISRC: ${track.isrc}
UPC: ${track.upc}
        `;
        break;
      case 'pro':
        body = `
PLATFORM: ${profile.pro}
WORK TITLE: ${track.title}
WRITERS (Total 100%):
${splitInfo}
ISRC: ${track.isrc}
        `;
        break;
      // ... other cases remain similar
      default:
        body = `\nArtist: ${profile.artistName}\nISRC: ${track.isrc}`;
    }
    copyToClipboard(header + body.trim());
  };

  // --- Service URLs ---
  const distributorUrls = {
    'DistroKid': 'https://distrokid.com/login',
    'TuneCore': 'https://www.tunecore.com/login',
    'CD Baby': 'https://members.cdbaby.com/login',
    'Ditto': 'https://dittomusic.com/login',
    'UnitedMasters': 'https://unitedmasters.com/login',
    'Amuse': 'https://account.amuse.io/en/login',
    'Symphonic': 'https://symphonic.com/login',
    'Other': 'https://google.com/search?q=music+distribution+login'
  };

  const proUrls = {
    'ASCAP': 'https://www.ascap.com/member-access',
    'BMI': 'https://www.bmi.com/login',
    'SESAC': 'https://www.sesac.com/login',
    'GMR': 'https://globalmusicrights.com/Login',
    'Other': 'https://google.com/search?q=performing+rights+organization+login'
  };

  const steps = [
    { id: 'copyright', title: 'US Copyright Office', category: 'Protection', icon: <ShieldCheck className="w-5 h-5" />, url: 'https://eco.copyright.gov/', description: 'Register the work for legal protection.', tip: 'Use Standard Application.' },
    { id: 'distro', title: 'Digital Distribution', category: 'Distribution', icon: <Globe className="w-5 h-5" />, url: distributorUrls[profile.distributor] || '#', description: `Upload to ${profile.distributor}.`, tip: 'Lock metadata first.' },
    { id: 'pro', title: 'PRO Registration', category: 'Performance', icon: <Radio className="w-5 h-5" />, url: proUrls[profile.pro] || '#', description: `Register with ${profile.pro}.`, tip: 'Need IPI numbers.' },
    { id: 'mlc', title: 'The MLC', category: 'Mechanical', icon: <FileText className="w-5 h-5" />, url: 'https://portal.themlc.com/', description: 'Mandatory for US mechanicals.', tip: 'Collects streaming mechanicals.' },
    { id: 'soundexchange', title: 'SoundExchange', category: 'Digital Perf', icon: <Music className="w-5 h-5" />, url: 'https://www.soundexchange.com/', description: 'Digital radio royalties.', tip: 'For the sound recording owner.' }
  ];

  // --- Royalty Calculator Logic ---
  const royalties = useMemo(() => {
    // Very rough estimates per stream
    const masterRate = 0.0035; // Spotify approx
    const mechanicalRate = 0.0006; 
    const performanceRate = 0.0004; 
    
    return {
      master: streamCount * masterRate,
      mechanical: streamCount * mechanicalRate,
      performance: streamCount * performanceRate,
      total: streamCount * (masterRate + mechanicalRate + performanceRate)
    };
  }, [streamCount]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-6 flex flex-col gap-6 sticky top-0 h-screen z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
            <Music className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">RightsSync</h1>
            <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">Pro Edition</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Settings className="w-5 h-5" /> Artist Profile
          </button>
          <button onClick={() => setActiveTab('tracks')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tracks' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Music className="w-5 h-5" /> My Tracks
          </button>
          <button onClick={() => setActiveTab('checklist')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'checklist' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}>
            <CheckCircle2 className="w-5 h-5" /> Automation Hub
          </button>
          <button onClick={() => setActiveTab('toolkit')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'toolkit' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Calculator className="w-5 h-5" /> Toolkit & Export
          </button>
        </nav>

        <div className="mt-auto p-4 bg-slate-900 rounded-xl text-white relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
             <span className="font-bold">Catalog Secure</span>
          </div>
          <p className="text-[10px] text-slate-400">Data auto-saved locally.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:max-w-6xl mx-auto w-full">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h2 className="text-3xl font-bold mb-2">Artist Identity</h2>
              <p className="text-slate-500">Set your global identification codes once to use across all registrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Legal Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" value={profile.legalName} onChange={(e) => updateProfile('legalName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Artist/Stage Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="DJ Rights" value={profile.artistName} onChange={(e) => updateProfile('artistName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">IPI Number</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="00123456789" value={profile.ipiNumber} onChange={(e) => updateProfile('ipiNumber', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">PRO</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.pro} onChange={(e) => updateProfile('pro', e.target.value)}>
                  <option>ASCAP</option><option>BMI</option><option>SESAC</option><option>GMR</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Distributor</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.distributor} onChange={(e) => updateProfile('distributor', e.target.value)}>
                  <option>DistroKid</option><option>TuneCore</option><option>CD Baby</option><option>UnitedMasters</option><option>Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
               <button onClick={() => setActiveTab('tracks')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                  Save & Continue <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold mb-2">Music Catalog</h2>
                <p className="text-slate-500">Manage ISRC, ISWC, and crucial Split Sheets.</p>
              </div>
              <button onClick={addTrack} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                <Plus className="w-5 h-5" /> Add Track
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {tracks.map((track) => (
                <div key={track.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                  <div className="p-6 flex flex-col gap-6">
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                       <div className="flex-1 max-w-lg space-y-1">
                          <input type="text" className="w-full bg-transparent border-none p-0 text-2xl font-bold placeholder-slate-300 focus:ring-0" value={track.title} onChange={(e) => updateTrack(track.id, 'title', e.target.value)} placeholder="Untitled Track" />
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                             <span>Release: </span>
                             <input type="date" className="bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none w-28" value={track.releaseDate} onChange={(e) => updateTrack(track.id, 'releaseDate', e.target.value)} />
                          </div>
                       </div>
                       <button onClick={() => deleteTrack(track.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 className="w-5 h-5" /></button>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ISRC (Recording)</label>
                        <input type="text" className="w-full bg-white rounded border border-slate-200 px-3 py-2 text-xs font-mono" value={track.isrc} onChange={(e) => updateTrack(track.id, 'isrc', e.target.value)} placeholder="US-ABC-12-34567" />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ISWC (Composition)</label>
                        <input type="text" className="w-full bg-white rounded border border-slate-200 px-3 py-2 text-xs font-mono" value={track.iswc} onChange={(e) => updateTrack(track.id, 'iswc', e.target.value)} placeholder="T-123.456.789-C" />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Copyright Reg #</label>
                         <input type="text" className="w-full bg-white rounded border border-slate-200 px-3 py-2 text-xs font-mono" value={track.copyrightNumber} onChange={(e) => updateTrack(track.id, 'copyrightNumber', e.target.value)} placeholder="SR 1-234-567" />
                      </div>
                    </div>

                    {/* Split Sheet Section */}
                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
                       <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2"><PieChart className="w-4 h-4" /> Splits & Ownership</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${track.splits.reduce((a,b) => a + Number(b.share), 0) === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             Total: {track.splits.reduce((a,b) => a + Number(b.share), 0)}%
                          </span>
                       </div>
                       <div className="space-y-2">
                          {track.splits.map((split) => (
                             <div key={split.id} className="flex gap-2 items-center">
                                <input type="text" className="flex-1 bg-white border border-indigo-100 rounded px-2 py-1.5 text-xs font-medium" value={split.name} onChange={(e) => updateSplit(track.id, split.id, 'name', e.target.value)} placeholder="Name" />
                                <select className="bg-white border border-indigo-100 rounded px-2 py-1.5 text-xs" value={split.role} onChange={(e) => updateSplit(track.id, split.id, 'role', e.target.value)}>
                                   <option>Writer</option><option>Producer</option><option>Publisher</option>
                                </select>
                                <div className="relative w-20">
                                   <input type="number" className="w-full bg-white border border-indigo-100 rounded px-2 py-1.5 text-xs font-bold text-right pr-6" value={split.share} onChange={(e) => updateSplit(track.id, split.id, 'share', e.target.value)} />
                                   <span className="absolute right-2 top-1.5 text-xs text-slate-400">%</span>
                                </div>
                                <button onClick={() => removeSplit(track.id, split.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                             </div>
                          ))}
                          <button onClick={() => addSplit(track.id)} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-2">+ Add Collaborator</button>
                       </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex justify-between items-center pt-2">
                      <div className={`text-xs px-3 py-1.5 rounded-full font-bold inline-block ${track.completedSteps.length === steps.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {track.completedSteps.length}/{steps.length} Registrations Complete
                      </div>
                      <button onClick={() => { setSelectedTrackId(track.id); setActiveTab('checklist'); }} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                        Open Checklist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Automation Hub</h2>
                <p className="text-slate-500">Registration for <span className="text-indigo-600 font-bold">"{activeTrack.title}"</span></p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tracks.map(t => (
                  <button key={t.id} onClick={() => setSelectedTrackId(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTrack.id === t.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
               {steps.map(step => {
                 const isCompleted = activeTrack.completedSteps.includes(step.id);
                 return (
                   <div key={step.id} className={`bg-white rounded-2xl border transition-all ${isCompleted ? 'border-green-200 opacity-70' : 'border-slate-100 shadow-sm'}`}>
                      <div className="p-6 flex gap-6 items-start">
                         <button onClick={() => toggleStep(activeTrack.id, step.id)} className={`mt-1 ${isCompleted ? 'text-green-500' : 'text-slate-200 hover:text-indigo-400'}`}>
                           {isCompleted ? <CheckCircle2 className="w-8 h-8 fill-green-50" /> : <Circle className="w-8 h-8" />}
                         </button>
                         <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800">{step.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{step.description}</p>
                            {!isCompleted && (
                               <div className="flex gap-3">
                                  <button onClick={() => generatePacket(step.id, activeTrack)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-2">
                                     <Copy className="w-3 h-3" /> Copy Data
                                  </button>
                                  <a href={step.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-2">
                                     Launch Portal <ExternalLink className="w-3 h-3" />
                                  </a>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                 )
               })}
            </div>
          </div>
        )}

        {/* Toolkit Tab (New Feature) */}
        {activeTab === 'toolkit' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                 <h2 className="text-3xl font-bold mb-2">Toolkit & Analytics</h2>
                 <p className="text-slate-500">Tools to estimate earnings and manage your data.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Revenue Calculator */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-2 bg-green-100 rounded-lg text-green-700"><DollarSign className="w-5 h-5" /></div>
                       <h3 className="font-bold text-lg">Royalty Estimator</h3>
                    </div>
                    
                    <div className="mb-6">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Projected Streams</label>
                       <input type="range" min="1000" max="1000000" step="1000" className="w-full mb-2 accent-indigo-600" value={streamCount} onChange={(e) => setStreamCount(Number(e.target.value))} />
                       <div className="flex justify-between items-center">
                          <input type="number" className="font-mono font-bold text-lg border-b border-slate-200 focus:border-indigo-500 outline-none w-32" value={streamCount} onChange={(e) => setStreamCount(Number(e.target.value))} />
                          <span className="text-xs text-slate-400">Streams</span>
                       </div>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Master (Spotify/Apple)</span>
                          <span className="font-bold text-slate-900">${royalties.master.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Mechanical (The MLC)</span>
                          <span className="font-bold text-slate-900">${royalties.mechanical.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Performance (PRO)</span>
                          <span className="font-bold text-slate-900">${royalties.performance.toFixed(2)}</span>
                       </div>
                       <div className="h-px bg-slate-200 my-2"></div>
                       <div className="flex justify-between items-center text-base">
                          <span className="font-bold text-slate-900">Total Est. Earnings</span>
                          <span className="font-bold text-green-600 text-xl">${royalties.total.toFixed(2)}</span>
                       </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 italic text-center">Estimates only. Actual rates vary by territory and subscription type.</p>
                 </div>

                 {/* Data Management */}
                 <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Download className="w-5 h-5" /></div>
                          <h3 className="font-bold text-lg">Export Catalog</h3>
                       </div>
                       <p className="text-sm text-slate-500 mb-6">Download a CSV file containing all your tracks, ISRCs, and Split information. Useful for sending to labels or lawyers.</p>
                       <button onClick={exportCSV} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                          <FileText className="w-4 h-4" /> Download CSV
                       </button>
                    </div>

                    <div className="bg-indigo-900 text-white p-6 rounded-2xl relative overflow-hidden">
                       <div className="relative z-10">
                          <h3 className="font-bold text-lg mb-2">Need Legal Help?</h3>
                          <p className="text-indigo-200 text-sm mb-4">You have {tracks.length} tracks registered. Consider consulting a music attorney for catalog valuation.</p>
                          <button className="text-xs bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold">Find an Attorney</button>
                       </div>
                       <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-800 opacity-50" />
                    </div>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;