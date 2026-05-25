// System Map — concentric four-layer view of the healthcare AI ecosystem.
//
// Visual hierarchy choices:
//
// - Layer rings carry different stroke styles (solid → long-dash → short-dash
//   → dotted, outer to inner) so they don't all read as identical "dashed".
// - Layer labels sit at the start of each ring and have differentiated
//   typography by depth (bigger / bolder closer to the centre, smaller and
//   sparser at the outer COMPONENTS ring) so the reader gets a sense of
//   relative importance at a glance.
// - Node radius now depends on BOTH layer (purpose biggest, components
//   smallest) AND a per-node weight derived from where it sits in the file
//   (first node in a layer gets a slight boost) so circles aren't all the
//   same diameter. The weight is intentionally subtle — this is a directory
//   diagram, not a sized bubble chart.
// - Nodes gently pulse with framer-motion on mount, scale on hover, and have
//   a coral ring that grows on hover/focus to make "this is clickable" obvious.
// - Domain pins (optional) overlay the activities band with bigger coral
//   bubbles and a hover-scale animation that pulls the eye toward "click me
//   to open a hub".
// - Bottom layer-count summary cards are gone — they were visually equivalent
//   to each other and added no information beyond what the ring labels show.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { systemNodes, categoryConfig, layerConfig, SystemMapNode } from '@/data/systemNodes';
import { SystemNodeCategory, SystemLayer } from '@/types';
import { cn } from '@/lib/utils';

const CORAL_ACCENT = 'hsl(14, 90%, 55%)';

function getNodePosition(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export interface DomainPin {
  id: string;
  label: string;
  angle: number; // degrees from top
}

// Distinct stroke profiles per ring so each layer reads differently.
const layerStroke: Record<SystemLayer, { dash: string; width: number; color: string }> = {
  purpose:    { dash: '0',     width: 2.0, color: 'hsl(0, 0%, 70%)' },
  impacts:    { dash: '8 4',   width: 1.5, color: 'hsl(0, 0%, 80%)' },
  activities: { dash: '4 4',   width: 1.2, color: 'hsl(0, 0%, 85%)' },
  components: { dash: '1 4',   width: 1.0, color: 'hsl(0, 0%, 88%)' },
};

// Typography weight per layer so the ring labels themselves differentiate.
const layerLabel: Record<SystemLayer, { fontSize: number; weight: number; letter: number }> = {
  purpose:    { fontSize: 13, weight: 800, letter: 3 },
  impacts:    { fontSize: 12, weight: 700, letter: 2.5 },
  activities: { fontSize: 11, weight: 600, letter: 2 },
  components: { fontSize: 10, weight: 500, letter: 1.5 },
};

// Base node radius per layer + slight per-node nudge so two adjacent circles
// aren't identical. Outer ring stays smallest so labels for the busy
// COMPONENTS band remain readable.
const layerBaseRadius: Record<SystemLayer, number> = {
  purpose: 16,
  impacts: 12,
  activities: 9,
  components: 7,
};

function nodeWeight(index: number, total: number): number {
  // Subtle 0.8–1.2 multiplier driven by angular position — keeps adjacent
  // bubbles varied without implying a real quantity. Anchors so the first
  // node in each ring reads slightly larger.
  return 0.85 + 0.3 * (1 - index / total);
}

const DOMAIN_RING_RADIUS = 0.725;
const DOMAIN_PIN_R = 16;

interface DiagramProps {
  nodes: SystemMapNode[];
  activeCategories: Set<SystemNodeCategory>;
  onNodeHover: (node: SystemMapNode | null) => void;
  hoveredNode: SystemMapNode | null;
  domainPins?: DomainPin[];
  onDomainClick?: (id: string) => void;
}

function Diagram({
  nodes,
  activeCategories,
  onNodeHover,
  hoveredNode,
  domainPins,
  onDomainClick,
}: DiagramProps) {
  const { language } = useLanguage();
  const size = 640;
  const center = size / 2;
  const maxRadius = size / 2 - 50;
  const layers: SystemLayer[] = ['components', 'activities', 'impacts', 'purpose'];

  // Group nodes by layer to compute per-layer indices for the weight nudge.
  const byLayer: Record<SystemLayer, SystemMapNode[]> = {
    purpose: [],
    impacts: [],
    activities: [],
    components: [],
  };
  nodes.forEach((n) => byLayer[n.layer].push(n));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full max-w-[640px] mx-auto"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
    >
      {/* Layer rings + labels — each layer styled distinctly */}
      {layers.map((layer) => {
        const config = layerConfig[layer];
        const stroke = layerStroke[layer];
        const lbl = layerLabel[layer];
        const radius = config.radius * maxRadius;
        return (
          <g key={layer}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeDasharray={stroke.dash}
            />
            {/* Layer label sits on the top of each ring */}
            <text
              x={center}
              y={center - radius - 6}
              textAnchor="middle"
              fontSize={lbl.fontSize}
              fontWeight={lbl.weight}
              letterSpacing={lbl.letter}
              fill="hsl(0, 0%, 35%)"
            >
              {config.label[language]}
            </text>
          </g>
        );
      })}

      {/* Domain pins — clickable entry points to Directory hubs.
          Drawn early so systemNodes can layer over edges. */}
      {domainPins?.map((pin, i) => {
        const pinRadius = DOMAIN_RING_RADIUS * maxRadius;
        const { x, y } = getNodePosition(pin.angle, pinRadius, center, center);
        return (
          <motion.g
            key={`domain-${pin.id}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.4 + i * 0.08 }}
            onClick={() => onDomainClick?.(pin.id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer', transformOrigin: `${x}px ${y}px` }}
          >
            {/* Pulse halo */}
            <motion.circle
              cx={x}
              cy={y}
              r={DOMAIN_PIN_R}
              fill={CORAL_ACCENT}
              opacity={0.18}
              animate={{ r: [DOMAIN_PIN_R, DOMAIN_PIN_R + 6, DOMAIN_PIN_R] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
            />
            <circle cx={x} cy={y} r={DOMAIN_PIN_R} fill="white" stroke={CORAL_ACCENT} strokeWidth="2.5" />
            <circle cx={x} cy={y} r={DOMAIN_PIN_R - 6} fill={CORAL_ACCENT} />
            <text
              x={x}
              y={y + DOMAIN_PIN_R + 14}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="hsl(0, 0%, 15%)"
            >
              {pin.label}
            </text>
          </motion.g>
        );
      })}

      {/* Nodes — animated mount, varied per-node radius, hover scale */}
      {nodes.map((node) => {
        const layerNodes = byLayer[node.layer];
        const idxInLayer = layerNodes.indexOf(node);
        const w = nodeWeight(idxInLayer, layerNodes.length);
        const baseR = layerBaseRadius[node.layer];
        const r = baseR * w;

        const layerRadius = layerConfig[node.layer].radius * maxRadius;
        const { x, y } = getNodePosition(node.angle, layerRadius, center, center);
        const isActive = activeCategories.size === 0 || activeCategories.has(node.category);
        const isHovered = hoveredNode?.id === node.id;
        const isFiltered = activeCategories.has(node.category);
        const nodeColor = isHovered || isFiltered ? CORAL_ACCENT : categoryConfig[node.category].color;
        const showLabel = node.layer === 'purpose' || node.layer === 'impacts' || isHovered;

        return (
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: isActive ? 1 : 0.18 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.05 * idxInLayer }}
            onMouseEnter={() => onNodeHover(node)}
            onMouseLeave={() => onNodeHover(null)}
            onFocus={() => onNodeHover(node)}
            onBlur={() => onNodeHover(null)}
            tabIndex={0}
            role="button"
            aria-label={`${node.label[language]} — ${categoryConfig[node.category].label[language]} · ${layerConfig[node.layer].label[language]}`}
            whileHover={{ scale: 1.18 }}
            whileTap={{ scale: 0.92 }}
            style={{
              cursor: 'pointer',
              outline: 'none',
              transformOrigin: `${x}px ${y}px`,
            }}
          >
            {/* Hover ring — broad coral halo that signals interactivity */}
            {(isHovered || isFiltered) && (
              <motion.circle
                cx={x}
                cy={y}
                r={r + 6}
                fill="none"
                stroke={CORAL_ACCENT}
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={nodeColor}
              stroke="white"
              strokeWidth={node.layer === 'purpose' ? 2.5 : 2}
            />
            {showLabel && (
              <text
                x={x}
                y={y + r + (node.layer === 'purpose' ? 18 : 14)}
                textAnchor="middle"
                fontSize={node.layer === 'purpose' ? 12 : 10}
                fontWeight={node.layer === 'purpose' ? 700 : 500}
                fill="hsl(0, 0%, 18%)"
              >
                {node.label[language]}
              </text>
            )}
          </motion.g>
        );
      })}

      {/* Center emblem — the AI core */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
      >
        <motion.circle
          cx={center}
          cy={center}
          r={20}
          fill={CORAL_ACCENT}
          opacity={0.2}
          animate={{ r: [20, 26, 20] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx={center} cy={center} r={18} fill={CORAL_ACCENT} stroke="white" strokeWidth="3" />
        <text
          x={center}
          y={center + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="800"
          fill="white"
        >
          AI
        </text>
      </motion.g>
    </svg>
  );
}

interface LegendProps {
  activeCategories: Set<SystemNodeCategory>;
  onCategoryToggle: (category: SystemNodeCategory) => void;
  hoveredNode: SystemMapNode | null;
}

function Legend({ activeCategories, onCategoryToggle, hoveredNode }: LegendProps) {
  const { language } = useLanguage();
  const categories = Object.entries(categoryConfig) as [
    SystemNodeCategory,
    (typeof categoryConfig)[SystemNodeCategory],
  ][];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {language === 'en' ? 'Categories' : 'الفئات'}
        </h3>
        <div className="space-y-2">
          {categories.map(([category, config]) => {
            const isActive = activeCategories.has(category);
            return (
              <motion.button
                key={category}
                onClick={() => onCategoryToggle(category)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 text-left transition-all border',
                  isActive
                    ? 'bg-primary/5 border-primary'
                    : 'bg-background border-border hover:border-foreground/30',
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? CORAL_ACCENT : config.color }}
                />
                <span className={cn('text-sm font-medium', isActive && 'text-primary')}>
                  {config.label[language]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {activeCategories.size > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => activeCategories.forEach((cat) => onCategoryToggle(cat))}
          className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground transition-colors"
        >
          {language === 'en' ? 'Clear filters' : 'مسح الفلاتر'}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {hoveredNode && (
          <motion.div
            key={hoveredNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-secondary/50 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CORAL_ACCENT }} />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {categoryConfig[hoveredNode.category].label[language]}
              </span>
            </div>
            <h4 className="font-semibold mb-1">{hoveredNode.label[language]}</h4>
            <p className="text-sm text-muted-foreground">{hoveredNode.description[language]}</p>
            <div className="mt-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Layer:' : 'الطبقة:'}{' '}
                {layerConfig[hoveredNode.layer].label[language]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer key — small typographic ladder showing the ring stack */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {language === 'en' ? 'Layers (inner → outer)' : 'الطبقات (من الداخل إلى الخارج)'}
        </h3>
        <div className="space-y-1.5">
          {(['purpose', 'impacts', 'activities', 'components'] as SystemLayer[]).map((layer) => {
            const config = layerConfig[layer];
            const lbl = layerLabel[layer];
            const stroke = layerStroke[layer];
            return (
              <div key={layer} className="flex items-center gap-2 text-muted-foreground">
                <svg width="28" height="10" viewBox="0 0 28 10">
                  <line
                    x1="0"
                    y1="5"
                    x2="28"
                    y2="5"
                    stroke={stroke.color}
                    strokeWidth={stroke.width}
                    strokeDasharray={stroke.dash}
                  />
                </svg>
                <span
                  style={{
                    fontSize: `${Math.max(10, lbl.fontSize - 2)}px`,
                    fontWeight: lbl.weight - 100,
                    letterSpacing: `${lbl.letter}px`,
                  }}
                >
                  {config.label[language]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface SystemMapOverviewProps {
  domainPins?: DomainPin[];
  onDomainClick?: (id: string) => void;
}

export function SystemMapOverview({ domainPins, onDomainClick }: SystemMapOverviewProps = {}) {
  const [activeCategories, setActiveCategories] = useState<Set<SystemNodeCategory>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<SystemMapNode | null>(null);

  const toggleCategory = (category: SystemNodeCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div>
      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="border border-border bg-background p-8 lg:p-12 flex justify-center">
          <Diagram
            nodes={systemNodes}
            activeCategories={activeCategories}
            onNodeHover={setHoveredNode}
            hoveredNode={hoveredNode}
            domainPins={domainPins}
            onDomainClick={onDomainClick}
          />
        </div>

        <div className="border border-border bg-background p-6 lg:sticky lg:top-24">
          <Legend
            activeCategories={activeCategories}
            onCategoryToggle={toggleCategory}
            hoveredNode={hoveredNode}
          />
        </div>
      </div>

      {domainPins && domainPins.length > 0 && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="inline-block w-3 h-3 rounded-full border-2"
            style={{ borderColor: CORAL_ACCENT, backgroundColor: 'white' }}
          />
          <span>
            Coral pins are directory entry points — click to open a domain hub.
          </span>
        </div>
      )}
    </div>
  );
}
