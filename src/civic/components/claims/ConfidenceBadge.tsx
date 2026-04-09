import { Claim, Evidence, EvidencePolicy, PREDICATE_EVIDENCE_POLICY } from '@/civic/types/claims';
import { Badge } from '@/civic/components/ui/badge';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { cn } from '@/civic/lib/utils';
import { evidence as allEvidence } from '@/civic/data/evidence';

type Level = 'high' | 'medium' | 'low';

/**
 * Computed confidence based on evidence policy + source quality.
 * 
 * HIGH: E1/E2 evidence (official/standard/spec) with fresh retrieved_at
 * MEDIUM: E3 with 2+ independent sources, or E4 with artifact
 * LOW: single unofficial source, or missing locator/excerpt
 */
function computeConfidence(claim: Claim): Level {
  const policy = PREDICATE_EVIDENCE_POLICY[claim.predicate];
  const sources = allEvidence.filter(e => claim.evidence_ids.includes(e.evidence_id));
  
  if (sources.length === 0) return 'low';

  const hasOfficial = sources.some(s => 
    ['official_registry', 'policy'].includes(s.source_type)
  );
  const hasLocatorAndExcerpt = sources.some(s => s.locator && s.excerpt);

  // E1/E2: official sources -> high if fresh
  if ((policy === 'E1' || policy === 'E2') && hasOfficial) return 'high';

  // E3: need 2+ independent sources
  if (policy === 'E3' && sources.length >= 2) return 'medium';
  if (policy === 'E3' && hasOfficial) return 'high';

  // E4: need artifact (press_release, vendor_doc, news with excerpt)
  if (policy === 'E4' && sources.length >= 2) return 'high';
  if (policy === 'E4' && sources.some(s => ['press_release', 'news'].includes(s.source_type) && s.excerpt)) return 'medium';

  // E5: status -> official + as_of -> high
  if (policy === 'E5' && hasOfficial) return 'high';
  if (policy === 'E5' && sources.length >= 1) return 'medium';

  // Fallback: single unofficial without locator
  if (!hasLocatorAndExcerpt && sources.length === 1) return 'low';
  if (hasOfficial) return 'high';
  if (sources.length >= 2) return 'medium';
  
  return 'low';
}

const config: Record<Level, { icon: React.ElementType; label: string; className: string }> = {
  high: {
    icon: ShieldCheck,
    label: 'High',
    className: 'border-green-700/30 text-green-800 bg-green-50',
  },
  medium: {
    icon: ShieldAlert,
    label: 'Medium',
    className: 'border-yellow-700/30 text-yellow-800 bg-yellow-50',
  },
  low: {
    icon: Shield,
    label: 'Low',
    className: 'border-muted-foreground/30 text-muted-foreground bg-muted',
  },
};

export function ConfidenceBadge({ claim }: { claim: Claim }) {
  const level = computeConfidence(claim);
  const { icon: Icon, label, className } = config[level];

  return (
    <Badge variant="outline" className={cn('rounded-none gap-1 text-xs font-medium', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

