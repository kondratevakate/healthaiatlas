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
  // ---- HIRING ----
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
    id: 'seed-hiring-clinical-lead',
    type: 'hiring',
    title: 'Clinical Lead — AI radiology product',
    org: 'Stealth-stage US startup',
    region: 'US',
    audience: 'Board-certified radiologist with at least 5 yrs reading; part-time / advisory open',
    postedByRoles: ['founder'],
    forRoles: ['jobseeker'],
    postedAt: '2026-04-19',
    notes: 'Equity + cash. Placeholder — submit via PR.',
  },
  {
    id: 'seed-hiring-regulatory',
    type: 'hiring',
    title: 'Regulatory Affairs — EU MDR / FDA',
    org: 'Series B medical-device company',
    region: 'EU',
    audience: '7+ yrs RA in Class IIa/IIb medical devices, ideally with AI/ML experience',
    postedByRoles: ['business'],
    forRoles: ['jobseeker'],
    postedAt: '2026-04-15',
    notes: 'Placeholder.',
  },

  // ---- AVAILABLE ----
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
    id: 'seed-available-imaging-engineer',
    type: 'available',
    title: 'Available — ML engineer (medical imaging, 4 yrs)',
    region: 'Global',
    audience: 'Production-grade PyTorch + monai; built two FDA-cleared imaging products at prior employer',
    postedByRoles: ['jobseeker'],
    forRoles: ['founder', 'business'],
    postedAt: '2026-04-12',
    notes: 'Placeholder. Open to remote (EU/US time zones).',
  },
  {
    id: 'seed-available-clinical-data',
    type: 'available',
    title: 'Available — clinical data scientist (oncology)',
    region: 'UK',
    audience: 'NHS background; experience with real-world evidence, FHIR, registry data',
    postedByRoles: ['jobseeker'],
    forRoles: ['business', 'student'],
    postedAt: '2026-04-09',
    notes: 'Placeholder.',
  },

  // ---- COLLABORATION ----
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
  {
    id: 'seed-collaboration-genomics',
    type: 'collaboration',
    title: 'Collaboration — multi-omics dataset, looking for ML lead',
    org: 'EU consortium (anonymized)',
    region: 'EU',
    audience: 'PhD-level ML researcher to take a method-side lead on a 5K-patient multi-omics study',
    postedByRoles: ['student'],
    forRoles: ['student'],
    postedAt: '2026-04-04',
    notes: 'Co-investigator role; data-sharing under EHDS framework. Placeholder.',
  },
  {
    id: 'seed-collaboration-pilot',
    type: 'collaboration',
    title: 'Pilot site available — UAE hospital, AI triage tools',
    org: 'Tertiary hospital, Abu Dhabi (anonymized)',
    region: 'UAE',
    audience: 'Vendor pilots in ED triage / sepsis early-warning; IRB pathway available',
    postedByRoles: ['business'],
    forRoles: ['founder'],
    postedAt: '2026-03-28',
    notes: 'No-cost pilot if outcomes are publishable. Placeholder.',
  },
];
