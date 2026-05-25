import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RedFlag } from '@/types/research';

interface CompactRedFlagItemProps {
  flag: RedFlag;
  onClick?: () => void;
}

export function CompactRedFlagItem({ flag, onClick }: CompactRedFlagItemProps) {
  const { language } = useLanguage();

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'official':
        return 'text-destructive';
      case 'observed':
        return 'text-warning';
      case 'anecdotal':
        return 'text-warning/70';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div 
      className="py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${getEvidenceColor(flag.evidenceLevel)}`} />
        <div className="min-w-0">
          <h4 className="font-medium text-sm leading-tight">
            {language === 'ar' && flag.title.ar ? flag.title.ar : flag.title.en}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {language === 'ar' && flag.pattern.ar ? flag.pattern.ar : flag.pattern.en}
          </p>
        </div>
      </div>
    </div>
  );
}
