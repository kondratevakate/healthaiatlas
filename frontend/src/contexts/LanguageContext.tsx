import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation — primary nav follows intent clusters (aisafety.com pattern):
  // Opportunities first (Open Calls = grants/funds/hackathons/etc — main traffic driver),
  // then analytical depth (Domains), then time-bound items (Events),
  // then the founder vertical (Toolkit), then the editorial channel (Atlas Notes).
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.opencalls': { en: 'Open Calls', ar: 'دعوات مفتوحة' },
  'nav.domains': { en: 'Domains', ar: 'المجالات' },
  'nav.events': { en: 'Events', ar: 'الفعاليات' },
  'nav.founders': { en: 'Founder Toolkit', ar: 'أدوات المؤسس' },
  'nav.atlasnotes': { en: 'Atlas Notes', ar: 'مذكرات الأطلس' },
  'nav.jobs': { en: 'Jobs', ar: 'وظائف' },
  'nav.about': { en: 'About', ar: 'حول' },

  // Legacy nav keys — retained while older pages still reference them.
  // Remove once Directory / Discovery / Context routes are fully renamed.
  'nav.directory': { en: 'Directory', ar: 'الدليل' },
  'nav.discovery': { en: 'Discovery', ar: 'اكتشاف' },
  'nav.context': { en: 'Context', ar: 'السياق' },

  // Founder Toolkit — landing "what's inside" index (C).
  'founders.toc.title': { en: "What's inside", ar: 'ما في الداخل' },
  'founders.toc.subtitle': { en: 'Six modules. Read top-to-bottom or jump to the one you need.', ar: 'ستة وحدات. اقرأها بالترتيب أو انتقل إلى ما تحتاجه.' },
  'founders.toc.markets': { en: 'Markets & Regulatory', ar: 'الأسواق والتنظيم' },
  'founders.toc.markets.desc': { en: 'Healthcare spend and the regulator stack per country — UAE / EU / UK / US / CN / CH.', ar: 'الإنفاق الصحي ومنظومة الجهات التنظيمية لكل دولة — الإمارات / الاتحاد الأوروبي / المملكة المتحدة / الولايات المتحدة / الصين / سويسرا.' },
  'founders.toc.architectures': { en: 'SOTA Architectures', ar: 'أحدث البنى' },
  'founders.toc.architectures.desc': { en: 'The five revenue architectures — which are making money in healthcare AI, and which killed their companies.', ar: 'بنى الإيرادات الخمس — أيها يحقق أرباحاً في الذكاء الاصطناعي الصحي، وأيها قضى على شركاتها.' },
  'founders.toc.tech': { en: 'Tech Signals', ar: 'إشارات التقنية' },
  'founders.toc.tech.desc': { en: 'Developer-advocate moves and vendor demand signals. Talent moves lead product pushes by 6–12 months.', ar: 'تحركات مطوري العلاقات وإشارات طلب الموردين. تحركات المواهد تسبق إطلاق المنتجات بـ6–12 شهراً.' },
  'founders.toc.acquihires': { en: 'Acqui-hires', ar: 'الاستحواذ على الفرق' },
  'founders.toc.acquihires.desc': { en: 'Every deal is a confession — the acquirer needed this and could not build it at market speed.', ar: 'كل صفقة اعتراف — المشتري احتاج هذا ولم يستطع بناءه بسرعة السوق.' },
  'founders.toc.deadvalley': { en: 'Dead Valley', ar: 'الوادي الميت' },
  'founders.toc.deadvalley.desc': { en: '$50B+ destroyed — Babylon, Forward, 23andMe, Pear, Cerebral. Four classes of death.', ar: 'أكثر من 50 مليار دولار دُمّرت — بابل، فوروورد، 23andMe، بير، سيريبرال. أربعة أنواع من الموت.' },
  'founders.toc.context': { en: 'Context', ar: 'السياق' },
  'founders.toc.context.desc': { en: 'The reference layer behind every module — definitions, sources, and how the Atlas counts.', ar: 'طبقة المرجع خلف كل وحدة — التعريفات والمصادر وكيف يحسب الأطلس.' },

  // Events page (D) — conferences / workshops / demo days.
  'events.title': { en: 'Events', ar: 'الفعاليات' },
  'events.subtitle': { en: 'Conferences, workshops and demo days where the healthcare-AI ecosystem actually meets. Upcoming first.', ar: 'المؤتمرات وورش العمل وأيام العروض حيث تلتقي منظومة الذكاء الاصطناعي الصحي فعلياً. الأقرب أولاً.' },
  'events.filter.type': { en: 'Type', ar: 'النوع' },
  'events.filter.all': { en: 'All', ar: 'الكل' },
  'events.filter.upcoming': { en: 'Upcoming', ar: 'القادمة' },
  'events.filter.past': { en: 'Past', ar: 'السابقة' },
  'events.search': { en: 'Search events', ar: 'ابحث في الفعاليات' },
  'events.count': { en: 'events', ar: 'فعالية' },
  'events.empty': { en: 'No events match these filters.', ar: 'لا فعاليات مطابقة لهذه المرشحات.' },
  'events.empty.reset': { en: 'Clear filters', ar: 'إزالة المرشحات' },
  'events.sponsors': { en: 'Sponsors', ar: 'الرعاة' },
  'events.sponsors.none': { en: 'Sponsors not yet mapped', ar: 'الرعاة غير محدّدين بعد' },
  'events.register': { en: 'Register', ar: 'التسجيل' },
  'events.website': { en: 'Website', ar: 'الموقع' },

  // Hero
  'hero.subtitle': {
    en: 'A knowledge bank exploring the ecosystem of AI in healthcare—mapping players, analyzing systems, and understanding the structures shaping the future of medicine.',
    ar: 'بنك معرفي يستكشف منظومة الذكاء الاصطناعي في الرعاية الصحية — رسم خريطة اللاعبين، تحليل الأنظمة، وفهم الهياكل التي تشكل مستقبل الطب.'
  },
  'hero.exploreDirectory': { en: 'Explore Directory', ar: 'استكشف الدليل' },

  // Persona Section
  'persona.sectionTitle': { en: 'How can we help you?', ar: 'كيف يمكننا مساعدتك؟' },
  'persona.sectionSubtitle': {
    en: 'Select your role to get personalized guidance, resources, and AI-powered assistance tailored to your needs.',
    ar: 'اختر دورك للحصول على إرشادات مخصصة وموارد ومساعدة مدعومة بالذكاء الاصطناعي مصممة لاحتياجاتك.'
  },

  // Sections
  'section.entryPoints': { en: 'Entry Points', ar: 'نقاط الدخول' },
  'section.featuredPlayers': { en: 'Featured Players', ar: 'اللاعبون المميزون' },

  // Entry Points
  'entry.directory.desc': { en: 'Explore organizations in the AI health ecosystem', ar: 'استكشف المنظمات في منظومة الذكاء الاصطناعي الصحي' },

  // Stats
  'stats.countries': { en: 'Countries', ar: 'الدول' },

  // Player Types
  'type.startup': { en: 'Startup', ar: 'شركة ناشئة' },
  'type.hospital': { en: 'Hospital', ar: 'مستشفى' },
  'type.government': { en: 'Government', ar: 'حكومة' },
  'type.research': { en: 'Research', ar: 'بحث' },
  'type.enterprise': { en: 'Enterprise', ar: 'مؤسسة' },
  'type.accelerator': { en: 'Accelerator', ar: 'مسرعة أعمال' },
  'type.investor': { en: 'Investor', ar: 'مستثمر' },

  // System Roles
  'role.goal': { en: 'Goal', ar: 'هدف' },
  'role.impact': { en: 'Impact', ar: 'تأثير' },
  'role.affordance': { en: 'Affordance', ar: 'إمكانية' },
  'role.feature': { en: 'Feature', ar: 'ميزة' },

  // Actions
  'action.viewAll': { en: 'View All', ar: 'عرض الكل' },
  'action.explore': { en: 'Explore', ar: 'استكشف' },
  'action.back': { en: 'Back to', ar: 'العودة إلى' },

  // About
  'about.mission': { en: 'Our Mission', ar: 'مهمتنا' },
  'about.missionText': {
    en: 'To map and analyze the AI healthcare ecosystem, making complex systems accessible through interactive tools and visualizations.',
    ar: 'رسم خريطة وتحليل منظومة الذكاء الاصطناعي في الرعاية الصحية، وجعل الأنظمة المعقدة متاحة من خلال أدوات وتصورات تفاعلية.'
  },
  'about.methodology': { en: 'Methodology', ar: 'المنهجية' },
  'about.contact': { en: 'Contact Us', ar: 'اتصل بنا' },

  // About — project timeline widget (G): the Atlas's own change log.
  'about.timeline.title': { en: 'Project timeline', ar: 'الجدول الزمني للمشروع' },
  'about.timeline.subtitle': {
    en: 'What changed in the Atlas itself — every row below comes from a commit in the repository.',
    ar: 'ما تغيّر في الأطلس نفسه — كل صف أدناه مأخوذ من التزام في المستودع.',
  },
  'about.timeline.entries': { en: 'entries', ar: 'مدخل' },
  'about.timeline.showAll': { en: 'Show all', ar: 'عرض الكل' },
  'about.timeline.showLess': { en: 'Show less', ar: 'عرض أقل' },
  'about.timeline.commit': { en: 'Commit', ar: 'التزام' },
  'about.timeline.kind.feature': { en: 'Feature', ar: 'ميزة' },
  'about.timeline.kind.data': { en: 'Data', ar: 'بيانات' },
  'about.timeline.kind.design': { en: 'Design', ar: 'تصميم' },
  'about.timeline.kind.fix': { en: 'Fix', ar: 'إصلاح' },
  'about.timeline.kind.infra': { en: 'Infra', ar: 'بنية تحتية' },

  // Footer
  'footer.rights': { en: 'All rights reserved', ar: 'جميع الحقوق محفوظة' },
  'footer.tagline': { en: 'A Knowledge Bank for AI in Healthcare', ar: 'بنك معرفي للذكاء الاصطناعي في الرعاية الصحية' },
  'footer.privacy': { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  'footer.terms': { en: 'Terms of Use', ar: 'شروط الاستخدام' },

  // Header
  'header.subscribe': { en: 'Subscribe', ar: 'اشترك' },

  // Auth Modal
  'auth.signInTo': { en: 'Sign in to', ar: 'تسجيل الدخول إلى' },
  'auth.createAccount': { en: 'Create your account', ar: 'إنشاء حسابك' },
  'auth.name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'auth.namePlaceholder': { en: 'Enter your name', ar: 'أدخل اسمك' },
  'auth.email': { en: 'Email address', ar: 'البريد الإلكتروني' },
  'auth.emailPlaceholder': { en: 'you@example.com', ar: 'you@example.com' },
  'auth.continueWithEmail': { en: 'Continue with Email', ar: 'المتابعة بالبريد الإلكتروني' },
  'auth.continueWithLinkedIn': { en: 'Continue with LinkedIn', ar: 'المتابعة عبر LinkedIn' },
  'auth.continueWithGoogle': { en: 'Continue with Google', ar: 'المتابعة عبر Google' },
  'auth.or': { en: 'or', ar: 'أو' },
  'auth.noAccount': { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  'auth.signUp': { en: 'Sign up', ar: 'إنشاء حساب' },
  'auth.haveAccount': { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  'auth.signIn': { en: 'Sign in', ar: 'تسجيل الدخول' },
  'auth.welcomeBack': { en: 'Welcome back!', ar: 'مرحباً بعودتك!' },
  'auth.signedInSuccessfully': { en: 'You have signed in successfully.', ar: 'تم تسجيل دخولك بنجاح.' },
  'auth.welcome': { en: 'Welcome!', ar: 'مرحباً!' },
  'auth.accountCreated': { en: 'Your account has been created.', ar: 'تم إنشاء حسابك.' },
  'auth.signedInWith': { en: 'Signed in with', ar: 'تم تسجيل الدخول عبر' },

  // Subscribe Section
  'subscribe.title': { en: 'Get weekly insights on AI healthcare in the UAE', ar: 'احصل على رؤى أسبوعية حول الذكاء الاصطناعي في الرعاية الصحية بالإمارات' },
  'subscribe.emailPlaceholder': { en: 'Enter your email', ar: 'أدخل بريدك الإلكتروني' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
