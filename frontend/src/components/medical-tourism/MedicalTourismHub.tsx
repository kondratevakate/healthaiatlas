import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HubShell } from '@/components/shared/HubShell';
import { SPECIALTIES } from '@/data/medicalTourism';
import { CorridorsView } from './CorridorsView';
import { TimelineView } from './TimelineView';
import { VendorsView } from './VendorsView';
import { DiagnosticView } from './DiagnosticView';

export function MedicalTourismHub() {
  const [specialty, setSpecialty] = useState<string>('all');

  // Specialty filter rendered inside HubShell as a right rail.
  const specialtyRail = (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-3">
        Specialty
      </div>
      <div className="flex lg:flex-col gap-1 flex-wrap">
        {SPECIALTIES.map((sp) => (
          <button
            key={sp.id}
            onClick={() => setSpecialty(sp.id)}
            className={cn(
              'inline-flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium border transition-colors text-left',
              'lg:w-full',
              specialty === sp.id
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground bg-background',
            )}
          >
            <span>{sp.label}</span>
            <span
              className={cn(
                'text-[10px] font-mono',
                specialty === sp.id ? 'text-background/70' : 'text-muted-foreground/60',
              )}
            >
              {sp.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <HubShell
      domainId="medical-tourism"
      rightSidebar={specialtyRail}
      views={[
        { id: 'corridors', label: 'Corridors', render: () => <CorridorsView specialty={specialty} /> },
        { id: 'timeline', label: 'Timeline', render: () => <TimelineView specialty={specialty} /> },
        { id: 'vendors', label: 'Vendors', render: () => <VendorsView /> },
        { id: 'diagnostic', label: 'Self-Assessment ↗', render: () => <DiagnosticView /> },
      ]}
    />
  );
}
