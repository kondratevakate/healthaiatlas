// Programs — accelerators, fellowships, and structured cohort programs in healthcare AI.

import { PathRole } from '@/types/research';
import { GrantRegion } from './grants';

export type ProgramType = 'accelerator' | 'fellowship' | 'incubator' | 'residency';

export interface Program {
  id: string;
  title: string;
  organizer: string;
  region: GrantRegion;
  type: ProgramType;
  duration: string;
  cohortDates?: string;
  audience: string;
  roles: PathRole[];
  src: string;
  notes?: string;
}

export const programs: Program[] = [
  {
    id: 'yc-healthtech',
    title: 'Y Combinator (HealthTech accepted)',
    organizer: 'Y Combinator',
    region: 'US',
    type: 'accelerator',
    duration: '3 months',
    cohortDates: 'Winter / Summer batches',
    audience: 'Pre-seed startups, including healthcare AI',
    roles: ['founder'],
    src: 'https://www.ycombinator.com/apply',
    notes: '$500K standard deal. Healthcare cohort has grown notably since 2023.',
  },
  {
    id: 'mit-hacking-medicine',
    title: 'MIT Hacking Medicine — Grand Hack',
    organizer: 'MIT Hacking Medicine',
    region: 'US',
    type: 'incubator',
    duration: 'Weekend hackathons + ongoing',
    audience: 'Clinicians, engineers, designers, founders',
    roles: ['student', 'founder'],
    src: 'https://hackingmedicine.mit.edu/',
    notes: 'Entry point into the MIT health-tech network. Annual Grand Hack draws 400+ participants.',
  },
  {
    id: 'hub71-plus-healthtech',
    title: 'Hub71+ HealthTech',
    organizer: 'Hub71 (Abu Dhabi)',
    region: 'UAE',
    type: 'accelerator',
    duration: '6+ months',
    audience: 'Healthcare-AI startups raising or scaling in MENA',
    roles: ['founder', 'business'],
    src: 'https://hub71.com/healthtech',
    notes: 'Subsidized housing + Mubadala intros. Strong on regulatory + payer access in the region.',
  },
  {
    id: 'plug-and-play-health',
    title: 'Plug and Play Health',
    organizer: 'Plug and Play',
    region: 'Global',
    type: 'accelerator',
    duration: '12 weeks',
    cohortDates: 'Twice annually',
    audience: 'Series A-ready startups; corporate-pilot-driven',
    roles: ['founder'],
    src: 'https://www.plugandplaytechcenter.com/health/',
    notes: 'Multi-corporate model — pilots with 50+ health systems and pharma partners.',
  },
  {
    id: 'stanford-startx',
    title: 'StartX Med',
    organizer: 'Stanford StartX',
    region: 'US',
    type: 'incubator',
    duration: 'Open-ended',
    audience: 'Stanford-affiliated founders building medical products',
    roles: ['founder', 'student'],
    src: 'https://startx.com/',
    notes: 'Non-equity. Strong access to Stanford Medicine clinical pilots.',
  },
  {
    id: 'roche-startup-creator',
    title: 'Roche Startup Creator',
    organizer: 'Roche',
    region: 'Global',
    type: 'accelerator',
    duration: 'Variable',
    audience: 'Diagnostics, oncology, and digital-health startups',
    roles: ['founder', 'business'],
    src: 'https://www.roche.com/innovation',
    notes: 'Pharma-led — pilots favor companies with regulated-device or biomarker plays.',
  },
  {
    id: 'nih-bridge-fellowship',
    title: 'NIH AI/ML Postdoctoral Fellowships',
    organizer: 'NIH (NLM, NCI, NIBIB)',
    region: 'US',
    type: 'fellowship',
    duration: '2-3 years',
    audience: 'PhD-holders entering biomedical AI research',
    roles: ['student'],
    src: 'https://www.training.nih.gov/programs/postdoc',
    notes: 'Stipend + research budget. Multiple ICs run their own AI fellowship variants.',
  },
];
