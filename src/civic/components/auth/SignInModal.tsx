import { useState } from 'react';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { useAuth } from './AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/civic/components/ui/dialog';
import { Button } from '@/civic/components/ui/button';
import { Input } from '@/civic/components/ui/input';
import { Label } from '@/civic/components/ui/label';
import { Separator } from '@/civic/components/ui/separator';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from '@/civic/hooks/use-toast';

// LinkedIn and Google icons as inline SVGs
const LinkedInIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signin') {
      signIn(email);
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.signedInSuccessfully'),
      });
    } else {
      signUp(name, email);
      toast({
        title: t('auth.welcome'),
        description: t('auth.accountCreated'),
      });
    }
    
    onOpenChange(false);
    setEmail('');
    setName('');
  };

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    signIn(`user@${provider}.com`);
    toast({
      title: t('auth.welcomeBack'),
      description: `${t('auth.signedInWith')} ${provider}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">
            {mode === 'signin' ? t('auth.signInTo') : t('auth.createAccount')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI Health Directory
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('auth.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full group">
            <Mail className="h-4 w-4 mr-2" />
            {mode === 'signin' ? t('auth.continueWithEmail') : t('auth.createAccount')}
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            {t('auth.or')}
          </span>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('LinkedIn')}
          >
            <LinkedInIcon />
            <span className="ml-2">{t('auth.continueWithLinkedIn')}</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('Google')}
          >
            <GoogleIcon />
            <span className="ml-2">{t('auth.continueWithGoogle')}</span>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === 'signin' ? (
            <>
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                {t('auth.signUp')}
              </button>
            </>
          ) : (
            <>
              {t('auth.haveAccount')}{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-primary hover:underline font-medium"
              >
                {t('auth.signIn')}
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}

