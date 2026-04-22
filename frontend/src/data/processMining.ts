// Process Mining Landscape data — ported from healthcare_pm_landscape_v6.html

export interface PMEvent {
  d: string; v: string; t: string; h: string; x: string; a: number; dead?: boolean;
}

export interface PMEvidence {
  client: string; kpi: string; str: 'high' | 'med' | 'low' | 'dead'; note?: string;
}

export interface PMUseCase {
  uc: string; desc: string; evidence: PMEvidence[]; vendors: string[]; dead?: boolean;
}

export interface PMCategory {
  id: string; icon: string; name: string; items: PMUseCase[];
}

export interface PMGeoEntry {
  f: string; n: string; mkt: string; buy: string; sh: number;
  v: string[]; dv: string[]; dl: string; cu: string; pm: string;
}

export interface PMOpenItem {
  name: string; url?: string; type: string; desc: string; access: string;
  meta: string[]; cats: string[]; highlight?: string;
}

export interface PMOpenSection {
  id: string; icon: string; name: string; items: PMOpenItem[];
}

export const PM_TYPE_COLORS: Record<string, string> = {
  Funding: 'hsl(var(--foreground) / 0.7)',
  Acquisition: 'hsl(var(--foreground) / 0.5)',
  Customer_Case: 'hsl(var(--foreground) / 0.35)',
  IPO: 'hsl(var(--primary))',
  Shutdown: 'hsl(0 70% 50%)',
  Layoffs: 'hsl(0 50% 60%)',
  Partnership: 'hsl(var(--foreground) / 0.45)',
  Product_Launch: 'hsl(var(--foreground) / 0.55)',
  Event: 'hsl(var(--foreground) / 0.3)',
  Strategic_Investment: 'hsl(var(--foreground) / 0.6)',
};

export const PM_TYPE_LABELS: Record<string, string> = {
  Funding: 'Funding',
  Acquisition: 'M&A',
  Customer_Case: 'Customer',
  IPO: 'IPO',
  Shutdown: 'Shutdown',
  Layoffs: 'Layoffs',
  Partnership: 'Partner',
  Product_Launch: 'Launch',
  Event: 'Event',
  Strategic_Investment: 'Strategic',
};

export const PM_STATS = [
  { n: '$17B+', l: 'Deal Value' },
  { n: '90', l: 'Events' },
  { n: '357K+', l: 'HC Buyers' },
  { n: '$310B', l: 'HC IT \'25' },
  { n: '35+', l: 'Vendors' },
  { n: '18', l: 'Countries' },
  { n: '$50B+', l: 'Value Destroyed' },
];

export const PM_EVENTS: PMEvent[] = [
  {d:'2016-06',v:'Celonis',t:'Funding',h:'Series A $27.5M',x:'83North+Accel',a:27.5},
  {d:'2018-06',v:'Celonis',t:'Funding',h:'Series B $50M',x:'Accel led',a:50},
  {d:'2018-06',v:'Hyro',t:'Funding',h:'Pre-seed $500K',x:'Cornell Tech',a:0.5},
  {d:'2019-07',v:'Hyro',t:'Funding',h:'Seed $4M',x:'Hanaco Ventures',a:4},
  {d:'2019-08',v:'ABBYY',t:'Acquisition',h:'← TimelinePI',x:'Earliest US PM tool',a:50},
  {d:'2019-10',v:'UiPath',t:'Acquisition',h:'← ProcessGold',x:'Netherlands PM',a:50},
  {d:'2019-11',v:'Celonis',t:'Funding',h:'Series C $290M',x:'Arena. $2.5B val',a:290},
  {d:'2020-01',v:'SAP Signavio',t:'Customer_Case',h:'Provider -60% mgmt',x:'Exam automation',a:0},
  {d:'2020-03',v:'Celonis',t:'Customer_Case',h:'Vetter €600K AP',x:'AP doubled',a:0},
  {d:'2020-06',v:'Celonis',t:'Customer_Case',h:'IQVIA $600K freed',x:'-40% SSC cost',a:0},
  {d:'2020-06',v:'Celonis',t:'Customer_Case',h:'STADA 99% disc.',x:'Millions freed',a:0},
  {d:'2020-06',v:'Celonis',t:'Customer_Case',h:'STADA -44% thru',x:'Batch release',a:0},
  {d:'2020-07',v:'Apromore',t:'Funding',h:'Series A AU$6.8M',x:'GBTEC',a:4.7},
  {d:'2020-10',v:'Celonis',t:'Acquisition',h:'← Integromat >$100M',x:'iPaaS→Make',a:100},
  {d:'2021-01',v:'SAP',t:'Acquisition',h:'← Signavio ~$1.2B',x:'12x rev. 1M+ users',a:1200},
  {d:'2021-01',v:'Skan.ai',t:'Funding',h:'Series A $14M',x:'Cathay Innovation',a:14},
  {d:'2021-04',v:'IBM',t:'Acquisition',h:'← myInvenio',x:'Italian PM→watsonx',a:50},
  {d:'2021-05',v:'Hyro',t:'Funding',h:'Series A $10.5M',x:'Spero+Twilio',a:10.5},
  {d:'2021-06',v:'Celonis',t:'Funding',h:'Series D $1B',x:'$11B val. Durable Capital',a:1000},
  {d:'2021-06',v:'KYP.ai',t:'Funding',h:'Pre-seed ~€2M',x:'42CAP',a:2},
  {d:'2021-06',v:'Thoughtful AI',t:'Funding',h:'Seed 1',x:'Drive Capital. RCM agents',a:5},
  {d:'2021-08',v:'Appian',t:'Acquisition',h:'← LANA Labs',x:'Berlin PM',a:50},
  {d:'2021-10',v:'qBotica',t:'Funding',h:'Seed $1M',x:'Peacock Ventures',a:1},
  {d:'2022-01',v:'Automation Anywhere',t:'Acquisition',h:'← FortressIQ',x:'CV discovery',a:50},
  {d:'2022-01',v:'Celonis',t:'Customer_Case',h:'GE HC FCF 12wk',x:'Fulfillment -18d',a:0},
  {d:'2022-01',v:'UiPath',t:'Customer_Case',h:'Asklepios 1.7M txn',x:'5K days saved',a:0},
  {d:'2022-01',v:'UiPath',t:'Customer_Case',h:'Piramal 60 proc.',x:'SAP/FDA',a:0},
  {d:'2022-03',v:'Celonis',t:'Acquisition',h:'← PAF ~$100M',x:'Power BI PM',a:100},
  {d:'2022-03',v:'Microsoft',t:'Acquisition',h:'← Minit',x:'→ Power Automate',a:50},
  {d:'2022-03',v:'Skan.ai',t:'Funding',h:'Series B $40M',x:'Dell Tech Capital',a:40},
  {d:'2022-06',v:'Celonis',t:'Customer_Case',h:'Northwestern 38K POs',x:'-13% rework',a:0},
  {d:'2022-06',v:'Thoughtful AI',t:'Funding',h:'Seed 2',x:'Drive+TriplePoint',a:5},
  {d:'2022-08',v:'Celonis',t:'Funding',h:'D-II $400M ($13B)',x:'QIA led',a:400},
  {d:'2022-09',v:'ABBYY',t:'Customer_Case',h:'US hosp ED 5hr',x:'Academic',a:0},
  {d:'2022-12',v:'Apromore',t:'Funding',h:'Series B $10.3M',x:'Salesforce Ventures',a:10.3},
  {d:'2023-01',v:'UiPath',t:'Customer_Case',h:'Cognizant/NY qual',x:'No KPIs',a:0},
  {d:'2023-06',v:'Hyro',t:'Funding',h:'Series B $20M',x:'Macquarie Capital',a:20},
  {d:'2023-06',v:'Apromore',t:'Customer_Case',h:'Melbourne ACS',x:'Variant analysis',a:0},
  {d:'2023-09',v:'KYP.ai',t:'Funding',h:'Series A €17.5M',x:'OTB Ventures',a:17.5},
  {d:'2023-10',v:'Waystar',t:'Acquisition',h:'← Olive assets',x:'Fire sale from $4B',a:50},
  {d:'2023-10',v:'Olive AI',t:'Shutdown',h:'SHUTDOWN $902M→0',x:'All investors lost',a:0},
  {d:'2023-12',v:'Celonis',t:'Customer_Case',h:'UHCW NHS -5300',x:'£2.8M/yr',a:0},
  {d:'2024-02',v:'AgentAI',t:'Funding',h:'Seed $1.8M',x:'Oceans Ventures',a:1.8},
  {d:'2024-04',v:'IBM+Celonis',t:'Customer_Case',h:'UHCW +700 pts/wk',x:'IBM Garage+watsonx',a:0},
  {d:'2024-04',v:'SAP Signavio',t:'Customer_Case',h:'Hirslanden 1700 BPMN',x:'Swiss hospitals',a:0},
  {d:'2024-06',v:'Celonis',t:'Partnership',h:'BARMER insurer',x:'German insurer',a:0},
  {d:'2024-06',v:'Waystar',t:'IPO',h:'IPO $968M',x:'$3.8B mkt cap',a:968},
  {d:'2024-07',v:'AgentAI',t:'Funding',h:'Seed Ext $4M',x:'Slow Ventures',a:4},
  {d:'2024-07',v:'Thoughtful AI',t:'Funding',h:'Series A $20M',x:'350% YoY',a:20},
  {d:'2024-07',v:'UiPath',t:'Layoffs',h:'420 jobs (10%)',x:'Restructure→AI',a:0},
  {d:'2024-08',v:'Apromore',t:'Funding',h:'B-1 $15M',x:'Bridge to SF acq',a:15},
  {d:'2024-11',v:'R1 RCM',t:'Acquisition',h:'Take-priv $8.9B',x:'TowerBrook+CD&R',a:8900},
  {d:'2024-12',v:'Hyro',t:'Funding',h:'B ext $15M',x:'Healthier Capital',a:15},
  {d:'2025-01',v:'Celonis',t:'Customer_Case',h:'Pfizer O2C 200+',x:'Target 95% auto',a:0},
  {d:'2025-01',v:'UiPath',t:'Customer_Case',h:'Max HC -50% TAT',x:'India 14 hosp',a:0},
  {d:'2025-01',v:'UiPath',t:'Customer_Case',h:'AGS agentic',x:'Maestro. AI25',a:0},
  {d:'2025-04',v:'Thoughtful AI',t:'Strategic_Investment',h:'New Mountain PE',x:'$55B AUM',a:50},
  {d:'2025-05',v:'Thoughtful AI',t:'Acquisition',h:'→Smarter Tech',x:'SmarterDx+Access',a:50},
  {d:'2025-08',v:'Facere AI',t:'Funding',h:'Pre-seed',x:'IMPA Ventures',a:2},
  {d:'2025-10',v:'Waystar',t:'Acquisition',h:'← Iodine $1.25B',x:'Clinical AI. 1K hosp',a:1250},
  {d:'2025-10',v:'Skan.ai',t:'Acquisition',h:'← Metaculars',x:'Agentic AI',a:10},
  {d:'2025-10',v:'Hyro',t:'Funding',h:'Growth $45M',x:'$95M tot. Val doubled',a:45},
  {d:'2025-11',v:'Apromore',t:'Acquisition',h:'→ Salesforce',x:'Full acquisition',a:50},
  {d:'2025-11',v:'Celonis',t:'Event',h:'Seoul HQ',x:'APAC. 3797 emp',a:0},
  {d:'2025-12',v:'Artera',t:'Funding',h:'Growth $65M',x:'$100M CARR',a:65},
  {d:'2025-12',v:'UiPath',t:'Customer_Case',h:'Omega 60M txns',x:'+100% productivity',a:0},
  {d:'2026-01',v:'Celonis',t:'Event',h:'WEF Davos',x:'$9B+ value. Exec Intel',a:0},
  {d:'2026-02',v:'UiPath',t:'Acquisition',h:'← WorkFusion',x:'Fin crime AI',a:50},
  {d:'2026-02',v:'UiPath',t:'Product_Launch',h:'HC Agentic ViVE',x:'$1.6B rev. GAAP+',a:0},
  {d:'2026-02',v:'Waystar',t:'Event',h:'FY25: $2.4T claims',x:'7.5B txns',a:0},
  // China
  {d:'2021-01',v:'Yiducloud',t:'IPO',h:'IPO HK$1.6B',x:'Stock -96% to HK$2.82 by Sep 2024',a:200,dead:true},
  {d:'2024-12',v:'iFLYTEK Medical',t:'IPO',h:'IPO HKEX HK$583M',x:'76.6% China CDSS share. Still loss-making',a:75},
  {d:'2025-01',v:'Deepwise',t:'Funding',h:'RMB 500M (~$68M)',x:'14 NMPA Class III certs',a:68},
  {d:'2024-06',v:'Ping An Good Doctor',t:'Event',h:'Finally profitable',x:'4M daily consultations',a:0},
  {d:'2023-06',v:'Proxverse',t:'Funding',h:'A1 ~$1.4M',x:'Only Chinese PM in Gartner MQ',a:1.4},
  // Dead startups
  {d:'2023-08',v:'Babylon Health',t:'Shutdown',h:'DEAD $4.2B→£500K',x:'Chapter 7. AI was glorified decision tree',a:0,dead:true},
  {d:'2024-11',v:'Forward Health',t:'Shutdown',h:'DEAD $1B→$0',x:'$650M burned. Only 3 CarePods built',a:0,dead:true},
  {d:'2023-04',v:'Pear Therapeutics',t:'Shutdown',h:'DEAD $1.6B→$6M',x:'FDA approval ≠ reimbursement',a:0,dead:true},
  {d:'2024-04',v:'Cerebral',t:'Event',h:'FTC fine $7M',x:'$4.8B peak. Shared 3.2M patients data',a:0,dead:true},
  {d:'2025-02',v:'23andMe',t:'Shutdown',h:'DEAD $6B→Ch.11',x:'6.9M user data breach',a:0,dead:true},
  {d:'2024-03',v:'Bright Health',t:'Event',h:'$12B→$1.5B (-87%)',x:'SPAC insurtech',a:0,dead:true},
  {d:'2023-06',v:'Carbon Health',t:'Layoffs',h:'4 rounds, 500+ cut',x:'$3.3B peak',a:0,dead:true},
  {d:'2023-05',v:'Noom',t:'Layoffs',h:'500+ laid off',x:'$3.7B peak. GLP-1 drugs disrupted',a:0,dead:true},
  // Emerging
  {d:'2024-09',v:'Qure.ai',t:'Funding',h:'Series D $65M',x:'India. 18 FDA. 100+ countries',a:65},
  {d:'2024-01',v:'Ubie',t:'Funding',h:'$125M total',x:'Japan. 7M pts/month',a:125},
];

export const PM_CATEGORIES: PMCategory[] = [
  {id:'rcm',icon:'💰',name:'Revenue Cycle Management',items:[
    {uc:'Claims Processing & Automation',desc:'Automated intake, validation, and submission of insurance claims.',
      evidence:[{client:'Waystar',kpi:'$2.4T claims processed, 7.5B transactions FY2025',str:'high'},{client:'Max Healthcare (UiPath)',kpi:'-50% claims TAT across 14 hospitals',str:'high'},{client:'Omega Healthcare (UiPath)',kpi:'60M txns, +100% productivity, 99.5% accuracy',str:'high'},{client:'R1 RCM',kpi:'$1T+ net patient revenue managed, 93 of top 100 health systems',str:'high'}],
      vendors:['Waystar','UiPath','R1 RCM','Thoughtful AI','Automation Anywhere','qBotica']},
    {uc:'Denial Management & Appeals',desc:'AI classification of denials, root-cause analysis, automated appeal letter generation.',
      evidence:[{client:'AGS Health (UiPath Maestro)',kpi:'Autonomous denial classification & routing. AI25 Award',str:'low',note:'No KPIs — strong agentic narrative'},{client:'Thoughtful AI',kpi:'350% YoY growth. PE-backed by New Mountain ($55B AUM)',str:'med'},{client:'CodaMetrix',kpi:'-60% coding costs, -70% denials at 200+ hospitals incl. Mass General',str:'high'}],
      vendors:['UiPath','Thoughtful AI','Waystar (Iodine)','CodaMetrix','Automation Anywhere']},
    {uc:'Prior Authorization',desc:'Automated eligibility checks, PA requests, status tracking.',
      evidence:[{client:'Waystar Auth Accelerate',kpi:'Launched Feb 2025. 30K+ clients, 1M+ providers',str:'med'},{client:'Cohere Health',kpi:'$106M raised. Real-time intelligent PA platform',str:'med'}],
      vendors:['Waystar','Cohere Health','Silna Health','Humata Health','Automation Anywhere']},
    {uc:'Clinical Documentation & Coding',desc:'AI-assisted capture at point of care. Bridges documentation→coding→billing.',
      evidence:[{client:'Waystar ← Iodine ($1.25B)',kpi:'Clinical AI CDI across 1K+ hospitals',str:'high'},{client:'SmarterDx → Smarter Tech',kpi:'$1B+ post-PE valuation. Clinical revenue integrity',str:'med'}],
      vendors:['Waystar','SmarterDx/Smarter Tech','Abridge','Ambience']},
  ]},
  {id:'patient',icon:'🏥',name:'Patient Flow & Access',items:[
    {uc:'Waiting List & Scheduling Optimization',desc:'Process mining of appointment data to reduce DNA rates, waiting lists, cancellations.',
      evidence:[{client:'UHCW NHS Trust (Celonis)',kpi:'-5,300 patients on waiting list in 8 weeks. £2.8M/yr savings',str:'high'},{client:'UHCW + IBM Garage',kpi:'+700 more patients/wk without added staff. DNA 10%→4.4%',str:'high'}],
      vendors:['Celonis','IBM watsonx']},
    {uc:'ED Throughput & Patient Journey',desc:'Event-log mining of EHR data to find bottlenecks in emergency department flows.',
      evidence:[{client:'US 800-bed hospital (ABBYY)',kpi:'ER time = 5hrs vs 3hr avg. Academic project',str:'low'},{client:'Melbourne hospital (Apromore)',kpi:'ACS patient flow variant analysis. No ROI',str:'med'}],
      vendors:['ABBYY','Apromore → Salesforce','Celonis']},
    {uc:'Patient Communication & Engagement',desc:'Automated messaging, reminders, outreach. Shifting from SMS to agentic AI.',
      evidence:[{client:'Artera',kpi:'200M+ patients, 1K+ orgs, 2B+ messages/yr. $100M CARR',str:'high'},{client:'Hyro',kpi:'100+ US health systems. Voice AI. $95M raised',str:'med'}],
      vendors:['Artera','Hyro','Hippocratic AI']},
    {uc:'Care Pathway Modeling',desc:'Mapping and standardizing clinical pathways across multi-site hospital groups.',
      evidence:[{client:'Hirslanden (SAP Signavio)',kpi:'1,700 BPMN processes, 425 maps, 8,245 docs',str:'med'},{client:'BARMER (Celonis)',kpi:'Insurer partnership. Care pathway digitization. No KPIs yet',str:'low'}],
      vendors:['SAP Signavio','Celonis']},
  ]},
  {id:'supply',icon:'📦',name:'Supply Chain & Finance',items:[
    {uc:'Accounts Payable / Procure-to-Pay',desc:'Process mining of AP/P2P flows: blocked invoices, maverick spending, discount capture.',
      evidence:[{client:'Northwestern Medicine (Celonis)',kpi:'38K touchless POs (+5%), -13% rework, -0.5d cycle',str:'high'},{client:'IQVIA SSC (Celonis)',kpi:'$600K freed, -40% SSC cost, DPO +32 days',str:'high'},{client:'STADA AP (Celonis)',kpi:'99% discount utilization (vs 80%). Millions freed',str:'med'},{client:'Vetter (Celonis)',kpi:'€600K annual savings. AP automation doubled',str:'high'}],
      vendors:['Celonis','SAP Signavio','IBM Process Mining']},
    {uc:'Order-to-Cash',desc:'Visibility across order processing, fulfillment, invoicing, collections.',
      evidence:[{client:'Pfizer (Celonis)',kpi:'200+ markets. Target 95% automation',str:'med'},{client:'GE HealthCare (Celonis)',kpi:'FCF unlocked in 12 weeks. Cycle -18 days',str:'high'}],
      vendors:['Celonis']},
    {uc:'Cash Flow Optimization',desc:'Working capital visibility, payment term analysis, free cash flow acceleration.',
      evidence:[{client:'GE HealthCare (Celonis)',kpi:'$1.3B FCF increase in one year. 1K incorrect AP payments prevented/wk',str:'high'}],
      vendors:['Celonis']},
  ]},
  {id:'pharma',icon:'💊',name:'Pharma & Life Sciences Ops',items:[
    {uc:'Batch Release & Production Quality',desc:'Process mining of manufacturing quality: batch release timing, deviation cycles.',
      evidence:[{client:'STADA (Celonis)',kpi:'-44% throughput time, +20% on-time batch release',str:'high'},{client:'Vetter (Celonis)',kpi:'-15% deviation-process cycle time',str:'med'}],
      vendors:['Celonis']},
    {uc:'Pharma Regulatory & Validated Automation',desc:'RPA/AI in GxP-validated environments: SAP/FDA-compliant workflows.',
      evidence:[{client:'Piramal (UiPath)',kpi:'60 processes automated in validated SAP/FDA context',str:'med'},{client:'Teva (SAP Signavio)',kpi:'P2P modeling across 60 countries, 3,600 products',str:'med'}],
      vendors:['UiPath','SAP Signavio']},
  ]},
  {id:'discovery',icon:'🔍',name:'Process Discovery & Intelligence',items:[
    {uc:'Task Mining / Desktop Analytics',desc:'Screen-level observation of how staff actually work. Identifies automation candidates.',
      evidence:[{client:'KYP.ai',kpi:'€17.5M Series A. BPO/shared services focus',str:'med',note:'No named HC customers'},{client:'Skan.ai',kpi:'$54M raised. Agentic Ontology of Work',str:'med',note:'No named HC customers'},{client:'Soroco',kpi:'$44.6M revenue. 150+ orgs. Bootstrapped',str:'med',note:'No named HC customers'}],
      vendors:['KYP.ai','Skan.ai','Soroco','UiPath Task Mining','AA (FortressIQ)']},
    {uc:'Process Mining / Execution Intelligence',desc:'Event-log analysis to build digital twins. The core technology.',
      evidence:[{client:'Celonis',kpi:'$771M revenue. 3,797 employees. $13B val',str:'high'},{client:'UiPath Process Mining',kpi:'$1.6B revenue. First GAAP profitability',str:'high'},{client:'Fluxicon (Disco)',kpi:'Deepest HC PM heritage: Philips, RadboudUMC, UW Health',str:'med'}],
      vendors:['Celonis','UiPath','SAP Signavio','IBM','Microsoft/Minit','Apromore → Salesforce','Appian/LANA','Fluxicon']},
    {uc:'Workflow Mapping & BPM',desc:'Structured process modeling (BPMN), knowledge management, collaboration hubs.',
      evidence:[{client:'Hirslanden (SAP Signavio)',kpi:'1,700 BPMN processes. Collaboration Hub',str:'med'},{client:'Appian/LANA (FDA CDER)',kpi:'Replaced 64 siloed systems. One HC client saves $1M+/mo',str:'high'}],
      vendors:['SAP Signavio','Appian/LANA','ServiceNow']},
  ]},
  {id:'failures',icon:'🚨',name:'Failures & Cautionary Tales',items:[
    {uc:'Overpromised AI (RPA disguised as AI)',desc:'Companies marketing basic RPA/decision trees as "artificial intelligence."',dead:true,
      evidence:[{client:'Olive AI ($902M→$0)',kpi:'KLAS "C" rating. Customers got <1/5 of promised value',str:'dead'},{client:'Babylon Health ($4.2B→£500K)',kpi:'Lancet: "no evidence" of superior performance',str:'dead'}],
      vendors:['Olive AI †','Babylon Health †']},
    {uc:'FDA Approval ≠ Revenue',desc:'Regulatory clearance without reimbursement + prescriber adoption kills products.',dead:true,
      evidence:[{client:'Pear Therapeutics ($1.6B→$6M)',kpi:'First FDA-cleared digital therapeutic. Only 20K prescriptions',str:'dead'},{client:'Akili Interactive',kpi:'FDA-cleared ADHD game. Sold for ~$34M after 30% layoffs',str:'dead'}],
      vendors:['Pear Therapeutics †','Akili †']},
    {uc:'Hardware-First Healthcare',desc:'Physical hardware in healthcare with unit economics that never worked.',dead:true,
      evidence:[{client:'Forward Health ($1B→$0)',kpi:'$650M burned. Only 3 CarePods built. Blood draws failed',str:'dead'}],
      vendors:['Forward Health †']},
    {uc:'Data Breach + No Business Model',desc:'Consumer health companies that raised billions but never found sustainable revenue.',dead:true,
      evidence:[{client:'23andMe ($6B→Ch.11)',kpi:'6.9M user data breach. Board resigned. Chapter 11',str:'dead'},{client:'Cerebral ($4.8B)',kpi:'FTC $7M fine. Shared 3.2M patients data w/ TikTok',str:'dead'}],
      vendors:['23andMe †','Cerebral †']},
  ]},
];

export const PM_GEO: PMGeoEntry[] = [
  {f:'🇺🇸',n:'United States',mkt:'$176.6B',buy:'285,117',sh:63,v:['Celonis','UiPath','ABBYY','AA','Skan.ai','Waystar','R1 RCM','Thoughtful AI','Artera','ServiceNow','Appian'],dv:['☠ Olive AI $902M→0','☠ Forward $650M→0','☠ Pear $1.6B→$6M','☠ Cerebral $4.8B FTC','☠ 23andMe $6B→Ch.11','☠ Carbon Health','☠ Noom'],dl:'$8.9B R1 RCM · $968M Waystar IPO · $1.25B Iodine',cu:'Northwestern, IQVIA, GE HC, Pfizer, AGS Health',pm:'Zero healthcare-specific PM startups. Celonis/UiPath sell to HC from horizontal platform'},
  {f:'🇨🇳',n:'China',mkt:'$15.9B',buy:'~56,000',sh:5.7,v:['JD Health ($24B)','Alibaba Health ($9.7B)','iFLYTEK Medical','Deepwise','Winning Health','DHC Mediway'],dv:['☠ Yiducloud IPO -96%','☠ WeDoctor $12B→stalled','☠ Baidu HC shut down twice','☠ SenseTime Medical -39.5%'],dl:'iFLYTEK IPO HK$583M · Deepwise RMB 500M · 92 NMPA AI devices',cu:'Ping An Good Doctor: 4M daily consultations',pm:'Proxverse = only Chinese PM in Gartner MQ ($1.4M raised). Zero HC PM'},
  {f:'🇬🇧',n:'United Kingdom',mkt:'$17B',buy:'~21,000',sh:6,v:['Celonis (London)'],dv:['☠ Babylon Health $4.2B→£500K'],dl:'',cu:'UHCW NHS Trust (£2.8M, +700 pts/wk) — strongest clinical PM proof globally',pm:'UHCW = NHS Centre of Excellence for PM. Rolling out to 4+ NHS Trusts'},
  {f:'🇩🇪',n:'Germany',mkt:'$14B',buy:'~18,000',sh:5,v:['Celonis (HQ Munich)','SAP/Signavio','KYP.ai','LANA→Appian'],dv:[],dl:'$1.2B SAP/Signavio · $1.77B Celonis raised',cu:'STADA, Vetter, Asklepios, BARMER',pm:'Celonis HQ + Fraunhofer FIT (PM4Py origin). Strongest PM ecosystem globally'},
  {f:'🇯🇵',n:'Japan',mkt:'$12B',buy:'~9,000',sh:4.3,v:['Ubie ($125M, 7M pts/mo)','CureApp','AI Medical Service'],dv:[],dl:'~$100B planned for AI hospitals · ~100 PMDA-approved AI devices',cu:'~500K healthcare worker shortage projected',pm:'Zero process mining adoption in Japanese hospitals'},
  {f:'🇮🇳',n:'India',mkt:'$6B',buy:'~12,000',sh:2.1,v:['Qure.ai (18 FDA, 100+ countries)','Innovaccer ($3.2B)','Soroco','UiPath','Omega HC'],dv:['☠ Practo: profitable via 81% staff cut'],dl:'Qure.ai $65M Series D · Innovaccer $275M Series F · $44.6M Soroco rev',cu:'Max HC (-50% TAT), Omega (60M txns), Piramal',pm:'No PM adoption. Soroco = task mining (no HC)'},
  {f:'🇮🇩',n:'Indonesia',mkt:'$1.5B',buy:'~4,000',sh:0.5,v:['Halodoc ($258M, 20M MAUs)'],dv:[],dl:'Halodoc $80M Series C (2021)',cu:'Basic teleconsultation + e-pharmacy',pm:'Zero PM adoption. HC AI = teleconsultation stage'},
  {f:'🇦🇺',n:'Australia',mkt:'$5.5B',buy:'~8,000',sh:2,v:['Apromore → Salesforce','Harrison.ai ($129M)'],dv:[],dl:'$30M Apromore raised → SF acq · Harrison.ai $129M Series B',cu:'Melbourne ACS patient flow',pm:'Apromore was only HC-focused PM tool — now inside Salesforce Agentforce'},
  {f:'🇮🇹',n:'Italy',mkt:'$4.5B',buy:'~7,000',sh:1.6,v:['myInvenio → IBM'],dv:[],dl:'IBM acquired 2021',cu:'',pm:'myInvenio origin; now IBM Process Mining'},
  {f:'🇨🇭',n:'Switzerland',mkt:'$4B',buy:'~4,500',sh:1.4,v:['SAP Signavio clients'],dv:[],dl:'',cu:'Hirslanden: 1,700 BPMN, 8,245 docs',pm:'BPM adoption, not PM'},
  {f:'🇸🇦',n:'Saudi Arabia',mkt:'$3.5B',buy:'~2,800',sh:1.2,v:['SDAIA ($20B AI target)','SEHA Virtual Hospital'],dv:[],dl:'$27B HC AI opportunity by 2030',cu:'No named PM deployments — highest-growth opportunity',pm:'White space. Massive gov investment but zero PM adoption'},
  {f:'🇧🇷',n:'Brazil',mkt:'$3B',buy:'~8,000',sh:1.1,v:['Alice ($174M+)','Conexa ($46M)'],dv:['☠ Alice: laid off 9% in 2022'],dl:'LATAM digital health grew 37.6% in 2024',cu:'90% of LATAM healthtech startups fail within a decade',pm:'Zero PM. HC AI = teleconsultation + basic automation'},
  {f:'🇮🇱',n:'Israel',mkt:'$2.5B',buy:'~3,500',sh:0.9,v:['Hyro (Tel Aviv + NYC)'],dv:[],dl:'$95M total raised',cu:'Voice AI for 100+ US health systems',pm:''},
  {f:'🇦🇪',n:'UAE',mkt:'$2B',buy:'~1,500',sh:0.7,v:['836 healthtech startups','Klaim AI ($26M)','Altibbi ($52.5M)'],dv:[],dl:'Klaim AI: most PM-relevant MENA startup',cu:'DOH Abu Dhabi actively funding AI research',pm:''},
  {f:'🇬🇭',n:'Ghana / Africa',mkt:'$0.5B',buy:'~2,000',sh:0.2,v:['mPharma ($95M, 9 countries)'],dv:[],dl:'Africa healthtech equity +232% YoY to $215M in 2025',cu:'mPharma: 2M+ patients',pm:'Zero PM. Supply chain optimization is main focus'},
  {f:'🇶🇦',n:'Qatar',mkt:'$1.2B',buy:'~500',sh:0.4,v:['QIA (Celonis investor)'],dv:[],dl:'Led Celonis $400M D-II',cu:'',pm:''},
  {f:'🇷🇴',n:'Romania',mkt:'$0.8B',buy:'~2,000',sh:0.3,v:['UiPath (Bucharest eng HQ)'],dv:[],dl:'UiPath IPO 2021 $1.34B',cu:'',pm:''},
  {f:'🇸🇰',n:'Slovakia',mkt:'$0.3B',buy:'~800',sh:0.1,v:['Minit → Microsoft'],dv:[],dl:'Acquired 2022',cu:'',pm:''},
];

export const PM_OPEN_LANDSCAPE: PMOpenSection[] = [
  {id:'patient_flow',icon:'🏥',name:'Patient Flow & ED Throughput',items:[
    {name:'MIMIC-IV v3.1',url:'https://physionet.org/content/mimiciv/3.1/',type:'data',desc:'65K+ ICU patients, 200K+ ED admissions. Gold standard for clinical AI research.',access:'academic',meta:['v3.1 Oct 2024','PhysioNet','CITI training required'],cats:['Patient Flow','ED','ICU'],highlight:'Largest open clinical dataset'},
    {name:'MIMICEL: ED Event Log',url:'https://physionet.org/content/mimicel-ed/2.1.0/',type:'data',desc:'Ready-made XES event log from MIMIC-IV-ED. End-to-end patient journey.',access:'academic',meta:['v2.1','XES format','PhysioNet'],cats:['Patient Flow','ED','Process Mining'],highlight:'Plug directly into PM4Py'},
    {name:'MIMIC-IV-Ext-CEKG',url:'https://physionet.org/content/mimic-iv-ext-cekg/1.0.0/',type:'data',desc:'Object-centric event log for process mining. Clinical Event Knowledge Graphs.',access:'academic',meta:['v1.0 April 2025','OCEL format','PhysioNet'],cats:['Patient Flow','Process Mining'],highlight:'Purpose-built for healthcare PM startups'},
    {name:'BPI Challenge 2011',url:'https://www.tf-pm.org/resources/logs',type:'data',desc:'Event log from Dutch hospital gynecology. 1,143 traces, 150K+ events.',access:'free',meta:['1,143 cases','150K events','XES'],cats:['Patient Flow','Process Mining'],highlight:'Most-cited healthcare PM dataset'},
    {name:'Sepsis Cases Event Log',type:'data',desc:'~1,000 sepsis cases from hospital ERP. 15K events, 16 activities.',access:'free',meta:['1K cases','15K events','IEEE TF-PM'],cats:['Patient Flow','Process Mining']},
    {name:'Hospital Billing Event Log',type:'data',desc:'100K traces of medical service billing processes. 3 years of data.',access:'free',meta:['100K traces','3 years','XES'],cats:['Back Office','Billing']},
    {name:'PM4Py',url:'https://github.com/process-intelligence-solutions/pm4py',type:'tool',desc:'Leading Python process mining library. 1M+ downloads. AGPL-3.0.',access:'free',meta:['1M+ downloads','Python','Fraunhofer FIT'],cats:['Process Mining','Patient Flow'],highlight:'Foundation for any PM prototype'},
    {name:'Fluxicon Disco',url:'https://fluxicon.com/disco/',type:'tool',desc:'Most intuitive PM GUI. Published healthcare case studies.',access:'trial',meta:['30-day trial','Desktop app'],cats:['Process Mining','Patient Flow'],highlight:'Best for rapid HC PM demos'},
    {name:'Patient Flow Prediction',type:'model',desc:'XGBoost/LSTM models for ICU mortality, LOS prediction. AUROC up to 0.87.',access:'free',meta:['AUROC 0.87','MIMIC-trained'],cats:['Patient Flow','ICU']},
    {name:'No-Show Prediction Models',type:'model',desc:'Appointment no-show prediction using demographics + scheduling data.',access:'free',meta:['GitHub','Python/sklearn'],cats:['Patient Flow','Scheduling'],highlight:'Directly applicable to waiting list optimization'},
    {name:'PODS4H Workshop Series',type:'paper',desc:'Process-Oriented Data Science for Healthcare. Annual workshop at BPM/ICPM.',access:'free',meta:['Annual','2018-present'],cats:['Patient Flow','Process Mining']},
    {name:'Munoz-Gama et al. 2022',type:'paper',desc:'Comprehensive survey of 200+ healthcare PM papers. J Biomedical Informatics.',access:'free',meta:['J Biomed Inform','2022','200+ papers'],cats:['Patient Flow','Process Mining'],highlight:'Definitive healthcare PM survey'},
    {name:'UHCW NHS Trust (Celonis)',type:'roi',desc:'-5,300 patients on waiting list in 8 weeks. £2.8M/yr savings.',access:'free',meta:['Named client','2023-2024'],cats:['Patient Flow','Scheduling'],highlight:'Strongest clinical PM ROI globally'},
    {name:'UHCW + IBM Garage',type:'roi',desc:'+700 more patients seen weekly without added staff.',access:'free',meta:['Named client','2024','IBM+Celonis+watsonx'],cats:['Patient Flow','Scheduling']},
  ]},
  {id:'rcm',icon:'💰',name:'Revenue Cycle Management & Medical Coding',items:[
    {name:'Synthea',url:'https://github.com/synthetichealth/synthea',type:'tool',desc:'Open-source synthetic patient generator by MITRE. Full EHR with claims in FHIR R4.',access:'free',meta:['MITRE','Java','GitHub 2K+ stars'],cats:['RCM','Claims'],highlight:'Unlimited synthetic claims data'},
    {name:'Synthea OMOP on AWS',url:'https://registry.opendata.aws/synthea-omop/',type:'data',desc:'Pre-generated Synthea datasets in OMOP CDM format: up to 2.8M patients.',access:'free',meta:['1K/100K/2.8M patients','OMOP CDM','AWS'],cats:['RCM','Claims']},
    {name:'CMS SynPUF',type:'data',desc:'Synthetic Medicare claims (5% sample). ~2M beneficiaries.',access:'free',meta:['~2M beneficiaries','CMS.gov'],cats:['RCM','Medicare']},
    {name:'MIMIC-IV diagnoses_icd',type:'data',desc:'ICD-9/10 diagnosis codes from 200K+ hospital admissions.',access:'academic',meta:['200K+ admissions','PhysioNet'],cats:['RCM','Medical Coding']},
    {name:'PLM-ICD',url:'https://github.com/JoakimEdin/medical-coding-reproducibility',type:'model',desc:'Open-source ICD coding model on RoBERTa-base-PM-M3-Voc.',access:'free',meta:['RoBERTa-based','SOTA benchmark'],cats:['RCM','Medical Coding'],highlight:'SOTA open-source ICD coding model'},
    {name:'CLH: Code Like Humans',type:'model',desc:'Agentic LLM framework for ICD coding. Mirrors human coders.',access:'free',meta:['Agentic','70K ICD labels','2025'],cats:['RCM','Medical Coding']},
    {name:'Fine-tuned Llama for ICD-10',type:'model',desc:'Llama-3.2-1B fine-tuned on 74K ICD-10 code-description pairs. 97% exact match.',access:'free',meta:['Llama-3.2-1B','97% match'],cats:['RCM','Medical Coding'],highlight:'Runs on single GPU'},
    {name:'ClinicalBERT / BioBERT / GatorTron',url:'https://huggingface.co/medicalai/ClinicalBERT',type:'model',desc:'Foundation models for clinical NLP. 1.2B words of clinical text.',access:'free',meta:['HuggingFace','Multiple architectures'],cats:['RCM','NLP']},
    {name:'Waystar',type:'roi',desc:'$2.4T claims processed. 7.5B transactions FY2025. IPO $968M.',access:'enterprise',meta:['$2.4T claims','30K clients'],cats:['RCM','Claims'],highlight:'Market leader benchmark'},
    {name:'R1 RCM',type:'roi',desc:'$1T+ net patient revenue managed. 93 of top 100 health systems.',access:'enterprise',meta:['$1T+ NPR','$8.9B deal'],cats:['RCM','Claims'],highlight:'Largest HC tech P2P deal ever'},
    {name:'CodaMetrix',type:'roi',desc:'-60% coding costs, -70% denials at 200+ hospitals.',access:'enterprise',meta:['200+ hospitals','$95M raised'],cats:['RCM','Medical Coding'],highlight:'Strongest autonomous coding ROI'},
  ]},
  {id:'process_mining',icon:'🔍',name:'Process Mining Core Technology',items:[
    {name:'ProM Framework',url:'https://promtools.org/',type:'tool',desc:'Java-based PM framework with ~1,800 plugins. TU Eindhoven.',access:'free',meta:['~1,800 plugins','Java','Since 2004'],cats:['Process Mining']},
    {name:'Bupaverse',url:'https://bupaverse.github.io/',type:'tool',desc:'R ecosystem for process mining. Strong in exploratory analytics.',access:'free',meta:['R packages','CRAN'],cats:['Process Mining']},
    {name:'Celonis Academic Alliance',url:'https://www.celonis.com/academic-alliance/',type:'tool',desc:'Free academic license for Celonis platform.',access:'academic',meta:['Free for academics','Full EMS'],cats:['Process Mining'],highlight:'Try the $13B platform for free'},
    {name:'UiPath Academic Alliance',type:'tool',desc:'Free access to UiPath platform. RPA + Process Mining.',access:'academic',meta:['Free for academics','Full platform'],cats:['Process Mining','RPA']},
  ]},
  {id:'failures_landscape',icon:'☠️',name:'Failures & Value Destruction',items:[
    {name:'Olive AI ($902M→$0)',type:'dead',desc:'Largest HC AI failure. 900+ employees. KLAS "C" rating. Sold for parts.',access:'enterprise',meta:['$902M raised','2023 shutdown','900+ employees'],cats:['RCM','AI'],highlight:'RPA-as-AI poster child'},
    {name:'Babylon Health ($4.2B→£500K)',type:'dead',desc:'UK NHS AI. Chapter 7. Lancet: "no evidence" of superior performance.',access:'enterprise',meta:['$4.2B raised','Chapter 7','2023'],cats:['Telehealth','AI'],highlight:'AI was glorified decision tree'},
    {name:'Forward Health ($1B→$0)',type:'dead',desc:'$650M burned. Only 3 CarePods built. Blood draws failed consistently.',access:'enterprise',meta:['$650M burned','$1B valuation','2024'],cats:['Hardware','Primary Care']},
    {name:'Pear Therapeutics ($1.6B→$6M)',type:'dead',desc:'First FDA-cleared digital therapeutic. Only 20K prescriptions ever.',access:'enterprise',meta:['FDA approved','$1.6B→$6M','2023'],cats:['Digital Therapeutics'],highlight:'99.6% value destroyed'},
    {name:'23andMe ($6B→Ch.11)',type:'dead',desc:'Consumer genomics SPAC. 6.9M user data breach. Chapter 11 Feb 2025.',access:'enterprise',meta:['$900M+ raised','$6B SPAC'],cats:['Genomics'],highlight:'Data breach + no business model'},
    {name:'Cerebral ($4.8B peak)',type:'dead',desc:'Mental health. Exploited COVID DEA relaxations. FTC $7M fine. Patient deaths.',access:'enterprise',meta:['$462M raised','SoftBank','FTC fine'],cats:['Mental Health'],highlight:'Most dangerous failure mode'},
    {name:'Yiducloud (IPO -96%)',type:'dead',desc:'Chinese HC AI/big data. IPO Jan 2021. Stock collapsed -96%.',access:'enterprise',meta:['IPO HK$1.6B','-96%'],cats:['China','HC AI'],highlight:'China\'s Olive AI equivalent'},
    {name:'$50B+ Total Value Destroyed',type:'dead',desc:'2022–2026 pattern: AI claims not real, healthcare can\'t be blitzscaled.',access:'free',meta:['2022-2026','$50B+','Global'],cats:['Market Signal'],highlight:'Common pattern: overpromise → underfund → collapse'},
  ]},
  {id:'infra',icon:'☁️',name:'Cloud & Startup Infrastructure',items:[
    {name:'AWS HealthLake',url:'https://aws.amazon.com/healthlake/',type:'tool',desc:'FHIR-native data store. Free tier: 5GB storage, 500K API calls/month.',access:'trial',meta:['Free tier','FHIR R4'],cats:['Infrastructure']},
    {name:'Google Cloud Healthcare API',url:'https://cloud.google.com/healthcare-api',type:'tool',desc:'FHIR, HL7v2, DICOM stores. $300 free credits for 90 days.',access:'trial',meta:['$300 free credits','FHIR/HL7v2/DICOM'],cats:['Infrastructure']},
    {name:'Azure Health Data Services',type:'tool',desc:'FHIR Server, DICOM, MedTech. Included in Azure free account.',access:'trial',meta:['Azure free account','FHIR','DICOM'],cats:['Infrastructure']},
    {name:'NHS Digital Sandbox',url:'https://digital.nhs.uk/',type:'tool',desc:'Synthetic NHS data environment for developers.',access:'free',meta:['UK NHS','Synthetic data'],cats:['Infrastructure','Patient Flow'],highlight:'UK market entry point'},
  ]},
];
