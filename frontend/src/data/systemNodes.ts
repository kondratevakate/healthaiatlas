import { SystemLayer, SystemNodeCategory, LocalizedString } from '@/types';

export interface SystemMapNode {
  id: string;
  label: LocalizedString;
  layer: SystemLayer;
  category: SystemNodeCategory;
  description: LocalizedString;
  angle: number;
}

export const categoryConfig: Record<SystemNodeCategory, { color: string; label: LocalizedString }> = {
  human: { color: 'hsl(0, 0%, 35%)', label: { en: 'Human', ar: 'بشري' } },
  social: { color: 'hsl(0, 0%, 40%)', label: { en: 'Social', ar: 'اجتماعي' } },
  cultural: { color: 'hsl(0, 0%, 45%)', label: { en: 'Cultural', ar: 'ثقافي' } },
  financial: { color: 'hsl(0, 0%, 50%)', label: { en: 'Financial', ar: 'مالي' } },
  built: { color: 'hsl(0, 0%, 55%)', label: { en: 'Built', ar: 'بنية تحتية' } },
  data: { color: 'hsl(0, 0%, 60%)', label: { en: 'Data', ar: 'بيانات' } },
  political: { color: 'hsl(0, 0%, 65%)', label: { en: 'Political', ar: 'سياسي' } },
  natural: { color: 'hsl(0, 0%, 70%)', label: { en: 'Natural', ar: 'طبيعي' } },
};

export const layerConfig: Record<SystemLayer, { radius: number; label: LocalizedString }> = {
  purpose: { radius: 0.15, label: { en: 'PURPOSE', ar: 'الهدف' } },
  impacts: { radius: 0.35, label: { en: 'IMPACTS', ar: 'التأثيرات' } },
  activities: { radius: 0.6, label: { en: 'ACTIVITIES', ar: 'الأنشطة' } },
  components: { radius: 0.85, label: { en: 'COMPONENTS', ar: 'المكونات' } },
};

// Cross-context healthcare AI ecosystem — multi-region.
// Components layer mixes US, UAE, UK, EU, and generic actors so the map reads as global.
export const systemNodes: SystemMapNode[] = [
  // PURPOSE (center) — universal goals
  {
    id: 'purpose-health',
    label: { en: 'Improve Population Health', ar: 'تحسين صحة السكان' },
    layer: 'purpose',
    category: 'human',
    description: { en: 'Better outcomes across populations and demographics', ar: 'نتائج أفضل عبر السكان والفئات الديموغرافية' },
    angle: 0,
  },
  {
    id: 'purpose-access',
    label: { en: 'Equitable Access', ar: 'وصول عادل' },
    layer: 'purpose',
    category: 'social',
    description: { en: 'Healthcare reach independent of geography or income', ar: 'وصول الرعاية الصحية بمعزل عن الجغرافيا أو الدخل' },
    angle: 120,
  },
  {
    id: 'purpose-evidence',
    label: { en: 'Evidence-Grade AI', ar: 'ذكاء اصطناعي قائم على الأدلة' },
    layer: 'purpose',
    category: 'data',
    description: { en: 'AI deployed with the same rigor as any other clinical intervention', ar: 'الذكاء الاصطناعي بنفس صرامة أي تدخل سريري آخر' },
    angle: 240,
  },

  // IMPACTS — what changes when the system works
  {
    id: 'impact-diagnosis',
    label: { en: 'Faster Diagnosis', ar: 'تشخيص أسرع' },
    layer: 'impacts',
    category: 'human',
    description: { en: 'AI-assisted detection at population scale', ar: 'الكشف المدعوم بالذكاء الاصطناعي على نطاق السكان' },
    angle: 0,
  },
  {
    id: 'impact-cost',
    label: { en: 'Lower Cost of Care', ar: 'خفض تكلفة الرعاية' },
    layer: 'impacts',
    category: 'financial',
    description: { en: 'Efficiency gains in admin, imaging, triage', ar: 'مكاسب الكفاءة في الإدارة والتصوير والفرز' },
    angle: 51,
  },
  {
    id: 'impact-research',
    label: { en: 'Accelerated R&D', ar: 'تسريع البحث والتطوير' },
    layer: 'impacts',
    category: 'data',
    description: { en: 'Drug discovery and trial design at new speeds', ar: 'اكتشاف الأدوية وتصميم التجارب بسرعات جديدة' },
    angle: 102,
  },
  {
    id: 'impact-personalized',
    label: { en: 'Personalized Care', ar: 'رعاية شخصية' },
    layer: 'impacts',
    category: 'human',
    description: { en: 'Treatment tuned to individual biology and history', ar: 'علاج مضبوط على بيولوجيا الفرد وتاريخه' },
    angle: 153,
  },
  {
    id: 'impact-prevention',
    label: { en: 'Earlier Prevention', ar: 'وقاية مبكرة' },
    layer: 'impacts',
    category: 'social',
    description: { en: 'Predictive risk stratification before disease onset', ar: 'تصنيف المخاطر التنبؤي قبل بداية المرض' },
    angle: 204,
  },
  {
    id: 'impact-workforce',
    label: { en: 'Augmented Workforce', ar: 'قوى عاملة معززة' },
    layer: 'impacts',
    category: 'human',
    description: { en: 'AI as a colleague — not a replacement — for clinicians', ar: 'الذكاء الاصطناعي كزميل لا بديل عن الأطباء' },
    angle: 255,
  },
  {
    id: 'impact-trust',
    label: { en: 'Public Trust', ar: 'الثقة العامة' },
    layer: 'impacts',
    category: 'cultural',
    description: { en: 'Transparency that earns user and patient confidence', ar: 'الشفافية التي تكسب ثقة المستخدمين والمرضى' },
    angle: 306,
  },

  // ACTIVITIES — the work the ecosystem does
  {
    id: 'activity-imaging',
    label: { en: 'Medical Imaging AI', ar: 'الذكاء الاصطناعي للتصوير الطبي' },
    layer: 'activities',
    category: 'data',
    description: { en: 'Radiology, pathology, ophthalmology models', ar: 'نماذج الأشعة وعلم الأمراض وطب العيون' },
    angle: 0,
  },
  {
    id: 'activity-genomics',
    label: { en: 'Genomics & Multi-omics', ar: 'الجينوميات والأوميات المتعددة' },
    layer: 'activities',
    category: 'data',
    description: { en: 'Sequencing, variant calling, multi-omics integration', ar: 'التسلسل، استدعاء المتغيرات، تكامل الأوميات المتعددة' },
    angle: 36,
  },
  {
    id: 'activity-drug-discovery',
    label: { en: 'Drug Discovery', ar: 'اكتشاف الأدوية' },
    layer: 'activities',
    category: 'data',
    description: { en: 'Generative chemistry, target ID, AlphaFold-class structure', ar: 'الكيمياء التوليدية، تحديد الأهداف، البنية بفئة AlphaFold' },
    angle: 72,
  },
  {
    id: 'activity-monitoring',
    label: { en: 'Patient Monitoring', ar: 'مراقبة المرضى' },
    layer: 'activities',
    category: 'human',
    description: { en: 'Wearables, remote monitoring, ICU prediction', ar: 'الأجهزة القابلة للارتداء، المراقبة عن بعد، التنبؤ في العناية المركزة' },
    angle: 108,
  },
  {
    id: 'activity-regulation',
    label: { en: 'Regulation & Approval', ar: 'التنظيم والاعتماد' },
    layer: 'activities',
    category: 'political',
    description: { en: 'Clearance pathways: 510(k), De Novo, EU MDR, regional sandboxes', ar: 'مسارات الاعتماد: 510(k)، De Novo، EU MDR، الصناديق التجريبية الإقليمية' },
    angle: 144,
  },
  {
    id: 'activity-funding',
    label: { en: 'Funding & Investment', ar: 'التمويل والاستثمار' },
    layer: 'activities',
    category: 'financial',
    description: { en: 'Public grants, VC, sovereign capital', ar: 'المنح العامة، رأس المال المخاطر، رأس المال السيادي' },
    angle: 180,
  },
  {
    id: 'activity-trials',
    label: { en: 'Clinical Trials', ar: 'التجارب السريرية' },
    layer: 'activities',
    category: 'human',
    description: { en: 'AI-assisted recruitment, synthetic arms, decentralized trials', ar: 'التجنيد بمساعدة الذكاء الاصطناعي، الأذرع الاصطناعية، التجارب اللامركزية' },
    angle: 216,
  },
  {
    id: 'activity-records',
    label: { en: 'Health Records & Interop', ar: 'السجلات الصحية والتشغيل البيني' },
    layer: 'activities',
    category: 'data',
    description: { en: 'EHR integration, FHIR, terminology, longitudinal records', ar: 'تكامل السجل الصحي الإلكتروني، FHIR، المصطلحات، السجلات الطولية' },
    angle: 252,
  },
  {
    id: 'activity-education',
    label: { en: 'Education & Training', ar: 'التعليم والتدريب' },
    layer: 'activities',
    category: 'cultural',
    description: { en: 'Curricula, fellowships, continuing medical education', ar: 'المناهج، الزمالات، التعليم الطبي المستمر' },
    angle: 288,
  },
  {
    id: 'activity-partnerships',
    label: { en: 'Cross-sector Partnerships', ar: 'شراكات عبر القطاعات' },
    layer: 'activities',
    category: 'social',
    description: { en: 'Pharma + tech, academia + industry, government + private', ar: 'الأدوية + التكنولوجيا، الأكاديميا + الصناعة، الحكومة + القطاع الخاص' },
    angle: 324,
  },

  // COMPONENTS — multi-region actors
  // Regulators (political)
  {
    id: 'component-fda',
    label: { en: 'FDA', ar: 'إدارة الغذاء والدواء (الولايات المتحدة)' },
    layer: 'components',
    category: 'political',
    description: { en: 'US Food & Drug Administration — 510(k), De Novo, AI/ML SaMD pathway', ar: 'إدارة الغذاء والدواء الأمريكية — مسار 510(k) و De Novo و AI/ML SaMD' },
    angle: 0,
  },
  {
    id: 'component-ema',
    label: { en: 'EMA', ar: 'وكالة الأدوية الأوروبية' },
    layer: 'components',
    category: 'political',
    description: { en: 'European Medicines Agency — EU MDR / IVDR oversight', ar: 'وكالة الأدوية الأوروبية — الإشراف على EU MDR / IVDR' },
    angle: 22,
  },
  {
    id: 'component-mhra',
    label: { en: 'MHRA', ar: 'هيئة الأدوية والمنتجات الصحية (المملكة المتحدة)' },
    layer: 'components',
    category: 'political',
    description: { en: 'UK Medicines & Healthcare products Regulatory Agency', ar: 'هيئة تنظيم الأدوية والمنتجات الصحية في المملكة المتحدة' },
    angle: 44,
  },
  {
    id: 'component-uae-regulators',
    label: { en: 'MOHAP / DHA / DOH', ar: 'وزارة الصحة / DHA / DOH' },
    layer: 'components',
    category: 'political',
    description: { en: 'UAE federal + Dubai + Abu Dhabi regulators', ar: 'الجهات التنظيمية الاتحادية في الإمارات + دبي + أبوظبي' },
    angle: 66,
  },
  // Hospitals & care delivery (built)
  {
    id: 'component-mayo',
    label: { en: 'Mayo Clinic', ar: 'مايو كلينيك' },
    layer: 'components',
    category: 'built',
    description: { en: 'Integrated US health system; AI Lab and platform partnerships', ar: 'نظام صحي أمريكي متكامل؛ مختبر الذكاء الاصطناعي وشراكات المنصات' },
    angle: 90,
  },
  {
    id: 'component-nhs',
    label: { en: 'NHS Trusts', ar: 'مؤسسات NHS' },
    layer: 'components',
    category: 'built',
    description: { en: 'UK National Health Service — AI Lab, AI Diagnostic Fund', ar: 'هيئة الخدمات الصحية البريطانية — مختبر الذكاء الاصطناعي وصندوق التشخيص' },
    angle: 110,
  },
  {
    id: 'component-cleveland',
    label: { en: 'Cleveland Clinic', ar: 'كليفلاند كلينك' },
    layer: 'components',
    category: 'built',
    description: { en: 'US + Abu Dhabi presence — AI imaging and cardiology', ar: 'وجود في الولايات المتحدة + أبوظبي — التصوير وأمراض القلب بالذكاء الاصطناعي' },
    angle: 130,
  },
  {
    id: 'component-seha',
    label: { en: 'SEHA / M42', ar: 'صحة / M42' },
    layer: 'components',
    category: 'built',
    description: { en: 'Abu Dhabi Health Services + M42 health-tech umbrella', ar: 'خدمات الصحة في أبوظبي + مظلة M42 للتكنولوجيا الصحية' },
    angle: 150,
  },
  // Data infrastructure (data)
  {
    id: 'component-fhir',
    label: { en: 'HL7 / FHIR', ar: 'HL7 / FHIR' },
    layer: 'components',
    category: 'data',
    description: { en: 'Interoperability standard underpinning modern EHR APIs', ar: 'معيار التشغيل البيني الذي تعتمد عليه واجهات السجلات الصحية الحديثة' },
    angle: 170,
  },
  {
    id: 'component-allofus',
    label: { en: 'All of Us / UK Biobank', ar: 'All of Us / UK Biobank' },
    layer: 'components',
    category: 'data',
    description: { en: 'Population-scale longitudinal cohorts (NIH, UK)', ar: 'مجموعات سكانية طولية واسعة (NIH، المملكة المتحدة)' },
    angle: 190,
  },
  {
    id: 'component-nabidh',
    label: { en: 'NABIDH', ar: 'نبض' },
    layer: 'components',
    category: 'data',
    description: { en: 'Dubai health information exchange', ar: 'منصة تبادل المعلومات الصحية في دبي' },
    angle: 210,
  },
  // Research institutions (data)
  {
    id: 'component-research-labs',
    label: { en: 'Research Labs', ar: 'مختبرات البحث' },
    layer: 'components',
    category: 'data',
    description: { en: 'NIH, Stanford, MIT, MBZUAI, Crick, Karolinska, ETH Zurich', ar: 'NIH، ستانفورد، MIT، MBZUAI، Crick، Karolinska، ETH Zurich' },
    angle: 230,
  },
  // Founders & capital (financial)
  {
    id: 'component-startups',
    label: { en: 'Healthcare AI Startups', ar: 'الشركات الناشئة في الذكاء الاصطناعي الصحي' },
    layer: 'components',
    category: 'financial',
    description: { en: 'Tempus, Paige, HeartFlow, IDx, Cleerly, Aidoc, Lunit, and the long tail', ar: 'Tempus, Paige, HeartFlow, IDx, Cleerly, Aidoc, Lunit وغيرها الكثير' },
    angle: 252,
  },
  {
    id: 'component-investors',
    label: { en: 'VCs & Sovereign Capital', ar: 'رأس المال المخاطر والسيادي' },
    layer: 'components',
    category: 'financial',
    description: { en: 'a16z Bio, GV, Khosla Ventures, Mubadala, ADQ, Hub71+', ar: 'a16z Bio، GV، Khosla Ventures، مبادلة، ADQ، Hub71+' },
    angle: 274,
  },
  {
    id: 'component-pharma',
    label: { en: 'Pharma & MedTech', ar: 'الأدوية والتكنولوجيا الطبية' },
    layer: 'components',
    category: 'financial',
    description: { en: 'Pfizer, Roche, Novartis, J&J, Siemens Healthineers, GE HealthCare', ar: 'Pfizer, Roche, Novartis, J&J, Siemens Healthineers, GE HealthCare' },
    angle: 296,
  },
  // Cloud & compute (built)
  {
    id: 'component-cloud',
    label: { en: 'Cloud & Compute', ar: 'السحابة والحوسبة' },
    layer: 'components',
    category: 'built',
    description: { en: 'AWS, Azure, GCP — plus regional providers (G42, OVH, Alibaba)', ar: 'AWS، Azure، GCP — بالإضافة إلى المزودين الإقليميين (G42، OVH، Alibaba)' },
    angle: 318,
  },
  // Patients & professionals (human)
  {
    id: 'component-clinicians',
    label: { en: 'Clinicians', ar: 'الأطباء' },
    layer: 'components',
    category: 'human',
    description: { en: 'Physicians, nurses, allied health — the deployment surface', ar: 'الأطباء والممرضون والمهنيون الصحيون — سطح النشر' },
    angle: 340,
  },
  {
    id: 'component-patients',
    label: { en: 'Patients & Communities', ar: 'المرضى والمجتمعات' },
    layer: 'components',
    category: 'social',
    description: { en: 'End-users, advocacy groups, patient registries', ar: 'المستخدمون النهائيون، مجموعات المناصرة، سجلات المرضى' },
    angle: 12,
  },
];

export function getNodesByLayer(layer: SystemLayer): SystemMapNode[] {
  return systemNodes.filter((n) => n.layer === layer);
}

export function getNodesByCategory(category: SystemNodeCategory): SystemMapNode[] {
  return systemNodes.filter((n) => n.category === category);
}
