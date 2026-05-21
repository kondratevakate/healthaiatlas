// US Policy Horizons — the funded federal missions that founders must
// attach to in order to win reimbursement, capital, and procurement language.
//
// These are NOT slogans. Each entry is a current published federal plan,
// strategy, or executive order with a measurable target year and a primary
// .gov source. A startup that picks a niche outside ALL of these is
// "technically interesting" but operates outside the political incentive
// gravity well — investors and payers will treat it accordingly.
//
// Compliance rule: every entry MUST cite a primary .gov source (or the
// directly-corresponding NIH PMC summary if .gov page is just a landing).

export type HorizonOwner =
  | 'HHS'
  | 'CMS'
  | 'CMS / FDA'
  | 'ONC / ASTP'
  | 'FDA'
  | 'NIH'
  | 'White House';

export interface PolicyHorizon {
  id: string;
  title: string;
  owner: HorizonOwner;
  targetYear: number;        // headline target year (2030 / 2047 / etc.)
  enacted: string;           // when this anchor became official ("Feb 2022", "Sep 2024")
  oneLiner: string;          // one-sentence headline goal
  startupAngle: string;      // niche pattern this anchor funds / legitimises
  caveat?: string;           // for politically volatile anchors (MAHA)
  src: string;
}

export const US_POLICY_HORIZONS: PolicyHorizon[] = [
  {
    id: 'cms-accountable-care-2030',
    title: 'CMS Accountable Care 2030',
    owner: 'CMS',
    targetYear: 2030,
    enacted: 'CMMI strategy 2021, refreshed 2025',
    oneLiner: 'All Traditional Medicare beneficiaries and the vast majority of Medicaid beneficiaries in accountable-care relationships by 2030.',
    startupAngle: 'AI that lowers total cost of care, prevents avoidable admissions, closes gaps in care, supports chronic-care coordination. Reimbursement experiments tied to outcomes, not procedure volume.',
    src: 'https://www.cms.gov/priorities/innovation/about/strategic-direction',
  },
  {
    id: 'access-tempo-pilots',
    title: 'ACCESS Model + TEMPO Pilot',
    owner: 'CMS / FDA',
    targetYear: 2036,
    enacted: 'ACCESS launches July 5 2026 (10-year run); TEMPO statements of interest from Jan 2026',
    oneLiner: 'First coordinated CMS+FDA pathway: outcome-aligned payment for technology-enabled chronic care + FDA enforcement-discretion runway.',
    startupAngle: 'Digital chronic-care devices for high blood pressure, diabetes, chronic musculoskeletal pain, depression. The ACCESS+TEMPO combo is the cleanest current path to fund clinical evidence while collecting reimbursement.',
    src: 'https://www.cms.gov/priorities/innovation/innovation-models/access',
  },
  {
    id: 'cancer-moonshot-2047',
    title: 'Cancer Moonshot 2047',
    owner: 'White House',
    targetYear: 2047,
    enacted: 'Reignited Feb 2 2022 by President Biden',
    oneLiner: 'Reduce age-standardised US cancer mortality by ≥50% over 25 years.',
    startupAngle: 'Cancer screening, early detection, trial matching, treatment navigation, survivorship, toxicity monitoring, prior-auth automation, oncology RWE. The strongest long-horizon mission anchor for oncology AI.',
    src: 'https://www.whitehouse.gov/cancermoonshot/',
  },
  {
    id: 'ehe-2030',
    title: 'Ending the HIV Epidemic 2030',
    owner: 'HHS',
    targetYear: 2030,
    enacted: 'Launched 2019 SOTU, bipartisan continuation',
    oneLiner: 'Reduce new HIV infections by 75% by 2025 and ≥90% by 2030; focused on 57 priority jurisdictions.',
    startupAngle: 'PrEP adherence, HIV testing outreach, linkage-to-care, retention-in-care, population-health analytics, lab/reporting interoperability. The most disease-specific funded anchor — strong fit if privacy/trust is built-in.',
    src: 'https://www.hiv.gov/federal-response/ending-the-hiv-epidemic/overview',
  },
  {
    id: 'onc-astp-2030',
    title: 'ONC / ASTP 2024–2030 Federal Health IT Strategic Plan',
    owner: 'ONC / ASTP',
    targetYear: 2030,
    enacted: 'Final plan published Sep 2024',
    oneLiner: 'Federal infrastructure roadmap for health-data access, interoperability, public-health data, person-centered design.',
    startupAngle: 'Patient access apps, FHIR/EHR integrations, public-health reporting, health-data exchange, AI built on standards-compliant pipes. The infrastructure layer beneath every other mission.',
    src: 'https://www.healthit.gov/topic/2024-2030-federal-health-it-strategic-plan',
  },
  {
    id: 'healthy-people-2030',
    title: 'Healthy People 2030',
    owner: 'HHS',
    targetYear: 2030,
    enacted: 'Launched Aug 2020 (5th iteration)',
    oneLiner: '358 measurable national health objectives across prevention, chronic disease, social determinants, health literacy, well-being.',
    startupAngle: 'Maps the language of "politically legible" health outcomes. Useful as a vocabulary check — if a startup pitch can be tied to a specific Healthy People objective, the federal grant + procurement narrative writes itself.',
    src: 'https://odphp.health.gov/our-work/national-health-initiatives/healthy-people/healthy-people-2030',
  },
  {
    id: 'maha-chronic-disease',
    title: 'MAHA — Make America Healthy Again',
    owner: 'White House',
    targetYear: 2029,
    enacted: 'EO 14212 signed Feb 14 2025; assessment May 2025; strategy Sep 2025',
    oneLiner: 'Childhood chronic-disease umbrella: diet, environmental exposures, physical inactivity, stress, overmedicalization. 120-initiative federal strategy.',
    startupAngle: 'Pediatric chronic-disease prevention; nutrition / lifestyle / environmental interventions; reformed Medicaid quality metrics tied to outcomes. Procurement language exists; grant flows being established.',
    caveat: 'Politically volatile — current-administration agenda, not stable bipartisan law. Treat as "political weather," not "institutional law." A change of administration may de-fund the bulk of these initiatives.',
    src: 'https://www.whitehouse.gov/presidential-actions/2025/02/establishing-the-presidents-make-america-healthy-again-commission/',
  },
];
