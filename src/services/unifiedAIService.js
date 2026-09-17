/**
 * unifiedAIService.js
 * Centralized Multi-Provider AI Engine for Study Hub RPG.
 *
 * Supported & verified Providers:
 * 1. Groq Cloud (Ultra-low latency LLaMA 3.1)
 * 2. CodeCraft API (Multi-model hub: Muse Spark 1.1, Gemini 3.7 Flash, GPT 5.5)
 * 3. Google Gemini 2 (Gemini 3.6 Flash via Generative Language API)
 * 4. Inception Labs (Mercury-2)
 * 5. NVIDIA NIM (Llama 3.2 Vision Instruct via integrate.api.nvidia.com)
 * 6. Vercel AI Gateway & OpenRouter (Global backups)
 */

const safeEnv = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' ? process.env : {});

export const PROVIDERS_CONFIG = {
  groq: {
    name: 'Groq Cloud',
    key: safeEnv.VITE_GROQ_API_KEY || safeEnv.GROQ_API_KEY || '',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['allam-2-7b', 'qwen/qwen3.8-27b', 'groq/compound-mini', 'openai/gpt-oss-20b'],
    type: 'openai'
  },
  gemini: {
    name: 'Google Gemini 2',
    key: safeEnv.VITE_GEMINI_API_KEY || safeEnv.GEMINI_API_KEY || '',
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: ['gemini-3.6-flash'],
    type: 'gemini'
  },
  openrouter: {
    name: 'OpenRouter',
    key: safeEnv.VITE_OPENROUTER_API_KEY || safeEnv.OPENROUTER_API_KEY || '',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['openrouter/free', 'google/gemma-4-31b-it:free'],
    type: 'openai'
  },
  codecraft: {
    name: 'CodeCraft API',
    key: safeEnv.VITE_CODECRAFT_API_KEY || safeEnv.CODECRAFT_API_KEY || '',
    url: 'https://codecraftapi.com/v1/chat/completions',
    models: ['muse-spark-1.1', 'gemini-3.7-flash', 'gpt-5.5', 'claude-sonnet-5'],
    type: 'openai'
  },
  gemini: {
    name: 'Google Gemini 2',
    key: safeEnv.VITE_GEMINI_API_KEY || safeEnv.GEMINI_API_KEY || '',
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: ['gemini-3.6-flash'],
    type: 'gemini'
  },
  inception: {
    name: 'Inception Labs',
    key: safeEnv.VITE_INCEPTION_API_KEY || safeEnv.INCEPTION_API_KEY || '',
    url: 'https://api.inceptionlabs.ai/v1/chat/completions',
    models: ['mercury-2', 'mercury-small'],
    type: 'openai'
  },
  nvidia: {
    name: 'NVIDIA NIM',
    key: safeEnv.VITE_NVIDIA_API_KEY || safeEnv.NVIDIA_API_KEY || '',
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: ['meta/llama-3.2-11b-vision-instruct'],
    type: 'openai'
  },
  vercel: {
    name: 'Vercel AI Gateway',
    key: safeEnv.VITE_VERCEL_AI_KEY || safeEnv.VERCEL_AI_KEY || '',
    url: 'https://ai-gateway.vercel.sh/v1/chat/completions',
    models: ['google/gemini-2.5-flash'],
    type: 'openai'
  },
  openrouter: {
    name: 'OpenRouter',
    key: safeEnv.VITE_OPENROUTER_API_KEY || safeEnv.OPENROUTER_API_KEY || '',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['openrouter/free', 'google/gemma-4-31b-it:free'],
    type: 'openai'
  }
};

/**
 * Strips reasoning or thinking tags often produced by modern reasoning models
 */
export function sanitizeAIReply(text) {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/(?:\s*\.\s*){2,}/g, '. ')
    .replace(/(?:\s*[؟?]\s*){2,}/g, '؟ ')
    .trim();
}

/**
 * Execute request against OpenAI-compatible endpoints
 */
async function callOpenAICompatible(cfg, model, messages, maxTokens = 300, timeoutMs = 15000) {
  const cleanKey = (cfg.key || '').replace(/[^\x20-\x7E]/g, '').trim();
  if (!cleanKey) throw new Error(`Missing API key for ${cfg.name}`);

  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
      'X-Title': 'Study Hub RPG AI'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    }),
    signal: AbortSignal.timeout(timeoutMs)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.detail || `HTTP ${res.status}`);
  }

  const msg = data.choices?.[0]?.message;
  const content = msg?.content || msg?.reasoning_content || msg?.reasoning || data.choices?.[0]?.text;
  if (!content) throw new Error('Empty response content');
  return sanitizeAIReply(content);
}

/**
 * Execute request against Google Gemini REST endpoint
 */
async function callGeminiAPI(cfg, model, messages, maxTokens = 300, timeoutMs = 15000) {
  const cleanKey = (cfg.key || '').replace(/[^\x20-\x7E]/g, '').trim();
  if (!cleanKey) throw new Error(`Missing API key for ${cfg.name}`);

  // Convert chat messages to Gemini contents structure
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const systemMessage = messages.find(m => m.role === 'system');
  const body = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7
    }
  };
  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage.content }]
    };
  }

  const url = `${cfg.url}/${model}:generateContent?key=${cleanKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join(' ').trim();
  if (!text) throw new Error('Empty Gemini response content');
  return sanitizeAIReply(text);
}

/**
 * Unified AI Query Function with auto-failover
 * @param {Object} options
 * @param {string} options.prompt - The user input
 * @param {string} [options.systemPrompt] - System instructions
 * @param {Array} [options.history] - Array of { role, content }
 * @param {number} [options.maxTokens] - Max tokens to return
 * @param {string} [options.preferredProvider] - Force provider ('codecraft', 'gemini', etc.)
 * @returns {Promise<{ reply: string, provider: string, model: string, latencyMs: number }>}
 */
export async function queryUnifiedAI({
  prompt,
  systemPrompt = '',
  history = [],
  maxTokens = 250,
  preferredProvider = null
}) {
  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...history,
    { role: 'user', content: prompt }
  ];

  // Provider evaluation order (Fastest and active first)
  const order = preferredProvider && PROVIDERS_CONFIG[preferredProvider]?.key
    ? [preferredProvider, 'groq', 'gemini', 'openrouter', 'inception', 'nvidia', 'vercel', 'codecraft']
    : ['groq', 'gemini', 'openrouter', 'inception', 'nvidia', 'vercel', 'codecraft'];

  // De-duplicate
  const uniqueProviders = [...new Set(order)];

  for (const providerId of uniqueProviders) {
    const cfg = PROVIDERS_CONFIG[providerId];
    if (!cfg || !cfg.key) continue;

    for (const model of cfg.models) {
      const start = Date.now();
      try {
        let reply = '';
        if (cfg.type === 'gemini') {
          reply = await callGeminiAPI(cfg, model, messages, maxTokens, 8000);
        } else {
          reply = await callOpenAICompatible(cfg, model, messages, maxTokens, 8000);
        }

        if (reply) {
          const latencyMs = Date.now() - start;
          return { reply, provider: cfg.name, model, latencyMs, providerId };
        }
      } catch (err) {
        console.warn(`[UnifiedAI] Provider ${cfg.name} (${model}) failed:`, err.message);
      }
    }
  }

  throw new Error('All configured AI providers failed to respond. Please verify API keys.');
}

/**
 * Test all configured AI providers individually and report results
 * @returns {Promise<Array<{ id: string, name: string, model: string, ok: boolean, latencyMs: number, reply?: string, error?: string }>>}
 */
export async function testAllAIProviders() {
  const testProviders = ['codecraft', 'gemini', 'inception', 'nvidia', 'groq', 'vercel', 'openrouter'];

  const results = await Promise.all(
    testProviders.map(async (id) => {
      const cfg = PROVIDERS_CONFIG[id];
      if (!cfg.key) {
        return {
          id,
          name: cfg.name,
          model: cfg.models[0] || 'N/A',
          ok: false,
          latencyMs: 0,
          error: 'No API Key configured'
        };
      }

      const model = cfg.models[0];
      const testMessages = [{ role: 'user', content: 'Say hello in 3 words' }];
      const start = Date.now();

      try {
        let reply = '';
        if (cfg.type === 'gemini') {
          reply = await callGeminiAPI(cfg, model, testMessages, 250, 15000);
        } else {
          reply = await callOpenAICompatible(cfg, model, testMessages, 250, 15000);
        }
        const latencyMs = Date.now() - start;
        return {
          id,
          name: cfg.name,
          model,
          ok: true,
          latencyMs,
          reply: reply.slice(0, 100)
        };
      } catch (err) {
        return {
          id,
          name: cfg.name,
          model,
          ok: false,
          latencyMs: Date.now() - start,
          error: err.message
        };
      }
    })
  );

  return results;
}
