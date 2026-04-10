'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { categoryConfig, layerConfig, systemNodes, type SystemMapNode } from '@/data/systemNodes';
import { cn } from '@/lib/utils';
import type { SystemLayer, SystemNodeCategory } from '@/types';

const CORAL_ACCENT = 'hsl(14, 90%, 55%)';

function getNodePosition(angle: number, radius: number, centerX: number, centerY: number) {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

function SystemMapDiagram({
  activeCategories,
  hoveredNode,
  nodes,
  onNodeHover,
}: {
  activeCategories: Set<SystemNodeCategory>;
  hoveredNode: SystemMapNode | null;
  nodes: SystemMapNode[];
  onNodeHover: (node: SystemMapNode | null) => void;
}) {
  const { language } = useLanguage();
  const size = 600;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const layers: SystemLayer[] = ['components', 'activities', 'impacts', 'purpose'];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-full w-full max-w-[600px]">
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
              className="text-[10px] font-semibold uppercase tracking-wider"
              fill="hsl(0, 0%, 55%)"
            >
              {config.label[language]}
            </text>
          </g>
        );
      })}

      <AnimatePresence>
        {nodes.map((node) => {
          const layerRadius = layerConfig[node.layer].radius * maxRadius;
          const { x, y } = getNodePosition(node.angle, layerRadius, center, center);
          const isActive = activeCategories.size === 0 || activeCategories.has(node.category);
          const isHovered = hoveredNode?.id === node.id;
          const isFiltered = activeCategories.has(node.category);
          const nodeColor = isHovered || isFiltered ? CORAL_ACCENT : categoryConfig[node.category].color;

          return (
            <motion.g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${node.label[language]}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isActive ? 1 : 0.15,
                scale: isHovered ? 1.3 : 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => onNodeHover(node)}
              onMouseLeave={() => onNodeHover(null)}
              onFocus={() => onNodeHover(node)}
              onBlur={() => onNodeHover(null)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onNodeHover(hoveredNode?.id === node.id ? null : node);
                }
              }}
              className="cursor-pointer"
            >
              <circle
                cx={x}
                cy={y}
                r={node.layer === 'purpose' ? 12 : node.layer === 'impacts' ? 10 : 8}
                fill={nodeColor}
                stroke="white"
                strokeWidth="2"
              />

              {(node.layer === 'purpose' || node.layer === 'impacts' || isHovered) ? (
                <text
                  x={x}
                  y={y + (node.layer === 'purpose' ? 24 : 20)}
                  textAnchor="middle"
                  className={cn(
                    'font-medium',
                    node.layer === 'purpose' ? 'text-[11px]' : 'text-[9px]',
                  )}
                  fill="hsl(0, 0%, 20%)"
                >
                  {node.label[language]}
                </text>
              ) : null}
            </motion.g>
          );
        })}
      </AnimatePresence>

      <circle cx={center} cy={center} r={16} fill={CORAL_ACCENT} stroke="white" strokeWidth="3" />
      <text x={center} y={center + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">
        AI
      </text>
    </svg>
  );
}

function SystemMapLegend({
  activeCategories,
  hoveredNode,
  onCategoryToggle,
}: {
  activeCategories: Set<SystemNodeCategory>;
  hoveredNode: SystemMapNode | null;
  onCategoryToggle: (category: SystemNodeCategory) => void;
}) {
  const { language } = useLanguage();
  const categories = Object.entries(categoryConfig) as [
    SystemNodeCategory,
    (typeof categoryConfig)[SystemNodeCategory],
  ][];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language === 'en' ? 'Categories' : 'Ø§Ù„ÙØ¦Ø§Øª'}
        </h3>
        <div className="space-y-2">
          {categories.map(([category, config]) => {
            const isActive = activeCategories.has(category);

            return (
              <motion.button
                key={category}
                onClick={() => onCategoryToggle(category)}
                className={cn(
                  'flex w-full items-center gap-3 border px-3 py-2 text-left transition-all',
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-foreground/30',
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
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

      {activeCategories.size > 0 ? (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={() => {
            activeCategories.forEach((category) => onCategoryToggle(category));
          }}
          className="w-full border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          {language === 'en' ? 'Clear Filters' : 'Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ±'}
        </motion.button>
      ) : null}

      <AnimatePresence mode="wait">
        {hoveredNode ? (
          <motion.div
            key={hoveredNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border border-border bg-secondary/50 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: CORAL_ACCENT }}
              />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {categoryConfig[hoveredNode.category].label[language]}
              </span>
            </div>
            <h4 className="mb-1 font-semibold">{hoveredNode.label[language]}</h4>
            <p className="text-sm text-muted-foreground">
              {hoveredNode.description[language]}
            </p>
            <div className="mt-2 border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Layer:' : 'Ø§Ù„Ø·Ø¨Ù‚Ø©:'}{' '}
                {layerConfig[hoveredNode.layer].label[language]}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language === 'en' ? 'Layers' : 'Ø§Ù„Ø·Ø¨Ù‚Ø§Øª'}
        </h3>
        <div className="space-y-2">
          {(Object.entries(layerConfig) as [SystemLayer, (typeof layerConfig)[SystemLayer]][]).map(
            ([layer, config]) => (
              <div key={layer} className="flex items-center gap-3 px-3 py-1.5">
                <div className="h-px w-4 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
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

const Maps = () => {
  const { language, t } = useLanguage();
  const [activeCategories, setActiveCategories] = useState<Set<SystemNodeCategory>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<SystemMapNode | null>(null);

  const handleCategoryToggle = (category: SystemNodeCategory) => {
    setActiveCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="container py-16 md:py-24">
      <motion.div
        className="mb-12 max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="heading-display section-marker mb-6">{t('nav.systemMaps')}</h1>
        <p className="text-body text-muted-foreground">
          {language === 'en'
            ? 'Explore the UAE Healthcare AI ecosystem through an interactive anatomy map. Click on categories to filter, then hover or focus nodes to inspect details.'
            : 'Ø§Ø³ØªÙƒØ´Ù Ù…Ù†Ø¸ÙˆÙ…Ø© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø§Ù„ØµØ­ÙŠ ÙÙŠ Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª Ù…Ù† Ø®Ù„Ø§Ù„ Ø®Ø±ÙŠØ·Ø© ØªØ´Ø±ÙŠØ­ÙŠØ© ØªÙØ§Ø¹Ù„ÙŠØ©. Ø§Ù†Ù‚Ø± Ø¹Ù„Ù‰ Ø§Ù„ÙØ¦Ø§Øª Ù„Ù„ØªØµÙÙŠØ©ØŒ ÙˆÙ…Ø±Ø± Ø§Ù„Ù…Ø§ÙˆØ³ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ù‚Ø¯ Ù„Ø±Ø¤ÙŠØ© Ø§Ù„ØªÙØ§ØµÙŠÙ„.'}
        </p>
      </motion.div>

      <motion.div
        className="grid gap-8 lg:grid-cols-[1fr_280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex min-h-[600px] items-center justify-center border border-border bg-background p-8 lg:p-12">
          <SystemMapDiagram
            activeCategories={activeCategories}
            hoveredNode={hoveredNode}
            nodes={systemNodes}
            onNodeHover={setHoveredNode}
          />
        </div>

        <div className="h-fit border border-border bg-background p-6 lg:sticky lg:top-24">
          <SystemMapLegend
            activeCategories={activeCategories}
            hoveredNode={hoveredNode}
            onCategoryToggle={handleCategoryToggle}
          />
        </div>
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {(Object.entries(layerConfig) as [SystemLayer, (typeof layerConfig)[SystemLayer]][]).map(
          ([layer, config]) => {
            const count = systemNodes.filter((node) => node.layer === layer).length;
            return (
              <div key={layer} className="border border-border bg-background p-5">
                <div className="mb-1 text-3xl font-bold text-foreground">{count}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {config.label[language]}
                </div>
              </div>
            );
          },
        )}
      </motion.div>
    </div>
  );
};

export default Maps;
