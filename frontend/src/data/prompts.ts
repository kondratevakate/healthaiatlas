// LLM Prompt Templates for verification
// All prompts request sources to enable fact-checking

import { PromptTemplate, PathRole } from '@/types/research';

export const promptTemplates: PromptTemplate[] = [
  // Founder prompts
  {
    id: 'founder-perplexity',
    llm: 'perplexity',
    role: 'founder',
    template: `I'm an AI startup founder exploring the UAE healthcare market.

Research and provide sources for:
1. Current requirements for medical AI device registration in UAE (MOHAP, DHA)
2. Recent regulatory changes in 2025-2026 affecting clinical AI
3. Hub71 and DIFC Innovation Hub programs for health-tech startups
4. Typical timeline for hospital pilot programs in Abu Dhabi/Dubai

For each point, cite official sources or recent news articles.
Flag any information that cannot be verified.`,
    variables: []
  },
  {
    id: 'founder-chatgpt',
    llm: 'chatgpt',
    role: 'founder',
    template: `I'm researching the UAE healthcare AI market for my startup. Please help me understand:

1. What are the key regulatory bodies for medical AI in UAE?
2. What free zone options exist for healthcare startups (Hub71, DIFC, DHCC)?
3. What are typical requirements for hospital pilots in the region?
4. What are the data residency requirements for health data in UAE?

Important: For each answer, please note your knowledge cutoff and recommend I verify current requirements with official sources. What official websites should I check?`,
    variables: []
  },
  {
    id: 'founder-claude',
    llm: 'claude',
    role: 'founder',
    template: `I'm an AI founder considering UAE market entry for a healthcare product.

Help me think through:
1. What are the key decision points in my go-to-market strategy?
2. What are the most common failure modes for foreign healthtech startups in UAE?
3. How should I evaluate whether to set up locally vs. work with a distributor?
4. What questions should I ask potential local partners?

Please be direct about what you don't know and suggest where I should verify information.`,
    variables: []
  },
  {
    id: 'founder-gemini',
    llm: 'gemini',
    role: 'founder',
    template: `Research query: UAE healthcare AI startup ecosystem

Please search for and summarize:
- Current accelerator programs accepting healthcare AI startups in UAE
- Recent (2025-2026) funding rounds for UAE-based healthtech companies
- Government initiatives supporting AI in healthcare
- Key conferences and events for healthcare AI in the region

For each finding, include the source URL and date of information.`,
    variables: []
  },

  // Job Seeker prompts
  {
    id: 'jobseeker-perplexity',
    llm: 'perplexity',
    role: 'jobseeker',
    template: `I'm a healthcare AI professional seeking opportunities in UAE.

Research and provide sources for:
1. Current job market for AI/ML roles in UAE healthcare sector
2. Major employers in healthcare AI (hospitals, startups, tech companies)
3. Visa sponsorship requirements and options for tech professionals
4. Key professional networking events in Dubai/Abu Dhabi

For each point, cite recent sources and job listings where applicable.
Flag any information that cannot be verified.`,
    variables: []
  },
  {
    id: 'jobseeker-chatgpt',
    llm: 'chatgpt',
    role: 'jobseeker',
    template: `I'm considering relocating to UAE for a role in healthcare AI.

Please help me understand:
1. What are the main job boards and platforms used in UAE?
2. What visa options exist for tech professionals?
3. What salary ranges are typical for AI/ML roles in healthcare?
4. What is the typical hiring process like in UAE?

Note: Please indicate your knowledge cutoff and suggest current sources I should check.`,
    variables: []
  },

  // Business prompts
  {
    id: 'business-perplexity',
    llm: 'perplexity',
    role: 'business',
    template: `I'm exploring market entry for a medical AI product in UAE.

Research and provide sources for:
1. Medical device registration process with MOHAP and DHA
2. Free zone vs. mainland company setup for healthcare businesses
3. Current distributor/agent requirements for medical devices
4. Recent changes to healthcare regulations affecting AI products

For each point, cite official regulatory sources.
Flag any information that cannot be verified.`,
    variables: []
  },
  {
    id: 'business-chatgpt',
    llm: 'chatgpt',
    role: 'business',
    template: `I'm evaluating UAE market entry for a healthcare technology business.

Help me understand:
1. What are the key regulatory bodies I need to engage with?
2. What is the difference between Dubai, Abu Dhabi, and federal regulations?
3. What are typical timelines for business setup and licensing?
4. What local partner requirements exist for foreign companies?

Please note your knowledge cutoff and recommend official sources for verification.`,
    variables: []
  },

  // Clinician prompts
  {
    id: 'clinician-perplexity',
    llm: 'perplexity',
    role: 'clinician',
    template: `I'm a clinician interested in AI tools for my practice in UAE.

Research and provide sources for:
1. Current hospital policies on AI diagnostic tools in UAE
2. Regulatory framework for clinical AI use (DHA, DOH guidelines)
3. Approved/registered AI medical devices in UAE
4. Professional liability considerations for AI-assisted diagnosis

For each point, cite official or institutional sources.
Flag any information that cannot be verified.`,
    variables: []
  },
  {
    id: 'clinician-chatgpt',
    llm: 'chatgpt',
    role: 'clinician',
    template: `I'm a healthcare professional in UAE interested in using AI tools.

Help me understand:
1. What AI tools are currently approved for clinical use in UAE?
2. What are the liability implications of using AI in diagnosis?
3. How do I evaluate AI tools for my practice?
4. What training or certification might be relevant?

Please indicate limitations of your knowledge and suggest where to verify.`,
    variables: []
  }
];

// Get prompts for a specific role
export function getPromptsForRole(role: PathRole): PromptTemplate[] {
  return promptTemplates.filter(p => p.role === role);
}

// Get prompt for specific LLM and role
export function getPrompt(role: PathRole, llm: PromptTemplate['llm']): PromptTemplate | undefined {
  return promptTemplates.find(p => p.role === role && p.llm === llm);
}
