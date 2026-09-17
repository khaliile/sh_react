/**
 * feynmanJudgeService.js
 * Dynamic AI Evaluation Engine for The Hall of the Feynman Tribunal.
 * Evaluates student explanations with 3 distinct cognitive personas:
 * 1. The Skeptic Professor (Logical Rigor & Hidden Assumptions)
 * 2. The Curious Child (Analogies & Jargon Elimination)
 * 3. The Pragmatic Engineer (Real-World Constraints & Edge Cases)
 */

import { queryUnifiedAI, sanitizeAIReply } from './unifiedAIService.js';
import { getRandomTribunalEvaluation } from '../data/feynmanJudgeReplies.js';

/**
 * Strips punctuation or markdown that could confuse TTS engines
 */
function cleanForTTS(text) {
  if (!text) return '';
  return text
    .replace(/[*#_`~[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate diverse dynamic feedback from 105+ handcrafted replies bank
 */
export function generateOfflineFeedback(concept, explanation, isAr) {
  return getRandomTribunalEvaluation(concept, explanation, isAr);
}

/**
 * Evaluates the student's explanation using the Live Unified AI with automatic fallback
 *
 * @param {Object} params
 * @param {string} params.concept - Concept being explained
 * @param {string} params.explanation - Student's plain language text
 * @param {boolean} params.isAr - Whether evaluation should be in Arabic
 * @returns {Promise<{ skeptic: string, child: string, engineer: string, scores: { logic: number, simplicity: number, practicality: number }, isAI: boolean, provider?: string }>}
 */
/**
 * Bulletproof parser for LLM JSON outputs (handles unescaped newlines and markdown fences)
 */
function safeParseJudgeJSON(raw) {
  if (!raw) return null;

  // 1. Direct parse attempt
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.skeptic && parsed.child && parsed.engineer) {
        return parsed;
      }
    }
  } catch {}

  // 2. Clean control characters and retry
  try {
    const cleaned = raw.replace(/[\x00-\x1F\x7F]/g, c => (c === '\n' || c === '\r' || c === '\t' ? ' ' : ''));
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.skeptic && parsed.child && parsed.engineer) {
        return parsed;
      }
    }
  } catch {}

  // 3. Regex field extraction fallback
  try {
    const skeptic = raw.match(/["']skeptic["']\s*:\s*["']([\s\S]*?)(?=["']\s*,\s*["']child|["']\s*,\s*["']scores|["']\s*})/i)?.[1];
    const child = raw.match(/["']child["']\s*:\s*["']([\s\S]*?)(?=["']\s*,\s*["']engineer|["']\s*,\s*["']scores|["']\s*})/i)?.[1];
    const engineer = raw.match(/["']engineer["']\s*:\s*["']([\s\S]*?)(?=["']\s*,\s*["']scores|["']\s*})/i)?.[1];
    const logic = raw.match(/["']logic["']\s*:\s*(\d+)/i)?.[1];
    const simplicity = raw.match(/["']simplicity["']\s*:\s*(\d+)/i)?.[1];
    const practicality = raw.match(/["']practicality["']\s*:\s*(\d+)/i)?.[1];

    if (skeptic && child && engineer) {
      return {
        skeptic: skeptic.replace(/\s+/g, ' ').trim(),
        child: child.replace(/\s+/g, ' ').trim(),
        engineer: engineer.replace(/\s+/g, ' ').trim(),
        scores: {
          logic: parseInt(logic || '82', 10),
          simplicity: parseInt(simplicity || '85', 10),
          practicality: parseInt(practicality || '80', 10),
        }
      };
    }
  } catch {}

  return null;
}

export async function evaluateTribunalWithAI({ concept, explanation, isAr }) {
  const safeConcept = concept || (isAr ? 'المفهوم المختار' : 'The Chosen Concept');
  const safeExplanation = explanation.trim();

  const systemPrompt = isAr
    ? `أنت المحرك التقييمي لـ "محكمة فاينمان المعرفية" (The Feynman Tribunal).
مهمتك تقييم شرح الطالب لـ "${safeConcept}" وتقديم نقد مخصص وحيوي من 3 قضاة متميزين (كل قاضٍ يتحدث في جملتين إلى 3 جمل سريعة وواضحة مخصصة للنطق الصوتي TTS دون رموز أو نقاط):

1. skeptic (البروفيسور المتشكك):
   - يدقق في الترابط المنطقي والسببية، ويكشف القفزات والتعميمات التخمينية بأسلوب أكاديمي صارم.
2. child (الطفل الفضولي):
   - يكره الكلمات المعقدة ويطلب تشبيهاً طفولياً ممتعاً (ألعاب، شوكولاتة، كرتون، سيارات سباق، بيتزا) بعفوية مرحة.
3. engineer (المهندس العملي):
   - يبحث في واقعية التنفيذ: نقاط الانهيار، حالات الحافة (edge cases)، الأرقام، وتكاليف التشغيل.

قيم أيضاً بدقة من 0 إلى 100: logic, simplicity, practicality.

أخرج كائن JSON صالح فقط:
{
  "skeptic": "نص البروفيسور في 2-3 جمل",
  "child": "نص الطفل في 2-3 جمل",
  "engineer": "نص المهندس في 2-3 جمل",
  "scores": { "logic": 85, "simplicity": 90, "practicality": 82 }
}`
    : `You are the evaluation engine for The Feynman Tribunal.
Evaluate the student's explanation of "${safeConcept}" with 3 archetypal judges (2-3 concise spoken sentences each, without bullet points, emojis, or markdown):

1. skeptic (The Skeptic Professor): Scrutinizes logical causality, unproven leaps, circular logic.
2. child (The Curious Child): Jargon crusher; demands a playful everyday analogy (toys, games, food, superpowers).
3. engineer (The Pragmatic Engineer): System realist; failure points, scalability, latency, edge cases.

Provide scores 0-100: logic, simplicity, practicality.
Output valid JSON only:
{
  "skeptic": "2-3 sentences in English",
  "child": "2-3 sentences in English",
  "engineer": "2-3 sentences in English",
  "scores": { "logic": 85, "simplicity": 90, "practicality": 82 }
}`;

  const userPrompt = isAr
    ? `المفهوم: "${safeConcept}"\nشرح الطالب:\n"${safeExplanation}"`
    : `Concept: "${safeConcept}"\nStudent's Explanation:\n"${safeExplanation}"`;

  try {
    const aiResponse = await queryUnifiedAI({
      prompt: userPrompt,
      systemPrompt,
      maxTokens: 500,
      preferredProvider: 'groq'
    });

    if (aiResponse?.reply) {
      const cleanReply = sanitizeAIReply(aiResponse.reply);
      const parsed = safeParseJudgeJSON(cleanReply);
      if (parsed?.skeptic && parsed?.child && parsed?.engineer) {
        const logic = Math.min(99, Math.max(50, Number(parsed.scores?.logic) || 82));
        const simplicity = Math.min(99, Math.max(50, Number(parsed.scores?.simplicity) || 85));
        const practicality = Math.min(99, Math.max(50, Number(parsed.scores?.practicality) || 80));

        return {
          skeptic: cleanForTTS(parsed.skeptic),
          child: cleanForTTS(parsed.child),
          engineer: cleanForTTS(parsed.engineer),
          scores: { logic, simplicity, practicality },
          isAI: true,
          provider: aiResponse.provider || 'AI Tribunal Engine'
        };
      }
    }
  } catch (err) {
    console.warn('[FeynmanJudgeService] Live AI call failed, falling back to dynamic heuristic:', err.message);
  }

  // Graceful dynamic fallback from 105+ replies bank
  return generateOfflineFeedback(safeConcept, safeExplanation, isAr);
}
