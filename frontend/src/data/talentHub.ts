// Talent Hub — a curated list of people-shaped opportunities and offerings.
// Skeleton scaffold: we list a few seed entries by hand; the long-term plan is
// to take submissions via a form. For now, posts are added via PR.

import { PathRole } from '@/types/research';
import { GrantRegion } from './grants';

export type TalentPostType = 'hiring' | 'available' | 'collaboration';

export interface TalentPost {
  id: string;
  type: TalentPostType;
  title: string;
  org?: string;
  region: GrantRegion;
  audience: string;
  // Who *posts* this kind of entry
  postedByRoles: PathRole[];
  // Who this entry is *for*
  forRoles: PathRole[];
  src?: string;
  postedAt: string; // ISO date
  notes?: string;
}

// Seed entries — replaced as real submissions come in via PR.
export const talentPosts: TalentPost[] = [
  {
    id: 'seed-hiring-mle',
    type: 'hiring',
    title: 'Senior ML Engineer — clinical imaging models',
    org: 'Example Imaging Co.',
    region: 'Global',
    audience: 'Senior MLE with PyTorch + DICOM experience; remote-friendly',
    postedByRoles: ['founder', 'business'],
    forRoles: ['jobseeker', 'student'],
    postedAt: '2026-04-22',
    notes: 'Placeholder — submit your hire via PR until the intake form ships.',
  },
  {
    id: 'seed-available-postdoc',
    type: 'available',
    title: 'Available — postdoc in clinical NLP',
    region: 'EU',
    audience: 'PhD in NLP/ML, 3 yrs at a top-10 EU lab; open to industry or academia',
    postedByRoles: ['student'],
    forRoles: ['founder', 'business', 'student'],
    postedAt: '2026-04-18',
    notes: 'Placeholder profile — anonymized seed. Real contacts shipped via PR.',
  },
  {
    id: 'seed-collaboration-radiology',
    type: 'collaboration',
    title: 'Collaboration — radiology PI seeks ML co-author',
    org: 'University Medical Center (anonymized)',
    region: 'US',
    audience: 'Open to ML researchers willing to co-author on a chest-CT screening cohort',
    postedByRoles: ['student'],
    forRoles: ['student'],
    postedAt: '2026-04-10',
    notes: 'Co-authorship + data-access. Placeholder — submit via PR.',
  },
];
