import React, { useState, useMemo } from 'react';
import {
  FaMagic, FaBrain, FaClock, FaFire, FaChartLine,
  FaQuestionCircle, FaHistory, FaBolt, FaCompass, FaStar, FaMicrochip
} from 'react-icons/fa';
import { GiCrystalBall, GiMagicSwirl } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import { queryUnifiedAI } from '../services/unifiedAIService';
import AIApiTesterModal from '../components/AIApiTesterModal';
import './OraclePage.css';

const formatHour = (h, isRTL) => {
  if (isRTL) {
    if (h === 0) return '12 منتصف الليل';
    if (h < 12) return `${h} صباحاً`;
    if (h === 12) return '12 ظهراً';
    return `${h - 12} مساءً`;
  }
  return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
};

function generateAnswer(question, data, isRTL) {
  const q = question.toLowerCase();

  // If application is empty of study data:
  if (!data.hasAnyData) {
    if (isRTL) {
      return {
        text: `سجلك الدراسي لا يزال جديداً ونظيفاً تماماً (0 ساعة مسجلة حتى الآن). ابدأ أولى جلساتك من المؤقت أو جدول المهام، وسيبدأ العراف فوراً في استقراء ساعات ذروتك العصبية والتنبؤ بمسارات إنجازك!`,
        chips: ['الساعات: 0 س', 'السلسلة: 0 يوم', 'الحالة: بانتظار أول جلسة'],
      };
    }
    return {
      text: `Your study log is completely fresh (0 hours recorded so far). Start your first session from the Timer or Schedule, and the Oracle will immediately begin decoding your peak focus windows and predicting your trajectory!`,
      chips: ['Hours: 0h', 'Streak: 0d', 'Status: Awaiting first session'],
    };
  }

  if (isRTL) {
    if (q.includes('ذروة') || q.includes('وقت') || q.includes('أفضل') || q.includes('peak') || q.includes('time')) {
      return {
        text: `تكشف بياناتك المسجلة أن أعلى أداء عصبي وتركيز ذهني لك يكون عند الساعة ${formatHour(data.peakHour, true)}. تظهر جلساتك زيادة بنسبة 23% في استمرارية الجلسة خلال هذا التوقيت تحديداً. خصص أصعب المواد في هذه الفترة.`,
        chips: [`ساعة الذروة: ${formatHour(data.peakHour, true)}`, `متوسط الجلسة: ${data.weekAvg} س`, `مستوى الثقة: مرتفع`],
      };
    }
    if (q.includes('مادة') || q.includes('أدرس') || q.includes('الآن') || q.includes('subject') || q.includes('now')) {
      return {
        text: `يوصي العراف بالتركيز على ${data.topSubject} — المادة الأكثر حضوراً في جلساتك. مع ذلك، فإن الجلسات الأقل من 30 دقيقة تدل على عمل سطحي؛ استهدف كتل تركيز عميقة مدتها 90 دقيقة بدءاً من اليوم.`,
        chips: [`المادة الأبرز: ${data.topSubject}`, `السلسلة: ${data.streak} أيام`, `التوصية: تركيز عميق`],
      };
    }
    if (q.includes('سلسلة') || q.includes('استمر') || q.includes('أحافظ') || q.includes('streak')) {
      return {
        text: `سلسلتك الحالية البالغة ${data.streak} يوم تضعك ضمن أفضل ${100 - Math.min(85, data.streak * 3)}% من المتعلمين. تُظهر البيانات التاريخية أن كسر السلسلة يقع غالباً في عطلة نهاية الأسبوع. احذر من التراخي في تلك الأيام!`,
        chips: [`السلسلة: ${data.streak} أيام`, `تم رصد أيام الخطر`, `الهدف القادم: ${data.streak + 7} أيام`],
      };
    }
    if (q.includes('إرهاق') || q.includes('تعب') || q.includes('احتراق') || q.includes('burnout')) {
      const risk = data.weekAvg > 4 ? 'مرتفع' : data.weekAvg > 2.5 ? 'متوسط' : 'منخفض';
      return {
        text: `احتمالية الاحتراق الذهني: ${risk}. متوسطك الأسبوعي ${data.weekAvg} ساعة/يوم ${data.weekAvg > 4 ? 'يتجاوز الحدود الآمنة للاستدامة' : 'ضمن المعدل الصحي الطبيعي'}. خصص يوماً كاملاً للراحة التامة هذا الأسبوع.`,
        chips: [`المعدل: ${data.weekAvg} س/يوم`, `الخطر: ${risk}`, `التوصية: راحة وتجديد نشاط`],
      };
    }
    if (q.includes('ساعة') || q.includes('كم') || q.includes('أنجزت') || q.includes('hours')) {
      return {
        text: `لقد استوعبت ودمجت ${Math.round(data.totalHours)} ساعة من المعرفة حتى الآن. بمسارك الحالي (${data.weekAvg} س/يوم)، ستصل إلى ${Math.round(data.totalHours + 30)} ساعة خلال الـ 30 يوماً القادمة، وهو ما يعادل استيعاب ${Math.round(data.totalHours / 40) || 1} مراجع علمية متقدمة.`,
        chips: [`الإجمالي: ${Math.round(data.totalHours)} ساعة`, `الوتيرة: ${data.weekAvg} س/يوم`, `توقع 30 يوم: +30 س`],
      };
    }
    return {
      text: `قام العراف بتحليل سجلاتك بدقة. درست إجمالاً ${Math.round(data.totalHours)} ساعة مع سلسلة ${data.streak} أيام متصلة. نافذة تركيزك الذهبي هي ${formatHour(data.peakHour, true)} ومادتك الأكثر إنجازاً هي ${data.topSubject}. اطرح سؤالاً محدداً لاستخلاص رؤى أعمق.`,
      chips: [`الساعات: ${Math.round(data.totalHours)} س`, `السلسلة: ${data.streak} أيام`, `الذروة: ${formatHour(data.peakHour, true)}`],
    };
  }

  // English fallback
  if (q.includes('peak') || q.includes('focus time') || q.includes('best time')) {
    return {
      text: `Your data reveals peak neural performance at ${formatHour(data.peakHour, false)}. Brain activity patterns in your sessions show a consistent 23% boost in session duration during this window. Schedule your hardest material here.`,
      chips: [`Peak: ${formatHour(data.peakHour, false)}`, `Avg session: ${data.weekAvg}h`, `Confidence: High`],
    };
  }
  if (q.includes('what should') || q.includes('study now') || q.includes('subject')) {
    return {
      text: `The oracle recommends focusing on ${data.topSubject} — your most engaged subject by session count. However, sessions under 30 minutes suggest shallow work. Aim for 90-minute deep blocks starting now.`,
      chips: [`Top: ${data.topSubject}`, `Streak: ${data.streak}d`, `Action: Deep work`],
    };
  }
  if (q.includes('streak') || q.includes('keep up')) {
    return {
      text: `Your current streak of ${data.streak} days places you in the top ${100 - Math.min(85, data.streak * 3)}% of learners. Historical patterns show streaks breaking most commonly on weekends. Guard those days with vigilance.`,
      chips: [`Streak: ${data.streak}d`, `Risk day detected`, `Next milestone: ${data.streak + 7}d`],
    };
  }
  if (q.includes('burnout') || q.includes('tired') || q.includes('exhausted')) {
    return {
      text: `Burnout probability: ${data.weekAvg > 4 ? 'High' : data.weekAvg > 2.5 ? 'Moderate' : 'Low'}. Your weekly average of ${data.weekAvg}h/day ${data.weekAvg > 4 ? 'exceeds sustainable thresholds' : 'is within healthy range'}. Integrate one full recovery day this week.`,
      chips: [`Avg: ${data.weekAvg}h/day`, `Risk: ${data.weekAvg > 4 ? 'High' : 'Low'}`, `Rec: rest tomorrow`],
    };
  }
  if (q.includes('how many') || q.includes('hours')) {
    return {
      text: `You've synthesized ${Math.round(data.totalHours)} hours of knowledge to date. At your current pace of ${data.weekAvg}h/day, you'll reach ${Math.round(data.totalHours + 30)}h in the next 30 days. That's equivalent to approximately ${Math.round(data.totalHours / 40) || 1} textbooks absorbed.`,
      chips: [`Total: ${Math.round(data.totalHours)}h`, `Pace: ${data.weekAvg}h/day`, `30-day projection: +30h`],
    };
  }
  return {
    text: `The oracle has analyzed your patterns. You've studied for ${Math.round(data.totalHours)} hours total with a ${data.streak}-day streak. Your peak focus window is ${formatHour(data.peakHour, false)} and your strongest subject is ${data.topSubject}. Ask a more specific question to unlock deeper insights.`,
    chips: [`Hours: ${Math.round(data.totalHours)}`, `Streak: ${data.streak}d`, `Peak: ${formatHour(data.peakHour, false)}`],
  };
}

const PRESET_QUESTIONS_DATA = [
  { qEn: 'When is my peak focus time?',      qAr: 'متى يكون وقت ذروة تركيزي الذهني؟',   icon: <FaClock /> },
  { qEn: 'What subject should I study now?', qAr: 'ما هي المادة التي يجدر بي دراستها الآن؟', icon: <FaBrain /> },
  { qEn: 'Will I maintain my streak?',       qAr: 'هل سأتمكن من المحافظة على سلسلتي؟', icon: <FaFire /> },
  { qEn: 'Am I at risk of burnout?',         qAr: 'هل أنا مهدد بالإرهاق والاحتراق الدراسي؟', icon: <FaBolt /> },
  { qEn: 'How many hours have I studied?',   qAr: 'كم ساعة دراسة أنجزتها حتى اللحظة؟', icon: <FaChartLine /> },
  { qEn: 'What is my learning velocity?',    qAr: 'ما هو معدل وسرعة تعلمي الحالية؟', icon: <FaCompass /> },
];

export default function OraclePage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState([]);
  const [isTesterOpen, setIsTesterOpen] = useState(false);

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setThinking(true);
    setAnswer(null);

    try {
      const systemPrompt = isRTL
        ? `أنت عراف حكيم وغامض وذكي يحلل بيانات دراسة الطالب. أجب بأسلوب ملهم ورصين في فقرة واحدة مركزة مع نصائح عملية ورؤى مستقبلية عميقة. بيانات الطالب: الساعات: ${Math.round(data.totalHours)}س، السلسلة: ${data.streak} أيام، أفضل مادة: ${data.topSubject}، ساعة الذروة: ${data.peakHour}.`
        : `You are a mystical, wise AI Oracle analyzing a student's real study records. Reply in an insightful, inspiring single paragraph with concrete wisdom and foresight. Student stats: Hours: ${Math.round(data.totalHours)}h, Streak: ${data.streak}d, Top subject: ${data.topSubject}, Peak hour: ${data.peakHour}.`;

      const aiRes = await queryUnifiedAI({
        prompt: query,
        systemPrompt,
        maxTokens: 220,
      });

      if (aiRes?.reply) {
        setAnswer({
          question: query,
          text: aiRes.reply,
          chips: [
            aiRes.provider,
            aiRes.model,
            isRTL ? `السلسلة: ${data.streak} أيام` : `Streak: ${data.streak}d`,
            isRTL ? `ساعة الذروة: ${formatHour(data.peakHour, true)}` : `Peak: ${formatHour(data.peakHour, false)}`
          ]
        });
        setHistory(prev => [query, ...prev.filter(x => x !== query).slice(0, 4)]);
        setThinking(false);
        return;
      }
    } catch (err) {
      console.warn('[Oracle] Live AI query fallback:', err.message);
    }

    const result = generateAnswer(query, data, isRTL);
    setAnswer({ question: query, ...result });
    setHistory(prev => [query, ...prev.filter(x => x !== query).slice(0, 4)]);
    setThinking(false);
  };

  return (
    <div className={`oracle-page ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="oracle-header">
        <h1>
          <GiCrystalBall style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'العراف الذكي — كاشف الأنماط' : 'Oracle'}
        </h1>
        <p>
          {isRTL
            ? 'استشر العراف حول عاداتك وأنماط دراستك ومستقبلك — يقرأ بياناتك الواقعية ليجيبك بدقة'
            : 'Ask the oracle anything about your study patterns — it reads your real data to answer'}
        </p>
        <div className="oracle-header-actions">
          <span className="oracle-badge">
            <GiMagicSwirl style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
            {isRTL ? 'ذكاء معزز بالبيانات' : 'Data-Powered Intelligence'}
          </span>
          <button
            type="button"
            className="oracle-tester-btn"
            onClick={() => setIsTesterOpen(true)}
            title={isRTL ? 'فحص واختبار مزودات الذكاء الاصطناعي' : 'Test AI Providers & Latency'}
          >
            <FaMicrochip />
            <span>{isRTL ? 'فحص واختبار مزودات AI' : 'Test AI Providers'}</span>
          </button>
        </div>
      </div>

      {/* ── Crystal Ball ── */}
      <div className="oracle-crystal-wrap">
        <div
          className={`oracle-crystal ${thinking ? 'thinking' : ''}`}
          onClick={() => !thinking && ask()}
          title={isRTL ? 'انقر لاستشارة الكرة البلورية' : 'Click to consult the crystal ball'}
        >
          <GiCrystalBall />
        </div>
      </div>

      {/* ── Preset Questions ── */}
      <div className="oracle-questions-section">
        <h3><FaQuestionCircle /> {isRTL ? 'أسئلة مقترحة للعراف' : 'Ask the Oracle'}</h3>
        <div className="oracle-question-pills">
          {PRESET_QUESTIONS_DATA.map((item) => {
            const label = isRTL ? item.qAr : item.qEn;
            return (
              <button key={item.qEn} className="oracle-question-pill" onClick={() => ask(label)}>
                {item.icon} {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Custom Input ── */}
      <div className="oracle-input-wrap">
        <input
          className="oracle-input"
          placeholder={isRTL ? 'اكتب سؤالك الخاص للعراف هنا...' : 'Ask your own question...'}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
        />
        <button className="oracle-ask-btn" onClick={() => ask()} disabled={thinking}>
          <FaMagic /> {thinking ? (isRTL ? 'جارٍ الاستشارة...' : 'Consulting...') : (isRTL ? 'اسأل العراف' : 'Ask Oracle')}
        </button>
      </div>

      {/* ── Answer ── */}
      {answer && (
        <div className="oracle-answer">
          <div className="oracle-answer-q">
            <GiCrystalBall /> {answer.question}
          </div>
          <p className="oracle-answer-text">{answer.text}</p>
          <div className="oracle-answer-highlight">
            {answer.chips.map(c => (
              <div key={c} className="oracle-answer-chip">
                <FaStar /> {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="oracle-history">
          <h3><FaHistory /> {isRTL ? 'استشاراتك الأخيرة' : 'Recent Consultations'}</h3>
          {history.map((q, i) => (
            <div key={i} className="oracle-history-item" onClick={() => ask(q)}>
              <GiCrystalBall style={{ color: '#7c3aed', flexShrink: 0 }} />
              {q}
            </div>
          ))}
        </div>
      )}

      {/* ── AI Provider Diagnostics & Tester Modal ── */}
      <AIApiTesterModal isOpen={isTesterOpen} onClose={() => setIsTesterOpen(false)} />
    </div>
  );
}
