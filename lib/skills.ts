// The skills page is curated here rather than derived from post tags, so it can cover work that has no write-up
// yet. Writing posts still get linked automatically when one of their tags matches a skill's name or alias.

export const GROUPS = [
  'Machine learning',
  'LLMs & agents',
  'Inference & serving',
  'Speech & voice',
  'Engineering',
] as const

export const PLACES = {
  loop: { label: 'Agent loop', href: '/writing/local-multi-agent-loop' },
  gail: { label: 'Gail' },
  muon: { label: 'Muon research' },
  cryptoface: { label: 'CryptoFace' },
  modelhub: { label: 'Model Hub' },
} as const

export type Group = (typeof GROUPS)[number]
export type Place = keyof typeof PLACES

export interface Skill {
  name: string
  group: Group
  note: string // where and how it was used, one or two sentences
  where?: Place[]
  aliases?: string[] // extra post tags that should link here
}

export const SKILLS: Skill[] = [
  // ── Machine learning ──
  {
    name: 'PyTorch',
    group: 'Machine learning',
    where: ['muon', 'cryptoface'],
    note: 'Instrumented optimizer for the Muon experiments, and the inference pipeline behind the CryptoFace web demo.',
  },
  {
    name: 'Optimizers (Muon, AdamW)',
    group: 'Machine learning',
    where: ['muon'],
    aliases: ['Optimization'],
    note: 'Testing whether Muon works because its Newton–Schulz step approximates the polar factor, or because of the band it pushes singular values into.',
  },
  {
    name: 'Numerical methods',
    group: 'Machine learning',
    where: ['muon'],
    note: 'Constrained fits of compute-matched quintic polynomial families with SciPy, with bounded-iteration and positivity checks.',
  },
  {
    name: 'NumPy / SciPy',
    group: 'Machine learning',
    where: ['muon'],
    aliases: ['NumPy', 'SciPy'],
    note: 'Coefficient solver and spectrum diagnostics for the Newton–Schulz study.',
  },
  {
    name: 'Computer vision',
    group: 'Machine learning',
    where: ['cryptoface'],
    aliases: ['CV'],
    note: 'A web demo for CryptoFace’s patch-based face recognition: shows patch extraction, the 256-D embedding, and identity similarity between two photos.',
  },
  {
    name: 'Privacy-preserving ML',
    group: 'Machine learning',
    where: ['cryptoface'],
    aliases: ['Homomorphic encryption'],
    note: 'CryptoFace (CVPR ’25) runs face recognition under fully homomorphic encryption, so raw images and features are never exposed.',
  },
  {
    name: 'scikit-learn',
    group: 'Machine learning',
    note: 'Baselines, preprocessing and evaluation splits before reaching for anything deep.',
  },
  {
    name: 'Hugging Face',
    group: 'Machine learning',
    aliases: ['Transformers'],
    note: 'Transformers, tokenizers and the Hub for pulling and fine-tuning open models.',
  },
  {
    name: 'Experiment tracking',
    group: 'Machine learning',
    aliases: ['MLflow', 'Weights & Biases'],
    note: 'Weights & Biases and MLflow for runs, sweeps and comparing configs.',
  },
  {
    name: 'Data visualization',
    group: 'Machine learning',
    where: ['muon', 'loop'],
    aliases: ['Observability'],
    note: 'matplotlib for research figures; the interactive charts in the agent-loop report are hand-built SVG in React.',
  },

  // ── LLMs & agents ──
  {
    name: 'Agent harnesses',
    group: 'LLMs & agents',
    where: ['loop'],
    aliases: ['Agents'],
    note: 'A two-agent loop that pulls tasks from a dependency-ordered plan, verifies its own work and writes handoff notes when it stops.',
  },
  {
    name: 'Context engineering',
    group: 'LLMs & agents',
    where: ['loop'],
    note: 'Measured what fills a 128K window turn by turn, and kept most runs under the compaction threshold.',
  },
  {
    name: 'Tool calling',
    group: 'LLMs & agents',
    where: ['gail'],
    note: 'Schema validation for tool arguments, a cap on sequential tool calls, and filler speech while a slow tool runs.',
  },
  {
    name: 'OpenAI APIs',
    group: 'LLMs & agents',
    where: ['gail'],
    aliases: ['OpenAI'],
    note: 'Chat Completions, Realtime, and a new Responses API agent with stateful and stateless variants.',
  },
  {
    name: 'Gemini',
    group: 'LLMs & agents',
    where: ['gail'],
    note: 'Brought Gemini to parity with the other providers: sequential tool calls and no dropped tool output.',
  },
  {
    name: 'RAG',
    group: 'LLMs & agents',
    where: ['gail'],
    aliases: ['Embeddings', 'Retrieval'],
    note: 'Throttled document uploads into the retrieval pipeline, with the concurrency limit behind a feature flag.',
  },
  {
    name: 'LLM guardrails',
    group: 'LLMs & agents',
    where: ['gail'],
    note: 'An identity guardrail with basic sentiment classification, configurable per agency.',
  },
  {
    name: 'Prompt design',
    group: 'LLMs & agents',
    where: ['loop', 'gail'],
    note: 'Task descriptions a small model can act on in isolation, and system prompts that steer the model away from hallucinated tool calls.',
  },

  // ── Inference & serving ──
  {
    name: 'llama.cpp / llama-server',
    group: 'Inference & serving',
    where: ['loop'],
    aliases: ['Local LLMs', 'llama.cpp'],
    note: 'Moving from Ollama to llama-server took prompt-cache reuse from about 7% to 97%.',
  },
  {
    name: 'Ollama',
    group: 'Inference & serving',
    where: ['loop'],
    note: 'The first serving setup for the agent loop, and the baseline the later setups are measured against.',
  },
  {
    name: 'KV & prompt caching',
    group: 'Inference & serving',
    where: ['loop'],
    note: 'Append-only prompts so each turn reuses the cache, and a q8 KV cache to fit two 128K contexts.',
  },
  {
    name: 'Multi-GPU inference',
    group: 'Inference & serving',
    where: ['loop'],
    note: 'Two Qwen 27B models across two 3090s; the second agent added about 20% throughput.',
  },
  {
    name: 'Request hedging',
    group: 'Inference & serving',
    where: ['gail'],
    note: 'Race a second completion request when the first passes a timeout, without losing usage accounting or cancellations.',
  },
  {
    name: 'CUDA / Metal',
    group: 'Inference & serving',
    where: ['modelhub'],
    aliases: ['CUDA'],
    note: 'Device probing for a fleet manager that reports schedulable GPU and Apple Silicon memory on each machine.',
  },

  // ── Speech & voice ──
  {
    name: 'Streaming speech-to-text',
    group: 'Speech & voice',
    where: ['gail'],
    aliases: ['STT'],
    note: 'Added Soniox as a WebSocket provider with Deepgram as fallback, and switched to ElevenLabs Scribe mid-call for spelled-out emails.',
  },
  {
    name: 'Text-to-speech',
    group: 'Speech & voice',
    where: ['gail'],
    aliases: ['TTS'],
    note: 'Pregenerated, cached filler phrases in sixteen languages, and routing long numbers to a higher-quality voice.',
  },
  {
    name: 'Turn-taking & VAD',
    group: 'Speech & voice',
    where: ['gail'],
    note: 'Delayed audio commits after voice activity ends, and recovery when a turn is interrupted by silence.',
  },
  {
    name: 'Twilio',
    group: 'Speech & voice',
    where: ['gail'],
    note: 'Call transfers, hangups and DTMF on live phone calls.',
  },

  // ── Engineering ──
  { name: 'Python', group: 'Engineering', where: ['gail', 'loop', 'muon', 'cryptoface'], note: 'Most of what I write: agents, research code, scripts.' },
  { name: 'TypeScript', group: 'Engineering', where: ['modelhub'], note: 'Model Hub’s web app, and this site.' },
  { name: 'Go', group: 'Engineering', where: ['modelhub'], note: 'Model Hub’s agent: enrolls a machine and streams its hardware inventory over signed connections.' },
  { name: 'C++', group: 'Engineering', note: 'Competitive programming (CSES problem set).' },
  { name: 'SQL', group: 'Engineering', where: ['gail'], aliases: ['Postgres', 'BigQuery'], note: 'Postgres for services; BigQuery for warehouse views.' },
  { name: 'FastAPI / Flask', group: 'Engineering', where: ['gail', 'cryptoface'], aliases: ['FastAPI', 'Flask'], note: 'Service backends, and the Flask server behind the CryptoFace demo.' },
  { name: 'React / Next.js', group: 'Engineering', where: ['modelhub'], aliases: ['React', 'Next.js'], note: 'Dashboards, demos, and this site.' },
  { name: 'Docker', group: 'Engineering', where: ['gail', 'modelhub'], note: 'Local stacks and deployment.' },
  { name: 'GCP & Terraform', group: 'Engineering', where: ['gail'], aliases: ['GCP', 'Terraform'], note: 'Secrets and provider keys wired through Terraform.' },
  {
    name: 'OpenTelemetry',
    group: 'Engineering',
    where: ['gail'],
    aliases: ['Tracing'],
    note: 'Per-call baggage on every span, so a trace shows which providers and models handled each turn.',
  },
  { name: 'Feature flags', group: 'Engineering', where: ['gail'], aliases: ['LaunchDarkly'], note: 'LaunchDarkly variations for rolling out providers and behaviors per agency.' },
  { name: 'Playwright', group: 'Engineering', note: 'Scrapers that walk listing pages and pull structured data.' },
]
