// Revenue data for AI Life Sciences companies.
// Generated from scripts/zerotrust/revenue_research_clean.csv — DO NOT EDIT BY HAND.
//
// scope: "product" = AI product / platform revenue (counts toward cluster Revenue signal)
//         "company" = total company revenue — AI is a component, not the whole business
//           (big pharma, Intuitive Surgical, OpenAI/Anthropic as general AI platforms)

export interface LSRevenue {
  slug: string; name: string; year: number; revenue_m: number;
  unit: "usd_m" | "arr_usd_m"; confidence: "high" | "medium" | "low";
  scope: "product" | "company";
}

export const LS_REVENUE: LSRevenue[] = [
  { slug: 'abridge', name: 'Abridge', year: 2025, revenue_m: 117.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'absci', name: 'Absci', year: 2024, revenue_m: 4.5, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'aidoc', name: 'Aidoc', year: 2024, revenue_m: 120.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'ambience-healthcare', name: 'Ambience Healthcare', year: 2025, revenue_m: 30.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'anthropic', name: 'Anthropic', year: 2025, revenue_m: 9000.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'company' },
  { slug: 'assort-health', name: 'Assort Health', year: 2025, revenue_m: 3.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'astrazeneca', name: 'AstraZeneca', year: 2025, revenue_m: 58700.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'atomwise', name: 'Atomwise', year: 2024, revenue_m: 15.0, unit: 'usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'benevolentai', name: 'BenevolentAI', year: 2024, revenue_m: 7.0, unit: 'usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'caris-life-sciences', name: 'Caris Life Sciences', year: 2024, revenue_m: 412.3, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'chai-discovery', name: 'Chai Discovery', year: 2024, revenue_m: 10.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'codametrix', name: 'CodaMetrix', year: 2024, revenue_m: 30.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'cohere-health', name: 'Cohere Health', year: 2024, revenue_m: 100.0, unit: 'usd_m', confidence: 'low', scope: 'product' },
  { slug: 'commure', name: 'Commure', year: 2025, revenue_m: 200.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'cradle', name: 'Cradle', year: 2024, revenue_m: 12.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'culture-biosciences', name: 'Culture Biosciences', year: 2024, revenue_m: 3.0, unit: 'usd_m', confidence: 'low', scope: 'product' },
  { slug: 'eikon-therapeutics', name: 'Eikon Therapeutics', year: 2024, revenue_m: 25.0, unit: 'usd_m', confidence: 'low', scope: 'product' },
  { slug: 'eli-lilly', name: 'Eli Lilly', year: 2025, revenue_m: 65179.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'epic-systems', name: 'Epic Systems', year: 2024, revenue_m: 5700.0, unit: 'usd_m', confidence: 'medium', scope: 'company' },
  { slug: 'evolutionaryscale', name: 'EvolutionaryScale', year: 2024, revenue_m: 20.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'exscientia', name: 'Exscientia', year: 2024, revenue_m: 20.0, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'formation-bio', name: 'Formation Bio', year: 2024, revenue_m: 50.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'generate-biomedicines', name: 'Generate Biomedicines', year: 2023, revenue_m: 50.0, unit: 'usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'genesis-therapeutics', name: 'Genesis Therapeutics', year: 2024, revenue_m: 35.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'ginkgo-bioworks', name: 'Ginkgo Bioworks', year: 2024, revenue_m: 227.04, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'glass-health', name: 'Glass Health', year: 2024, revenue_m: 5.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'heartflow', name: 'Heartflow', year: 2024, revenue_m: 125.8, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'heidi-health', name: 'Heidi Health', year: 2025, revenue_m: 21.9, unit: 'arr_usd_m', confidence: 'low', scope: 'product' },
  { slug: 'hippocratic-ai', name: 'Hippocratic AI', year: 2024, revenue_m: 20.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'iambic-therapeutics', name: 'Iambic Therapeutics', year: 2024, revenue_m: 8.0, unit: 'usd_m', confidence: 'low', scope: 'product' },
  { slug: 'innovaccer', name: 'Innovaccer', year: 2025, revenue_m: 250.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'insilico-medicine', name: 'Insilico Medicine', year: 2024, revenue_m: 85.8, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'insitro', name: 'insitro', year: 2024, revenue_m: 30.0, unit: 'usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'intuitive-surgical', name: 'Intuitive Surgical', year: 2025, revenue_m: 10064.7, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'lila-sciences', name: 'Lila Sciences', year: 2024, revenue_m: 50.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'lumexa-imaging', name: 'Lumexa Imaging', year: 2025, revenue_m: 1000.0, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'lunit', name: 'Lunit', year: 2024, revenue_m: 37.2, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'medra', name: 'Medra', year: 2024, revenue_m: 3.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'microsoft-dragon-copilot', name: 'Microsoft Dragon Copilot', year: 2024, revenue_m: 500.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'company' },
  { slug: 'nabla', name: 'Nabla', year: 2025, revenue_m: 27.8, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'novartis', name: 'Novartis', year: 2025, revenue_m: 54500.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'nvidia', name: 'NVIDIA', year: 2026, revenue_m: 215900.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'openai', name: 'OpenAI', year: 2025, revenue_m: 20000.0, unit: 'arr_usd_m', confidence: 'high', scope: 'company' },
  { slug: 'openevidence', name: 'OpenEvidence', year: 2025, revenue_m: 150.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'owkin', name: 'Owkin', year: 2024, revenue_m: 30.0, unit: 'usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'pathai', name: 'PathAI', year: 2024, revenue_m: 60.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'pathos-ai', name: 'Pathos AI', year: 2024, revenue_m: 40.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'pfizer', name: 'Pfizer', year: 2025, revenue_m: 62600.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'precision-neuroscience', name: 'Precision Neuroscience', year: 2024, revenue_m: 8.0, unit: 'usd_m', confidence: 'low', scope: 'product' },
  { slug: 'profluent-bio', name: 'Profluent Bio', year: 2024, revenue_m: 15.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'qventus', name: 'Qventus', year: 2024, revenue_m: 80.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'recursion-pharmaceuticals', name: 'Recursion Pharmaceuticals', year: 2024, revenue_m: 58.8, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'roche', name: 'Roche', year: 2025, revenue_m: 67200.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'sophia-genetics', name: 'SOPHiA GENETICS', year: 2024, revenue_m: 65.17, unit: 'usd_m', confidence: 'high', scope: 'product' },
  { slug: 'suki-ai', name: 'Suki AI', year: 2024, revenue_m: 50.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'synchron', name: 'Synchron', year: 2024, revenue_m: 5.0, unit: 'usd_m', confidence: 'low', scope: 'product' },
  { slug: 'takeda', name: 'Takeda', year: 2024, revenue_m: 30500.0, unit: 'usd_m', confidence: 'high', scope: 'company' },
  { slug: 'tennr', name: 'Tennr', year: 2025, revenue_m: 11.4, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'terray-therapeutics', name: 'Terray Therapeutics', year: 2024, revenue_m: 20.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'truveta', name: 'Truveta', year: 2024, revenue_m: 40.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'viz-ai', name: 'Viz.ai', year: 2024, revenue_m: 80.0, unit: 'arr_usd_m', confidence: 'medium', scope: 'product' },
  { slug: 'xtalpi', name: 'XtalPi', year: 2024, revenue_m: 37.0, unit: 'usd_m', confidence: 'high', scope: 'product' },
];
