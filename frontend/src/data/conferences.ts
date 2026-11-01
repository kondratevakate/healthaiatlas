import { Conference } from '@/types';

// ── Data-integrity rule (2026-11-01) ────────────────────────────────────────
// Every entry here must be traceable to a public source (`sourceUrl`).
// On 2026-11-01 an audit found 3 of the 4 previous entries had NO public trace
// (AI in Medicine Summit UAE, Digital Health Implementation Workshop, Hub71
// HealthTech Demo Day) — they were removed rather than published unverified.
// Sponsors follow the same rule: recorded only when a source confirms them.
// An event with no confirmed sponsor list carries NO `sponsors` field.

export const conferences: Conference[] = [
  {
    id: 'gitex-global-2026',
    name: {
      en: 'GITEX GLOBAL 2026',
      ar: 'جايتكس جلوبال 2026'
    },
    date: '2026-12-07',
    endDate: '2026-12-11',
    location: 'Dubai World Trade Centre (Summit, 7 Dec) + Dubai Exhibition Centre, Expo City (Expo, 8–11 Dec), UAE',
    type: 'conference',
    topics: ['diagnostics', 'telemedicine', 'health-records'],
    website: 'https://www.gitex.com',
    sourceUrl: 'https://www.gitex.com/plan-your-visit-2026',
    description: {
      en: 'Health technology track at the largest tech event in the Middle East — summit day at DWTC, expo at Expo City',
      ar: 'مسار التكنولوجيا الصحية في أكبر حدث تقني في الشرق الأوسط — يوم القمة في مركز دبي التجاري العالمي، والمعرض في إكسبو سيتي'
    },
    // Confirmed from gitex.com "Sponsors & Partners" (checked 2026-11-01).
    // No pharma/biotech/medtech corporate sponsor was found — health companies
    // appear as speakers, not sponsors.
    sponsors: [
      { name: 'Huawei', kind: 'tech' },
      { name: 'Snowflake', kind: 'tech' },
      { name: 'AMD', kind: 'tech' },
      { name: 'Oracle', kind: 'tech' },
      { name: 'Microsoft', kind: 'tech' },
      { name: 'NVIDIA', kind: 'tech' },
      { name: 'Kaspersky', kind: 'tech' },
      { name: 'Cohesity', kind: 'tech' },
      { name: 'G42', kind: 'tech' },
      { name: 'NinjaOne', kind: 'tech' },
      { name: 'Telnyx', kind: 'tech' },
      { name: 'Emirates', kind: 'other' },
      { name: 'RTA Dubai', kind: 'government' },
    ]
  },
  {
    id: 'whx-dubai-2027',
    name: {
      en: 'WHX Dubai 2027 (formerly Arab Health)',
      ar: 'معرض الصحة العالمي دبي 2027 (سابقاً أراب هيلث)'
    },
    date: '2027-01-25',
    endDate: '2027-01-28',
    location: 'Dubai Exhibition Centre, Expo City + Dubai World Trade Centre, UAE',
    type: 'conference',
    topics: ['diagnostics', 'health-records', 'patient-monitoring'],
    website: 'https://worldhealthexpo.com/events/healthcare/dubai/en',
    sourceUrl: 'https://worldhealthexpo.com/events/healthcare/dubai/en',
    description: {
      en: 'The largest healthcare exhibition in the region — 235,000+ visits across two venues, part of World Healthcare Week',
      ar: 'أكبر معرض صحي في المنطقة — أكثر من 235 ألف زيارة عبر موقعين، ضمن أسبوع الرعاية الصحية العالمي'
    }
  },
  {
    id: 'whx-tech-2027',
    name: {
      en: 'WHX Tech 2027',
      ar: 'دبليو إتش إكس تك 2027'
    },
    date: '2027-01-26',
    endDate: '2027-01-28',
    location: 'Dubai World Trade Centre (Shaikh Rashid Hall), UAE',
    type: 'conference',
    topics: ['diagnostics', 'telemedicine', 'health-records'],
    website: 'https://worldhealthexpo.com/events/healthcare/dubai/en',
    sourceUrl: 'https://prod65.arabhealthonline.com/en/media/press-releases/whx-tech-launch.html',
    description: {
      en: 'Digital health, AI and connected care — 5,000+ digital-health professionals and 200+ brands, co-located with WHX',
      ar: 'الصحة الرقمية والذكاء الاصطناعي والرعاية المتصلة — أكثر من 5000 متخصص وأكثر من 200 علامة تجارية، بالتزامن مع WHX'
    }
  },
  {
    id: 'ai-everything-abu-dhabi-2027',
    name: {
      en: 'Ai Everything Abu Dhabi 2027',
      ar: 'إيه آي إيفري ثينغ أبوظبي 2027'
    },
    date: '2027-05-11',
    endDate: '2027-05-12',
    location: 'ADNEC Centre, Abu Dhabi, UAE',
    type: 'conference',
    topics: ['diagnostics', 'drug-discovery', 'genomics'],
    website: 'https://aieverythingabudhabi.com',
    sourceUrl: 'https://aieverythingabudhabi.com/faqs',
    description: {
      en: 'The world’s largest AI-first expo and summit — policy, enterprise AI and health applications across industries',
      ar: 'أكبر معرض وقمة متخصصة بالذكاء الاصطناعي في العالم — السياسات، وتطبيقات المؤسسات، والاستخدامات الصحية'
    }
  },
  {
    id: 'future-health-summit-2026',
    name: {
      en: 'Abu Dhabi Future Health Summit 2026',
      ar: 'قمة أبوظبي لمستقبل الصحة 2026'
    },
    date: '2026-10-20',
    endDate: '2026-10-22',
    location: 'ADNEC Centre, Abu Dhabi, UAE',
    type: 'conference',
    topics: ['diagnostics', 'genomics', 'patient-monitoring'],
    website: 'https://futurehealthinitiative.ae/events/abu-dhabifuture-health-summit/',
    sourceUrl: 'https://futurehealthinitiative.ae/events/abu-dhabifuture-health-summit/',
    description: {
      en: 'Flagship of Future Health with the Department of Health – Abu Dhabi; 2026 theme “To Sense is to Predict” — longevity, precision medicine, digital health and AI',
      ar: 'الحدث الرئيسي لمبادرة مستقبل الصحة مع دائرة الصحة – أبوظبي؛ شعار 2026 «أن تشعر يعني أن تتوقع» — طول العمر، والطب الدقيق، والصحة الرقمية'
    },
    sponsors: [
      { name: 'Department of Health – Abu Dhabi', kind: 'government' },
    ]
  }
];
