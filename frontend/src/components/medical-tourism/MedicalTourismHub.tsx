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

  return (
    <HubShell
      domainId="medical-tourism"
      views={[
        { id: 'corridors', label: 'Corridors', render: () => <CorridorsView specialty={specialty} /> },
        { id: 'timeline', label: 'Timeline', render: () => <TimelineView specialty={specialty} /> },
        { id: 'vendors', label: 'Vendors', render: () => <VendorsView /> },
        { id: 'diagnostic', label: 'Diagnostic', render: () => <DiagnosticView /> },
      ]}
    >
      {/* Specialty filter (was part of the old header, now a child slot above tabs) */}
      <div className="flex flex-wrap gap-1">
        {SPECIALTIES.map((sp) => (
          <button
            key={sp.id}
            onClick={() => setSpecialty(sp.id)}
            className={cn(
              'inline-flex items-center px-2.5 py-1 text-[11px] font-mono border transition-colors',
              specialty === sp.id
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {sp.label}
          </button>
        ))}
      </div>
    </HubShell>
  );
}
