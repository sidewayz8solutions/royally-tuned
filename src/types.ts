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
  // Sync licensing fields
  writersDetailed?: WriterDetailed[];
  publishersDetailed?: PublisherDetailed[];
  syncChecklist?: SyncChecklist;
  syncFiles?: SyncFiles;
  isOneStop?: boolean;
  hasInstrumental?: boolean;
  isCleanMaster?: boolean;
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

// PRO (Performance Rights Organization) options
export type PROAffiliation =
  | 'ASCAP'
  | 'BMI'
  | 'SESAC'
  | 'GMR'
  | 'SOCAN'
  | 'PRS'
  | 'GEMA'
  | 'APRA'
  | 'Other'
  | 'None';

// Writer with PRO affiliation for sync licensing
export interface WriterDetailed {
  name: string;
  pro: PROAffiliation;
  ipi?: string; // Interested Parties Information number
  share?: number; // Percentage share (0-100)
}

// Publisher with PRO affiliation for sync licensing
export interface PublisherDetailed {
  name: string;
  pro: PROAffiliation;
  ipi?: string;
  share?: number;
}

// Sync Checklist - "Record for Sync" requirements
export interface SyncChecklist {
  mp3_ready: boolean;           // 1. MP3 (with embedded metadata)
  master_wav_ready: boolean;    // 2. Master WAV
  acapella_wav_ready: boolean;  // 3. Acapella WAV
  instrumental_wav_ready: boolean; // 4. Instrumental WAV
  splits_sheet_ready: boolean;  // 5. Splits Sheet
  one_stop_ready: boolean;      // 6. One Stop Authorization
}

// File URLs for sync package assets
export interface SyncFiles {
  mp3_url: string | null;
  master_wav_url: string | null;
  acapella_wav_url: string | null;
  instrumental_wav_url: string | null;
  splits_sheet_url: string | null;
  one_stop_url: string | null;
}

// Sync checklist item for UI display
export interface SyncChecklistItem {
  key: keyof SyncChecklist;
  label: string;
  description: string;
  fileKey?: keyof SyncFiles;
}

// Default sync checklist items for UI
export const SYNC_CHECKLIST_ITEMS: SyncChecklistItem[] = [
  {
    key: 'mp3_ready',
    label: 'MP3 (with embedded metadata)',
    description: 'High-quality MP3 with ID3 tags',
    fileKey: 'mp3_url'
  },
  {
    key: 'master_wav_ready',
    label: 'Master WAV',
    description: 'Full quality master recording',
    fileKey: 'master_wav_url'
  },
  {
    key: 'acapella_wav_ready',
    label: 'Acapella WAV',
    description: 'Vocals only version',
    fileKey: 'acapella_wav_url'
  },
  {
    key: 'instrumental_wav_ready',
    label: 'Instrumental WAV',
    description: 'Instrumental/beat only version',
    fileKey: 'instrumental_wav_url'
  },
  {
    key: 'splits_sheet_ready',
    label: 'Splits Sheet',
    description: 'Signed document showing ownership percentages',
    fileKey: 'splits_sheet_url'
  },
  {
    key: 'one_stop_ready',
    label: 'One Stop Authorization',
    description: 'All rights cleared for sync licensing',
    fileKey: 'one_stop_url'
  },
];

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
  { label: 'Registrations', path: '/app/registrations' },
  { label: 'Toolkit', path: '/app/toolkit' },
  { label: 'Profile', path: '/app/profile' },
];

