import { Conference } from '@/types';

export const conferences: Conference[] = [
  {
    id: 'whx-dubai-2026',
    name: {
      en: 'WHX Dubai 2026 (formerly Arab Health)',
      ar: 'WHX دبي 2026 (سابقاً الصحة العربية)'
    },
    date: '2026-02-09',
    endDate: '2026-02-12',
    location: 'Dubai World Trade Centre, UAE',
    type: 'conference',
    topics: ['medical-imaging', 'telemedicine', 'health-records'],
    website: 'https://www.arabhealthonline.com',
    registrationUrl: 'https://www.arabhealthonline.com/register',
    description: {
      en: 'The largest healthcare exhibition and congress in the MENA region',
      ar: 'أكبر معرض ومؤتمر للرعاية الصحية في منطقة الشرق الأوسط وشمال أفريقيا'
    }
  },
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
    id: 'health-founders-meetup-2026',
    name: {
      en: 'HealthTech Founders Meetup',
      ar: 'لقاء مؤسسي التكنولوجيا الصحية'
    },
    date: '2026-04-15',
    location: 'Hub71, Abu Dhabi',
    type: 'meetup',
    topics: ['telemedicine', 'patient-monitoring'],
    description: {
      en: 'Monthly networking event for health-tech startup founders',
      ar: 'حدث تواصل شهري لمؤسسي الشركات الناشئة في التكنولوجيا الصحية'
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
