/**
 * mascotAI.js
 *
 * Mascot AI communication layer:
 * - Live app state aggregation
 * - Structured prompt builder with real-world temporal context
 * - Multi-provider fallback chain: Groq -> OpenRouter -> Inception -> Predefined Offline QA
 * - <think> tag stripper and text hygiene
 */

import { scheduleRoutine as defaultRoutine } from '../data/constants';
import { findOfflineResponse } from '../data/mascotOfflineQA';
import { queryUnifiedAI } from '../services/unifiedAIService';

const ARABIC_RE = /[\u0600-\u06FF]/;

// ── Groq Cloud (PRIMARY — ~300ms, free tier) ────────────────────────────
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODELS = [
  'llama-3.1-8b-instant',    // Llama 3.1 8B, ultra-fast
  'groq/compound-mini',      // Groq native, fastest
  'groq/compound',           // Groq native, smarter
  'qwen/qwen3.8-27b',        // Alibaba, capable fallback
  'openai/gpt-oss-20b',      // OpenAI-hosted on Groq
];

// ── Inception API (secondary) ────────────────────────────────────────────
export const INCEPTION_API_KEY = import.meta.env.VITE_INCEPTION_API_KEY || '';
export const INCEPTION_API_URL = 'https://api.inceptionlabs.ai/v1/chat/completions';

// ── OpenRouter API (tertiary fallback) ───────────────────────────────────
export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_OPENROUTER_KEY = INCEPTION_API_KEY;

/**
 * Strip <think>…</think> reasoning traces that some models (DeepSeek, Qwen)
 * leak into their output. Also catches unclosed tags at end of string.
 * Plus safety regex cleanup for repeated dots and question marks.
 */
export function stripThinkTags(text) {
  if (!text) return text;
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*/gi, '')   // unclosed tag
    .replace(/(?:\s*\.\s*){2,}/g, '. ')
    .replace(/(?:\s*[؟?]\s*){2,}/g, '؟ ')
    .replace(/[\u202F\u00A0\u2000-\u200B]/g, ' ') // normalize non-breaking/narrow spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Read live RPG + study + notes + routine state directly from localStorage
 */
export function readLiveAppState() {
  try {
    const rpg = JSON.parse(localStorage.getItem('app_rpg_state') || '{}');
    const xp = rpg.xp || 0;
    const level = Math.floor(xp / 250) + 1;
    
    // Read study log from both possible keys
    const timeLog = JSON.parse(localStorage.getItem('app_study_log') || localStorage.getItem('app_time_log') || '{}');
    const todayKey = new Date().toISOString().slice(0, 10);
    const byDate = timeLog.byDate || {};
    const todayMins = byDate[todayKey] || 0;
    const studyHours = (todayMins / 60).toFixed(1);

    // Calculate weekly study hours
    let weekTotalMins = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      weekTotalMins += (byDate[k] || 0);
    }
    const weeklyHours = (weekTotalMins / 60).toFixed(1);
    const dailyGoal = localStorage.getItem('app_daily_study_goal_hours') || '5';
    const weeklyGoal = localStorage.getItem('app_weekly_goal_hours') || '56';

    // Active Task
    const activeTask = localStorage.getItem('app_active_task') || localStorage.getItem('app_manual_active_task') || '';

    // Recent Notes
    let notesSummary = '';
    try {
      const notes = JSON.parse(localStorage.getItem('study_hub_notes') || '[]');
      if (notes && notes.length > 0) {
        notesSummary = notes.slice(0, 3).map(n => `"${n.title}" (${n.category || 'Study'})`).join(', ');
      }
    } catch {}

    // Streak calculation
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const k = d.toISOString().slice(0, 10);
      if ((byDate[k] || 0) > 0) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }

    // Schedule / Routine Info
    let routineSummary = '';
    let currentSlotText = '';
    let routineDetails = '';
    try {
      const customSchedule = JSON.parse(localStorage.getItem('app_routine_schedule') || 'null');
      const slots = Array.isArray(customSchedule) && customSchedule.length > 0 ? customSchedule : (defaultRoutine || []);
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const currentWeekday = now.toLocaleDateString('en-US', { weekday: 'long' });
      const progress = JSON.parse(localStorage.getItem('app_progress_state') || '{}');

      const activeSlot = slots.find(s => {
        if (!s.start || !s.end) return false;
        const [sh, sm] = s.start.split(':').map(Number);
        const [eh, em] = s.end.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        if (end > start) return currentMins >= start && currentMins < end;
        return currentMins >= start || currentMins < end;
      });

      if (activeSlot) {
        currentSlotText = `${activeSlot.start}-${activeSlot.end}: ${activeSlot.task}`;
      }

      const completedSlots = slots.filter(s => !!progress[`routine-${currentWeekday}-${s.id}`]).length;
      routineSummary = `${completedSlots}/${slots.length} completed`;
      routineDetails = slots.map(s => `${s.start}-${s.end} ${s.task} (${progress[`routine-${currentWeekday}-${s.id}`] ? 'Done' : 'Pending'})`).join(' | ');
    } catch {}

    return {
      level,
      xp,
      studyHours,
      weeklyHours,
      dailyGoal,
      weeklyGoal,
      streak,
      activeTask,
      notesSummary,
      bossHp: rpg.boss?.currentHp ?? 1000,
      currentSlotText,
      routineSummary,
      routineDetails,
    };
  } catch {
    return { level: 1, xp: 0, studyHours: '0.0', weeklyHours: '0.0', dailyGoal: '5', weeklyGoal: '56', streak: 0, activeTask: '', notesSummary: '', bossHp: 1000, currentSlotText: '', routineSummary: '', routineDetails: '' };
  }
}

/**
 * Build concise structured prompt incorporating live app state
 */
export function buildMascotPrompt(cfg, eventType, appState, userMessage = '') {
  const { level, bossHp, activeTask, studyHours, dailyGoal, streak, currentSlotText, routineSummary, routineDetails } = appState;

  if (eventType === 'USER_CHAT') {
    const contextHeader = `[LIVE APP DATA — Study: ${studyHours}h/${dailyGoal}h | Streak: ${streak}d | Level: ${level} | Current Slot: "${currentSlotText || 'Free Time'}" | Routine: ${routineSummary} (${routineDetails || ''})${activeTask ? ` | Active Task: "${activeTask}"` : ''}]`;
    return `${contextHeader}\n${userMessage || ''}`;
  }
  
  return [
    `[Event: ${eventType}]`,
    `[Lv${level} | Boss: ${bossHp}/1000]`,
    currentSlotText ? `[Current Slot: "${currentSlotText}"]` : '',
    activeTask ? `[Task: "${activeTask}"]` : '',
    userMessage ? userMessage : '',
  ].filter(Boolean).join(' ');
}

/**
 * Main query function for mascot conversational brain
 */
export async function queryMascotBrain({
  userPrompt,
  eventType = 'USER_CHAT',
  charConfig,
  isAr = false,
  chatHistory = [],
  llmApiKey = '',
  setIsOfflineMode = () => {},
}) {
  const cfg = charConfig;
  const rawKey = llmApiKey;
  const safeApiKey = ((rawKey && rawKey.trim()) ? rawKey : DEFAULT_OPENROUTER_KEY).replace(/[^\x20-\x7E]/g, '').trim();
  const appState = readLiveAppState();

  // ── Live Search Injection ────────────────────────────────────────────────
  const SEARCH_TRIGGERS = /\b(search|find|look\s*up|who|what|which|when|where|why|how|latest|newest|last|recent|news|current|today|now|2024|2025|2026|weather|price|score|result|release|released|update|happen|happened|events|iphone|apple|android|samsung|president|olympics|world\s*cup|champion|winner|movie|film|actor|تابع|ابحث|اخبار|أخبار|حالياً|الآن|اليوم|أحدث|اخر|آخر|سعر|نتيجة|من هو|ما هو|ما هي|ماذا حدث)\b/i;
  let searchContext = '';
  if (SEARCH_TRIGGERS.test(userPrompt) && eventType === 'USER_CHAT') {
    try {
      const recentMessages = (chatHistory || [])
        .slice(-4)
        .map(m => ({ role: m.role, content: m.content }));

      const searchRes = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: userPrompt,
          messages: recentMessages,
        }),
        signal: AbortSignal.timeout(4000),
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.summary) {
          searchContext = `\n\n[WEB CONTEXT — use this to answer accurately]:\n${searchData.summary}`;
        }
      }
    } catch {
      // Non-fatal search failure
    }
  }

  const enrichedUserPrompt = searchContext
    ? `${userPrompt}${searchContext}`
    : userPrompt;

  const structuredPrompt = buildMascotPrompt(cfg, eventType, appState, enrichedUserPrompt);
  const userWroteArabic = isAr || ARABIC_RE.test(userPrompt || '');

  const langInstruction = userWroteArabic
    ? `ARABIC RESPONSE RULES - EXTREMELY IMPORTANT:
1. Write ONLY in pure Arabic (العربية الفصحى)
2. USE COMPLETE TASHKIL (DIACRITICS)
3. Keep responses VERY SHORT - maximum 50 characters total
4. Use simple, clear Modern Standard Arabic`
    : 'Reply in English.';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentDateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const CRITICAL_RULE = `SPEECH BUBBLE PERSONA RULES — READ CAREFULLY:
=== REAL-WORLD TEMPORAL AWARENESS ===
The current real-world date is ${currentDateStr} (Year: ${currentYear}).
You live and operate in the year ${currentYear}.

=== RESPONSE LENGTH ===
Maximum 10 words. Think: anime speech bubble. One punchy sentence.
NEVER write more than 2 sentences. Shorter is always better.

=== PERSONALITY ===
You are a beloved anime character acting as the user's PERSONAL COACH & COMPANION.
Express your character's UNIQUE VOICE while being warm, engaging, encouraging, and friendly.

=== STRICTLY FORBIDDEN ===
- NEVER say "I cannot browse" or "As an AI"
- NEVER use asterisks for actions (*sighs*)
- NEVER output <think> or reasoning tags
- Do NOT repeat the user's question or sentences.`;

  const enrichedSystemPrompt = [
    cfg.systemPrompt,
    langInstruction,
    CRITICAL_RULE,
  ].join('\n\n---\n\n');

  const historySlice = chatHistory.slice(-10);

  // ── Unified Multi-Engine AI Query (NVIDIA NIM -> Groq -> Inception -> Gemini 2 -> CodeCraft) ──
  try {
    const aiResult = await queryUnifiedAI({
      prompt: structuredPrompt,
      systemPrompt: enrichedSystemPrompt,
      history: historySlice,
      maxTokens: 250
    });
    if (aiResult?.reply) {
      const assistantReply = stripThinkTags(aiResult.reply);
      setIsOfflineMode(false);
      return assistantReply;
    }
  } catch (err) {
    console.warn('[Mascot API] Unified multi-engine attempt failed, falling back:', err.message);
  }

  // ── 1. GROQ Fallback (~300ms) ─────────────────────────────────────────
  if (GROQ_API_KEY) {
    for (const groqModel of GROQ_MODELS) {
      try {
        const groqRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: enrichedSystemPrompt },
              ...historySlice,
              { role: 'user',  content: structuredPrompt },
            ],
            max_tokens: 200,
            temperature: 0.7,
            frequency_penalty: 0.6,
            presence_penalty: 0.6,
          }),
          signal: AbortSignal.timeout(8000),
        });

        const groqData = await groqRes.json();
        if (groqRes.ok && groqData.choices?.[0]?.message?.content) {
          const raw = groqData.choices[0].message.content.trim();
          const assistantReply = stripThinkTags(raw);
          setIsOfflineMode(false);
          return assistantReply;
        }
      } catch (err) {
        console.warn(`[Mascot API] Groq ${groqModel} failed:`, err.message);
      }
    }
  }

  // ── 2. OPENROUTER (secondary) ──────────────────────────────────────────
  if (safeApiKey) {
    const openrouterModels = userWroteArabic
      ? [
          'google/gemma-4-31b-it:free',
          'nvidia/nemotron-3-super-120b-a12b:free',
          'openrouter/free',
        ]
      : [
          'google/gemma-4-31b-it:free',
          'nvidia/nemotron-3-super-120b-a12b:free',
          'nvidia/nemotron-3-ultra-550b-a55b:free',
          'openrouter/free',
        ];

    for (const targetModel of openrouterModels) {
      try {
        const res = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${safeApiKey}`,
            'HTTP-Referer': window.location.origin || 'http://localhost:5173',
            'X-Title': 'Study Hub - Executive Chief of Staff',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: enrichedSystemPrompt },
              ...historySlice,
              { role: 'user',  content: structuredPrompt },
            ],
            max_tokens: 250,
            temperature: 0.7,
            frequency_penalty: 0.6,
            presence_penalty: 0.6,
          }),
          signal: AbortSignal.timeout(20000),
        });

        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          const assistantReply = stripThinkTags(data.choices[0].message.content.trim());
          setIsOfflineMode(false);
          return assistantReply;
        }
      } catch (err) {
        console.warn(`[Mascot API] OpenRouter ${targetModel} failed:`, err.message);
      }
    }
  }

  // ── 3. INCEPTION (tertiary fallback) ────────────────────────────────
  if (INCEPTION_API_KEY) {
    const inceptionModels = ['mercury-2', 'mercury', 'mercury-small'];
    for (const targetModel of inceptionModels) {
      try {
        const res = await fetch(INCEPTION_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${INCEPTION_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: enrichedSystemPrompt },
              ...historySlice,
              { role: 'user',  content: structuredPrompt },
            ],
            max_tokens: 300,
            temperature: 0.9,
            frequency_penalty: 0.8,
            presence_penalty: 0.6,
          }),
          signal: AbortSignal.timeout(20000),
        });

        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          const assistantReply = stripThinkTags(data.choices[0].message.content.trim());
          setIsOfflineMode(false);
          return assistantReply;
        }
      } catch (err) {
        console.warn(`[Mascot API] Inception ${targetModel} failed:`, err.message);
      }
    }
  }

  // ── Offline fallback ────────────────────────────────────────────────
  setIsOfflineMode(true);
  return findOfflineResponse(userPrompt, charConfig.name, userWroteArabic);
}
