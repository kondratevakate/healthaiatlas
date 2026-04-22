// Oncology AI Landscape data — ported from oncology_ai_map_v7.html

export interface OncoBubble {
  c: string; p: string; dp: string; d: number; a: number;
  tm: string; e: string; r: string; et: string; desc: string; src?: string;
}

export interface OncoReliability {
  c: string; d: string; p: string; src?: string;
}

export interface OncoPharmaCellItem {
  v: string; p: string; d: string; src?: string;
}

export const ONCO_STATS = [
  { n: '403', l: 'Events' },
  { n: '66', l: 'Companies' },
  { n: '33', l: 'FDA Cleared' },
  { n: '69', l: 'High Evidence' },
  { n: '11', l: 'Decision Pts' },
];

export const ONCO_TUMOR_COLORS: Record<string, string> = {
  breast: 'hsl(340 60% 65%)',
  lung: 'hsl(215 80% 65%)',
  colorectal: 'hsl(25 50% 55%)',
  colorectal_mCRC: 'hsl(25 50% 55%)',
  colon: 'hsl(25 50% 55%)',
  prostate: 'hsl(var(--primary))',
  hematology: 'hsl(250 60% 70%)',
  'pan-cancer': 'hsl(160 60% 50%)',
  pancreatic: 'hsl(30 80% 55%)',
  cervical: 'hsl(280 40% 70%)',
};

export const ONCO_DP_ORDER = [
  'drug_discovery','biomarker_scoring','molecular_profiling','diagnosis',
  'trial_matching','evidence_generation','screening','treatment_selection',
  'MRD_monitoring','medical_information','clinical_documentation',
];

export const ONCO_DP_LABELS: Record<string, string> = {
  drug_discovery: 'Drug Discovery',
  biomarker_scoring: 'Biomarker Scoring',
  molecular_profiling: 'Molecular Profiling',
  diagnosis: 'Diagnosis',
  trial_matching: 'Trial Matching',
  evidence_generation: 'Evidence Generation',
  screening: 'Screening',
  treatment_selection: 'Treatment Selection',
  MRD_monitoring: 'MRD Monitoring',
  medical_information: 'Medical Information',
  clinical_documentation: 'Clinical Documentation',
};

export const ONCO_ET_LABELS: Record<string, string> = {
  Funding_Round: 'Funding',
  Acquisition: 'M&A',
  IPO: 'IPO',
  Product_Launch: 'Launch',
  Partnership: 'Partner',
  Strategic_Investment: 'Strategic',
  Event: 'Event',
  Clinical_Trial_Result: 'Trial Result',
  Founding: 'Founded',
  FDA_Cleared: 'FDA Cleared',
};

export const ONCO_GRP_COLORS: Record<string, string> = {
  'R&D': 'hsl(250 60% 70%)',
  'Trials': 'hsl(45 90% 60%)',
  'Patient': 'hsl(160 60% 50%)',
  'Evidence': 'hsl(215 80% 65%)',
  'Ops': 'hsl(30 80% 55%)',
};

export const ONCO_BV_ORDER = [
  'pipeline_acceleration','biomarker_discovery','companion_diagnostics',
  'diagnostic_precision','trial_acceleration','RWE_evidence_generation',
  'treatment_optimization','recurrence_surveillance','medinfo_scale','access_support',
];

export const ONCO_BV_LABELS: Record<string, string> = {
  pipeline_acceleration: 'Pipeline',
  biomarker_discovery: 'Biomarker',
  companion_diagnostics: 'Companion Dx',
  diagnostic_precision: 'Diagnostics',
  trial_acceleration: 'Trial Accel.',
  treatment_optimization: 'Treatment',
  RWE_evidence_generation: 'RWE',
  recurrence_surveillance: 'MRD',
  medinfo_scale: 'MedInfo AI',
  access_support: 'Access',
};

export const ONCO_BV_GROUPS: Record<string, string> = {
  pipeline_acceleration: 'R&D',
  biomarker_discovery: 'R&D',
  companion_diagnostics: 'R&D',
  diagnostic_precision: 'R&D',
  trial_acceleration: 'Trials',
  RWE_evidence_generation: 'Evidence',
  treatment_optimization: 'Patient',
  recurrence_surveillance: 'Patient',
  medinfo_scale: 'Ops',
  access_support: 'Ops',
};

export const ONCO_PHARMA_COS = [
  'Roche','AstraZeneca','Novartis','Pfizer','Merck','BMS','Sanofi','Eli Lilly','J&J/Janssen','GSK','Amgen',
];

export const ONCO_OPP_COLS = ['medinfo_scale', 'access_support'];

export const ONCO_BUBBLES: OncoBubble[] = [
  {c:'Saama Technologies',p:'Life Science Analytics Cloud (LSAC)',dp:'trial_matching',d:2000,a:0,tm:'pan-cancer',e:'N/A',r:'none',et:'Founding',desc:'Saama Technologies founded as a data analytics company; pivots to life sciences',src:'https://www.crunchbase.com/organization/saama-technologies'},
  {c:'Foundation Medicine',p:'FoundationOne',dp:'treatment_selection',d:2013.67,a:108,tm:'pan-cancer',e:'Medium',r:'none',et:'IPO',desc:'Foundation Medicine raises $108M in its NASDAQ IPO',src:'https://www.businesswire.com/news/home/20130925005128/en/Foundation-Medicine-Raises-108-Million-in-Initial-Public-Offering'},
  {c:'Flatiron Health',p:'Flatiron RWE platform',dp:'evidence_generation',d:2014,a:300,tm:'pan-cancer',e:'N/A',r:'none',et:'Funding_Round',desc:'Multiple venture rounds led by Google Ventures, Roche Venture Fund',src:'https://cancerletter.com/the-cancer-letter/20180302_1'},
  {c:'Guardant Health',p:'Guardant360',dp:'evidence_generation',d:2014,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Product_Launch',desc:'Launch of Guardant360, first comprehensive NGS-based liquid biopsy',src:'https://lbx-summit.com/sponsor/guardant-health'},
  {c:'Natera',p:'Panorama; Signatera',dp:'MRD_monitoring',d:2015.5,a:126,tm:'pan-cancer',e:'N/A',r:'none',et:'IPO',desc:'Natera raises $126M in NASDAQ IPO',src:'https://investors.natera.com/news-releases/news-release-details/natera-announces-pricing-initial-public-offering'},
  {c:'Tempus AI',p:'Tempus platform',dp:'treatment_selection',d:2016,a:500,tm:'pan-cancer',e:'Low',r:'none',et:'Funding_Round',desc:'Early venture rounds (Series A–C) to build sequencing labs',src:'https://www.fiercehealthcare.com/health-tech/precision-medicine-company-tempus-ai-files-go-public'},
  {c:'Guardant Health',p:'Project LUNAR',dp:'MRD_monitoring',d:2016,a:0,tm:'pan-cancer',e:'Low',r:'none',et:'Event',desc:'Announcement of Project LUNAR for early cancer detection',src:'https://www.prnewswire.com/news-releases/guardant-health-to-create-a-new-500-plus-gene-liquid-biopsy-panel-with-several-leading-biopharmaceutical-companies-300385087.html'},
  {c:'Ibex Medical Analytics',p:'Galen platform',dp:'diagnosis',d:2016,a:0,tm:'pan-cancer',e:'Low',r:'none',et:'Founding',desc:'Ibex founded in Israel for AI-powered pathology diagnostics',src:'https://www.crunchbase.com/organization/ibex-medical-analytics'},
  {c:'Proscia',p:'Pathology Cloud',dp:'diagnosis',d:2016,a:1,tm:'pan-cancer',e:'Low',r:'none',et:'Funding_Round',desc:'Seed round of $1M for digital pathology platform',src:'https://proscia.com/press-releases/investors-inject-1m-in-digital-pathology-startup-proscia'},
  {c:'Grail',p:'',dp:'diagnosis',d:2016,a:100,tm:'pan-cancer',e:'Low',r:'none',et:'Founding',desc:'Grail founded as Illumina spin-out with backing from Jeff Bezos, Bill Gates',src:'https://grail.com/about-us'},
  {c:'BMS',p:'PathAI IO biomarker models',dp:'biomarker_scoring',d:2016,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Partnership',desc:'BMS establishes earliest pharma relationship with PathAI',src:'https://www.pathai.com/about'},
  {c:'Caris Life Sciences',p:'',dp:'treatment_selection',d:2016,a:100,tm:'pan-cancer',e:'Low',r:'none',et:'Funding_Round',desc:'Early funding to scale molecular profiling operations',src:'https://www.carislifesciences.com'},
  {c:'Grail',p:'Galleri',dp:'screening',d:2017.17,a:900,tm:'pan-cancer',e:'Low',r:'none',et:'Funding_Round',desc:'Grail raises $900M Series B for multi-cancer early detection',src:'https://www.businesswire.com/news/home/20170303005183/en/GRAIL-Raises-900-Million-Series-B-Financing'},
  {c:'Tencent Miying',p:'Tencent Miying',dp:'screening',d:2017.58,a:0,tm:'pan-cancer',e:'Medium',r:'NMPA_approve',et:'Product_Launch',desc:'First AI medical imaging product for esophageal cancer screening',src:'https://technode.com/2018/02/11/tencent-medical-ecosystem/'},
  {c:'Exact Sciences',p:'cfDNA multi-cancer platform',dp:'diagnosis',d:2018,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Partnership',desc:'Mayo Clinic and Exact Sciences expand blood-based multi-cancer collaboration',src:'https://www.exactsciences.com/newsroom/press-releases/exact-sciences-advances-pipeline-capabilities-with-mayo-clinic'},
  {c:'Roche',p:'Flatiron RWE platform; OncoEMR',dp:'evidence_generation',d:2018.08,a:1900,tm:'pan-cancer',e:'High',r:'none',et:'Acquisition',desc:'Roche acquires Flatiron Health for $1.9B',src:'https://www.roche.com/media/releases/med-cor-2018-02-15'},
  {c:'Lunit',p:'INSIGHT CXR',dp:'screening',d:2018.5,a:15,tm:'lung',e:'N/A',r:'N/A',et:'Funding_Round',desc:'Lunit INSIGHT CXR lung screening AI',src:'https://www.healthcareittoday.com/2018/07/16/ai-healthcare-company-lunit-raises-15-million-in-series-b-funding-round/'},
  {c:'Lunit',p:'INSIGHT MMG',dp:'screening',d:2019,a:4.3,tm:'breast',e:'N/A',r:'N/A',et:'Strategic_Investment',desc:'Lunit INSIGHT MMG mammography screening AI',src:'https://www.lunit.io/en/news/lunit-secures-26m-in-series-c-funding-round-led-by-asian-investors'},
  {c:'Novartis',p:'Novartis AI Innovation Lab',dp:'trial_matching',d:2019,a:0,tm:'pan-cancer',e:'Low',r:'none',et:'Event',desc:'Novartis establishes AI Innovation Lab partnering with Microsoft',src:'https://www.novartis.com/news/novartis-and-microsoft-collaborate-transform-medicine-artificial-intelligence'},
  {c:'Deep 6 AI',p:'',dp:'trial_matching',d:2019.25,a:17,tm:'pan-cancer',e:'Low',r:'none',et:'Funding_Round',desc:'Series A for clinical trial matching platform',src:'https://deep6.ai/news/series-a'},
  {c:'Exact Sciences',p:'Oncotype DX Breast',dp:'diagnosis',d:2019.83,a:2800,tm:'breast',e:'High',r:'FDA_cleared',et:'Acquisition',desc:'Exact Sciences acquires Genomic Health for $2.8B',src:'https://investor.exactsciences.com/news-releases/news-release-details/exact-sciences-completes-acquisition-genomic-health'},
  {c:'Merck',p:'PathAI biomarker platform',dp:'biomarker_scoring',d:2019.83,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Strategic_Investment',desc:'Merck GHIF invests in PathAI Series B',src:'https://www.pathai.com/resources'},
  {c:'Veeva Systems',p:'Vault MedInquiry',dp:'medical_information',d:2020,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Product_Launch',desc:'Cloud-based medical information request management',src:'https://www.veeva.com/products/veeva-medinquiry/'},
  {c:'TikaMobile',p:'TikaMSL',dp:'medical_information',d:2020,a:0,tm:'pan-cancer',e:'Low',r:'none',et:'Product_Launch',desc:'Platform for Medical Science Liaisons with KOL discovery',src:'https://www.tikamobile.com/resources/blog/tikamobile-vs-veeva-crm-a-2025-comparison-for-medical-affairs'},
  {c:'PathAI',p:'PD-L1 AI scoring',dp:'biomarker_scoring',d:2020.42,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Clinical_Trial_Result',desc:'PD-L1 AI scoring presented at ASCO 2020',src:'https://www.crunchbase.com/organization/pathai'},
  {c:'Burning Rock Biotech',p:'',dp:'molecular_profiling',d:2020.42,a:281,tm:'pan-cancer',e:'N/A',r:'none',et:'IPO',desc:'Nasdaq IPO raises $281.2M (incl. private placement); China-based NGS molecular profiling',src:'https://www.spglobal.com/marketintelligence/en/news-insights/latest-news-headlines/china-s-burning-rock-raises-281-2m-from-nasdaq-ipo-private-placement-59134528'},
  {c:'Roche',p:'FoundationOne',dp:'treatment_selection',d:2015,a:1000,tm:'pan-cancer',e:'High',r:'FDA_cleared',et:'Acquisition',desc:'Roche acquires 56% stake in Foundation Medicine for ~$1B',src:'https://www.roche.com/media/releases/med-cor-2015-01-12'},
  {c:'Guardant Health',p:'Guardant360 CDx',dp:'treatment_selection',d:2020.67,a:0,tm:'pan-cancer',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Guardant360 CDx approved as companion diagnostic for multiple cancers',src:'https://guardanthealth.com'},
  {c:'Paige',p:'Paige Prostate',dp:'diagnosis',d:2021,a:0,tm:'prostate',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'First AI pathology product to receive FDA De Novo authorization',src:'https://www.paige.ai'},
  {c:'Tempus AI',p:'Tempus xT',dp:'molecular_profiling',d:2021,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Product_Launch',desc:'Tempus xT 648-gene tumor panel for comprehensive genomic profiling',src:'https://www.tempus.com'},
  {c:'PathAI',p:'AISight',dp:'biomarker_scoring',d:2021.25,a:165,tm:'pan-cancer',e:'Medium',r:'none',et:'Funding_Round',desc:'PathAI raises $165M Series C for AISight platform',src:'https://www.pathai.com/resources/pathai-announces-series-c'},
  {c:'Owkin',p:'Owkin Connect',dp:'biomarker_scoring',d:2021.5,a:180,tm:'pan-cancer',e:'Medium',r:'none',et:'Funding_Round',desc:'Owkin raises $180M (incl. $180M from Sanofi) for federated learning in oncology',src:'https://owkin.com/news'},
  {c:'Lunit',p:'SCOPE IO',dp:'biomarker_scoring',d:2021.5,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Product_Launch',desc:'Lunit SCOPE IO for immune phenotype scoring in immuno-oncology',src:'https://www.lunit.io/en/products/lunit-scope-io'},
  {c:'Grail',p:'Galleri',dp:'screening',d:2021.42,a:7100,tm:'pan-cancer',e:'Medium',r:'none',et:'Acquisition',desc:'Illumina acquires Grail for $7.1B (Aug 2021). FTC + EU ordered divestiture; EU fined Illumina $475M for closing early',src:'https://www.ftc.gov/news-events/news/press-releases/2023/04/ftc-orders-illumina-divest-cancer-detection-test-maker-grail-protect-competition-life-saving'},
  {c:'Guardant Health',p:'Shield',dp:'screening',d:2022,a:0,tm:'colorectal',e:'Medium',r:'none',et:'Product_Launch',desc:'Guardant Health Shield for colorectal cancer screening',src:'https://guardanthealth.com'},
  {c:'Ibex Medical Analytics',p:'Galen Prostate; Galen Breast',dp:'diagnosis',d:2022,a:55,tm:'pan-cancer',e:'High',r:'FDA_cleared',et:'Funding_Round',desc:'Ibex raises $55M Series B; FDA clearance for Galen Prostate',src:'https://ibex-ai.com'},
  {c:'Proscia',p:'Concentriq Dx',dp:'diagnosis',d:2022,a:34,tm:'pan-cancer',e:'Medium',r:'FDA_cleared',et:'Funding_Round',desc:'Proscia raises $34M; FDA clearance for Concentriq Dx',src:'https://proscia.com'},
  {c:'Paige',p:'Paige Breast; Clinical',dp:'diagnosis',d:2022.5,a:0,tm:'breast',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Paige Breast AI for detecting breast cancer in pathology slides',src:'https://www.paige.ai'},
  {c:'Natera',p:'Signatera',dp:'MRD_monitoring',d:2022.5,a:0,tm:'colorectal',e:'High',r:'none',et:'Clinical_Trial_Result',desc:'CIRCULATE-Japan confirms ctDNA-guided adjuvant therapy improves DFS in colorectal cancer',src:'https://www.natera.com'},
  {c:'Lunit',p:'INSIGHT MMG',dp:'screening',d:2022.75,a:0,tm:'breast',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Lunit INSIGHT MMG receives FDA clearance for mammography AI',src:'https://www.lunit.io'},
  {c:'Tempus AI',p:'Tempus platform',dp:'treatment_selection',d:2024.42,a:410,tm:'pan-cancer',e:'Medium',r:'none',et:'IPO',desc:'Nasdaq IPO June 14, 2024. Raised $410.7M at $37/share; $6.1B valuation (closed day 1 at ~$6.65B)',src:'https://www.fiercehealthcare.com/health-tech/tempus-ai-shares-jump-15-stock-market-debut-ipo-priced-over-6b-valuation'},
  {c:'Guardant Health',p:'Shield',dp:'screening',d:2024.58,a:0,tm:'colorectal',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Guardant Shield receives FDA approval for blood-based CRC screening',src:'https://guardanthealth.com'},
  {c:'Caris Life Sciences',p:'MI GPT',dp:'treatment_selection',d:2024,a:830,tm:'pan-cancer',e:'Medium',r:'none',et:'Funding_Round',desc:'Caris raises $830M; launches MI GPT oncology-specific LLM',src:'https://www.carislifesciences.com'},
  {c:'Natera',p:'Signatera',dp:'MRD_monitoring',d:2024,a:0,tm:'pan-cancer',e:'High',r:'none',et:'Clinical_Trial_Result',desc:'NCCN includes Signatera ctDNA monitoring in colon cancer guidelines',src:'https://www.natera.com'},
  {c:'Lunit',p:'Lunit SCOPE PD-L1',dp:'biomarker_scoring',d:2024,a:0,tm:'pan-cancer',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Lunit SCOPE PD-L1 receives FDA clearance',src:'https://www.lunit.io'},
  {c:'Grail',p:'Galleri',dp:'screening',d:2024.5,a:0,tm:'pan-cancer',e:'High',r:'none',et:'Clinical_Trial_Result',desc:'NHS-Galleri trial interim results: 2.3x increase in stage I/II cancer detection',src:'https://grail.com'},
  {c:'Exact Sciences',p:'Cologuard Plus',dp:'screening',d:2024,a:0,tm:'colorectal',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Next-gen multi-target stool DNA test with improved sensitivity',src:'https://www.exactsciences.com'},
  {c:'Paige',p:'Paige Prostate Suite',dp:'diagnosis',d:2024,a:70,tm:'prostate',e:'High',r:'FDA_cleared',et:'Funding_Round',desc:'Paige raises $70M Series D for expanded prostate AI suite',src:'https://www.paige.ai'},
  {c:'Guardant Health',p:'GuardantINFORM 2.0',dp:'evidence_generation',d:2025,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Product_Launch',desc:'Next-gen RWE platform for pharma partnerships',src:'https://guardanthealth.com'},
  {c:'Tempus AI',p:'Tempus One',dp:'treatment_selection',d:2025,a:0,tm:'pan-cancer',e:'Medium',r:'none',et:'Product_Launch',desc:'Tempus One unified oncology AI assistant for physicians',src:'https://www.tempus.com'},
  {c:'Lunit',p:'INSIGHT CXR 4.0',dp:'screening',d:2025,a:0,tm:'lung',e:'High',r:'FDA_cleared',et:'Product_Launch',desc:'Lunit INSIGHT CXR 4.0 with enhanced lung nodule detection',src:'https://www.lunit.io'},
];

export const ONCO_RELIABILITY: OncoReliability[] = [
  {c:'Friends of Cancer Research',d:'Digital PATH: 10 AI models evaluated for HER2 scoring on 1,124 WSIs. Overall pairwise agreement only 65.1%. HER2 3+ agreement 85%, but HER2 1+ only 54.5%.',p:'Pathology AI algorithms',src:'https://www.modernpathology.org/article/S0893-3952(25)00242-X/fulltext'},
  {c:'Multiple Vendors',d:'Inter-platform comparison: Paige vs PathAI vs Ibex. Significant variability across scanner types and staining protocols.',p:'Multiple pathology AI',src:'https://www.modernpathology.org/article/S0893-3952(25)00242-X/fulltext'},
  {c:'FDA',d:'FDA has issued warning letters and recalls for AI-enabled medical devices. AI/ML SaMD oversight includes post-market surveillance requirements.',p:'Various AI products',src:'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices'},
  {c:'Academic Studies',d:'AI performance degradation across scanner types and staining protocols documented in multiple studies.',p:'Pathology AI',src:'https://www.modernpathology.org/article/S0893-3952(25)00242-X/fulltext'},
  {c:'Academic Studies',d:'Retractions and corrections of oncology AI papers raising concerns about reproducibility.',p:'Various AI algorithms',src:''},
  {c:'JAMA Oncology',d:'Three commercial mammography AI systems showed significant performance differences. Sensitivity range: 67%–82% depending on system.',p:'Lunit INSIGHT MMG; iCAD ProFound AI',src:'https://jamanetwork.com/journals/jamaoncology/fullarticle/2798732'},
  {c:'Digital PATH Concordance',d:'733 breast cancer patients. HER2 3+ agreement 85% but HER2 1+ only 54.5%. Critical gap for selecting trastuzumab deruxtecan patients.',p:'Multiple HER2 AI scoring',src:'https://www.friendsofcancerresearch.org/digital-path'},
  {c:'Nature Study',d:'Multiple published studies document AI pathology performance degradation across scanner types (Leica, Hamamatsu, Aperio, Phillips).',p:'Multiple pathology AI platforms',src:'https://www.nature.com/articles/s41698-022-00264-0'},
];

export const ONCO_PHARMA: Record<string, OncoPharmaCellItem[]> = {
  'Roche|biomarker_discovery': [{v:'Lunit',p:'NAVIFY Algorithm Suite',d:'SCOPE PD-L1',src:'https://www.lunit.io/en/news'}],
  'Merck|diagnostic_precision': [{v:'PathAI',p:'PathAI platform',d:'Strategic investments from Merck GHIF',src:'https://www.crunchbase.com/organization/pathai'}],
  'AstraZeneca|diagnostic_precision': [{v:'PathAI',p:'PathAI platform',d:'AstraZeneca oncology collaboration',src:'https://www.pathai.com/news'}],
  'AstraZeneca|treatment_optimization': [{v:'Tempus AI',p:'Multimodal oncology model',d:'Strategic collaboration with AstraZeneca',src:'https://www.fiercehealthcare.com/health-tech/precision-medicine-company-tempus-ai-files-go-public'}],
  'GSK|access_support': [{v:'Tempus AI',p:'Tempus data platform',d:'GSK pays $70M upfront for 3 more years',src:'https://www.dennisgong.com/blog/tempusipo/'}],
  'Pfizer|treatment_optimization': [{v:'Tempus AI',p:'Tempus AI platform',d:'Pfizer taps Tempus data library',src:'https://www.dennisgong.com/blog/tempusipo/'}],
  'Merck|treatment_optimization': [{v:'Tempus AI',p:'Tempus Lens Platform',d:'Merck multimodal data collaboration',src:'https://www.fiercehealthcare.com/health-tech/tempus-ai-shares-jump-15-stock-market-debut-ipo-priced-over-6b-valuation'}],
  'AstraZeneca|biomarker_discovery': [
    {v:'PathAI',p:'PathAI biomarker platform',d:'AI-powered pathology biomarker discovery',src:'https://www.pathai.com/resources/pathai-announces-collaboration-with-astrazeneca'},
    {v:'Lunit',p:'SCOPE Genotype Predictor',d:'AI-powered digital pathology risk assessment',src:'https://www.lunit.io/en/media-hub/lunit-announces-collaboration-with-astrazeneca-to-develop-ai-powered-digital-pathology-risk-assessment-tools'},
    {v:'Owkin',p:'Owkin Connect; biomarker models',d:'Federated learning collaboration',src:'https://owkin.com/news/astrazeneca-collaboration'},
    {v:'Multiple AI vendors',p:'AI biomarker and RWE tools',d:'AstraZeneca integrates AI across oncology pipeline',src:'https://www.astrazeneca.com/science/data-science-and-ai'},
  ],
  'Roche|RWE_evidence_generation': [{v:'Flatiron Health',p:'Flatiron RWE platform; OncoEMR',d:'Roche acquires Flatiron for $1.9B',src:'https://www.roche.com/media/releases/med-cor-2018-02-15'}],
  'Merck|companion_diagnostics': [
    {v:'Guardant Health',p:'Guardant360 CDx',d:'Multi-year global strategic collaboration',src:'https://clpmag.com/disease-states/cancer/guardant-health-merck-form-multi-year-partnership-cancer-companion-diagnostics'},
    {v:'PathAI',p:'PathAI CDx platform',d:'Merck GHIF in PathAI Series C ($165M)',src:'https://www.pathai.com/resources/pathai-announces-series-c'},
    {v:'Foundation Medicine',p:'FoundationOne CDx',d:'Expand FoundationOne CDx as companion diagnostic',src:'https://www.foundationmedicine.com/companion-diagnostics'},
  ],
  'Amgen|access_support': [
    {v:'C/Can',p:'Health information system',d:'5-year collaboration with City Cancer Challenge',src:'https://citycancerchallenge.org/c-can-announce-5-year-collaboration-with-amgen-to-expand-access-to-cancer-care-medicines'},
    {v:'Infinitus Systems',p:'Eva (Maya AI agent)',d:'AI voice agent for benefit verification',src:'https://infinitus.ai/news/amgen-eva'},
  ],
  'Roche|treatment_optimization': [{v:'Foundation Medicine',p:'FoundationOne platform',d:'Roche acquires 56% stake ~$1B',src:'https://www.roche.com/media/releases/med-cor-2015-01-12'}],
  'Pfizer|recurrence_surveillance': [{v:'Natera',p:'Signatera ctDNA MRD',d:'ctDNA assay for clinical trial endpoints',src:'https://www.natera.com/company/news'}],
  'Sanofi|pipeline_acceleration': [{v:'Owkin',p:'Owkin Connect',d:'Sanofi invests $180M in Owkin',src:'https://www.sanofi.com/en/media-room/press-releases/2021/2021-07-22-12-00-00-2267118'}],
  'Pfizer|pipeline_acceleration': [{v:'Owkin',p:'Owkin Connect; TCGA models',d:'Federated learning for drug discovery',src:'https://owkin.com/publications'}],
  'Roche|companion_diagnostics': [{v:'Foundation Medicine',p:'FoundationOne CDx',d:'Comprehensive genomic profiling CDx',src:'https://www.roche.com/media/releases/med-cor-2015-01-12'}],
  'Roche|diagnostic_precision': [{v:'Owkin',p:'Owkin Connect',d:'Federated learning for computational pathology',src:'https://owkin.com/news/roche-collaboration'}],
  'Novartis|trial_acceleration': [
    {v:'Microsoft',p:'Novartis AI Innovation Lab',d:'AI/ML for clinical trial optimization',src:'https://www.novartis.com/news/novartis-and-microsoft-collaborate-transform-medicine-artificial-intelligence'},
    {v:'IMI Consortium',p:'TRIALS AI tools',d:'EU Innovative Medicines Initiative',src:''},
    {v:'Saama',p:'LSAC; Smart Signal',d:'Clinical data analytics partnerships',src:'https://www.saama.com/customers'},
  ],
  'Novartis|biomarker_discovery': [
    {v:'Tempus AI',p:'Tempus multimodal platform',d:'Multi-year collaboration',src:'https://www.tempus.com/news/novartis-tempus-collaboration'},
    {v:'PathAI',p:'PathAI biomarker platform',d:'Digital pathology for biomarker discovery',src:'https://www.pathai.com/resources'},
    {v:'Owkin',p:'Owkin Connect; RWE models',d:'Federated learning in oncology',src:'https://owkin.com/publications'},
  ],
  'Pfizer|trial_acceleration': [{v:'ConcertAI',p:'Oncology RWE platform',d:'RWE and AI for trial optimization',src:'https://www.concertai.com/news/pfizer-collaboration'}],
  'Pfizer|biomarker_discovery': [
    {v:'Tempus AI',p:'Tempus AI platform',d:'Multimodal data for biomarker discovery',src:'https://www.tempus.com/news/pfizer-tempus-collaboration'},
    {v:'Owkin',p:'Owkin Connect',d:'Federated learning for biomarkers',src:'https://owkin.com/publications'},
  ],
  'Merck|biomarker_discovery': [
    {v:'PathAI',p:'PathAI biomarker platform',d:'Merck GHIF invests in PathAI',src:'https://www.pathai.com/resources'},
    {v:'Tempus AI',p:'Tempus Lens Platform',d:'Multimodal clinicogenomic data',src:'https://www.tempus.com/pharma'},
  ],
  'BMS|biomarker_discovery': [
    {v:'PathAI',p:'PathAI IO biomarker models',d:'Earliest pharma relationship with PathAI',src:'https://www.pathai.com/about'},
    {v:'Owkin',p:'Owkin Connect; TME models',d:'Federated learning for IO biomarkers',src:'https://owkin.com/publications'},
    {v:'Tempus AI',p:'Tempus Lens Platform',d:'Multimodal clinicogenomic data',src:'https://www.tempus.com/pharma'},
  ],
  'BMS|trial_acceleration': [{v:'PathAI',p:'PD-L1 AI algorithm',d:'AI PD-L1 scoring identifies more responders',src:'https://meetinglibrary.asco.org'}],
  'BMS|companion_diagnostics': [{v:'PathAI',p:'AISight CDx platform',d:'BMS in PathAI Series C ($165M)',src:'https://www.pathai.com/resources/pathai-announces-series-c'}],
  'J&J/Janssen|companion_diagnostics': [
    {v:'Paige',p:'Paige AI pathology',d:'JJDC in Paige Series C ($150M)',src:'https://www.paige.ai/press-releases'},
    {v:'Foundation Medicine',p:'FoundationOne CDx',d:'CGP companion diagnostic',src:'https://www.foundationmedicine.com/companion-diagnostics'},
    {v:'Guardant Health',p:'Guardant360 CDx',d:'Biomarker-driven clinical trials',src:'https://guardanthealth.com/precision-oncology/biopharma-solutions'},
  ],
  'J&J/Janssen|biomarker_discovery': [
    {v:'Tempus AI',p:'Tempus AI data platform',d:'Multimodal data collaboration',src:'https://www.tempus.com/pharma'},
    {v:'Multiple AI vendors',p:'JADS AI platform',d:'AI in 100% of active oncology clinical trials',src:'https://www.jnj.com/innovation/artificial-intelligence-in-medicine'},
  ],
  'Sanofi|diagnostic_precision': [{v:'Owkin',p:'Owkin Connect',d:'$180M investment for computational pathology',src:'https://www.sanofi.com/en/media-room/press-releases/2021/2021-07-22-12-00-00-2267118'}],
  'Sanofi|biomarker_discovery': [{v:'Owkin',p:'Owkin federated learning',d:'Multi-year collaboration for oncology biomarkers',src:'https://owkin.com/publications'}],
  'Eli Lilly|trial_acceleration': [{v:'Tempus AI',p:'Tempus AI platform',d:'AI-driven clinical trial acceleration',src:'https://www.tempus.com/pharma'}],
  'Eli Lilly|biomarker_discovery': [{v:'Tempus AI',p:'Tempus multimodal platform',d:'Biomarker identification partnership',src:'https://www.tempus.com/pharma'}],
  'GSK|pipeline_acceleration': [{v:'Tempus AI',p:'Tempus data platform',d:'$70M upfront, 3+ year expansion',src:'https://www.dennisgong.com/blog/tempusipo/'}],
  'GSK|biomarker_discovery': [{v:'Tempus AI',p:'Tempus AI platform',d:'Clinicogenomic data for biomarker discovery',src:'https://www.tempus.com/pharma'}],
};
