import { TimelineEvent, TimelineStage, StakeholderType } from '@/types';

// Stage configuration - MONOCHROME (all gray)
export const stageConfig: Record<TimelineStage, { 
  label: { en: string; ar: string }; 
  yearRange: [number, number];
  color: string;
}> = {
  foundation: {
    label: { en: 'Foundation', ar: 'التأسيس' },
    yearRange: [1971, 2007],
    color: 'hsl(0, 0%, 50%)'
  },
  digitalization: {
    label: { en: 'Digitalization', ar: 'الرقمنة' },
    yearRange: [2007, 2017],
    color: 'hsl(0, 0%, 50%)'
  },
  'ai-integration': {
    label: { en: 'AI Integration', ar: 'تكامل الذكاء الاصطناعي' },
    yearRange: [2018, 2020],
    color: 'hsl(0, 0%, 50%)'
  },
  acceleration: {
    label: { en: 'Acceleration', ar: 'التسارع' },
    yearRange: [2020, 2023],
    color: 'hsl(0, 0%, 50%)'
  },
  future: {
    label: { en: 'Future', ar: 'المستقبل' },
    yearRange: [2024, 2030],
    color: 'hsl(0, 0%, 50%)'
  }
};

// Stakeholder configuration - MONOCHROME (all gray)
export const stakeholderConfig: Record<StakeholderType, {
  label: { en: string; ar: string };
  color: string;
}> = {
  government: {
    label: { en: 'Government', ar: 'الحكومة' },
    color: 'hsl(0, 0%, 45%)'
  },
  healthcare: {
    label: { en: 'Healthcare Providers', ar: 'مقدمو الرعاية الصحية' },
    color: 'hsl(0, 0%, 50%)'
  },
  tech: {
    label: { en: 'Tech Companies', ar: 'شركات التكنولوجيا' },
    color: 'hsl(0, 0%, 55%)'
  },
  research: {
    label: { en: 'Research', ar: 'البحث' },
    color: 'hsl(0, 0%, 60%)'
  },
  startup: {
    label: { en: 'Startups', ar: 'الشركات الناشئة' },
    color: 'hsl(0, 0%, 65%)'
  }
};

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'mohap-founded',
    year: 1971,
    title: {
      en: 'Ministry of Health Established',
      ar: 'تأسيس وزارة الصحة'
    },
    description: {
      en: 'The UAE Ministry of Health was established as one of the first federal ministries, laying the foundation for national healthcare.',
      ar: 'تأسست وزارة الصحة الإماراتية كواحدة من أولى الوزارات الاتحادية، واضعة الأساس للرعاية الصحية الوطنية.'
    },
    type: 'milestone',
    country: 'UAE',
    relatedPlayers: ['mohap'],
    impact: 'high',
    stage: 'foundation',
    stakeholderType: 'government',
    hotspotNumber: 1,
  },
  {
    id: 'seha-founded',
    year: 2007,
    title: {
      en: 'SEHA Established',
      ar: 'تأسيس شركة صحة'
    },
    description: {
      en: 'Abu Dhabi Health Services Company (SEHA) was formed to manage public healthcare facilities and drive modernization.',
      ar: 'تأسست شركة أبوظبي للخدمات الصحية (صحة) لإدارة المرافق الصحية العامة ودفع عجلة التحديث.'
    },
    type: 'launch',
    country: 'UAE',
    relatedPlayers: ['seha'],
    impact: 'high',
    stage: 'digitalization',
    stakeholderType: 'healthcare',
    hotspotNumber: 2,
  },
  {
    id: 'cleveland-clinic-opens',
    year: 2015,
    title: {
      en: 'Cleveland Clinic Abu Dhabi Opens',
      ar: 'افتتاح كليفلاند كلينك أبوظبي'
    },
    description: {
      en: 'Cleveland Clinic Abu Dhabi opens as a world-class hospital, introducing advanced surgical robotics and AI-assisted diagnostics.',
      ar: 'يفتتح كليفلاند كلينك أبوظبي كمستشفى عالمي المستوى، مقدماً الروبوتات الجراحية المتقدمة والتشخيص بمساعدة الذكاء الاصطناعي.'
    },
    type: 'launch',
    country: 'UAE',
    relatedPlayers: ['cleveland-clinic-ad'],
    impact: 'high',
    stage: 'digitalization',
    stakeholderType: 'healthcare',
    hotspotNumber: 3,
  },
  {
    id: 'nabidh-launch',
    year: 2017,
    title: {
      en: 'NABIDH Platform Launched',
      ar: 'إطلاق منصة نبض'
    },
    description: {
      en: 'Dubai Health Authority launches NABIDH, a unified health information exchange connecting all healthcare providers in Dubai.',
      ar: 'تطلق هيئة الصحة بدبي منصة نبض، منصة موحدة لتبادل المعلومات الصحية تربط جميع مقدمي الرعاية الصحية في دبي.'
    },
    type: 'launch',
    country: 'UAE',
    relatedPlayers: ['nabidh'],
    impact: 'high',
    stage: 'digitalization',
    stakeholderType: 'government',
    hotspotNumber: 4,
  },
  {
    id: 'doh-ai-strategy',
    year: 2018,
    title: {
      en: 'Abu Dhabi AI Health Strategy',
      ar: 'استراتيجية أبوظبي للذكاء الاصطناعي الصحي'
    },
    description: {
      en: 'Department of Health Abu Dhabi announces comprehensive AI integration strategy for healthcare sector.',
      ar: 'تعلن دائرة الصحة في أبوظبي عن استراتيجية شاملة لدمج الذكاء الاصطناعي في قطاع الرعاية الصحية.'
    },
    type: 'regulation',
    country: 'UAE',
    relatedPlayers: ['doh'],
    impact: 'high',
    stage: 'ai-integration',
    stakeholderType: 'government',
    hotspotNumber: 5,
  },
  {
    id: 'g42-healthcare-founded',
    year: 2018,
    title: {
      en: 'G42 Healthcare Established',
      ar: 'تأسيس G42 للرعاية الصحية'
    },
    description: {
      en: 'G42 launches its healthcare division, focusing on AI-powered genomics and precision medicine.',
      ar: 'تطلق G42 قسمها للرعاية الصحية، مع التركيز على الجينوميات المدعومة بالذكاء الاصطناعي والطب الدقيق.'
    },
    type: 'launch',
    country: 'UAE',
    relatedPlayers: ['g42-healthcare'],
    impact: 'high',
    stage: 'ai-integration',
    stakeholderType: 'tech',
    hotspotNumber: 6,
  },
  {
    id: 'mbzuai-founded',
    year: 2019,
    title: {
      en: 'MBZUAI Established',
      ar: 'تأسيس جامعة محمد بن زايد للذكاء الاصطناعي'
    },
    description: {
      en: 'The world\'s first graduate-level AI university opens in Abu Dhabi, with healthcare AI as a key research focus.',
      ar: 'تفتتح أول جامعة في العالم للدراسات العليا في الذكاء الاصطناعي في أبوظبي، مع الذكاء الاصطناعي الصحي كمحور بحثي رئيسي.'
    },
    type: 'milestone',
    country: 'UAE',
    relatedPlayers: ['mbzuai'],
    impact: 'high',
    stage: 'ai-integration',
    stakeholderType: 'research',
    hotspotNumber: 7,
  },
  {
    id: 'covid-ai-response',
    year: 2020,
    month: 3,
    title: {
      en: 'COVID-19 AI Response Initiative',
      ar: 'مبادرة الاستجابة لكوفيد-19 بالذكاء الاصطناعي'
    },
    description: {
      en: 'UAE deploys AI-powered contact tracing, predictive analytics, and diagnostic tools in response to COVID-19 pandemic.',
      ar: 'تنشر الإمارات أدوات تتبع المخالطين والتحليلات التنبؤية والتشخيصية المدعومة بالذكاء الاصطناعي استجابةً لجائحة كوفيد-19.'
    },
    type: 'milestone',
    country: 'UAE',
    relatedPlayers: ['mohap', 'doh', 'seha'],
    impact: 'high',
    stage: 'acceleration',
    stakeholderType: 'government',
    hotspotNumber: 8,
  },
  {
    id: 'g42-genome-project',
    year: 2021,
    title: {
      en: 'National Genome Program Expansion',
      ar: 'توسيع برنامج الجينوم الوطني'
    },
    description: {
      en: 'G42 Healthcare partners with government to expand national genome sequencing program for personalized medicine.',
      ar: 'تتشارك G42 للرعاية الصحية مع الحكومة لتوسيع برنامج تسلسل الجينوم الوطني للطب الشخصي.'
    },
    type: 'partnership',
    country: 'UAE',
    relatedPlayers: ['g42-healthcare', 'doh'],
    impact: 'high',
    stage: 'acceleration',
    stakeholderType: 'tech',
    hotspotNumber: 9,
  },
  {
    id: 'astra-tech-launch',
    year: 2022,
    title: {
      en: 'Astra Tech Enters Healthcare',
      ar: 'دخول أسترا تك لقطاع الرعاية الصحية'
    },
    description: {
      en: 'Astra Tech integrates telemedicine and AI health features into its Botim super-app platform.',
      ar: 'تدمج أسترا تك خدمات الطب عن بعد وميزات الصحة بالذكاء الاصطناعي في منصة تطبيق بوتيم الفائق.'
    },
    type: 'launch',
    country: 'UAE',
    relatedPlayers: ['astra-tech'],
    impact: 'medium',
    stage: 'acceleration',
    stakeholderType: 'startup',
    hotspotNumber: 10,
  },
  {
    id: 'uae-ai-health-investment',
    year: 2023,
    title: {
      en: 'Major AI Healthcare Investment',
      ar: 'استثمار كبير في الذكاء الاصطناعي الصحي'
    },
    description: {
      en: 'UAE announces $2 billion investment fund for AI healthcare startups and research initiatives.',
      ar: 'تعلن الإمارات عن صندوق استثماري بقيمة 2 مليار دولار للشركات الناشئة والمبادرات البحثية في الذكاء الاصطناعي الصحي.'
    },
    type: 'funding',
    country: 'UAE',
    relatedPlayers: ['doh', 'mohap'],
    impact: 'high',
    stage: 'acceleration',
    stakeholderType: 'government',
    hotspotNumber: 11,
  },
];

// Helper functions
export function getEventsByYear(year: number): TimelineEvent[] {
  return timelineEvents.filter(e => e.year === year);
}

export function getEventsByType(type: TimelineEvent['type']): TimelineEvent[] {
  return timelineEvents.filter(e => e.type === type);
}

export function getEventsByCountry(country: string): TimelineEvent[] {
  return timelineEvents.filter(e => e.country === country);
}

export function getEventsByPlayer(playerId: string): TimelineEvent[] {
  return timelineEvents.filter(e => e.relatedPlayers.includes(playerId));
}

export function getTimelineYearRange(): { min: number; max: number } {
  const years = timelineEvents.map(e => e.year);
  return { min: Math.min(...years), max: Math.max(...years) };
}
