import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, eyebrow, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-10', className)}>
      {eyebrow && (
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-3">
          {eyebrow}
        </div>
      )}
      <h1 className="heading-display section-marker mb-3">{title}</h1>
      {subtitle && <div className="text-body text-muted-foreground max-w-2xl">{subtitle}</div>}
    </div>
  );
}
