import React from 'react';
/** @startingPoint section="Components" subtitle="Flat 1px-border surface, no shadow by default" viewport="700x200" */
export interface CardProps {
  interactive?: boolean;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
export declare function CardHeader(props: { children?: React.ReactNode }): JSX.Element;
export declare function CardContent(props: { children?: React.ReactNode }): JSX.Element;
