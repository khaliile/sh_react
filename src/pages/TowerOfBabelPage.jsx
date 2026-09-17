import React, { useState, useMemo } from 'react';
import {
  FaChessRook, FaLayerGroup, FaLanguage, FaCode, FaCheckCircle,
  FaTimesCircle, FaPlus, FaTrash, FaSearch, FaArrowUp, FaAward,
  FaLightbulb, FaBookOpen, FaFire, FaHammer, FaGlobe, FaStar
} from 'react-icons/fa';
import { GiTowerFlag, GiGreekTemple, GiStoneBlock, GiScrollUnfurled, GiAncientRuins } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './TowerOfBabelPage.css';

const TIERS = [
  {
    tier: 1,
    nameEn: 'Foundation of Sandstone',
    nameAr: 'أساس الحجر الرملي',
    minFloor: 1,
    maxFloor: 10,
    color: '#d97706',
    descEn: 'The bedrock of basic syntax and vocabulary.',
    descAr: 'القاعدة الأولى لأساسيات التراكيب والمفردات.'
  },
  {
    tier: 2,
    nameEn: 'Pillars of Bronze & Iron',
    nameAr: 'أعمدة البرونز والحديد',
    minFloor: 11,
    maxFloor: 25,
    color: '#0284c7',
    descEn: 'Structural algorithms and bilingual fluency.',
    descAr: 'الخوارزميات الهيكلية والطلاقة الثنائية.'
  },
  {
    tier: 3,
    nameEn: 'Spire of Obsidian & Glass',
    nameAr: 'صرح السبج والزجاج',
    minFloor: 26,
    maxFloor: 45,
    color: '#8b5cf6',
    descEn: 'Deep architectural logic and arcane terminology.',
    descAr: 'منطق المعماريات المتقدمة والمصطلحات الدقيقة.'
  },
  {
    tier: 4,
    nameEn: 'Celestial Crown of Babel',
    nameAr: 'تاج بابل السماوي',
    minFloor: 46,
    maxFloor: 999,
    color: '#10b981',
    descEn: 'Mastery across all languages, human and machine.',
    descAr: 'الإتقان المطلق لكافة لغات البشر والآلة.'
  }
];

const SAMPLE_DECIPHERS = [
  {
    id: 1,
    categoryEn: 'Code Syntax',
    categoryAr: 'تراكيب برمجية',
    promptEn: 'In Python, what is the time complexity of searching a key in a hashed dict on average?',
    promptAr: 'في لغة بايثون، ما هو التعقيد الزمني لمتوسط البحث عن مفتاح في القاموس المجزأ؟',
    optionsEn: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    optionsAr: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correct: 0,
    explanationEn: 'Hash tables offer amortized O(1) constant time lookup.',
    explanationAr: 'جداول التجزئة توفر وقتاً ثابتاً O(1) في المتوسط للبحث.'
  },
  {
    id: 2,
    categoryEn: 'Bilingual Mastery',
    categoryAr: 'بلاغة وترجمة',
    promptEn: 'Translate the concept "Graceful Degradation" accurately into Arabic context:',
    promptAr: 'ما المقابل الأدق لمصطلح "Graceful Degradation" في الأنظمة البرمجية؟',
    optionsEn: ['الانحدار المتدرج السلس', 'الانهيار التام المفاجئ', 'ضغط البيانات المشفرة', 'إيقاف الخوادم نهائياً'],
    optionsAr: ['الانحدار المتدرج السلس', 'الانهيار التام المفاجئ', 'ضغط البيانات المشفرة', 'إيقاف الخوادم نهائياً'],
    correct: 0,
    explanationEn: 'Ensures a system continues limited function even when parts fail.',
    explanationAr: 'استمرار النظام بالعمل بقدرة أساسية حتى مع تعطل بعض أجزائه.'
  },
  {
    id: 3,
    categoryEn: 'Algorithmic Logic',
    categoryAr: 'منطق خوارزمي',
    promptEn: 'Which data structure best represents hierarchical document object models (DOM)?',
    promptAr: 'ما هي بنية البيانات الأنسب لتمثيل شجرة العناصر في واجهات الويب (DOM)؟',
    optionsEn: ['Tree (شجرة)', 'Queue (طابور)', 'Hash Map (خريطة تجزئة)', 'Stack (مكدس)'],
    optionsAr: ['شجرة (Tree)', 'طابور (Queue)', 'خريطة تجزئة (Hash Map)', 'مكدس (Stack)'],
    correct: 0,
    explanationEn: 'The DOM is fundamentally an n-ary tree with nodes and sub-trees.',
    explanationAr: 'شجرة عناصر DOM هي في جوهرها شجرة متعددة التفرعات.'
  }
];

function loadCodex() {
  try {
    const saved = localStorage.getItem('babel_codex');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    { id: 1, term: 'Recursion / العودية', domain: 'Algorithms', notes: 'Solving a problem by solving smaller instances of the same problem.', mastered: true },
    { id: 2, term: 'Idempotency / الفعالية الذاتية', domain: 'System Design', notes: 'An operation that produces the same result no matter how many times it executes.', mastered: false },
    { id: 3, term: 'Backpropagation / الانتشار العكسي', domain: 'Deep Learning', notes: 'Calculating gradients via chain rule to update neural network weights.', mastered: true },
  ];
}

function saveCodex(items) {
  try { localStorage.setItem('babel_codex', JSON.stringify(items)); } catch {}
}

function loadBabelProgress() {
  try {
    const saved = localStorage.getItem('babel_progress');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { bricks: 38, solvedPuzzles: 5 };
}

function saveBabelProgress(p) {
  try { localStorage.setItem('babel_progress', JSON.stringify(p)); } catch {}
}

export default function TowerOfBabelPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const studyData = useMemo(() => getRealStudyData(), []);

  const [progress, setProgress] = useState(loadBabelProgress);
  const [codex, setCodex] = useState(loadCodex);
  const [activeTab, setActiveTab] = useState('tower'); // 'tower' | 'decipher' | 'codex'

  // Decipher state
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // New Codex term modal/inputs
  const [newTerm, setNewTerm] = useState('');
  const [newDomain, setNewDomain] = useState('General');
  const [newNotes, setNewNotes] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Tower math: 5 bricks per floor
  const currentFloor = Math.max(1, Math.floor(progress.bricks / 5) + 1);
  const nextFloorBricks = currentFloor * 5;
  const currentFloorProgress = progress.bricks % 5;

  const currentTier = TIERS.find(t => currentFloor >= t.minFloor && currentFloor <= t.maxFloor) || TIERS[0];

  const handleAddBrick = (amount = 1) => {
    const updated = { ...progress, bricks: progress.bricks + amount };
    setProgress(updated);
    saveBabelProgress(updated);
  };

  const currentPuzzle = SAMPLE_DECIPHERS[puzzleIndex % SAMPLE_DECIPHERS.length];

  const handleAnswer = (optIndex) => {
    if (isAnswered) return;
    setSelectedOpt(optIndex);
    setIsAnswered(true);
    if (optIndex === currentPuzzle.correct) {
      setQuizScore(s => s + 1);
      handleAddBrick(2);
      const updated = { ...progress, bricks: progress.bricks + 2, solvedPuzzles: progress.solvedPuzzles + 1 };
      setProgress(updated);
      saveBabelProgress(updated);
    }
  };

  const nextPuzzle = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    setPuzzleIndex(i => i + 1);
  };

  const handleAddCodex = (e) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    const newItem = {
      id: Date.now(),
      term: newTerm.trim(),
      domain: newDomain,
      notes: newNotes.trim(),
      mastered: false
    };
    const updated = [newItem, ...codex];
    setCodex(updated);
    saveCodex(updated);
    setNewTerm('');
    setNewNotes('');
  };

  const toggleMastered = (id) => {
    const updated = codex.map(item => item.id === id ? { ...item, mastered: !item.mastered } : item);
    setCodex(updated);
    saveCodex(updated);
  };

  const deleteCodexItem = (id) => {
    const updated = codex.filter(item => item.id !== id);
    setCodex(updated);
    saveCodex(updated);
  };

  const filteredCodex = codex.filter(c =>
    c.term.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.notes.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className={`babel-page ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── HEADER ── */}
      <header className="babel-header">
        <div className="babel-badge">
          <GiTowerFlag className="babel-badge-icon" />
          <span>{isRTL ? 'صرح المعرفة اللانهائي' : 'Infinite Monument of Mastery'}</span>
        </div>
        <h1>
          <FaChessRook className="babel-title-icon" />
          {isRTL ? 'برج بابل المعرفي' : 'Tower of Babel'}
        </h1>
        <p>
          {isRTL
            ? 'شيد صرحك حجراً بحجر عبر إتقان التراكيب، وفك شفرات اللغات والخوارزميات، والارتقاء نحو قمة الإدراك.'
            : 'Construct your towering spire stone by stone through syntax mastery, multilingual fluency, and intellectual ascension.'}
        </p>

        {/* Top Altitude HUD */}
        <div className="babel-hud-bar">
          <div className="babel-hud-stat">
            <span className="babel-hud-val" style={{ color: currentTier.color }}>
              FL {currentFloor}
            </span>
            <span className="babel-hud-lbl">{isRTL ? 'الطابق الحالي' : 'Current Floor'}</span>
          </div>
          <div className="babel-hud-divider" />
          <div className="babel-hud-stat">
            <span className="babel-hud-val">{progress.bricks}</span>
            <span className="babel-hud-lbl">{isRTL ? 'أحجار البناء' : 'Masonry Stones'}</span>
          </div>
          <div className="babel-hud-divider" />
          <div className="babel-hud-stat">
            <span className="babel-hud-val">{progress.solvedPuzzles}</span>
            <span className="babel-hud-lbl">{isRTL ? 'شفرات تم حلها' : 'Glyphs Deciphered'}</span>
          </div>
          <div className="babel-hud-divider" />
          <div className="babel-hud-stat">
            <span className="babel-hud-val" style={{ color: currentTier.color }}>
              {isRTL ? currentTier.nameAr : currentTier.nameEn}
            </span>
            <span className="babel-hud-lbl">{isRTL ? 'المرتبة المعمارية' : 'Architectural Tier'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="babel-tabs">
          <button
            className={`babel-tab-btn ${activeTab === 'tower' ? 'active' : ''}`}
            onClick={() => setActiveTab('tower')}
          >
            <GiStoneBlock className="babel-tab-icon" />
            <span>{isRTL ? 'صرح البرج والارتقاء' : 'Tower Spire & Ascent'}</span>
          </button>
          <button
            className={`babel-tab-btn ${activeTab === 'decipher' ? 'active' : ''}`}
            onClick={() => setActiveTab('decipher')}
          >
            <FaCode className="babel-tab-icon" />
            <span>{isRTL ? 'فك شفرات بابل' : 'Deciphering Matrix'}</span>
          </button>
          <button
            className={`babel-tab-btn ${activeTab === 'codex' ? 'active' : ''}`}
            onClick={() => setActiveTab('codex')}
          >
            <GiScrollUnfurled className="babel-tab-icon" />
            <span>{isRTL ? 'مخطوطة المصطلحات' : 'Lexical Codex'}</span>
          </button>
        </div>
      </header>

      {/* ── TAB 1: TOWER SPIRE ── */}
      {activeTab === 'tower' && (
        <div className="babel-tower-view">
          <div className="babel-spire-card">
            <div className="babel-card-header">
              <div>
                <h2>{isRTL ? 'هندسة الصرح المعماري' : 'Spire Architectural Layout'}</h2>
                <span className="babel-subtext">
                  {isRTL
                    ? `تحتاج ${5 - currentFloorProgress} أحجار لبلوغ الطابق القادم ${currentFloor + 1}`
                    : `${5 - currentFloorProgress} more stones required to ascend to Floor ${currentFloor + 1}`}
                </span>
              </div>
              <button
                className="babel-lay-brick-btn"
                onClick={() => handleAddBrick(1)}
                title={isRTL ? 'أضف حجر بناء دراسي (+1)' : 'Lay Masonry Stone (+1)'}
              >
                <FaHammer />
                <span>{isRTL ? 'وضع حجر بناء (+1)' : 'Lay Masonry Stone (+1)'}</span>
              </button>
            </div>

            {/* Visual Altitude Ladder */}
            <div className="babel-altitude-ladder">
              <div className="babel-ladder-progress-wrap">
                <div
                  className="babel-ladder-bar"
                  style={{
                    width: `${(currentFloorProgress / 5) * 100}%`,
                    background: `linear-gradient(90deg, ${currentTier.color}, #f59e0b)`
                  }}
                />
              </div>
              <div className="babel-ladder-labels">
                <span>{isRTL ? `الطابق ${currentFloor}` : `Floor ${currentFloor}`}</span>
                <span>{currentFloorProgress} / 5 {isRTL ? 'حجر' : 'Stones'}</span>
                <span>{isRTL ? `الطابق ${currentFloor + 1}` : `Floor ${currentFloor + 1}`}</span>
              </div>
            </div>

            {/* Tower Visual Stacks */}
            <div className="babel-tower-graphic">
              {/* Crown Pinnacle */}
              <div className="babel-floor-block babel-pinnacle">
                <FaStar className="babel-pinnacle-icon" />
                <span>{isRTL ? 'تاج السماء اللانهائي' : 'Celestial Zenith'}</span>
              </div>

              {/* Dynamic Floor Tiers */}
              {TIERS.slice().reverse().map((t) => {
                const isCurrent = currentTier.tier === t.tier;
                const isPassed = currentFloor > t.maxFloor;
                return (
                  <div
                    key={t.tier}
                    className={`babel-tier-slice ${isCurrent ? 'active-tier' : ''} ${isPassed ? 'passed-tier' : ''}`}
                    style={{ borderColor: t.color }}
                  >
                    <div className="babel-tier-slice-info">
                      <div className="babel-tier-title">
                        <GiGreekTemple style={{ color: t.color }} />
                        <strong>{isRTL ? t.nameAr : t.nameEn}</strong>
                        <span className="babel-floor-range">FL {t.minFloor}–{t.maxFloor === 999 ? '∞' : t.maxFloor}</span>
                      </div>
                      <p className="babel-tier-desc">{isRTL ? t.descAr : t.descEn}</p>
                    </div>
                    <div className="babel-tier-status">
                      {isCurrent && (
                        <span className="babel-chip current">
                          <FaArrowUp /> {isRTL ? 'موقعك هنا' : 'Current Ascent'}
                        </span>
                      )}
                      {isPassed && (
                        <span className="babel-chip passed">
                          <FaCheckCircle /> {isRTL ? 'تم تشييده' : 'Erected'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DECIPHERING MATRIX ── */}
      {activeTab === 'decipher' && (
        <div className="babel-decipher-view">
          <div className="babel-puzzle-card">
            <div className="babel-puzzle-header">
              <span className="babel-puzzle-tag">
                <FaLanguage /> {isRTL ? currentPuzzle.categoryAr : currentPuzzle.categoryEn}
              </span>
              <span className="babel-puzzle-step">
                {isRTL ? `المعضلة #${puzzleIndex + 1}` : `Glyph #${puzzleIndex + 1}`}
              </span>
            </div>

            <h3 className="babel-puzzle-prompt">
              {isRTL ? currentPuzzle.promptAr : currentPuzzle.promptEn}
            </h3>

            <div className="babel-options-grid">
              {(isRTL ? currentPuzzle.optionsAr : currentPuzzle.optionsEn).map((opt, idx) => {
                let btnClass = 'babel-option-btn';
                if (isAnswered) {
                  if (idx === currentPuzzle.correct) btnClass += ' correct';
                  else if (idx === selectedOpt) btnClass += ' wrong';
                }
                return (
                  <button
                    key={idx}
                    className={btnClass}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                  >
                    <span className="babel-opt-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="babel-opt-text">{opt}</span>
                    {isAnswered && idx === currentPuzzle.correct && (
                      <FaCheckCircle className="babel-opt-icon green" />
                    )}
                    {isAnswered && idx === selectedOpt && idx !== currentPuzzle.correct && (
                      <FaTimesCircle className="babel-opt-icon red" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="babel-explanation-box">
                <div className="babel-exp-header">
                  <FaLightbulb />
                  <strong>{isRTL ? 'تفسير وحكمة بابل:' : 'Babel Revelation:'}</strong>
                </div>
                <p>{isRTL ? currentPuzzle.explanationAr : currentPuzzle.explanationEn}</p>
                <div className="babel-exp-actions">
                  <button className="babel-next-btn" onClick={nextPuzzle}>
                    <span>{isRTL ? 'فك الشفرة التالية' : 'Decipher Next Glyph'}</span>
                    <FaArrowUp style={{ transform: isRTL ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: LEXICAL CODEX ── */}
      {activeTab === 'codex' && (
        <div className="babel-codex-view">
          {/* Add Entry Card */}
          <form className="babel-add-form" onSubmit={handleAddCodex}>
            <h3>
              <FaBookOpen />
              {isRTL ? 'نقش مصطلح أو مفهوم جديد في المخطوطة' : 'Inscribe New Term or Concept'}
            </h3>
            <div className="babel-form-row">
              <input
                type="text"
                className="babel-input"
                placeholder={isRTL ? 'المصطلح أو المفهوم (مثال: Dynamic Programming)' : 'Term / Concept (e.g., Dynamic Programming)'}
                value={newTerm}
                onChange={e => setNewTerm(e.target.value)}
                required
              />
              <select
                className="babel-select"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
              >
                <option value="Algorithms">{isRTL ? 'خوارزميات' : 'Algorithms'}</option>
                <option value="System Design">{isRTL ? 'تصميم أنظمة' : 'System Design'}</option>
                <option value="Deep Learning">{isRTL ? 'تعلم عميق' : 'Deep Learning'}</option>
                <option value="Language / Polyglot">{isRTL ? 'لغات وترجمة' : 'Language / Polyglot'}</option>
                <option value="General">{isRTL ? 'عام' : 'General'}</option>
              </select>
            </div>
            <textarea
              className="babel-textarea"
              rows={2}
              placeholder={isRTL ? 'شرح المفهوم أو صياغة الترجمة الدقيقة...' : 'Clear definition, translation nuance, or memory anchor...'}
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
            />
            <button type="submit" className="babel-submit-btn">
              <FaPlus />
              <span>{isRTL ? 'تخليد في المخطوطة' : 'Inscribe into Codex'}</span>
            </button>
          </form>

          {/* Search bar */}
          <div className="babel-search-bar">
            <FaSearch className="babel-search-icon" />
            <input
              type="text"
              className="babel-search-input"
              placeholder={isRTL ? 'ابحث في المخطوطة والمصطلحات...' : 'Search codex entries and disciplines...'}
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>

          {/* Codex List */}
          <div className="babel-codex-grid">
            {filteredCodex.map(item => (
              <div key={item.id} className={`babel-codex-card ${item.mastered ? 'mastered' : ''}`}>
                <div className="babel-codex-header">
                  <span className="babel-codex-domain">{item.domain}</span>
                  <div className="babel-codex-actions">
                    <button
                      className={`babel-mastery-btn ${item.mastered ? 'active' : ''}`}
                      onClick={() => toggleMastered(item.id)}
                      title={isRTL ? 'تحديد كـ متقن' : 'Toggle Mastery'}
                    >
                      <FaAward />
                    </button>
                    <button
                      className="babel-delete-btn"
                      onClick={() => deleteCodexItem(item.id)}
                      title={isRTL ? 'حذف' : 'Delete'}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <h4 className="babel-codex-term">{item.term}</h4>
                {item.notes && <p className="babel-codex-notes">{item.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
