import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { lastNDays } from '../hooks/useAppHooks';
import { todayKeyAt } from '../utils/dateKey';
import { FaGhost, FaSpinner, FaTimes, FaBolt } from 'react-icons/fa';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useLanguage } from '../contexts/LanguageContext';

function getWeekData(byDate, locale = 'en-US') {
  return lastNDays(byDate, 7, locale);
}

function getBestWeek(byDate, locale = 'en-US') {
  // Slide a 7-day window over all dates to find the week with highest total
  const keys = Object.keys(byDate).sort();
  if (keys.length === 0) return null;
  let bestTotal = 0, bestStart = null;
  for (let i = 0; i < keys.length; i++) {
    let total = 0;
    const startDate = new Date(keys[i]);
    for (let j = 0; j < 7; j++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + j);
      const k = todayKeyAt(d);
      total += (byDate[k] || 0);
    }
    if (total > bestTotal) { bestTotal = total; bestStart = keys[i]; }
  }
  if (!bestStart) return null;
  // Build 7-day array from best week start
  const out = [];
  const start = new Date(bestStart);
  for (let j = 0; j < 7; j++) {
    const d = new Date(start);
    d.setDate(d.getDate() + j);
    const k = todayKeyAt(d);
    const label = d.toLocaleDateString(locale, { weekday: 'short' });
    out.push({ day: label, mins: byDate[k] || 0 });
  }
  return { days: out, total: bestTotal, startDate: bestStart };
}

const CustomTooltip = ({ active, payload, label, isAr }) => {
  if (!active || !payload?.length) return null;
  const curr = payload.find(p => p.dataKey === 'current')?.value || 0;
  const best = payload.find(p => p.dataKey === 'ghost')?.value || 0;
  const fmt = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#60a5fa' }}>{isAr ? 'أنت' : 'You'}: {fmt(curr)}</div>
      <div style={{ color: '#a78bfa' }}>{isAr ? 'الشبح' : 'Ghost'}: {fmt(best)}</div>
      {curr > best
        ? <div style={{ color: '#10b981', marginTop: 4 }}>{isAr ? `متقدم بـ ${fmt(curr - best)}` : `Ahead by ${fmt(curr - best)}`}</div>
        : curr < best
        ? <div style={{ color: '#ef4444', marginTop: 4 }}>{isAr ? `متأخر بـ ${fmt(best - curr)}` : `Behind by ${fmt(best - curr)}`}</div>
        : <div style={{ color: '#f59e0b', marginTop: 4 }}>{isAr ? 'تعادل!' : 'Tied!'}</div>}
    </div>
  );
};

export default function ShadowRival({ log }) {
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const { addXpAndCoins } = useRpgStorage();
  const byDate = useMemo(() => log?.byDate || {}, [log?.byDate]);

  const locale = isAr ? 'ar-EG' : 'en-US';
  const currentWeek = useMemo(() => getWeekData(byDate, locale), [byDate, locale]);
  const bestWeek    = useMemo(() => getBestWeek(byDate, locale), [byDate, locale]);

  const chartData = useMemo(() => {
    return currentWeek.map((d, i) => ({
      day:     d.day,
      current: d.minutes,
      ghost:   bestWeek?.days[i]?.mins || 0,
    }));
  }, [currentWeek, bestWeek]);

  const currTotal = currentWeek.reduce((s, d) => s + d.minutes, 0);
  const bestTotal = bestWeek?.total || 0;
  const ahead = currTotal - bestTotal;
  const fmt = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;

  const statusColor = ahead > 0 ? '#10b981' : ahead < 0 ? '#ef4444' : '#f59e0b';
  const statusText  = ahead > 0 ? t('shadowRival.aheadGhost', { time: fmt(ahead) }) : ahead < 0 ? t('shadowRival.behindGhost', { time: fmt(-ahead) }) : t('shadowRival.tiedGhost');

  // ── AI Rival Trash-Talk State ──────────────────────────────────────────────
  const [rivalLoading, setRivalLoading] = useState(false);
  const [rivalDialogue, setRivalDialogue] = useState(null);

  const handleSummonRivalTrashTalk = async () => {
    setRivalLoading(true);
    try {
      const targetLang = isAr ? 'Arabic' : 'English';
      const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
      const systemPrompt = `You are the Shadow Rival — the dark, arrogant, but fiercely competitive alter-ego of the student.
You know their best week was ${Math.round(bestTotal / 60)}h, and their current week is ${Math.round(currTotal / 60)}h (${ahead >= 0 ? `they are ahead by ${Math.abs(Math.round(ahead / 60))}h` : `they are lagging behind by ${Math.abs(Math.round(ahead / 60))}h`}).

CRITICAL INSTRUCTION: The user's active UI language is ${targetLang}. You MUST generate all "dialogue" and "wager_challenge" values strictly in ${targetLang}.

OUTPUT FORMAT — Pure JSON object only:
{
  "dialogue": "A short 2-sentence fierce in-character trash-talk or warning in ${targetLang}",
  "wager_challenge": "A specific 1-sentence challenge in ${targetLang}",
  "reward_xp": 75
}
No markdown code blocks, pure JSON only.`;

      const payload = {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Shadow Rival, speak!' }
        ],
        max_tokens: 500,
        temperature: 0.6
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
        console.warn('[Shadow Rival] Direct Vercel failed, trying local proxy:', err.message);
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
          console.warn('[Shadow Rival] Local proxy failed:', proxyErr.message);
        }
      }

      // 3. Guaranteed Localized Fallback on network/503 issues
      const arFallback = {
        dialogue: "لم تدخل الساحة بقوة بعد هذا الأسبوع! استعد، فالظل يسعى لانتزاع صدارتك وتخطي أرقامك القياسية.",
        wager_challenge: "سجل 30 دقيقة دراسة مركزة قبل نهاية اليوم أو تنازل عن 50 XP لأعماق الظل.",
        reward_xp: 75
      };
      const enFallback = {
        dialogue: "You haven't stepped into the ring with full force this week! Prepare yourself, for the shadow aims to surpass your record.",
        wager_challenge: "Log 30 minutes of focused study before midnight or forfeit 50 XP to the abyss.",
        reward_xp: 75
      };

      if (!parsed) {
        parsed = isAr ? arFallback : enFallback;
      }

      // 4. Language validation — ensure response matches active UI language
      if (parsed && parsed.dialogue) {
        const arabicChars = (parsed.dialogue.match(/[\u0600-\u06FF]/g) || []).length;
        const latinChars = (parsed.dialogue.match(/[a-zA-Z]/g) || []).length;
        if (isAr && latinChars > arabicChars) {
          parsed = arFallback;
        } else if (!isAr && arabicChars > latinChars) {
          parsed = enFallback;
        }
      }

      setRivalDialogue(parsed);
      addXpAndCoins(15, 3, 'Provoked Shadow Rival');
    } catch (err) {
      console.warn('Rival talk failed:', err);
    } finally {
      setRivalLoading(false);
    }
  };


  return (
    <div className="arena-card rival-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{t('shadowRival.title')}</h3>
          <p className="arena-card-sub">{t('shadowRival.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleSummonRivalTrashTalk}
            disabled={rivalLoading}
            className="rival-talk-btn"
            title={t('shadowRival.provoke')}
          >
            {rivalLoading ? <FaSpinner className="rival-spin-icon" /> : <FaGhost className="rival-btn-ghost-icon" />}
            <span>{rivalLoading ? t('shadowRival.summoning') : t('shadowRival.rivalTalk')}</span>
          </button>
          <div className="rival-status-badge" style={{ background: `${statusColor}22`, color: statusColor, borderColor: `${statusColor}44` }}>
            {bestTotal === 0 ? t('shadowRival.noGhost') : ahead >= 0 ? t('shadowRival.winning') : t('shadowRival.losing')}
          </div>
        </div>
      </div>

      {/* AI Rival Dialogue Box */}
      {rivalDialogue && (
        <div className="rival-dialogue-box">
          <div className="rival-taunt-top-row">
            <div className="rival-taunt-badge">
              <FaGhost className="rival-ghost-icon-inline" />
              <span>{t('shadowRival.taunt')}</span>
            </div>
            <button
              type="button"
              onClick={() => setRivalDialogue(null)}
              className="rival-dialogue-close-btn"
              title="Dismiss"
              aria-label="Dismiss dialogue"
            >
              <FaTimes />
            </button>
          </div>
          <div className="rival-dialogue-content">
            <p className="rival-dialogue-text">
              <span className="rival-quote-glyph">“</span>
              {rivalDialogue.dialogue}
              <span className="rival-quote-glyph">”</span>
            </p>
          </div>
          {rivalDialogue.wager_challenge && (
            <div className="rival-wager-box">
              <div className="rival-wager-header">
                <div className="rival-wager-title-wrap">
                  <span className="rival-wager-icon"><FaBolt /></span>
                  <span className="rival-wager-title">{t('shadowRival.duelChallenge')}</span>
                </div>
                <span className="rival-wager-xp-pill">+{rivalDialogue.reward_xp || 75} XP</span>
              </div>
              <p className="rival-wager-text">{rivalDialogue.wager_challenge}</p>
            </div>
          )}
        </div>
      )}

      {bestTotal === 0 ? (
        <div className="rival-empty">
          <div className="rival-ghost-icon-wrap">
            <FaGhost className="rival-ghost-empty-icon" />
          </div>
          <div className="rival-empty-content">
            <div className="rival-empty-title">{t('shadowRival.createGhost')}</div>
            <div className="rival-empty-sub">{isAr ? 'سجل جلسات دراستك لتتبع وتحدي شبحك الشخصي' : 'Complete study sessions to record and challenge your best ghost pace'}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="rival-scores">
            <div className="rival-score-block">
              <span className="rival-score-val" style={{ color: '#3b82f6' }}>{fmt(currTotal)}</span>
              <span className="rival-score-label">{t('shadowRival.youThisWeek')}</span>
            </div>
            <div className="rival-vs">VS</div>
            <div className="rival-score-block">
              <span className="rival-score-val" style={{ color: '#a78bfa' }}>{fmt(bestTotal)}</span>
              <span className="rival-score-label">{t('shadowRival.ghostBestWeek')}</span>
            </div>
          </div>
          <div className="rival-status" style={{ color: statusColor }}>{statusText}</div>

          <div style={{ width: '100%', height: 150, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} barGap={2} barCategoryGap="25%">
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 11 }} />
                <YAxis stroke="#555" tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v/60)}h`} />
                <Tooltip content={<CustomTooltip isAr={isAr} />} />
                <Bar dataKey="current" name={t('shadowRival.you')}   fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="ghost"   name={t('shadowRival.ghost')} fill="#a78bfa" radius={[4,4,0,0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rival-legend">
            <span className="rival-legend-dot" style={{ background: '#3b82f6' }} /> {t('shadowRival.you')}
            <span className="rival-legend-dot" style={{ background: '#a78bfa', marginLeft: 12 }} /> {t('shadowRival.ghost')}
          </div>
        </>
      )}
    </div>
  );
}
