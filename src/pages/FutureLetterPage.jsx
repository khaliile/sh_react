import React, { useState, useMemo } from 'react';
import {
  FaEnvelope, FaEnvelopeOpen, FaPaperPlane, FaTrash,
  FaClock, FaCalendarAlt, FaCheckCircle, FaInbox,
  FaLock, FaPen, FaHistory
} from 'react-icons/fa';
import { GiLockedBox, GiQuillInk, GiWaxSeal } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import './FutureLetterPage.css';

const DELIVERY_OPTIONS_DATA = [
  { days: 30,  labelEn: '30 Days',  labelAr: '30 يومًا',  icon: <FaClock /> },
  { days: 60,  labelEn: '60 Days',  labelAr: '60 يومًا',  icon: <FaCalendarAlt /> },
  { days: 90,  labelEn: '90 Days',  labelAr: '90 يومًا',  icon: <FaCalendarAlt /> },
  { days: 180, labelEn: '6 Months', labelAr: '6 أشهر',   icon: <FaCalendarAlt /> },
  { days: 365, labelEn: '1 Year',   labelAr: 'سنة كاملة', icon: <FaLock /> },
];

function loadLetters() {
  try { return JSON.parse(localStorage.getItem('future_letters') || '[]'); }
  catch { return []; }
}

function saveLetters(letters) {
  try {
    localStorage.setItem('future_letters', JSON.stringify(letters));
  } catch {}
}

function daysUntil(sentAt, days) {
  const remaining = Math.ceil((sentAt + days * 86400000 - Date.now()) / 86400000);
  return Math.max(0, remaining);
}

export default function FutureLetterPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [content, setContent] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(30);
  const [letters, setLetters] = useState(loadLetters);
  const [sent, setSent] = useState(false);
  const [viewing, setViewing] = useState(null);

  const today = useMemo(() => new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }), [isRTL]);

  const sendLetter = () => {
    if (!content.trim()) return;
    const letter = {
      id: Date.now(),
      content: content.trim(),
      deliveryDays,
      sentAt: Date.now(),
    };
    const updated = [letter, ...letters];
    setLetters(updated);
    saveLetters(updated);
    setContent('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const deleteLetter = (id) => {
    const updated = letters.filter(l => l.id !== id);
    setLetters(updated);
    saveLetters(updated);
    if (viewing?.id === id) setViewing(null);
  };

  const isDelivered = (l) => Date.now() >= l.sentAt + l.deliveryDays * 86400000;

  return (
    <div className={`future-letter ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="future-letter-header">
        <h1>
          <GiQuillInk style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'رسالة إلى نسختي المستقبلية' : 'Letter to Future Me'}
        </h1>
        <p>
          {isRTL
            ? 'اكتب رسالة إلى نفسك للمستقبل — تُختم وتُسلّم إليك بعد 30، 60، أو 90 يوماً'
            : 'Write a message to yourself — it delivers in 30, 60, or 90 days'}
        </p>
        <span className="letter-badge">
          <GiWaxSeal style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? `${letters.length} رسائل مختومة بالشمع` : `${letters.length} Letters Sealed`}
        </span>
      </div>

      {/* ── Success Banner ── */}
      {sent && (
        <div className="letter-success">
          <FaCheckCircle />
          {isRTL
            ? `تم ختم الرسالة وجدولتها للتسليم بعد ${deliveryDays} يوماً بنجاح!`
            : `Letter sealed and scheduled for delivery in ${deliveryDays} days!`}
        </div>
      )}

      {/* ── Delivery Selector ── */}
      <div className="letter-delivery-row">
        {DELIVERY_OPTIONS_DATA.map(opt => (
          <button
            key={opt.days}
            className={`letter-delivery-btn ${deliveryDays === opt.days ? 'active' : ''}`}
            onClick={() => setDeliveryDays(opt.days)}
          >
            {opt.icon} {isRTL ? opt.labelAr : opt.labelEn}
          </button>
        ))}
      </div>

      {/* ── Letter Paper ── */}
      {!viewing ? (
        <div className="letter-paper-wrap">
          <div className="letter-paper">
            <div className="letter-paper-date">
              <FaCalendarAlt style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />{today}
            </div>
            <div className="letter-paper-to">
              <FaEnvelope />
              {isRTL
                ? `إلى نسختي العزيزة في المستقبل (بعد ${deliveryDays} يوماً من الآن)...`
                : `Dear Future Me (${deliveryDays} days from now)...`}
            </div>
            <textarea
              className="letter-textarea"
              placeholder={isRTL
                ? `اكتب رسالتك الصادقة هنا...
ما الذي تأمل أن تكون قد أنجزته؟ ما هي مخاوفك الحالية؟ ما هي النصيحة أو التذكير الذي تريد توجيهه لنفسك؟

تذكر دائماً — نسختك الحالية تكتب لمستقبلك، فكن صريحاً وملهماً.`
                : `Write your message here. What do you hope to have achieved? What are you worried about? What advice do you want to give yourself?

Remember — this you is writing to future you. Be honest.`}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="letter-signature">
              <GiQuillInk /> {isRTL ? 'نسختك السابقة' : 'Past You'} — {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </div>
          </div>
        </div>
      ) : (
        <div className="letter-paper-wrap">
          <div className="letter-paper">
            <div className="letter-paper-date">
              <FaCalendarAlt style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
              {isRTL ? 'تاريخ الكتابة: ' : 'Written: '}
              {new Date(viewing.sentAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="letter-paper-to">
              <FaEnvelopeOpen />
              {isRTL
                ? `إلى نسختي العزيزة في المستقبل (بعد مرور ${viewing.deliveryDays} يوماً)...`
                : `Dear Future Me (${viewing.deliveryDays} days later)...`}
            </div>
            <div style={{ color: '#e8d5a3', fontSize: '0.95rem', lineHeight: '31px', minHeight: '200px', whiteSpace: 'pre-wrap' }}>
              {viewing.content}
            </div>
            <div className="letter-signature">
              <GiQuillInk /> {isRTL ? 'نسختك السابقة' : 'Past You'} — {new Date(viewing.sentAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </div>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="letter-actions">
        {!viewing ? (
          <>
            <button className="letter-send-btn" onClick={sendLetter} disabled={!content.trim()}>
              <GiLockedBox /> {isRTL ? 'ختم وجدولة الرسالة' : 'Seal & Schedule'}
            </button>
            <button className="letter-clear-btn" onClick={() => setContent('')}>
              <FaTrash /> {isRTL ? 'مسح المسودة' : 'Clear'}
            </button>
          </>
        ) : (
          <>
            <button className="letter-send-btn" onClick={() => setViewing(null)} style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', boxShadow: 'none' }}>
              <FaPen /> {isRTL ? 'كتابة رسالة جديدة' : 'Write New Letter'}
            </button>
            <button className="letter-clear-btn" onClick={() => deleteLetter(viewing.id)}>
              <FaTrash /> {isRTL ? 'حذف الرسالة' : 'Delete Letter'}
            </button>
          </>
        )}
      </div>

      {/* ── Sent Letters ── */}
      {letters.length > 0 && (
        <div className="letter-sent-section">
          <h3><FaHistory /> {isRTL ? 'الرسائل المختومة والمجدولة' : 'Sealed Letters'}</h3>
          {letters.map(l => {
            const delivered = isDelivered(l);
            const remaining = daysUntil(l.sentAt, l.deliveryDays);
            return (
              <div
                key={l.id}
                className="letter-sent-item"
                onClick={() => delivered ? setViewing(l) : null}
                style={{ opacity: delivered ? 1 : 0.7, cursor: delivered ? 'pointer' : 'default' }}
              >
                <div className="letter-sent-row">
                  <div className="letter-sent-icon">
                    {delivered ? <FaEnvelopeOpen style={{ color: '#fbbf24' }} /> : <FaLock style={{ color: '#64748b' }} />}
                  </div>
                  <span className="letter-sent-target">
                    {isRTL
                      ? `إلى نسختي المستقبلية — بعد ${l.deliveryDays} يومًا`
                      : `To Future Me — ${l.deliveryDays} days`}
                  </span>
                  {delivered ? (
                    <span style={{ fontSize: '0.72rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FaCheckCircle /> {isRTL ? 'وصلت ومتاحة للقراءة' : 'Delivered'}
                    </span>
                  ) : (
                    <span className="letter-countdown">
                      <FaClock /> {isRTL ? `متبقي ${remaining} يوم` : `${remaining}d left`}
                    </span>
                  )}
                </div>
                <div className="letter-sent-preview">
                  {delivered
                    ? `"${l.content.slice(0, 80)}..."`
                    : (isRTL ? `[ مختومة بالشمع — ستُفتح بعد ${remaining} يوم ]` : `[ Sealed — opens in ${remaining} days ]`)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
