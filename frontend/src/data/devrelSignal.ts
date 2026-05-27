// DevRel Signal Hub — May 2026
// Source: C:/Projects/data/aiatls/devrel_hub.html (editorial, non-automated)
// 29 named Developer Advocates · 14 vendors · 12–18 months of content surveyed.
//
// Compliance: all URLs point to public professional profiles / company blogs.
// No personal contact data stored.

export type SignalLevel = 'High' | 'Medium' | 'Low';
export type EventType = 'hire' | 'move' | 'launch' | 'content' | 'gap';

export interface DevRelFollow {
  name: string;
  role: string;
  co: string;
  handle: string;
  url: string;
  sig: string;
}

export interface DevRelCluster {
  id: string;
  letter: string;
  label: string;
  name: string;
  domain: string;
  desc: string;
  cos: string[];
  n: 1 | 2 | 3;
  stack: string[];
  follow?: DevRelFollow;
  color: string;
  gap: boolean;
}

export interface DevRelPerson {
  name: string;
  co: string;
  role: string;
  cluster: string;
  signal: SignalLevel;
  url: string;
  platform: string;
  stack: string;
}

export interface TlEvent {
  type: EventType;
  label: string;
  tip: string;
}

export interface TlRow {
  label: string;
  events: Partial<Record<string, TlEvent[]>>;
}

export const DEVREL_PERIODS = [
  '2021H1','2021H2','2022H1','2022H2',
  '2023H1','2023H2','2024H1','2024H2',
  '2025H1','2025H2','2026H1',
] as const;

export type DevRelPeriod = typeof DEVREL_PERIODS[number];

export const DEVREL_PERIOD_LABELS: Record<DevRelPeriod, string> = {
  '2021H1':'2021 H1','2021H2':'2021 H2',
  '2022H1':'2022 H1','2022H2':'2022 H2',
  '2023H1':'2023 H1','2023H2':'2023 H2',
  '2024H1':'2024 H1','2024H2':'2024 H2',
  '2025H1':'2025 H1','2025H2':'2025 H2',
  '2026H1':'2026 H1',
};

export const DEVREL_CLUSTERS: DevRelCluster[] = [
  {
    id: 'A', letter: 'A', label: 'Cluster A',
    name: 'JAX / XLA Performance Engineers', domain: 'LLM Training Infra', n: 3,
    desc: 'NVIDIA pushing systems-level JAX fine-tuning on H100/B200, custom CUDA kernels via CuTe DSL/CUTLASS, multi-node collectives (NVSHMEM) at the GPU-interconnect layer.',
    cos: ['NVIDIA'],
    stack: ['JAX','XLA','CuTe DSL','CUTLASS','NVSHMEM','MaxText','Hopper/Blackwell'],
    follow: {
      name: 'Katja Sirazitdinova', role: 'Senior Developer Advocate · NVIDIA', co: 'NVIDIA',
      handle: 'linkedin: katjasrz', url: 'https://www.linkedin.com/in/katjasrz/',
      sig: '«Fine-tune Llama 3.1-8B on NVIDIA GPUs with JAX» · «Custom GPU Kernels via CuTe DSL/CUTLASS»',
    },
    color: '#4ade80', gap: false,
  },
  {
    id: 'B', letter: 'B', label: 'Cluster B · 5 advocates',
    name: 'NeMo / Nemotron LLM Platform', domain: 'LLM Customization & Post-Training', n: 3,
    desc: '5 named NVIDIA advocates on SFT → RLVR → distillation end-to-end. Llama Nemotron family is the anchor. NeMo Gym adds RL environments; Day-0 HF model support via NeMo AutoModel.',
    cos: ['NVIDIA'],
    stack: ['NeMo','NeMo Gym','GRPO','NeMo Curator','TensorRT-LLM','NIM','DeepSeek-R1 NIM'],
    follow: {
      name: 'Chris Alexiuk', role: 'Deep Learning Developer Advocate · NVIDIA', co: 'NVIDIA',
      handle: 'developer.nvidia.com/blog', url: 'https://developer.nvidia.com/blog/author/chrisalexiuk/',
      sig: '«Train a Reasoning-Capable LLM in One Weekend with NVIDIA NeMo» — GRPO on A100/H100',
    },
    color: '#60a5fa', gap: false,
  },
  {
    id: 'C', letter: 'C', label: 'Cluster C',
    name: 'Physical AI / Robotics / Edge VLA', domain: 'Robotics & Edge Inference', n: 3,
    desc: 'Engineers who deploy VLA models on Jetson Orin/Thor, connect to Isaac Sim digital twins, and fine-tune GR00T N1.5 with synthetic data via Cosmos Transfer.',
    cos: ['NVIDIA'],
    stack: ['Jetson Orin','Jetson Thor','Isaac ROS','GR00T N1.5','Isaac Lab','Cosmos','jetson-containers'],
    follow: {
      name: 'Dustin Franklin', role: 'Principal Engineer & Developer Evangelist · NVIDIA', co: 'NVIDIA',
      handle: 'github: dusty-nv', url: 'https://github.com/dusty-nv/jetson-containers',
      sig: 'jetson-containers — canonical ML container stack (LLMs, VLMs, VLAs, ROS) for Jetson edge AI',
    },
    color: '#fb923c', gap: false,
  },
  {
    id: 'D', letter: 'D', label: 'Cluster D · strongest cross-vendor',
    name: 'Agentic Backend / MCP-Native Engineers', domain: 'Agents & Tool Use', n: 3,
    desc: '6 vendors, 9 named advocates, same primitives: MCP servers, sub-agents, tool surfaces, idempotent API design. Clearest cross-company consensus in the dataset.',
    cos: ['Google','Anthropic','Stripe','AWS','Microsoft Azure','MongoDB'],
    stack: ['MCP','Claude Agent SDK','Vertex ADK','Bedrock AgentCore','Strands','Stripe Agent Toolkit','Semantic Kernel','Tool Search'],
    follow: {
      name: 'Logan Kilpatrick', role: 'Product Lead, AI Studio + Gemini API · Google', co: 'Google',
      handle: 'twitter: @OfficialLoganK', url: 'https://x.com/OfficialLoganK',
      sig: 'ADK downloaded 7M+ times · Agent Engine: autoscaling + sub-second cold starts',
    },
    color: '#c084fc', gap: false,
  },
  {
    id: 'Daz', letter: 'D', label: 'Cluster D-adj · Azure',
    name: 'Azure LLMOps / Cloud-Edge AI', domain: 'LLMOps & Applied AI', n: 3,
    desc: 'Microsoft betting on polyglot LLMOps engineers: Azure AI Foundry agents, LLMOps maturity, ONNX Runtime for cloud↔edge↔Unreal Engine. .NET and Rust alongside Python.',
    cos: ['Microsoft Azure'],
    stack: ['Azure AI Foundry','Azure ML','ONNX Runtime','Semantic Kernel','Phi-4','Azure OpenAI','.NET','Rust'],
    follow: {
      name: 'Cassie Breviu', role: 'Cloud Advocate, Azure AI / AI Frameworks · Microsoft', co: 'Microsoft',
      handle: 'github: cassieview', url: 'https://github.com/cassieview',
      sig: 'LLMOps maturity model on Azure AI · ONNX Runtime for ML inference in Unreal Engine',
    },
    color: '#38bdf8', gap: false,
  },
  {
    id: 'E', letter: 'E', label: 'Cluster E',
    name: 'Edge AI Application Engineers on Workers', domain: 'Edge Inference & RAG', n: 3,
    desc: 'Cloudflare manufacturing demand for JS/TS-first engineers who build zero-latency RAG apps inside Workers — hard 10ms CPU budget, global p50 < 80ms.',
    cos: ['Cloudflare'],
    stack: ['Workers AI','Vectorize','D1','AI Gateway','Workers','TypeScript'],
    follow: {
      name: 'Kristian Freeman', role: 'Manager of Developer Advocacy · Cloudflare', co: 'Cloudflare',
      handle: 'blog.cloudflare.com', url: 'https://blog.cloudflare.com/author/kristian/',
      sig: 'RAG with Llama2 on Workers AI + Vectorize · AI Gateway as multi-provider inference router',
    },
    color: '#34d399', gap: false,
  },
  {
    id: 'F', letter: 'F', label: 'Cluster F',
    name: 'Serverless GPU Infrastructure Engineers', domain: 'GPU Inference & Cold Start', n: 2,
    desc: 'Modal betting on engineers who write Python decorators but understand CUDA checkpoint/restore, paged attention, GPU memory at the systems level. 40x cold-start reduction.',
    cos: ['Modal'],
    stack: ['Modal','cuda-checkpoint','CRIU','vLLM','TensorRT-LLM','B200 / H100'],
    follow: {
      name: 'Charles Frye', role: 'Developer Advocate / MTS · Modal', co: 'Modal',
      handle: 'modal.com/gpu-glossary', url: 'https://modal.com/gpu-glossary',
      sig: '«Cutting inference cold starts by 40x with LP, FUSE, C/R, and cuda-checkpoint» · AI Engineer World\'s Fair 2025',
    },
    color: '#fbbf24', gap: false,
  },
  {
    id: 'SF', letter: 'SQL', label: 'Adjacent cluster',
    name: 'SQL-Native AI / Snowflake Cortex', domain: 'In-Database AI', n: 3,
    desc: 'Engineers who run LLM ops through SQL without moving data out of Snowflake. Cortex AISQL, Cortex Code Agent SDK — distinct profile from Python-first ML engineers.',
    cos: ['Snowflake'],
    stack: ['Cortex AI','Cortex Code Agent SDK','Cortex Search','Arctic Embed','Snowpark','AISQL'],
    follow: {
      name: 'Dash DesAI', role: 'Principal Developer Advocate · Snowflake', co: 'Snowflake',
      handle: 'github: iamontheinet', url: 'https://github.com/iamontheinet',
      sig: 'Pipeline Auditor app: Cortex Code Agent SDK + React + Snowpark Container Services',
    },
    color: '#22d3ee', gap: false,
  },
  {
    id: 'H', letter: 'H', label: 'Cluster H',
    name: 'Open Model Inference Routing', domain: 'Open Model Deployment', n: 2,
    desc: 'HF shifting from \'fine-tune your own\' to \'provider-routed inference\' — engineers using HF Hub as routing layer across dozens of inference providers with OpenAI-compatible APIs.',
    cos: ['Hugging Face'],
    stack: ['Transformers','Inference Providers','HF Hub','Spaces','Gradio'],
    follow: {
      name: 'Vaibhav Srivastav', role: 'Developer Advocate Engineer · Hugging Face', co: 'Hugging Face',
      handle: 'twitter: @reach_vb', url: 'https://x.com/reach_vb',
      sig: 'Routing Llama/Mistral/Gemma across FeatherlessAI, Together, Fireworks via HF Inference Providers',
    },
    color: '#a3e635', gap: false,
  },
  {
    id: 'GAPDB', letter: '?', label: 'Research gap',
    name: 'Databricks Mosaic AI / LLMOps-on-Lakehouse', domain: 'Lakehouse + GenAI', n: 3,
    desc: '3+ Sr. DevAdv roles open. Stack clear — no named advocate with public content yet. Biggest uncovered enterprise AI platform.',
    cos: ['Databricks'],
    stack: ['MLflow 3.0','Agent Bricks','Unity Catalog','Delta Lake','Mosaic AI Agent Framework','DSPy'],
    color: '#ef4444', gap: true,
  },
  {
    id: 'GAPMETA', letter: '?', label: 'Research gap',
    name: 'Meta Llama / PyTorch Ecosystem', domain: 'Open-Weight Models', n: 3,
    desc: 'LlamaCon 2025: Llama API, 1B+ downloads. No named DevRel engineer publishing technical tutorials. PyTorch Foundation hiring Director of Developer Community.',
    cos: ['Meta'],
    stack: ['Llama API','Llama 4 Scout/Maverick','torchtune','torchao','LlamaStack','LlamaFirewall'],
    color: '#ef4444', gap: true,
  },
];

export const DEVREL_PEOPLE: DevRelPerson[] = [
  { name:'Katja Sirazitdinova', co:'NVIDIA', role:'Senior Developer Advocate', cluster:'A — JAX/GPU perf', signal:'High', url:'https://www.linkedin.com/in/katjasrz/', platform:'LinkedIn', stack:'JAX, XLA, CuTe DSL, MaxText' },
  { name:'Chris Alexiuk', co:'NVIDIA', role:'DL Developer Advocate', cluster:'B — NeMo/Nemotron', signal:'High', url:'https://developer.nvidia.com/blog/author/chrisalexiuk/', platform:'NVIDIA Blog', stack:'NeMo, GRPO, NeMo Gym' },
  { name:'Anjali Shah', co:'NVIDIA', role:'Sr. DL Scientist / Dev Advocate', cluster:'B — NeMo/Nemotron', signal:'High', url:'https://developer.nvidia.com/blog/author/anjshah/', platform:'NVIDIA Blog', stack:'TensorRT-LLM, Nemotron 3 Nano Omni' },
  { name:'Annie Surla', co:'NVIDIA', role:'Dev Advocate Engineer', cluster:'B — NeMo/Nemotron', signal:'High', url:'https://developer.nvidia.com/blog/author/anniesurla/', platform:'NVIDIA Blog', stack:'Llama Nemotron Nano VLM, RAG' },
  { name:'Mehran Maghoumi', co:'NVIDIA', role:'Sr. DL Dev Advocate', cluster:'B — NeMo/Nemotron', signal:'High', url:'https://developer.nvidia.com/blog/author/mmaghoumi/', platform:'NVIDIA Blog', stack:'NeMo, DeepSeek-R1 NIM, Triton' },
  { name:'Shashank Verma', co:'NVIDIA', role:'DL Dev Advocate / Product Research Manager', cluster:'B — NeMo/Nemotron', signal:'High', url:'https://developer.nvidia.com/blog/', platform:'NVIDIA Blog', stack:'NeMo AutoModel, NVIDIA AI Foundation Models' },
  { name:'Jay Rodge', co:'NVIDIA', role:'Sr. Developer Advocate – LLMs', cluster:'B-adj GPU data infra', signal:'Medium', url:'https://jayrodge.github.io/', platform:'Personal site', stack:'RAPIDS cuDF, CUDA, PyTorch' },
  { name:'Dustin Franklin', co:'NVIDIA', role:'Principal Engineer & Dev Evangelist', cluster:'C — Jetson/Isaac', signal:'High', url:'https://github.com/dusty-nv', platform:'GitHub', stack:'Jetson Orin/Thor, Isaac ROS, GR00T' },
  { name:'Logan Kilpatrick', co:'Google', role:'Product Lead, AI Studio + Gemini API', cluster:'D — Agentic backend', signal:'High', url:'https://x.com/OfficialLoganK', platform:'X/Twitter', stack:'ADK, Agent Engine, Gemini API, MCP' },
  { name:'Philipp Schmid', co:'Google DeepMind', role:'Staff Engineer, DevX/DevRel', cluster:'D — Agentic backend', signal:'High', url:'https://www.philschmid.de/', platform:'Personal site', stack:'ADK, Transformers, Gemini, Vertex AI' },
  { name:'Holt Skinner', co:'Google', role:'Developer Advocate, Cloud AI', cluster:'D — Agentic backend', signal:'High', url:'https://developers.googleblog.com/', platform:'Google Dev Blog', stack:'Vertex AI RAG Engine, ADK, Gemini CX' },
  { name:'Alex Albert', co:'Anthropic', role:'Head of Developer Relations', cluster:'D — Agentic backend', signal:'High', url:'https://x.com/alexalbert__', platform:'X/Twitter', stack:'Claude API, Agent SDK, MCP, Tool Search' },
  { name:'Anna Spysz', co:'Stripe', role:'Developer Advocate', cluster:'D — Agentic backend', signal:'High', url:'https://stripe.dev/blog', platform:'Stripe.dev', stack:'Stripe Projects, Agent Toolkit, MCP, Vercel AI SDK' },
  { name:'Ben Smith', co:'Stripe', role:'Staff Developer Advocate', cluster:'D — Agentic backend', signal:'High', url:'https://stripe.dev/blog', platform:'Stripe.dev', stack:'Stripe Workflows, agentic payments' },
  { name:'Henk Boelman', co:'Microsoft Azure', role:'Principal Developer Advocate (AI/ML)', cluster:'D — Agentic backend', signal:'High', url:'https://www.henkboelman.com/', platform:'Personal site', stack:'Azure AI Foundry, Azure OpenAI, agent orchestration' },
  { name:'Kinfey Lo', co:'Microsoft Azure', role:'Senior Cloud Advocate, Azure AI/OpenAI', cluster:'D — Agentic backend', signal:'Medium', url:'https://github.com/kinfey', platform:'GitHub', stack:'Azure AI Services, Azure OpenAI, Python, .NET, Rust, MLOps' },
  { name:'Luce Carter', co:'MongoDB', role:'Developer Relations Engineer', cluster:'D — Agentic backend', signal:'Medium', url:'https://www.linkedin.com/in/lucecarter/', platform:'LinkedIn', stack:'Semantic Kernel, MongoDB Atlas, C#, .NET, Azure OpenAI' },
  { name:'Suman Debnath', co:'AWS', role:'Principal DA, ML / GenAI (Global team lead)', cluster:'D — Agentic backend', signal:'High', url:'https://aws.amazon.com/blogs/machine-learning/author/debnsuma', platform:'AWS ML Blog', stack:'Amazon Bedrock, SageMaker, Python, RAG, pgvector, LangChain' },
  { name:'Mike Chambers', co:'AWS', role:'Senior Developer Advocate, Generative AI', cluster:'D — Agentic backend', signal:'High', url:'https://aws.amazon.com/bedrock/agentcore/', platform:'AWS Bedrock', stack:'Bedrock, AgentCore Runtime/Memory/Observability, Strands Agents, MCP' },
  { name:'Cassie Breviu', co:'Microsoft Azure', role:'Cloud Advocate, Azure AI / AI Frameworks', cluster:'D-adj Azure LLMOps', signal:'High', url:'https://github.com/cassieview', platform:'GitHub', stack:'Azure AI, Azure ML, ONNX Runtime, Azure AI Foundry, Bicep' },
  { name:'Kristian Freeman', co:'Cloudflare', role:'Manager of Developer Advocacy', cluster:'E — Edge AI / Workers', signal:'High', url:'https://blog.cloudflare.com/author/kristian/', platform:'CF Blog', stack:'Workers AI, Vectorize, D1, AI Gateway, TypeScript' },
  { name:'Charles Frye', co:'Modal', role:'Developer Advocate / MTS', cluster:'F — Serverless GPU', signal:'Medium', url:'https://modal.com/gpu-glossary', platform:'GPU Glossary', stack:'Modal, cuda-checkpoint, CRIU, vLLM, TensorRT-LLM' },
  { name:'Esteban Maldonado Cabán', co:'Unity', role:'Senior Developer Advocate', cluster:'G — Unity multiplayer', signal:'Medium', url:'https://blog.unity.com/', platform:'Unity Blog', stack:'Netcode for GameObjects/Entities, DOTS, UGS, Relay' },
  { name:'Omar Sanseviero', co:'Hugging Face', role:'ML Engineer Lead, Developer Advocacy', cluster:'H — Open model infra', signal:'Medium', url:'https://x.com/osanseviero', platform:'X/Twitter', stack:'HF Hub, Spaces, Gradio, Transformers' },
  { name:'Vaibhav Srivastav', co:'Hugging Face', role:'Developer Advocate Engineer', cluster:'H — Open model infra', signal:'Medium', url:'https://x.com/reach_vb', platform:'X/Twitter', stack:'Transformers, Inference Providers, HF Hub' },
  { name:'Dash DesAI', co:'Snowflake', role:'Principal Developer Advocate', cluster:'Adj — Snowflake Cortex', signal:'High', url:'https://github.com/iamontheinet', platform:'GitHub', stack:'Cortex Code Agent SDK, Snowpark, Arctic Embed, AISQL' },
  { name:'Ray Stephenson', co:'Qualcomm', role:'Director, Cloud AI Developer Relations', cluster:'Adj — Qualcomm AI inference', signal:'Medium', url:'https://developer.qualcomm.com/blog', platform:'Qualcomm Dev', stack:'Qualcomm AI Inference Suite, PyTorch, HF models' },
  { name:'Dylan Ebert', co:'Adaptive ML (former HF)', role:'Developer Advocate (former HF)', cluster:'Adj — 3D ML', signal:'Low', url:'https://www.linkedin.com/in/dylan-ebert/', platform:'LinkedIn', stack:'Gaussian splats, face retargeting, HF Spaces' },
  { name:'Haimantika Mitra', co:'DigitalOcean', role:'Senior Developer Advocate', cluster:'Adj — GenAI simple cloud', signal:'Low', url:'https://www.linkedin.com/in/haimantika-mitra/', platform:'LinkedIn', stack:'DO GenAI Platform, Llama 3.3, Managed PG' },
];

export const DEVREL_TL_ROWS: TlRow[] = [
  { label:'Hugging Face', events:{
    '2021H1':[{ type:'hire', label:'Merve Noyan', tip:'First named AI-native DevRel. Computer vision + NLP demos, Spaces, Gradio. HF was first mover in open-model DevRel.' }],
    '2021H2':[{ type:'hire', label:'Philipp Schmid', tip:'Becomes dominant HF DevRel voice. Sets template for open-model fine-tuning content.' }],
    '2024H2':[{ type:'move', label:'Schmid → Google DeepMind', tip:'⚡ Google buys the open-model authority. HF DevRel enters transition — Vaibhav Srivastav becomes front voice.' }],
  }},
  { label:'OpenAI', events:{
    '2022H2':[{ type:'hire', label:'Kilpatrick joins', tip:'OpenAI\'s first DevRel hire. Timing: just before ChatGPT launch. Builds developer relations from zero.' }],
    '2023H1':[{ type:'launch', label:'ChatGPT API + plugins', tip:'Kilpatrick leads developer push. OpenAI briefly the most developer-facing AI company.' }],
    '2024H1':[{ type:'move', label:'Kilpatrick → Google', tip:'⚡ Apr 2024: leaves for Google as Product Lead, AI Studio + Gemini API. Google pays premium for DevRel credibility. Biggest talent move in AI DevRel history.' }],
  }},
  { label:'Anthropic', events:{
    '2023H1':[{ type:'hire', label:'Alex Albert joins', tip:'DevRel at Anthropic. Claude API, prompt engineering, tool use.' }],
    '2024H1':[{ type:'launch', label:'Tool use + MCP', tip:'MCP announced as open standard. Albert becomes Head of DevRel. Signals ecosystem-first, not just API.' }],
    '2025H1':[{ type:'launch', label:'Claude Code + Agent SDK', tip:'#1 AI coding tool in 8 months. Agent SDK + MCP ecosystem. Engineering blog posts from Bin Wu et al on advanced tool use.' }],
  }},
  { label:'NVIDIA', events:{
    '2022H1':[{ type:'hire', label:'Alexiuk, Shah, Surla', tip:'Chris Alexiuk (NeMo), Anjali Shah (TensorRT/multimodal), Annie Surla (VLM/RAG) start publishing. AI-specific content accelerates.' }],
    '2023H1':[{ type:'content', label:'Jetson AI Lab', tip:'Dustin Franklin (dusty-nv) launches jetson-containers + Jetson AI Lab. Canonical edge AI DevRel artifact.' }],
    '2023H2':[{ type:'launch', label:'NeMo + NIM', tip:'NeMo Guardrails, NIM microservices. Maghoumi + Verma ramp content. NVIDIA betting on NeMo as enterprise LLM stack.' }],
    '2024H1':[{ type:'content', label:'JAX on NVIDIA GPU', tip:'Katja Sirazitdinova: Llama 3.1-8B with JAX + Custom GPU Kernels via CuTe DSL. Systems-level content.' }],
    '2025H1':[{ type:'launch', label:'Nemotron 3 Nano Omni', tip:'Anjali Shah: multimodal agent reasoning (Apr 2025). 5 active DevAdv now publishing NeMo/Nemotron.' }],
    '2026H1':[{ type:'content', label:'GR00T + Isaac Lab', tip:'Dustin Franklin: GR00T N1.5 humanoid foundation model. NVIDIA Metropolis industrial AI expanding.' }],
  }},
  { label:'Google Cloud', events:{
    '2021H2':[{ type:'content', label:'Vergadia: Vertex AI', tip:'Priyanka Vergadia (Staff DevAdv) active on Vertex AI MLOps. GCPSketchnotes. Primary voice for Vertex as MLOps platform.' }],
    '2024H1':[{ type:'move', label:'Kilpatrick joins + Vergadia leaves', tip:'⚡ Apr 2024: Kilpatrick joins from OpenAI. Vergadia leaves for Microsoft. Google gains developer credibility, loses Vertex MLOps voice simultaneously.' }],
    '2024H2':[{ type:'hire', label:'Schmid joins DeepMind', tip:'⚡ Philipp Schmid from HF → Google DeepMind. Google now has two top AI DevRel voices (Kilpatrick + Schmid).' }],
    '2025H2':[{ type:'launch', label:'ADK + Agent Engine GA', tip:'ADK 7M+ downloads. Agent Engine GA. Kilpatrick + Schmid + Skinner = strongest Google AI DevRel team.' }],
    '2026H1':[{ type:'gap', label:'Vertex MLOps: no DevRel', tip:'⚠️ Vertex AI as MLOps platform (pipelines, Feature Store, Vector Search) remains uncovered. Kilpatrick/Schmid only cover Gemini/ADK.' }],
  }},
  { label:'AWS', events:{
    '2023H1':[{ type:'content', label:'Debnath: Bedrock ramp', tip:'Suman Debnath (Principal DA, leads global ML/GenAI team) starts Bedrock + Knowledge Bases content.' }],
    '2024H2':[{ type:'content', label:'Chambers: AgentCore', tip:'Mike Chambers becomes face of Bedrock AgentCore. AI Dev 25 workshop. Production agent architecture content.' }],
    '2025H2':[{ type:'launch', label:'AgentCore GA', tip:'Amazon Bedrock AgentCore GA (Oct 2025). Cedar policy language for deterministic agent governance. AWS\'s answer to Anthropic Agent SDK.' }],
  }},
  { label:'Microsoft Azure', events:{
    '2023H2':[{ type:'content', label:'Boelman, Kinfey Lo', tip:'Henk Boelman: Azure AI Foundry agents. Kinfey Lo: Azure AI Services in Python/.NET/Rust. MLOps push begins.' }],
    '2024H1':[{ type:'move', label:'Vergadia joins from Google', tip:'⚡ Priyanka Vergadia → Microsoft Sr. Director. Azure gains experienced Cloud+AI narrator immediately.' }],
    '2024H2':[{ type:'content', label:'Breviu: LLMOps + contoso-chat', tip:'Cassie Breviu: LLMOps Maturity Model + contoso-chat RAG sample on Azure AI Foundry. ONNX Runtime in Unreal Engine.' }],
    '2025H1':[{ type:'content', label:'Semantic Kernel push', tip:'Luce Carter (MongoDB DevRel): SK + MongoDB Atlas + C# agents. Kinfey Lo: Phi-4 fine-tuning on Azure ML.' }],
  }},
  { label:'Stripe', events:{
    '2024H1':[{ type:'content', label:'Spysz: Stripe Projects', tip:'"From init to deploy: building with agents and Stripe Projects" — agents provisioning infra from CLI.' }],
    '2024H2':[{ type:'content', label:'Smith: Stripe Workflows', tip:'Ben Smith (Staff DA): 11+ posts on Stripe Workflows. "What happens when AI agents start making purchases."' }],
    '2025H1':[{ type:'launch', label:'Stripe MCP + Agent Toolkit', tip:'mcp.stripe.com. Agent Toolkit: OpenAI SDK, LangChain, CrewAI, Vercel AI SDK, MCP. Idempotency-by-default.' }],
  }},
  { label:'Cloudflare', events:{
    '2023H1':[{ type:'launch', label:'Workers AI beta', tip:'Workers AI launches. Kristian Freeman starts AI-specific content alongside existing Workers DevRel.' }],
    '2023H2':[{ type:'content', label:'RAG + Vectorize', tip:'"RAG with Llama2 on Workers AI + Vectorize" — YouTube tutorial. Vectorize open beta.' }],
    '2025H2':[{ type:'launch', label:'AI Gateway GA', tip:'AI Gateway GA as multi-provider router for 14+ providers. Open role: Models Engineer DevRel (Python+ML).' }],
  }},
  { label:'Modal', events:{
    '2023H2':[{ type:'hire', label:'Charles Frye joins', tip:'GPU Glossary + systems-level inference content begins. "What every AI engineer needs to know about GPUs."' }],
    '2024H1':[{ type:'content', label:'GPU Glossary + cold start', tip:'«Cutting inference cold starts by 40x.» Most technically deep inference infra content in dataset.' }],
  }},
  { label:'Snowflake', events:{
    '2024H1':[{ type:'launch', label:'Cortex AI + Arctic', tip:'Snowflake Summit 2024: Cortex LLM functions, Cortex Fine-Tuning, Arctic model. Dash DesAI starts Cortex-specific content.' }],
    '2024H2':[{ type:'content', label:'DesAI: Cortex Code Agent', tip:'Pipeline Auditor app: Cortex Code Agent SDK + React + Snowpark Container Services.' }],
    '2025H1':[{ type:'launch', label:'Cortex AISQL GA', tip:'Snowflake Summit 2025: Cortex AISQL, Snowflake Intelligence, Cortex Code + Context Hub.' }],
  }},
  { label:'Databricks', events:{
    '2024H2':[{ type:'launch', label:'Mosaic AI GA', tip:'Mosaic AI stack: MLflow 3.0, Agent Framework, Unity Catalog. Data+AI Summit 2024. No named DevRel yet.' }],
    '2025H1':[{ type:'gap', label:'DevAdv roles open', tip:'⚠️ 3+ Sr. DevAdv positions open (MLflow, ML, AI Agentic Systems). Stack clear — no named advocate publishing content.' }],
    '2026H1':[{ type:'gap', label:'Gap persists', tip:'⚠️ No named Databricks DevRel with Mosaic AI hands-on content (May 2026). Biggest uncovered enterprise AI platform.' }],
  }},
  { label:'Meta / PyTorch', events:{
    '2025H1':[{ type:'launch', label:'LlamaCon — no DevRel face', tip:'⚠️ LlamaCon Apr 2025: Llama API announced. Keynoted by Zuckerberg + CPO. No named DevRel runs technical tracks. 1B+ downloads, zero DevRel voice.' }],
    '2025H2':[{ type:'gap', label:'PyTorch Foundation hiring', tip:'⚠️ PyTorch Foundation posts "Director of Developer Community" (open). Largest open AI ecosystem without named DevRel lead.' }],
  }},
];
