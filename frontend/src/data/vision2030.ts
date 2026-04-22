// Vision 2030 Data
// Strategic targets and budget allocations for UAE healthcare AI

export interface VisionTarget {
  id: string;
  label: { en: string; ar: string };
  target: string;
  current?: string;
  by: number;
  category: 'digital' | 'ai' | 'infrastructure' | 'workforce';
}

export interface BudgetAllocation {
  year: number;
  amount: string;
  focus: { en: string; ar: string };
  source?: string;
}

export interface StrategicPillar {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: string;
}

export const visionTargets: VisionTarget[] = [
  {
    id: 'ai-diagnostics',
    label: { en: 'AI Diagnostics Coverage', ar: 'تغطية التشخيص بالذكاء الاصطناعي' },
    target: '80%',
    current: '25%',
    by: 2030,
    category: 'ai'
  },
  {
    id: 'telemedicine',
    label: { en: 'Telemedicine Adoption', ar: 'اعتماد التطبيب عن بُعد' },
    target: '50%',
    current: '32%',
    by: 2025,
    category: 'digital'
  },
  {
    id: 'data-digitization',
    label: { en: 'Health Data Digitization', ar: 'رقمنة البيانات الصحية' },
    target: '100%',
    current: '78%',
    by: 2025,
    category: 'digital'
  },
  {
    id: 'ai-research',
    label: { en: 'AI Research Publications (Annual)', ar: 'منشورات أبحاث الذكاء الاصطناعي (سنوياً)' },
    target: '500+',
    current: '180',
    by: 2030,
    category: 'ai'
  },
  {
    id: 'healthtech-startups',
    label: { en: 'HealthTech Startups', ar: 'الشركات الناشئة في التقنية الصحية' },
    target: '200+',
    current: '85',
    by: 2030,
    category: 'infrastructure'
  },
  {
    id: 'ai-workforce',
    label: { en: 'AI Healthcare Specialists', ar: 'متخصصو الذكاء الاصطناعي الصحي' },
    target: '5,000+',
    current: '1,200',
    by: 2030,
    category: 'workforce'
  }
];

export const budgetAllocations: BudgetAllocation[] = [
  {
    year: 2023,
    amount: '$400M',
    focus: { en: 'Digital Health Infrastructure', ar: 'البنية التحتية للصحة الرقمية' },
    source: 'Federal Budget'
  },
  {
    year: 2024,
    amount: '$500M',
    focus: { en: 'AI Infrastructure & Genomics', ar: 'البنية التحتية للذكاء الاصطناعي والجينوميات' },
    source: 'Federal Budget + G42'
  },
  {
    year: 2025,
    amount: '$750M',
    focus: { en: 'Precision Medicine & AI Diagnostics', ar: 'الطب الدقيق وتشخيص الذكاء الاصطناعي' },
    source: 'Projected'
  },
  {
    year: 2026,
    amount: '$1B+',
    focus: { en: 'Integrated AI Health Ecosystem', ar: 'منظومة صحة ذكاء اصطناعي متكاملة' },
    source: 'Projected'
  }
];

export const strategicPillars: StrategicPillar[] = [
  {
    id: 'digital-first',
    title: { en: 'Digital-First Healthcare', ar: 'الرعاية الصحية الرقمية أولاً' },
    description: { 
      en: 'All health records accessible digitally through unified platforms like NABIDH', 
      ar: 'جميع السجلات الصحية متاحة رقمياً من خلال منصات موحدة مثل نابض' 
    },
    icon: 'monitor'
  },
  {
    id: 'ai-integration',
    title: { en: 'AI Integration', ar: 'تكامل الذكاء الاصطناعي' },
    description: { 
      en: 'AI-assisted diagnostics and treatment recommendations in all major hospitals', 
      ar: 'التشخيص والتوصيات العلاجية بمساعدة الذكاء الاصطناعي في جميع المستشفيات الكبرى' 
    },
    icon: 'brain'
  },
  {
    id: 'genomics',
    title: { en: 'Genomics & Precision Medicine', ar: 'الجينوميات والطب الدقيق' },
    description: { 
      en: 'National genome program targeting 1M+ sequences for personalized treatments', 
      ar: 'برنامج جينوم وطني يستهدف مليون+ تسلسل للعلاجات الشخصية' 
    },
    icon: 'dna'
  },
  {
    id: 'talent',
    title: { en: 'Talent Development', ar: 'تطوير المواهب' },
    description: { 
      en: 'Building local AI healthcare expertise through MBZUAI and specialized programs', 
      ar: 'بناء خبرات محلية في الذكاء الاصطناعي الصحي من خلال MBZUAI وبرامج متخصصة' 
    },
    icon: 'users'
  }
];

// Quick stats for sidebar
export const visionStats = {
  totalInvestment: { 
    amount: '$3B+', 
    label: { en: 'Total Healthcare AI Investment (2020-2025)', ar: 'إجمالي استثمار الذكاء الاصطناعي الصحي (2020-2025)' }
  },
  keyPartners: [
    'G42 Healthcare',
    'MBZUAI',
    'Cleveland Clinic Abu Dhabi',
    'DoH Abu Dhabi',
    'MOHAP'
  ],
  keyPrograms: [
    { name: 'Hub71', type: 'Accelerator' },
    { name: 'DIFC Innovation Hub', type: 'Accelerator' },
    { name: 'UAE Genome Program', type: 'Research' },
    { name: 'NABIDH', type: 'Infrastructure' }
  ]
};
