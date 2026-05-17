import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';

// Cookie consent — GDPR Art. 7 + ePrivacy Art. 5(3).
//
// Storage key holds one of: 'granted' | 'denied' | null (no decision yet).
// The Consent Mode v2 default in index.html starts as 'denied' for every
// signal; we only flip analytics_storage to 'granted' after an explicit click.
// The old key value 'true' is treated as 'granted' for backward compatibility,
// but new writes use 'granted' / 'denied' so the banner state matches Consent
// Mode v2 vocabulary 1-to-1.

type Consent = 'granted' | 'denied' | null;

const STORAGE_KEY = 'cookie-consent';

function readConsent(): Consent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'granted' || raw === 'true') return 'granted';
    if (raw === 'denied') return 'denied';
    return null;
  } catch {
    return null;
  }
}

function updateGtagConsent(decision: 'granted' | 'denied') {
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== 'function') return;
  g('consent', 'update', {
    analytics_storage: decision,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

export function CookieBanner() {
  // Start `null` — banner is hidden until we read localStorage in the effect.
  // SSR-safe (typeof window check in readConsent).
  const [decision, setDecision] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDecision(readConsent());
    setHydrated(true);
  }, []);

  if (!hydrated || decision !== null) return null;

  const persist = (next: 'granted' | 'denied') => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private mode, quota). Banner just
      // re-appears next visit — that's GDPR-safe behavior (no implicit consent).
    }
    updateGtagConsent(next);
    setDecision(next);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-background border border-border rounded-lg p-4 z-50 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <Cookie className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <p className="text-xs text-muted-foreground">
            We use a single analytics cookie (Google Analytics, IP-anonymised) to count visits.
            Nothing is loaded until you choose.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => persist('granted')} className="h-7 px-3 text-xs">
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => persist('denied')}
              className="h-7 px-3 text-xs"
            >
              Reject
            </Button>
          </div>
        </div>
        <button
          onClick={() => persist('denied')}
          aria-label="Close — treat as reject"
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
