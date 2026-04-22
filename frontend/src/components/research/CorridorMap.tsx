import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const filters = ['All', 'Oncology', 'Cosmetic', 'Fertility', 'Cardiac', 'Orthopedic'] as const;

interface FlowNode {
  id: string;
  label: string;
  volume: number; // 1-10 scale
}

interface FlowLink {
  source: string;
  target: string;
  volume: number;
  category?: string;
}

const sourceRegions: FlowNode[] = [
  { id: 'gcc', label: 'GCC', volume: 9 },
  { id: 'africa', label: 'Africa', volume: 7 },
  { id: 'cis', label: 'CIS', volume: 6 },
  { id: 'europe', label: 'Europe', volume: 5 },
  { id: 'south-asia', label: 'South Asia', volume: 8 },
  { id: 'uk', label: 'UK', volume: 4 },
];

const destinations: FlowNode[] = [
  { id: 'dubai', label: 'Dubai', volume: 10 },
  { id: 'abu-dhabi', label: 'Abu Dhabi', volume: 8 },
  { id: 'india', label: 'India', volume: 6 },
  { id: 'thailand', label: 'Thailand', volume: 5 },
  { id: 'turkey', label: 'Turkey', volume: 7 },
  { id: 's-korea', label: 'S. Korea', volume: 4 },
];

const links: FlowLink[] = [
  { source: 'gcc', target: 'dubai', volume: 8, category: 'All' },
  { source: 'gcc', target: 'abu-dhabi', volume: 6, category: 'All' },
  { source: 'africa', target: 'dubai', volume: 5, category: 'Oncology' },
  { source: 'africa', target: 'india', volume: 4, category: 'Cardiac' },
  { source: 'cis', target: 'dubai', volume: 5, category: 'Cosmetic' },
  { source: 'cis', target: 'turkey', volume: 4, category: 'All' },
  { source: 'europe', target: 'dubai', volume: 3, category: 'Fertility' },
  { source: 'europe', target: 'abu-dhabi', volume: 3, category: 'Orthopedic' },
  { source: 'south-asia', target: 'dubai', volume: 7, category: 'All' },
  { source: 'south-asia', target: 'thailand', volume: 4, category: 'Cardiac' },
  { source: 'south-asia', target: 'abu-dhabi', volume: 5, category: 'All' },
  { source: 'uk', target: 'dubai', volume: 3, category: 'Cosmetic' },
  { source: 'uk', target: 's-korea', volume: 2, category: 'Cosmetic' },
];

const SVG_W = 600;
const SVG_H = 400;
const LEFT_X = 80;
const RIGHT_X = 520;
const NODE_GAP = 56;
const TOP_Y = 40;

function getY(index: number) {
  return TOP_Y + index * NODE_GAP;
}

export function CorridorMap() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredLinks = activeFilter === 'All'
    ? links
    : links.filter(l => l.category === activeFilter || l.category === 'All');

  const sourceMap = Object.fromEntries(sourceRegions.map((s, i) => [s.id, i]));
  const targetMap = Object.fromEntries(destinations.map((d, i) => [d.id, i]));

  return (
    <div className="w-full">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <Badge
            key={f}
            className={cn(
              "cursor-pointer rounded-none px-3 py-1.5 text-xs font-medium transition-all",
              activeFilter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground border border-border hover:bg-accent'
            )}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto overflow-visible">
        {/* Flow lines */}
        {filteredLinks.map((link, i) => {
          const sIdx = sourceMap[link.source];
          const tIdx = targetMap[link.target];
          if (sIdx === undefined || tIdx === undefined) return null;
          const sy = getY(sIdx);
          const ty = getY(tIdx);
          const thickness = Math.max(1, link.volume * 0.8);

          return (
            <motion.path
              key={`${link.source}-${link.target}-${i}`}
              d={`M ${LEFT_X + 40} ${sy} C ${LEFT_X + 160} ${sy}, ${RIGHT_X - 160} ${ty}, ${RIGHT_X - 40} ${ty}`}
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth={thickness}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
            />
          );
        })}

        {/* Source nodes (left) */}
        {sourceRegions.map((node, i) => {
          const y = getY(i);
          const r = 4 + node.volume * 1.5;
          const hasActive = filteredLinks.some(l => l.source === node.id);

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: hasActive ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
            >
              <circle
                cx={LEFT_X}
                cy={y}
                r={r}
                fill={`hsl(var(--primary) / ${hasActive ? 0.15 : 0.05})`}
                stroke={`hsl(var(--primary) / ${hasActive ? 0.6 : 0.2})`}
                strokeWidth="1"
              />
              <text
                x={LEFT_X - r - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="font-medium"
                style={{ fontSize: '11px', fill: hasActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)' }}
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}

        {/* Destination nodes (right) */}
        {destinations.map((node, i) => {
          const y = getY(i);
          const r = 4 + node.volume * 1.5;
          const hasActive = filteredLinks.some(l => l.target === node.id);
          const isUAE = node.id === 'dubai' || node.id === 'abu-dhabi';

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: hasActive ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
            >
              <circle
                cx={RIGHT_X}
                cy={y}
                r={r}
                fill={`hsl(${isUAE ? 'var(--primary)' : 'var(--accent)'} / ${hasActive ? 0.2 : 0.05})`}
                stroke={`hsl(${isUAE ? 'var(--primary)' : 'var(--accent)'} / ${hasActive ? 0.7 : 0.2})`}
                strokeWidth={isUAE ? '1.5' : '1'}
              />
              <text
                x={RIGHT_X + r + 8}
                y={y}
                textAnchor="start"
                dominantBaseline="middle"
                className="font-medium"
                style={{ fontSize: '11px', fill: hasActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)' }}
              >
                {node.label}
              </text>
            </motion.g>
          );
        })}

        {/* Column headers */}
        <text x={LEFT_X} y={14} textAnchor="middle" className="font-semibold" style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}>
          Source Regions
        </text>
        <text x={RIGHT_X} y={14} textAnchor="middle" className="font-semibold" style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}>
          Destinations
        </text>
      </svg>
    </div>
  );
}
