import type { Profile, Track, MonthlyRevenue, StreamStats } from './types';

// Default Profile
export const defaultProfile: Profile = {
  legalName: '',
  artistName: '',
  ipiNumber: '',
  pro: 'ASCAP',
  email: '',
  publisherName: '',
  isSelfPublished: true,
  distributor: 'DistroKid'
};

// Demo Tracks with sample data
export const defaultTracks: Track[] = [
  {
    id: crypto.randomUUID(),
    title: 'Midnight Dreams',
    isrc: 'USRC11234567',
    iswc: 'T-012.345.678-C',
    upc: '012345678901',
    releaseDate: '2024-06-15',
    creationYear: 2024,
    copyrightNumber: 'SR 1-234-567',
    completedSteps: ['copyright', 'distro', 'pro'],
    splits: [
      { id: '1', name: 'You', role: 'Writer', share: 50 },
      { id: '2', name: 'Producer Joe', role: 'Producer', share: 30 },
      { id: '3', name: 'Sarah Keys', role: 'Co-Writer', share: 20 }
    ],
    genre: 'Pop',
    bpm: 120,
    duration: '3:42',
    streams: 1250000,
    revenue: 4250.00
  },
  {
    id: crypto.randomUUID(),
    title: 'Electric Summer',
    isrc: 'USRC11234568',
    iswc: '',
    upc: '012345678902',
    releaseDate: '2024-08-20',
    creationYear: 2024,
    copyrightNumber: '',
    completedSteps: ['distro'],
    splits: [
      { id: '1', name: 'You', role: 'Writer', share: 100 }
    ],
    genre: 'Electronic',
    bpm: 128,
    duration: '4:15',
    streams: 580000,
    revenue: 1890.50
  },
  {
    id: crypto.randomUUID(),
    title: 'Velvet Rain',
    isrc: '',
    iswc: '',
    upc: '',
    releaseDate: '',
    creationYear: 2024,
    copyrightNumber: '',
    completedSteps: [],
    splits: [
      { id: '1', name: 'You', role: 'Writer', share: 60 },
      { id: '2', name: 'Mike Bass', role: 'Producer', share: 40 }
    ],
    genre: 'R&B',
    bpm: 90,
    duration: '3:58',
    streams: 0,
    revenue: 0
  }
];

// Monthly Revenue Data (Sample)
export const monthlyRevenueData: MonthlyRevenue[] = [
  { month: 'Jul', master: 320, mechanical: 45, performance: 28, sync: 0 },
  { month: 'Aug', master: 480, mechanical: 68, performance: 42, sync: 150 },
  { month: 'Sep', master: 620, mechanical: 88, performance: 55, sync: 0 },
  { month: 'Oct', master: 890, mechanical: 126, performance: 78, sync: 0 },
  { month: 'Nov', master: 1150, mechanical: 163, performance: 101, sync: 300 },
  { month: 'Dec', master: 1420, mechanical: 201, performance: 125, sync: 0 },
];

// Platform Stats
export const platformStats: StreamStats[] = [
  { platform: 'Spotify', streams: 1250000, revenue: 4375.00, color: '#1DB954' },
  { platform: 'Apple Music', streams: 380000, revenue: 2660.00, color: '#FA2D48' },
  { platform: 'YouTube Music', streams: 520000, revenue: 520.00, color: '#FF0000' },
  { platform: 'Amazon Music', streams: 180000, revenue: 720.00, color: '#FF9900' },
  { platform: 'Tidal', streams: 45000, revenue: 585.00, color: '#000000' },
];

// Registration Steps
export const registrationSteps = [
  {
    id: 'copyright',
    title: 'US Copyright Office',
    category: 'Protection',
    url: 'https://eco.copyright.gov/',
    description: 'Register for federal copyright protection',
    tip: 'Use Standard Application for sound recordings',
    icon: 'shield',
    color: '#8B5CF6'
  },
  {
    id: 'distro',
    title: 'Digital Distribution',
    category: 'Distribution',
    url: 'https://distrokid.com/',
    description: 'Distribute to streaming platforms',
    tip: 'Lock metadata before uploading',
    icon: 'globe',
    color: '#3B82F6'
  },
  {
    id: 'pro',
    title: 'PRO Registration',
    category: 'Performance',
    url: 'https://www.ascap.com/',
    description: 'Register compositions with your PRO',
    tip: 'Requires IPI numbers for all writers',
    icon: 'radio',
    color: '#EC4899'
  },
  {
    id: 'mlc',
    title: 'The MLC',
    category: 'Mechanical',
    url: 'https://portal.themlc.com/',
    description: 'Collect US mechanical royalties',
    tip: 'Mandatory for US streaming mechanicals',
    icon: 'file',
    color: '#F59E0B'
  },
  {
    id: 'soundexchange',
    title: 'SoundExchange',
    category: 'Digital Performance',
    url: 'https://www.soundexchange.com/',
    description: 'Collect digital radio royalties',
    tip: 'For sound recording owners',
    icon: 'music',
    color: '#10B981'
  }
];

// PRO Options
export const proOptions = ['ASCAP', 'BMI', 'SESAC', 'GMR', 'SOCAN', 'PRS', 'Other'];

// Distributor Options
export const distributorOptions = [
  'DistroKid',
  'TuneCore',
  'CD Baby',
  'UnitedMasters',
  'Ditto',
  'Amuse',
  'Symphonic',
  'AWAL',
  'Other'
];

// Genre Options
export const genreOptions = [
  'Pop', 'Hip-Hop', 'R&B', 'Electronic', 'Rock', 'Country',
  'Latin', 'Jazz', 'Classical', 'Folk', 'Indie', 'Alternative', 'Other'
];

// Role Options
export const roleOptions = ['Writer', 'Producer', 'Publisher', 'Performer', 'Co-Writer'];
