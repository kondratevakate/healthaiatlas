import { ResearchDomain } from '@/types';

export const domains: ResearchDomain[] = [
  {
    id: 'overview',
    name: { en: 'Overview', ar: 'نظرة عامة' },
    subtitle: { en: 'Full UAE AI Health ecosystem', ar: 'منظومة الذكاء الاصطناعي الصحي الكاملة في الإمارات' },
    color: 'var(--primary)',
    playerIds: [], // empty = show all
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
];

export function getDomainById(id: string) {
  return domains.find(d => d.id === id);
}
