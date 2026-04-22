// Red Flags Library
// Common patterns of intermediary scams and misleading promises

import { RedFlag } from '@/types/research';

export const redFlags: RedFlag[] = [
  {
    id: 'rf-1',
    title: {
      en: '"Guaranteed Government Contracts"',
      ar: '"عقود حكومية مضمونة"'
    },
    pattern: {
      en: 'Intermediary promises direct access to government procurement without RFP process.',
      ar: 'الوسيط يعد بالوصول المباشر للمشتريات الحكومية دون عملية طلب تقديم العروض.'
    },
    reality: {
      en: 'UAE government procurement follows public tender processes (Tejari, Abu Dhabi DoF portal, etc.). No intermediary can bypass this for contracts above threshold. Sole-source contracts require specific justification and approval.',
      ar: 'المشتريات الحكومية الإماراتية تتبع عمليات المناقصات العامة (تيجاري، بوابة دائرة المالية أبوظبي، إلخ). لا يمكن لأي وسيط تجاوز هذا للعقود فوق الحد. العقود من مصدر واحد تتطلب تبريراً وموافقة محددة.'
    },
    howToVerify: [
      { en: 'Ask for specific RFP/tender reference numbers', ar: 'اطلب أرقام مرجعية محددة لطلب تقديم العروض/المناقصة' },
      { en: 'Check official procurement portals for open tenders', ar: 'تحقق من بوابات المشتريات الرسمية للمناقصات المفتوحة' },
      { en: 'Request written confirmation from the government entity itself', ar: 'اطلب تأكيداً كتابياً من الجهة الحكومية نفسها' },
      { en: 'Verify the intermediary\'s track record with named references', ar: 'تحقق من سجل الوسيط مع مراجع مسماة' }
    ],
    evidenceLevel: 'official',
    sources: ['procurement.gov.ae', 'tejari.com', 'Abu Dhabi DoF procurement portal'],
    category: 'intermediary'
  },
  {
    id: 'rf-2',
    title: {
      en: '"I Know the Decision-Maker Personally"',
      ar: '"أعرف صانع القرار شخصياً"'
    },
    pattern: {
      en: 'Intermediary claims personal relationship with C-level executives or government officials, suggesting they can fast-track decisions.',
      ar: 'الوسيط يدعي علاقة شخصية مع المديرين التنفيذيين أو المسؤولين الحكوميين، مقترحاً أنه يستطيع تسريع القرارات.'
    },
    reality: {
      en: 'While relationships matter in UAE business culture, formal procurement and partnership processes still apply. Personal connections may secure a meeting, but cannot bypass due diligence, committee approvals, or regulatory requirements.',
      ar: 'بينما العلاقات مهمة في ثقافة الأعمال الإماراتية، عمليات المشتريات والشراكة الرسمية لا تزال سارية. العلاقات الشخصية قد تؤمن اجتماعاً، لكن لا يمكنها تجاوز العناية الواجبة أو موافقات اللجان أو المتطلبات التنظيمية.'
    },
    howToVerify: [
      { en: 'Ask for a brief intro call/email that you can see', ar: 'اطلب مكالمة/بريد تعريفي قصير يمكنك رؤيته' },
      { en: 'Verify the claimed relationship independently (LinkedIn, events)', ar: 'تحقق من العلاقة المدعاة بشكل مستقل (LinkedIn، الفعاليات)' },
      { en: 'Ask about the formal process after the introduction', ar: 'اسأل عن العملية الرسمية بعد التقديم' },
      { en: 'Be wary if they promise outcomes, not just introductions', ar: 'كن حذراً إذا وعدوا بنتائج وليس مجرد تقديمات' }
    ],
    evidenceLevel: 'observed',
    category: 'intermediary'
  },
  {
    id: 'rf-3',
    title: {
      en: '"Pay Upfront for Guaranteed Intro"',
      ar: '"ادفع مقدماً لتقديم مضمون"'
    },
    pattern: {
      en: 'Intermediary requests significant upfront payment for introductions or meetings, with success promised regardless of outcome.',
      ar: 'الوسيط يطلب دفعة مقدمة كبيرة للتقديمات أو الاجتماعات، مع وعد بالنجاح بغض النظر عن النتيجة.'
    },
    reality: {
      en: 'Legitimate business development consultants typically work on retainer + success fee, or pure success fee for high-value deals. Large upfront fees with vague deliverables are a red flag. Reputable intermediaries have verifiable track records.',
      ar: 'مستشارو تطوير الأعمال الشرعيون عادة يعملون على أساس حصة + رسوم نجاح، أو رسوم نجاح صرفة للصفقات عالية القيمة. الرسوم المقدمة الكبيرة مع نواتج غامضة هي علامة تحذيرية. الوسطاء ذوو السمعة لديهم سجلات قابلة للتحقق.'
    },
    howToVerify: [
      { en: 'Request references from previous clients (with permission to contact)', ar: 'اطلب مراجع من عملاء سابقين (مع إذن بالتواصل)' },
      { en: 'Ask for a clear scope of work and deliverables', ar: 'اطلب نطاق عمل ونواتج واضحة' },
      { en: 'Propose milestone-based payments tied to specific outcomes', ar: 'اقترح دفعات قائمة على معالم مرتبطة بنتائج محددة' },
      { en: 'Check if they have a registered business in UAE', ar: 'تحقق إذا كان لديهم عمل مسجل في الإمارات' }
    ],
    evidenceLevel: 'observed',
    category: 'intermediary'
  },
  {
    id: 'rf-4',
    title: {
      en: '"No Need for Regulatory Approval"',
      ar: '"لا حاجة للموافقة التنظيمية"'
    },
    pattern: {
      en: 'Partner or consultant suggests your medical AI product can operate without MOHAP/DHA registration or that they can help you "work around" requirements.',
      ar: 'الشريك أو المستشار يقترح أن منتج الذكاء الاصطناعي الطبي الخاص بك يمكن أن يعمل دون تسجيل MOHAP/DHA أو أنهم يستطيعون مساعدتك "للالتفاف" على المتطلبات.'
    },
    reality: {
      en: 'Medical devices (including SaMD - Software as Medical Device) require registration. Classification depends on intended use and risk level. Operating without proper registration exposes you to legal liability and market ban. Grey areas exist, but should be clarified with regulators directly.',
      ar: 'الأجهزة الطبية (بما في ذلك SaMD - البرمجيات كجهاز طبي) تتطلب تسجيلاً. التصنيف يعتمد على الاستخدام المقصود ومستوى المخاطر. العمل دون تسجيل صحيح يعرضك للمسؤولية القانونية وحظر السوق. توجد مناطق رمادية، لكن يجب توضيحها مع المنظمين مباشرة.'
    },
    howToVerify: [
      { en: 'Request official guidance from MOHAP/DHA on your specific product', ar: 'اطلب إرشادات رسمية من MOHAP/DHA حول منتجك المحدد' },
      { en: 'Review published medical device regulations and SaMD guidance', ar: 'راجع لوائح الأجهزة الطبية المنشورة وإرشادات SaMD' },
      { en: 'Consult with regulatory affairs specialist (not the selling party)', ar: 'استشر متخصص شؤون تنظيمية (ليس الطرف البائع)' },
      { en: 'Check if similar products in market are registered', ar: 'تحقق إذا كانت منتجات مماثلة في السوق مسجلة' }
    ],
    evidenceLevel: 'official',
    sources: ['MOHAP Medical Device Registration Guidelines', 'DHA Healthcare Regulation'],
    category: 'legal'
  },
  {
    id: 'rf-5',
    title: {
      en: '"Quick Hospital Pilot in 2-3 Months"',
      ar: '"تجربة مستشفى سريعة في 2-3 أشهر"'
    },
    pattern: {
      en: 'Consultant or partner promises fast hospital pilot deployment, significantly shorter than typical timelines.',
      ar: 'المستشار أو الشريك يعد بنشر تجربة مستشفى سريعة، أقصر بكثير من الجداول الزمنية النموذجية.'
    },
    reality: {
      en: 'Hospital pilot timelines in UAE typically range from 6-18 months from first contact to deployment. This includes: vendor assessment (2-3 months), IT security review (1-2 months), legal/procurement (2-4 months), integration (2-4 months). Exceptions exist for well-connected vendors with existing contracts.',
      ar: 'الجداول الزمنية لتجارب المستشفيات في الإمارات تتراوح عادة من 6-18 شهراً من أول اتصال إلى النشر. يشمل هذا: تقييم البائع (2-3 أشهر)، مراجعة أمن تكنولوجيا المعلومات (1-2 شهر)، القانوني/المشتريات (2-4 أشهر)، التكامل (2-4 أشهر). توجد استثناءات للبائعين المتصلين جيداً مع عقود قائمة.'
    },
    howToVerify: [
      { en: 'Ask for specific examples of 2-3 month pilots they\'ve facilitated', ar: 'اطلب أمثلة محددة لتجارب 2-3 أشهر سهّلوها' },
      { en: 'Request references from the hospital (not just the vendor)', ar: 'اطلب مراجع من المستشفى (ليس فقط البائع)' },
      { en: 'Ask about the specific pathway that enables speed', ar: 'اسأل عن المسار المحدد الذي يمكّن السرعة' },
      { en: 'Understand if this is a "shadow IT" deployment vs. formal pilot', ar: 'افهم إذا كان هذا نشر "IT ظل" مقابل تجربة رسمية' }
    ],
    evidenceLevel: 'observed',
    category: 'promise'
  },
  {
    id: 'rf-6',
    title: {
      en: '"Exclusive Partnership with Major Hospital Group"',
      ar: '"شراكة حصرية مع مجموعة مستشفيات كبرى"'
    },
    pattern: {
      en: 'Intermediary claims exclusive rights or special relationship with major hospital networks (Cleveland Clinic AD, SEHA, Mediclinic, etc.).',
      ar: 'الوسيط يدعي حقوقاً حصرية أو علاقة خاصة مع شبكات المستشفيات الكبرى (كليفلاند كلينك أبوظبي، صحة، ميديكلينك، إلخ).'
    },
    reality: {
      en: 'Major hospital groups have formal vendor management and innovation departments. While they may work with specific consultants, "exclusive" access is rare and typically limited to specific domains or temporary arrangements. Innovation teams are often directly accessible.',
      ar: 'مجموعات المستشفيات الكبرى لديها أقسام إدارة البائعين والابتكار الرسمية. بينما قد يعملون مع مستشارين محددين، الوصول "الحصري" نادر وعادة محدود بمجالات محددة أو ترتيبات مؤقتة. فرق الابتكار غالباً متاحة مباشرة.'
    },
    howToVerify: [
      { en: 'Contact the hospital\'s innovation/vendor management directly', ar: 'تواصل مع إدارة الابتكار/البائعين في المستشفى مباشرة' },
      { en: 'Ask for documentation of the exclusive arrangement', ar: 'اطلب توثيقاً للترتيب الحصري' },
      { en: 'Check LinkedIn for direct contacts at the hospital', ar: 'تحقق من LinkedIn لجهات اتصال مباشرة في المستشفى' },
      { en: 'Attend hospital-organized innovation events to verify claims', ar: 'احضر فعاليات الابتكار التي ينظمها المستشفى للتحقق من الادعاءات' }
    ],
    evidenceLevel: 'observed',
    category: 'intermediary'
  },
  {
    id: 'rf-7',
    title: {
      en: '"Free Zone License = Full Market Access"',
      ar: '"ترخيص المنطقة الحرة = وصول كامل للسوق"'
    },
    pattern: {
      en: 'Consultant suggests that a free zone license (DIFC, ADGM, DHCC) provides unlimited access to UAE healthcare market.',
      ar: 'المستشار يقترح أن ترخيص المنطقة الحرة (DIFC، ADGM، DHCC) يوفر وصولاً غير محدود لسوق الرعاية الصحية الإماراتية.'
    },
    reality: {
      en: 'Free zone licenses have specific scope and jurisdictional limits. DHCC allows healthcare services within its zone; mainland activities may require additional licensing. Medical device sales to hospitals typically require mainland presence or authorized distributor. Cross-emirate operations have additional requirements.',
      ar: 'تراخيص المناطق الحرة لها نطاق وحدود قضائية محددة. DHCC يسمح بخدمات الرعاية الصحية داخل منطقته؛ الأنشطة في البر الرئيسي قد تتطلب ترخيصاً إضافياً. مبيعات الأجهزة الطبية للمستشفيات عادة تتطلب وجوداً في البر الرئيسي أو موزعاً معتمداً. العمليات عبر الإمارات لها متطلبات إضافية.'
    },
    howToVerify: [
      { en: 'Review free zone license scope and permitted activities', ar: 'راجع نطاق ترخيص المنطقة الحرة والأنشطة المسموح بها' },
      { en: 'Consult with free zone authority directly about your use case', ar: 'استشر سلطة المنطقة الحرة مباشرة حول حالة استخدامك' },
      { en: 'Understand mainland licensing requirements for your target activities', ar: 'افهم متطلبات ترخيص البر الرئيسي لأنشطتك المستهدفة' },
      { en: 'Ask about specific customers they\'ve served from the free zone', ar: 'اسأل عن عملاء محددين خدموهم من المنطقة الحرة' }
    ],
    evidenceLevel: 'official',
    sources: ['DIFC Business Registry', 'ADGM Registration Authority', 'DHCC'],
    category: 'process'
  },
  {
    id: 'rf-8',
    title: {
      en: '"Data Can Stay Outside UAE"',
      ar: '"البيانات يمكن أن تبقى خارج الإمارات"'
    },
    pattern: {
      en: 'Technology partner suggests health data can be processed/stored outside UAE without restrictions.',
      ar: 'شريك التكنولوجيا يقترح أن البيانات الصحية يمكن معالجتها/تخزينها خارج الإمارات دون قيود.'
    },
    reality: {
      en: 'UAE health data regulations require health data to remain within UAE borders in most cases. Specific requirements vary by emirate (Abu Dhabi has DOH requirements, Dubai has DHA requirements). Cross-border data transfer requires specific approvals and safeguards. Regulations are evolving.',
      ar: 'لوائح البيانات الصحية الإماراتية تتطلب بقاء البيانات الصحية داخل حدود الإمارات في معظم الحالات. المتطلبات المحددة تختلف حسب الإمارة (أبوظبي لديها متطلبات DOH، دبي لديها متطلبات DHA). نقل البيانات عبر الحدود يتطلب موافقات وضمانات محددة. اللوائح في تطور.'
    },
    howToVerify: [
      { en: 'Review UAE data protection law and health data regulations', ar: 'راجع قانون حماية البيانات الإماراتي ولوائح البيانات الصحية' },
      { en: 'Consult with data protection specialist familiar with UAE healthcare', ar: 'استشر متخصص حماية البيانات المألوف بالرعاية الصحية الإماراتية' },
      { en: 'Check specific requirements for your target emirate', ar: 'تحقق من المتطلبات المحددة لإمارتك المستهدفة' },
      { en: 'Ask hospitals about their data residency requirements', ar: 'اسأل المستشفيات عن متطلبات إقامة البيانات الخاصة بهم' }
    ],
    evidenceLevel: 'official',
    sources: ['UAE Federal Decree-Law No. 45/2021', 'DOH Health Data Standards', 'DHA Regulations'],
    category: 'legal'
  },
  {
    id: 'rf-9',
    title: {
      en: '"Startup Visa Guarantees Employment"',
      ar: '"تأشيرة الشركة الناشئة تضمن التوظيف"'
    },
    pattern: {
      en: 'Immigration consultant suggests startup/freelancer visa provides same benefits as employment visa, including healthcare and full work rights.',
      ar: 'مستشار الهجرة يقترح أن تأشيرة الشركة الناشئة/المستقل توفر نفس فوائد تأشيرة العمل، بما في ذلك الرعاية الصحية وحقوق العمل الكاملة.'
    },
    reality: {
      en: 'Different visa types have different rights and obligations. Freelancer/startup visas may not include employer-sponsored health insurance. Some government services require employment visa. Banking and other services may have different requirements. Research specific visa type benefits carefully.',
      ar: 'أنواع التأشيرات المختلفة لها حقوق والتزامات مختلفة. تأشيرات المستقل/الشركة الناشئة قد لا تشمل تأمين صحي من صاحب العمل. بعض الخدمات الحكومية تتطلب تأشيرة عمل. الخدمات المصرفية وغيرها قد يكون لها متطلبات مختلفة. ابحث بعناية عن فوائد نوع التأشيرة المحدد.'
    },
    howToVerify: [
      { en: 'Check official MOHRE/ICP guidance on visa types', ar: 'تحقق من إرشادات MOHRE/ICP الرسمية حول أنواع التأشيرات' },
      { en: 'Compare specific benefits (healthcare, banking, etc.) by visa type', ar: 'قارن الفوائد المحددة (الرعاية الصحية، المصرفية، إلخ) حسب نوع التأشيرة' },
      { en: 'Consult with established expats about practical implications', ar: 'استشر المغتربين المستقرين حول الآثار العملية' },
      { en: 'Verify claims with the issuing authority (not just the consultant)', ar: 'تحقق من الادعاءات مع السلطة المصدرة (ليس فقط المستشار)' }
    ],
    evidenceLevel: 'official',
    sources: ['MOHRE', 'ICP (Federal Authority for Identity and Citizenship)'],
    category: 'process'
  },
  {
    id: 'rf-10',
    title: {
      en: '"We\'ll Handle Everything for a Fixed Fee"',
      ar: '"سنتعامل مع كل شيء مقابل رسوم ثابتة"'
    },
    pattern: {
      en: 'Service provider offers all-inclusive package for market entry, licensing, and business setup at a fixed price with vague scope.',
      ar: 'مزود الخدمة يقدم حزمة شاملة لدخول السوق والترخيص وإعداد الأعمال بسعر ثابت مع نطاق غامض.'
    },
    reality: {
      en: 'Legitimate service providers break down costs by activity. Government fees are separate from service fees. Timeline and scope should be clearly defined. Hidden costs often emerge for document attestation, translation, additional approvals. Reputable providers provide itemized quotes.',
      ar: 'مزودو الخدمات الشرعيون يفصّلون التكاليف حسب النشاط. الرسوم الحكومية منفصلة عن رسوم الخدمة. يجب تحديد الجدول الزمني والنطاق بوضوح. التكاليف الخفية غالباً تظهر للتصديق على المستندات والترجمة والموافقات الإضافية. المزودون ذوو السمعة يقدمون عروضاً مفصّلة.'
    },
    howToVerify: [
      { en: 'Request itemized breakdown of all fees (government + service)', ar: 'اطلب تفصيلاً مفصّلاً لجميع الرسوم (حكومية + خدمة)' },
      { en: 'Ask specifically what\'s NOT included in the package', ar: 'اسأل تحديداً ما هو غير مشمول في الحزمة' },
      { en: 'Get timeline with specific milestones and responsibilities', ar: 'احصل على جدول زمني مع معالم ومسؤوليات محددة' },
      { en: 'Compare quotes from 3+ providers for the same scope', ar: 'قارن عروض الأسعار من 3+ مزودين لنفس النطاق' }
    ],
    evidenceLevel: 'observed',
    category: 'process'
  }
];
