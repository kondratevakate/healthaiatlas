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
      en: 'Dubai Health Authority\'s unified health information exchange platform connecting all healthcare providers in Dubai.',
      ar: 'منصة تبادل المعلومات الصحية الموحدة لهيئة الصحة بدبي التي تربط جميع مقدمي الرعاية الصحية في دبي.'
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
      en: 'Abu Dhabi Health Services Company, the largest healthcare network in the UAE operating 14 hospitals and numerous clinics.',
      ar: 'شركة أبوظبي للخدمات الصحية، أكبر شبكة رعاية صحية في الإمارات تدير 14 مستشفى والعديد من العيادات.'
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
      en: 'AI-powered healthcare company developing precision medicine solutions, genomics, and population health initiatives.',
      ar: 'شركة رعاية صحية مدعومة بالذكاء الاصطناعي تطور حلول الطب الدقيق والجينوميات ومبادرات صحة السكان.'
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
      en: 'Multi-specialty hospital using AI for diagnostics and surgical robotics, part of Cleveland Clinic global network.',
      ar: 'مستشفى متعدد التخصصات يستخدم الذكاء الاصطناعي للتشخيص والروبوتات الجراحية، جزء من شبكة كليفلاند كلينك العالمية.'
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
      en: 'Network of hospitals and clinics implementing AI-powered diagnostic tools and telemedicine services.',
      ar: 'شبكة من المستشفيات والعيادات تنفذ أدوات تشخيصية مدعومة بالذكاء الاصطناعي وخدمات الطب عن بعد.'
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
      en: 'Health-tech startup behind the Botim super-app, integrating telemedicine and AI health features.',
      ar: 'شركة ناشئة في مجال التكنولوجيا الصحية وراء تطبيق بوتيم الفائق، تدمج الطب عن بعد وميزات الصحة بالذكاء الاصطناعي.'
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
      en: 'Regulatory body for healthcare in Abu Dhabi, driving AI adoption policies and digital health transformation.',
      ar: 'الجهة التنظيمية للرعاية الصحية في أبوظبي، تقود سياسات تبني الذكاء الاصطناعي والتحول الرقمي الصحي.'
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
      en: 'Federal ministry overseeing healthcare policy and AI integration across the UAE healthcare system.',
      ar: 'الوزارة الاتحادية المشرفة على سياسات الرعاية الصحية ودمج الذكاء الاصطناعي في نظام الرعاية الصحية الإماراتي.'
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
      en: 'AI startup specializing in medical imaging analysis and early disease detection algorithms.',
      ar: 'شركة ناشئة في مجال الذكاء الاصطناعي متخصصة في تحليل التصوير الطبي وخوارزميات الكشف المبكر عن الأمراض.'
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
      en: 'World\'s first graduate-level AI university with healthcare AI research programs and partnerships.',
      ar: 'أول جامعة في العالم للدراسات العليا في الذكاء الاصطناعي مع برامج بحثية وشراكات في الذكاء الاصطناعي الصحي.'
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
