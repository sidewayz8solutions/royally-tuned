// Types for the application
export interface Profile {
  legalName: string;
  artistName: string;
  ipiNumber: string;
  pro: string;
  email: string;
  publisherName: string;
  isSelfPublished: boolean;
  distributor: string;
}

export interface Split {
  id: string;
  name: string;
  role: 'Writer' | 'Producer' | 'Publisher' | 'Performer' | 'Co-Writer';
  share: number;
  email?: string;
}

export interface Track {
  id: string;
  title: string;
  isrc: string;
  iswc: string;
  upc: string;
  releaseDate: string;
  creationYear: number;
  copyrightNumber: string;
  completedSteps: string[];
  splits: Split[];
  artwork?: string;
  genre?: string;
  bpm?: number;
  duration?: string;
  streams?: number;
  revenue?: number;
}

export interface RegistrationStep {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  tip: string;
  icon: string;
  color: string;
}

export interface RoyaltyEstimate {
  master: number;
  mechanical: number;
  performance: number;
  sync: number;
  total: number;
}

export interface MonthlyRevenue {
  month: string;
  master: number;
  mechanical: number;
  performance: number;
  sync: number;
}

export interface StreamStats {
  platform: string;
  streams: number;
  revenue: number;
  color: string;
  [key: string]: string | number;
}
