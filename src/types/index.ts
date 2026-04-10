// AI Health Directory — Knowledge Bank
// Core data models for the platform

export type LocalizedString = {
  en: string;
  ar: string;
};

// User Personas
export type UserPersona = 'patient' | 'doctor' | 'business' | 'startup' | 'leader';

// AI application areas
export type AIArea = 
  | 'diagnostics'
  | 'telemedicine'
  | 'robotics'
  | 'drug-discovery'
  | 'patient-monitoring'
  | 'medical-imaging'
  | 'health-records'
  | 'mental-health'
  | 'genomics'
  | 'clinical-trials'
  | 'administrative';

// Organization types in the ecosystem
export type PlayerType = 
  | 'startup'
  | 'hospital'
  | 'government'
  | 'research'
  | 'enterprise'
  | 'accelerator'
  | 'investor';

// Employee ranges
export type EmployeeRange = 
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1000+';

// System map layers (Anatomy of Infrastructures)
export type SystemLayer = 'purpose' | 'impacts' | 'activities' | 'components';

// Categories for system nodes (IIT ID Anatomy style)
export type SystemNodeCategory = 
  | 'human'
  | 'social'
  | 'cultural'
  | 'financial'
  | 'built'
  | 'data'
  | 'political'
  | 'natural';

// Legacy category type for backwards compatibility
export type SystemCategory = 'health' | 'technology' | 'society' | 'economy' | 'environment';

// Timeline stages (Problem Space style)
export type TimelineStage = 
  | 'foundation'
  | 'digitalization'
  | 'ai-integration'
  | 'acceleration'
  | 'future';

// Stakeholder types for timeline
export type StakeholderType =
  | 'government'
  | 'healthcare'
  | 'tech'
  | 'research'
  | 'startup';

// Timeline event types
export type TimelineEventType = 
  | 'launch'
  | 'funding'
  | 'partnership'
  | 'regulation'
  | 'milestone'
  | 'acquisition';

// Conference/Event types
export type ConferenceType = 'conference' | 'meetup' | 'workshop' | 'demo-day';

// Grant categories
export type GrantCategory = 'research' | 'innovation' | 'startup' | 'clinical' | 'partnership';

// Regulatory guide categories
export type RegulatoryCategory = 'licensing' | 'compliance' | 'setup' | 'relocation';

// Player/Organization in the ecosystem
export interface Player {
  id: string;
  name: LocalizedString;
  type: PlayerType;
  country: string;
  city: string;
  founded: number;
  employees: EmployeeRange;
  funding?: string;
  aiAreas: AIArea[];
  description: LocalizedString;
  logo?: string;
  website?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  // For system map
  systemRole: SystemLayer;
  connections: string[]; // IDs of connected players
  featured?: boolean;
  claim_ids?: string[];
}

// Node in the system map
export interface SystemNode {
  id: string;
  label: LocalizedString;
  layer: SystemLayer;
  category: SystemCategory;
  color: string;
  connections: string[];
  relatedPlayers: string[];
  description: LocalizedString;
  position?: {
    angle: number; // degrees from top
    radius: number; // 0-1 normalized within layer
  };
}

// Timeline event
export interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  title: LocalizedString;
  description: LocalizedString;
  type: TimelineEventType;
  country: string;
  relatedPlayers: string[];
  impact?: 'low' | 'medium' | 'high';
  // Problem Space additions
  stage?: TimelineStage;
  stakeholderType?: StakeholderType;
  hotspotNumber?: number;
}

// Conference/Event
export interface Conference {
  id: string;
  name: LocalizedString;
  date: string;
  endDate?: string;
  location: string;
  type: ConferenceType;
  topics: string[];
  website?: string;
  registrationUrl?: string;
  description?: LocalizedString;
}

// Grant/Funding Opportunity
export interface Grant {
  id: string;
  name: LocalizedString;
  provider: string;
  amount?: string;
  deadline?: string;
  eligibility: LocalizedString;
  applicationUrl?: string;
  category: GrantCategory;
}

// Regulatory Guide Section
export interface RegulatoryGuide {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  emirate?: string;
  category: RegulatoryCategory;
}

// Thought Leader Profile
export interface ThoughtLeaderProfile {
  id: string;
  userId?: string;
  name: string;
  linkedinUrl?: string;
  expertise: string[];
  bio: LocalizedString;
  openForMentorship: boolean;
  avatarUrl?: string;
  // Cloud visualization properties
  category?: 'clinical' | 'investment' | 'policy' | 'tech' | 'research';
  influence?: 'high' | 'medium';
  cloudPosition?: { x: number; y: number };
}

// User-created System Map
export interface UserSystemMap {
  id: string;
  authorId: string;
  title: LocalizedString;
  description: LocalizedString;
  nodes: SystemNode[];
  connections: { from: string; to: string; label?: string }[];
  isPublic: boolean;
  createdAt: Date;
}

// Analysis tool/methodology
export interface Tool {
  id: string;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  steps: ToolStep[];
  examples: ToolExample[];
  icon?: string;
  color: string;
}

export interface ToolStep {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  tips?: LocalizedString[];
}

export interface ToolExample {
  id: string;
  title: LocalizedString;
  context: LocalizedString;
  application: LocalizedString;
  outcome?: LocalizedString;
}

// Country/Region for filtering
export interface Country {
  code: string;
  name: LocalizedString;
  region: 'gulf' | 'mena' | 'asia' | 'europe' | 'americas' | 'africa';
  playersCount?: number;
}

// Stats for display
export interface PlatformStats {
  totalPlayers: number;
  totalCountries: number;
  totalTools: number;
  totalEvents: number;
}

// Chat message for mock AI
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Research Domain (for Directory tabs)
export interface ResearchDomain {
  id: string;
  name: LocalizedString;
  subtitle: LocalizedString;
  color: string;
  stats?: { label: string; value: string }[];
  playerIds: string[]; // empty = show all
}
