// Composite personas for the home PersonaSection and the per-persona landing
// pages. These are illustrative composites, NOT real individuals. Each entry
// names its `basis` — the public-domain sources the archetype is drawn from —
// in line with the evidence discipline in docs/brand/voice.md.
//
// If/when we collect explicit consent from real users to publish their
// profiles, individual entries can be promoted to evidenceLevel 'observed'
// or 'official' with a link out.

import { UserPersona, LocalizedString } from '@/types';
import { EvidenceLevel } from '@/types/research';

export type Persona = {
  id: UserPersona;
  // Card-level (home PersonaSection)
  title: LocalizedString;
  cardDescription: LocalizedString;
  // Detail page
  archetype: LocalizedString;
  context: LocalizedString;
  pains: { en: string[]; ar: string[] };
  goals: { en: string[]; ar: string[] };
  journey: { en: string[]; ar: string[] };
  // Cross-links into the directory
  relevantDomainIds: string[];
  relevantPlayerIds: string[];
  // Epistemic disclosure
  evidenceLevel: EvidenceLevel;
  basis: LocalizedString;
};

export const personas: Persona[] = [
  {
    id: 'patient',
    title: {
      en: 'The Patient',
      ar: 'المريض',
    },
    cardDescription: {
      en: 'Comparing UAE healthcare facilities — including which ones actually use AI in diagnostics.',
      ar: 'مقارنة بين مرافق الرعاية الصحية في الإمارات — بما في ذلك أيٌّ منها يستخدم الذكاء الاصطناعي في التشخيص فعلياً.',
    },
    archetype: {
      en: 'Navigating UAE healthcare and trying to separate marketing from what is actually deployed.',
      ar: 'يتنقّل في منظومة الرعاية الصحية الإماراتية ويحاول التمييز بين الدعاية وما هو منشور فعلياً.',
    },
    context: {
      en: 'Whether they live in the UAE or visit for treatment, they have to make decisions across facilities whose AI claims sound identical in marketing material but differ sharply in what is deployed and validated.',
      ar: 'سواء كانوا مقيمين في الإمارات أو زائرين للعلاج، عليهم اتخاذ قرارات بين مرافق تبدو ادعاءاتها حول الذكاء الاصطناعي متشابهة في المواد التسويقية لكنها تختلف بشكل حادّ في ما هو منشور ومعتمد فعلياً.',
    },
    pains: {
      en: [
        'Hard to compare hospitals on AI adoption when every brochure says "AI-powered"',
        'Unclear which conditions actually have AI-augmented diagnosis or treatment available',
        'Don\'t know which providers are connected to NABIDH (Dubai) or Malaffi (Abu Dhabi)',
        'Privacy concerns around how health data moves between facilities',
      ],
      ar: [
        'يصعب مقارنة المستشفيات في تبنّي الذكاء الاصطناعي حين تذكر كل كتيّب أنه "مدعوم بالذكاء الاصطناعي"',
        'غير واضح أيّ الحالات يتوفّر لها تشخيص أو علاج معزَّز بالذكاء الاصطناعي فعلياً',
        'لا يعرفون أيّ مقدّمي الرعاية متّصلون بمنصة نبض (دبي) أو ملفي (أبوظبي)',
        'مخاوف بشأن خصوصية انتقال البيانات الصحية بين المرافق',
      ],
    },
    goals: {
      en: [
        'Find clinics using validated AI in their specific area of need',
        'Understand who can access their health records across the system',
        'See which insurance providers cover AI-augmented care',
      ],
      ar: [
        'العثور على عيادات تستخدم ذكاءً اصطناعياً معتمداً في مجال احتياجهم المحدّد',
        'فهم من يستطيع الوصول إلى سجلّاتهم الصحية عبر المنظومة',
        'معرفة شركات التأمين التي تُغطّي الرعاية المعزَّزة بالذكاء الاصطناعي',
      ],
    },
    journey: {
      en: [
        'Open the Directory → filter for "hospital" type in their emirate',
        'Read the Claims tab on each entry — what AI is actually deployed, with primary evidence',
        'Compare jurisdictions — Dubai (DHA/NABIDH) vs Abu Dhabi (DoH/Malaffi)',
      ],
      ar: [
        'فتح الدليل → تصفية حسب نوع "مستشفى" في الإمارة',
        'قراءة قسم الادعاءات لكل مدخل — ما هو الذكاء الاصطناعي المنشور فعلياً، مع الدليل الأوّلي',
        'مقارنة الجهات — دبي (هيئة الصحة/نبض) مقابل أبوظبي (دائرة الصحة/ملفي)',
      ],
    },
    relevantDomainIds: ['medical-tourism'],
    relevantPlayerIds: ['cleveland-clinic-ad', 'medcare', 'nabidh'],
    evidenceLevel: 'inference',
    basis: {
      en: 'Composite drawn from publicly-shared patient experiences in UAE health forums, Reddit r/dubai health threads, and the DHA medical-tourism public registry.',
      ar: 'نموذج مركّب مستمدّ من تجارب مرضى منشورة على منتديات صحية إماراتية، وخيوط r/dubai الصحية على رِدِت، والسجلّ العام للسياحة العلاجية لهيئة الصحة بدبي.',
    },
  },
  {
    id: 'doctor',
    title: {
      en: 'The Clinician',
      ar: 'الطبيب',
    },
    cardDescription: {
      en: 'Vetting AI tools your hospital is rolling out — past the demo, into the evidence.',
      ar: 'تقييم أدوات الذكاء الاصطناعي التي يطرحها مستشفاك — تجاوز العرض التوضيحي والوصول إلى الدليل.',
    },
    archetype: {
      en: 'A practising clinician evaluating which AI tools have real validation versus marketing polish.',
      ar: 'طبيب ممارس يُقيّم أيّ أدوات الذكاء الاصطناعي تمتلك تحقّقاً حقيقياً مقابل لمعان تسويقي.',
    },
    context: {
      en: 'They get pitched AI tools every week. Few are independently validated. Most pitch decks cite the same three trials. They want to know what their peer hospitals have actually deployed — and what the regulator says about it.',
      ar: 'يتلقّون عروضاً لأدوات ذكاء اصطناعي كل أسبوع. قليل منها مُتحقَّق منه باستقلالية. أغلب العروض تستشهد بالتجارب الثلاث نفسها. يريدون معرفة ما نشرته المستشفيات النظيرة فعلاً — وما تقوله الجهة المنظِّمة عنه.',
    },
    pains: {
      en: [
        'Pitched new AI tools weekly with no time to evaluate each one',
        'No quick way to see which peer hospitals deployed a given tool',
        'Regulatory guidance from DHA / DoH lags actual deployments',
        'Liability questions around AI-assisted clinical decisions',
      ],
      ar: [
        'يتلقّون عروضاً لأدوات ذكاء اصطناعي جديدة أسبوعياً دون وقت لتقييم كلٍّ منها',
        'لا توجد طريقة سريعة لمعرفة المستشفيات النظيرة التي نشرت أداةً معيّنة',
        'الإرشادات التنظيمية من هيئة الصحة / دائرة الصحة تتأخّر عن النشر الفعلي',
        'أسئلة المسؤولية حول القرارات السريرية المدعومة بالذكاء الاصطناعي',
      ],
    },
    goals: {
      en: [
        'Find AI tools with peer-reviewed validation, not just press releases',
        'Compare deployments across CCAD, SEHA hospitals, and Cleveland Clinic AD',
        'Stay current on DHA / DoH AI policy without reading every press release',
      ],
      ar: [
        'العثور على أدوات ذكاء اصطناعي بتحقّق علمي مُحكَّم، لا مجرّد بيانات صحفية',
        'مقارنة عمليات النشر عبر كليفلاند كلينك أبوظبي ومستشفيات صحة',
        'متابعة سياسات الذكاء الاصطناعي لهيئة الصحة / دائرة الصحة دون قراءة كل بيان',
      ],
    },
    journey: {
      en: [
        'Open the Oncology hub → see which tools are in clinical use today',
        'Read each tool\'s Claims — is the evidence primary (peer-reviewed) or vendor-supplied?',
        'Open Discovery → recent regulator filings and clinical-trial launches',
      ],
      ar: [
        'فتح مركز الأورام → معرفة أيّ الأدوات قيد الاستخدام السريري اليوم',
        'قراءة ادعاءات كل أداة — هل الدليل أوّلي (مُحكَّم) أم مُقدَّم من المورّد؟',
        'فتح "اكتشاف" → ملفّات تنظيمية حديثة وإطلاق تجارب سريرية',
      ],
    },
    relevantDomainIds: ['oncology', 'ai-life-sciences'],
    relevantPlayerIds: ['cleveland-clinic-ad', 'seha', 'g42-healthcare'],
    evidenceLevel: 'inference',
    basis: {
      en: 'Composite drawn from public LinkedIn profiles of UAE Medical Affairs leads, conference Q&A at Arab Health 2024–2025, and MBZUAI Medical Affairs Council public minutes.',
      ar: 'نموذج مركّب مستمدّ من ملفّات لينكدإن العامة لقادة الشؤون الطبية في الإمارات، وأسئلة وأجوبة مؤتمر Arab Health 2024–2025، والمحاضر العامة لمجلس الشؤون الطبية في جامعة MBZUAI.',
    },
  },
  {
    id: 'business',
    title: {
      en: 'The Business',
      ar: 'القطاع التجاري',
    },
    cardDescription: {
      en: 'Mapping the AI vendor landscape before a procurement, insurance, or partnership decision.',
      ar: 'رسم خريطة لمنظومة موردي الذكاء الاصطناعي قبل قرار شراء أو تأمين أو شراكة.',
    },
    archetype: {
      en: 'Hospital administrator, insurer, payer, or BD lead deciding which AI vendors to pilot, partner with, or cover.',
      ar: 'مسؤول إداري في مستشفى، أو شركة تأمين، أو جهة تمويل، أو مسؤول تطوير أعمال يقرّر أيّ موردي الذكاء الاصطناعي يجرّب أو يشترك معه أو يُغطّيه.',
    },
    context: {
      en: 'Vendor claims aren\'t comparable across pitch decks. Pricing benchmarks are invisible. UAE-specific case studies are scarce, and the regulatory pathways diverge by emirate. Decisions ride on whichever peer institution moved first.',
      ar: 'ادعاءات الموردين غير قابلة للمقارنة بين عروضهم. معايير التسعير غير ظاهرة. دراسات الحالة الخاصة بالإمارات نادرة، ومسارات التنظيم تختلف بين إمارة وأخرى. تعتمد القرارات على المؤسّسة النظيرة التي تحرّكت أوّلاً.',
    },
    pains: {
      en: [
        'Vendor claims aren\'t comparable apples-to-apples',
        'No reference list for "which UAE hospital uses vendor X"',
        'Pricing benchmarks invisible — every deal is bespoke',
        'Regulatory pathways differ across Dubai vs Abu Dhabi vs federal',
      ],
      ar: [
        'ادعاءات الموردين غير قابلة للمقارنة المباشرة',
        'لا توجد قائمة مرجعية لـ "أيّ مستشفى إماراتي يستخدم المورّد X"',
        'معايير التسعير غير ظاهرة — كل صفقة مفصّلة',
        'مسارات التنظيم تختلف بين دبي وأبوظبي والاتحادي',
      ],
    },
    goals: {
      en: [
        'Identify which AI vendors have UAE jurisdiction deployments',
        'Find peer hospitals using a vendor as a reference call',
        'Compare regulatory pathways (DHA vs DoH onboarding)',
      ],
      ar: [
        'تحديد موردي الذكاء الاصطناعي الذين لديهم عمليات نشر في الإمارات',
        'إيجاد مستشفيات نظيرة تستخدم مورّداً كاتصال مرجعي',
        'مقارنة المسارات التنظيمية (هيئة الصحة مقابل دائرة الصحة)',
      ],
    },
    journey: {
      en: [
        'Filter the Directory by jurisdiction (UAE-Dubai or UAE-Abu Dhabi)',
        'Sort by featured operational deployments',
        'Open the Process Mining hub for operational-efficiency tools',
      ],
      ar: [
        'تصفية الدليل حسب الإمارة (دبي أو أبوظبي)',
        'الترتيب حسب عمليات النشر التشغيلية المُمَيَّزة',
        'فتح مركز Process Mining لأدوات الكفاءة التشغيلية',
      ],
    },
    relevantDomainIds: ['process-mining', 'medical-tourism'],
    relevantPlayerIds: ['seha', 'medcare', 'g42-healthcare'],
    evidenceLevel: 'inference',
    basis: {
      en: 'Composite drawn from Hub71+ deal-flow patterns, Magnitt UAE healthtech 2024 reports, and procurement pages on DHA and DoH websites.',
      ar: 'نموذج مركّب مستمدّ من أنماط صفقات Hub71+، وتقارير Magnitt للتقنية الصحية في الإمارات 2024، وصفحات المشتريات على مواقع هيئة الصحة بدبي ودائرة الصحة بأبوظبي.',
    },
  },
  {
    id: 'startup',
    title: {
      en: 'The Founder',
      ar: 'المؤسِّس',
    },
    cardDescription: {
      en: 'Mapping the UAE healthcare AI landscape before market entry, fundraising, or partnership.',
      ar: 'رسم خريطة لمنظومة الذكاء الاصطناعي الصحي الإماراتية قبل دخول السوق أو جمع التمويل أو الشراكة.',
    },
    archetype: {
      en: 'Healthtech founder evaluating UAE as a market or beachhead — clinical partners, regulators, capital, talent.',
      ar: 'مؤسِّس تقنية صحية يُقيّم الإمارات كسوق أو نقطة انطلاق — شركاء سريريون، جهات تنظيمية، رأس مال، كفاءات.',
    },
    context: {
      en: 'They\'ve usually closed seed or Series A elsewhere and are deciding whether the UAE is the next geography. They need to know who else operates in their sub-domain, which regulator path applies, and which accelerators or sovereign funds will actually return calls.',
      ar: 'عادةً ما يكونون قد أغلقوا جولة Seed أو Series A في مكان آخر ويقرّرون ما إذا كانت الإمارات هي السوق التالي. يحتاجون لمعرفة من يعمل في مجالهم الفرعي، وأيّ مسار تنظيمي ينطبق، وأيّ المسرّعات أو الصناديق السيادية ستردّ فعلاً.',
    },
    pains: {
      en: [
        'Don\'t know which players to partner with vs compete against',
        'Regulatory pathways unclear: DHA license vs ADGM RegLab sandbox vs federal route',
        'Accelerator landscape is fragmented (Hub71+, MBRIF, DTEC, in5)',
        'No clear view of who has raised what, when, from whom',
      ],
      ar: [
        'لا يعرفون أيّ اللاعبين للشراكة معهم مقابل المنافسة',
        'المسارات التنظيمية غير واضحة: رخصة هيئة الصحة مقابل ADGM RegLab مقابل المسار الاتحادي',
        'منظومة المسرّعات مفكّكة (Hub71+، MBRIF، DTEC، in5)',
        'لا توجد رؤية واضحة لمن جمع كم، ومتى، ومن مَن',
      ],
    },
    goals: {
      en: [
        'See who else operates in their sub-domain (radiology AI, drug discovery, ops)',
        'Find regulators to approach for sandbox or pre-license dialogue',
        'Surface active grants, accelerators, and prize challenges',
      ],
      ar: [
        'معرفة من يعمل في مجالهم الفرعي (ذكاء اصطناعي للأشعة، اكتشاف الأدوية، العمليات)',
        'العثور على جهات تنظيمية للحوار قبل الترخيص أو لبيئة تجريبية',
        'كشف المنح الفعّالة والمسرّعات وتحدّيات الجوائز',
      ],
    },
    journey: {
      en: [
        'Open the Directory → filter by your sub-domain',
        'Open Discovery → Open Calls (grants, sandboxes, prize challenges)',
        'Open Context → compare UAE vs UK / EU / US regulatory pathways',
      ],
      ar: [
        'فتح الدليل → التصفية حسب مجالك الفرعي',
        'فتح "اكتشاف" → الدعوات المفتوحة (منح، بيئات تجريبية، تحدّيات جوائز)',
        'فتح "السياق" → مقارنة الإمارات مع المملكة المتحدة / الاتحاد الأوروبي / الولايات المتحدة',
      ],
    },
    relevantDomainIds: ['ai-life-sciences', 'oncology', 'process-mining'],
    relevantPlayerIds: ['g42-healthcare', 'astra-tech', 'pulse-ai', 'mbzuai'],
    evidenceLevel: 'inference',
    basis: {
      en: 'Composite drawn from MBRIF accelerator cohort patterns, ADGM RegLab participant lists, and the YC W23–S25 healthcare-AI batches.',
      ar: 'نموذج مركّب مستمدّ من أنماط دفعات مسرّعة MBRIF، وقوائم المشاركين في ADGM RegLab، ودفعات Y Combinator W23–S25 للذكاء الاصطناعي الصحي.',
    },
  },
  {
    id: 'leader',
    title: {
      en: 'The Strategist',
      ar: 'صانع الاستراتيجية',
    },
    cardDescription: {
      en: 'Setting policy or strategy when the ecosystem moves faster than the briefing materials.',
      ar: 'وضع السياسات أو الاستراتيجيات حين تتحرّك المنظومة أسرع من المواد التحضيرية.',
    },
    archetype: {
      en: 'Policymaker, hospital CEO, MoH director, or sovereign-fund partner setting direction on healthcare AI.',
      ar: 'صانع سياسات، أو الرئيس التنفيذي لمستشفى، أو مدير في وزارة الصحة، أو شريك في صندوق سيادي يضع توجّهاً في الذكاء الاصطناعي الصحي.',
    },
    context: {
      en: 'Their briefing materials are 6+ months stale by the time they read them. Marketing claims look identical to evidence in slide decks. They need a cross-regional view that benchmarks UAE position against the UK, EU, and US in close to real time.',
      ar: 'تكون موادهم التحضيرية متأخّرة بستة أشهر فأكثر عند قراءتها. تبدو الادعاءات التسويقية مطابقة للأدلّة في العروض. يحتاجون رؤية إقليمية متعدّدة تُقارن موقع الإمارات مع المملكة المتحدة والاتحاد الأوروبي والولايات المتحدة بأقرب وقت ممكن.',
    },
    pains: {
      en: [
        'Briefing materials lag the actual landscape by 6+ months',
        'Marketing claims and evidence indistinguishable in slide decks',
        'Hard to benchmark UAE against UK / EU / US in real time',
        'No single source of cross-jurisdictional regulatory commitments',
      ],
      ar: [
        'المواد التحضيرية تتأخّر عن المنظومة الفعلية بستة أشهر فأكثر',
        'الادعاءات التسويقية والدليل لا يمكن تمييزهما في العروض',
        'يصعب قياس الإمارات مقابل المملكة المتحدة / الاتحاد الأوروبي / الولايات المتحدة بشكل آني',
        'لا يوجد مصدر موحَّد للالتزامات التنظيمية بين الجهات',
      ],
    },
    goals: {
      en: [
        'See state-of-deployment across the UAE health system in one view',
        'Compare UAE position to UK MHRA, EU MDR, and US FDA cleared AI',
        'Track regulatory commitments and milestones by other jurisdictions',
      ],
      ar: [
        'رؤية حالة النشر عبر منظومة الصحة الإماراتية في عرض واحد',
        'مقارنة موقع الإمارات مع MHRA البريطانية و MDR الأوروبية و FDA الأمريكية',
        'تتبّع الالتزامات التنظيمية والمحطّات الفارقة في الجهات الأخرى',
      ],
    },
    journey: {
      en: [
        'Open the System Map → cross-domain view of UAE actors',
        'Open Context → 5-region comparison (UAE / UK / EU / US / KSA)',
        'Open Discovery → recent launches, regulatory events, and policy filings',
      ],
      ar: [
        'فتح خريطة المنظومة → عرض متعدّد المجالات للّاعبين في الإمارات',
        'فتح "السياق" → مقارنة خمس مناطق (الإمارات / المملكة المتحدة / الاتحاد الأوروبي / الولايات المتحدة / السعودية)',
        'فتح "اكتشاف" → الإطلاقات الحديثة والأحداث التنظيمية والملفّات السياسية',
      ],
    },
    relevantDomainIds: ['oncology', 'process-mining', 'medical-tourism', 'ai-life-sciences'],
    relevantPlayerIds: ['dha', 'doh', 'mohap', 'mbzuai'],
    evidenceLevel: 'inference',
    basis: {
      en: 'Composite drawn from public statements at Vision 2030 healthcare panels, World Government Summit 2024–2025 health-track sessions, and DHA / DoH annual reports.',
      ar: 'نموذج مركّب مستمدّ من تصريحات علنية في جلسات الرعاية الصحية لرؤية 2030، وجلسات مسار الصحة في القمّة العالمية للحكومات 2024–2025، والتقارير السنوية لهيئة الصحة بدبي ودائرة الصحة بأبوظبي.',
    },
  },
];

export function getPersonaById(id: UserPersona): Persona | undefined {
  return personas.find((p) => p.id === id);
}
