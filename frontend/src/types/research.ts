// Research Navigator Types
// Based on Plan v2: Research Navigator with Growth Loops

import { LocalizedString } from './index';

// Evidence levels for claims verification
export type EvidenceLevel = 'official' | 'observed' | 'anecdotal' | 'inference';

// User roles for path navigation
export type PathRole = 'founder' | 'jobseeker' | 'business' | 'student';

// Risk levels for assessment
export type RiskLevel = 'low' | 'medium' | 'high';

// Risk assessment result from Quick Reality Test
export interface RiskAssessment {
  id: string;
  role: PathRole;
  riskLevel: RiskLevel;
  bottlenecks: string[];
  bestNextStep: string;
  context?: string;
  generatedAt: Date;
  shareId: string;
}

// Red flag pattern for /redflags library
export interface RedFlag {
  id: string;
  title: LocalizedString;
  pattern: LocalizedString;
  reality: LocalizedString;
  howToVerify: LocalizedString[];
  evidenceLevel: EvidenceLevel;
  sources?: string[];
  category?: 'intermediary' | 'promise' | 'process' | 'legal';
  related_claim_ids?: string[];
}

// Test question for Quick Reality Test
export interface TestQuestion {
  id: string;
  question: LocalizedString;
  options: TestOption[];
}

export interface TestOption {
  value: string;
  label: LocalizedString;
  riskWeight: number;
  affectsBottlenecks?: string[];
}

// Prompt template for LLM verification
export interface PromptTemplate {
  id: string;
  llm: 'chatgpt' | 'gemini' | 'perplexity' | 'claude';
  role: PathRole;
  template: string;
  variables: string[];
}

// Dashboard update for retention loop
export interface DashboardUpdate {
  id: string;
  date: Date;
  title: LocalizedString;
  description: LocalizedString;
  affectedPaths: PathRole[];
  changeType: 'regulation' | 'program' | 'data' | 'correction';
}

// Gatekeeper flow node for decision diagrams
export interface GatekeeperNode {
  id: string;
  type: 'entry' | 'filter' | 'decision' | 'exit';
  label: LocalizedString;
  signals?: string[];
  cost?: string;
  who?: string;
  evidence?: string[];
}

export interface GatekeeperFlow {
  id: string;
  role: PathRole;
  nodes: GatekeeperNode[];
  connections: { from: string; to: string; label?: string }[];
}

// Funnel stage for attention/conversion funnels
export interface FunnelStage {
  id: string;
  label: LocalizedString;
  count: number;
  percentage?: number;
}

export interface AttentionFunnel {
  id: string;
  role: PathRole;
  title: LocalizedString;
  stages: FunnelStage[];
  source?: string;
  sampleSize?: number;
}

// Cost of attempt for decision cards
export interface CostOfAttempt {
  id: string;
  title: LocalizedString;
  time: string;
  money: string;
  risk: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  conditions: LocalizedString;
  role: PathRole;
}

// Myth vs Reality for debunking
export interface MythReality {
  id: string;
  myth: LocalizedString;
  reality: LocalizedString;
  howToVerify: LocalizedString;
  evidenceLevel: EvidenceLevel;
  role: PathRole;
}

// Evidence source with ladder level
export interface EvidenceSource {
  id: string;
  claim: LocalizedString;
  level: EvidenceLevel;
  sources: {
    name: string;
    url?: string;
    date?: string;
  }[];
  updatedAt: Date;
  trigger?: string;
}

// Changelog entry for versioning
export interface ChangelogEntry {
  id: string;
  date: Date;
  changes: {
    type: 'added' | 'updated' | 'removed';
    description: LocalizedString;
    affectedPaths?: PathRole[];
  }[];
}

// User follow preferences (stored in localStorage)
export interface UserFollowPreferences {
  followedPaths: PathRole[];
  lastVisit: Date;
  savedAssessments: string[];
}
