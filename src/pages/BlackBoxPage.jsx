import React, { useState } from 'react';
import {
  FaPlane, FaExclamationTriangle, FaCheckCircle, FaTimes,
  FaMobileAlt, FaBed, FaBolt, FaBrain, FaCloudRain, FaHistory
} from 'react-icons/fa';
import { GiBlackBook, GiPaperBomb } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import './BlackBoxPage.css';

const ALTITUDE_OPTIONS = [
  { id: 'peak',    en: 'Peak Energy',         ar: 'طاقة قصوى',         icon: <FaBolt />,    color: '#4ade80' },
  { id: 'normal',  en: 'Normal',              ar: 'طبيعي',             icon: <FaCheckCircle />, color: '#a3e635' },
  { id: 'low',     en: 'Low — Tired / Hungry', ar: 'منخفض — تعب / جوع', icon: <FaBed />,     color: '#fbbf24' },
  { id: 'crash',   en: 'Caffeine Crash',       ar: 'انهيار الكافيين',   icon: <FaExclamationTriangle />, color: '#f87171' },
];

const INTRUDER_OPTIONS = [
  { id: 'phone',      en: 'Phone notification',  ar: 'إشعار الهاتف',          icon: <FaMobileAlt /> },
  { id: 'hard',       en: 'Problem too hard',    ar: 'المسألة صعبة جداً',      icon: <FaBrain /> },
  { id: 'boredom',    en: 'Boredom / wandering', ar: 'ملل وشرود الذهن',       icon: <FaCloudRain /> },
  { id: 'interrupt',  en: 'External interruption', ar: 'تدخل خارجي',           icon: <FaExclamationTriangle /> },
  { id: 'frustration',en: 'Frustration / rage',  ar: 'إحباط وضياع',           icon: <GiPaperBomb /> },
];

const WEATHER_OPTIONS = [
  { id: 'morning', en: 'Morning (6–12)',   ar: 'الصباح (6–12)' },
  { id: 'noon',    en: 'Noon (12–16)',     ar: 'الظهيرة (12–16)' },
  { id: 'evening', en: 'Evening (16–21)', ar: 'المساء (16–21)' },
  { id: 'night',   en: 'Night (21+)',      ar: 'الليل (21+)' },
];

function loadReports() {
  try { return JSON.parse(localStorage.getItem('blackbox_reports') || '[]'); }
  catch { return []; }
}
function saveReports(r) {
  try { localStorage.setItem('blackbox_reports', JSON.stringify(r)); } catch {}
}

function generateReport(form, isRTL) {
  const fixes = {
    phone:       isRTL ? 'ضع الهاتف في غرفة أخرى أثناء المذاكرة واستخدم وضع عدم الإزعاج' : 'Put phone in another room — enable DND mode before every session',
    hard:        isRTL ? 'قسّم المسألة إلى خطوات صغيرة واستشر مصدراً إضافياً قبل الاستسلام' : 'Break the problem into micro-steps — consult a second source before quitting',
    boredom:     isRTL ? 'جرّب مؤقت بومودورو 25 دقيقة واجلس أمام النافذة أو في مكان مختلف' : 'Try 25-min Pomodoro + change physical location to re-engage',
    interrupt:   isRTL ? 'أخبر المحيطين بك بمواعيد جلساتك واستخدم سماعات عازلة للصوت' : 'Inform household of your sessions — use noise-cancelling headphones',
    frustration: isRTL ? 'خذ استراحة 10 دقائق محددة ثم ارجع — الإحباط مؤقت والمعرفة تراكمية' : 'Take an intentional 10-min reset break — frustration is temporary, knowledge compounds',
  };
  return fixes[form.intruder] || (isRTL ? 'تحليل السبب الجذري وتفادي تكراره' : 'Root-cause analysis — prevent recurrence');
}

export default function BlackBoxPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [reports, setReports] = useState(loadReports);
  const [form, setForm] = useState({ altitude: '', intruder: '', weather: '', note: '' });
  const [submitted, setSubmitted] = useState(null);

  const canSubmit = form.altitude && form.intruder && form.weather;

  const submitReport = () => {
    if (!canSubmit) return;
    const fix = generateReport(form, isRTL);
    const report = {
      id: Date.now(),
      ...form,
      fix,
      at: new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const updated = [report, ...reports];
    setReports(updated);
    saveReports(updated);
    setSubmitted(report);
    setForm({ altitude: '', intruder: '', weather: '', note: '' });
  };

  const deleteReport = (id) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    saveReports(updated);
    if (submitted?.id === id) setSubmitted(null);
  };

  return (
    <div className={`black-box ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bb-header">
        <h1>
          <FaPlane style={{ display: 'inline', marginRight: isRTL ? 0 : '0.5rem', marginLeft: isRTL ? '0.5rem' : 0, verticalAlign: 'middle' }} />
          {isRTL ? 'الصندوق الأسود — تشريح الجلسات' : 'Black Box Flight Recorder'}
        </h1>
        <p>
          {isRTL
            ? 'حلّل كل جلسة متعثرة بدقة — اكتشف سبب الانهيار ومنع تكراره'
            : 'Investigate every derailed session — find the root cause and prevent the next crash'}
        </p>
        <span className="bb-badge">
          <GiBlackBook style={{ marginRight: '0.3rem' }} />
          {isRTL ? `${reports.length} تقرير حادثة` : `${reports.length} Incident Reports`}
        </span>
      </div>

      <div className="bb-grid">
        {/* Form */}
        <div className="bb-form-panel">
          <div className="bb-form-title">
            <FaExclamationTriangle style={{ color: '#f87171' }} />
            {isRTL ? 'تقرير حادثة جديدة' : 'New Incident Report'}
          </div>

          {/* Altitude */}
          <div className="bb-section">
            <div className="bb-section-label">
              {isRTL ? 'مستوى الطاقة (الارتفاع)' : 'Energy Level (Altitude)'}
            </div>
            <div className="bb-option-row">
              {ALTITUDE_OPTIONS.map(o => (
                <button
                  key={o.id}
                  className={`bb-option-btn ${form.altitude === o.id ? 'selected' : ''}`}
                  style={{ '--o-color': o.color }}
                  onClick={() => setForm(f => ({ ...f, altitude: o.id }))}
                >
                  <span style={{ color: o.color }}>{o.icon}</span>
                  <span>{isRTL ? o.ar : o.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intruder */}
          <div className="bb-section">
            <div className="bb-section-label">
              {isRTL ? 'كاسر التركيز (المتسلل)' : 'Focus Breaker (Cockpit Intruder)'}
            </div>
            <div className="bb-option-row">
              {INTRUDER_OPTIONS.map(o => (
                <button
                  key={o.id}
                  className={`bb-option-btn ${form.intruder === o.id ? 'selected' : ''}`}
                  style={{ '--o-color': '#f87171' }}
                  onClick={() => setForm(f => ({ ...f, intruder: o.id }))}
                >
                  <span style={{ color: '#f87171' }}>{o.icon}</span>
                  <span>{isRTL ? o.ar : o.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="bb-section">
            <div className="bb-section-label">
              {isRTL ? 'توقيت الجلسة (الجو)' : 'Session Timing (Weather Conditions)'}
            </div>
            <div className="bb-option-row">
              {WEATHER_OPTIONS.map(o => (
                <button
                  key={o.id}
                  className={`bb-option-btn ${form.weather === o.id ? 'selected' : ''}`}
                  style={{ '--o-color': '#60a5fa' }}
                  onClick={() => setForm(f => ({ ...f, weather: o.id }))}
                >
                  <span>{isRTL ? o.ar : o.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bb-section">
            <div className="bb-section-label">{isRTL ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (optional)'}</div>
            <textarea
              className="bb-note-input"
              rows={3}
              placeholder={isRTL ? 'ما الذي حدث بالضبط؟' : 'What exactly happened?'}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          <button className="bb-submit-btn" onClick={submitReport} disabled={!canSubmit}>
            <FaPlane />
            {isRTL ? 'إنشاء التقرير الرسمي' : 'Generate Incident Report'}
          </button>
        </div>

        {/* Result & History */}
        <div className="bb-results-panel">
          {submitted && (
            <div className="bb-report-result">
              <div className="bb-result-title">
                <FaCheckCircle style={{ color: '#4ade80' }} />
                {isRTL ? 'تقرير الحادثة الرسمي' : 'Official Incident Report'}
              </div>
              <div className="bb-result-section">
                <div className="bb-result-label">{isRTL ? 'السبب الجذري:' : 'Root Cause:'}</div>
                <div className="bb-result-value">
                  {INTRUDER_OPTIONS.find(o => o.id === submitted.intruder)?.[isRTL ? 'ar' : 'en']}
                </div>
              </div>
              <div className="bb-result-section">
                <div className="bb-result-label">{isRTL ? 'الإجراء الوقائي:' : 'Preventive Action:'}</div>
                <div className="bb-result-fix">{submitted.fix}</div>
              </div>
              <button className="bb-dismiss-btn" onClick={() => setSubmitted(null)}>
                <FaTimes /> {isRTL ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}

          {/* History */}
          <div className="bb-history-title">
            <FaHistory />
            {isRTL ? 'سجل الحوادث السابقة' : 'Incident History'}
          </div>
          {reports.length === 0 ? (
            <div className="bb-empty">
              <FaPlane style={{ fontSize: '2.5rem', color: '#334155', marginBottom: '0.75rem' }} />
              <p>{isRTL ? 'لا توجد حوادث مسجلة — نتمنى أن يبقى الصندوق فارغاً دائماً!' : 'No incidents recorded — here\'s hoping it stays empty!'}</p>
            </div>
          ) : (
            <div className="bb-history-list">
              {reports.map(r => (
                <div key={r.id} className="bb-history-card">
                  <div className="bb-history-meta">
                    <span className="bb-history-date">{r.at}</span>
                    <button className="bb-history-delete" onClick={() => deleteReport(r.id)}><FaTrash /></button>
                  </div>
                  <div className="bb-history-intruder">
                    {INTRUDER_OPTIONS.find(o => o.id === r.intruder)?.[isRTL ? 'ar' : 'en']}
                  </div>
                  <div className="bb-history-fix">{r.fix}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
