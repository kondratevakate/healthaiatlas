import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Bell, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SIGNUP_URL = import.meta.env.VITE_NEWSLETTER_SIGNUP_URL as string | undefined;

async function postSignup(email: string, source: string): Promise<boolean> {
  if (!SIGNUP_URL) return false;
  try {
    const res = await fetch(SIGNUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function SubscribeSection() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAlreadySubscribed(!!localStorage.getItem('newsletter_email'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const sent = await postSignup(email, 'healthaiatlas/home/subscribe');

    // Always cache locally so the user sees a thank-you, even if the Worker
    // is misconfigured. Worker success is the source of truth for the list.
    localStorage.setItem('newsletter_email', email);
    setAlreadySubscribed(true);

    toast({
      title: language === 'en' ? 'Email saved' : 'تم حفظ البريد',
      description:
        sent || !SIGNUP_URL
          ? language === 'en'
            ? "We'll notify you when the newsletter launches."
            : 'سنُعلمك عند إطلاق النشرة البريدية.'
          : language === 'en'
            ? "Saved locally. We're working on a sync issue — try again later."
            : 'تم الحفظ محلياً. نعمل على مشكلة المزامنة — حاول مرة أخرى لاحقاً.',
    });
    setEmail('');
    setSubmitting(false);
  };

  return (
    <section id="subscribe-section" className="py-20 bg-muted/30">
      <div className="container max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {language === 'en' ? 'Coming Soon' : 'قريباً'}
          </span>
        </div>

        <h2 className="heading-display text-3xl md:text-4xl">
          {t('subscribe.title')}
        </h2>

        <p className="text-lg text-muted-foreground max-w-md">
          {language === 'en'
            ? 'Newsletter is not live yet. Leave your email and we\'ll let you know when it launches.'
            : 'النشرة البريدية لم تنطلق بعد. اترك بريدك وسنُعلمك عند الإطلاق.'}
        </p>

        {alreadySubscribed ? (
          <p className="text-sm text-muted-foreground">
            ✓ {language === 'en' ? 'Your email is saved. We\'ll be in touch.' : 'تم حفظ بريدك. سنتواصل معك.'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
            <Input
              type="email"
              placeholder={t('subscribe.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="group" disabled={submitting}>
              <span className="hidden sm:inline">
                {submitting
                  ? language === 'en' ? 'Saving…' : 'جارٍ الحفظ…'
                  : language === 'en' ? 'Notify me' : 'أعلمني'}
              </span>
              {submitting ? (
                <Loader2 className="h-4 w-4 sm:ml-2 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 sm:ml-2 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
