import { ThoughtLeaderProfile } from '@/types';

// Extended interface with cloud visualization properties
export interface ExtendedLeaderProfile extends ThoughtLeaderProfile {
  category?: 'clinical' | 'investment' | 'policy' | 'tech' | 'research';
  influence?: 'high' | 'medium';
  cloudPosition?: { x: number; y: number };
}

export const mentors: ExtendedLeaderProfile[] = [];
