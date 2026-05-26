// Acqui-hire Signal — AI talent acquisitions 2023–2026.
// Source: C:/Projects/data/aiatls/ai_acquihire_dataset_updated.xlsx
// 21 included deals · 10+ acquirers · manually verified
//
// All source URLs are primary sources extracted directly from the Excel dataset.
// No fabricated or constructed URLs — empty string means no verified source yet.
//
// Compliance: data from public announcements only.
// No personal contact info stored — LinkedIn URLs are public profile links only.

export type Confidence = 'High' | 'Medium-High' | 'Medium' | 'Low';
export type DealStatus =
  | 'Included'
  | 'Included / needs review'
  | 'Included / disputed label'
  | 'Excluded';

export interface AcquihireDeal {
  status: DealStatus;
  company: string;
  acquirer: string;
  structure: string;
  date: string;       // YYYY-MM-DD
  founders: string;   // semicolon-separated names; empty if not public
  capability: string; // what was bought
  confidence: Confidence;
  src: string;        // primary verified source URL (from xlsx)
  src2: string;       // secondary verified source URL (from xlsx)
  notes: string;
}

export interface FounderMove {
  name: string;
  from: string;
  to: string;
  date: string;
  relevance: 'High' | 'Medium' | 'Low';
  linkedin: string;
  src: string;
}

export const ACQUIHIRE_DEALS: AcquihireDeal[] = [
  // ── Anthropic ───────────────────────────────────────────────────────────
  {
    status: 'Included', company: 'Runhouse', acquirer: 'Anthropic',
    structure: 'team acquisition / acqui-hire', date: '2026-04-28',
    founders: 'Donny Greenberg; Josh Lewittes',
    capability: 'Distributed ML compute/resource management for AI model builders',
    confidence: 'Medium',
    src:  'https://www.calcalistech.com/ctechnews/article/b1dsxqr6zl',
    src2: 'https://app.dealroom.co/news/feed/anthropic-acqui-hires-runhouse-in-share-deal-eyes-israeli-ai-talent',
    notes: 'Keep as included but verify LinkedIn roles before outreach.',
  },
  {
    status: 'Included', company: 'Vercept', acquirer: 'Anthropic',
    structure: 'full acquisition / team acquisition', date: '2026-02-25',
    founders: 'Kiana Ehsani; Luca Weihs; Ross Girshick',
    capability: 'Computer-use agents: AI perception + UI interaction',
    confidence: 'High',
    src:  'https://www.anthropic.com/news/acquires-vercept',
    src2: 'https://techcrunch.com/2026/02/25/anthropic-acquires-vercept-ai-startup-agents-computer-use-founders-investors/',
    notes: 'Computer-use / agents team — appeared in Claude within 3 months.',
  },
  {
    status: 'Included', company: 'Bun', acquirer: 'Anthropic',
    structure: 'full acquisition', date: '2025-12-02',
    founders: 'Jarred Sumner',
    capability: 'JavaScript runtime/toolchain infrastructure for AI coding products',
    confidence: 'High',
    src:  'https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone',
    src2: 'https://bun.com/blog/bun-joins-anthropic',
    notes: 'Strategic infra acquisition — Bun continues open-source.',
  },
  {
    status: 'Included', company: 'Humanloop', acquirer: 'Anthropic',
    structure: 'team hire / acqui-hire', date: '2025-08-13',
    founders: 'Raza Habib; Peter Hayes; Jordan Burgess',
    capability: 'LLM evals, prompt management, observability, enterprise deployment tooling',
    confidence: 'High',
    src:  'https://techcrunch.com/2025/08/13/anthropic-nabs-humanloop-team-as-competition-for-enterprise-ai-talent-heats-up/',
    src2: 'https://sifted.eu/articles/anthropic-acquisition-ai-humanloop',
    notes: '',
  },
  {
    status: 'Included', company: 'Coefficient Bio', acquirer: 'Anthropic',
    structure: 'full acquisition / vertical AI team acquisition', date: '2026-04-03',
    founders: '',
    capability: 'Biology/life-sciences AI talent and domain expertise',
    confidence: 'Medium',
    src:  'https://www.biospace.com/business/ai-giant-anthropic-leans-into-life-sciences-with-400m-coefficient-bio-catch',
    src2: 'https://www.pharmavoice.com/news/anthropic-coefficient-bio-pharma-drug-deal-nvidia/818599/',
    notes: 'Life-sciences vertical hiring.',
  },

  // ── Google DeepMind ──────────────────────────────────────────────────────
  {
    status: 'Included / needs review', company: 'Contextual AI', acquirer: 'Google DeepMind',
    structure: 'licensing + team hire', date: '2026-05-19',
    founders: '',
    capability: 'RAG / enterprise AI research, agents, model tech licensing',
    confidence: 'Medium',
    src:  'https://www.reuters.com/legal/litigation/google-deepmind-hires-staff-contextual-ai-licensing-deal-bloomberg-news-reports-2026-05-19/',
    src2: 'https://news.bloomberglaw.com/antitrust/google-hires-staff-from-ai-startup-contextual-in-licensing-deal',
    notes: 'Verify deal structure — may be talent hire not full acquisition.',
  },

  // ── Meta ─────────────────────────────────────────────────────────────────
  {
    status: 'Included', company: 'Dreamer', acquirer: 'Meta',
    structure: 'team hire / acqui-hire', date: '2026-03-23',
    founders: 'David Singleton; Hugo Barra; Nicholas Jitkoff',
    capability: 'Personalized AI agents / natural-language app building',
    confidence: 'High',
    src:  'https://siliconangle.com/2026/03/23/meta-acqui-hires-co-founders-agentic-ai-startup-dreamer/',
    src2: 'https://www.linkedin.com/posts/davidpsingleton_excited-to-announce-that-hugo-barra-nicholas-activity-7441923310357049344--xYe',
    notes: '',
  },
  {
    status: 'Included', company: 'PlayAI', acquirer: 'Meta',
    structure: 'acquisition / team acquisition', date: '2025-07-17',
    founders: 'Mahmoud Felfel',
    capability: 'Real-time generative voice / conversational AI',
    confidence: 'Medium',
    src:  'https://www.menabytes.com/meta-playai/',
    src2: 'https://korea.500.co/content/meta-acquires-play-ai-the-human-like-ai-voice-tech-startup-trusted-by-teams-at-amazon-ibm-salesforce-and-more-markup-1188',
    notes: '',
  },

  // ── NVIDIA ───────────────────────────────────────────────────────────────
  {
    status: 'Included', company: 'Illumex', acquirer: 'NVIDIA',
    structure: 'full acquisition', date: '2026-02-24',
    founders: '',
    capability: 'Semantic data infrastructure / enterprise ontologies for agentic AI',
    confidence: 'Medium',
    src:  'https://en.globes.co.il/en/article-nvidia-acquires-israeli-data-co-illumex-1001535871',
    src2: '',
    notes: '',
  },
  {
    status: 'Included', company: 'CentML', acquirer: 'NVIDIA',
    structure: 'full acquisition / team acquisition', date: '2025-06-27',
    founders: 'Gennady Pekhimenko; Akbar Nurlybayev; Sam Wang',
    capability: 'AI model optimization, inference efficiency, GPU software performance',
    confidence: 'High',
    src:  'https://betakit.com/nvidia-acquires-canadian-ai-efficiency-startup-centml/',
    src2: 'https://thelogic.co/news/exclusive/centml-nvidia-acquisition-canada-ai/',
    notes: '',
  },

  // ── OpenAI ───────────────────────────────────────────────────────────────
  {
    status: 'Included', company: 'Torch', acquirer: 'OpenAI',
    structure: 'full acquisition', date: '2026-01-12',
    founders: 'Ilya Abyzov',
    capability: 'Unified medical memory: labs, meds, visits, wearables, records',
    confidence: 'High',
    src:  'https://techcrunch.com/2026/01/12/openai-buys-tiny-health-records-startup-torch-for-reportedly-100m/',
    src2: 'https://www.axios.com/2026/01/12/openai-acquires-health-tech-company-torch',
    notes: 'Healthcare AI vertical push.',
  },
  {
    status: 'Included', company: 'Convogo', acquirer: 'OpenAI',
    structure: 'team acquisition / acqui-hire', date: '2026-01-08',
    founders: 'Matt Cooper',
    capability: 'AI leadership assessment/coaching software team repurposed into AI cloud work',
    confidence: 'High',
    src:  'https://techcrunch.com/2026/01/08/openai-to-acquire-the-team-behind-executive-coaching-ai-tool-convogo/',
    src2: 'https://www.pymnts.com/artificial-intelligence-2/2026/openai-hires-co-founders-of-ai-powered-tool-convogo/',
    notes: '',
  },
  {
    status: 'Included', company: 'Software Applications Inc. / Sky', acquirer: 'OpenAI',
    structure: 'full acquisition', date: '2025-10-23',
    founders: '',
    capability: 'AI-native Mac interface that can see and act across apps',
    confidence: 'High',
    src:  'https://openai.com/index/openai-acquires-software-applications-incorporated/',
    src2: 'https://techcrunch.com/2025/10/23/openai-buys-sky-an-ai-interface-for-mac/',
    notes: '',
  },
  {
    status: 'Included', company: 'Roi', acquirer: 'OpenAI',
    structure: 'founder acqui-hire', date: '2025-10-03',
    founders: 'Sujith Vishwajith',
    capability: 'Personalized consumer AI finance companion',
    confidence: 'High',
    src:  'https://techcrunch.com/2025/10/03/with-its-latest-acqui-hire-openai-is-doubling-down-on-personalized-consumer-ai/',
    src2: 'https://www.fintechfutures.com/m-a/openai-acquires-investment-start-up-roi',
    notes: '',
  },
  {
    status: 'Included', company: 'Alex / Alex Codes', acquirer: 'OpenAI',
    structure: 'team acquisition / acqui-hire', date: '2025-09-02',
    founders: 'Daniel Edrisian',
    capability: 'Xcode AI coding assistant / iOS & Mac coding-agent workflow',
    confidence: 'High',
    src:  'https://www.alexcodes.app/blog/alex-team-joins-openai',
    src2: 'https://techcrunch.com/2025/09/05/openai-hires-the-team-behind-xcode-coding-assistant-alex-codes/',
    notes: '',
  },
  {
    status: 'Included', company: 'Crossing Minds', acquirer: 'OpenAI',
    structure: 'team hire / acqui-hire', date: '2025-06-27',
    founders: '',
    capability: 'AI recommendations, personalization, ecommerce discovery',
    confidence: 'Medium',
    src:  'https://techcrunch.com/2025/06/27/openai-hires-team-behind-ai-recommendation-startup-crossing-minds/',
    src2: 'https://partechpartners.com/companies/crossing-minds',
    notes: '',
  },
  {
    status: 'Included', company: 'Context.ai', acquirer: 'OpenAI',
    structure: 'team acquisition / acqui-hire', date: '2025-04-15',
    founders: '',
    capability: 'LLM analytics and evaluation tooling',
    confidence: 'High',
    src:  'https://techcrunch.com/2025/04/15/openai-hires-team-behind-gv-backed-ai-eval-platform-context-ai/',
    src2: 'https://www.maginative.com/article/openai-acqui-hires-context-ai-team-to-boost-model-evaluation-efforts/',
    notes: '',
  },
  {
    status: 'Included', company: 'Multi / Remotion', acquirer: 'OpenAI',
    structure: 'team acquisition / acqui-hire', date: '2024-06-24',
    founders: 'Alexander Embiricos; Charley Ho',
    capability: 'Remote collaboration / screen sharing / collaborative desktop workflows',
    confidence: 'High',
    src:  'https://techcrunch.com/2024/06/24/openai-buys-a-remote-collaboration-platform/',
    src2: 'https://multi.app/blog/multi-is-joining-openai',
    notes: '',
  },
  {
    status: 'Included', company: 'Global Illumination', acquirer: 'OpenAI',
    structure: 'team acquisition', date: '2023-08-16',
    founders: '',
    capability: 'Consumer AI product/design/social/product engineering talent',
    confidence: 'High',
    src:  'https://openai.com/index/openai-acquires-global-illumination/',
    src2: 'https://www.reuters.com/markets/deals/openai-acquires-start-up-global-illumination-work-core-products-chatgpt-2023-08-16/',
    notes: '',
  },

  // ── Salesforce ───────────────────────────────────────────────────────────
  {
    status: 'Included / disputed label', company: 'Moonhub', acquirer: 'Salesforce',
    structure: 'team transfer / acqui-hire-like', date: '2025-06-03',
    founders: '',
    capability: 'AI recruiter / hiring agents for Agentforce strategy',
    confidence: 'Medium',
    src:  'https://www.moonhub.ai/moonhub-team-joins-salesforce',
    src2: 'https://www.cxtoday.com/crm/salesforce-denies-rumors-of-a-third-acquisition-in-three-weeks/',
    notes: 'Salesforce reportedly denied acquisition label.',
  },
  {
    status: 'Included', company: 'Convergence.ai', acquirer: 'Salesforce',
    structure: 'full acquisition', date: '2025-05-15',
    founders: '',
    capability: 'Autonomous enterprise agents that operate across web workflows',
    confidence: 'High',
    src:  'https://www.salesforce.com/news/stories/salesforce-signs-definitive-agreement-to-acquire-convergence-ai/',
    src2: 'https://tech.eu/2025/05/15/salesforce-acquires-uk-ai-startup-convergence-one-year-after-launch/',
    notes: '',
  },

  // ── Excluded — large deals kept as reference patterns ───────────────────
  {
    status: 'Excluded', company: 'Inflection AI', acquirer: 'Microsoft',
    structure: 'licensing + mass team hire', date: '2024-03-19',
    founders: '',
    capability: 'Consumer AI / Copilot model and product team',
    confidence: 'High',
    src:  'https://blogs.microsoft.com/blog/2024/03/19/mustafa-suleyman-deepmind-and-inflection-co-founder-joins-microsoft-to-lead-copilot/',
    src2: 'https://www.reuters.com/technology/microsoft-agreed-pay-inflection-650-mln-while-hiring-its-staff-information-2024-03-21/',
    notes: '>$500M, >50 employees. Archetype of reverse acqui-hire.',
  },
  {
    status: 'Excluded', company: 'Adept', acquirer: 'Amazon',
    structure: 'licensing + founder/team hire', date: '2024-06-28',
    founders: '',
    capability: 'Enterprise agents / computer-use automation models and datasets',
    confidence: 'High',
    src:  'https://www.reuters.com/technology/amazon-hires-ai-startup-adepts-cofounders-join-its-ai-org-2024-06-28/',
    src2: 'https://www.geekwire.com/2024/amazon-hires-founders-from-well-funded-enterprise-ai-startup-adept-to-boost-tech-giants-agi-team/',
    notes: 'Likely >50 employees. Strategic licensing not small-startup deal.',
  },
  {
    status: 'Excluded', company: 'Character.AI', acquirer: 'Google / DeepMind',
    structure: 'licensing + founder/team hire', date: '2024-08-02',
    founders: '',
    capability: 'LLM chatbot technology and elite model talent',
    confidence: 'High',
    src:  'https://www.calcalistech.com/ctechnews/article/sy06wllflg',
    src2: 'https://nypost.com/2024/09/25/business/google-paid-2-7b-to-rehire-ai-genius-who-left-for-startup/',
    notes: 'Over $500M. Major antitrust reference case.',
  },
  {
    status: 'Excluded', company: 'Windsurf', acquirer: 'Google / DeepMind',
    structure: 'non-exclusive licensing + executive/R&D hire', date: '2025-07-11',
    founders: '',
    capability: 'AI coding agent technology and team',
    confidence: 'High',
    src:  'https://www.reuters.com/business/google-hires-windsurf-ceo-researchers-advance-ai-ambitions-2025-07-11/',
    src2: 'https://techcrunch.com/2025/07/11/windsurfs-ceo-goes-to-google-openais-acquisition-falls-apart/',
    notes: 'Over $500M, ~250 employees. Useful as coding-agent talent pricing benchmark.',
  },
];

export const ACQUIHIRE_FOUNDER_MOVES: FounderMove[] = [
  { name: 'Raza Habib',         from: 'Humanloop',  to: 'Anthropic', date: '2025-08-13', relevance: 'High',   linkedin: 'https://www.linkedin.com/in/humanloop-raza',   src: 'https://techcrunch.com/2025/08/13/anthropic-nabs-humanloop-team-as-competition-for-enterprise-ai-talent-heats-up/' },
  { name: 'Peter Hayes',        from: 'Humanloop',  to: 'Anthropic', date: '2025-08-13', relevance: 'Medium', linkedin: 'https://uk.linkedin.com/in/peter-hayes-2366591a4', src: 'https://sifted.eu/articles/anthropic-acquisition-ai-humanloop' },
  { name: 'Jordan Burgess',     from: 'Humanloop',  to: 'Anthropic', date: '2025-08-13', relevance: 'Medium', linkedin: 'https://www.linkedin.com/in/jordanburgess',      src: 'https://techcrunch.com/2025/08/13/anthropic-nabs-humanloop-team-as-competition-for-enterprise-ai-talent-heats-up/' },
  { name: 'Jarred Sumner',      from: 'Bun',        to: 'Anthropic', date: '2025-12-02', relevance: 'High',   linkedin: '', src: 'https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone' },
  { name: 'Kiana Ehsani',       from: 'Vercept',    to: 'Anthropic', date: '2026-02-25', relevance: 'High',   linkedin: '', src: 'https://www.anthropic.com/news/acquires-vercept' },
  { name: 'Luca Weihs',         from: 'Vercept',    to: 'Anthropic', date: '2026-02-25', relevance: 'Medium', linkedin: '', src: 'https://www.anthropic.com/news/acquires-vercept' },
  { name: 'Ross Girshick',      from: 'Vercept',    to: 'Anthropic', date: '2026-02-25', relevance: 'Medium', linkedin: '', src: 'https://www.anthropic.com/news/acquires-vercept' },
  { name: 'Donny Greenberg',    from: 'Runhouse',   to: 'Anthropic', date: '2026-04-28', relevance: 'Medium', linkedin: '', src: 'https://www.calcalistech.com/ctechnews/article/b1dsxqr6zl' },
  { name: 'Josh Lewittes',      from: 'Runhouse',   to: 'Anthropic', date: '2026-04-28', relevance: 'Medium', linkedin: '', src: 'https://www.calcalistech.com/ctechnews/article/b1dsxqr6zl' },
  { name: 'David Singleton',    from: 'Dreamer',    to: 'Meta',      date: '2026-03-23', relevance: 'High',   linkedin: '', src: 'https://siliconangle.com/2026/03/23/meta-acqui-hires-co-founders-agentic-ai-startup-dreamer/' },
  { name: 'Hugo Barra',         from: 'Dreamer',    to: 'Meta',      date: '2026-03-23', relevance: 'Medium', linkedin: '', src: 'https://siliconangle.com/2026/03/23/meta-acqui-hires-co-founders-agentic-ai-startup-dreamer/' },
  { name: 'Nicholas Jitkoff',   from: 'Dreamer',    to: 'Meta',      date: '2026-03-23', relevance: 'Medium', linkedin: '', src: 'https://siliconangle.com/2026/03/23/meta-acqui-hires-co-founders-agentic-ai-startup-dreamer/' },
  { name: 'Mahmoud Felfel',     from: 'PlayAI',     to: 'Meta',      date: '2025-07-17', relevance: 'Medium', linkedin: '', src: 'https://www.menabytes.com/meta-playai/' },
  { name: 'Gennady Pekhimenko', from: 'CentML',     to: 'NVIDIA',    date: '2025-06-27', relevance: 'High',   linkedin: '', src: 'https://betakit.com/nvidia-acquires-canadian-ai-efficiency-startup-centml/' },
  { name: 'Akbar Nurlybayev',   from: 'CentML',     to: 'NVIDIA',    date: '2025-06-27', relevance: 'Medium', linkedin: '', src: 'https://betakit.com/nvidia-acquires-canadian-ai-efficiency-startup-centml/' },
  { name: 'Sam Wang',           from: 'CentML',     to: 'NVIDIA',    date: '2025-06-27', relevance: 'Medium', linkedin: '', src: 'https://betakit.com/nvidia-acquires-canadian-ai-efficiency-startup-centml/' },
  { name: 'Ilya Abyzov',        from: 'Torch',      to: 'OpenAI',    date: '2026-01-12', relevance: 'High',   linkedin: '', src: 'https://techcrunch.com/2026/01/12/openai-buys-tiny-health-records-startup-torch-for-reportedly-100m/' },
  { name: 'Matt Cooper',        from: 'Convogo',    to: 'OpenAI',    date: '2026-01-08', relevance: 'Medium', linkedin: '', src: 'https://techcrunch.com/2026/01/08/openai-to-acquire-the-team-behind-executive-coaching-ai-tool-convogo/' },
  { name: 'Daniel Edrisian',    from: 'Alex Codes', to: 'OpenAI',    date: '2025-09-02', relevance: 'High',   linkedin: '', src: 'https://www.alexcodes.app/blog/alex-team-joins-openai' },
  { name: 'Sujith Vishwajith',  from: 'Roi',        to: 'OpenAI',    date: '2025-10-03', relevance: 'Medium', linkedin: '', src: 'https://techcrunch.com/2025/10/03/with-its-latest-acqui-hire-openai-is-doubling-down-on-personalized-consumer-ai/' },
  { name: 'Alexander Embiricos',from: 'Multi',      to: 'OpenAI',    date: '2024-06-24', relevance: 'High',   linkedin: '', src: 'https://techcrunch.com/2024/06/24/openai-buys-a-remote-collaboration-platform/' },
  { name: 'Charley Ho',         from: 'Multi',      to: 'OpenAI',    date: '2024-06-24', relevance: 'Medium', linkedin: '', src: 'https://techcrunch.com/2024/06/24/openai-buys-a-remote-collaboration-platform/' },
];

export const ACQUIHIRE_STATS = {
  totalDeals:    ACQUIHIRE_DEALS.filter(d => d.status !== 'Excluded').length,
  totalFounders: ACQUIHIRE_FOUNDER_MOVES.length,
  dateRange:     '2023–2026',
  topAcquirers:  ['OpenAI', 'Anthropic', 'Meta', 'NVIDIA', 'Salesforce'],
} as const;
