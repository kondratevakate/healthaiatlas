import { motion } from 'framer-motion';

const CX = 50;
const CY = 50;

const rings = [
  { r: 12, width: 5, opacity: 0.25, arc: 360, speed: 60, dir: 1 },
  { r: 20, width: 4, opacity: 0.18, arc: 280, speed: 45, dir: -1 },
  { r: 27, width: 3.5, opacity: 0.13, arc: 320, speed: 55, dir: 1 },
  { r: 34, width: 3, opacity: 0.09, arc: 240, speed: 70, dir: -1 },
  { r: 40, width: 2.5, opacity: 0.06, arc: 200, speed: 85, dir: 1 },
];

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = ((startAngle - 90) * Math.PI) / 180;
  const end = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const nodes = [
  { id: 'regulators', label: 'Regulators', sublabel: 'FDA · DHA · EMA', ringIdx: 1, angle: -60 },
  { id: 'hospitals', label: 'Hospitals', sublabel: 'Mayo · NHS · SEHA', ringIdx: 2, angle: 10 },
  { id: 'startups', label: 'Startups', sublabel: 'Tempus · Paige', ringIdx: 3, angle: 70 },
  { id: 'research', label: 'Research', sublabel: 'NIH · MBZUAI', ringIdx: 2, angle: 150 },
  { id: 'data', label: 'Data', sublabel: 'FHIR · NABIDH', ringIdx: 4, angle: 210 },
  { id: 'investors', label: 'Investors', sublabel: 'VC · PE', ringIdx: 3, angle: -30 },
];

// Connections between nodes with varying weights
const connections: { from: number; to: number; weight: number }[] = [
  { from: 0, to: 1, weight: 0.8 },  // regulators → hospitals
  { from: 1, to: 2, weight: 0.5 },  // hospitals → startups
  { from: 2, to: 5, weight: 0.7 },  // startups → investors
  { from: 3, to: 0, weight: 0.6 },  // research → regulators
  { from: 3, to: 4, weight: 0.9 },  // research → data
  { from: 4, to: 1, weight: 0.4 },  // data → hospitals
  { from: 5, to: 2, weight: 0.6 },  // investors → startups
  { from: 0, to: 4, weight: 0.3 },  // regulators → data
];

function nodePos(idx: number) {
  const node = nodes[idx];
  const r = rings[node.ringIdx].r;
  const rad = ((node.angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export function HeroDiagram() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>{`
            ${rings.map((ring, i) => `
              @keyframes hero-orbit-${i} {
                from { transform: rotate(0deg); }
                to { transform: rotate(${ring.dir * 360}deg); }
              }
              .hero-orbit-${i} {
                animation: hero-orbit-${i} ${ring.speed}s linear infinite;
                transform-origin: ${CX}px ${CY}px;
              }
            `).join('')}
          `}</style>
        </defs>

        {/* Filled concentric arc rings */}
        {rings.map((ring, i) => (
          <path
            key={`ring-${i}`}
            className={`hero-orbit-${i}`}
            d={arcPath(CX, CY, ring.r, 0, ring.arc)}
            fill="none"
            stroke={`hsl(var(--foreground) / ${ring.opacity})`}
            strokeWidth={ring.width}
            strokeLinecap="round"
          />
        ))}

        {/* Connection lines between nodes — varying thickness */}
        {connections.map((conn, i) => {
          const a = nodePos(conn.from);
          const b = nodePos(conn.to);
          const thickness = 0.2 + conn.weight * 0.5;
          const alpha = 0.06 + conn.weight * 0.08;
          return (
            <motion.line
              key={`conn-${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={`hsl(var(--foreground) / ${alpha})`}
              strokeWidth={thickness}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.08 }}
            />
          );
        })}

        {/* Traveling pulses along connections — animate via transform on a
            wrapping <g> so Framer Motion never has to write SVG cx/cy attrs
            (which leak `undefined` on the first frame for keyframed values). */}
        {connections.map((conn, i) => {
          const a = nodePos(conn.from);
          const b = nodePos(conn.to);
          const size = 0.4 + conn.weight * 0.4;
          return (
            <motion.g
              key={`pulse-${i}`}
              initial={{ x: a.x, y: a.y, opacity: 0 }}
              animate={{
                x: [a.x, b.x],
                y: [a.y, b.y],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 2 + conn.weight,
                delay: 2 + i * 1.6,
                repeat: Infinity,
                repeatDelay: 8 + i * 0.5,
                ease: 'easeInOut',
              }}
            >
              <circle r={size} fill={`hsl(var(--foreground) / 0.5)`} />
            </motion.g>
          );
        })}

        {/* Center hub */}
        <motion.circle
          cx={CX} cy={CY} r={7}
          fill="hsl(var(--foreground) / 0.1)"
          stroke="hsl(var(--foreground) / 0.35)"
          strokeWidth="0.6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.2 }}
        />
        <motion.text
          x={CX} y={CY - 0.5}
          textAnchor="middle" dominantBaseline="middle"
          className="font-serif font-semibold"
          style={{ fontSize: '2.6px', fill: 'hsl(var(--foreground))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Health AI
        </motion.text>
        <motion.text
          x={CX} y={CY + 2.4}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: '1.5px', fill: 'hsl(var(--foreground) / 0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Global Atlas
        </motion.text>

        {/* Nodes on different ring levels */}
        {nodes.map((node, i) => {
          const pos = nodePos(i);
          return (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.4 + i * 0.1 }}
            >
              <circle cx={pos.x} cy={pos.y} r={5.5}
                fill="hsl(var(--background))"
                stroke="hsl(var(--foreground) / 0.3)"
                strokeWidth="0.4"
              />
              <circle cx={pos.x} cy={pos.y} r={5.5}
                fill="hsl(var(--foreground) / 0.06)"
              />
              <text x={pos.x} y={pos.y - 0.5}
                textAnchor="middle" dominantBaseline="middle"
                className="font-medium"
                style={{ fontSize: '2px', fill: 'hsl(var(--foreground) / 0.9)' }}
              >
                {node.label}
              </text>
              <text x={pos.x} y={pos.y + 1.8}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: '1.2px', fill: 'hsl(var(--foreground) / 0.5)' }}
              >
                {node.sublabel}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
