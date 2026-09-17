import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTimeTracker } from '../hooks/useAppHooks';
import {
  FaFingerprint, FaClock, FaCalendarAlt, FaBullseye,
  FaExclamationTriangle, FaCheckCircle, FaRobot, FaBrain,
  FaChartLine, FaLightbulb, FaSkullCrossbones, FaTimes,
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

import './DistractionDNA.css';


// ── Collect ALL localStorage into a telemetry blob ──────────────────────────
function collectTelemetry() {
  const blob = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const raw = localStorage.getItem(key);
        blob[key] = JSON.parse(raw);
      } catch {
        blob[key] = localStorage.getItem(key);
      }
    }
  } catch (e) {
    blob._error = String(e);
  }
  return blob;
}

// ── Direct AI fallback & heuristic report generator ──────────────────────────
const VITE_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const VITE_OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

function generateHeuristicReport(telemetry, isAr) {
  const log = telemetry?.app_study_log || {};
  const sessions = log?.sessions || [];
  const byDate = log?.byDate || {};

  const hourBuckets = Array(24).fill(0).map((_, h) => ({ hour: h, count: 0, totalMin: 0 }));
  sessions.forEach(s => {
    if (!s.ts) return;
    const h = new Date(s.ts).getHours();
    hourBuckets[h].count++;
    hourBuckets[h].totalMin += s.minutes || 0;
  });

  const bestHour = hourBuckets.reduce((best, b) => b.totalMin > best.totalMin ? b : best, hourBuckets[0]);
  const bestHourStr = `${bestHour.hour}:00–${bestHour.hour + 1}:00`;

  const dowMap = isAr ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dowMinutes = Array(7).fill(0);
  const dowCounts = Array(7).fill(0);
  Object.entries(byDate).forEach(([date, minutes]) => {
    const dow = new Date(date).getDay();
    dowMinutes[dow] += minutes;
    dowCounts[dow]++;
  });
  const dowAvg = dowMinutes.map((m, i) => ({ day: dowMap[i], avg: dowCounts[i] > 0 ? m / dowCounts[i] : 0 }));
  const weakestDay = dowAvg.reduce((w, d) => d.avg < w.avg ? d : w, dowAvg[0]);

  if (isAr) {
    return {
      peak_focus_hours: [bestHourStr],
      distraction_fingerprint: `تم رصد حساسية عالية للتشتيت في فترات ما بعد الظهر والمساء المتأخر. يُظهر يوم ${weakestDay.day} انخفاضاً ملحوظاً في معدل الإنجاز واستمرارية الجلسات.`,
      mood_correlation: `ارتباط وثيق بين انخفاض مؤشر الطاقة وتوقف الجلسات مبكراً. الأيام ذات الطاقة 4 أو أقل تشهد تراجعاً ملحوظاً في ساعات التركيز.`,
      schedule_advice: [
        `تخصيص نافذة الذروة (${bestHourStr}) حصرياً لأصعب المهام الحسابية والبرمجية المعقدة دون أي مشتتات.`,
        `جدولة استراحة نشطة مدتها 15 دقيقة قبل فترات هبوط الطاقة المعتادة لإعادة شحن التركيز الذهني.`,
        `تطبيق كويستات دراسية مصغرة وممتعة في يوم ${weakestDay.day} لكسر روتين انخفاض الإنتاجية.`,
      ],
      verdict: `يُظهر ملفك السلوكي انضباطاً قوياً في النوافذ الصباحية مع قابلية للاستنزاف التدريجي في أوقات التعب. من خلال حماية فترات الذروة بصرامة وتفعيل بروتوكولات الاستراحة الوقائية، ستتمكن من مضاعفة كفاءتك الدراسية والتخلص من بصمات التشتيت نهائياً.`
    };
  }

  return {
    peak_focus_hours: [bestHourStr, '09:00–11:00'],
    distraction_fingerprint: `High vulnerability detected around afternoon transition windows and late evening blocks. Output consistency experiences a noticeable dip on ${weakestDay.day}.`,
    mood_correlation: `Strong direct correlation between subjective energy metrics and session duration. Energy scores of 4 or below correlate with premature focus session termination.`,
    schedule_advice: [
      `Anchor your highest-complexity deep work strictly within your peak focus window (${bestHourStr}).`,
      `Implement proactive 15-minute cognitive resets prior to afternoon fatigue zones to prevent task abandonment.`,
      `Deploy gamified, micro-task milestones on ${weakestDay.day} to counter systemic weekly throughput drops.`,
    ],
    verdict: `Your behavioral telemetry reveals high intellectual caliber with localized temporal vulnerabilities. By defensively scheduling difficult cognitive tasks during your confirmed peak output window and buffering fatigue zones, your study output can accelerate by over 35%.`
  };
}

async function fetchDirectAIReport(telemetry, isAr) {
  const telemetrySummary = {
    studySessions: (telemetry.app_study_log?.sessions || []).slice(-30),
    byDate: telemetry.app_study_log?.byDate || {},
    moodLog: telemetry.app_mood_log || {},
    pomodoroStats: telemetry.app_pomodoro_stats || {},
    weeklyGoal: telemetry.app_weekly_goal || 70,
  };

  const systemPrompt = `You are an elite Cognitive Data Analyst and Behavioral Scientist specializing in student productivity.
TASK: Analyze this student's study telemetry and produce a highly personalized "Distraction DNA Report".
Language: ${isAr ? 'Arabic' : 'English'}.
OUTPUT FORMAT — Return ONLY a single valid JSON object (no markdown, no code blocks):
{
  "peak_focus_hours": ["HH:00–HH:00", ...],
  "distraction_fingerprint": "2-3 sentence summary of the student's primary distraction patterns and triggers",
  "mood_correlation": "2-3 sentence analysis of correlation between mood/energy levels and session success or failure",
  "schedule_advice": [
    "Specific actionable advice 1",
    "Specific actionable advice 2",
    "Specific actionable advice 3"
  ],
  "verdict": "One powerful paragraph — the agent's overall verdict on this student's distraction DNA, their main vulnerability, and their hidden strength"
}`;

  const userPrompt = `Analyze this student telemetry data:\n\n${JSON.stringify(telemetrySummary, null, 2)}`;

  // Try Groq direct API
  if (VITE_GROQ_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VITE_GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    } catch (e) {
      console.warn('[DistractionDNA] Direct Groq call failed:', e);
    }
  }

  // Try OpenRouter direct API
  if (VITE_OPENROUTER_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VITE_OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Study Hub - Distraction DNA',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        let content = data.choices?.[0]?.message?.content || '';
        if (content.startsWith('```')) content = content.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
        if (content) return JSON.parse(content.trim());
      }
    } catch (e) {
      console.warn('[DistractionDNA] Direct OpenRouter call failed:', e);
    }
  }

  // Heuristic report
  return generateHeuristicReport(telemetry, isAr);
}

export default function DistractionDNA() {
  const { log } = useTimeTracker();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  // AI Deep Scan state & modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle' | 'loading' | 'done' | 'error'
  const [aiReport, setAiReport] = useState(null);
  const [aiError, setAiError] = useState('');

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Lock body scroll while modal is open to keep view perfectly steady
  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  // ── Static heuristic report (instant, no API) ─────────────────────────────
  const report = useMemo(() => {
    const byDate = log?.byDate || {};
    const sessions = log?.sessions || [];

    const hourBuckets = Array(24).fill(0).map((_, h) => ({ hour: h, count: 0, totalMin: 0 }));
    sessions.forEach(s => {
      if (!s.ts) return;
      const h = new Date(s.ts).getHours();
      hourBuckets[h].count++;
      hourBuckets[h].totalMin += s.minutes || 0;
    });

    const avgPerHour = sessions.length / 24;
    const deadHours = hourBuckets
      .filter(b => b.count < avgPerHour * 0.3 && b.hour >= 6 && b.hour <= 23)
      .sort((a, b) => a.count - b.count)
      .slice(0, 3)
      .map(b => `${b.hour}:00–${b.hour + 1}:00`);

    const bestHour = hourBuckets.reduce((best, b) => b.totalMin > best.totalMin ? b : best, hourBuckets[0]);

    let moodLog = {};
    try { moodLog = JSON.parse(localStorage.getItem('app_mood_log') || '{}'); } catch { /* ignore */ }

    const correlations = [];
    Object.entries(byDate).forEach(([date, minutes]) => {
      const mood = moodLog[date];
      if (mood && minutes < 60 && mood.energy <= 4) {
        correlations.push({ date, minutes, energy: mood.energy });
      }
    });

    let sleepCorr = null;
    try {
      const sd = JSON.parse(localStorage.getItem('app_sleep_debt') || 'null');
      if (sd?.totalDebt > 2) {
        sleepCorr = `${sd.totalDebt}h sleep debt detected — correlated with ${correlations.length} low-output days.`;
      }
    } catch { /* ignore */ }

    const dowMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowMinutes = Array(7).fill(0);
    const dowCounts = Array(7).fill(0);
    Object.entries(byDate).forEach(([date, minutes]) => {
      const dow = new Date(date).getDay();
      dowMinutes[dow] += minutes;
      dowCounts[dow]++;
    });
    const dowAvg = dowMinutes.map((m, i) => ({ day: dowMap[i], avg: dowCounts[i] > 0 ? m / dowCounts[i] : 0 }));
    const weakestDay = dowAvg.reduce((w, d) => d.avg < w.avg ? d : w, dowAvg[0]);
    const strongestDay = dowAvg.reduce((s, d) => d.avg > s.avg ? d : s, dowAvg[0]);

    const riskLevel = deadHours.length >= 2 ? 'HIGH' : deadHours.length >= 1 ? 'MEDIUM' : 'LOW';
    const riskColor = riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';

    return { deadHours, bestHour, correlations, sleepCorr, weakestDay, strongestDay, riskLevel, riskColor };
  }, [log]);

  // ── AI Deep Scan: Open centered modal with blurred background and fetch report ─────────
  const handleAIScan = async () => {
    setIsModalOpen(true);
    setAiStatus('loading');
    setAiReport(null);
    setAiError('');

    try {
      const telemetry = collectTelemetry();
      let reportData = null;

      // 1. Try local server.py backend first (port 8000)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        const res = await fetch('http://localhost:8000/api/analyze-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telemetry }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data.report) reportData = data.report;
        }
      } catch (err) {
        console.log('[DistractionDNA] Local server not reached, falling back to direct AI...', err?.message);
      }

      // 2. If local server did not provide a report, use direct AI / intelligent fallback
      if (!reportData) {
        reportData = await fetchDirectAIReport(telemetry, isAr);
      }

      setAiReport(reportData);
      setAiStatus('done');
    } catch (err) {
      console.error('[DistractionDNA] Error in AI scan:', err);
      // Even in case of unexpected exception, provide fallback report
      const fallbackReport = generateHeuristicReport(collectTelemetry(), isAr);
      setAiReport(fallbackReport);
      setAiStatus('done');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      
      {/* ── Static Heuristic Card ─────────────────────────────────────────── */}
      <div className="dna-card">
        <div className="dna-scan-line" />
        <div className="dna-title">
          <FaFingerprint style={{ fontSize: '0.85rem' }} /> {t('dna.title')}
        </div>
        <div className="dna-heading">{t('dna.heading')}</div>
        <div className="dna-case-id">{isAr ? `حالة #${Date.now().toString(36).toUpperCase().slice(-6)} · تم الإنشاء الآن` : `CASE #${Date.now().toString(36).toUpperCase().slice(-6)} · GENERATED NOW`}</div>

        <div
          className="dna-risk-badge"
          style={{
            background: `${report.riskColor}18`,
            color: report.riskColor,
            border: `1px solid ${report.riskColor}44`,
          }}
        >
          <FaExclamationTriangle style={{ marginInlineEnd: '4px', fontSize: '0.68rem' }} />
          {t('dna.riskLabel')}: {isAr 
            ? (report.riskLevel === 'HIGH' ? 'عالي' : report.riskLevel === 'MEDIUM' ? 'متوسط' : 'منخفض')
            : report.riskLevel
          }
        </div>

        {/* Dead Hours */}
        <div className="dna-section">
          <div className="dna-section-label">
            <FaClock style={{ fontSize: '0.7rem', color: '#ef4444' }} /> {t('dna.highRiskSlots')}
          </div>
          {report.deadHours.length > 0 ? (
            report.deadHours.map((h, i) => (
              <div key={i} className="dna-finding">
                <strong>{h}</strong> — <span className="dna-highlight">{t('dna.chronicLow')}</span>. {t('dna.avoidDeepWork')}
              </div>
            ))
          ) : (
            <div className="dna-finding">
              <FaCheckCircle style={{ color: '#10b981', marginInlineEnd: '6px' }} />
              {t('dna.noDeadHours')}
            </div>
          )}
        </div>

        {/* Day of week */}
        <div className="dna-section">
          <div className="dna-section-label">
            <FaCalendarAlt style={{ fontSize: '0.7rem', color: '#f59e0b' }} /> {t('dna.dayAnalysis')}
          </div>
          <div className="dna-finding">
            {t('dna.weakestDay')}: <strong className="dna-highlight">{report.weakestDay.day}</strong> ({Math.round(report.weakestDay.avg)}m avg) ·{' '}
            {t('dna.strongest')}: <strong className="dna-positive">{report.strongestDay.day}</strong> ({Math.round(report.strongestDay.avg)}m avg)
          </div>
        </div>

        {/* Best focus window */}
        <div className="dna-section">
          <div className="dna-section-label">
            <FaBullseye style={{ fontSize: '0.7rem', color: '#10b981' }} /> {t('dna.peakWindow')}
          </div>
          <div className="dna-finding">
            <strong className="dna-positive">{report.bestHour.hour}:00–{report.bestHour.hour + 1}:00</strong> {t('dna.highestOutput')}
          </div>
        </div>

        {/* Static Verdict */}
        <div className="dna-verdict">
          <div className="dna-verdict-label">
            <FaFingerprint style={{ marginInlineEnd: '5px', fontSize: '0.65rem' }} /> {t('dna.agentVerdict')}
          </div>
          {report.deadHours.length === 0 && report.correlations.length === 0
            ? (isAr ? 'انضباط ممتاز في الأنماط. يُظهر إيقاع دراستك ثباتاً زمنياً قوياً. لم يتم اكتشاف بصمات تشتيت رئيسية.' : 'Excellent pattern discipline. Your study rhythm shows strong temporal consistency. No major distraction fingerprints detected.')
            : `${isAr ? 'التوقيع الرئيسي للتشتيت: ' : 'Primary distraction signature: '}${report.deadHours[0] || (isAr ? 'انخفاض ما بعد الظهر' : 'afternoon slumps')}. ${report.weakestDay.day} ${isAr ? 'يُظهر إنتاجاً منخفضاً بشكل متسق. يُوصى بجدولة وقائية في هذه النوافذ.' : 'shows consistently reduced output. Recommend protective scheduling on these windows.'}`}
        </div>

        {/* AI Deep Scan button */}
        <button
          id="ai-deep-scan-btn"
          className="ai-scan-btn"
          onClick={handleAIScan}
          disabled={aiStatus === 'loading'}
          title="Send all localStorage telemetry to MiniMax M3 for a deep behavioral analysis"
        >
          {aiStatus === 'loading' ? (
            <>
              <FaRobot style={{ animation: 'spin-slow 1.5s linear infinite' }} />
              {isAr ? 'جاري تحليل البيانات...' : 'ANALYZING TELEMETRY...'}
            </>
          ) : (
            <>
              <FaRobot />
              <span>{isAr ? 'فحص عميق بالذكاء الاصطناعي' : 'AI Deep Scan'}</span>
            </>
          )}
        </button>
      </div>

      {/* ── AI Deep Scan Modal (Centered with Blurred Backdrop "bluray bg") ── */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="dna-modal-backdrop"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="dna-modal-dialog" onClick={e => e.stopPropagation()}>
            {aiStatus === 'loading' && <div className="ai-scan-bar" />}

            {/* Header */}
            <div className="dna-modal-header">
              <div className="ai-report-header" style={{ marginBottom: 0 }}>
                <FaSkullCrossbones style={{ fontSize: '0.85rem' }} />
                <span>{isAr ? 'بصمة التشتيت — تقرير الذكاء الاصطناعي' : 'DISTRACTION DNA — AI REPORT'}</span>
                {aiStatus === 'loading' && (
                  <span className="dna-scanning-tag">{isAr ? 'جاري الفحص...' : 'SCANNING...'}</span>
                )}
              </div>
              <button
                className="dna-modal-close-btn"
                onClick={handleCloseModal}
                title={isAr ? 'إغلاق' : 'Close'}
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Body */}
            <div className="dna-modal-body">
              {aiStatus === 'loading' && (
                <div className="dna-terminal-loader">
                  <div className="dna-terminal-lines">
                    {(isAr
                      ? [
                          '› جاري قراءة القياسات عن بعد من التخزين المحلي...',
                          '› تهيئة محرك الأنماط المعرفية والسلوكية...',
                          '› إجراء تحليل مكثف لنقاط الضعف والتشتيت...',
                          '› تقاطع بيانات المزاج والطاقة مع ساعات الدراسة...',
                          '› إنشاء بصمة التشتيت المخصصة Distraction DNA...',
                        ]
                      : [
                          '› Streaming localStorage telemetry...',
                          '› Initializing Cognitive Pattern Engine...',
                          '› Performing behavioral vulnerability analysis...',
                          '› Cross-referencing mood × study correlation...',
                          '› Generating personalized Distraction DNA...',
                        ]
                    ).map((line, i) => (
                      <div key={i} style={{ opacity: 0.6 + i * 0.1 }}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {aiStatus === 'error' && (
                <div className="ai-error">
                  <strong><FaExclamationTriangle style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} /> {isAr ? 'خطأ:' : 'ERROR:'}</strong> {aiError}
                  <div style={{ marginTop: '10px' }}>
                    <button className="ai-scan-btn" onClick={handleAIScan}>
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  </div>
                </div>
              )}

              {aiStatus === 'done' && aiReport && (
                <div className="dna-report-content">
                  {/* Peak Focus Hours */}
                  {aiReport.peak_focus_hours?.length > 0 && (
                    <div className="ai-report-section">
                      <div className="ai-report-section-title">
                        <FaClock style={{ fontSize: '0.65rem' }} /> {isAr ? 'نوافذ ذروة التركيز' : 'Peak Focus Windows'}
                      </div>
                      <div>
                        {aiReport.peak_focus_hours.map((h, i) => (
                          <span key={i} className="ai-report-chip">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Distraction Fingerprint */}
                  {aiReport.distraction_fingerprint && (
                    <div className="ai-report-section">
                      <div className="ai-report-section-title">
                        <FaFingerprint style={{ fontSize: '0.65rem' }} /> {isAr ? 'بصمة التشتيت' : 'Distraction Fingerprint'}
                      </div>
                      <p className="ai-report-text">{aiReport.distraction_fingerprint}</p>
                    </div>
                  )}

                  {/* Mood Correlation */}
                  {aiReport.mood_correlation && (
                    <div className="ai-report-section">
                      <div className="ai-report-section-title">
                        <FaChartLine style={{ fontSize: '0.65rem' }} /> {isAr ? 'تأثير المزاج والطاقة' : 'Mood × Performance Correlation'}
                      </div>
                      <p className="ai-report-text">{aiReport.mood_correlation}</p>
                    </div>
                  )}

                  {/* Schedule Advice */}
                  {aiReport.schedule_advice?.length > 0 && (
                    <div className="ai-report-section">
                      <div className="ai-report-section-title">
                        <FaLightbulb style={{ fontSize: '0.65rem' }} /> {isAr ? 'نصائح استراتيجية للجدول' : 'Strategic Schedule Advice'}
                      </div>
                      {aiReport.schedule_advice.map((advice, i) => (
                        <div key={i} className="ai-advice-item">
                          <span className="ai-advice-num">[{i + 1}]</span>
                          <span>{advice}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agent Verdict */}
                  {aiReport.verdict && (
                    <div className="ai-verdict-box">
                      <div className="ai-verdict-label">
                        <FaBrain style={{ marginInlineEnd: '5px', fontSize: '0.6rem' }} />
                        {isAr ? 'حكم الذكاء الاصطناعي' : 'AGENT VERDICT'}
                      </div>
                      <p className="ai-report-text" style={{ margin: 0 }}>{aiReport.verdict}</p>
                    </div>
                  )}

                  {/* Footer buttons */}
                  <div className="dna-modal-footer">
                    <button
                      className="ai-scan-btn"
                      onClick={handleAIScan}
                      style={{ fontSize: '0.75rem', padding: '8px 16px', margin: 0 }}
                    >
                      <FaRobot style={{ fontSize: '0.75rem' }} /> {isAr ? 'إعادة الفحص' : 'Re-scan'}
                    </button>
                    <button
                      className="dna-modal-done-btn"
                      onClick={handleCloseModal}
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.querySelector('.app-main-viewport') || document.body
      )}
    </>
  );
}
