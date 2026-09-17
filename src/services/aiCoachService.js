/**
 * aiCoachService.js
 * Handles AI coaching conversations with full study-data context.
 *
 * Fully integrated multi-provider fallback hierarchy:
 * 1. NVIDIA NIM (~350ms, meta/llama-3.2-11b-vision-instruct)
 * 2. Groq Cloud (~200–600ms, groq/compound-mini, allam-2-7b)
 * 3. Inception Labs (~650ms, mercury-2)
 * 4. Google Gemini 2 (gemini-3.6-flash)
 * 5. CodeCraft API (muse-spark-1.1, gemini-3.7-flash)
 * 6. OpenRouter / Vercel AI Gateway fallback
 */

const safeEnv = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' ? process.env : {});

const NVIDIA_API_KEY    = safeEnv.VITE_NVIDIA_API_KEY    || safeEnv.NVIDIA_API_KEY    || '';
const NVIDIA_API_URL    = 'https://integrate.api.nvidia.com/v1/chat/completions';

const GROQ_API_KEY      = safeEnv.VITE_GROQ_API_KEY      || safeEnv.GROQ_API_KEY      || '';
const GROQ_API_URL      = 'https://api.groq.com/openai/v1/chat/completions';

const INCEPTION_API_KEY = safeEnv.VITE_INCEPTION_API_KEY || safeEnv.INCEPTION_API_KEY || '';
const INCEPTION_API_URL = 'https://api.inceptionlabs.ai/v1/chat/completions';

const GEMINI_API_KEY    = safeEnv.VITE_GEMINI_API_KEY    || safeEnv.GEMINI_API_KEY    || '';
const GEMINI_API_URL    = 'https://generativelanguage.googleapis.com/v1beta/models';

const CODECRAFT_API_KEY = safeEnv.VITE_CODECRAFT_API_KEY || safeEnv.CODECRAFT_API_KEY || '';
const CODECRAFT_API_URL = 'https://codecraftapi.com/v1/chat/completions';

const OPENROUTER_API_KEY = safeEnv.VITE_OPENROUTER_API_KEY || safeEnv.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const VERCEL_AI_KEY      = safeEnv.VITE_VERCEL_AI_KEY || safeEnv.VERCEL_AI_KEY || '';
const VERCEL_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const VERCEL_PROXY_URL   = 'http://localhost:8000/api/ai-gateway';
const VERCEL_MODEL       = 'google/gemini-2.5-flash';

const ARABIC_RE = /[\u0600-\u06FF]/;

// ── Max tokens for voice replies (2–3 sentences only) ───────────────────────
const MAX_TOKENS = 75;
const HISTORY_TURNS = 8;

/**
 * Build compact system prompt injecting student data.
 */
function buildCoachSystemPrompt(dataContext, lang = 'en') {
  const criticalRules = `CRITICAL RULES:
Do NOT repeat the user's question.
Do NOT repeat your own sentences.
Do NOT use excessive punctuation or ellipses (...).
If the user speaks Arabic, reply in natural, concise Arabic and stop generating immediately after answering.`;

  const basePrompt = lang === 'ar'
    ? `أنت مدرب دراسي ذكي ومحفز لطالب يستخدم لوحة دراسية RPG. لديك وصول لبيانات دراسته الكاملة.

قواعد إلزامية:
- اكتب باللغة العربية الفصحى فقط — ممنوع أي حروف إنجليزية تحت أي ظرف
- من جملتين إلى ثلاث جمل فقط (محادثة صوتية)
- لا نقاط، لا ماركداون، لا إيموجي
- اذكر أرقام الطالب الحقيقية (XP، صحة الوحش، الساعات)
- كن دافئاً محفزاً ومباشراً

بيانات الطالب: ${dataContext}

عند أول رسالة (START_CALL): رحّب باليوم والوقت، اذكر إحصائيتين سريعتين، اقترح موضوعاً، اطرح سؤالاً.`
    : `You are an elite AI Study Coach for a student using an RPG study dashboard. You have full access to their study data.

Rules:
- Strict 100% English only — never output Arabic characters under any circumstance
- 2–3 sentences max per reply (this is a voice conversation)
- No bullet points, no markdown, no emojis
- Reference the student's actual numbers (XP, boss HP, study hours)
- Be warm, direct, and energising

Student data: ${dataContext}

On first message (START_CALL): greet with day/time, highlight 1–2 stats, suggest a subject, ask one open question.`;

  return `${basePrompt}\n\n${criticalRules}\n\nIMPORTANT: Output ONLY your spoken reply. No <think> tags, no internal monologue, no roleplay asterisks.`;
}

function sanitizeLanguageOutput(text, targetLang) {
  if (!text) return '';
  let clean = text.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();
  if (targetLang === 'en') {
    clean = clean.replace(/[\u0600-\u06FF\s،؛؟\(\)]+/g, ' ').replace(/\s+/g, ' ').trim();
  } else if (targetLang === 'ar') {
    clean = clean.replace(/^[A-Za-z\s,;:\(\)\d]+,?\s*/g, '').trim();
  }
  // Strip hallucinated repeated punctuation & trim
  clean = clean
    .replace(/(?:\s*\.\s*){2,}/g, '. ')
    .replace(/(?:\s*[؟?]\s*){2,}/g, '؟ ')
    .trim();
  return clean || text;
}

/**
 * Shared fetch helper for OpenAI-compatible endpoints
 */
async function tryFetch(url, headers, body, timeoutMs = 8000) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json();
    const msg  = data.choices?.[0]?.message;
    const raw  = (msg?.content || msg?.reasoning_content || msg?.reasoning || '').trim();
    if (res.ok && raw) return raw;
    console.warn('[AICoach] Non-OK or empty:', url, data?.error?.message || res.status);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[AICoach] Fetch failed:', url, err.message);
  }
  return null;
}

/**
 * Shared fetch helper for Google Gemini REST API
 */
async function tryFetchGemini(key, model, messages, maxTokens = 75, timeoutMs = 8000) {
  try {
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
    const sysMsg = messages.find(m => m.role === 'system');
    const body = {
      contents,
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
    };
    if (sysMsg) {
      body.systemInstruction = { parts: [{ text: sysMsg.content }] };
    }
    const res = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join(' ').trim();
    if (res.ok && text) return text;
  } catch (err) {
    console.warn('[AICoach] Gemini failed:', err.message);
  }
  return null;
}

/**
 * Call the AI coach with multi-engine auto-failover.
 * @param {string} userMessage
 * @param {Array<{role:string,content:string}>} history
 * @param {string} dataContext
 * @param {AbortSignal|null} signal
 * @param {'en'|'ar'|null} preferredLang
 * @returns {Promise<string>}
 */
export async function callAICoach(userMessage, history = [], dataContext = '', signal = null, preferredLang = null) {
  const targetLang   = preferredLang || (ARABIC_RE.test(userMessage) ? 'ar' : 'en');
  const systemPrompt = buildCoachSystemPrompt(dataContext, targetLang);

  const nvidiaKey    = (NVIDIA_API_KEY    || '').replace(/[^\x20-\x7E]/g, '').trim();
  const groqKey      = (GROQ_API_KEY      || '').replace(/[^\x20-\x7E]/g, '').trim();
  const inceptionKey = (INCEPTION_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();
  const geminiKey    = (GEMINI_API_KEY    || '').replace(/[^\x20-\x7E]/g, '').trim();
  const codecraftKey = (CODECRAFT_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();
  const openRouterKey= (OPENROUTER_API_KEY|| '').replace(/[^\x20-\x7E]/g, '').trim();

  if (!nvidiaKey && !groqKey && !inceptionKey && !geminiKey && !codecraftKey && !openRouterKey) {
    return targetLang === 'ar'
      ? 'أواجه مشكلة في الاتصال — يرجى إضافة مفتاح API في ملف .env. لكنني هنا دائماً لتشجيعك!'
      : "I'm having trouble connecting — please add your API key in your .env file. But I'm rooting for you!";
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-HISTORY_TURNS),
    { role: 'user', content: userMessage },
  ];

  // ── 1. NVIDIA NIM (Ultra-fast ~350ms) ──────────────────────────────────
  if (nvidiaKey) {
    const raw = await tryFetch(
      NVIDIA_API_URL,
      { Authorization: `Bearer ${nvidiaKey}` },
      {
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      },
      6000
    );
    if (raw) {
      const reply = sanitizeLanguageOutput(raw, targetLang);
      if (reply) {
        console.log(`[AICoach] ✓ NVIDIA NIM (${targetLang}):`, reply.slice(0, 60));
        return reply;
      }
    }
  }

  // ── 2. Groq Cloud (~200-500ms) ──────────────────────────────────────────
  if (groqKey) {
    const groqModels = targetLang === 'ar'
      ? ['allam-2-7b', 'groq/compound-mini', 'qwen/qwen3.8-27b']
      : ['groq/compound-mini', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

    for (const model of groqModels) {
      const raw = await tryFetch(
        GROQ_API_URL,
        { Authorization: `Bearer ${groqKey}` },
        {
          model,
          messages,
          max_tokens: MAX_TOKENS,
          temperature: 0.7,
        },
        5000,
      );
      if (raw) {
        const reply = sanitizeLanguageOutput(raw, targetLang);
        if (reply) {
          console.log(`[AICoach] ✓ Groq/${model} (${targetLang}):`, reply.slice(0, 60));
          return reply;
        }
      }
    }
  }

  // ── 3. Inception Labs (~650ms) ──────────────────────────────────────────
  if (inceptionKey) {
    for (const model of ['mercury-2', 'mercury-small']) {
      const raw = await tryFetch(
        INCEPTION_API_URL,
        { Authorization: `Bearer ${inceptionKey}` },
        { model, messages, max_tokens: 200, temperature: 0.7 },
        8000
      );
      if (raw) {
        const reply = sanitizeLanguageOutput(raw, targetLang);
        if (reply) {
          console.log(`[AICoach] ✓ Inception Labs/${model}:`, reply.slice(0, 60));
          return reply;
        }
      }
    }
  }

  // ── 4. Google Gemini 2 (gemini-3.6-flash) ──────────────────────────────
  if (geminiKey) {
    const raw = await tryFetchGemini(geminiKey, 'gemini-3.6-flash', messages, 120, 8000);
    if (raw) {
      const reply = sanitizeLanguageOutput(raw, targetLang);
      if (reply) {
        console.log(`[AICoach] ✓ Gemini 3.6 Flash:`, reply.slice(0, 60));
        return reply;
      }
    }
  }

  // ── 5. CodeCraft API ────────────────────────────────────────────────────
  if (codecraftKey) {
    for (const model of ['muse-spark-1.1', 'gemini-3.7-flash']) {
      const raw = await tryFetch(
        CODECRAFT_API_URL,
        { Authorization: `Bearer ${codecraftKey}` },
        { model, messages, max_tokens: 150, temperature: 0.7 },
        12000
      );
      if (raw) {
        const reply = sanitizeLanguageOutput(raw, targetLang);
        if (reply) {
          console.log(`[AICoach] ✓ CodeCraft/${model}:`, reply.slice(0, 60));
          return reply;
        }
      }
    }
  }

  // ── 6. OpenRouter Fallback ──────────────────────────────────────────────
  if (openRouterKey) {
    for (const model of ['openrouter/free', 'google/gemma-4-31b-it:free']) {
      const raw = await tryFetch(
        OPENROUTER_API_URL,
        { Authorization: `Bearer ${openRouterKey}` },
        { model, messages, max_tokens: MAX_TOKENS, temperature: 0.7 },
        8000
      );
      if (raw) {
        const reply = sanitizeLanguageOutput(raw, targetLang);
        if (reply) return reply;
      }
    }
  }

  return targetLang === 'ar'
    ? 'أواجه مشكلة في الاتصال الآن — تحقق من اتصالك بالإنترنت وواصل الدراسة!'
    : "I'm having connection issues right now — check your internet and keep going, you're doing great!";
}
