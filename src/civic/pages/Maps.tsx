import { Layout } from '@/civic/components/layout';
import { useLanguage } from '@/civic/contexts/LanguageContext';
import { useState } from 'react';
import { systemNodes, categoryConfig, layerConfig, SystemMapNode } from '@/civic/data/systemNodes';
import { SystemNodeCategory, SystemLayer } from '@/civic/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/civic/lib/utils';

// Coral accent color for active/hovered states
const CORAL_ACCENT = 'hsl(14, 90%, 55%)';

// Calculate node position on circle
function getNodePosition(angle: number, radius: number, centerX: number, centerY: number) {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

// System Map Diagram Component
function SystemMapDiagram({ 
  nodes, 
  activeCategories,
  onNodeHover,
  hoveredNode 
}: { 
  nodes: SystemMapNode[];
  activeCategories: Set<SystemNodeCategory>;
  onNodeHover: (node: SystemMapNode | null) => void;
  hoveredNode: SystemMapNode | null;
}) {
  const { language } = useLanguage();
  const size = 600;
  const center = size / 2;
  const maxRadius = size / 2 - 40;

  const layers: SystemLayer[] = ['components', 'activities', 'impacts', 'purpose'];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[600px] mx-auto">
      {/* Background circles for layers */}
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
            {/* Layer label */}
            <text
              x={center + radius - 10}
              y={center - radius + 20}
              className="text-[10px] uppercase tracking-wider font-semibold"
              fill="hsl(0, 0%, 55%)"
            >
              {config.label[language]}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      <AnimatePresence>
        {nodes.map((node) => {
          const layerRadius = layerConfig[node.layer].radius * maxRadius;
          const { x, y } = getNodePosition(node.angle, layerRadius, center, center);
          const isActive = activeCategories.size === 0 || activeCategories.has(node.category);
          const isHovered = hoveredNode?.id === node.id;
          const isFiltered = activeCategories.has(node.category);
          
          // Use coral for hovered or filtered nodes, otherwise gray
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
              {/* Node circle */}
              <circle
                cx={x}
                cy={y}
                r={node.layer === 'purpose' ? 12 : node.layer === 'impacts' ? 10 : 8}
                fill={nodeColor}
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Label for larger nodes or hovered */}
              {(node.layer === 'purpose' || node.layer === 'impacts' || isHovered) && (
                <text
                  x={x}
                  y={y + (node.layer === 'purpose' ? 24 : 20)}
                  textAnchor="middle"
                  className={cn(
                    "font-medium",
                    node.layer === 'purpose' ? 'text-[11px]' : 'text-[9px]'
                  )}
                  fill="hsl(0, 0%, 20%)"
                >
                  {node.label[language]}
                </text>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* Center emblem - coral */}
      <circle
        cx={center}
        cy={center}
        r={16}
        fill={CORAL_ACCENT}
        stroke="white"
        strokeWidth="3"
      />
      <text
        x={center}
        y={center + 4}
        textAnchor="middle"
        className="text-[10px] fill-white font-bold"
      >
        AI
      </text>
    </svg>
  );
}

// Legend Sidebar Component
function SystemMapLegend({
  activeCategories,
  onCategoryToggle,
  hoveredNode,
}: {
  activeCategories: Set<SystemNodeCategory>;
  onCategoryToggle: (category: SystemNodeCategory) => void;
  hoveredNode: SystemMapNode | null;
}) {
  const { language } = useLanguage();
  const categories = Object.entries(categoryConfig) as [SystemNodeCategory, typeof categoryConfig[SystemNodeCategory]][];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
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
                  "flex items-center gap-3 w-full px-3 py-2 text-left transition-all border",
                  isActive
                    ? "bg-primary/5 border-primary"
                    : "bg-background border-border hover:border-foreground/30"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? CORAL_ACCENT : config.color }}
                />
                <span className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary"
                )}>
                  {config.label[language]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Clear filters button */}
      {activeCategories.size > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={() => {
            // Clear by toggling all active ones
            activeCategories.forEach(cat => onCategoryToggle(cat));
          }}
          className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground transition-colors"
        >
          {language === 'en' ? 'Clear Filters' : 'Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ±'}
        </motion.button>
      )}

      {/* Hovered node details */}
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
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CORAL_ACCENT }}
              />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {categoryConfig[hoveredNode.category].label[language]}
              </span>
            </div>
            <h4 className="font-semibold mb-1">{hoveredNode.label[language]}</h4>
            <p className="text-sm text-muted-foreground">
              {hoveredNode.description[language]}
            </p>
            <div className="mt-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Layer:' : 'Ø§Ù„Ø·Ø¨Ù‚Ø©:'} {layerConfig[hoveredNode.layer].label[language]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layers legend */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {language === 'en' ? 'Layers' : 'Ø§Ù„Ø·Ø¨Ù‚Ø§Øª'}
        </h3>
        <div className="space-y-2">
          {(Object.entries(layerConfig) as [SystemLayer, typeof layerConfig[SystemLayer]][]).map(([layer, config]) => (
            <div key={layer} className="flex items-center gap-3 px-3 py-1.5">
              <div className="w-4 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {config.label[language]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Maps = () => {
  const { t, language } = useLanguage();
  const [activeCategories, setActiveCategories] = useState<Set<SystemNodeCategory>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<SystemMapNode | null>(null);

  const handleCategoryToggle = (category: SystemNodeCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <Layout>
      <div className="container py-16 md:py-24">
        {/* Header with coral marker */}
        <motion.div 
          className="max-w-3xl mb-12"
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

        {/* Main content - Two column layout */}
        <motion.div 
          className="grid lg:grid-cols-[1fr_280px] gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Diagram */}
          <div className="border border-border bg-background p-8 lg:p-12 min-h-[600px] flex items-center justify-center">
            <SystemMapDiagram
              nodes={systemNodes}
              activeCategories={activeCategories}
              onNodeHover={setHoveredNode}
              hoveredNode={hoveredNode}
            />
          </div>

          {/* Legend sidebar */}
          <div className="border border-border bg-background p-6 lg:sticky lg:top-24 h-fit">
            <SystemMapLegend
              activeCategories={activeCategories}
              onCategoryToggle={handleCategoryToggle}
              hoveredNode={hoveredNode}
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {(Object.entries(layerConfig) as [SystemLayer, typeof layerConfig[SystemLayer]][]).map(([layer, config]) => {
            const count = systemNodes.filter(n => n.layer === layer).length;
            return (
              <div key={layer} className="border border-border bg-background p-5">
                <div className="text-3xl font-bold text-foreground mb-1">{count}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {config.label[language]}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Maps;

