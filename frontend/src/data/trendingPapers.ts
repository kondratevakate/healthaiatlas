// GENERATED — do not edit by hand.
// Source: Airtable "Trending Papers" table.
// To update: edit rows in Airtable, then run:
//   python scripts/zerotrust/regen_trending_papers.py
//
// Regenerated: 2026-05-27

export interface TrendingPaper {
  /** arXiv subject-area code (cs.LG → "LG", math.CO → "CO", etc.) */
  category: string;
  title: string;
}

/** ISO date of the snapshot shown in the UI. */
export const TRENDING_PAPERS_DATE = '2026-05-27';

/** Attribution URL for the snapshot source. */
export const TRENDING_PAPERS_SOURCE = 'https://www.emergentmind.com/';

export const TRENDING_PAPERS: TrendingPaper[] = [
  { category: 'IM', title: 'Statistically Significant Linear Alignments Among High-Confidence Transient Candidates on POSS-I Photographic Plates' },
  { category: 'LG', title: 'Incompressible Knowledge Probes: Estimating Black-Box LLM Parameter Counts via Factual Capacity' },
  { category: 'SE', title: 'ProgramBench: Can Language Models Rebuild Programs From Scratch?' },
  { category: 'AI', title: 'Advancing Mathematics Research with AI-Driven Formal Proof Search' },
  { category: 'AI', title: 'Positive Alignment: Artificial Intelligence for Human Flourishing' },
  { category: 'LG', title: 'SlimQwen: Exploring the Pruning and Distillation in Large MoE Model Pre-training' },
  { category: 'AI', title: 'Generative Recursive Reasoning' },
  { category: 'CY', title: 'LLMorphism: When humans come to see themselves as language models' },
  { category: 'LG', title: 'The Last Human-Written Paper: Agent-Native Research Artifacts' },
  { category: 'OS', title: 'Embedded Rust or C Firmware? Lessons from an Industrial Microcontroller Use Case with Ariel OS' },
  { category: 'CV', title: 'MoCapAnything V2: End-to-End Motion Capture for Arbitrary Skeletons' },
  { category: 'SE', title: 'Constraint Decay: The Fragility of LLM Agents in Backend Code Generation' },
  { category: 'MF', title: 'An Explicit Solution to Black-Scholes Implied Volatility' },
  { category: 'QC', title: 'Phase Transitions and Gravitational Waves' },
  { category: 'CV', title: 'SenseNova-U1: Unifying Multimodal Understanding and Generation with NEO-unify Architecture' },
  { category: 'CR', title: 'Language Models Can Autonomously Hack and Self-Replicate' },
  { category: 'CL', title: 'Fast Byte Latent Transformer' },
  { category: 'LG', title: 'Manifold Steering Reveals the Shared Geometry of Neural Network Representation and Behavior' },
  { category: 'AI', title: 'Achieving Gold-Medal-Level Olympiad Reasoning via Simple and Unified Scaling' },
  { category: 'LG', title: 'Learning, Fast and Slow: Towards LLMs That Adapt Continually' },
  { category: 'CV', title: 'Pixal3D: Pixel-Aligned 3D Generation from Images' },
  { category: 'CL', title: 'How Language Models Process Negation' },
  { category: 'LG', title: 'Lattice Deduction Transformers' },
  { category: 'CL', title: 'EMO: Pretraining Mixture of Experts for Emergent Modularity' },
  { category: 'DL', title: 'LLM hallucinations in the wild: Large-scale evidence from non-existent citations' },
  { category: 'LG', title: 'Detecting overfitting in Neural Networks during long-horizon grokking using Random Matrix Theory' },
  { category: 'LG', title: 'Echo: KV-Cache-Free Associative Recall with Spectral Koopman Operators' },
  { category: 'LG', title: 'General Preference Reinforcement Learning' },
  { category: 'HC', title: 'Sycophantic AI makes human interaction feel more effortful and less satisfying over time' },
  { category: 'AI', title: 'δ-mem: Efficient Online Memory for Large Language Models' },
  { category: 'LG', title: 'Local Inverse Geometry Can Be Amortized' },
  { category: 'CL', title: 'HRM-Text: Efficient Pretraining Beyond Scaling' },
  { category: 'AI', title: 'Model Spec Midtraining: Improving How Alignment Training Generalizes' },
  { category: 'NT', title: 'Primitive sets and von Mangoldt chains: Erdős Problem #1196 and beyond' },
  { category: 'CL', title: 'A paradox of AI fluency' },
  { category: 'AI', title: 'AI Co-Mathematician: Accelerating Mathematicians with Agentic AI' },
  { category: 'CL', title: 'ELF: Embedded Language Flows' },
  { category: 'CV', title: 'VLMaxxing through FrameMogging: Training-Free Anti-Recomputation for Video Vision-Language Models' },
  { category: 'GE', title: 'Accelerating unrest at Campi Flegrei signals a critical transition within the next decade' },
  { category: 'CV', title: 'SANA-WM: Efficient Minute-Scale World Modeling with Hybrid Linear Diffusion Transformer' },
  { category: 'LG', title: 'Sub-JEPA: Subspace Gaussian Regularization for Stable End-to-End World Models' },
  { category: 'CO', title: 'An explicit lower bound for the unit distance problem' },
  { category: 'CL', title: 'Is Grep All You Need? How Agent Harnesses Reshape Agentic Search' },
  { category: 'CL', title: 'Decoupling the Benefits of Subword Tokenization for Language Model Training via Byte-level Simulation' },
  { category: 'LG', title: 'A Theory of Generalization in Deep Learning' },
];

/** Map category code → human-readable arXiv subject area label */
export const CATEGORY_LABELS: Record<string, string> = {
  AI: 'Artificial Intelligence',
  CL: 'Computation & Language',
  CO: 'Combinatorics',
  CR: 'Cryptography & Security',
  CV: 'Computer Vision',
  CY: 'Computers & Society',
  DL: 'Digital Libraries',
  GE: 'Geophysics',
  HC: 'Human-Computer Interaction',
  IM: 'Instrumentation & Methods',
  LG: 'Machine Learning',
  MF: 'Mathematical Finance',
  NT: 'Number Theory',
  OS: 'Operating Systems',
  QC: 'Quantum Computing',
  SE: 'Software Engineering',
};

/** Broad group for visual grouping — maps to a muted color class */
export const CATEGORY_GROUP: Record<string, 'ml' | 'math' | 'science' | 'other'> = {
  AI: 'ml',
  CL: 'ml',
  CO: 'math',
  CR: 'ml',
  CV: 'ml',
  CY: 'ml',
  DL: 'ml',
  GE: 'science',
  HC: 'ml',
  IM: 'science',
  LG: 'ml',
  MF: 'math',
  NT: 'math',
  OS: 'ml',
  QC: 'science',
  SE: 'ml',
};
