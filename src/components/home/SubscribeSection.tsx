import { useState, useEffect } from 'react';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { Button } from '@/civic/components/ui/button';
import { Input } from '@/civic/components/ui/input';
import { ArrowRight, Bell } from 'lucide-react';
import { toast } from '@/civic/hooks/use-toast';

export function SubscribeSection() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    setAlreadySubscribed(!!localStorage.getItem('newsletter_email'));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('newsletter_email', email);
    setAlreadySubscribed(true);
    toast({
      title: language === 'en' ? 'Email saved' : 'ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¨Ø±ÙŠØ¯',
      description: language === 'en' 
        ? "We'll notify you when the newsletter launches." 
        : 'Ø³Ù†ÙØ¹Ù„Ù…Ùƒ Ø¹Ù†Ø¯ Ø¥Ø·Ù„Ø§Ù‚ Ø§Ù„Ù†Ø´Ø±Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠØ©.',
    });
    setEmail('');
  };

  return (
    <section id="subscribe-section" className="py-20 bg-muted/30">
      <div className="container max-w-2xl text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {language === 'en' ? 'Coming Soon' : 'Ù‚Ø±ÙŠØ¨Ø§Ù‹'}
          </span>
        </div>

        <h2 className="heading-display text-3xl md:text-4xl">
          {t('subscribe.title')}
        </h2>

        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {language === 'en' 
            ? 'Newsletter is not live yet. Leave your email and we\'ll let you know when it launches.'
            : 'Ø§Ù„Ù†Ø´Ø±Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠØ© Ù„Ù… ØªÙ†Ø·Ù„Ù‚ Ø¨Ø¹Ø¯. Ø§ØªØ±Ùƒ Ø¨Ø±ÙŠØ¯Ùƒ ÙˆØ³Ù†ÙØ¹Ù„Ù…Ùƒ Ø¹Ù†Ø¯ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚.'}
        </p>

        {alreadySubscribed ? (
          <p className="text-sm text-muted-foreground">
            âœ“ {language === 'en' ? 'Your email is saved. We\'ll be in touch.' : 'ØªÙ… Ø­ÙØ¸ Ø¨Ø±ÙŠØ¯Ùƒ. Ø³Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ.'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t('subscribe.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="group">
              <span className="hidden sm:inline">
                {language === 'en' ? 'Notify me' : 'Ø£Ø¹Ù„Ù…Ù†ÙŠ'}
              </span>
              <ArrowRight className="h-4 w-4 sm:ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

