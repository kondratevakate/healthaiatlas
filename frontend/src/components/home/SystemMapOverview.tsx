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

interface DiagramProps {
  nodes: SystemMapNode[];
  activeCategories: Set<SystemNodeCategory>;
  onNodeHover: (node: SystemMapNode | null) => void;
  hoveredNode: SystemMapNode | null;
}

function Diagram({ nodes, activeCategories, onNodeHover, hoveredNode }: DiagramProps) {
  const { language } = useLanguage();
  const size = 600;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const layers: SystemLayer[] = ['components', 'activities', 'impacts', 'purpose'];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full max-w-[600px] mx-auto"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
    >
      {/* Layer rings + labels */}
      {layers.map((layer) => {
        const config = layerConfig[layer];
        const radius = config.radius * maxRadius;
        return (
          <g key={layer}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="hsl(0, 0%, 85%)"
              strokeWidth="1"
              strokeDasharray={layer === 'purpose' ? '0' : '4 4'}
            />
            <text
              x={center + radius - 10}
              y={center - radius + 20}
              fontSize="11"
              fontWeight="600"
              letterSpacing="1.5"
              fill="hsl(0, 0%, 45%)"
            >
              {config.label[language]}
            </text>
          </g>
        );
      })}

      {/* Nodes — static render; no scroll-induced re-animation */}
      {nodes.map((node) => {
        const layerRadius = layerConfig[node.layer].radius * maxRadius;
        const { x, y } = getNodePosition(node.angle, layerRadius, center, center);
        const isActive = activeCategories.size === 0 || activeCategories.has(node.category);
        const isHovered = hoveredNode?.id === node.id;
        const isFiltered = activeCategories.has(node.category);
        const nodeColor = isHovered || isFiltered ? CORAL_ACCENT : categoryConfig[node.category].color;
        const nodeRadius = node.layer === 'purpose' ? 12 : node.layer === 'impacts' ? 10 : 8;
        const showLabel = node.layer === 'purpose' || node.layer === 'impacts' || isHovered;

        return (
          <g
            key={node.id}
            onMouseEnter={() => onNodeHover(node)}
            onMouseLeave={() => onNodeHover(null)}
            className="cursor-pointer"
            style={{ opacity: isActive ? 1 : 0.15, transition: 'opacity 200ms ease' }}
          >
            <circle cx={x} cy={y} r={nodeRadius} fill={nodeColor} stroke="white" strokeWidth="2" />
            {showLabel && (
              <text
                x={x}
                y={y + (node.layer === 'purpose' ? 24 : 20)}
                textAnchor="middle"
                fontSize={node.layer === 'purpose' ? 12 : 10}
                fontWeight="500"
                fill="hsl(0, 0%, 20%)"
              >
                {node.label[language]}
              </text>
            )}
          </g>
        );
      })}

      {/* Center emblem */}
      <circle cx={center} cy={center} r={16} fill={CORAL_ACCENT} stroke="white" strokeWidth="3" />
      <text
        x={center}
        y={center + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="700"
        fill="white"
      >
        AI
      </text>
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

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {language === 'en' ? 'Layers' : 'الطبقات'}
        </h3>
        <div className="space-y-2">
          {(Object.entries(layerConfig) as [SystemLayer, (typeof layerConfig)[SystemLayer]][]).map(
            ([layer, config]) => (
              <div key={layer} className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-4 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {config.label[language]}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export function SystemMapOverview() {
  const { language } = useLanguage();
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

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(layerConfig) as [SystemLayer, (typeof layerConfig)[SystemLayer]][]).map(
          ([layer, config]) => {
            const count = systemNodes.filter((n) => n.layer === layer).length;
            return (
              <div key={layer} className="border border-border bg-background p-5">
                <div className="text-3xl font-bold text-foreground mb-1">{count}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {config.label[language]}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
