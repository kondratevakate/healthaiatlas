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
        label: { en: 'Job seeker', ar: 'باحث عن عمل' },
        riskWeight: 1,
        affectsBottlenecks: ['visa', 'network']
      },
      {
        value: 'business',
        label: { en: 'Business (talent search / partnerships)', ar: 'أعمال (البحث عن المواهب / الشراكات)' },
        riskWeight: 2,
        affectsBottlenecks: ['licensing', 'compliance']
      },
      {
        value: 'student',
        label: { en: 'Student / Researcher', ar: 'طالب / باحث' },
        riskWeight: 1,
        affectsBottlenecks: ['network', 'lab-affiliation']
      }
    ]
  },
  {
    id: 'q2-entity',
    question: {
      en: 'Do you have a local entity or partner in your target market?',
      ar: 'هل لديك كيان أو شريك محلي في السوق المستهدف؟'
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
      en: 'Do you have existing connections in healthcare?',
      ar: 'هل لديك علاقات قائمة في قطاع الرعاية الصحية؟'
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
    en: 'Data residency → requires local infrastructure for health data',
    ar: 'إقامة البيانات → تتطلب بنية تحتية محلية للبيانات الصحية'
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
    en: 'Licensing complexity → multiple authorities depending on jurisdiction',
    ar: 'تعقيد الترخيص → سلطات متعددة حسب الاختصاص'
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
  'lab-affiliation': {
    en: 'Lab / advisor affiliation → access to data, supervisors, and grant programs',
    ar: 'الانتماء للمختبر / المشرف → الوصول إلى البيانات والمشرفين وبرامج المنح'
  }
};

// Best next step recommendations by role and risk level
export const nextStepRecommendations: Record<string, Record<string, { en: string; ar: string }>> = {
  founder: {
    low: {
      en: 'Leverage your established presence. Focus on expanding network through industry conferences and accelerator demo days.',
      ar: 'استفد من وجودك المؤسس. ركز على توسيع الشبكة من خلال المؤتمرات الصناعية وأيام عروض المسرّعات.'
    },
    medium: {
      en: 'Apply to a healthcare-focused accelerator program for entity setup, mentorship, and warm intros. Build 2-3 reference cases before approaching hospital systems.',
      ar: 'تقدم لبرنامج مسرّعة متخصص في الرعاية الصحية لإعداد الكيان والإرشاد والمقدمات الدافئة. ابنِ 2-3 حالات مرجعية قبل التواصل مع أنظمة المستشفيات.'
    },
    high: {
      en: 'Start with an accelerator program for entity setup, network, and credibility. Expect 12-18 months to first hospital pilot in any major market.',
      ar: 'ابدأ ببرنامج مسرّعة لإعداد الكيان والشبكة والمصداقية. توقع 12-18 شهراً للتجربة الأولى في المستشفى في أي سوق رئيسي.'
    }
  },
  jobseeker: {
    low: {
      en: 'Your network is your strength. Attend key healthcare AI conferences and use LinkedIn for warm intros to target companies.',
      ar: 'شبكتك هي قوتك. احضر مؤتمرات الذكاء الاصطناعي الصحي الرئيسية واستخدم LinkedIn للمقدمات الدافئة للشركات المستهدفة.'
    },
    medium: {
      en: 'Research visa sponsorship options in your target markets. Target healthcare AI companies with open roles and a track record of sponsoring.',
      ar: 'ابحث عن خيارات كفالة التأشيرة في الأسواق المستهدفة. استهدف شركات الذكاء الاصطناعي الصحي ذات الوظائف الشاغرة وسجل في كفالة المرشحين.'
    },
    high: {
      en: 'Build an online presence first. Contribute to healthcare AI discussions on LinkedIn / X. Consider remote roles as a stepping stone before relocation.',
      ar: 'ابنِ حضوراً إلكترونياً أولاً. ساهم في نقاشات الذكاء الاصطناعي الصحي على LinkedIn / X. فكر في الأدوار عن بُعد كنقطة انطلاق قبل الانتقال.'
    }
  },
  business: {
    low: {
      en: 'Focus on the regulatory pathway. Engage directly with the relevant authority in each target market for medical device classification. Timeline: 3-6 months for standard licensing.',
      ar: 'ركز على المسار التنظيمي. تواصل مباشرة مع السلطة المعنية في كل سوق مستهدف لتصنيف الأجهزة الطبية. الجدول الزمني: 3-6 أشهر للترخيص القياسي.'
    },
    medium: {
      en: 'Consider a free-zone or innovation-hub setup for simpler licensing. Engage a regulatory consultant for medical AI classification clarity.',
      ar: 'فكر في الإعداد ضمن منطقة حرة أو مركز ابتكار لترخيص أبسط. تعامل مع مستشار تنظيمي لوضوح تصنيف الذكاء الاصطناعي الطبي.'
    },
    high: {
      en: 'Start with market research and local partner identification. The regulatory pathway depends heavily on product classification. Budget 6-12 months.',
      ar: 'ابدأ بأبحاث السوق وتحديد الشريك المحلي. المسار التنظيمي يعتمد بشكل كبير على تصنيف المنتج. ميزانية 6-12 شهراً.'
    }
  },
  student: {
    low: {
      en: 'You have a lab and a clear research line — focus on output. Co-author with clinicians, target peer-reviewed venues, and curate a public reading list to build a citable presence.',
      ar: 'لديك مختبر وخط بحثي واضح — ركز على الإنتاج. شارك في تأليف الأبحاث مع الأطباء، استهدف المؤتمرات المحكّمة، ونسّق قائمة قراءة عامة لبناء حضور قابل للاستشهاد.'
    },
    medium: {
      en: 'Identify two or three labs whose work overlaps with yours and reach out to PIs with a specific question, not a generic CV. Look for postdoc / collaboration calls in healthcare-AI grant programs.',
      ar: 'حدد مختبرين أو ثلاثة يتقاطع عملها مع عملك وتواصل مع الباحثين الرئيسيين بسؤال محدد، لا بسيرة ذاتية عامة. ابحث عن دعوات ما بعد الدكتوراه / التعاون في برامج منح الذكاء الاصطناعي الصحي.'
    },
    high: {
      en: 'Start by anchoring an advisor or lab affiliation — that unlocks data access and grant eligibility. Audit a healthcare-AI MOOC, write one strong literature review on a niche topic, and use that as your calling card.',
      ar: 'ابدأ بترسيخ ارتباط بمشرف أو مختبر — فهذا يفتح الوصول إلى البيانات وأهلية المنح. احضر دورة مفتوحة في الذكاء الاصطناعي الصحي، اكتب مراجعة أدبية قوية في موضوع متخصص، واستخدمها كبطاقة تعريف.'
    }
  }
};
