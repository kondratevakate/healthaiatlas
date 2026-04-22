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
    <div className={cn('mb-12', className)}>
      <div className="w-12 h-px bg-primary mb-6" />
      {eyebrow && (
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-3">
          {eyebrow}
        </div>
      )}
      <h1 className="heading-serif mb-4">{title}</h1>
      {subtitle && <div className="text-body text-muted-foreground">{subtitle}</div>}
    </div>
  );
}
