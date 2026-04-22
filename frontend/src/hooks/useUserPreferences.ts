// User Preferences Hook
// Manages localStorage tracking for retention loop

import { useState, useEffect, useCallback } from 'react';
import { PathRole, UserFollowPreferences } from '@/types/research';

const STORAGE_KEY = 'ai-health-navigator-preferences';

const defaultPreferences: UserFollowPreferences = {
  followedPaths: [],
  lastVisit: new Date(),
  savedAssessments: [],
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserFollowPreferences>(defaultPreferences);
  const [previousVisit, setPreviousVisit] = useState<Date | null>(null);

  // Load preferences on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const prefs: UserFollowPreferences = {
          ...parsed,
          lastVisit: new Date(parsed.lastVisit),
        };
        setPreviousVisit(prefs.lastVisit);
        setPreferences(prefs);
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }
    
    // Update last visit timestamp
    const now = new Date();
    setPreferences(prev => {
      const updated = { ...prev, lastVisit: now };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const followPath = useCallback((path: PathRole) => {
    setPreferences(prev => {
      if (prev.followedPaths.includes(path)) return prev;
      const updated = {
        ...prev,
        followedPaths: [...prev.followedPaths, path],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unfollowPath = useCallback((path: PathRole) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        followedPaths: prev.followedPaths.filter(p => p !== path),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFollowing = useCallback((path: PathRole) => {
    return preferences.followedPaths.includes(path);
  }, [preferences.followedPaths]);

  const saveAssessment = useCallback((shareId: string) => {
    setPreferences(prev => {
      if (prev.savedAssessments.includes(shareId)) return prev;
      const updated = {
        ...prev,
        savedAssessments: [...prev.savedAssessments, shareId],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeAssessment = useCallback((shareId: string) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        savedAssessments: prev.savedAssessments.filter(id => id !== shareId),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    preferences,
    previousVisit,
    followPath,
    unfollowPath,
    isFollowing,
    saveAssessment,
    removeAssessment,
  };
}
