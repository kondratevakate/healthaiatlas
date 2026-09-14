import { ResearchDomain } from '@/types';

export const domains: ResearchDomain[] = [
  {
    id: 'overview',
    name: { en: 'Overview', ar: 'نظرة عامة' },
    subtitle: { en: 'Full UAE AI Health ecosystem', ar: 'منظومة الذكاء الاصطناعي الصحي الكاملة في الإمارات' },
    color: 'var(--primary)',
    playerIds: [], // empty = show all
  },
  // Order below = display order in Directory chips and the Domains dropdown.
  // AI Frontiers in Life Sciences is the lead vertical: it's the most
  // research-active surface in the Atlas and the one founders most often
  // arrive looking for. Verticals after it run in narrowing scope:
  // oncology (one specialty) → process-mining (one operational layer) →
  // medical-tourism (one cross-border flow).
  {
    id: 'ai-life-sciences',
    name: { en: 'AI Frontiers in Life Sciences', ar: 'حدود الذكاء الاصطناعي في علوم الحياة' },
    subtitle: { en: 'Global landscape: drug discovery, structural biology, generative biology, omics', ar: 'المشهد العالمي: اكتشاف الأدوية، البيولوجيا الهيكلية، البيولوجيا التوليدية، علم العمليات' },
    color: '180 70% 40%',
    stats: [
      { label: 'Coverage', value: 'Global' },
    ],
    playerIds: [],
  },
  {
    id: 'oncology',
    name: { en: 'Oncology', ar: 'الأورام' },
    subtitle: { en: 'AI in cancer diagnosis, treatment & trials', ar: 'الذكاء الاصطناعي في تشخيص السرطان والعلاج والتجارب' },
    color: '0 60% 45%',
    stats: [
      { label: 'Focus Areas', value: 'Imaging, Genomics, Trials' },
    ],
    playerIds: ['g42-healthcare', 'seha', 'mbzuai'],
  },
  {
    id: 'process-mining',
    name: { en: 'Process Mining', ar: 'تعدين العمليات' },
    subtitle: { en: 'Deal flow, products, open landscape', ar: 'تدفق الصفقات والمنتجات والمشهد المفتوح' },
    color: '30 50% 45%',
    stats: [
      { label: 'Focus Areas', value: 'Data Exchange, EHR, Workflows' },
    ],
    playerIds: ['nabidh', 'seha', 'mohap'],
  },
  {
    id: 'medical-tourism',
    name: { en: 'Medical Tourism', ar: 'السياحة العلاجية' },
    subtitle: { en: 'Patient migration routes — sources, destinations, growth', ar: 'مسارات هجرة المرضى — المصادر والوجهات والنمو' },
    color: '200 40% 45%',
    stats: [
      { label: 'Focus Areas', value: 'Telemedicine, Diagnostics, Robotics' },
    ],
    playerIds: ['cleveland-clinic-ad', 'seha', 'medcare'],
  },
  // Biosecurity sits outside the clinical-AI scope chain above: a field map of
  // organisations working on catastrophic pandemic risk, sourced from the
  // Biosecurity World directory.
  {
    id: 'biosecurity',
    name: { en: 'Biosecurity', ar: 'الأمن البيولوجي' },
    subtitle: { en: 'Organisations working to prevent, detect and respond to catastrophic pandemics', ar: 'منظمات تعمل على منع الأوبئة الكارثية واكتشافها والاستجابة لها' },
    color: '160 45% 34%',
    stats: [
      { label: 'Coverage', value: 'Global' },
    ],
    playerIds: [],
  },
];

export function getDomainById(id: string) {
  return domains.find(d => d.id === id);
}
