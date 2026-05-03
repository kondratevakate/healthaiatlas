// US healthcare AI decision-making timeline — chronological precedents.
//
// The story this timeline tells: every safeguard in US healthcare regulation
// was built in reaction to a tragedy. The chain that today decides whether an
// AI tool reaches a patient (FDA approval → AMA CPT code → CMS coverage →
// payer reimbursement) was assembled piece by piece over 120 years.
//
// Compliance rule: every entry MUST cite a primary source (FDA.gov, AMA, CMS,
// HHS, congress.gov, peer-reviewed journal, manufacturer press release with
// SEC filing). No secondary news sources for material facts.

export type USEra =
  | 'pre-fda'
  | 'foundation'
  | 'coverage'
  | 'digital'
  | 'ai'
  | 'roadmap';

export type USEventType =
  | 'law'        // statute passed
  | 'crisis'     // event that triggered later regulation
  | 'agency'     // agency / framework established
  | 'approval'   // notable FDA / regulatory approval
  | 'pricing'    // pricing / reimbursement event
  | 'code'       // AMA CPT / coding event
  | 'withdrawal' // approval reversed / drug withdrawn
  | 'guidance';  // formal agency guidance

export interface USEvent {
  id: string;
  year: number;
  date?: string;         // ISO date when known
  era: USEra;
  type: USEventType;
  title: string;
  why: string;           // one-line "why it matters in the chain"
  detail: string;        // 2-3 sentences with specifics
  src: string;           // primary-source URL — REQUIRED
}

export const US_ERAS: { id: USEra; label: string; range: [number, number]; lead: string }[] = [
  {
    id: 'pre-fda',
    label: 'Before regulation',
    range: [1900, 1906],
    lead: 'Patent medicines, no labelling rules, snake-oil economy. Children died from morphine in cough syrup with no recourse.',
  },
  {
    id: 'foundation',
    label: 'Foundation: safety, then efficacy',
    range: [1906, 1962],
    lead: 'Two disasters (sulfanilamide 1937, thalidomide 1961) forced Congress to give FDA pre-market authority — first for safety, then for efficacy.',
  },
  {
    id: 'coverage',
    label: 'Coverage, codes & privacy',
    range: [1965, 2008],
    lead: 'Medicare/Medicaid created the largest single payer; AMA invented the language (CPT) by which doctors get paid; HIPAA put a legal architecture under all electronic health data; PDUFA created the user-fee model that funds the modern FDA review timeline.',
  },
  {
    id: 'digital',
    label: 'Coverage expansion + digital rails',
    range: [2009, 2016],
    lead: 'ACA expanded coverage and created CMMI + ACOs as the value-based-care substrate. HITECH put $35B behind EHR adoption. MACRA replaced SGR with MIPS/APMs. 21st Century Cures opened RWE as legal evidence for FDA. The substrate AI products would later need to monetize against.',
  },
  {
    id: 'ai',
    label: 'AI era — and the four-way collision',
    range: [2016, 2024],
    lead: 'FDA approves. AMA codes (or doesn\'t). CMS reimburses (or doesn\'t). Payers cover (or refuse). Aduhelm shows what happens when one of the four says no.',
  },
  {
    id: 'roadmap',
    label: 'Roadmap to 2030',
    range: [2024, 2030],
    lead: 'FDA opens iterative-update path for AI; AMA cycles new CPT codes annually; Medicare grapples with covering ~950+ FDA-cleared AI devices.',
  },
];

export const US_TIMELINE: USEvent[] = [
  // ─── Foundation era ─────────────────────────────────────────────────────
  {
    id: 'pure-food-1906',
    year: 1906,
    date: '1906-06-30',
    era: 'pre-fda',
    type: 'law',
    title: 'Pure Food and Drugs Act (Wiley Act)',
    why: 'First federal authority to police adulterated/misbranded food and drugs — precursor to FDA. Regulated labelling, not pre-market approval.',
    detail:
      'Signed by President Theodore Roosevelt; driven by USDA chief chemist Harvey Wiley\'s "Poison Squad" studies of preservatives. Law forbade interstate commerce in adulterated or misbranded products and gave the federal government seizure power.',
    src: 'https://www.fda.gov/about-fda/changes-science-law-and-regulatory-authorities/part-i-1906-food-and-drugs-act-and-its-enforcement',
  },
  {
    id: 'sulfanilamide-1937',
    year: 1937,
    date: '1937-10-01',
    era: 'foundation',
    type: 'crisis',
    title: 'Elixir Sulfanilamide kills 105',
    why: 'No pre-market safety testing was required. The diluent (diethylene glycol — antifreeze) had never been tested in humans.',
    detail:
      'S.E. Massengill Co. dissolved sulfanilamide in diethylene glycol to make a sweet liquid for children. 105 patients across 15 states died over Sept-Oct 1937. FDA recovered 234 of 240 gallons distributed; the missing 6 gallons caused the deaths.',
    src: 'https://www.fda.gov/about-fda/histories-product-regulation/sulfanilamide-disaster',
  },
  {
    id: 'fdc-act-1938',
    year: 1938,
    date: '1938-06-25',
    era: 'foundation',
    type: 'law',
    title: 'Federal Food, Drug, and Cosmetic Act',
    why: 'First time FDA could require pre-market proof of SAFETY for new drugs. Direct response to the sulfanilamide deaths.',
    detail:
      'Required new drugs to be shown safe before sale; established factory inspection authority; brought cosmetics and medical devices under federal oversight for the first time. Still the foundational US drug law today, amended many times since.',
    src: 'https://www.fda.gov/about-fda/changes-science-law-and-regulatory-authorities/part-ii-1938-food-drug-cosmetic-act',
  },
  {
    id: 'thalidomide-1961',
    year: 1961,
    era: 'foundation',
    type: 'crisis',
    title: 'Thalidomide birth-defects crisis (Europe)',
    why: 'Thousands of babies in Europe born without limbs after mothers took thalidomide as a "safe" sedative. US largely spared because FDA reviewer Frances Kelsey refused approval pending more data.',
    detail:
      'Marketed by German firm Chemie Grünenthal as a sleeping pill from 1957; later prescribed for morning sickness. Linked to phocomelia (limb malformation). Frances Kelsey, a new FDA medical officer, repeatedly demanded more safety data and blocked US approval.',
    src: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9420797/',
  },
  {
    id: 'kefauver-harris-1962',
    year: 1962,
    date: '1962-10-10',
    era: 'foundation',
    type: 'law',
    title: 'Kefauver-Harris Amendment — efficacy required',
    why: 'For the first time, drugs had to prove they WORK, not just that they\'re safe. Created the modern adequate-and-well-controlled-trial standard.',
    detail:
      'Enacted in the wake of the thalidomide tragedy. Required substantial evidence of effectiveness from adequate, well-controlled studies. Birth of the randomised clinical trial as the regulatory gold standard.',
    src: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4101807/',
  },

  // ─── Coverage & Codes era ───────────────────────────────────────────────
  {
    id: 'medicare-medicaid-1965',
    year: 1965,
    date: '1965-07-30',
    era: 'coverage',
    type: 'law',
    title: 'Medicare and Medicaid signed into law',
    why: 'Created the single largest payer in US healthcare. From this point on, what Medicare reimburses ≈ what gets built and prescribed.',
    detail:
      'President Lyndon Johnson signed the Social Security Amendments at the Truman Library in Independence, MO. Harry Truman received Medicare card #1. Medicare = elderly; Medicaid = means-tested. The reimbursement question becomes the centre of US healthcare economics.',
    src: 'https://www.archives.gov/milestone-documents/medicare-and-medicaid-act',
  },
  {
    id: 'cpt-1966',
    year: 1966,
    era: 'coverage',
    type: 'code',
    title: 'AMA publishes first CPT code set',
    why: 'A doctor cannot bill for a procedure that has no CPT code. AMA — a private association — controls the language of medical reimbursement.',
    detail:
      'First edition was 4-digit codes, mostly surgical. Expanded to 5-digit in 1970 to cover diagnostics and medicine. CMS adopted CPT into HCPCS in 1983, locking AMA\'s code set into Medicare billing.',
    src: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7963771/',
  },
  {
    id: 'orphan-drug-1983',
    year: 1983,
    date: '1983-01-04',
    era: 'coverage',
    type: 'law',
    title: 'Orphan Drug Act',
    why: 'Created the economic logic for ultra-expensive drugs: 7-year market exclusivity for diseases <200K patients, plus tax credits for trial costs.',
    detail:
      'Signed by President Reagan, championed by Rep. Henry Waxman. Before 1983, only 38 drugs had been approved for rare diseases; since 1983, FDA has approved >600 orphan-drug indications. The Act is also the financial scaffolding behind today\'s $2M+ rare-disease drugs.',
    src: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6664588/',
  },
  {
    id: 'hatch-waxman-1984',
    year: 1984,
    era: 'coverage',
    type: 'law',
    title: 'Hatch-Waxman Act (Drug Price Competition & Patent Term Restoration)',
    why: 'Created the modern generic-drug industry (ANDA pathway) AND extended brand-drug patent life. The grand bargain that defines US pharma economics.',
    detail:
      'Generics were 19% of US prescriptions in 1984; >90% by today. In return, brands got patent-term restoration (up to 5 years recovered, 14-year cap). Every modern fight over biosimilars, IP, and pricing traces back to this 1984 deal.',
    src: 'https://www.congress.gov/bill/98th-congress/house-bill/3605',
  },
  {
    id: 'pdufa-1992',
    year: 1992,
    date: '1992-10-29',
    era: 'coverage',
    type: 'law',
    title: 'PDUFA — pharma user fees fund half of FDA drug review',
    why: 'The user-fee model that makes the modern FDA review timeline possible. Without it, "FDA approves quickly" has no funding source.',
    detail:
      'Public Law 102-571. Pharma companies pay fees that fund FDA drug-review staff. Reauthorised every 5 years (II 1997, III 2002, IV 2007, V 2012, VI 2017, VII 2022). Each cycle reshapes review commitments and budget. Median priority review now 10–12 months — that timeline is a PDUFA artefact, not a baseline.',
    src: 'https://www.fda.gov/industry/fda-user-fee-programs/prescription-drug-user-fee-amendments',
  },
  {
    id: 'hipaa-1996',
    year: 1996,
    date: '1996-08-21',
    era: 'coverage',
    type: 'law',
    title: 'HIPAA — the legal architecture under every healthcare AI deployment',
    why: 'Defines ePHI, business-associate agreements, de-identification (Safe Harbor + Expert Determination), permissible secondary uses. Every AI training-data decision in US healthcare hits HIPAA first.',
    detail:
      'Public Law 104-191. Privacy Rule compliance 2003; Security Rule compliance 2005. HITECH (2009) bolted incentives on top of the legal frame HIPAA already created. Without HIPAA on the timeline, "where does the data come from" has no anchor.',
    src: 'https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html',
  },
  {
    id: 'de-novo-1997',
    year: 1997,
    era: 'coverage',
    type: 'law',
    title: 'De Novo classification pathway created (FDAMA)',
    why: 'Created the legal slot for novel low-to-moderate-risk devices that have no predicate. IDx-DR (2018) is a De Novo authorisation; so are most autonomous AI devices.',
    detail:
      'FDA Modernization Act of 1997, operationalised 1998+. Without De Novo, novel AI devices would either need to find a strained predicate for 510(k) or face full PMA — which is why <30 AI/ML devices have used the De Novo path despite ~950+ on the FDA list.',
    src: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request',
  },

  // ─── Digital health era ─────────────────────────────────────────────────
  {
    id: 'aca-2010',
    year: 2010,
    date: '2010-03-23',
    era: 'digital',
    type: 'law',
    title: 'ACA — coverage expansion + CMMI + ACOs',
    why: 'Created the demand-side base (~20m additional insured) and the value-based-care substrate (CMMI, ACOs). Every AI startup pitching value-based care is targeting ACA-built infrastructure.',
    detail:
      'Public Law 111-148. CMMI (Section 3021) tests payment models — ACO REACH, primary-care first, oncology care model. MSSP launched 2012; >450 ACOs cover >12m Medicare beneficiaries today. ACA is the structural payer-side event the AI tab implicitly assumes but never names.',
    src: 'https://www.hhs.gov/healthcare/about-the-aca/index.html',
  },
  {
    id: 'hitech-2009',
    year: 2009,
    date: '2009-02-17',
    era: 'digital',
    type: 'law',
    title: 'HITECH Act — $35B for EHR adoption',
    why: 'Federal money forced the system to digitise. Without EHRs there is no AI training data and no real-world-evidence pipeline.',
    detail:
      'Part of the American Recovery and Reinvestment Act signed by President Obama. Created Medicare/Medicaid "Meaningful Use" incentive payments (later phased into penalties for non-adopters). Drove EHR adoption from <10% of physicians in 2008 to >80% by 2017.',
    src: 'https://www.cms.gov/newsroom/fact-sheets/medicare-and-medicaid-health-information-technology-title-iv-american-recovery-and-reinvestment-act',
  },
  {
    id: 'macra-2015',
    year: 2015,
    date: '2015-04-16',
    era: 'digital',
    type: 'law',
    title: 'MACRA — MIPS/APMs replaced the SGR formula',
    why: 'Created the two payment tracks every physician operates under. AI sells to clinicians by being either a MIPS quality bonus, an APM cost reducer, or a covered benefit — and most AI is none of the three.',
    detail:
      'Public Law 114-10. MIPS = performance-based adjustment to Medicare fee-for-service (Quality + Cost + Promoting Interoperability + Improvement Activities). Advanced APMs = bonus payment for clinicians taking risk-bearing models. The "why doesn\'t this AI sell to physicians" question has its answer here.',
    src: 'https://www.cms.gov/medicare/quality/value-based-programs/macra',
  },
  {
    id: '21st-century-cures-2016',
    year: 2016,
    date: '2016-12-13',
    era: 'digital',
    type: 'law',
    title: '21st Century Cures Act — real-world evidence enters FDA',
    why: 'For the first time, FDA could use real-world data (claims, EHRs, registries) to support drug approval and label expansion — not just RCTs. Section 3060 also defined which clinical decision support is NOT a device.',
    detail:
      'Signed by President Obama. Added section 505F to the FD&C Act mandating FDA to evaluate RWE for regulatory decisions; FDA published RWE Framework December 2018. Section 3060 created the four-criterion "transparency" exception for non-device CDS — operationalised in the September 2022 final guidance below.',
    src: 'https://www.fda.gov/regulatory-information/selected-amendments-fdc-act/21st-century-cures-act',
  },

  // ─── AI era ─────────────────────────────────────────────────────────────
  {
    id: 'spinraza-2016',
    year: 2016,
    date: '2016-12-23',
    era: 'ai',
    type: 'pricing',
    title: 'Spinraza (nusinersen) — $750K Y1, $375K/year for life',
    why: 'First treatment for spinal muscular atrophy. Sets the modern pricing template: chronic rare-disease drug priced in the millions per lifetime.',
    detail:
      'Biogen, approved Dec 23 2016. Antisense oligonucleotide given by intrathecal injection — 4 loading doses then every 4 months for life. ICER concluded the price is "too high to align fairly with the benefits."',
    src: 'https://investors.biogen.com/news-releases/news-release-details/us-fda-approves-biogens-spinrazatm-nusinersen-first-treatment',
  },
  {
    id: 'idx-dr-2018',
    year: 2018,
    date: '2018-04-11',
    era: 'ai',
    type: 'approval',
    title: 'IDx-DR — first autonomous AI medical device cleared by FDA',
    why: 'First AI authorised to make a clinical decision without a doctor reading the result. The legal precedent every later AI device cites.',
    detail:
      'De Novo authorisation for screening for more-than-mild diabetic retinopathy in primary care. Sensitivity 87.2% / specificity 90.7% in pivotal trial. Took 8 years and $22M to navigate FDA. Now branded as LumineticsCore.',
    src: 'https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN180001.pdf',
  },
  {
    id: 'zolgensma-2019',
    year: 2019,
    date: '2019-05-24',
    era: 'ai',
    type: 'pricing',
    title: 'Zolgensma — $2.125M one-shot SMA gene therapy',
    why: 'Most expensive single-dose drug ever approved. Reframed the pricing debate from per-year cost to "value-of-cure" calculations.',
    detail:
      'Novartis (AveXis), approved May 24 2019 for children <2 with SMA. AAV-vector gene therapy delivering one functional copy of SMN1 in a single intravenous infusion. Novartis pitched the price as 50% below 10-year cost of chronic SMA therapy.',
    src: 'https://www.novartis.com/news/media-releases/avexis-announces-innovative-zolgensma-gene-therapy-access-programs-us-payers-and-families',
  },
  {
    id: 'fda-aiml-action-plan-2021',
    year: 2021,
    date: '2021-01-12',
    era: 'ai',
    type: 'guidance',
    title: 'FDA AI/ML Software-as-a-Medical-Device Action Plan',
    why: 'First framework specifically for adaptive (learning) AI devices. Introduced the Predetermined Change Control Plan idea.',
    detail:
      'Five-action plan: tailored regulatory framework, Good Machine Learning Practice, patient-centred transparency, real-world performance monitoring, evaluation methods. Followed by GMLP guiding principles (Oct 2021) and PCCP draft guidance (Apr 2023).',
    src: 'https://www.fda.gov/news-events/press-announcements/fda-releases-artificial-intelligencemachine-learning-action-plan',
  },
  {
    id: 'aduhelm-approved-2021',
    year: 2021,
    date: '2021-06-07',
    era: 'ai',
    type: 'approval',
    title: 'Aduhelm — accelerated approval despite advisory-committee No vote',
    why: 'FDA approved over the unanimous objection of its own advisory committee. Three committee members resigned in protest. Set the trigger for the 2022 CMS NCD that would kill it.',
    detail:
      'Biogen aducanumab, first Alzheimer\'s drug since 2003. FDA used the surrogate endpoint of amyloid-plaque reduction. Initial price ~$56K/year (later cut to ~$28K). The four-way collision was about to begin — see CMS NCD 200.3 (April 2022) below.',
    src: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8491638/',
  },
  {
    id: 'microsoft-nuance-2022',
    year: 2022,
    date: '2022-03-04',
    era: 'ai',
    type: 'approval',
    title: 'Microsoft completes Nuance acquisition — $19.7bn, the largest healthcare AI deal ever',
    why: 'Sets the strategic-acquisition exit pattern. Tempus-style IPO is the rare path; Nuance-style strategic buyout into existing distribution is the dominant exit channel.',
    detail:
      'All-cash. At time of acquisition Nuance was in 77% of US hospitals, used by 55% of US physicians and 75% of US radiologists — the dominant ambient clinical AI infrastructure. Microsoft\'s rationale: "double our healthcare TAM to ~$500bn." Dragon Ambient eXperience became Microsoft DAX Copilot, now under much of Epic\'s ambient-scribe integration.',
    src: 'https://news.microsoft.com/source/2022/03/04/microsoft-completes-acquisition-of-nuance-ushering-in-new-era-of-outcomes-based-ai/',
  },
  {
    id: 'cms-ncd-amyloid-2022',
    year: 2022,
    date: '2022-04-07',
    era: 'ai',
    type: 'guidance',
    title: 'CMS NCD 200.3 — amyloid mAbs covered only inside CMS-approved trials',
    why: 'The actual mechanism that killed Aduhelm. Coverage with Evidence Development = "covered, but only if you run our trial." Worst-case CMS outcome for any Class B+ AI startup; not refusal, structural restriction.',
    detail:
      'National Coverage Determination on monoclonal antibodies directed against amyloid for Alzheimer\'s disease, with Coverage with Evidence Development restriction. Made commercial deployment impossible regardless of FDA approval. Biogen withdrew EU MAA April 20 2022; discontinued Aduhelm January 2024. NCD-CED is the mechanism every founder talking to CMS for breakthrough coverage needs to plan for.',
    src: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?NCDId=372',
  },
  {
    id: 'ira-2022',
    year: 2022,
    date: '2022-08-16',
    era: 'ai',
    type: 'law',
    title: 'IRA — Medicare can negotiate drug prices for the first time',
    why: 'Rewires the entire post-launch revenue arc for Medicare-covered drugs. Small molecules eligible from year 7 post-approval, biologics from year 11 — explicitly shifting pharma R&D toward biologics and away from small molecules.',
    detail:
      'Public Law 117-169. Three structural changes: (1) drug price negotiation — 10 drugs in 2026, 15 in 2027 (incl. Ozempic + Wegovy), 15 in 2028, 20/year from 2029; (2) $2,000 annual OOP cap for Part D from 2025; insulin capped at $35/month from 2023; (3) inflation cap on Medicare price increases. Multiple manufacturer constitutional challenges still active.',
    src: 'https://www.cms.gov/inflation-reduction-act-and-medicare/medicare-drug-price-negotiation',
  },
  {
    id: 'fda-cds-final-2022',
    year: 2022,
    date: '2022-09-28',
    era: 'ai',
    type: 'guidance',
    title: 'FDA CDS Software final guidance — what AI is and is not a device',
    why: 'Defines the four-criterion test from Cures Act Section 3060. Most generative-AI clinical tools FAIL criterion 4 ("HCP can independently review the basis") because LLM outputs are not traceable to verifiable rules.',
    detail:
      'Software is excluded from device regulation only if it: (1) does not acquire/process/analyze medical images, signals, or IVD patterns; (2) displays/analyzes/prints medical info; (3) supports an HCP\'s decision; (4) provides recommendations the HCP can independently review the basis for. Fail any one — usually #4 for LLMs — and it\'s a device under FDA jurisdiction.',
    src: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software',
  },
  {
    id: 'outcome-health-fraud-2023',
    year: 2023,
    date: '2023-04-26',
    era: 'ai',
    type: 'withdrawal',
    title: 'Outcome Health founders convicted — $1bn investor fraud',
    why: 'The second major US healthcare-AI-adjacent fraud after Theranos. Goldman Sachs, Pritzker, Alphabet\'s CapitalG took ~$487m in losses. Capital-only failure pattern repeats.',
    detail:
      'Rishi Shah and Shradha Agarwal (Outcome Health) convicted on multiple counts of wire fraud + securities fraud + bank fraud in federal court. Misrepresented advertising-impression data to inflate ad-tech-in-clinics revenue. Different from Theranos in mechanism (data fraud vs. clinical fraud) but same capital-only collapse signal.',
    src: 'https://www.justice.gov/usao-ndil/pr/founders-and-former-executive-outcome-health-convicted-15-billion-corporate-fraud',
  },
  {
    id: 'ira-first-10-2023',
    year: 2023,
    date: '2023-08-29',
    era: 'ai',
    type: 'pricing',
    title: 'CMS announces first 10 drugs for IRA negotiation',
    why: 'Eliquis, Xarelto, Januvia, Jardiance, Enbrel, Imbruvica, Farxiga, Entresto, Stelara, NovoLog. Effective Jan 1 2026. ~38% average discount. The pharma earthquake first dates appear on the calendar.',
    detail:
      'CMS estimated $6bn Medicare savings if 2024 negotiated prices had been in effect 2023. Negotiated 30-day prices announced August 15 2024: e.g. Eliquis $231 vs $521 list, Imbruvica $9,319 vs $14,934 list, Enbrel $2,355 vs $7,106 list.',
    src: 'https://www.cms.gov/files/document/fact-sheet-medicare-selected-drug-negotiation-list-ipay-2026.pdf',
  },
  {
    id: 'walmart-health-2024',
    year: 2024,
    date: '2024-04-30',
    era: 'ai',
    type: 'withdrawal',
    title: 'Walmart Health closes all 51 clinics',
    why: 'Same lesson as Forward and Babylon: primary-care unit economics under existing reimbursement do not work, no matter how well-funded the buyer. AI is not the gap; payment is.',
    detail:
      'Walmart cited "challenging reimbursement environment and rising operating costs." The wealthiest retail-clinic operator in America couldn\'t make it pencil. Closure announced April 30, 2024; clinics wound down through 2024.',
    src: 'https://corporate.walmart.com/news/2024/04/30/an-update-on-walmart-health',
  },
  {
    id: 'fda-ldt-final-rule-2024',
    year: 2024,
    date: '2024-05-06',
    era: 'ai',
    type: 'guidance',
    title: 'FDA LDT Final Rule — phase out enforcement discretion',
    why: 'FDA tries to close the LDT loophole that Theranos used. Five-stage phaseout to 2028, requiring premarket review for high-risk lab-developed tests. Next 18 months will rewrite this — see September 2025 below.',
    detail:
      'Federal Register 89 FR 37286. Reclassified LDTs as IVDs under FDCA. Industry immediately challenged in Eastern District of Texas. American Clinical Laboratory Association v. FDA filed almost simultaneously with publication.',
    src: 'https://www.federalregister.gov/documents/2024/05/06/2024-08935/medical-devices-laboratory-developed-tests',
  },
  {
    id: 'tempus-ipo-2024',
    year: 2024,
    date: '2024-06-14',
    era: 'ai',
    type: 'approval',
    title: 'Tempus AI IPO — first major US healthcare AI listing post-SPAC era',
    why: 'Listed on Nasdaq (TEM) at $37/share, $8.1bn valuation. Counter-example to the Babylon SPAC failure. Confirms that pharma-pull (AstraZeneca/Pfizer/GSK/Merck/BMS contracts) carries the public-market story, not patient revenue.',
    detail:
      'Raised $410.7m at IPO. First-day close ~$6.65bn market cap. Pharma-data services + multimodal oncology platform. Patient revenue still small share of total — pharma data partnerships are the carrying axis.',
    src: 'https://www.fiercehealthcare.com/health-tech/tempus-ai-shares-jump-15-stock-market-debut-ipo-priced-over-6b-valuation',
  },
  {
    id: 'cms-tcet-2024',
    year: 2024,
    date: '2024-07-12',
    era: 'ai',
    type: 'guidance',
    title: 'CMS TCET — Transitional Coverage for Emerging Technologies operational',
    why: 'The modernised replacement for failed MCIT/MEDCAC pathway. Up to 5 NCDs per year initiated through TCET for FDA-designated breakthrough devices. The actual answer to "how does this get paid for once cleared."',
    detail:
      'Voluntary pathway operational starting July 2024. For FDA-designated breakthrough devices to get expedited Medicare coverage. Replaces the older MCIT (Medicare Coverage of Innovative Technology) which CMS rescinded December 2021. Every AI startup pitching CMS in 2025 is choosing between NCD / LCD / NTAP / TCET — TCET is the breakthrough express lane.',
    src: 'https://www.cms.gov/medicare/coverage/coverage-emerging-technologies',
  },
  {
    id: 'ira-second-15-2025',
    year: 2025,
    date: '2025-01-17',
    era: 'ai',
    type: 'pricing',
    title: 'CMS announces second 15 drugs for IRA negotiation — incl. Ozempic + Wegovy',
    why: 'GLP-1s enter the negotiation list. Second cohort effective January 1, 2027. The pattern: drugs that disproportionately hit Medicare populations are first in line.',
    detail:
      'Includes Ozempic, Wegovy, Trelegy Ellipta, Otezla, Xtandi, Pomalyst, Ofev, Linzess, Calquence, Austedo, Breo Ellipta, Tradjenta, Vraylar, Janumet, Otezla. Multiple manufacturer constitutional challenges still active in courts.',
    src: 'https://www.kff.org/medicare/faqs-about-the-inflation-reduction-acts-medicare-drug-price-negotiation-program/',
  },
  {
    id: '23andme-bankruptcy-2025',
    year: 2025,
    date: '2025-03-23',
    era: 'ai',
    type: 'withdrawal',
    title: '23andMe Chapter 11 — the genomics-data sovereignty test case',
    why: '15m+ customer DNA samples sold via Section 363 bankruptcy process. Regeneron acquired diagnostic + research arms (May 2025). What happens to consumer-genomic data when the company folds is no longer hypothetical.',
    detail:
      'Filed Chapter 11 March 2025. Customer DNA + phenotype data became a bankruptcy asset. State attorneys-general intervened to require notification + opt-out before transfer. Set the operational template for what data sovereignty looks like when a health-data company collapses.',
    src: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001804591',
  },
  {
    id: 'abridge-series-e-2025',
    year: 2025,
    date: '2025-06-24',
    era: 'ai',
    type: 'approval',
    title: 'Abridge $300m Series E — $5.3bn valuation, the largest AI-healthcare raise of 2024–2025',
    why: 'a16z-led with Khosla following. Doubled valuation in 4 months from $2.75bn February Series D ($250m). 150+ health-system customers, $117m contracted ARR Q1 2025. Ambient-scribe platform. The capital signal nobody is reading correctly.',
    detail:
      'Pure-play healthcare AI. Epic-integrated. Same architectural slot Microsoft bought into via Nuance — but third-party rather than Microsoft-owned. The Abridge vs Microsoft DAX competitive arc is the single most important platform-vs-startup story in healthcare AI right now.',
    src: 'https://www.abridge.com/blog/series-e',
  },
  {
    id: 'fda-ldt-rescinded-2025',
    year: 2025,
    date: '2025-09-19',
    era: 'ai',
    type: 'guidance',
    title: 'FDA rescinds LDT Final Rule — status quo restored after court vacatur',
    why: 'After Eastern District of Texas vacated the May 2024 rule (FDA exceeded statutory authority — Congress assigned LDTs to CMS via CLIA), FDA chose not to appeal and formally rescinded September 2025. LDTs back under CLIA enforcement discretion.',
    detail:
      'American Clinical Laboratory Association v. FDA. Court held LDTs are services not devices, regulated under CLIA not FDCA. FDA reverted 21 CFR 809.3 to pre-2024 language. For diagnostic AI on the LDT pathway (genomic NGS, multi-cancer early detection, AI pathology), the regulatory map snapped back to 2023 rules. Investors and acquirers are pricing this volatility.',
    src: 'https://www.federalregister.gov/agencies/food-and-drug-administration',
  },
  {
    id: 'ama-appendix-s-2021',
    year: 2021,
    date: '2021-09-01',
    era: 'ai',
    type: 'code',
    title: 'AMA CPT Appendix S — official AI taxonomy (operationally narrow)',
    why: 'First time the billing system formally distinguished assistive / augmentative / autonomous AI. Operationally narrow: <5% of FDA-cleared AI products have unbundled CPT codes; the rest are billed bundled into existing imaging/E&M codes if at all.',
    detail:
      'Effective January 1, 2022. Only two AI applications hold Category I CPT codes today: 92229 (autonomous diabetic-retinopathy screening, IDx-DR class) and 75580 (augmentative coronary FFR-CT, HeartFlow/Cleerly). A handful of others sit in Category III — temporary, payment uncertain, expires in 5 years unless converted to Cat I. The Cat III → Cat I conversion is where most AI products die.',
    src: 'https://www.ama-assn.org/practice-management/cpt/cpt-appendix-s-ai-taxonomy-medical-services-procedures',
  },
  {
    id: 'leqembi-accel-2023',
    year: 2023,
    date: '2023-01-06',
    era: 'ai',
    type: 'approval',
    title: 'Leqembi (lecanemab) accelerated approval — $26,500/year',
    why: 'Eisai / Biogen learned from Aduhelm: priced at one-third of Aduhelm\'s launch price and ran the confirmatory trial first.',
    detail:
      'Anti-amyloid antibody with documented 27% slowing of CDR-SB cognitive decline at 18 months in the CLARITY-AD trial. Comes with the ARIA risk (amyloid-related imaging abnormalities) — which itself drives demand for AI-based MRI monitoring.',
    src: 'https://media-us.eisai.com/2023-01-06-EISAIS-APPROACH-TO-U-S-PRICING-FOR-LEQEMBI-TM-LECANEMAB-,-A-TREATMENT-FOR-EARLY-ALZHEIMERS-DISEASE,-SETS-FORTH-OUR-CONCEPT-OF-SOCIETAL-VALUE-OF-MEDICINE-IN-RELATION-TO-PRICE-OF-MEDICINE',
  },
  {
    id: 'leqembi-trad-2023',
    year: 2023,
    date: '2023-07-06',
    era: 'ai',
    type: 'approval',
    title: 'FDA converts Leqembi to traditional approval',
    why: 'Triggered Medicare coverage under National Coverage Determination — but only for patients enrolled in a CMS-mandated registry.',
    detail:
      'Confirmatory trial (Study 301) showed clinical benefit, satisfying the accelerated-approval condition. CMS opened reimbursement, but with documentation requirements that materially limit uptake. KFF estimated ~100K patients × $26.5K = ~$2.7B annual Medicare spend.',
    src: 'https://www.fda.gov/news-events/press-announcements/fda-converts-novel-alzheimers-disease-treatment-traditional-approval',
  },
  {
    id: 'aduhelm-withdrawn-2024',
    year: 2024,
    date: '2024-01-31',
    era: 'ai',
    type: 'withdrawal',
    title: 'Biogen withdraws Aduhelm — killed by CMS NCD 200.3 with CED restriction',
    why: 'Not a market refusal — a structural CMS restriction. NCD 200.3 (April 2022) covered Aduhelm only for patients in CMS-approved trials. "Covered, but only inside our trial" is the worst-case CMS outcome for any breakthrough AI/biologic, not outright denial.',
    detail:
      'Biogen\'s "not for safety or efficacy concerns" framing is technically correct but elides the mechanism. The actual cause chain: FDA accelerated approval over advisory-committee No vote → CMS NCD 200.3 with Coverage with Evidence Development restricting reimbursement to clinical-trial enrolees → weak commercial uptake → Biogen ended ENVISION confirmatory study and discontinued the drug January 2024.',
    src: 'https://investors.biogen.com/news-releases/news-release-details/biogen-realign-resources-alzheimers-disease-franchise',
  },
  {
    id: 'fda-ai-devices-950-2024',
    year: 2024,
    date: '2024-08-07',
    era: 'ai',
    type: 'approval',
    title: '950 AI/ML-enabled medical devices on FDA list — overwhelmingly 510(k)',
    why: 'Headline number is correct (≈950 by Aug 2024, up from <100 in 2018) but mostly reflects 510(k) saturation in chest X-ray / CT triage / mammography / retinal imaging. Truly novel De Novo authorisations are <30 cumulatively; PMAs vanishingly rare.',
    detail:
      'Approximate breakdown: ~900+ via 510(k) predicate-device pathway; ~30 via De Novo (novel low-to-moderate-risk); <5 via PMA (Class III). The market is dominated by ~5–10 vendors holding multiple 510(k) clearances each across a small number of imaging categories. Breaking into novel AI categories is much harder than the headline suggests.',
    src: 'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices',
  },

  // ─── AI era — graveyard cases (FDA cleared ≠ market access) ─────────────
  {
    id: 'theranos-collapse',
    year: 2018,
    date: '2018-09-05',
    era: 'ai',
    type: 'withdrawal',
    title: 'Theranos dissolves — the LDT loophole exposed',
    why: 'Out of hundreds of advertised tests, only one (HSV-1 IgG) ever got 510(k). The rest ran under the lab-developed-test loophole, where FDA exercised enforcement discretion.',
    detail:
      'Elizabeth Holmes raised ~$700M and reached a $9B valuation against essentially zero FDA-cleared technology. Theranos formally dissolved in September 2018. Holmes convicted of fraud January 2022. The case is the textbook argument for closing the LDT loophole.',
    src: 'https://www.fda.gov/about-fda/regulatory-news-stories-and-features/patient-advocacy-lies-heart-fda-agents-theranos-case',
  },
  {
    id: 'pear-bankrupt',
    year: 2023,
    date: '2023-04-07',
    era: 'ai',
    type: 'withdrawal',
    title: 'Pear Therapeutics — first prescription digital therapeutic, killed by payers',
    why: 'FDA cleared three PDTs (reSET 2017, reSET-O 2018, Somryst 2020). Insurers refused to reimburse. Assets sold for $6.05M against $32M debt.',
    detail:
      'Filed Chapter 11 in Delaware April 7, 2023. Pioneered the prescription-digital-therapeutic category but couldn\'t convert FDA clearance into a payer formulary line. Substance-use apps later resurrected by PursueCare in December 2023.',
    src: 'https://www.sec.gov/Archives/edgar/data/1835567/000183556723000020/peartherapeuticsfilesforch.htm',
  },
  {
    id: 'babylon-bankrupt',
    year: 2023,
    date: '2023-08-09',
    era: 'ai',
    type: 'withdrawal',
    title: 'Babylon Health collapses — $4.2B SPAC to £500K asset sale',
    why: 'Listed on NYSE October 2021 at $4.2B via SPAC. Two years later, US arms in Chapter 7; UK assets sold for £500K. AI symptom-checker safety claims discredited by UK regulators.',
    detail:
      'After failed take-private merger with MindMaze, Babylon delisted June 2023, filed Chapter 7 August 2023, dissolved September 2023. The collapse marked the end of the first SPAC-fueled wave of consumer-facing AI symptom-checkers.',
    src: 'https://www.healthcaredive.com/news/Babylon-Chapter-7-bankruptcy/691218/',
  },
  {
    id: 'olive-shutdown',
    year: 2023,
    date: '2023-10-31',
    era: 'ai',
    type: 'withdrawal',
    title: 'Olive AI shuts down — $4B unicorn to zero',
    why: 'Raised $902M, peaked at $4B valuation 2021. "AI-driven automation" turned out to rely heavily on manual back-office workers. Total liquidation October 2023.',
    detail:
      'Marketed as healthcare back-office RPA + AI. Sold clearinghouse and patient access to Waystar; prior-auth unit to Humata. CEO admitted "fast-paced growth and lack of focus" had strained the platform. The capital-only failure mode.',
    src: 'https://www.fiercehealthcare.com/health-tech/once-high-flying-unicorn-olive-ai-sells-two-key-businesses-winds-down-operations',
  },
  {
    id: 'icobrain-aria-fda',
    year: 2024,
    date: '2024-11-07',
    era: 'ai',
    type: 'approval',
    title: 'icobrain aria — first FDA-cleared AI for ARIA monitoring',
    why: 'Anti-amyloid Alzheimer drugs (Leqembi, Donanemab) require recurring MRI surveillance for amyloid-related imaging abnormalities. icobrain aria became the first AI tool authorised for this niche.',
    detail:
      'Belgian company icometrix received FDA 510(k) clearance for icobrain aria — automated longitudinal detection of ARIA-E and ARIA-H from brain MRI. The clearance came 16 months after Leqembi got traditional FDA approval, which created the regulatory demand for monitoring tooling.',
    src: 'https://www.biospace.com/press-releases/icometrix-is-proud-to-announce-the-market-approval-of-icobrain-aria-the-first-market-approved-solution-for-monitoring-amyloid-related-imaging-abnormalities-aria-in-alzheimers-disease',
  },
  {
    id: 'forward-shutdown',
    year: 2024,
    date: '2024-11-12',
    era: 'ai',
    type: 'withdrawal',
    title: 'Forward Health shuts down — no payer pathway for autonomous primary care',
    why: 'Same lesson as Babylon, Pear, Walmart Health: no reimbursement pathway = no revenue = collapse, regardless of FDA status or capital raised. The "AI doctor" regulatory pathway does not exist (would require De Novo or PMA for autonomous diagnosis/treatment).',
    detail:
      '$657M raised; only 3 CarePods deployed at scale. The unit-economics math: fixed CapEx per pod + low patient throughput + premium-price patient acquisition cost = no path to break-even. CMS does not pay for AI-only encounters; commercial payers do not either; patient self-pay at premium price did not scale. Founded 2016 by ex-Googler Adrian Aoun; pivoted from concierge clinics to kiosks late 2023; closed November 2024.',
    src: 'https://www.fiercehealthcare.com/health-tech/primary-care-player-forward-shutters-after-raising-400m-rolling-out-carepods',
  },
  {
    id: 'bayer-blackford-exit',
    year: 2025,
    date: '2025-09-09',
    era: 'ai',
    type: 'withdrawal',
    title: 'Bayer exits radiology AI marketplace — Calantic and Blackford wound down',
    why: 'Five-year experiment to be the App Store of radiology AI ends. Bayer cited narrow reimbursement, slow adoption, and IT-integration friction. 150+ third-party AI apps lose their distribution channel.',
    detail:
      'Bayer acquired Blackford Analysis in 2023 to anchor its Calantic AI platform. By Sep 2025, Bayer announced wind-down — proof that even with FDA clearances and 60+ vendor partnerships, the radiology AI marketplace lacks a sustainable revenue model under current CMS frameworks.',
    src: 'https://hitconsultant.net/2025/09/09/bayer-exits-radiology-ai-market-discontinuing-calantic-and-blackford/',
  },
  {
    id: 'ge-icometrix-acq',
    year: 2025,
    date: '2025-09-10',
    era: 'ai',
    type: 'approval',
    title: 'GE HealthCare to acquire icometrix — 10 months from FDA to M&A',
    why: 'icobrain aria received FDA clearance Nov 2024. GE announced acquisition Sep 2025. The new Alzheimer drugs created a CPT-coded niche that pulled an exit before any other ARIA-AI vendor reached scale.',
    detail:
      'GE HealthCare announced intent to acquire Belgian neuroimaging-AI firm icometrix to expand the ARIA monitoring footprint across all vendor MRI systems. Confirms that pharma-pull (Leqembi, Donanemab) is the strongest single signal for AI-medtech exit timing.',
    src: 'https://investor.gehealthcare.com/news-releases/news-release-details/ge-healthcare-announces-intent-acquire-icometrix-strengthen',
  },

  // ─── Roadmap ────────────────────────────────────────────────────────────
  {
    id: 'pccp-final-2025',
    year: 2024,
    date: '2024-12-04',
    era: 'roadmap',
    type: 'guidance',
    title: 'FDA finalises Predetermined Change Control Plan guidance',
    why: 'Lets manufacturers ship pre-approved improvement plans for AI devices, instead of refiling for every model retrain. Removes the biggest practical barrier to adaptive AI.',
    detail:
      'Final guidance issued December 2024; FDA webinar January 14, 2025. A PCCP describes planned device modifications, the methodology to validate them, and the impact assessment — all reviewed once at marketing submission. Modifications inside the plan don\'t need a new submission.',
    src: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence',
  },
  {
    id: 'access-tempo-2026',
    year: 2026,
    date: '2026-07-05',
    era: 'roadmap',
    type: 'guidance',
    title: 'CMS ACCESS Model + FDA TEMPO Pilot launch',
    why: 'First coordinated CMS+FDA pathway for technology-enabled chronic-care devices: outcome-aligned reimbursement under ACCESS, enforcement-discretion runway under TEMPO.',
    detail:
      'CMS ACCESS Model (Advancing Chronic Care with Effective, Scalable Solutions) starts July 5, 2026, runs 10 years, covers high blood pressure, diabetes, chronic musculoskeletal pain, depression. FDA TEMPO accepts statements of interest from January 2026, plans up to ~10 manufacturers per clinical use area.',
    src: 'https://www.cms.gov/priorities/innovation/innovation-models/access',
  },
];

// "We are here" pseudo-event — rendered above the timeline as the entry
// point. Reader enters at the present collision and descends backwards.
export const WE_ARE_HERE = {
  year: 2026,
  marker: 'We are here',
  lead: 'Bayer just exited the radiology-AI marketplace. GE bought icometrix for ARIA monitoring. Aduhelm is withdrawn, Pear is dead, Forward is dead, Theranos is a Netflix episode. The chain that decided each of these outcomes was built piece by piece over 120 years. Scroll down to see how it got assembled.',
};
