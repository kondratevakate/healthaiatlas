#!/usr/bin/env node
// Smoke test for the HuggingFace Inference Providers token used by the
// Discovery copilot. Run BEFORE wiring the token into the React app — if this
// fails, the React app will fail in the same way.
//
// Usage:
//   HF_TOKEN=hf_xxx node scripts/test-hf-token.mjs
//   # or, if you have it in frontend/.env.local already:
//   node --env-file=.env.local scripts/test-hf-token.mjs
//
// Reads the token from one of HF_TOKEN, VITE_HUG_API_KEY, HUG_API_KEY (in that order).

const token =
  process.env.HF_TOKEN ||
  process.env.VITE_HUG_API_KEY ||
  process.env.HUG_API_KEY;

if (!token) {
  console.error('✗ No HuggingFace token found.');
  console.error('  Set one of HF_TOKEN, VITE_HUG_API_KEY, HUG_API_KEY and re-run.');
  process.exit(1);
}

console.log(`Token detected (${token.slice(0, 6)}…${token.slice(-4)}, ${token.length} chars).\n`);

// Models to try. The :fastest suffix asks Hugging Face to route to whichever
// inference provider currently has lowest latency for that model.
const models = [
  'openai/gpt-oss-120b:fastest',
  'meta-llama/Llama-3.3-70B-Instruct:fastest',
  'Qwen/Qwen2.5-72B-Instruct:fastest',
  'deepseek-ai/DeepSeek-R1:fastest',
  'mistralai/Mistral-7B-Instruct-v0.3:fastest',
];

const url = 'https://router.huggingface.co/v1/chat/completions';
console.log(`Endpoint: ${url}\n`);

let anyOk = false;

for (const model of models) {
  const start = Date.now();
  let elapsed = 0;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with one word: OK.' }],
        max_tokens: 10,
        temperature: 0,
      }),
    });
    elapsed = Date.now() - start;
    if (!res.ok) {
      const text = await res.text();
      console.log(`✗ ${model}`);
      console.log(`  HTTP ${res.status} ${res.statusText} (${elapsed}ms)`);
      console.log(`  ${text.slice(0, 240).replace(/\n/g, ' ')}`);
      console.log();
      continue;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? '<empty>';
    console.log(`✓ ${model}`);
    console.log(`  HTTP ${res.status} (${elapsed}ms) → "${content}"`);
    console.log();
    anyOk = true;
  } catch (e) {
    elapsed = Date.now() - start;
    console.log(`✗ ${model}`);
    console.log(`  EXCEPTION (${elapsed}ms): ${e instanceof Error ? e.message : String(e)}`);
    console.log();
  }
}

if (anyOk) {
  console.log('At least one model worked. The token is valid for HuggingFace Inference Providers.');
  console.log('If the React copilot still fails, the issue is in the frontend (env-var loading, CORS, etc).');
  process.exit(0);
} else {
  console.log('All models failed. Token is invalid, expired, or lacks the right scope.');
  console.log('Fix the token at https://huggingface.co/settings/tokens');
  console.log('It needs the "Make calls to Inference Providers" permission (fine-grained token).');
  process.exit(2);
}
