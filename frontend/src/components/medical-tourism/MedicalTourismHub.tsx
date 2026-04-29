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

  // Specialty filter as a horizontal chip strip — same pattern as the tumor
  // filter on Oncology Cancer AI Landscape. Sits inside the HubShell frame
  // (top child slot) so it stays close to the views it filters.
  const specialtyStrip = (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mr-1">
        Specialty:
      </span>
      {SPECIALTIES.map((sp) => (
        <button
          key={sp.id}
          onClick={() => setSpecialty(sp.id)}
          className={cn(
            'px-2 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5',
            specialty === sp.id
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <span aria-hidden="true">{sp.icon}</span>
          <span>{sp.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <HubShell
      domainId="medical-tourism"
      views={[
        { id: 'corridors', label: 'Corridors', render: () => <CorridorsView specialty={specialty} /> },
        { id: 'timeline', label: 'Timeline', render: () => <TimelineView specialty={specialty} /> },
        { id: 'vendors', label: 'Vendors', render: () => <VendorsView /> },
        { id: 'diagnostic', label: 'Self-Assessment ↗', render: () => <DiagnosticView /> },
      ]}
    >
      {specialtyStrip}
    </HubShell>
  );
}
