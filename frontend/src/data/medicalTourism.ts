// Medical Tourism research dataset — corridors, timeline, vendors, diagnostic stages

export interface Specialty { id: string; label: string; icon: string; }
export interface Source { id: string; label: string; flag: string; vol: number; growth: string; specs: string[]; }
export interface Destination { id: string; label: string; flag: string; jci: number; specs: string[]; strength: string; }
export interface Corridor { from: string; to: string; vol: number; spec: string[]; channel: string; note: string; }
export type EventType = 'stat' | 'platform' | 'provider' | 'regulatory' | 'standard';
export interface TimelineEvent { y: number; q: number; stream: string; dest: string; name: string; desc: string; url: string; type: EventType; }
export interface Vendor { name: string; type: string; coverage: string; signal: string; url: string; }
export type VendorCategory = 'discovery' | 'crm' | 'payments' | 'intelligence' | 'standards';
export interface DiagnosticQuestion { id: string; text: string; weight: number; }
export interface DiagnosticProduct { name: string; type: 'build' | 'buy'; effort: 'low' | 'medium' | 'high'; impact: 'low' | 'medium' | 'high'; players: string[]; }
export interface DiagnosticStage { id: string; label: string; short: string; icon: string; desc: string; questions: DiagnosticQuestion[]; products: DiagnosticProduct[]; }

export const SPECIALTIES: Specialty[] = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'onco', label: 'Oncology', icon: '🎗️' },
  { id: 'cosm', label: 'Cosmetic', icon: '💄' },
  { id: 'fert', label: 'Fertility & Birth', icon: '👶' },
  { id: 'card', label: 'Cardiac', icon: '🫀' },
  { id: 'trans', label: 'Transplant', icon: '🫁' },
  { id: 'orth', label: 'Ortho & Spine', icon: '🦴' },
  { id: 'well', label: 'Wellness', icon: '🧘' },
  { id: 'dent', label: 'Dental', icon: '🦷' },
];

export const SOURCES: Source[] = [
  { id: 'ng', label: 'Nigeria', flag: '🇳🇬', vol: 95, growth: '+18%', specs: ['onco','card','orth'] },
  { id: 'ke', label: 'Kenya', flag: '🇰🇪', vol: 35, growth: '+22%', specs: ['onco','card','orth'] },
  { id: 'gcc', label: 'GCC', flag: '🇸🇦', vol: 180, growth: '+12%', specs: ['onco','card','orth','cosm','well','trans'] },
  { id: 'eu', label: 'Europe', flag: '🇪🇺', vol: 220, growth: '+8%', specs: ['cosm','dent','fert','well'] },
  { id: 'uk', label: 'UK', flag: '🇬🇧', vol: 85, growth: '+10%', specs: ['fert','cosm','onco','dent'] },
  { id: 'cis', label: 'CIS', flag: '🇷🇺', vol: 140, growth: '+15%', specs: ['onco','fert','cosm','orth','dent'] },
  { id: 'sa', label: 'South Asia', flag: '🇧🇩', vol: 310, growth: '+20%', specs: ['card','onco','orth','trans'] },
  { id: 'iq', label: 'Iraq', flag: '🇮🇶', vol: 85, growth: '+25%', specs: ['orth','card','onco','trans'] },
  { id: 'cn', label: 'China', flag: '🇨🇳', vol: 250, growth: '+30%', specs: ['cosm','fert','well','onco'] },
  { id: 'jp', label: 'Japan', flag: '🇯🇵', vol: 120, growth: '+35%', specs: ['cosm','dent','well'] },
  { id: 'in_o', label: 'India (out)', flag: '🇮🇳', vol: 60, growth: '+20%', specs: ['fert','well'] },
  { id: 'us', label: 'USA', flag: '🇺🇸', vol: 180, growth: '+12%', specs: ['cosm','dent','fert','well','orth'] },
];

export const DESTINATIONS: Destination[] = [
  { id: 'ae', label: 'Dubai/UAE', flag: '🇦🇪', jci: 92, specs: ['cosm','dent','fert','orth','well'], strength: 'Cosmetic, IVF/Gender, Dental, Birth' },
  { id: 'in', label: 'India', flag: '🇮🇳', jci: 46, specs: ['card','onco','orth','dent','trans'], strength: 'Cardiac, Transplant, Oncology, Neuro' },
  { id: 'ksa', label: 'Saudi Arabia', flag: '🇸🇦', jci: 111, specs: ['onco','card','orth','well'], strength: 'Oncology, Complex Surgery, Seha Virtual' },
  { id: 'th', label: 'Thailand', flag: '🇹🇭', jci: 68, specs: ['cosm','dent','card','well'], strength: 'Cosmetic, Dental, Wellness, Gender' },
  { id: 'tr', label: 'Turkey', flag: '🇹🇷', jci: 34, specs: ['cosm','dent','orth','fert','onco'], strength: 'Hair, Cosmetic, Dental, Eye' },
  { id: 'il', label: 'Israel', flag: '🇮🇱', jci: 12, specs: ['onco','fert','card','orth'], strength: 'Oncology (blood cancer), IVF, Neuro' },
  { id: 'de', label: 'Germany', flag: '🇩🇪', jci: 8, specs: ['onco','card','orth','well','trans'], strength: 'Oncology, Cardiac, Transplant, Precision Medicine' },
  { id: 'kr', label: 'S. Korea', flag: '🇰🇷', jci: 31, specs: ['cosm','dent','well','onco'], strength: 'Derm (705K!), Cosmetic, K-beauty' },
];

export const CORRIDORS: Corridor[] = [
  { from: 'ng', to: 'ae', vol: 28, spec: ['onco','orth','card'], channel: 'Facilitators + Direct', note: 'Oncology + ortho' },
  { from: 'ng', to: 'in', vol: 45, spec: ['card','onco','orth'], channel: 'Facilitators + Embassy', note: 'Largest Africa→India' },
  { from: 'ng', to: 'tr', vol: 12, spec: ['cosm','dent'], channel: 'Marketplace', note: 'Growing cosmetic' },
  { from: 'ke', to: 'in', vol: 22, spec: ['onco','card','orth'], channel: 'Facilitators + NGO', note: 'Cancer + cardiac' },
  { from: 'gcc', to: 'in', vol: 65, spec: ['card','orth','onco','trans'], channel: 'Insurance + Direct', note: 'Complex surgery + transplant' },
  { from: 'gcc', to: 'ae', vol: 55, spec: ['cosm','dent','well'], channel: 'Direct + Referral', note: 'Elective + wellness' },
  { from: 'gcc', to: 'de', vol: 25, spec: ['onco','card','trans'], channel: 'Insurance + Gov', note: 'High-acuity oncology + transplant' },
  { from: 'eu', to: 'tr', vol: 85, spec: ['cosm','dent'], channel: 'Marketplace-heavy', note: 'Flymedi, WhatClinic' },
  { from: 'eu', to: 'ae', vol: 48, spec: ['cosm','dent','fert'], channel: 'Marketplace + Direct', note: 'IVF/gender growing' },
  { from: 'eu', to: 'th', vol: 42, spec: ['cosm','well','dent'], channel: 'Marketplace', note: 'Wellness combo trips' },
  { from: 'uk', to: 'ae', vol: 18, spec: ['fert'], channel: 'Direct + Clinics', note: 'Gender selection (legal UAE, not UK) + birth' },
  { from: 'uk', to: 'tr', vol: 30, spec: ['cosm','dent'], channel: 'Marketplace', note: 'Dental + hair' },
  { from: 'uk', to: 'il', vol: 8, spec: ['onco','fert'], channel: 'Direct + Referral', note: 'Oncology 2nd opinions' },
  { from: 'cis', to: 'ae', vol: 35, spec: ['onco','fert','cosm'], channel: 'Facilitators', note: 'Oncology + IVF gender' },
  { from: 'cis', to: 'tr', vol: 40, spec: ['cosm','dent'], channel: 'Marketplace', note: 'Cosmetic + dental' },
  { from: 'cis', to: 'il', vol: 30, spec: ['onco','card'], channel: 'Facilitators', note: 'Hematology-oncology leader' },
  { from: 'cis', to: 'de', vol: 20, spec: ['onco','card','orth'], channel: 'Clinics', note: 'Cancer + cardiac' },
  { from: 'cis', to: 'kr', vol: 15, spec: ['cosm','dent'], channel: 'Agencies', note: 'K-beauty driven' },
  { from: 'sa', to: 'in', vol: 180, spec: ['card','onco','orth','trans'], channel: 'Direct + Visa', note: 'Largest corridor globally — incl. kidney/liver transplant' },
  { from: 'iq', to: 'in', vol: 55, spec: ['orth','card','onco','trans'], channel: 'Facilitator + Embassy', note: 'Strong network — surgery + transplant' },
  { from: 'iq', to: 'ae', vol: 20, spec: ['orth','card'], channel: 'Facilitator', note: 'Proximity' },
  { from: 'cn', to: 'kr', vol: 350, spec: ['cosm','dent','well'], channel: 'Hallyu + Marketplace', note: '31% of Korea tourists, K-pop effect' },
  { from: 'cn', to: 'ae', vol: 15, spec: ['fert'], channel: 'Direct + Agencies', note: 'Gender selection (banned China, legal UAE)' },
  { from: 'cn', to: 'th', vol: 40, spec: ['cosm','well'], channel: 'Marketplace', note: 'Wellness + cosmetic' },
  { from: 'jp', to: 'kr', vol: 400, spec: ['cosm','dent','well'], channel: 'Direct + Gangnam Unni', note: '#1 source Korea — 370K in 2024' },
  { from: 'in_o', to: 'ae', vol: 25, spec: ['fert'], channel: 'Direct + Clinics', note: 'Gender selection (banned India, legal UAE)' },
  { from: 'us', to: 'kr', vol: 70, spec: ['cosm','dent'], channel: 'Agencies + Social', note: '11.6% Korea cosmetic tourists' },
  { from: 'us', to: 'tr', vol: 35, spec: ['cosm','dent','orth'], channel: 'Marketplace', note: 'Hair + dental' },
  { from: 'us', to: 'ae', vol: 12, spec: ['fert'], channel: 'Direct', note: 'IVF $8-13K vs $25-30K US' },
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  stat: 'Market Data',
  platform: 'Platform',
  provider: 'Provider',
  regulatory: 'Regulatory',
  standard: 'Standard',
};

export const TIMELINE: TimelineEvent[] = [
  // 2021
  { y:2021,q:1,stream:'onco',dest:'il',name:'Israel Medical Tourism',desc:'~$500M/yr medical tourism revenue, 80% patients come for oncology',url:'https://bookinghealth.com/blog/diagnoses-and-treatment/diagnosis-and-treatment/603927-medical-tourism-to-israel.html',type:'stat' },
  { y:2021,q:1,stream:'card',dest:'in',name:'Apollo Hospitals Intl Patients',desc:'Serving patients from 120+ countries, dedicated intl patient centers',url:'https://www.apollohospitals.com/international-patients/',type:'provider' },
  { y:2021,q:1,stream:'cosm',dest:'th',name:'Bumrungrad 400K+ Intl Patients',desc:'Leading medical tourism hospital, 190+ countries served annually',url:'https://www.bumrungrad.com/',type:'provider' },
  { y:2021,q:2,stream:'cosm',dest:'kr',name:'Gangnam Unni Growth',desc:"Korea's #1 cosmetic surgery platform, 2.8M users, expanding to Japan/China",url:'https://unni.global/',type:'platform' },
  { y:2021,q:2,stream:'onco',dest:'de',name:'Germany 200K Intl Patients',desc:'Precision medicine leader — oncology, cardiology, orthopedics. Charité, Heidelberg',url:'https://medicaltourismbusiness.com/medical-tourism-statistics-by-country-facts-figures-destinations/',type:'stat' },
  { y:2021,q:2,stream:'fert',dest:'ae',name:'UAE Gender Selection Legal',desc:'IVF with PGT-A for family balancing legal in UAE — one of few countries globally',url:'https://bournhall-clinic.ae/can-we-choose-gender-in-ivf-in-dubai/',type:'regulatory' },
  { y:2021,q:3,stream:'well',dest:'th',name:'Thailand Medical Hub Strategy',desc:"Government-backed push to maintain Asia's top wellness + medical tourism destination",url:'https://www.bumrungrad.com/',type:'regulatory' },
  { y:2021,q:3,stream:'cosm',dest:'tr',name:'Turkey 1M+ Health Tourists',desc:'Hair transplant, cosmetic, dental — Europe→Turkey corridor dominant',url:'https://medicaltourismbusiness.com/medical-tourism-statistics-by-country-facts-figures-destinations/',type:'stat' },
  { y:2021,q:4,stream:'card',dest:'in',name:'India E-Medical Visa Program',desc:'Streamlined medical visa with multi-entry for treatment follow-up',url:'https://indianvisaonline.gov.in/evisa/tvoa.html',type:'regulatory' },
  { y:2021,q:2,stream:'onco',dest:'all',name:'G7 Commits to IPS Standard',desc:'G7 Health Ministers commit to International Patient Summary for cross-border data',url:'https://blog.hl7.org/advancing-the-international-patient-summary-ips',type:'standard' },
  { y:2021,q:3,stream:'card',dest:'all',name:'SNOMED CT IPS Production',desc:'First production release of IPS terminology — 8K+ coded clinical terms',url:'https://www.snomed.org/international-patient-summary-terminology',type:'standard' },
  // 2022
  { y:2022,q:1,stream:'onco',dest:'ksa',name:'Seha Virtual Hospital Launch',desc:"World's largest virtual hospital — 130+ hospitals, 30+ specialties, 400K capacity",url:'https://www.moh.gov.sa/en/ministry/projects/pages/seha-virtual-hospital.aspx',type:'provider' },
  { y:2022,q:1,stream:'cosm',dest:'ae',name:'Dubai 674K Medical Tourists',desc:'AED 992M spent — Asia 39%, Europe 22%, Arab/GCC 21%',url:'https://www.dha.gov.ae/en/media/news/823',type:'stat' },
  { y:2022,q:2,stream:'fert',dest:'ae',name:'Min. Economy + DHA MoU',desc:'UAE Ministry of Economy and DHA sign MoU to promote medical tourism',url:'https://www.moet.gov.ae/en/-/ministry-of-economy-and-dha-sign-mou-to-promote-medical-tourism-and-attract-more-health-tourists-to-the-uae',type:'regulatory' },
  { y:2022,q:2,stream:'onco',dest:'all',name:'EHDS Proposed (EU)',desc:'European Commission proposes European Health Data Space — cross-border health data framework',url:'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en',type:'standard' },
  { y:2022,q:3,stream:'cosm',dest:'kr',name:'Korea Cosmetic Tourism 7x Jump',desc:'Foreign cosmetic patients surge from 52K to 383K in one year post-pandemic',url:'https://www.koreabiomed.com/news/articleView.html?idxno=25422',type:'stat' },
  { y:2022,q:3,stream:'onco',dest:'ksa',name:'Seha Oncology E-Platform',desc:'First oncology e-platform in MENA — tumor case review across Kingdom',url:'https://www.odysseyrecruitment.com/seha-virtual-hospital-saudi-arabia-world-s-largest-virtual-hospital',type:'provider' },
  { y:2022,q:3,stream:'cosm',dest:'ae',name:'DoH Abu Dhabi Med Tourism Redef.',desc:'Circular USO/235/2022 — updated medical tourism definition and reporting',url:'https://www.doh.gov.ae/en/shafafiya/reporting/reporting-of-medical-tourism-self-pay-and-non-insurance-claims',type:'regulatory' },
  { y:2022,q:4,stream:'dent',dest:'tr',name:'Turkey Dental Tourism Boom',desc:'1.2M+ health tourists, dental + hair transplant driving European flow',url:'https://medicaltourismbusiness.com/medical-tourism-statistics-by-country-facts-figures-destinations/',type:'stat' },
  { y:2022,q:4,stream:'fert',dest:'all',name:'HL7 FHIR IPS STU 1.1',desc:'Standard for international patient summary exchange via FHIR published',url:'https://hl7.org/fhir/uv/ips/STU1.1/',type:'standard' },
  // 2023
  { y:2023,q:1,stream:'cosm',dest:'kr',name:'Korea 606K Record',desc:'Record medical tourists — Japan 31%, China, dermatology dominant',url:'https://www.koreaherald.com/article/3381969',type:'stat' },
  { y:2023,q:1,stream:'onco',dest:'ksa',name:'Saudi 111 JCI Accredited',desc:'Highest JCI-accredited facilities globally — positioning for medical tourism',url:'https://medicaltravelmarket.com/news/saudi-arabia-plans-to-diversify-into-medical-tourism',type:'stat' },
  { y:2023,q:1,stream:'well',dest:'all',name:'MyHealth@EU Expands to 9 Countries',desc:'Cross-border patient summary exchange live in CY, EL, HU, IE, IT, LT, LV, SE, SI',url:'https://international-patient-summary.net/european-patient-summary-and-the-ips/',type:'standard' },
  { y:2023,q:2,stream:'cosm',dest:'all',name:'Better by MTA Platform Expand',desc:'Patient acquisition ecosystem — referral comms, secure docs, AI coordination',url:'https://www.better.medicaltourism.com/',type:'platform' },
  { y:2023,q:2,stream:'card',dest:'in',name:'Aster DM GCC/India Demerger',desc:'Splitting into separate GCC and India entities — 29 hospitals, 300+ clinics',url:'https://www.asterdmhealthcare.com/',type:'provider' },
  { y:2023,q:3,stream:'onco',dest:'il',name:'Israel Oncology 90% Success',desc:'CAR T-cell, targeted therapy, robotic surgery — Hadassah, Sheba, Sourasky',url:'https://us-uk.bookimed.com/article/medical-tourism-in-israel/',type:'provider' },
  { y:2023,q:4,stream:'cosm',dest:'kr',name:'Gangnam Unni ¥41.7B Revenue',desc:'Revenue up 70% YoY, turned profitable. Operating profit ¥12.2B',url:'https://www.koreabiomed.com/news/articleView.html?idxno=26640',type:'platform' },
  { y:2023,q:4,stream:'well',dest:'ksa',name:'Saudi Vision 2030 Med Tourism',desc:'150M tourists by 2030 target, healthcare as key diversification segment',url:'https://medicaltravelmarket.com/news/saudi-arabia-plans-to-diversify-into-medical-tourism',type:'regulatory' },
  // 2024
  { y:2024,q:1,stream:'cosm',dest:'ae',name:'CCAD 35% Intl Patient Growth',desc:'Cleveland Clinic Abu Dhabi reports 35% growth in international patients',url:'https://www.clevelandclinicabudhabi.ae/',type:'provider' },
  { y:2024,q:1,stream:'onco',dest:'all',name:'Epic + Google Adopt IPS',desc:'Major EHR vendors commit to International Patient Summary standard',url:'https://blog.hl7.org/topic/international-patient-summary',type:'standard' },
  { y:2024,q:1,stream:'cosm',dest:'kr',name:'Korea Dental Tourism +588%',desc:'Q3 2024 dental tourists surge nearly 7x — driven by competitive pricing',url:'https://jivaka.kr/blogs/blog/korean-medical-tourism-2026-complete-guide-to-changes-benefits-what-you-need-to-know',type:'stat' },
  { y:2024,q:2,stream:'fert',dest:'ae',name:'DoH Abu Dhabi Med Tourism Update',desc:'Circular USO/96/2024 — updated reporting requirements for medical tourism',url:'https://www.doh.gov.ae/en/shafafiya/reporting/reporting-of-medical-tourism-self-pay-and-non-insurance-claims',type:'regulatory' },
  { y:2024,q:2,stream:'cosm',dest:'kr',name:'Korea VAT Refund for Cosmetic',desc:'413K VAT refunds for foreign cosmetic patients by June, surpassing all 2023',url:'https://www.koreabiomed.com/news/articleView.html?idxno=25422',type:'regulatory' },
  { y:2024,q:3,stream:'onco',dest:'all',name:'EU Parliament Adopts EHDS',desc:'European Health Data Space regulation adopted — cross-border patient data framework',url:'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en',type:'standard' },
  { y:2024,q:3,stream:'well',dest:'ksa',name:'Saudi Digital Health Twin',desc:'30M+ users via Sehhaty app — AI models for virtual health replicas',url:'https://lucidityinsights.com/articles/seha-virtual-hospital-sehhaty-app',type:'provider' },
  { y:2024,q:4,stream:'cosm',dest:'kr',name:'Korea 1.17M Record (2024)',desc:'Nearly double 2023 — Japan + China = 60%. Dermatology 56%, cosmetic 11%',url:'https://www.korea.net/NewsFocus/Society/view?articleId=269202',type:'stat' },
  { y:2024,q:4,stream:'cosm',dest:'kr',name:'Gangnam Unni UNNI Global',desc:'Multi-language platform — 104 countries, Thai launch, 300K Japan consultations',url:'https://unni.global/',type:'platform' },
  { y:2024,q:4,stream:'fert',dest:'ae',name:'Dubai IVF Gender Selection Boom',desc:'IVF $8-13K vs $25-30K in US. Legal for family balancing. China, India, UK inbound',url:'https://www.placidway.com/article/6447/7-Things-to-Know-About-IVF-with-Gender-Selection-in-Dubai-UAE',type:'provider' },
  // 2025
  { y:2025,q:1,stream:'onco',dest:'all',name:'EHDS In Force (Mar 2025)',desc:'EU Regulation 2025/327 enters force. Patient Summaries mandated by 2029',url:'https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng',type:'standard' },
  { y:2025,q:1,stream:'cosm',dest:'kr',name:'Gangnam Unni $30M Series C',desc:'Global expansion — Japan (370K consultations), Thailand, B2B CRM tools',url:'https://www.koreabiomed.com/news/articleView.html?idxno=26640',type:'platform' },
  { y:2025,q:1,stream:'onco',dest:'ksa',name:'Seha 224+ Hospitals Connected',desc:'597K+ annual capacity, 44 specialties, The Sandbox healthtech incubator',url:'https://lucidityinsights.com/articles/seha-virtual-hospital-sehhaty-app',type:'provider' },
  { y:2025,q:1,stream:'onco',dest:'all',name:'EN-ISO 27269:2025 Published',desc:'Updated international standard for patient summary dataset specification',url:'https://www.ehealth-standards.eu/2023/09/11/a-short-and-clear-introduction-to-the-international-patient-summary-ips/',type:'standard' },
  { y:2025,q:1,stream:'cosm',dest:'kr',name:'Korea 700K Target by 2027',desc:'Government goal — medical tourism as economic catalyst, 10x tourist spending',url:'https://www.koreaherald.com/article/3381969',type:'regulatory' },
];

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  discovery: 'Discovery',
  crm: 'CRM',
  payments: 'Payments',
  intelligence: 'Intelligence',
  standards: 'Standards',
};

export const VENDORS: Record<VendorCategory, Vendor[]> = {
  discovery: [
    { name:'Bookimed', type:'Marketplace', coverage:'Global', signal:'700+ clinics', url:'https://bookimed.com' },
    { name:'PlacidWay', type:'Marketplace', coverage:'Global', signal:'200+ providers', url:'https://placidway.com' },
    { name:'WhatClinic', type:'Search', coverage:'Global', signal:'10K+ clinics', url:'https://whatclinic.com' },
    { name:'Flymedi', type:'Marketplace', coverage:'EU↔Turkey', signal:'Cosmetic', url:'https://flymedi.com' },
    { name:'DXH Dubai', type:'Gov platform', coverage:'Dubai', signal:'DHA official', url:'https://dxh.ae' },
    { name:'Gangnam Unni', type:'Marketplace', coverage:'Korea', signal:'$30M C, 7M users', url:'https://unni.global' },
    { name:'Himedi', type:'Concierge', coverage:'→Korea', signal:'N.America+ME', url:'https://himedi.co.kr' },
    { name:'Better by MTA', type:'Association', coverage:'Global', signal:'Provider net', url:'https://www.better.medicaltourism.com' },
  ],
  crm: [
    { name:'LeadSquared', type:'Healthcare CRM', coverage:'India, ME, SEA', signal:'$153M raised', url:'https://leadsquared.com' },
    { name:'Salesforce HC', type:'Enterprise', coverage:'Global', signal:'Category leader', url:'https://salesforce.com' },
    { name:'HubSpot', type:'CRM + Mktg', coverage:'Global', signal:'HIPAA option', url:'https://hubspot.com' },
    { name:'Health Tourism CRM', type:'Niche', coverage:'Med tourism', signal:'Vertical-specific', url:'https://healthtourismcrm.com' },
  ],
  payments: [
    { name:'Flywire', type:'Cross-border', coverage:'Global', signal:'NASDAQ IPO', url:'https://flywire.com' },
    { name:'PatientFi', type:'Financing', coverage:'USA+', signal:'$50M raised', url:'https://patientfi.com' },
    { name:'PayTabs', type:'MENA processor', coverage:'GCC', signal:'Regional leader', url:'https://paytabs.com' },
  ],
  intelligence: [
    { name:'Celonis', type:'Process Mining', coverage:'Global', signal:'$13B valuation', url:'https://celonis.com' },
    { name:'IQVIA NBA', type:'Next-Best-Action', coverage:'Life Sciences', signal:'Enterprise', url:'https://iqvia.com' },
    { name:'Innovaccer', type:'Health Data', coverage:'Global', signal:'$3.2B valuation', url:'https://innovaccer.com' },
  ],
  standards: [
    { name:'HL7 FHIR IPS', type:'Standard', coverage:'Global', signal:'EHRs adopting', url:'https://hl7.org/fhir/uv/ips/' },
    { name:'SNOMED IPS', type:'Terminology', coverage:'Global', signal:'8K+ coded terms', url:'https://www.snomed.org/international-patient-summary-terminology' },
    { name:'EHDS', type:'EU Regulation', coverage:'Europe', signal:'In force 2025', url:'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en' },
  ],
};

export const STAGES: DiagnosticStage[] = [
  { id:'aw', label:'Discovery', short:'Discovery', icon:'◉', desc:'How patients find you',
    questions:[
      {id:'q1',text:'Listed on 3+ intl directories',weight:2},
      {id:'q2',text:'Multilingual procedure pages',weight:3},
      {id:'q3',text:'Corridor-specific channels active',weight:2},
      {id:'q4',text:'Gov platform listed (DXH, MTA)',weight:2},
      {id:'q5',text:'Physician referral network',weight:3},
    ],
    products:[
      {name:'Directory Listings',type:'buy',effort:'low',impact:'high',players:['Bookimed','PlacidWay']},
      {name:'Multilingual SEO',type:'build',effort:'medium',impact:'high',players:['Agency']},
      {name:'Referral CRM',type:'buy',effort:'medium',impact:'high',players:['Salesforce','LeadSquared']},
    ]},
  { id:'iq', label:'Inquiry', short:'Inquiry', icon:'◈', desc:'First response and capture',
    questions:[
      {id:'q6',text:'Response <2hrs for intl inquiries',weight:3},
      {id:'q7',text:'Dedicated intl coordinator team',weight:3},
      {id:'q8',text:'Structured intake form',weight:2},
      {id:'q9',text:'WhatsApp Business + bot',weight:2},
      {id:'q10',text:'Lead source tracking',weight:3},
    ],
    products:[
      {name:'WhatsApp API',type:'buy',effort:'low',impact:'high',players:['WATI','Twilio']},
      {name:'Patient CRM',type:'buy',effort:'medium',impact:'high',players:['LeadSquared','HubSpot']},
      {name:'Intake Workflow',type:'build',effort:'low',impact:'high',players:['In-house']},
    ]},
  { id:'es', label:'Estimate', short:'Estimate', icon:'◆', desc:'Qualification and pricing',
    questions:[
      {id:'q11',text:'Structured qualification process',weight:3},
      {id:'q12',text:'Estimate within 48hrs',weight:3},
      {id:'q13',text:'Doctor video before travel',weight:2},
      {id:'q14',text:'Itemized price transparency',weight:2},
      {id:'q15',text:'Know competitor pricing',weight:2},
    ],
    products:[
      {name:'Virtual 2nd Opinion',type:'buy',effort:'medium',impact:'high',players:['Teladoc']},
      {name:'Estimate Generator',type:'build',effort:'medium',impact:'high',players:['Custom']},
    ]},
  { id:'tr', label:'Trust', short:'Trust', icon:'◇', desc:'Building commitment',
    questions:[
      {id:'q16',text:'Corridor testimonials available',weight:3},
      {id:'q17',text:'JCI communicated everywhere',weight:2},
      {id:'q18',text:'Doctor credentials transparent',weight:2},
      {id:'q19',text:'Family support info proactive',weight:1},
      {id:'q20',text:'Financing / payment plans',weight:3},
    ],
    products:[
      {name:'Patient Financing',type:'buy',effort:'medium',impact:'high',players:['Flywire','PatientFi']},
      {name:'Testimonial System',type:'build',effort:'low',impact:'high',players:['In-house']},
    ]},
  { id:'lg', label:'Logistics', short:'Logistics', icon:'◫', desc:'Pre-arrival coordination',
    questions:[
      {id:'q21',text:'Visa letter <24hrs',weight:2},
      {id:'q22',text:'Airport + hotel in package',weight:2},
      {id:'q23',text:'Pre-arrival checklist tracked',weight:3},
      {id:'q24',text:'Multi-method payments',weight:2},
      {id:'q25',text:'Clinical handoff protocol',weight:3},
    ],
    products:[
      {name:'Cross-Border Payments',type:'buy',effort:'low',impact:'high',players:['Flywire','PayTabs']},
      {name:'Patient Portal',type:'build',effort:'high',impact:'high',players:['Custom']},
      {name:'Handoff Protocol',type:'build',effort:'low',impact:'high',players:['In-house']},
    ]},
  { id:'tx', label:'Treatment', short:'Treatment', icon:'✦', desc:'Care and record portability',
    questions:[
      {id:'q26',text:'Interpreter support',weight:2},
      {id:'q27',text:'Family updates during treatment',weight:2},
      {id:'q28',text:'Intl patient ward',weight:1},
      {id:'q29',text:'Satisfaction measured during stay',weight:2},
      {id:'q30',text:'IPS discharge summary',weight:3},
    ],
    products:[
      {name:'IPS Discharge (SNOMED/FHIR)',type:'build',effort:'medium',impact:'high',players:['EHR + HL7']},
      {name:'Family Comms',type:'buy',effort:'low',impact:'medium',players:['WhatsApp']},
    ]},
  { id:'fu', label:'Follow-Up', short:'Follow-Up', icon:'⟐', desc:'Retention and referrals',
    questions:[
      {id:'q31',text:'Structured follow-up protocol',weight:3},
      {id:'q32',text:'Virtual follow-up consultations',weight:3},
      {id:'q33',text:'NPS by corridor / procedure',weight:2},
      {id:'q34',text:'Referral program with incentives',weight:3},
      {id:'q35',text:'Outcome tracking intl patients',weight:2},
    ],
    products:[
      {name:'Follow-Up Sequences',type:'buy',effort:'low',impact:'high',players:['CRM automation']},
      {name:'Virtual Follow-Up',type:'buy',effort:'medium',impact:'high',players:['Teladoc']},
      {name:'Referral Engine',type:'build',effort:'medium',impact:'high',players:['In-house']},
    ]},
];
