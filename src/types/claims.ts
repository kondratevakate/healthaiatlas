// Verifiable Claims Directory — Wikidata-style data model
// Every claim must have at least 1 evidence entry

// ── V1 Controlled vocabulary: 20 UAE gatekeeper-flow predicates ──

export type ClaimPredicate =
  // Platforms & jurisdictions
  | 'platform_in_jurisdiction'              // Platform → AE-Dubai | AE-AbuDhabi | AE-Federal
  | 'platform_under_authority'              // Platform → DHA | DoH | MOHAP
  | 'platform_operated_by'                  // Platform → Operator org
  | 'platform_links_with'                   // Platform ↔ Platform
  | 'platform_program'                      // Platform → Program (e.g., NUMR)

  // Onboarding & integration
  | 'onboarding_prerequisite_for_license'   // Facility → Platform (must connect for license)
  | 'onboarding_requires_security_controls' // Platform → Standard/controls (e.g., ADHICS)
  | 'publishes_integration_spec'            // Platform → Spec doc (HL7/FHIR/API/PDF)
  | 'requires_emr_compliance'               // Authority/Platform → EMR requirement
  | 'requires_sso'                          // Authority/Platform → SSO requirement

  // Interoperability & connectivity
  | 'supports_interop_standard'             // Platform/System → HL7 | FHIR | DICOM | etc.
  | 'facility_connects_to_platform'         // Facility → Platform (actual connection)
  | 'facility_uses_emr'                     // Facility → EMR system/vendor
  | 'data_exchange_enabled'                 // Facility/Platform → yes/no (in practice)

  // Telehealth
  | 'telehealth_required'                   // Authority → Requirement
  | 'telehealth_standard_applies'           // Facility → Standard

  // Licenses & status
  | 'has_active_license'                    // Facility → Authority
  | 'operational_status'                    // Entity → active|inactive|acquired|merged|unknown

  // Deployments & contracts
  | 'deployed_at_provider'                  // Product/Vendor → Provider
  | 'procurement_or_contract_with';         // Provider/Payer → Vendor

// ── Evidence policy classes ──
// E1: Official-only (regulator/platform sites only)
// E2: Official + Formal docs (circulars, specs, PDFs)
// E3: Official + Independent confirmation (2 independent sources)
// E4: Commercial adoption (press release, contract, public case — no marketing claims)
// E5: Status & historical (as_of + retrieved_at + archive preferred)

export type EvidencePolicy = 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

/** Maps each predicate to its required evidence policy */
export const PREDICATE_EVIDENCE_POLICY: Record<ClaimPredicate, EvidencePolicy> = {
  platform_in_jurisdiction: 'E1',
  platform_under_authority: 'E1',
  platform_operated_by: 'E1',
  platform_links_with: 'E2',
  platform_program: 'E1',

  onboarding_prerequisite_for_license: 'E2',
  onboarding_requires_security_controls: 'E2',
  publishes_integration_spec: 'E2',
  requires_emr_compliance: 'E2',
  requires_sso: 'E2',

  supports_interop_standard: 'E2',
  facility_connects_to_platform: 'E3',
  facility_uses_emr: 'E3',
  data_exchange_enabled: 'E3',

  telehealth_required: 'E2',
  telehealth_standard_applies: 'E2',

  has_active_license: 'E2',
  operational_status: 'E5',

  deployed_at_provider: 'E4',
  procurement_or_contract_with: 'E4',
};

export type ClaimStatus = 'asserted' | 'disputed' | 'retracted';

// Confidence is COMPUTED, not manual — based on evidence policy + source quality
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type SourceType =
  | 'official_registry'
  | 'policy'
  | 'vendor_doc'
  | 'press_release'
  | 'peer_reviewed'
  | 'news'
  | 'social'
  | 'paid_dataset';

export type AccessLevel = 'public' | 'login_required' | 'paywalled';
export type ValueKind = 'entity' | 'text' | 'number' | 'range';

export interface Claim {
  claim_id: string;
  subject_id: string;
  predicate: ClaimPredicate;
  value_kind: ValueKind;
  value_entity_id?: string;
  value_text?: string;
  value_number?: number;
  value_unit?: string;
  jurisdiction: string;
  as_of: string;
  valid_from?: string;
  valid_to?: string;
  status: ClaimStatus;
  confidence: ConfidenceLevel;
  evidence_ids: string[];
  tags: string[];
  created_at: string;
}

export interface Evidence {
  evidence_id: string;
  source_type: SourceType;
  url: string;
  title: string;
  publisher: string;
  published_at?: string;
  retrieved_at: string;
  locator?: string;
  excerpt?: string;
  access: AccessLevel;
  archive_url?: string;
}

export interface Verification {
  verification_id: string;
  claim_id: string;
  verifier_role: string;
  method: string;
  verified_at: string;
  outcome: 'confirmed' | 'contradicted' | 'inconclusive';
  notes?: string;
}
