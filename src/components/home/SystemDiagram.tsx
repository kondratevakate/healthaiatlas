import { motion } from 'framer-motion';
import { ResearchDomain } from '@/types';

function buildDomainNodes(domains: ResearchDomain[]) {
  const nonOverview = domains.filter(d => d.id !== 'overview');
  const radius = 30;
  return nonOverview.map((domain, i) => {
    const angle = (360 / nonOverview.length) * i - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      id: domain.id,
      label: domain.name.en,
      sublabel: `${domain.playerIds.length} orgs`,
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
      color: domain.color,
      size: 9,
    };
  });
}

interface SystemDiagramProps {
  domains: ResearchDomain[];
  activeDomainId: string;
  onDomainClick: (domainId: string) => void;
}

export function SystemDiagram({ domains, activeDomainId, onDomainClick }: SystemDiagramProps) {
  const domainNodes = buildDomainNodes(domains);
  const isOverview = activeDomainId === 'overview';
  const activeDomain = domains.find(d => d.id === activeDomainId);

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Guide ring */}
        <motion.circle
          cx={50} cy={50} r={30}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.15"
          strokeDasharray="1 1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 0.6 }}
        />

        {/* Connection lines from center to each domain */}
        {domainNodes.map((node, i) => (
          <motion.line
            key={`conn-${node.id}`}
            x1={50} y1={50}
            x2={node.x} y2={node.y}
            stroke="hsl(var(--border))"
            strokeWidth="0.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
          />
        ))}

        {/* Center hub */}
        <motion.circle
          cx={50} cy={50} r={8}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth="0.4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        />
        <motion.text
          x={50} y={49}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-serif font-semibold fill-primary"
          style={{ fontSize: '2.2px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isOverview ? 'UAE' : activeDomain?.name.en}
        </motion.text>
        <motion.text
          x={50} y={52}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '1.5px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.6 }}
        >
          {isOverview ? 'Health AI' : 'Research Domain'}
        </motion.text>

        {/* Domain nodes */}
        {domainNodes.map((node, i) => {
          const isActive = isOverview || node.id === activeDomainId;
          const isCurrent = node.id === activeDomainId;

          return (
            <motion.g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${node.label} domain`}
              onClick={() => onDomainClick(node.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onDomainClick(node.id);
                }
              }}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer glow */}
              <motion.circle
                cx={node.x} cy={node.y}
                r={node.size * 1.4}
                fill={`hsl(${node.color} / ${isActive ? 0.2 : 0.05})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.3 + i * 0.1 }}
              />
              {/* Main circle */}
              <motion.circle
                cx={node.x} cy={node.y}
                r={node.size}
                fill={`hsl(${node.color} / ${isActive ? 0.25 : 0.08})`}
                stroke={`hsl(${node.color} / ${isActive ? 1 : 0.3})`}
                strokeWidth={isCurrent ? "0.8" : "0.4"}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 + i * 0.1 }}
              />
              {/* Label */}
              <motion.text
                x={node.x} y={node.y - 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-semibold"
                style={{
                  fontSize: '1.8px',
                  fill: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {node.label}
              </motion.text>
              {/* Sublabel */}
              <motion.text
                x={node.x} y={node.y + 1.8}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '1.3px',
                  fill: isActive ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground) / 0.3)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 0.7 : 0.3 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                {node.sublabel}
              </motion.text>
              {/* Pulse ring for current */}
              {isCurrent && (
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={node.size}
                  fill="none"
                  stroke={`hsl(${node.color})`}
                  strokeWidth="0.25"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeOut" }}
                />
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <motion.div
        className="absolute -bottom-6 left-0 right-0 flex justify-center gap-6 text-xs text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary/50 border border-primary" />
          Active Domain
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted border border-border" />
          Other Domains
        </span>
      </motion.div>
    </div>
  );
}

