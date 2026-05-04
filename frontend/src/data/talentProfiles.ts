// Talent profiles — hirer-facing rated directory.
//
// Visibility model:
//   - public: name (or pseudonym), specialization, region, public signals,
//     calibrated rating + tier, availability badge
//   - gated:  full identity, contact channel, references, resume — visible
//     structurally so hirers see what they'd unlock; content locked until
//     access is granted
//
// Compliance: only profiles with explicit consent ship in here. The TODO
// scaffolds below show one card per tier so the layout is wired and reviewable;
// every text field is TODO until a real consented profile arrives via PR.

import { PathRole } from '@/types/research';
import { GrantRegion } from './grants';

export type ProfileTier = 'core' | 'strong' | 'emerging';

export type AvailabilityStatus =
  | 'open-to-offers'
  | 'open-to-collab'
  | 'currently-employed'
  | 'unknown';

export type SignalCategory = 'competition' | 'publication' | 'fellowship' | 'product' | 'community';

export interface PublicSignal {
  label: string;
  detail: string;
  category: SignalCategory;
  src?: string;
}

export interface GatedSummary {
  fullProfileAvailable: boolean;
  contactsAvailable: boolean;
  referencesCount: number;
  resumeAvailable: boolean;
}

export interface TalentProfile {
  id: string;
  publicName: string;
  handle?: string;
  specialization: string[];
  region: GrantRegion;
  publicSignals: PublicSignal[];
  rating: number;
  tier: ProfileTier;
  availability: AvailabilityStatus;
  forRoles: PathRole[];
  isPlaceholder: boolean;
  gated: GatedSummary;
}

// One scaffold per tier so the UI shows the structure without fabricated info.
// Replace via PR when a real consented profile lands.
export const talentProfiles: TalentProfile[] = [
  {
    id: 'todo-core-1',
    publicName: 'TODO',
    specialization: ['TODO'],
    region: 'Global',
    publicSignals: [
      { label: 'TODO', detail: 'TODO', category: 'publication' },
    ],
    rating: 0,
    tier: 'core',
    availability: 'unknown',
    forRoles: ['founder', 'business'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: false, contactsAvailable: false, referencesCount: 0, resumeAvailable: false },
  },
  {
    id: 'todo-strong-1',
    publicName: 'TODO',
    specialization: ['TODO'],
    region: 'Global',
    publicSignals: [
      { label: 'TODO', detail: 'TODO', category: 'publication' },
    ],
    rating: 0,
    tier: 'strong',
    availability: 'unknown',
    forRoles: ['founder', 'business', 'student'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: false, contactsAvailable: false, referencesCount: 0, resumeAvailable: false },
  },
  {
    id: 'todo-emerging-1',
    publicName: 'TODO',
    specialization: ['TODO'],
    region: 'Global',
    publicSignals: [
      { label: 'TODO', detail: 'TODO', category: 'publication' },
    ],
    rating: 0,
    tier: 'emerging',
    availability: 'unknown',
    forRoles: ['founder', 'student'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: false, contactsAvailable: false, referencesCount: 0, resumeAvailable: false },
  },
];

export const tierConfig: Record<ProfileTier, { label: string; description: string; accent: string }> = {
  core: {
    label: 'Core',
    description: 'Top 5% — verified competition wins, peer-reviewed first-author work, or production-deployed AI.',
    accent: 'border-primary text-primary',
  },
  strong: {
    label: 'Strong',
    description: 'Verified specialists with published work or competition medals; ready for senior roles.',
    accent: 'border-foreground/60 text-foreground',
  },
  emerging: {
    label: 'Emerging',
    description: 'Strong early signal (one publication, one ranked competition); early-career or transitioning.',
    accent: 'border-muted-foreground/40 text-muted-foreground',
  },
};

export const availabilityConfig: Record<AvailabilityStatus, { label: string; tone: 'positive' | 'neutral' | 'muted' }> = {
  'open-to-offers': { label: 'Open to offers', tone: 'positive' },
  'open-to-collab': { label: 'Open to collaboration', tone: 'positive' },
  'currently-employed': { label: 'Currently placed', tone: 'neutral' },
  unknown: { label: 'Status unknown', tone: 'muted' },
};
