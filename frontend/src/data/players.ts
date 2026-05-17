import { Player } from '@/types';

// Sample UAE AI Health ecosystem players
export const players: Player[] = [
  {
    id: 'dha',
    name: {
      en: 'Dubai Health Authority',
      ar: 'هيئة الصحة بدبي',
    },
    type: 'government',
    country: 'UAE',
    city: 'Dubai',
    founded: 2007,
    employees: '1000+',
    aiAreas: ['health-records', 'administrative'],
    description: {
      en: 'Regulator of Dubai\'s health sector. Mandates NABIDH connection for all Dubai-licensed healthcare facilities and publishes the HL7 integration spec.',
      ar: 'الجهة المنظِّمة لقطاع الصحة في دبي. تُلزم جميع المرافق الصحية المرخَّصة في دبي بالاتصال بمنصة نبض، وتنشر مواصفات تكامل HL7.',
    },
    website: 'https://www.dha.gov.ae',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    systemRole: 'components',
    connections: ['nabidh'],
    featured: false,
    claim_ids: [],
  },
  {
    id: 'nabidh',
    name: { 
      en: 'NABIDH (DHA)', 
      ar: 'نبض (هيئة الصحة بدبي)' 
    },
    type: 'government',
    country: 'UAE',
    city: 'Dubai',
    founded: 2017,
    employees: '51-200',
    aiAreas: ['health-records', 'patient-monitoring', 'administrative'],
    description: {
      en: 'DHA\'s health information exchange. Every Dubai-licensed healthcare provider must connect to it — that\'s how Dubai gets a single patient record across facilities.',
      ar: 'منصة تبادل المعلومات الصحية التابعة لهيئة الصحة بدبي. كل مقدّم رعاية صحية مرخَّص في دبي ملزَم بالاتصال بها — وعبرها تحصل دبي على سجلٍ موحَّد للمريض بين المرافق.'
    },
    website: 'https://www.dha.gov.ae/nabidh',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    systemRole: 'components',
    connections: ['seha', 'cleveland-clinic-ad'],
    featured: true,
    claim_ids: ['c_nabidh_jurisdiction_dubai', 'c_nabidh_under_dha', 'c_nabidh_onboarding_prerequisite', 'c_nabidh_publishes_hl7_spec'],
  },
  {
    id: 'seha',
    name: { 
      en: 'SEHA', 
      ar: 'صحة' 
    },
    type: 'government',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 2007,
    employees: '1000+',
    aiAreas: ['diagnostics', 'patient-monitoring', 'administrative'],
    description: {
      en: 'Abu Dhabi\'s public hospital operator. Runs 14 hospitals and a network of primary-care clinics across the emirate.',
      ar: 'مشغّل المستشفيات الحكومية في أبوظبي. يدير 14 مستشفى وشبكة من عيادات الرعاية الأولية في الإمارة.'
    },
    website: 'https://www.seha.ae',
    coordinates: { lat: 24.4539, lng: 54.3773 },
    systemRole: 'impacts',
    connections: ['nabidh', 'g42-healthcare'],
    featured: true,
    claim_ids: ['c_seha_connects_malaffi', 'c_seha_operational_status', 'c_seha_deployed_ai_triage'],
  },
  {
    id: 'g42-healthcare',
    name: { 
      en: 'G42 Healthcare', 
      ar: 'G42 للرعاية الصحية' 
    },
    type: 'enterprise',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 2018,
    employees: '201-500',
    funding: '$100M+',
    aiAreas: ['genomics', 'drug-discovery', 'diagnostics', 'medical-imaging'],
    description: {
      en: 'Builds precision-medicine and genomics infrastructure for the UAE health system. Runs the country\'s population-scale sequencing program.',
      ar: 'يبني البنية التحتية للطب الدقيق والجينوميات في النظام الصحي الإماراتي. يُشغّل برنامج تسلسل الجينوم على نطاق سكاني في الدولة.'
    },
    website: 'https://g42healthcare.ai',
    coordinates: { lat: 24.4667, lng: 54.3667 },
    systemRole: 'components',
    connections: ['seha', 'doh'],
    featured: true,
    claim_ids: ['c_g42_deployed_at_doh', 'c_g42_procurement_genome', 'c_g42_operational_status'],
  },
  {
    id: 'cleveland-clinic-ad',
    name: { 
      en: 'Cleveland Clinic Abu Dhabi', 
      ar: 'كليفلاند كلينك أبوظبي' 
    },
    type: 'hospital',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 2015,
    employees: '1000+',
    aiAreas: ['diagnostics', 'medical-imaging', 'patient-monitoring', 'robotics'],
    description: {
      en: 'Cleveland Clinic\'s Abu Dhabi outpost. Uses AI in diagnostics and runs the da Vinci robotic-surgery program.',
      ar: 'الفرع الإقليمي لكليفلاند كلينك في أبوظبي. يستخدم الذكاء الاصطناعي في التشخيص ويُشغّل برنامج الجراحة الروبوتية بنظام دافنشي.'
    },
    website: 'https://www.clevelandclinicabudhabi.ae',
    coordinates: { lat: 24.4225, lng: 54.4346 },
    systemRole: 'activities',
    connections: ['nabidh', 'seha'],
    claim_ids: ['c_ccad_deployed_davinci', 'c_ccad_operational_status'],
  },
  {
    id: 'medcare',
    name: { 
      en: 'Medcare Hospitals', 
      ar: 'مستشفيات ميدكير' 
    },
    type: 'hospital',
    country: 'UAE',
    city: 'Dubai',
    founded: 1998,
    employees: '501-1000',
    aiAreas: ['diagnostics', 'telemedicine', 'patient-monitoring'],
    description: {
      en: 'Private hospital network in Dubai. Uses AI in diagnostics and runs a telemedicine service across its clinics.',
      ar: 'شبكة مستشفيات خاصة في دبي. تستخدم الذكاء الاصطناعي في التشخيص وتُشغّل خدمة طب عن بُعد عبر عياداتها.'
    },
    website: 'https://www.medcare.ae',
    coordinates: { lat: 25.1865, lng: 55.2615 },
    systemRole: 'activities',
    connections: ['nabidh'],
  },
  {
    id: 'astra-tech',
    name: { 
      en: 'Astra Tech', 
      ar: 'أسترا تك' 
    },
    type: 'startup',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 2022,
    employees: '51-200',
    funding: '$50M',
    aiAreas: ['telemedicine', 'mental-health', 'patient-monitoring'],
    description: {
      en: 'Health-tech behind the Botim super-app — bundles telemedicine and AI health features into a single UAE consumer app.',
      ar: 'الشركة الصحية الرقمية التي تقف خلف تطبيق بوتيم الفائق — تجمع الطب عن بُعد وميزات الصحة بالذكاء الاصطناعي في تطبيق مستهلك إماراتي واحد.'
    },
    website: 'https://astra.tech',
    coordinates: { lat: 24.4539, lng: 54.3773 },
    systemRole: 'components',
    connections: ['doh'],
  },
  {
    id: 'doh',
    name: { 
      en: 'Department of Health Abu Dhabi', 
      ar: 'دائرة الصحة - أبوظبي' 
    },
    type: 'government',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 2018,
    employees: '501-1000',
    aiAreas: ['health-records', 'administrative', 'clinical-trials'],
    description: {
      en: 'Abu Dhabi\'s health regulator. Sets AI adoption policies for the emirate and oversees the Malaffi health information exchange.',
      ar: 'الجهة المنظِّمة لقطاع الصحة في أبوظبي. تضع سياسات تبنّي الذكاء الاصطناعي في الإمارة وتشرف على منصة ملفي لتبادل المعلومات الصحية.'
    },
    website: 'https://www.doh.gov.ae',
    coordinates: { lat: 24.4539, lng: 54.3773 },
    systemRole: 'purpose',
    connections: ['seha', 'g42-healthcare', 'astra-tech'],
    featured: true,
  },
  {
    id: 'mohap',
    name: { 
      en: 'Ministry of Health and Prevention', 
      ar: 'وزارة الصحة ووقاية المجتمع' 
    },
    type: 'government',
    country: 'UAE',
    city: 'Dubai',
    founded: 1971,
    employees: '1000+',
    aiAreas: ['health-records', 'administrative', 'patient-monitoring'],
    description: {
      en: 'UAE federal health ministry. Sets policy for the seven-emirates healthcare system, including how AI is adopted in public care.',
      ar: 'الوزارة الاتحادية للصحة في الإمارات. تضع السياسات لمنظومة الرعاية الصحية في الإمارات السبع، بما في ذلك كيفية تبنّي الذكاء الاصطناعي في الرعاية العامة.'
    },
    website: 'https://www.mohap.gov.ae',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    systemRole: 'purpose',
    connections: ['nabidh', 'doh'],
    featured: true,
  },
  {
    id: 'pulse-ai',
    name: { 
      en: 'Pulse AI', 
      ar: 'بلس للذكاء الاصطناعي' 
    },
    type: 'startup',
    country: 'UAE',
    city: 'Dubai',
    founded: 2020,
    employees: '11-50',
    funding: '$5M',
    aiAreas: ['medical-imaging', 'diagnostics'],
    description: {
      en: 'Medical-imaging startup. Builds early-detection models for radiology workflows in Dubai-based clinical partnerships.',
      ar: 'شركة ناشئة في مجال التصوير الطبي. تبني نماذج للكشف المبكر مدمجة في سير عمل الأشعة عبر شراكات سريرية في دبي.'
    },
    coordinates: { lat: 25.0657, lng: 55.1713 },
    systemRole: 'components',
    connections: ['medcare', 'nabidh'],
  },
  {
    id: 'mbzuai',
    name: { 
      en: 'MBZUAI', 
      ar: 'جامعة محمد بن زايد للذكاء الاصطناعي' 
    },
    type: 'research',
    country: 'UAE',
    city: 'Abu Dhabi',
    founded: 2019,
    employees: '201-500',
    aiAreas: ['medical-imaging', 'drug-discovery', 'genomics'],
    description: {
      en: 'The first AI-focused graduate university in the world. Runs healthcare AI research groups in medical imaging, drug discovery, and genomics.',
      ar: 'أول جامعة في العالم متخصصة في الدراسات العليا للذكاء الاصطناعي. تُشغّل مجموعات بحثية في الذكاء الاصطناعي الصحي ضمن التصوير الطبي واكتشاف الأدوية والجينوميات.'
    },
    website: 'https://mbzuai.ac.ae',
    coordinates: { lat: 24.4347, lng: 54.6152 },
    systemRole: 'impacts',
    connections: ['g42-healthcare', 'doh'],
    featured: true,
  },
];

// Helper functions
export function getPlayerById(id: string): Player | undefined {
  return players.find(p => p.id === id);
}

export function getPlayersByType(type: Player['type']): Player[] {
  return players.filter(p => p.type === type);
}

export function getPlayersByCountry(country: string): Player[] {
  return players.filter(p => p.country === country);
}

export function getPlayersBySystemRole(role: Player['systemRole']): Player[] {
  return players.filter(p => p.systemRole === role);
}

export function getFeaturedPlayers(): Player[] {
  return players.filter(p => p.featured);
}
