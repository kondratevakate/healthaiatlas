import { useState } from 'react';
import { Claim } from '@/types/claims';
import { PREDICATE_EVIDENCE_POLICY } from '@/types/claims';
import { evidence as allEvidence } from '@/data/evidence';
import { ConfidenceBadge } from './ConfidenceBadge';
import { EvidenceDetail } from './EvidenceDetail';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const predicateLabels: Record<string, string> = {
  // Platforms & jurisdictions
  platform_in_jurisdiction: 'Jurisdiction',
  platform_under_authority: 'Under authority',
  platform_operated_by: 'Operated by',
  platform_links_with: 'Links with',
  platform_program: 'Program',
  // Onboarding & integration
  onboarding_prerequisite_for_license: 'License prerequisite',
  onboarding_requires_security_controls: 'Security controls',
  publishes_integration_spec: 'Integration spec',
  requires_emr_compliance: 'EMR compliance',
  requires_sso: 'SSO required',
  // Interoperability
  supports_interop_standard: 'Interop standard',
  facility_connects_to_platform: 'Connects to platform',
  facility_uses_emr: 'Uses EMR',
  data_exchange_enabled: 'Data exchange',
  // Telehealth
  telehealth_required: 'Telehealth required',
  telehealth_standard_applies: 'Telehealth standard',
  // Licenses & status
  has_active_license: 'Active license',
  operational_status: 'Status',
  // Deployments
  deployed_at_provider: 'Deployed at',
  procurement_or_contract_with: 'Contract / procurement',
};

const policyLabels: Record<string, string> = {
  E1: 'Official only',
  E2: 'Official + docs',
  E3: 'Independent confirmation',
  E4: 'Commercial evidence',
  E5: 'Status / historical',
};

export function ClaimCard({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);
  const evidenceItems = claim.evidence_ids
    .map(id => allEvidence.find(e => e.evidence_id === id))
    .filter(Boolean);

  const policy = PREDICATE_EVIDENCE_POLICY[claim.predicate];
  const displayValue = claim.value_text || claim.value_entity_id || String(claim.value_number ?? '');

  return (
    <div className="border border-border bg-background">
      {/* Header */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-none text-xs font-mono uppercase">
              {predicateLabels[claim.predicate] || claim.predicate}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono" title={policyLabels[policy]}>
              {policy}
            </span>
          </div>
          <ConfidenceBadge claim={claim} />
        </div>

        <p className="text-sm font-medium text-foreground">&ldquo;{displayValue}&rdquo;</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{claim.jurisdiction}</span>
          <span>As of {claim.as_of}</span>
          <span className={cn(
            claim.status === 'asserted' && 'text-foreground',
            claim.status === 'disputed' && 'text-destructive',
            claim.status === 'retracted' && 'text-muted-foreground line-through',
          )}>
            {claim.status}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          {evidenceItems.length} source{evidenceItems.length !== 1 ? 's' : ''}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Evidence */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {evidenceItems.map(e => e && (
            <EvidenceDetail key={e.evidence_id} item={e} />
          ))}
        </div>
      )}
    </div>
  );
}
