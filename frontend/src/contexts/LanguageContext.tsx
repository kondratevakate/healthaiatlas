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
  'nav.news': { en: 'News', ar: 'أخبار' },
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

  // News / posts feed (E) — dated, already-happened items (never opportunities).
  // Source: Una's curated feed, ingested by scripts/ingest/unaNews.cjs.
  'news.title': { en: 'News', ar: 'أخبار' },
  'news.subtitle': {
    en: 'Dated, already-happened items — model releases, funding rounds, papers, policy steps. Every row links to the source it came from.',
    ar: 'أحداث مؤرّخة وقعت بالفعل — إصدارات نماذج، جولات تمويل، أوراق بحثية، خطوات تنظيمية. كل صف يرتبط بالمصدر الذي أُخذ منه.',
  },
  'news.filter.topic': { en: 'Topic', ar: 'الموضوع' },
  'news.filter.kind': { en: 'Kind', ar: 'النوع' },
  'news.filter.all': { en: 'All', ar: 'الكل' },
  'news.search': { en: 'Search news', ar: 'ابحث في الأخبار' },
  'news.count': { en: 'items', ar: 'عنصر' },
  'news.empty': { en: 'No news items match these filters.', ar: 'لا أخبار مطابقة لهذه المرشحات.' },
  'news.empty.reset': { en: 'Clear filters', ar: 'إزالة المرشحات' },
  'news.updated': { en: 'Updated', ar: 'آخر تحديث' },
  'news.window': { en: 'last 120 days', ar: 'آخر 120 يوماً' },
  'news.read': { en: 'Read at source', ar: 'اقرأ من المصدر' },
  'news.whyMatters': { en: 'Why it matters', ar: 'لماذا يهم' },
  'news.primary': { en: 'Primary source', ar: 'مصدر أساسي' },
  'news.secondary': { en: 'Secondary source', ar: 'مصدر ثانوي' },
  'news.scoutedBy': { en: 'Scouted by Una', ar: 'جمعتها يونا' },
  'news.verified': { en: 'Verified', ar: 'تم التحقق' },
  'news.viewAll': { en: 'View all news', ar: 'عرض كل الأخبار' },

  // Home — "What is happening" block (E): the freshest few news items.
  'news.home.title': { en: 'Latest news', ar: 'آخر الأخبار' },
  'news.home.subtitle': {
    en: 'What just happened in health AI — dated items, each linked to its source.',
    ar: 'ما حدث للتو في الذكاء الاصطناعي الصحي — أحداث مؤرّخة، كل منها مرتبط بمصدره.',
  },

  // News topic vocabulary (controlled list from the Una news schema).
  'news.topic.drug-discovery': { en: 'Drug Discovery', ar: 'اكتشاف الأدوية' },
  'news.topic.diagnostics-imaging': { en: 'Diagnostics & Imaging', ar: 'التشخيص والتصوير' },
  'news.topic.oncology': { en: 'Oncology', ar: 'الأورام' },
  'news.topic.genomics': { en: 'Genomics', ar: 'الجينوميات' },
  'news.topic.health-data-ehr': { en: 'Health Records & EHR', ar: 'السجلات الصحية' },
  'news.topic.telemedicine': { en: 'Telemedicine', ar: 'الطب عن بُعد' },
  'news.topic.trials': { en: 'Clinical Trials', ar: 'التجارب السريرية' },
  'news.topic.policy-regulation': { en: 'Policy & Regulation', ar: 'السياسات والتنظيم' },
  'news.topic.funding': { en: 'Funding', ar: 'التمويل' },
  'news.topic.model-release': { en: 'Model & Product Releases', ar: 'إصدارات النماذج والمنتجات' },
  'news.topic.papers': { en: 'Papers', ar: 'أوراق بحثية' },
  'news.topic.biosecurity': { en: 'Biosecurity', ar: 'الأمن الحيوي' },

  // News kind vocabulary (controlled list from the Una news schema).
  'news.kind.funding': { en: 'Funding', ar: 'تمويل' },
  'news.kind.launch': { en: 'Launch', ar: 'إطلاق' },
  'news.kind.model-release': { en: 'Model release', ar: 'إصدار نموذج' },
  'news.kind.paper': { en: 'Paper', ar: 'ورقة بحثية' },
  'news.kind.policy': { en: 'Policy', ar: 'سياسة' },
  'news.kind.dataset': { en: 'Dataset', ar: 'مجموعة بيانات' },
  'news.kind.acquisition': { en: 'Acquisition', ar: 'استحواذ' },
  'news.kind.partnership': { en: 'Partnership', ar: 'شراكة' },
  'news.kind.regulatory-clearance': { en: 'Regulatory clearance', ar: 'موافقة تنظيمية' },

  // Hero
  'hero.subtitle': {
    en: 'A knowledge bank exploring the ecosystem of AI in healthcare—mapping players, analyzing systems, and understanding the structures shaping the future of medicine.',
    ar: 'بنك معرفي يستكشف منظومة الذكاء الاصطناعي في الرعاية الصحية — رسم خريطة اللاعبين، تحليل الأنظمة، وفهم الهياكل التي تشكل مستقبل الطب.'
  },
  'hero.exploreDirectory': { en: 'Explore Directory', ar: 'استكشف الدليل' },

  // Home — promise-led hero + one block per intent (aisafety.com IA, 2026-11-02).
  // h1 is a promise, not a brand; the sub-line is one plain sentence of scope.
  'home.hero.title': {
    en: 'Find your place in the healthcare-AI ecosystem',
    ar: 'اعثر على مكانك في منظومة الذكاء الاصطناعي الصحي',
  },
  'home.hero.subtitle': {
    en: 'Curated lists of open calls, jobs, events, organisations and market briefings — every record links to the source it came from.',
    ar: 'قوائم مُنتقاة من الدعوات المفتوحة والوظائف والفعاليات والمنظمات وموجزات السوق — كل سجل يرتبط بالمصدر الذي أُخذ منه.',
  },

  // Shared block furniture.
  'home.viewAll': { en: 'View all', ar: 'عرض الكل' },
  'home.updated': { en: 'Updated', ar: 'آخر تحديث' },
  'home.next': { en: 'Next', ar: 'التالي' },
  'home.roles': { en: 'roles', ar: 'وظيفة' },

  // Intent blocks — verb heading + one line of what you actually get.
  'home.block.funding.title': { en: 'Find funding', ar: 'اعثر على تمويل' },
  'home.block.funding.desc': {
    en: 'Grants, fellowships, prizes and accelerators with an open application window — the issuer and the deadline as stated on every row.',
    ar: 'منح وزمالات وجوائز ومسرّعات ذات نافذة تقديم مفتوحة — الجهة المانحة والموعد النهائي كما هو مذكور في كل صف.',
  },
  'home.block.jobs.title': { en: 'Find a job', ar: 'اعثر على وظيفة' },
  'home.block.jobs.desc': {
    en: 'Open roles at companies building health AI — role counts and locations as reported by each company board.',
    ar: 'وظائف مفتوحة لدى شركات تبني الذكاء الاصطناعي الصحي — عدد الوظائف والمواقع كما توردها لوحة كل شركة.',
  },
  'home.block.events.title': { en: 'Attend an event', ar: 'احضر فعالية' },
  'home.block.events.desc': {
    en: 'Conferences, workshops and demo days where the ecosystem meets — dates and venues as published by the organiser.',
    ar: 'مؤتمرات وورش عمل وأيام عروض تلتقي فيها المنظومة — التواريخ والأماكن كما ينشرها المنظّم.',
  },
  'home.block.ecosystem.title': { en: 'Explore the ecosystem', ar: 'استكشف المنظومة' },
  'home.block.ecosystem.desc': {
    en: 'Mapped areas of healthcare AI, from life sciences to biosecurity — each with the organisations and sources behind it.',
    ar: 'مجالات مرسومة في الذكاء الاصطناعي الصحي، من علوم الحياة إلى الأمن الحيوي — لكل منها منظماته ومصادره.',
  },
  'home.block.context.title': { en: 'Read the market context', ar: 'اقرأ سياق السوق' },
  'home.block.context.desc': {
    en: 'Standing briefings built from the Atlas datasets — talent signals, failure cases, and a rotating regional read.',
    ar: 'موجزات دائمة مبنية من بيانات الأطلس — إشارات المواهب، حالات الفشل، وقراءة إقليمية متناوبة.',
  },
  'home.block.news.title': { en: 'Stay informed', ar: 'ابقَ على اطلاع' },
  'home.block.news.desc': {
    en: 'Dated, already-happened items — model releases, funding rounds, papers, policy steps — each linked to the source it came from.',
    ar: 'أحداث مؤرّخة وقعت بالفعل — إصدارات نماذج، جولات تمويل، أوراق بحثية، خطوات تنظيمية — كل منها مرتبط بمصدره.',
  },

  // Closing band — who maintains this, and the one contribution channel.
  'home.maintained': {
    en: 'Maintained by Kate Kondrateva as an independent project. Every record carries the source it came from.',
    ar: 'يصونه مشروع مستقل بإدارة كيت كوندراتيفا. كل سجل يحمل المصدر الذي أُخذ منه.',
  },
  'home.contribute.title': { en: 'Add or correct a record', ar: 'أضف سجلًا أو صحّحه' },
  'home.contribute.desc': {
    en: 'Spotted a gap or a wrong entry? Open an issue — the form asks for the record and its source.',
    ar: 'لاحظت نقصًا أو سجلًا خاطئًا؟ افتح طلبًا — النموذج يطلب السجل ومصدره.',
  },
  'home.contribute.cta': { en: 'Suggest a record', ar: 'اقترح سجلًا' },

  // Una chat intake (roadmap F0) — home page. One idea per screen, no marketing.
  // The reply comes from a Cloudflare Worker; the visitor's text is sent with
  // the request and is never stored or logged by the client.
  'una.title': { en: 'Describe your work', ar: 'صف عملك' },
  'una.desc': {
    en: 'Say what you do, in a few sentences. Una reads it and replies with where you might fit and what to read next.',
    ar: 'اكتب ما تعمل عليه في بضع جمل. تقرأه أونا وترد عليك بأين قد تكون مكانك وما الذي تقرأه بعد ذلك.',
  },
  'una.label': { en: 'What do you work on?', ar: 'على ماذا تعمل؟' },
  'una.placeholder': {
    en: 'I am a clinician working on triage tools in a Dubai hospital…',
    ar: 'أنا طبيب أعمل على أدوات الفرز في مستشفى بدبي…',
  },
  'una.send': { en: 'Send', ar: 'إرسال' },
  'una.sending': { en: 'Reading…', ar: 'جارٍ القراءة…' },
  'una.hint': {
    en: 'Enter sends · Shift+Enter starts a new line',
    ar: 'Enter للإرسال · Shift+Enter لسطر جديد',
  },
  'una.counter': { en: '{n} / 1,500', ar: '{n} / ١٬٥٠٠' },
  'una.overLimit': {
    en: 'You have reached the 1,500-character limit.',
    ar: 'وصلت إلى حد ١٬٥٠٠ حرف.',
  },
  'una.empty': {
    en: 'Write a sentence or two first.',
    ar: 'اكتب جملة أو جملتين أولًا.',
  },
  'una.turn': { en: '{n} of 6 turns used', ar: 'استُخدمت {n} من ٦ جولات' },
  'una.closed': {
    en: 'That is the six turns for this conversation. Reload the page to start a new one.',
    ar: 'هذه هي الجولات الست لهذه المحادثة. أعد تحميل الصفحة لبدء محادثة جديدة.',
  },
  'una.rateLimit': {
    en: 'Too many conversations from this network right now. Try again in {n} minutes.',
    ar: 'محادثات كثيرة من هذه الشبكة الآن. أعد المحاولة بعد {n} دقيقة.',
  },
  'una.rateLimitSeconds': {
    en: 'Too many conversations from this network right now. Try again in {n} seconds.',
    ar: 'محادثات كثيرة من هذه الشبكة الآن. أعد المحاولة بعد {n} ثانية.',
  },
  'una.degraded': {
    en: 'Una is not taking questions right now.',
    ar: 'أونا لا تستقبل أسئلة في الوقت الحالي.',
  },
  'una.degraded.action': { en: 'Write to Kate instead', ar: 'راسل كيت بدلًا من ذلك' },
  'una.error': {
    en: 'That did not go through. Try again in a moment.',
    ar: 'لم تتم العملية. أعد المحاولة بعد قليل.',
  },
  'una.blocked': {
    en: 'This page is not allowed to reach Una.',
    ar: 'هذه الصفحة غير مسموح لها بالوصول إلى أونا.',
  },
  'una.caution': {
    en: 'Not medical advice. Please do not paste personal health data.',
    ar: 'ليس استشارة طبية. يُرجى عدم لصق بيانات صحية شخصية.',
  },
  'una.you': { en: 'You', ar: 'أنت' },
  'una.reply': { en: 'Una', ar: 'أونا' },
  'una.next': { en: 'Read next', ar: 'اقرأ بعد ذلك' },

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
