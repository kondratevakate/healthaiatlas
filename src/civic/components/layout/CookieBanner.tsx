import { useState, useEffect } from 'react';
import { Button } from '@/civic/components/ui/button';
import { Cookie, X } from 'lucide-react';

export function CookieBanner() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    setAccepted(consent === 'true');
  }, []);

  if (accepted) return null;

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-background border border-border rounded-lg p-3 z-50 shadow-lg max-w-xs">
      <div className="flex items-center gap-3">
        <Cookie className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">We use cookies to improve your experience.</p>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs flex-shrink-0" onClick={handleAccept}>
          Accept
        </Button>
        <button onClick={handleAccept} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

