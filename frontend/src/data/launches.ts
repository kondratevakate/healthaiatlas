export interface Launch {
  id: string;
  name: string;
  tagline: string;
  description: string;
  topics: string[];
  logo: string;
  launchDate: Date;
  website?: string;
  sourceUrl?: string;
  whyItMatters?: string;
  curatedDate: string;
}

export const launches: Launch[] = [
  {
    id: 'g42-healthcare',
    name: 'G42 Healthcare',
    tagline: 'AI-powered precision medicine and genomics platform for population health',
    description: 'Developing precision medicine solutions, genomics sequencing, and population health initiatives across the UAE.',
    topics: ['Genomics', 'Diagnostics', 'Drug Discovery'],
    logo: '🧬',
    launchDate: new Date('2026-02-10'),
    website: 'https://g42healthcare.ai',
    sourceUrl: 'https://g42.ai/news',
    whyItMatters: 'Built the Arab Reference Genome — a first for the region, processing 500K+ genomes.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'pulse-ai',
    name: 'Pulse AI',
    tagline: 'Early disease detection through medical imaging analysis',
    description: 'AI startup specializing in medical imaging analysis and early disease detection algorithms for UAE hospitals.',
    topics: ['Medical Imaging', 'Diagnostics', 'Deep Learning'],
    logo: '🫀',
    launchDate: new Date('2026-02-09'),
    whyItMatters: 'Demonstrates local AI talent building clinical-grade imaging tools for regional hospitals.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'botim-health',
    name: 'Botim Health by Astra Tech',
    tagline: 'Telemedicine super-app with AI triage and mental health support',
    description: 'Health-tech platform integrating telemedicine, AI-powered triage, and mental health features into the Botim super-app.',
    topics: ['Telemedicine', 'Mental Health', 'AI Triage'],
    logo: '📱',
    launchDate: new Date('2026-02-08'),
    website: 'https://astra.tech',
    sourceUrl: 'https://astra.tech/news',
    whyItMatters: 'Over 2M consultations — largest UAE-based super-app integrating health services.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'nabidh-platform',
    name: 'NABIDH Health Exchange',
    tagline: 'Unified health information exchange connecting all Dubai providers',
    description: "Dubai Health Authority's platform connecting all healthcare providers for seamless patient data exchange.",
    topics: ['Health Records', 'Interoperability', 'Data Exchange'],
    logo: '🏥',
    launchDate: new Date('2026-02-07'),
    website: 'https://www.dha.gov.ae/nabidh',
    sourceUrl: 'https://www.dha.gov.ae/en/nabidh',
    whyItMatters: 'Government-mandated HIE — all Dubai providers must connect, setting the interoperability standard.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'mbzuai-health-lab',
    name: 'MBZUAI Health AI Lab',
    tagline: 'Graduate research lab pushing boundaries in healthcare AI',
    description: "World's first AI university running cutting-edge healthcare research in medical imaging and drug discovery.",
    topics: ['Research', 'Medical Imaging', 'Drug Discovery'],
    logo: '🎓',
    launchDate: new Date('2026-02-06'),
    website: 'https://mbzuai.ac.ae',
    sourceUrl: 'https://mbzuai.ac.ae/research',
    whyItMatters: 'World-first AI-focused university with active healthcare research publications.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'medcare-ai',
    name: 'Medcare AI Diagnostics',
    tagline: 'AI-powered diagnostic tools across hospital network',
    description: 'Network of hospitals implementing AI-powered diagnostic tools and telemedicine services in Dubai.',
    topics: ['Clinical AI', 'Diagnostics', 'Telemedicine'],
    logo: '🔬',
    launchDate: new Date('2026-02-05'),
    website: 'https://www.medcare.ae',
    whyItMatters: 'Private hospital group adopting AI diagnostics at scale across multiple facilities.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'ccad-surgical-ai',
    name: 'Cleveland Clinic AD — Surgical Robotics',
    tagline: 'AI-guided robotic surgery with 30% faster recovery',
    description: 'Multi-specialty hospital using AI for diagnostics and surgical robotics as part of Cleveland Clinic global network.',
    topics: ['Surgical Robotics', 'Patient Outcomes', 'AI Guidance'],
    logo: '🤖',
    launchDate: new Date('2026-02-04'),
    website: 'https://www.clevelandclinicabudhabi.ae',
    sourceUrl: 'https://www.clevelandclinicabudhabi.ae/en/news',
    whyItMatters: '500+ robotic procedures completed — largest robotic surgery program in Abu Dhabi.',
    curatedDate: '2026-02-24',
  },
  {
    id: 'genome-program',
    name: 'Abu Dhabi Genome Program',
    tagline: 'Population-scale genomics for personalized medicine',
    description: 'National initiative sequencing the genomes of UAE nationals to enable personalized medicine and rare disease detection.',
    topics: ['Population Genomics', 'Rare Diseases', 'Personalized Medicine'],
    logo: '🧪',
    launchDate: new Date('2026-02-03'),
    sourceUrl: 'https://www.doh.gov.ae',
    whyItMatters: 'Targeting 1M genomes by 2028 — most ambitious genomics project in the Middle East.',
    curatedDate: '2026-02-24',
  },
];
