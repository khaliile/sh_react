import React, { useState, useMemo } from 'react';
import {
  FaScroll, FaCoins, FaFire, FaCheckCircle, FaTimesCircle,
  FaTrophy, FaPlus, FaTrash, FaClock, FaSkull
} from 'react-icons/fa';
import { GiBloodySword, GiTreasureMap, GiFlame } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './BloodPactPage.css';

const STAKE_OPTIONS = [
  { id: 'coins_100',  labelEn: '100 Coins',  labelAr: '100 عملة',  cost: 100, icon: <FaCoins /> },
  { id: 'coins_500',  labelEn: '500 Coins',  labelAr: '500 عملة',  cost: 500, icon: <FaCoins /> },
  { id: 'title_seeker', labelEn: 'Seeker Title (48h)', labelAr: 'لقب "الساعي" (48 ساعة)', cost: 0, icon: <FaTrophy /> },
];

function loadPacts() {
  try { return JSON.parse(localStorage.getItem('blood_pacts') || '[]'); }
  catch { return []; }
}
function savePacts(p) {
  try { localStorage.setItem('blood_pacts', JSON.stringify(p)); } catch {}
}

export default function BloodPactPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const data = useMemo(() => getRealStudyData(), []);

  const [pacts, setPacts] = useState(loadPacts);
  const [form, setForm] = useState({ commitment: '', hours: '', deadline: '', stake: '' });
  const [step, setStep] = useState(1);

  const canSign = form.commitment.trim() && form.hours && form.deadline && form.stake;

  const signPact = () => {
    if (!canSign) return;
    const pact = {
      id: Date.now(),
      commitment: form.commitment.trim(),
      hours: parseFloat(form.hours),
      deadline: form.deadline,
      stake: form.stake,
      signedAt: Date.now(),
      status: 'active',
    };
    const updated = [pact, ...pacts];
    setPacts(updated);
    savePacts(updated);
    setForm({ commitment: '', hours: '', deadline: '', stake: '' });
    setStep(1);
  };

  const resolvePact = (id, outcome) => {
    const updated = pacts.map(p => p.id === id ? { ...p, status: outcome, resolvedAt: Date.now() } : p);
    setPacts(updated);
    savePacts(updated);
  };

  const deletePact = (id) => {
    const updated = pacts.filter(p => p.id !== id);
    setPacts(updated);
    savePacts(updated);
  };

  const activePacts = pacts.filter(p => p.status === 'active');
  const resolvedPacts = pacts.filter(p => p.status !== 'active');

  return (
    <div className={`blood-pact ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bp-header">
        <h1>
          <GiBloodySword style={{ display: 'inline', marginRight: isRTL ? 0 : '0.5rem', marginLeft: isRTL ? '0.5rem' : 0, verticalAlign: 'middle' }} />
          {isRTL ? 'ميثاق الالتزام الحاسم' : 'The Blood Pact'}
        </h1>
        <p>
          {isRTL
            ? 'ارهن ما يثمن لديك — لا مجال للتراجع حين يُمضى الميثاق بالدم'
            : 'Stake something you value — when the pact is signed there is no retreat'}
        </p>
        <div className="bp-header-stats">
          <span className="bp-badge pact-active">
            <GiFlame style={{ marginRight: '0.3rem' }} />
            {isRTL ? `${activePacts.length} ميثاق نشط` : `${activePacts.length} Active Pacts`}
          </span>
          <span className="bp-badge">
            <FaTrophy style={{ marginRight: '0.3rem' }} />
            {isRTL
              ? `${resolvedPacts.filter(p => p.status === 'honored').length} ميثاق محترم`
              : `${resolvedPacts.filter(p => p.status === 'honored').length} Honored`}
          </span>
        </div>
      </div>

      <div className="bp-grid">
        {/* Sign New Pact */}
        <div className="bp-form-panel">
          <div className="bp-form-title">
            <FaScroll />
            {isRTL ? 'توقيع ميثاق جديد' : 'Sign a New Pact'}
          </div>

          <div className="bp-step-indicator">
            {[1, 2, 3].map(s => (
              <div key={s} className={`bp-step ${step >= s ? 'active' : ''}`}>
                {s}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="bp-step-content">
              <div className="bp-input-label">{isRTL ? 'الالتزام — ما الذي ستنجزه؟' : 'The Commitment — what will you achieve?'}</div>
              <textarea
                className="bp-input-area"
                rows={4}
                placeholder={isRTL ? 'مثال: سأكمل 2 ساعة تراكيب البيانات قبل الساعة 8 مساءً غداً...' : 'e.g., I will complete 2 hours of Data Structures before 8 PM tomorrow...'}
                value={form.commitment}
                onChange={e => setForm(f => ({ ...f, commitment: e.target.value }))}
              />
              <div className="bp-row">
                <div className="bp-input-group">
                  <div className="bp-input-label">{isRTL ? 'الساعات المستهدفة' : 'Target Hours'}</div>
                  <input
                    type="number" min="0.5" step="0.5" className="bp-input"
                    placeholder={isRTL ? 'مثال: 2.5' : 'e.g. 2.5'}
                    value={form.hours}
                    onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  />
                </div>
                <div className="bp-input-group">
                  <div className="bp-input-label">{isRTL ? 'الموعد النهائي' : 'Deadline'}</div>
                  <input
                    type="date" className="bp-input"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  />
                </div>
              </div>
              <button className="bp-next-btn" onClick={() => setStep(2)} disabled={!form.commitment.trim() || !form.hours || !form.deadline}>
                {isRTL ? 'التالي — اختر الرهان' : 'Next — Choose Your Stake'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bp-step-content">
              <div className="bp-input-label">{isRTL ? 'الرهان — ماذا ستخسر إن فشلت؟' : 'The Stake — what do you forfeit on failure?'}</div>
              <div className="bp-stake-options">
                {STAKE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`bp-stake-btn ${form.stake === opt.id ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, stake: opt.id }))}
                  >
                    <span className="bp-stake-icon">{opt.icon}</span>
                    <span>{isRTL ? opt.labelAr : opt.labelEn}</span>
                  </button>
                ))}
              </div>
              <div className="bp-btn-row">
                <button className="bp-back-btn" onClick={() => setStep(1)}>{isRTL ? 'رجوع' : 'Back'}</button>
                <button className="bp-next-btn" onClick={() => setStep(3)} disabled={!form.stake}>
                  {isRTL ? 'راجع الميثاق' : 'Review Pact'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bp-step-content">
              <div className="bp-pact-preview">
                <div className="bp-preview-title">
                  {isRTL ? 'الميثاق المقترح' : 'The Proposed Pact'}
                </div>
                <div className="bp-preview-commitment">"{form.commitment}"</div>
                <div className="bp-preview-meta">
                  <span><FaClock /> {form.hours}{isRTL ? ' ساعة' : 'h'}</span>
                  <span><FaCoins /> {STAKE_OPTIONS.find(o => o.id === form.stake)?.[isRTL ? 'labelAr' : 'labelEn']}</span>
                  <span><FaSkull /> {form.deadline}</span>
                </div>
                <div className="bp-preview-warning">
                  {isRTL
                    ? 'تحذير: بالتوقيع تقبل الخسارة الفعلية لرهانك إن أخفقت. لا توجد استثناءات.'
                    : 'WARNING: By signing you accept actual forfeiture of your stake if you fail. No exceptions.'}
                </div>
              </div>
              <div className="bp-btn-row">
                <button className="bp-back-btn" onClick={() => setStep(2)}>{isRTL ? 'رجوع' : 'Back'}</button>
                <button className="bp-sign-btn" onClick={signPact}>
                  <GiBloodySword /> {isRTL ? 'أُمضي الميثاق' : 'Sign the Pact'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active & History */}
        <div className="bp-pacts-panel">
          {activePacts.length > 0 && (
            <>
              <div className="bp-section-title">
                <GiFlame style={{ color: '#f87171' }} />
                {isRTL ? 'المواثيق النشطة' : 'Active Pacts'}
              </div>
              {activePacts.map(pact => (
                <div key={pact.id} className="bp-pact-card active">
                  <div className="bp-pact-body">
                    <div className="bp-pact-commitment">"{pact.commitment}"</div>
                    <div className="bp-pact-details">
                      <span>{pact.hours}{isRTL ? ' ساعة' : 'h'}</span>
                      <span>{isRTL ? 'حتى ' : 'by '}{pact.deadline}</span>
                      <span>{STAKE_OPTIONS.find(o => o.id === pact.stake)?.[isRTL ? 'labelAr' : 'labelEn']}</span>
                    </div>
                  </div>
                  <div className="bp-pact-actions">
                    <button className="bp-honor-btn" onClick={() => resolvePact(pact.id, 'honored')}>
                      <FaCheckCircle /> {isRTL ? 'أنجزت' : 'Honored'}
                    </button>
                    <button className="bp-breach-btn" onClick={() => resolvePact(pact.id, 'breached')}>
                      <FaTimesCircle /> {isRTL ? 'أخفقت' : 'Breached'}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {resolvedPacts.length > 0 && (
            <>
              <div className="bp-section-title">
                <FaScroll />
                {isRTL ? 'سجل المواثيق' : 'Pact Archive'}
              </div>
              {resolvedPacts.map(pact => (
                <div key={pact.id} className={`bp-pact-card ${pact.status}`}>
                  <div className="bp-pact-status-icon">
                    {pact.status === 'honored' ? <FaTrophy style={{ color: '#fbbf24' }} /> : <FaSkull style={{ color: '#f87171' }} />}
                  </div>
                  <div className="bp-pact-body">
                    <div className="bp-pact-commitment small">"{pact.commitment}"</div>
                    <div className="bp-pact-resolved">
                      {pact.status === 'honored'
                        ? (isRTL ? 'مكتمل — Oathkeeper' : 'Completed — Oathkeeper')
                        : (isRTL ? 'انتهك — Pact Breaker (48h)' : 'Breached — Pact Breaker (48h)')
                      }
                    </div>
                  </div>
                  <button className="bp-delete-btn" onClick={() => deletePact(pact.id)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </>
          )}

          {pacts.length === 0 && (
            <div className="bp-empty">
              <GiTreasureMap style={{ fontSize: '3rem', color: '#334155', marginBottom: '0.75rem' }} />
              <p>{isRTL ? 'لا مواثيق بعد — وقّع أول ميثاق لإرغام نفسك على الإنجاز' : 'No pacts yet — sign your first to obliterate procrastination'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
