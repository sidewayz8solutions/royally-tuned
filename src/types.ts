// User and subscription types
export interface UserProfile {
  id: string;
  email: string;
  artistName?: string;
  legalName?: string;
  ipiNumber?: string;
  isniNumber?: string;
  proAffiliation?: string; // BMI, ASCAP, SESAC, etc.
  publisherName?: string;
  createdAt: string;
  profileColor?: string;
}

export interface Track {
  id: string;
  userId: string;
  title: string;
  isrc?: string;
  iswc?: string;
  releaseDate?: string;
  writers: string[];
  splits: Split[];
  registrationStatus: RegistrationStatus;
  streams?: number;
  earnings?: number;
}

export interface Split {
  name: string;
  percentage: number;
  role: 'writer' | 'producer' | 'performer' | 'publisher';
}

export interface RegistrationStatus {
  pro: boolean;
  soundExchange: boolean;
  mlc: boolean;
  distributor: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'registration' | 'documentation' | 'distribution';
}

export interface StreamCalculation {
  streams: number;
  performanceRoyalty: number;
  mechanicalRoyalty: number;
  neighboringRights: number;
  total: number;
}

// Navigation types
export type NavItem = {
  label: string;
  path: string;
  icon?: string;
};

export const PUBLIC_NAV: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Pricing', path: '/pricing' },
];

export const PAID_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/app' },
  { label: 'Tracks', path: '/app/tracks' },
  { label: 'Checklist', path: '/app/checklist' },
  { label: 'Toolkit', path: '/app/toolkit' },
  { label: 'Profile', path: '/app/profile' },
];

