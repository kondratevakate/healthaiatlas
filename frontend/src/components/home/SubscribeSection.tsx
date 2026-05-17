import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Bell, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SIGNUP_URL = import.meta.env.VITE_NEWSLETTER_SIGNUP_URL as string | undefined;
const SIGNUP_LIVE = !!SIGNUP_URL;

type PostResult = 'ok' | 'network_error' | 'server_error';

async function postSignup(email: string, source: string, consentAt: string): Promise<PostResult> {
  if (!SIGNUP_URL) return 'server_error';
  try {
    const res = await fetch(SIGNUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source, consent_at: consentAt, consent_version: '1' }),
    });
    return res.ok ? 'ok' : 'server_error';
  } catch {
    return 'network_error';
  }
}

export function SubscribeSection() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only consider the user subscribed if the Worker confirmed it. Local-only
    // markers from old builds are ignored — they were "saved" to a list that
    // never existed.
    setAlreadySubscribed(localStorage.getItem('newsletter_email_confirmed') === '1');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!SIGNUP_LIVE) {
      toast({
        title: language === 'en' ? 'Signup not live yet' : 'النشرة غير متاحة بعد',
        description:
          language === 'en'
            ? "We're not collecting signups yet — the newsletter service isn't connected. Check back soon."
            : 'لا نقوم بجمع الاشتراكات حالياً — خدمة النشرة غير متصلة. عاود الزيارة قريباً.',
      });
      return;
    }

    if (!consent) {
      toast({
        title: language === 'en' ? 'Consent required' : 'الموافقة مطلوبة',
        description:
          language === 'en'
            ? 'Tick the consent box so we can lawfully email you (GDPR Art. 7).'
            : 'يرجى تأكيد الموافقة لنتمكن من مراسلتك بشكل قانوني.',
      });
      return;
    }

    setSubmitting(true);
    const result = await postSignup(email, 'healthaiatlas/home/subscribe', new Date().toISOString());
    setSubmitting(false);

    if (result === 'ok') {
      localStorage.setItem('newsletter_email_confirmed', '1');
      setAlreadySubscribed(true);
      toast({
        title: language === 'en' ? 'Subscribed' : 'تم الاشتراك',
        description:
          language === 'en'
            ? "Thanks — we'll be in touch when the newsletter launches."
            : 'شكراً — سنتواصل معك عند إطلاق النشرة.',
      });
      setEmail('');
      setConsent(false);
      return;
    }

    // Surface the failure. Do not pretend success — CLAUDE.md "no silent failures"
    // and GDPR Art. 7 (we cannot claim to hold consent we never recorded).
    toast({
      title: language === 'en' ? "Couldn't save your email" : 'تعذّر حفظ البريد',
      description:
        result === 'network_error'
          ? language === 'en'
            ? 'Network error reaching the signup service. Check your connection and try again.'
            : 'خطأ في الشبكة. تحقق من اتصالك وحاول مرة أخرى.'
          : language === 'en'
            ? 'The signup service returned an error. Please try again in a moment.'
            : 'استجابت خدمة الاشتراك بخطأ. يرجى المحاولة مرة أخرى بعد قليل.',
    });
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

        {!SIGNUP_LIVE && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {language === 'en'
              ? 'Signup form is not connected yet — submissions are not being stored. The button is here to gauge interest.'
              : 'نموذج الاشتراك غير متصل بعد — لا يتم تخزين الإرسالات. الزر معروض لقياس الاهتمام.'}
          </p>
        )}

        {alreadySubscribed ? (
          <p className="text-sm text-muted-foreground">
            ✓ {language === 'en' ? 'Your email is on the list. We\'ll be in touch.' : 'بريدك مسجّل. سنتواصل معك.'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
            <div className="flex gap-2">
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
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
                aria-label={language === 'en' ? 'Consent to receive the newsletter' : 'الموافقة على تلقي النشرة'}
              />
              <span>
                {language === 'en' ? (
                  <>
                    I agree to receive the HealthAI Atlas newsletter at this email. I can unsubscribe at
                    any time. See the <Link to="/privacy" className="underline">privacy notice</Link>.
                  </>
                ) : (
                  <>
                    أوافق على تلقي نشرة HealthAI Atlas على هذا البريد. يمكنني إلغاء الاشتراك في أي وقت.
                    راجع <Link to="/privacy" className="underline">إشعار الخصوصية</Link>.
                  </>
                )}
              </span>
            </label>
          </form>
        )}
      </div>
    </section>
  );
}
