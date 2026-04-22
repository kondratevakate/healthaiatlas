export type ResourceCategory = 'infographic' | 'caseStudy' | 'report';
export type ResourceTag = 'ai' | 'telemedicine' | 'diagnostics' | 'patientCare' | 'robotics' | 'dataAnalytics';

export interface Resource {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  category: ResourceCategory;
  tags: ResourceTag[];
  thumbnail: string;
  pdfUrl?: string;
  date: string;
  views: number;
  featured: boolean;
  keyFindings?: {
    en: string[];
    ar: string[];
  };
}

export const resources: Resource[] = [
  {
    id: '1',
    title: {
      en: 'AI in Radiology: UAE Hospitals Leading the Way',
      ar: 'الذكاء الاصطناعي في الأشعة: مستشفيات الإمارات تقود الطريق',
    },
    description: {
      en: 'An infographic showcasing how UAE hospitals are implementing AI-powered radiology solutions to improve diagnostic accuracy and reduce wait times.',
      ar: 'إنفوجرافيك يوضح كيف تطبق مستشفيات الإمارات حلول الأشعة المدعومة بالذكاء الاصطناعي لتحسين دقة التشخيص وتقليل أوقات الانتظار.',
    },
    category: 'infographic',
    tags: ['ai', 'diagnostics'],
    thumbnail: '/placeholder.svg',
    date: '2024-01-15',
    views: 1250,
    featured: true,
    keyFindings: {
      en: [
        '45% reduction in diagnostic time',
        '92% accuracy in detecting abnormalities',
        '15 major hospitals implemented AI radiology',
      ],
      ar: [
        'تقليل وقت التشخيص بنسبة 45%',
        'دقة 92% في اكتشاف الشذوذات',
        '15 مستشفى رئيسي طبق الأشعة بالذكاء الاصطناعي',
      ],
    },
  },
  {
    id: '2',
    title: {
      en: 'Cleveland Clinic Abu Dhabi: Robotic Surgery Implementation',
      ar: 'كليفلاند كلينك أبوظبي: تطبيق الجراحة الروبوتية',
    },
    description: {
      en: 'A detailed case study on how Cleveland Clinic Abu Dhabi successfully integrated robotic surgery systems, improving patient outcomes.',
      ar: 'دراسة حالة مفصلة حول كيفية نجاح كليفلاند كلينك أبوظبي في دمج أنظمة الجراحة الروبوتية وتحسين نتائج المرضى.',
    },
    category: 'caseStudy',
    tags: ['robotics', 'patientCare'],
    thumbnail: '/placeholder.svg',
    date: '2024-01-10',
    views: 890,
    featured: true,
    keyFindings: {
      en: [
        '30% faster recovery time for patients',
        '500+ successful robotic procedures',
        'Reduced hospital stay by 2 days on average',
      ],
      ar: [
        'وقت تعافي أسرع بنسبة 30% للمرضى',
        'أكثر من 500 إجراء روبوتي ناجح',
        'تقليل مدة الإقامة في المستشفى بمتوسط يومين',
      ],
    },
  },
  {
    id: '3',
    title: {
      en: 'Telemedicine Adoption in UAE: 2024 Overview',
      ar: 'اعتماد الطب عن بعد في الإمارات: نظرة عامة 2024',
    },
    description: {
      en: 'Visual breakdown of telemedicine growth across UAE emirates, patient satisfaction rates, and technology adoption trends.',
      ar: 'تحليل بصري لنمو الطب عن بعد عبر إمارات الدولة ومعدلات رضا المرضى واتجاهات اعتماد التكنولوجيا.',
    },
    category: 'infographic',
    tags: ['telemedicine', 'patientCare', 'dataAnalytics'],
    thumbnail: '/placeholder.svg',
    date: '2024-01-05',
    views: 2100,
    featured: false,
    keyFindings: {
      en: [
        '3.2 million telemedicine consultations in 2023',
        '87% patient satisfaction rate',
        'Dubai leads with 45% of total consultations',
      ],
      ar: [
        '3.2 مليون استشارة طب عن بعد في 2023',
        'معدل رضا المرضى 87%',
        'دبي تتصدر بـ 45% من إجمالي الاستشارات',
      ],
    },
  },
  {
    id: '4',
    title: {
      en: 'SEHA: AI-Powered Patient Flow Management',
      ar: 'صحة: إدارة تدفق المرضى بالذكاء الاصطناعي',
    },
    description: {
      en: 'How SEHA healthcare network implemented AI to optimize patient flow, reduce waiting times, and improve resource allocation.',
      ar: 'كيف نفذت شبكة صحة للرعاية الصحية الذكاء الاصطناعي لتحسين تدفق المرضى وتقليل أوقات الانتظار وتحسين تخصيص الموارد.',
    },
    category: 'caseStudy',
    tags: ['ai', 'patientCare', 'dataAnalytics'],
    thumbnail: '/placeholder.svg',
    date: '2023-12-20',
    views: 750,
    featured: false,
  },
  {
    id: '5',
    title: {
      en: 'The Future of Healthcare: UAE Vision 2030',
      ar: 'مستقبل الرعاية الصحية: رؤية الإمارات 2030',
    },
    description: {
      en: 'Infographic mapping UAE healthcare transformation roadmap, investment areas, and expected outcomes by 2030.',
      ar: 'إنفوجرافيك يرسم خارطة طريق تحول الرعاية الصحية في الإمارات ومجالات الاستثمار والنتائج المتوقعة بحلول 2030.',
    },
    category: 'infographic',
    tags: ['ai', 'telemedicine', 'robotics', 'diagnostics'],
    thumbnail: '/placeholder.svg',
    date: '2023-12-15',
    views: 3200,
    featured: true,
  },
  {
    id: '6',
    title: {
      en: 'Dubai Health Authority: Predictive Analytics Platform',
      ar: 'هيئة الصحة بدبي: منصة التحليلات التنبؤية',
    },
    description: {
      en: 'Case study on DHA predictive analytics implementation for disease outbreak prevention and healthcare resource planning.',
      ar: 'دراسة حالة حول تنفيذ هيئة الصحة بدبي للتحليلات التنبؤية للوقاية من تفشي الأمراض وتخطيط موارد الرعاية الصحية.',
    },
    category: 'caseStudy',
    tags: ['ai', 'dataAnalytics'],
    thumbnail: '/placeholder.svg',
    date: '2023-12-01',
    views: 620,
    featured: false,
  },
];

export const getCategoryLabel = (category: ResourceCategory, language: 'en' | 'ar'): string => {
  const labels: Record<ResourceCategory, { en: string; ar: string }> = {
    infographic: { en: 'Infographic', ar: 'إنفوجرافيك' },
    caseStudy: { en: 'Case Study', ar: 'دراسة حالة' },
    report: { en: 'Report', ar: 'تقرير' },
  };
  return labels[category][language];
};

export const getTagLabel = (tag: ResourceTag, language: 'en' | 'ar'): string => {
  const labels: Record<ResourceTag, { en: string; ar: string }> = {
    ai: { en: 'AI', ar: 'الذكاء الاصطناعي' },
    telemedicine: { en: 'Telemedicine', ar: 'الطب عن بعد' },
    diagnostics: { en: 'Diagnostics', ar: 'التشخيص' },
    patientCare: { en: 'Patient Care', ar: 'رعاية المرضى' },
    robotics: { en: 'Robotics', ar: 'الروبوتات' },
    dataAnalytics: { en: 'Data Analytics', ar: 'تحليل البيانات' },
  };
  return labels[tag][language];
};
