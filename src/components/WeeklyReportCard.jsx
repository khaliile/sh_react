import { useState, useEffect } from 'react';
import './WeeklyReportCard.css';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useTimeTracker, computeStreak, lastNDays } from '../hooks/useAppHooks';
import {
  FaRobot,
  FaSpinner,
  FaExclamationTriangle,
  FaMagic,
  FaClipboardList,
  FaCalendarAlt,
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
  FaBullseye,
  FaPrint,
  FaTimes
} from 'react-icons/fa';

// ── Vercel AI Gateway constants ─────────────────────────────────────────────
const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
const VERCEL_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const VERCEL_BACKEND_PROXY = 'http://localhost:8000/api/ai-gateway';
const VERCEL_MODEL = 'google/gemini-2.5-flash';

const COMMENTS = (grade) => {
  if (grade >= 90) return "Exceptional performance. You're operating at an elite level. Keep this momentum!";
  if (grade >= 75) return "Strong week. Your consistency is building real compound knowledge.";
  if (grade >= 60) return "Good effort this week. A few more focused sessions would push you to the next tier.";
  if (grade >= 40) return "Below your potential. Identify the days you lost and protect them next week.";
  return "A tough week. Every expert has off-weeks. Reset, re-commit, and show up stronger.";
};

function printReport() {
  window.print();
}

export default function WeeklyReportCard({ onClose }) {
  const { xp, level, boss, addXpAndCoins } = useRpgStorage();
  const { log } = useTimeTracker();
  const streak = computeStreak(log?.byDate || {});
  const week = lastNDays(log?.byDate || {}, 7);

  const totalWeekMinutes = week.reduce((s, d) => s + d.minutes, 0);
  const bestDay = week.reduce((best, d) => d.minutes > best.minutes ? d : best, { minutes: 0, day: 'N/A' });
  const activeDays = week.filter(d => d.minutes > 0).length;
  const bossDefeated = boss?.defeated || false;

  // Track theme reactively
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem('app_theme') || 'dark';
  });

  useEffect(() => {
    const handleThemeEvent = (e) => {
      const next = e?.detail?.theme || document.documentElement.getAttribute('data-theme') || localStorage.getItem('app_theme') || 'dark';
      setTheme(next);
    };
    window.addEventListener('theme-changed', handleThemeEvent);
    window.addEventListener('storage', handleThemeEvent);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
          setTheme(currentTheme);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('theme-changed', handleThemeEvent);
      window.removeEventListener('storage', handleThemeEvent);
      observer.disconnect();
    };
  }, []);

  const isLight = theme === 'light';

  // AI Diagnostic State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [aiError, setAiError] = useState('');

  // Lock background scrolling while modal is open
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // Compute grade (0-100)
  let score = 0;
  score += Math.min(40, (totalWeekMinutes / (70 * 60)) * 40); // up to 40 for hours
  score += Math.min(20, (activeDays / 7) * 20); // up to 20 for consistency
  score += Math.min(20, (streak / 10) * 20); // up to 20 for streak
  score += bossDefeated ? 20 : 0; // 20 for boss defeat
  const grade = Math.round(score);

  const gradeLabel = grade >= 90 ? 'A+' : grade >= 80 ? 'A' : grade >= 70 ? 'B+' :
    grade >= 60 ? 'B' : grade >= 50 ? 'C' : 'D';
  const gradeColor = grade >= 80 ? '#10b981' : grade >= 60 ? '#f59e0b' : '#ef4444';

  const ringBgColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)';
  const emptyBarColor = isLight ? '#e2e8f0' : '#1e293b';

  const weekStr = (() => {
    const start = week[0]?.date || '';
    const end = week[6]?.date || '';
    return `${start} → ${end}`;
  })();

  const handleGenerateAIDiagnostic = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const summaryContext = {
        grade: `${gradeLabel} (${grade}/100)`,
        totalHours: (totalWeekMinutes / 60).toFixed(1),
        activeDays: `${activeDays}/7`,
        streak: `${streak} days`,
        scholarLevel: level,
        totalXp: xp,
        bestDay: `${bestDay.day} (${(bestDay.minutes / 60).toFixed(1)}h)`,
        bossDefeated: bossDefeated ? 'Yes (Boss slain)' : 'No (Boss active)',
        dailyBreakdown: week.map(d => `${d.day}: ${(d.minutes / 60).toFixed(1)}h`).join(', ')
      };

      const systemPrompt = `You are a legendary Academic Advisor and Cognitive Performance Master in a gamified RPG study universe.
Analyze the student's 7-day performance data and output a structured diagnostic in valid JSON only.

OUTPUT FORMAT — Pure JSON object with no markdown code blocks:
{
  "academic_velocity": "2 punchy sentences evaluating their momentum, strengths, and study endurance this week",
  "friction_point": "1-2 sentences identifying their exact bottleneck (e.g. erratic daily rhythm, low weekend volume, lack of recovery)",
  "tactical_plan": [
    "Concrete actionable goal for next week 1",
    "Concrete actionable goal for next week 2",
    "Concrete actionable goal for next week 3"
  ],
  "mentor_quote": "A powerful, inspiring quote in character"
}`;

      const payload = {
        model: VERCEL_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Student Weekly Performance Snapshot:\n${JSON.stringify(summaryContext, null, 2)}` }
        ],
        max_tokens: 1200,
        temperature: 0.4
      };

      let parsed = null;

      // 1. Direct Gateway URL
      try {
        const res = await fetch(VERCEL_GATEWAY_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${VERCEL_AI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content || '';
          const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleaned);
        }
      } catch (e1) {
        console.warn('Direct AI Gateway failed, attempting backend proxy...', e1);
      }

      // 2. Fallback to local server proxy
      if (!parsed) {
        try {
          const res = await fetch(VERCEL_BACKEND_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content || '';
            const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleaned);
          }
        } catch (e2) {
          console.warn('Backend proxy also failed:', e2);
        }
      }

      // 3. Built-in algorithmic fallback if network fails
      if (!parsed) {
        parsed = {
          academic_velocity: totalWeekMinutes > 1200
            ? `Tremendous momentum demonstrated with ${(totalWeekMinutes / 60).toFixed(1)}h logged! You are operating in the upper echelon of cognitive stamina.`
            : totalWeekMinutes > 400
            ? `Solid foundational rhythm established. Consistent execution across ${activeDays} active days is reinforcing your study habits.`
            : `Low velocity detected this week (${(totalWeekMinutes / 60).toFixed(1)}h). Friction in routine start times must be eliminated to regain momentum.`,
          friction_point: activeDays < 4
            ? "Session initiation lag: Over half the week passed without study blocks, causing inertia to rebuild."
            : bestDay.minutes > 300 && totalWeekMinutes < 600
            ? "High variance spikes: Relying on marathon crunch days rather than steady daily output leads to cognitive burnout."
            : "Consistency maintenance: Protect your dedicated morning study block to lock in daily progress.",
          tactical_plan: [
            `Establish a baseline minimum of 45 mins on ${bestDay.day === 'Mon' ? 'Tuesdays' : 'Mondays'} to build weekly momentum.`,
            bossDefeated ? "Defend your scholar rank with high-tier deep work sessions." : "Target the active Weekly Boss challenge in your next study block.",
            "Utilize the Pomodoro timer mode to reduce mental friction on difficult topics."
          ],
          mentor_quote: grade >= 80
            ? "Excellence is not an act, but a habit. You forged steel this week."
            : "The expert has failed more times than the beginner has even tried. Rise and conquer next week."
        };
      }

      setAiReport(parsed);
      addXpAndCoins(50, 20);
    } catch {
      setAiError('Failed to generate diagnostic report. Please check connection and retry.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
      <div className="wrc-overlay wrc-print-root" onClick={onClose}>
        <div className="wrc-panel" onClick={e => e.stopPropagation()}>
          {/* Top-right close button */}
          <button className="wrc-close-icon-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>

          <div className="wrc-header">
            <div className="wrc-header-icon"><FaClipboardList /></div>
            <div className="wrc-title">Weekly Performance Report</div>
            <div className="wrc-subtitle">STUDY HUB RPG — SCHOLAR EVALUATION</div>
            <div className="wrc-week-label">
              <FaCalendarAlt /> {weekStr}
            </div>
          </div>

          <div
            className="wrc-grade-circle"
            style={{
              '--wrc-grade-color': gradeColor,
              '--wrc-grade-deg': `${grade * 3.6}deg`,
              '--wrc-ring-bg': ringBgColor,
              '--wrc-grade-glow': `${gradeColor}40`,
            }}
          >
            <div className="wrc-grade-inner">
              <div className="wrc-grade-letter">{gradeLabel}</div>
              <div className="wrc-grade-pct">{grade}/100</div>
            </div>
          </div>

          <div className="wrc-stats-grid">
            <div className="wrc-stat">
              <div className="wrc-stat-value">{Math.round(totalWeekMinutes / 60 * 10) / 10}h</div>
              <div className="wrc-stat-label">Hours Studied</div>
            </div>
            <div className="wrc-stat">
              <div className="wrc-stat-value">{activeDays}/7</div>
              <div className="wrc-stat-label">Active Days</div>
            </div>
            <div className="wrc-stat">
              <div className="wrc-stat-value" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <FaFire style={{ color: '#f59e0b' }} /> {streak}
              </div>
              <div className="wrc-stat-label">Day Streak</div>
            </div>
            <div className="wrc-stat">
              <div className="wrc-stat-value">{level}</div>
              <div className="wrc-stat-label">Scholar Level</div>
            </div>
            <div className="wrc-stat">
              <div className="wrc-stat-value">{Math.round(bestDay.minutes / 60 * 10) / 10}h</div>
              <div className="wrc-stat-label">Best Day ({bestDay.day})</div>
            </div>
            <div className="wrc-stat">
              <div className="wrc-stat-value" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {bossDefeated ? <FaCheckCircle style={{ color: '#10b981' }} /> : <FaTimesCircle style={{ color: '#ef4444' }} />}
              </div>
              <div className="wrc-stat-label">Boss Defeated</div>
            </div>
          </div>

          {/* Daily bar chart */}
          <div className="wrc-daily-section">
            <div className="wrc-daily-label">Daily Activity</div>
            <div className="wrc-day-grid">
              {week.map((d) => {
                const maxMin = Math.max(...week.map(x => x.minutes), 1);
                const heightPct = (d.minutes / maxMin) * 100;
                const color = d.minutes > 300 ? '#10b981' : d.minutes > 120 ? '#3b82f6' : d.minutes > 0 ? '#f59e0b' : emptyBarColor;
                return (
                  <div key={d.date} className="wrc-day-col">
                    <div className="wrc-day-bar-wrap">
                      <div className="wrc-day-bar" style={{ height: `${heightPct}%`, background: color }} title={`${d.day}: ${Math.round(d.minutes / 60 * 10) / 10}h`} />
                    </div>
                    <div className="wrc-day-name">{d.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Mentor Button */}
          {!aiReport && (
            <button
              className="wrc-ai-btn"
              onClick={handleGenerateAIDiagnostic}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing 7-Day Performance with MiniMax M3...
                </>
              ) : (
                <>
                  <FaMagic /> AI Academic Advisor Deep Evaluation (+50 XP)
                </>
              )}
            </button>
          )}

          {aiError && (
            <div style={{ background: isLight ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '9px', padding: '8px 12px', color: '#ef4444', fontSize: '0.78rem', marginBottom: '12px' }}>
              {aiError}
            </div>
          )}

          {/* AI Deep Report */}
          {aiReport ? (
            <div className="wrc-ai-card">
              <div className="wrc-ai-header">
                <FaRobot style={{ color: '#a855f7' }} /> AI Academic Performance Diagnostic
              </div>
              
              <div className="wrc-ai-velocity">
                <strong className="wrc-ai-velocity-tag">Velocity:</strong> {aiReport.academic_velocity}
              </div>

              {aiReport.friction_point && (
                <div className="wrc-friction-box">
                  <FaExclamationTriangle style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                  <div className="wrc-friction-content">
                    <strong className="wrc-friction-tag">Friction Point: </strong>
                    {aiReport.friction_point}
                  </div>
                </div>
              )}

              {aiReport.tactical_plan?.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div className="wrc-battle-plan-title">
                    <FaBullseye /> Next Week's Battle Plan:
                  </div>
                  {aiReport.tactical_plan.map((item, idx) => (
                    <div key={idx} className="wrc-battle-plan-item">
                      • {item}
                    </div>
                  ))}
                </div>
              )}

              {aiReport.mentor_quote && (
                <div className="wrc-ai-quote">
                  "{aiReport.mentor_quote}"
                </div>
              )}
            </div>
          ) : (
            <div className="wrc-comment">
              <div className="wrc-comment-label">Quick Assessment</div>
              {COMMENTS(grade)}
            </div>
          )}

          <div className="wrc-footer-btns">
            <button className="wrc-print-btn" onClick={printReport} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FaPrint /> Print Report
            </button>
            <button className="wrc-close-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
  );
}
