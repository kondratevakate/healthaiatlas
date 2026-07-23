import React from 'react';
/** @startingPoint section="Components" subtitle="Status pill + uppercase tag label" viewport="700x180" */
export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
export interface TagProps { filled?: boolean; children?: React.ReactNode; }
export declare function Tag(props: TagProps): JSX.Element;
