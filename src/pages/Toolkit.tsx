import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Calculator, FileText, Download, TrendingUp } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '../components/animations';
import { useNavigate } from 'react-router-dom';

// Per-platform estimated payout ranges (per stream). These are estimates — show low/median/high ranges.
// Sources: public industry payout estimates (varies by territory, catalogue, agreement and time).
const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', rates: { low: 0.0025, median: 0.0035, high: 0.005 } },
  { id: 'apple', name: 'Apple Music', rates: { low: 0.006, median: 0.008, high: 0.01 } },
  { id: 'youtube', name: 'YouTube Music', rates: { low: 0.0004, median: 0.0007, high: 0.001 } },
  { id: 'amazon', name: 'Amazon Music', rates: { low: 0.0035, median: 0.0045, high: 0.006 } },
  { id: 'tidal', name: 'Tidal', rates: { low: 0.01, median: 0.015, high: 0.02 } },
];

// Predefined distribution profiles — approximate market share weights used to compute an aggregate blended payout
const DISTRIBUTION_PROFILES: Record<string, { id: string; name: string; weights: Record<string, number> }> = {
  'default': {
    id: 'default',
    name: 'Market Average (mixed)',
    weights: { spotify: 0.40, youtube: 0.30, apple: 0.15, amazon: 0.10, tidal: 0.05 },
  },
  'spotify-heavy': {
    id: 'spotify-heavy',
    name: 'Spotify-heavy',
    weights: { spotify: 0.65, youtube: 0.15, apple: 0.10, amazon: 0.07, tidal: 0.03 },
  },
  'youtube-heavy': {
    id: 'youtube-heavy',
    name: 'YouTube-heavy',
    weights: { spotify: 0.25, youtube: 0.55, apple: 0.10, amazon: 0.07, tidal: 0.03 },
  },
};

export default function Toolkit() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calculator' | 'forms'>('calculator');

  // Total quick slider to set a "total monthly streams" and then distribute equally when enabled.
  const [totalStreams, setTotalStreams] = useState<number>(100000);
  const [distributeEqually, setDistributeEqually] = useState(true);
  // Use market aggregate blended estimate (no platform credentials needed)
  const [useAggregate, setUseAggregate] = useState(true);
  const [profileId, setProfileId] = useState<string>('default');

  // per-platform streams (manual override when distributeEqually = false)
  const initialPlatformStreams = PLATFORMS.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {} as Record<string, number>);
  const [platformStreams, setPlatformStreams] = useState<Record<string, number>>(initialPlatformStreams);

  // which platforms are enabled/selected
  const [selected, setSelected] = useState<Record<string, boolean>>(
    PLATFORMS.reduce((acc, p, i) => ({ ...acc, [p.id]: i === 0 }), {} as Record<string, boolean>)
  );

  // connection stubs (saved in localStorage) — real OAuth would require backend endpoints and client IDs
  const [connected, setConnected] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('platform-connections');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('platform-connections', JSON.stringify(connected));
  }, [connected]);

  // When distributing equally, compute per-platform streams automatically
  useEffect(() => {
    if (!distributeEqually) return;
    const enabled = PLATFORMS.filter((p) => selected[p.id]);
    const count = Math.max(1, enabled.length);
    const per = Math.floor(totalStreams / count);
    const next = { ...initialPlatformStreams };
    enabled.forEach((p) => (next[p.id] = per));
    setPlatformStreams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalStreams, distributeEqually, selected]);

  const togglePlatform = (id: string) => {
    const next = { ...selected, [id]: !selected[id] };
    setSelected(next);
  };

  const onChangePlatformStreams = (id: string, value: number) => {
    setPlatformStreams((s) => ({ ...s, [id]: Math.max(0, Math.floor(value)) }));
  };

  const { user } = useAuth();

  const connectToggle = (id: string) => {
    // For Spotify, kick off OAuth flow that will redirect back to the app
    if (id === 'spotify' && !connected[id]) {
      // If not signed in, ask user to sign in first
      if (!user) {
        window.alert('Please sign in to connect Spotify');
        return;
      }
      // Redirect to serverless auth start which will forward to Spotify
      window.location.href = `/api/spotify/auth?userId=${user.id}`;
      return;
    }

    const next = { ...connected, [id]: !connected[id] };
    setConnected(next);
  };

  // import CSV: expect lines with platform,streams (platform id or name)
  const importCSV = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const next = { ...platformStreams };
      for (const line of lines) {
        const [rawPlat, rawStreams] = line.split(',').map((s) => s.trim());
        if (!rawPlat || !rawStreams) continue;
        const platId = PLATFORMS.find((p) => p.id === rawPlat.toLowerCase() || p.name.toLowerCase() === rawPlat.toLowerCase())?.id;
        const parsed = Number(rawStreams.replace(/[^0-9]/g, '')) || 0;
        if (platId) {
          next[platId] = parsed;
        }
      }
      setPlatformStreams(next);
      setDistributeEqually(false);
    };
    reader.readAsText(file);
  };

  const perPlatformBreakdown = useMemo(() => {
    return PLATFORMS.map((p) => {
      const streams = platformStreams[p.id] || 0;
      const low = streams * p.rates.low;
      const median = streams * p.rates.median;
      const high = streams * p.rates.high;
      return { ...p, streams, low, median, high };
    });
  }, [platformStreams]);

  const totals = useMemo(() => {
    return perPlatformBreakdown.reduce(
      (acc, p) => ({ low: acc.low + p.low, median: acc.median + p.median, high: acc.high + p.high }),
      { low: 0, median: 0, high: 0 }
    );
  }, [perPlatformBreakdown]);

  // Aggregate totals computed from distribution profile weights and platform median rates
  const aggregateTotals = useMemo(() => {
  const profile = DISTRIBUTION_PROFILES[profileId] || DISTRIBUTION_PROFILES['default'];
  const weights = profile.weights;

    // Calculate blended per-stream rates using median rates and profile weights
    let totalWeight = 0;
    let blendedLow = 0;
    let blendedMedian = 0;
    let blendedHigh = 0;
    for (const p of PLATFORMS) {
      const w = (weights[p.id] || 0) * (selected[p.id] ? 1 : 0);
      totalWeight += w;
      blendedLow += p.rates.low * w;
      blendedMedian += p.rates.median * w;
      blendedHigh += p.rates.high * w;
    }
    // Normalize if totalWeight isn't 1 (e.g., some platforms deselected)
  if (totalWeight <= 0) return { low: 0, median: 0, high: 0, perStream: { low: 0, median: 0, high: 0 } };
    const normLow = blendedLow / totalWeight;
    const normMedian = blendedMedian / totalWeight;
    const normHigh = blendedHigh / totalWeight;

    const low = totalStreams * normLow;
    const median = totalStreams * normMedian;
    const high = totalStreams * normHigh;
    return { low, median, high, perStream: { low: normLow, median: normMedian, high: normHigh } };
  }, [profileId, totalStreams, selected]);

  const forms = [
    { name: 'BMI Songwriter Application', type: 'PRO' },
    { name: 'ASCAP Member Application', type: 'PRO' },
    { name: 'MLC Registration Form', type: 'Mechanical' },
    { name: 'SoundExchange Artist Form', type: 'Neighboring' },
    // Copyright forms: PA = Performing Arts (composition), SR = Sound Recording (master)
    { name: 'Copyright Registration (PA)', type: 'Copyright', external_link: 'https://www.copyright.gov/forms/pa.pdf' },
    { name: 'Copyright Registration (SR)', type: 'Copyright', external_link: 'https://www.copyright.gov/forms/sr.pdf' },
    { name: 'TV Music Rights License', type: 'Legal' },
    { name: 'Co-Production Agreement', type: 'Legal' },
  ];

  const formatMoney = (n: number) => '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatStreamsDisplay = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
    if (n >= 1000) return `${(n / 1000).toLocaleString()}K`;
    return n.toString();
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      <FadeInOnScroll>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Toolkit</h1>
          <p className="text-white/50">Tools to calculate earnings and manage registrations</p>
        </div>
      </FadeInOnScroll>

      {/* Tabs */}
      <FadeInOnScroll delay={0.1}>
        <div className="flex gap-2 mb-8">
          {[
            { id: 'calculator', label: 'Stream Calculator', icon: Calculator },
            { id: 'forms', label: 'Forms Hub', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'calculator' | 'forms')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-royal-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </FadeInOnScroll>

      {activeTab === 'calculator' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <FadeInOnScroll delay={0.2}>
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Multi-Platform Stream Calculator</h2>

              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">Total Monthly Streams (quick control)</label>
                <input
                  type="range"
                  min="1000"
                  max="5000000"
                  step="1000"
                  value={totalStreams}
                  onChange={(e) => setTotalStreams(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/40">1K</span>
                  <span className="text-2xl font-bold text-green-400">{formatStreamsDisplay(totalStreams)}</span>
                  <span className="text-xs text-white/40">5M</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={distributeEqually} onChange={() => setDistributeEqually((s) => !s)} />
                    Distribute equally across selected platforms
                  </label>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={useAggregate} onChange={() => setUseAggregate((s) => !s)} />
                    Use market aggregate estimate (no platform credentials required)
                  </label>
                  <select
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    className="ml-4 bg-white/5 text-white/80 p-1 rounded"
                  >
                    {Object.values(DISTRIBUTION_PROFILES).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Import streams (CSV: platform,streams)</label>
                <input
                  type="file"
                  accept="text/csv"
                  onChange={(e) => importCSV(e.target.files ? e.target.files[0] : null)}
                  className="text-sm text-white/60"
                />
                <p className="text-xs text-white/30 mt-2">Example CSV lines: spotify,1000000</p>
              </div>

              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Estimated Monthly Totals (low / median / high)</span>
                </div>
                <div className="flex gap-4 items-baseline">
                  {useAggregate ? (
                    <>
                      <span className="text-2xl font-semibold text-white">{formatMoney(aggregateTotals.median)}</span>
                      <span className="text-sm text-white/40">({formatMoney(aggregateTotals.low)} — {formatMoney(aggregateTotals.high)})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold text-white">{formatMoney(totals.median)}</span>
                      <span className="text-sm text-white/40">({formatMoney(totals.low)} — {formatMoney(totals.high)})</span>
                    </>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={async () => {
                      if (!user) return window.alert('Sign in to save calculations');
                      try {
                        const body = {
                          userId: user.id,
                          payload: { totalStreams, platformStreams, totals },
                        };
                        const res = await fetch('/api/calculations/save', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body),
                        });
                        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
                        window.alert('Calculation saved');
                      } catch (e) {
                        console.error(e);
                        window.alert('Could not save calculation');
                      }
                    }}
                    className="px-3 py-2 rounded bg-royal-600 text-white"
                  >
                    Save Calculation
                  </button>
                  <button
                    onClick={() => {
                      // Export breakdown as CSV
                      const rows = ['platform,streams,low,median,high'];
                      perPlatformBreakdown.forEach(p => rows.push(`${p.id},${p.streams},${p.low.toFixed(2)},${p.median.toFixed(2)},${p.high.toFixed(2)}`));
                      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'calculation.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-2 rounded bg-white/5 text-white/80"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Breakdown */}
          <FadeInOnScroll delay={0.3}>
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Per-Platform Breakdown</h2>

              <div className="space-y-4">
                {perPlatformBreakdown.map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <div className="w-12">
                      <div className="text-white font-medium">{p.name}</div>
                      <div className="text-xs text-white/40">Estimated rates: {`${p.rates.low.toFixed(4)}–${p.rates.high.toFixed(4)} per stream`}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!selected[p.id]} onChange={() => togglePlatform(p.id)} />
                          <span className="ml-1 text-white/80">Include</span>
                        </label>
                        <button
                          onClick={() => connectToggle(p.id)}
                          className={`ml-auto px-3 py-1 rounded text-sm ${connected[p.id] ? 'bg-royal-600 text-white' : 'bg-white/5 text-white/60'}`}
                        >
                          {connected[p.id] ? 'Connected' : 'Connect'}
                        </button>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={platformStreams[p.id] ?? 0}
                          onChange={(e) => onChangePlatformStreams(p.id, Number(e.target.value || 0))}
                          disabled={distributeEqually}
                          className="w-40 p-2 rounded bg-white/5 text-white"
                        />
                        <div className="text-sm text-white/40">streams</div>
                        <div className="ml-auto text-right">
                            <div className="text-white font-semibold">{formatMoney(p.median)}</div>
                            <div className="text-xs text-white/40">{formatMoney(p.low)} — {formatMoney(p.high)}</div>
                            {useAggregate && (
                              <div className="text-xs text-white/30">Weighted contrib: {formatMoney((aggregateTotals.perStream.median * (selected[p.id] ? (DISTRIBUTION_PROFILES[profileId]?.weights[p.id] || 0) : 0) * totalStreams) || 0)}</div>
                            )}
                          </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-white/30 mt-6">
                * These are ranges based on public industry payout estimates. Actual amounts depend on contracts, the territory, distribution split, and whether the writer/producer owns publishing shares.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      )}

      {activeTab === 'forms' && (
        <StaggerContainer className="grid md:grid-cols-2 gap-4">
          {forms.map((form, i) => (
            <StaggerItem key={i}>
              <TiltCard>
                <div className="glass-card rounded-xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-royal-600/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{form.name}</h3>
                    <p className="text-sm text-white/50">{form.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.external_link ? (
                      <a
                        href={form.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-md bg-white/5 text-white/70 hover:bg-white/10 text-center"
                      >
                        Open
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(`/app/forms/${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`)}
                        className="px-3 py-2 rounded-md bg-white/5 text-white/70 hover:bg-white/10"
                      >
                        Open
                      </button>
                    )}
                    {form.external_link ? (
                      <a
                        href={form.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    ) : (
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}