import { SystemLayer, SystemNodeCategory, LocalizedString } from '@/types';

export interface SystemMapNode {
  id: string;
  label: LocalizedString;
  layer: SystemLayer;
  category: SystemNodeCategory;
  description: LocalizedString;
  angle: number; // degrees from top (0-360)
}

// Category configuration - MONOCHROME grays (coral accent on hover only)
export const categoryConfig: Record<SystemNodeCategory, { color: string; label: LocalizedString }> = {
  human: {
    color: 'hsl(0, 0%, 35%)',
    label: { en: 'Human', ar: 'بشري' }
  },
  social: {
    color: 'hsl(0, 0%, 40%)',
    label: { en: 'Social', ar: 'اجتماعي' }
  },
  cultural: {
    color: 'hsl(0, 0%, 45%)',
    label: { en: 'Cultural', ar: 'ثقافي' }
  },
  financial: {
    color: 'hsl(0, 0%, 50%)',
    label: { en: 'Financial', ar: 'مالي' }
  },
  built: {
    color: 'hsl(0, 0%, 55%)',
    label: { en: 'Built', ar: 'بنية تحتية' }
  },
  data: {
    color: 'hsl(0, 0%, 60%)',
    label: { en: 'Data', ar: 'بيانات' }
  },
  political: {
    color: 'hsl(0, 0%, 65%)',
    label: { en: 'Political', ar: 'سياسي' }
  },
  natural: {
    color: 'hsl(0, 0%, 70%)',
    label: { en: 'Natural', ar: 'طبيعي' }
  },
};

// Layer configuration
export const layerConfig: Record<SystemLayer, { radius: number; label: LocalizedString }> = {
  purpose: {
    radius: 0.15,
    label: { en: 'PURPOSE', ar: 'الهدف' }
  },
  impacts: {
    radius: 0.35,
    label: { en: 'IMPACTS', ar: 'التأثيرات' }
  },
  activities: {
    radius: 0.6,
    label: { en: 'ACTIVITIES', ar: 'الأنشطة' }
  },
  components: {
    radius: 0.85,
    label: { en: 'COMPONENTS', ar: 'المكونات' }
  },
};

// System map nodes for UAE Healthcare AI ecosystem
export const systemNodes: SystemMapNode[] = [
  // PURPOSE (center) - Core goals
  {
    id: 'purpose-health',
    label: { en: 'Improve Population Health', ar: 'تحسين صحة السكان' },
    layer: 'purpose',
    category: 'human',
    description: { en: 'Core goal of enhancing health outcomes for UAE residents', ar: 'الهدف الأساسي لتحسين النتائج الصحية لسكان الإمارات' },
    angle: 0
  },
  {
    id: 'purpose-access',
    label: { en: 'Universal Access', ar: 'وصول شامل' },
    layer: 'purpose',
    category: 'social',
    description: { en: 'Ensuring healthcare access for all', ar: 'ضمان الوصول للرعاية الصحية للجميع' },
    angle: 120
  },
  {
    id: 'purpose-innovation',
    label: { en: 'Lead in AI Innovation', ar: 'الريادة في الابتكار' },
    layer: 'purpose',
    category: 'data',
    description: { en: 'Position UAE as global AI healthcare leader', ar: 'وضع الإمارات كقائد عالمي في الذكاء الاصطناعي الصحي' },
    angle: 240
  },

  // IMPACTS - What happens
  {
    id: 'impact-diagnosis',
    label: { en: 'Faster Diagnosis', ar: 'تشخيص أسرع' },
    layer: 'impacts',
    category: 'human',
    description: { en: 'AI-powered faster and more accurate diagnosis', ar: 'تشخيص أسرع وأدق بالذكاء الاصطناعي' },
    angle: 0
  },
  {
    id: 'impact-cost',
    label: { en: 'Reduced Costs', ar: 'تخفيض التكاليف' },
    layer: 'impacts',
    category: 'financial',
    description: { en: 'Lower healthcare costs through efficiency', ar: 'تخفيض التكاليف من خلال الكفاءة' },
    angle: 45
  },
  {
    id: 'impact-research',
    label: { en: 'Accelerated Research', ar: 'تسريع البحث' },
    layer: 'impacts',
    category: 'data',
    description: { en: 'Faster medical discoveries through AI', ar: 'اكتشافات طبية أسرع بالذكاء الاصطناعي' },
    angle: 90
  },
  {
    id: 'impact-personalized',
    label: { en: 'Personalized Care', ar: 'رعاية شخصية' },
    layer: 'impacts',
    category: 'human',
    description: { en: 'Tailored treatments based on individual data', ar: 'علاجات مخصصة بناء على البيانات الفردية' },
    angle: 135
  },
  {
    id: 'impact-prevention',
    label: { en: 'Disease Prevention', ar: 'الوقاية من الأمراض' },
    layer: 'impacts',
    category: 'social',
    description: { en: 'Predictive analytics for early intervention', ar: 'تحليلات تنبؤية للتدخل المبكر' },
    angle: 180
  },
  {
    id: 'impact-workforce',
    label: { en: 'Enhanced Workforce', ar: 'تعزيز القوى العاملة' },
    layer: 'impacts',
    category: 'human',
    description: { en: 'AI augmenting healthcare professionals', ar: 'الذكاء الاصطناعي يعزز المهنيين الصحيين' },
    angle: 225
  },
  {
    id: 'impact-trust',
    label: { en: 'Public Trust', ar: 'الثقة العامة' },
    layer: 'impacts',
    category: 'cultural',
    description: { en: 'Building confidence in AI healthcare', ar: 'بناء الثقة في الرعاية الصحية بالذكاء الاصطناعي' },
    angle: 270
  },
  {
    id: 'impact-economy',
    label: { en: 'Economic Growth', ar: 'النمو الاقتصادي' },
    layer: 'impacts',
    category: 'financial',
    description: { en: 'Healthcare AI sector growth', ar: 'نمو قطاع الذكاء الاصطناعي الصحي' },
    angle: 315
  },

  // ACTIVITIES - What we do
  {
    id: 'activity-imaging',
    label: { en: 'Medical Imaging', ar: 'التصوير الطبي' },
    layer: 'activities',
    category: 'data',
    description: { en: 'AI-powered radiology and imaging analysis', ar: 'تحليل الأشعة والتصوير بالذكاء الاصطناعي' },
    angle: 0
  },
  {
    id: 'activity-genomics',
    label: { en: 'Genomics Analysis', ar: 'تحليل الجينوم' },
    layer: 'activities',
    category: 'data',
    description: { en: 'DNA sequencing and genetic analysis', ar: 'تسلسل الحمض النووي والتحليل الجيني' },
    angle: 30
  },
  {
    id: 'activity-telemedicine',
    label: { en: 'Telemedicine', ar: 'الطب عن بعد' },
    layer: 'activities',
    category: 'built',
    description: { en: 'Remote healthcare consultations', ar: 'الاستشارات الصحية عن بعد' },
    angle: 60
  },
  {
    id: 'activity-monitoring',
    label: { en: 'Patient Monitoring', ar: 'مراقبة المرضى' },
    layer: 'activities',
    category: 'human',
    description: { en: 'Continuous health tracking', ar: 'تتبع الصحة المستمر' },
    angle: 90
  },
  {
    id: 'activity-training',
    label: { en: 'AI Training', ar: 'تدريب الذكاء الاصطناعي' },
    layer: 'activities',
    category: 'data',
    description: { en: 'Model development and training', ar: 'تطوير وتدريب النماذج' },
    angle: 120
  },
  {
    id: 'activity-regulation',
    label: { en: 'Regulation', ar: 'التنظيم' },
    layer: 'activities',
    category: 'political',
    description: { en: 'Policy and compliance frameworks', ar: 'أطر السياسات والامتثال' },
    angle: 150
  },
  {
    id: 'activity-funding',
    label: { en: 'Investment', ar: 'الاستثمار' },
    layer: 'activities',
    category: 'financial',
    description: { en: 'Funding and grants for AI health', ar: 'التمويل والمنح للصحة بالذكاء الاصطناعي' },
    angle: 180
  },
  {
    id: 'activity-education',
    label: { en: 'Education', ar: 'التعليم' },
    layer: 'activities',
    category: 'cultural',
    description: { en: 'Training healthcare AI professionals', ar: 'تدريب المحترفين في الذكاء الاصطناعي الصحي' },
    angle: 210
  },
  {
    id: 'activity-trials',
    label: { en: 'Clinical Trials', ar: 'التجارب السريرية' },
    layer: 'activities',
    category: 'human',
    description: { en: 'AI-assisted clinical research', ar: 'البحث السريري بمساعدة الذكاء الاصطناعي' },
    angle: 240
  },
  {
    id: 'activity-records',
    label: { en: 'Health Records', ar: 'السجلات الصحية' },
    layer: 'activities',
    category: 'data',
    description: { en: 'Electronic health record systems', ar: 'أنظمة السجلات الصحية الإلكترونية' },
    angle: 270
  },
  {
    id: 'activity-robotics',
    label: { en: 'Surgical Robotics', ar: 'الروبوتات الجراحية' },
    layer: 'activities',
    category: 'built',
    description: { en: 'AI-assisted robotic surgery', ar: 'الجراحة الروبوتية بمساعدة الذكاء الاصطناعي' },
    angle: 300
  },
  {
    id: 'activity-partnerships',
    label: { en: 'Partnerships', ar: 'الشراكات' },
    layer: 'activities',
    category: 'social',
    description: { en: 'Cross-sector collaborations', ar: 'التعاون عبر القطاعات' },
    angle: 330
  },

  // COMPONENTS - Infrastructure and players
  {
    id: 'component-mohap',
    label: { en: 'MOHAP', ar: 'وزارة الصحة' },
    layer: 'components',
    category: 'political',
    description: { en: 'Ministry of Health and Prevention', ar: 'وزارة الصحة ووقاية المجتمع' },
    angle: 0
  },
  {
    id: 'component-doh',
    label: { en: 'DOH Abu Dhabi', ar: 'دائرة الصحة أبوظبي' },
    layer: 'components',
    category: 'political',
    description: { en: 'Department of Health Abu Dhabi', ar: 'دائرة الصحة في أبوظبي' },
    angle: 20
  },
  {
    id: 'component-dha',
    label: { en: 'DHA Dubai', ar: 'هيئة الصحة دبي' },
    layer: 'components',
    category: 'political',
    description: { en: 'Dubai Health Authority', ar: 'هيئة الصحة بدبي' },
    angle: 40
  },
  {
    id: 'component-seha',
    label: { en: 'SEHA', ar: 'صحة' },
    layer: 'components',
    category: 'built',
    description: { en: 'Abu Dhabi Health Services Company', ar: 'شركة أبوظبي للخدمات الصحية' },
    angle: 60
  },
  {
    id: 'component-cleveland',
    label: { en: 'Cleveland Clinic', ar: 'كليفلاند كلينك' },
    layer: 'components',
    category: 'built',
    description: { en: 'Cleveland Clinic Abu Dhabi', ar: 'كليفلاند كلينك أبوظبي' },
    angle: 80
  },
  {
    id: 'component-g42',
    label: { en: 'G42 Healthcare', ar: 'G42 الصحية' },
    layer: 'components',
    category: 'data',
    description: { en: 'AI and genomics company', ar: 'شركة الذكاء الاصطناعي والجينوميات' },
    angle: 100
  },
  {
    id: 'component-mbzuai',
    label: { en: 'MBZUAI', ar: 'جامعة محمد بن زايد' },
    layer: 'components',
    category: 'data',
    description: { en: 'AI research university', ar: 'جامعة بحث الذكاء الاصطناعي' },
    angle: 120
  },
  {
    id: 'component-nabidh',
    label: { en: 'NABIDH', ar: 'نبض' },
    layer: 'components',
    category: 'data',
    description: { en: 'Dubai health information exchange', ar: 'تبادل المعلومات الصحية في دبي' },
    angle: 140
  },
  {
    id: 'component-doctors',
    label: { en: 'Physicians', ar: 'الأطباء' },
    layer: 'components',
    category: 'human',
    description: { en: 'Healthcare professionals', ar: 'المهنيين الصحيين' },
    angle: 160
  },
  {
    id: 'component-nurses',
    label: { en: 'Nursing Staff', ar: 'التمريض' },
    layer: 'components',
    category: 'human',
    description: { en: 'Nursing and care workers', ar: 'العاملون في التمريض والرعاية' },
    angle: 180
  },
  {
    id: 'component-patients',
    label: { en: 'Patients', ar: 'المرضى' },
    layer: 'components',
    category: 'human',
    description: { en: 'Healthcare recipients', ar: 'متلقو الرعاية الصحية' },
    angle: 200
  },
  {
    id: 'component-startups',
    label: { en: 'AI Startups', ar: 'الشركات الناشئة' },
    layer: 'components',
    category: 'financial',
    description: { en: 'Health tech startups', ar: 'الشركات الناشئة للتقنية الصحية' },
    angle: 220
  },
  {
    id: 'component-investors',
    label: { en: 'Investors', ar: 'المستثمرون' },
    layer: 'components',
    category: 'financial',
    description: { en: 'Venture capital and funds', ar: 'رأس المال المخاطر والصناديق' },
    angle: 240
  },
  {
    id: 'component-pharma',
    label: { en: 'Pharma', ar: 'الأدوية' },
    layer: 'components',
    category: 'built',
    description: { en: 'Pharmaceutical companies', ar: 'شركات الأدوية' },
    angle: 260
  },
  {
    id: 'component-cloud',
    label: { en: 'Cloud Infrastructure', ar: 'البنية السحابية' },
    layer: 'components',
    category: 'built',
    description: { en: 'Data centers and cloud services', ar: 'مراكز البيانات والخدمات السحابية' },
    angle: 280
  },
  {
    id: 'component-insurance',
    label: { en: 'Insurance', ar: 'التأمين' },
    layer: 'components',
    category: 'financial',
    description: { en: 'Health insurance providers', ar: 'مقدمو التأمين الصحي' },
    angle: 300
  },
  {
    id: 'component-community',
    label: { en: 'Community', ar: 'المجتمع' },
    layer: 'components',
    category: 'social',
    description: { en: 'Local communities and NGOs', ar: 'المجتمعات المحلية والمنظمات غير الحكومية' },
    angle: 320
  },
  {
    id: 'component-media',
    label: { en: 'Media', ar: 'الإعلام' },
    layer: 'components',
    category: 'cultural',
    description: { en: 'Health communication channels', ar: 'قنوات الاتصال الصحي' },
    angle: 340
  },
];

// Get nodes by layer
export function getNodesByLayer(layer: SystemLayer): SystemMapNode[] {
  return systemNodes.filter(node => node.layer === layer);
}

// Get nodes by category
export function getNodesByCategory(category: SystemNodeCategory): SystemMapNode[] {
  return systemNodes.filter(node => node.category === category);
}
