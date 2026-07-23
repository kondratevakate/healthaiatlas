import React from 'react';
/** @startingPoint section="Components" subtitle="Evidence-tier chip: Official/Observed/Anecdotal/Inference" viewport="700x120" */
export interface EvidenceLabelProps {
  level?: 'official' | 'observed' | 'anecdotal' | 'inference';
  size?: 'sm' | 'md';
}
export declare function EvidenceLabel(props: EvidenceLabelProps): JSX.Element;
