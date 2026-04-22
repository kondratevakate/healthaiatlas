// Quick Reality Test Questions
// 5 questions to assess risk and determine best path

import { TestQuestion } from '@/types/research';

export const testQuestions: TestQuestion[] = [
  {
    id: 'q1-role',
    question: {
      en: 'What best describes you?',
      ar: 'ما الذي يصفك بشكل أفضل؟'
    },
    options: [
      {
        value: 'founder',
        label: { en: 'Founder (AI startup)', ar: 'مؤسس (شركة ذكاء اصطناعي ناشئة)' },
        riskWeight: 2,
        affectsBottlenecks: ['entity', 'pilot-access']
      },
      {
        value: 'jobseeker',
        label: { en: 'Student / Job seeker', ar: 'طالب / باحث عن عمل' },
        riskWeight: 1,
        affectsBottlenecks: ['visa', 'network']
      },
      {
        value: 'business',
        label: { en: 'Business (licensing / market entry)', ar: 'أعمال (ترخيص / دخول السوق)' },
        riskWeight: 2,
        affectsBottlenecks: ['licensing', 'compliance']
      },
      {
        value: 'clinician',
        label: { en: 'Clinician', ar: 'طبيب / ممارس صحي' },
        riskWeight: 1,
        affectsBottlenecks: ['licensing', 'ai-usage']
      }
    ]
  },
  {
    id: 'q2-entity',
    question: {
      en: 'Do you have a local UAE entity or partner?',
      ar: 'هل لديك كيان أو شريك محلي في الإمارات؟'
    },
    options: [
      {
        value: 'established',
        label: { en: 'Yes, established', ar: 'نعم، مؤسس' },
        riskWeight: 0
      },
      {
        value: 'in-process',
        label: { en: 'In process', ar: 'قيد الإنشاء' },
        riskWeight: 1,
        affectsBottlenecks: ['entity-setup']
      },
      {
        value: 'planning',
        label: { en: 'No, planning to set up', ar: 'لا، أخطط للإنشاء' },
        riskWeight: 2,
        affectsBottlenecks: ['entity', 'pilot-access']
      },
      {
        value: 'remote',
        label: { en: 'No, prefer remote', ar: 'لا، أفضل العمل عن بُعد' },
        riskWeight: 3,
        affectsBottlenecks: ['entity', 'pilot-access', 'data-residency']
      }
    ]
  },
  {
    id: 'q3-network',
    question: {
      en: 'Do you have existing connections in UAE healthcare?',
      ar: 'هل لديك علاقات قائمة في قطاع الرعاية الصحية الإماراتي؟'
    },
    options: [
      {
        value: 'strong',
        label: { en: 'Yes, strong network', ar: 'نعم، شبكة قوية' },
        riskWeight: 0
      },
      {
        value: 'some',
        label: { en: 'Some contacts', ar: 'بعض جهات الاتصال' },
        riskWeight: 1
      },
      {
        value: 'accelerator',
        label: { en: 'Through accelerator/program', ar: 'من خلال مسرّعة / برنامج' },
        riskWeight: 1
      },
      {
        value: 'none',
        label: { en: 'No connections yet', ar: 'لا توجد علاقات بعد' },
        riskWeight: 3,
        affectsBottlenecks: ['cold-outreach', 'intros']
      }
    ]
  },
  {
    id: 'q4-product',
    question: {
      en: 'What stage is your product/service?',
      ar: 'في أي مرحلة منتجك/خدمتك؟'
    },
    options: [
      {
        value: 'deployed',
        label: { en: 'Deployed with customers', ar: 'منشور مع عملاء' },
        riskWeight: 0
      },
      {
        value: 'pilot',
        label: { en: 'In pilot/testing', ar: 'في مرحلة التجربة' },
        riskWeight: 1
      },
      {
        value: 'mvp',
        label: { en: 'MVP / early prototype', ar: 'نموذج أولي' },
        riskWeight: 2,
        affectsBottlenecks: ['traction', 'references']
      },
      {
        value: 'idea',
        label: { en: 'Idea / pre-product', ar: 'فكرة / ما قبل المنتج' },
        riskWeight: 3,
        affectsBottlenecks: ['traction', 'references', 'pilot-access']
      }
    ]
  },
  {
    id: 'q5-timeline',
    question: {
      en: 'What is your expected timeline?',
      ar: 'ما هو الجدول الزمني المتوقع؟'
    },
    options: [
      {
        value: 'flexible',
        label: { en: '12+ months, flexible', ar: '12+ شهر، مرن' },
        riskWeight: 0
      },
      {
        value: 'medium',
        label: { en: '6-12 months', ar: '6-12 شهر' },
        riskWeight: 1
      },
      {
        value: 'short',
        label: { en: '3-6 months', ar: '3-6 أشهر' },
        riskWeight: 2,
        affectsBottlenecks: ['decision-cycles']
      },
      {
        value: 'urgent',
        label: { en: 'Under 3 months', ar: 'أقل من 3 أشهر' },
        riskWeight: 3,
        affectsBottlenecks: ['decision-cycles', 'licensing']
      }
    ]
  }
];

// Bottleneck descriptions
export const bottleneckDescriptions: Record<string, { en: string; ar: string }> = {
  'entity': {
    en: 'No local entity → pilot access blocked for most hospitals',
    ar: 'لا يوجد كيان محلي → الوصول للتجارب محظور في معظم المستشفيات'
  },
  'entity-setup': {
    en: 'Entity setup in progress → limited ability to sign contracts',
    ar: 'إعداد الكيان جارٍ → قدرة محدودة على توقيع العقود'
  },
  'pilot-access': {
    en: 'Pilot access requires local presence and references',
    ar: 'الوصول للتجارب يتطلب وجود محلي ومراجع'
  },
  'data-residency': {
    en: 'Data residency → requires UAE infrastructure for health data',
    ar: 'إقامة البيانات → تتطلب بنية تحتية إماراتية للبيانات الصحية'
  },
  'cold-outreach': {
    en: 'Cold outreach → <2% response rate for decision-makers',
    ar: 'التواصل البارد → معدل استجابة أقل من 2% لصانعي القرار'
  },
  'intros': {
    en: 'Warm intros preferred → accelerators/programs provide network',
    ar: 'المقدمات الدافئة مفضلة → المسرّعات/البرامج توفر الشبكة'
  },
  'decision-cycles': {
    en: 'Long decision cycles → 6-18 months typical for hospital pilots',
    ar: 'دورات قرار طويلة → 6-18 شهر نموذجي لتجارب المستشفيات'
  },
  'traction': {
    en: 'Traction required → most programs need proof of customer usage',
    ar: 'الجذب مطلوب → معظم البرامج تحتاج إثبات استخدام العملاء'
  },
  'references': {
    en: 'References needed → 2+ regional references typically required',
    ar: 'المراجع مطلوبة → عادة ما تكون 2+ مراجع إقليمية مطلوبة'
  },
  'licensing': {
    en: 'Licensing complexity → multiple authorities depending on emirate',
    ar: 'تعقيد الترخيص → سلطات متعددة حسب الإمارة'
  },
  'compliance': {
    en: 'Compliance requirements → health data regulations evolving',
    ar: 'متطلبات الامتثال → لوائح البيانات الصحية في تطور'
  },
  'visa': {
    en: 'Visa/residency → employment visa typically requires sponsor',
    ar: 'التأشيرة/الإقامة → تأشيرة العمل تتطلب عادة كفيل'
  },
  'network': {
    en: 'Network building → relationships critical for opportunities',
    ar: 'بناء الشبكة → العلاقات حاسمة للفرص'
  },
  'ai-usage': {
    en: 'AI usage policies → hospital policies on AI tools vary',
    ar: 'سياسات استخدام الذكاء الاصطناعي → سياسات المستشفيات تتباين'
  }
};

// Best next step recommendations by role and risk level
export const nextStepRecommendations: Record<string, Record<string, { en: string; ar: string }>> = {
  founder: {
    low: {
      en: 'Leverage your established presence. Focus on expanding network through industry events and accelerator demo days.',
      ar: 'استفد من وجودك المؤسس. ركز على توسيع الشبكة من خلال فعاليات الصناعة وأيام عروض المسرّعات.'
    },
    medium: {
      en: 'Apply to Hub71 or DIFC Innovation Hub for free zone setup + intros. Build 2-3 reference cases before approaching hospitals.',
      ar: 'تقدم لـ Hub71 أو DIFC Innovation Hub لإعداد المنطقة الحرة + المقدمات. ابنِ 2-3 حالات مرجعية قبل التواصل مع المستشفيات.'
    },
    high: {
      en: 'Start with accelerator program (Hub71, Flat6Labs) for entity setup, network, and credibility. Expect 12-18 months to first hospital pilot.',
      ar: 'ابدأ ببرنامج مسرّعة (Hub71، Flat6Labs) لإعداد الكيان والشبكة والمصداقية. توقع 12-18 شهراً للتجربة الأولى في المستشفى.'
    }
  },
  jobseeker: {
    low: {
      en: 'Your network is your strength. Attend key events like Arab Health, leverage LinkedIn for warm intros to target companies.',
      ar: 'شبكتك هي قوتك. احضر الفعاليات الرئيسية مثل Arab Health، استفد من LinkedIn للمقدمات الدافئة للشركات المستهدفة.'
    },
    medium: {
      en: 'Research visa sponsorship options. Many startups in Hub71/DIFC can sponsor. Target healthcare AI companies with open roles.',
      ar: 'ابحث عن خيارات كفالة التأشيرة. العديد من الشركات الناشئة في Hub71/DIFC يمكنها الكفالة. استهدف شركات الذكاء الاصطناعي الصحي ذات الوظائف الشاغرة.'
    },
    high: {
      en: 'Build online presence first. Contribute to healthcare AI discussions. Consider remote roles with UAE companies as stepping stone.',
      ar: 'ابنِ الحضور الإلكتروني أولاً. ساهم في نقاشات الذكاء الاصطناعي الصحي. فكر في الأدوار عن بُعد مع شركات إماراتية كنقطة انطلاق.'
    }
  },
  business: {
    low: {
      en: 'Focus on regulatory pathway. Engage directly with DHA/MOHAP for medical device classification. Timeline: 3-6 months for standard licensing.',
      ar: 'ركز على المسار التنظيمي. تواصل مباشرة مع DHA/MOHAP لتصنيف الأجهزة الطبية. الجدول الزمني: 3-6 أشهر للترخيص القياسي.'
    },
    medium: {
      en: 'Consider free zone setup (DHCC, ADGM) for simpler licensing. Engage regulatory consultant for medical AI classification clarity.',
      ar: 'فكر في إعداد المنطقة الحرة (DHCC، ADGM) لترخيص أبسط. تعامل مع مستشار تنظيمي لوضوح تصنيف الذكاء الاصطناعي الطبي.'
    },
    high: {
      en: 'Start with market research and local partner identification. Regulatory pathway depends heavily on product classification. Budget 6-12 months.',
      ar: 'ابدأ بأبحاث السوق وتحديد الشريك المحلي. المسار التنظيمي يعتمد بشكل كبير على تصنيف المنتج. ميزانية 6-12 شهراً.'
    }
  },
  clinician: {
    low: {
      en: 'Stay informed on hospital AI policies. Engage with innovation departments. Your clinical perspective is valuable for AI companies.',
      ar: 'ابقَ مطلعاً على سياسات الذكاء الاصطناعي في المستشفيات. تواصل مع أقسام الابتكار. منظورك السريري قيّم لشركات الذكاء الاصطناعي.'
    },
    medium: {
      en: 'Document AI tool usage policies at your institution. Connect with clinical innovation leads. Consider advisory roles with healthtech startups.',
      ar: 'وثّق سياسات استخدام أدوات الذكاء الاصطناعي في مؤسستك. تواصل مع قادة الابتكار السريري. فكر في أدوار استشارية مع شركات التكنولوجيا الصحية الناشئة.'
    },
    high: {
      en: 'Familiarize with UAE healthcare AI regulations. Build relationships with innovation teams. Document clear use cases for AI tools in your practice.',
      ar: 'تعرف على لوائح الذكاء الاصطناعي الصحي الإماراتية. ابنِ علاقات مع فرق الابتكار. وثّق حالات استخدام واضحة لأدوات الذكاء الاصطناعي في ممارستك.'
    }
  }
};
