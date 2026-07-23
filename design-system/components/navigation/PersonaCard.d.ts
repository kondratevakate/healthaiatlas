import React from 'react';
/** @startingPoint section="Components" subtitle="Segment-picker card: icon, title, copy, arrow" viewport="700x220" */
export interface PersonaCardProps {
  title: string;
  description: string;
  persona?: 'patient' | 'doctor' | 'business' | 'startup' | 'leader';
}
export declare function PersonaCard(props: PersonaCardProps): JSX.Element;
