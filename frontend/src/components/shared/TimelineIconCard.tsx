import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  year: number | string;
  date?: string;
  icon: LucideIcon;
  accentHsl: string;        // e.g. "180 70% 45%" (HSL triplet for use in style)
  badge?: string;
  caption?: string;
  hotspotNumber?: number | string;
  className?: string;
}

/**
 * Iconographic 4:3 card used in place of a photograph when no public-domain
 * image is available. Mirrors the UAE timeline image-card aspect ratio so
 * alternating timeline rows keep the same visual rhythm.
 */
export function TimelineIconCard({
  year,
  date,
  icon: Icon,
  accentHsl,
  badge,
  caption,
  hotspotNumber,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden border border-border',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${accentHsl} / 0.12) 0%, hsl(${accentHsl} / 0.04) 60%, hsl(${accentHsl} / 0.18) 100%)`,
      }}
    >
      {/* Year stamp top-left */}
      <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-2 py-1 z-10">
        <span className="font-mono text-xs font-semibold text-foreground">
          {date ?? year}
        </span>
      </div>

      {/* Optional type badge top-right */}
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className="inline-block text-[9px] font-mono uppercase tracking-widest px-2 py-1 bg-background/95 backdrop-blur-sm border"
            style={{ borderColor: `hsl(${accentHsl} / 0.55)`, color: `hsl(${accentHsl})` }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Big centred icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          className="h-20 w-20 md:h-24 md:w-24"
          strokeWidth={1.25}
          style={{ color: `hsl(${accentHsl})` }}
        />
      </div>

      {/* Optional caption bottom */}
      {caption && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/70 line-clamp-1">
            {caption}
          </p>
        </div>
      )}

      {/* Optional hotspot number bottom-right (UAE-style coral accent) */}
      {hotspotNumber !== undefined && (
        <div
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: 'hsl(14, 90%, 55%)' }}
        >
          {hotspotNumber}
        </div>
      )}
    </div>
  );
}
