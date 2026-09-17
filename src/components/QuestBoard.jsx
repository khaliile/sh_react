import { useState } from 'react';
import {
  FaScroll, FaCoins, FaCheckCircle, FaStar, FaLock,
  FaRunning, FaBolt, FaCrosshairs, FaFire, FaLayerGroup,
  FaRobot, FaSpinner, FaTrash, FaMagic
} from 'react-icons/fa';
import { useQuestStorage } from '../hooks/useQuestStorage';
import { useLanguage } from '../contexts/LanguageContext';

const QUEST_ICONS = {
  marathon: <FaRunning style={{ color: '#38bdf8' }} />,
  energy: <FaBolt style={{ color: '#f59e0b' }} />,
  sword: <FaCrosshairs style={{ color: '#ef4444' }} />,
  flame: <FaFire style={{ color: '#ec4899' }} />,
  cards: <FaLayerGroup style={{ color: '#8b5cf6' }} />,
  ai: <FaRobot style={{ color: '#a855f7' }} />,
};

export default function QuestBoard() {
  const { quests, claimQuest, claimableCount, addCustomAiQuests, clearCustomAiQuests, hasCustomQuests } = useQuestStorage();
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const [toast, setToast] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleGenerateAIQuests = async () => {
    setAiGenerating(true);
    try {
      const targetLang = isAr ? 'Arabic' : 'English';
      let notesSummary = '';
      try {
        const savedNotes = JSON.parse(localStorage.getItem('study_hub_notes') || '[]');
        notesSummary = savedNotes.slice(0, 3).map(n => n.title).join(', ');
      } catch {}

      const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
      const systemPrompt = `You are the Grand Quest Master of a fantasy study RPG.
Generate 2 unique, highly motivating, gamified study quests based on the student's learning profile.

CRITICAL INSTRUCTION: You MUST return all "title" and "desc" values strictly in ${targetLang}. Unit for study should be "${isAr ? 'دقيقة' : 'mins'}".

OUTPUT FORMAT — Return ONLY a JSON array with this exact structure:
[
  {
    "id": "ai_quest_${Date.now()}_1",
    "title": "Epic Quest Title in ${targetLang}",
    "desc": "Actionable task description in ${targetLang}",
    "iconKey": "ai",
    "target": 45,
    "unit": "${isAr ? 'دقيقة' : 'mins'}",
    "rewardCoins": 150,
    "rewardXp": 300,
    "type": "custom_study"
  }
]
Output pure JSON array only, no markdown code blocks.`;

      const userPrompt = notesSummary
        ? `Generate RPG quests in ${targetLang} tailored to my study subjects: ${notesSummary}`
        : `Generate 2 epic RPG study quests in ${targetLang} for this week.`;

      const payload = {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.5
      };

      let parsed = null;

      // 1. Direct Gateway
      try {
        const res = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${VERCEL_AI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(12000),
        });

        const data = await res.json();
        if (res.ok) {
          const raw = data?.choices?.[0]?.message?.content || '';
          const clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
          parsed = JSON.parse(clean);
        }
      } catch (err) {
        console.warn('[Quest AI] Direct Vercel failed, trying local proxy:', err.message);
      }

      // 2. Local Proxy fallback
      if (!parsed) {
        try {
          const res = await fetch('http://localhost:8000/api/ai-gateway', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(12000),
          });
          if (res.ok) {
            const data = await res.json();
            const raw = data?.choices?.[0]?.message?.content || '';
            const clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
            parsed = JSON.parse(clean);
          }
        } catch (proxyErr) {
          console.warn('[Quest AI] Local proxy failed:', proxyErr.message);
        }
      }

      // 3. Guaranteed Localized Fallback on network/503 issues
      const arQuestFallback = [
        {
          id: `ai_quest_${Date.now()}_1`,
          title: 'بروتوكول التركيز العميق',
          desc: 'أنجز 45 دقيقة من العمل المركّز دون انقطاع',
          iconKey: 'ai',
          target: 45,
          unit: 'دقيقة',
          rewardCoins: 150,
          rewardXp: 300,
          type: 'custom_study'
        },
        {
          id: `ai_quest_${Date.now()}_2`,
          title: 'غارة المعرفة التكتيكية',
          desc: 'راجع 15 بطاقة دراسية لتعزيز الاستيعاب العلمي',
          iconKey: 'cards',
          target: 15,
          unit: 'بطاقة',
          rewardCoins: 100,
          rewardXp: 200,
          type: 'custom_study'
        }
      ];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        parsed = language === 'ar' ? arQuestFallback : [
          {
            id: `ai_quest_${Date.now()}_1`,
            title: 'Deep Focus Protocol',
            desc: 'Complete 45 minutes of uninterrupted deep study',
            iconKey: 'ai',
            target: 45,
            unit: 'mins',
            rewardCoins: 150,
            rewardXp: 300,
            type: 'custom_study'
          },
          {
            id: `ai_quest_${Date.now()}_2`,
            title: 'Tactical Knowledge Raid',
            desc: 'Review 15 study flashcards to solidify mastery',
            iconKey: 'cards',
            target: 15,
            unit: 'cards',
            rewardCoins: 100,
            rewardXp: 200,
            type: 'custom_study'
          }
        ];
      }

      // 4. Language validation — ensure response matches active UI language
      const enQuestFallback = [
        {
          id: `ai_quest_${Date.now()}_1`,
          title: 'Deep Focus Protocol',
          desc: 'Complete 45 minutes of uninterrupted deep study',
          iconKey: 'ai',
          target: 45,
          unit: 'mins',
          rewardCoins: 150,
          rewardXp: 300,
          type: 'custom_study'
        },
        {
          id: `ai_quest_${Date.now()}_2`,
          title: 'Tactical Knowledge Raid',
          desc: 'Review 15 study flashcards to solidify mastery',
          iconKey: 'cards',
          target: 15,
          unit: 'cards',
          rewardCoins: 100,
          rewardXp: 200,
          type: 'custom_study'
        }
      ];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstTitle = parsed[0].title || '';
        const arabicChars = (firstTitle.match(/[\u0600-\u06FF]/g) || []).length;
        const latinChars = (firstTitle.match(/[a-zA-Z]/g) || []).length;
        if (isAr && latinChars > arabicChars) {
          parsed = arQuestFallback;
        } else if (!isAr && arabicChars > latinChars) {
          parsed = enQuestFallback;
        }
      }

      addCustomAiQuests(parsed);
      showToast(isAr 
        ? `تم إضافة ${parsed.length} مهام ذكاء اصطناعي جديدة إلى اللوحة!` 
        : `Added ${parsed.length} AI Quest Bounties to the Board!`);
    } catch (err) {
      const fallbackQuests = isAr ? [
        {
          id: `ai_quest_${Date.now()}_1`,
          title: 'بروتوكول التركيز العميق',
          desc: 'أنجز 45 دقيقة من العمل المركّز دون انقطاع',
          iconKey: 'ai',
          target: 45,
          unit: 'دقيقة',
          rewardCoins: 150,
          rewardXp: 300,
          type: 'custom_study'
        }
      ] : [
        {
          id: `ai_quest_${Date.now()}_1`,
          title: 'Deep Focus Protocol',
          desc: 'Complete 45 minutes of uninterrupted deep study',
          iconKey: 'ai',
          target: 45,
          unit: 'mins',
          rewardCoins: 150,
          rewardXp: 300,
          type: 'custom_study'
        }
      ];
      addCustomAiQuests(fallbackQuests);
      showToast(language === 'ar' ? 'تم تفعيل مهمة الذكاء الاصطناعي بنجاح!' : 'Activated AI Bounty Quest!');
    } finally {
      setAiGenerating(false);
    }
  };


  const handleClaim = (q) => {
    const res = claimQuest(q.id);
    if (res.success) {
      showToast(res.message);
      try {
        window.dispatchEvent(new CustomEvent('mascot-event', {
          detail: {
            eventType: 'TASK_COMPLETED',
            taskName: q.title,
            userMessage: `Claimed bounty quest: "${q.title}" (+${q.rewardXp} XP, +${q.rewardCoins} Coins)`
          }
        }));
      } catch { /* noop */ }
    } else {
      showToast(res.message);
    }
  };

  return (
    <div className="arena-card quest-board-card">
      <div className="quest-board-header">
        <div className="quest-title-flex">
          <FaScroll style={{ color: '#f59e0b', fontSize: '1.25rem' }} />
          <div>
            <h3>{t('quest.weeklyBoard')}</h3>
            <p>{t('quest.weeklySubtitle')}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleGenerateAIQuests}
            disabled={aiGenerating}
            className="quest-ai-btn"
            title="Generate personalized AI study bounties"
          >
            {aiGenerating ? <FaSpinner className="quest-ai-spinner" /> : <FaMagic className="quest-ai-magic-icon" />}
            {aiGenerating ? t('quest.summoning') : t('quest.aiBounties')}
          </button>

          {hasCustomQuests && (
            <button
              onClick={clearCustomAiQuests}
              className="quest-clear-btn"
              title="Clear custom AI bounties"
            >
              <FaTrash />
            </button>
          )}

          {claimableCount > 0 && (
            <div className="quest-claimable-badge">
              <FaStar style={{ color: '#f59e0b', marginRight: '5px' }} />
              {t('quest.rewardsReady', { count: claimableCount, s: claimableCount > 1 ? 's' : '' })}
            </div>
          )}
        </div>
      </div>


      <div className="quest-list-grid">
        {quests.map(q => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));

          return (
            <div
              key={q.id}
              className={`quest-item-card ${q.isClaimed ? 'claimed' : q.isCompleted ? 'completed' : 'in-progress'}`}
            >
              <div className="quest-icon-col">
                <span className="quest-icon-badge">{QUEST_ICONS[q.iconKey] || QUEST_ICONS[q.icon] || <FaScroll />}</span>
              </div>

              <div className="quest-details-col">
                <div className="quest-name-row">
                  <h4>{q.title}</h4>
                  <div className="quest-rewards-pill">
                    <span className="reward-coins">
                      <FaCoins style={{ fontSize: '0.7rem', marginRight: '3px' }} />
                      +{q.rewardCoins}
                    </span>
                    <span className="reward-xp">+{q.rewardXp} XP</span>
                  </div>
                </div>
                <p className="quest-desc">{q.desc}</p>

                <div className="quest-progress-track">
                  <div className="quest-progress-bar">
                    <div
                      className={`quest-progress-fill ${q.isCompleted ? 'done' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="quest-progress-text">
                    {q.progress} / {q.target} {q.unit} ({pct}%)
                  </span>
                </div>
              </div>

              <div className="quest-action-col">
                {q.isClaimed ? (
                  <span className="quest-status-pill claimed-pill">
                    <FaCheckCircle /> {t('quest.claimed')}
                  </span>
                ) : q.isCompleted ? (
                  <button className="claim-quest-btn pulse-glow" onClick={() => handleClaim(q)}>
                    {t('quest.claimReward')}
                  </button>
                ) : (
                  <span className="quest-status-pill pending-pill">
                    {t('quest.inProgress')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="familiar-toast fade-in">{toast}</div>}
    </div>
  );
}
