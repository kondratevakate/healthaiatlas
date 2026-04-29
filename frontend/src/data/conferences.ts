import { Conference } from '@/types';

export const conferences: Conference[] = [
  {
    id: 'gitex-global-2026',
    name: {
      en: 'GITEX Global 2026',
      ar: 'جايتكس جلوبال 2026'
    },
    date: '2026-12-07',
    endDate: '2026-12-11',
    location: 'Dubai World Trade Centre, UAE',
    type: 'conference',
    topics: ['diagnostics', 'telemedicine', 'health-records'],
    website: 'https://www.gitex.com',
    description: {
      en: 'Health technology track at the largest tech event in the Middle East',
      ar: 'مسار التكنولوجيا الصحية في أكبر حدث تقني في الشرق الأوسط'
    }
  },
  {
    id: 'ai-medicine-summit-2026',
    name: {
      en: 'AI in Medicine Summit UAE 2026',
      ar: 'قمة الذكاء الاصطناعي في الطب 2026'
    },
    date: '2026-05-18',
    location: 'Abu Dhabi, UAE',
    type: 'conference',
    topics: ['diagnostics', 'drug-discovery', 'genomics'],
    description: {
      en: 'Focused summit on AI applications in clinical medicine',
      ar: 'قمة مركزة على تطبيقات الذكاء الاصطناعي في الطب السريري'
    }
  },
  {
    id: 'digital-health-workshop-2026',
    name: {
      en: 'Digital Health Implementation Workshop',
      ar: 'ورشة تطبيق الصحة الرقمية'
    },
    date: '2026-06-10',
    location: 'Dubai Healthcare City',
    type: 'workshop',
    topics: ['health-records', 'telemedicine'],
    description: {
      en: 'Hands-on workshop for healthcare providers implementing digital solutions',
      ar: 'ورشة عملية لمقدمي الرعاية الصحية لتنفيذ الحلول الرقمية'
    }
  },
  {
    id: 'hub71-demo-day-2026',
    name: {
      en: 'Hub71 HealthTech Demo Day 2026',
      ar: 'يوم عروض Hub71 للتكنولوجيا الصحية 2026'
    },
    date: '2026-09-25',
    location: 'Hub71, Abu Dhabi',
    type: 'demo-day',
    topics: ['diagnostics', 'telemedicine', 'patient-monitoring'],
    description: {
      en: 'Startups pitch to investors and healthcare partners',
      ar: 'عروض الشركات الناشئة للمستثمرين وشركاء الرعاية الصحية'
    }
  }
];
