import { useState, useMemo, useEffect } from 'react';
import { 
  FaGraduationCap, FaSyncAlt, FaCoins, FaPlus, 
  FaCheck, FaTimes, FaUndo, FaTag, FaEdit, FaTrash,
  FaRobot, FaLightbulb, FaSpinner, FaMagic, FaBrain, FaInfoCircle, FaBolt
} from 'react-icons/fa';
import { INITIAL_FLASHCARDS } from '../data/flashcards';
import { useAppStorage } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { playTick, playFanfare } from '../utils/sounds';
import FlashcardHarvester from './FlashcardHarvester';

// ── Vercel AI Gateway constants ─────────────────────────────────────────────
const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
const VERCEL_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const VERCEL_BACKEND_PROXY = 'http://localhost:8000/api/ai-gateway';
const VERCEL_MODEL = 'google/gemini-2.5-flash';


export default function FlashcardArena() {
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const { addXpAndCoins } = useRpgStorage();

  const getDeckDisplayName = (deckKey) => {
    if (isAr) {
      if (deckKey === 'ds' || deckKey === 'data-science') return 'علوم البيانات';
      if (deckKey === 'math') return 'الرياضيات';
      if (deckKey === 'english') return 'اللغة الإنجليزية';
      if (deckKey === 'python-module-1') return 'الوحدة 1 بايثون';
    }
    return deckKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const translateTag = (tag) => {
    if (!isAr || !tag) return tag;
    const tagMap = {
      'Data Science': 'علوم البيانات',
      'Machine Learning': 'تعلم الآلة',
      'Model Evaluation': 'تقييم النماذج',
      'Metrics': 'المقاييس',
      'Classification': 'التصنيف',
      'Optimization': 'التحسين',
      'Deep Learning': 'التعلم العميق',
      'Regularization': 'تنظيم النموذج',
      'Linear Models': 'النماذج الخطية',
      'Dimensionality Reduction': 'تقليل الأبعاد',
      'Ensemble Methods': 'أساليب التجميع',
      'harvested': 'مستخرج',
      'Math': 'الرياضيات',
      'English': 'اللغة الإنجليزية',
      'Algebra': 'الجبر',
      'Calculus': 'التفاضل والتكامل',
      'Statistics': 'الإحصاء',
      'Probability': 'الاحتمالات',
      'Python': 'بايثون',
      'Vocab': 'مفردات'
    };
    return tagMap[tag] || tag;
  };

  const [decks, setDecks] = useAppStorage('app_flashcards_decks', INITIAL_FLASHCARDS);
  const [cardStats, setCardStats] = useAppStorage('app_flashcards_stats', {
    totalReviews: 0,
    history: {},
  });

  // ── AI Mnemonic & Breakdown State ─────────────────────────────────────────
  const [aiMnemonicLoading, setAiMnemonicLoading] = useState(false);
  const [aiMnemonicData, setAiMnemonicData] = useState(null);
  const [aiMnemonicOpen, setAiMnemonicOpen] = useState(false);


  // Normalize deck keys & auto-seed rich defaults if decks are empty
  useEffect(() => {
    let changed = false;
    const normalizedDecks = {};

    Object.keys(decks).forEach(oldKey => {
      const normalizedKey = oldKey.trim().toLowerCase().replace(/\s+/g, '-');
      if (normalizedDecks[normalizedKey]) {
        normalizedDecks[normalizedKey] = [
          ...normalizedDecks[normalizedKey],
          ...decks[oldKey]
        ];
      } else {
        normalizedDecks[normalizedKey] = decks[oldKey];
      }
      if (oldKey !== normalizedKey) changed = true;
    });

    // Ensure default decks (ds, math, english, python-module-1) are seeded if empty
    Object.keys(INITIAL_FLASHCARDS).forEach(key => {
      if (!normalizedDecks[key] || normalizedDecks[key].length === 0) {
        normalizedDecks[key] = INITIAL_FLASHCARDS[key];
        changed = true;
      }
    });

    if (changed) {
      setDecks(normalizedDecks);
    }
  }, []); // Run only once on mount

  const [selectedDeck, setSelectedDeck] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Form state (Add / Edit / Harvester)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHarvesterOpen, setIsHarvesterOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);

  // Form inputs
  const [newDeckKey, setNewDeckKey] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTag, setNewTag] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Detect if text contains Arabic characters
  const isArabic = (text) => {
    if (!text) return false;
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicPattern.test(text);
  };

  const totalAllCardsCount = useMemo(() => {
    return Object.values(decks).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
  }, [decks]);

  const activeCards = useMemo(() => {
    if (selectedDeck === 'all') {
      return Object.keys(decks).flatMap(deckKey => decks[deckKey] || []);
    }
    return decks[selectedDeck] || [];
  }, [decks, selectedDeck]);

  const currentCard = activeCards[currentIndex] || null;

  const handleRate = (intervalDays, qualityLabel) => {
    if (!currentCard) return;

    playTick();
    addXpAndCoins(15, 3, `Reviewed Card: ${currentCard.front.slice(0, 20)}...`);

    // Dispatch event to mascot for voice reaction & character dialog
    try {
      window.dispatchEvent(new CustomEvent('mascot-event', {
        detail: {
          eventType: 'FLASHCARD_COMPLETED',
          taskName: currentCard.front,
          userMessage: `Reviewed flashcard: ${currentCard.front.slice(0, 30)}`
        }
      }));
    } catch { /* noop */ }

    const now = Date.now();
    const nextDue = now + intervalDays * 24 * 60 * 60 * 1000;

    setCardStats(prev => ({
      ...prev,
      totalReviews: (prev.totalReviews || 0) + 1,
      history: {
        ...(prev.history || {}),
        [currentCard.id || currentCard.front]: { // Fallback to front if no id
          lastReviewed: now,
          nextDue,
          intervalDays,
          rating: qualityLabel,
        },
      },
    }));

    showToast(`+15 XP & +3 Coins! Next review in ${intervalDays} day${intervalDays > 1 ? 's' : ''}`);

    setIsFlipped(false);
    if (currentIndex + 1 < activeCards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
      playFanfare();
      showToast('Deck session completed!');
    }
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim() || !newDeckKey.trim()) {
      showToast('Please fill all required fields (Deck, Front, Back)');
      return;
    }

    // Clean deck key: lowercase with hyphens
    const cleanDeckKey = newDeckKey.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Display name: capitalize each word
    const displayName = cleanDeckKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const cardData = {
      id: editingCardId || `custom_${Date.now()}`,
      deck: displayName,
      front: newFront.trim(),
      back: newBack.trim(),
      tags: newTag.trim() ? [newTag.trim()] : ['Custom'],
    };

    setDecks(prev => {
      const updatedDecks = { ...prev };
      
      // If editing, remove old card from all decks
      if (editingCardId) {
        Object.keys(updatedDecks).forEach(key => {
          updatedDecks[key] = updatedDecks[key].filter(c => c.id !== editingCardId);
        });
      }
      
      // Add card to target deck (create deck if it doesn't exist)
      updatedDecks[cleanDeckKey] = [cardData, ...(updatedDecks[cleanDeckKey] || [])];
      return updatedDecks;
    });

    closeForm();
    showToast(editingCardId ? 'Card updated successfully!' : `Flashcard added to "${displayName}"!`);
  };

  const openAddForm = () => {
    setEditingCardId(null);
    setNewFront('');
    setNewBack('');
    setNewTag('');
    setNewDeckKey(''); // Empty, user must type their own deck name
    setIsFormOpen(true);
  };

  const openEditForm = (e) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    
    // Find which deck this card belongs to
    let currentDeckKey = '';
    Object.keys(decks).forEach(deckKey => {
      if (decks[deckKey].some(c => c.id === currentCard.id)) {
        currentDeckKey = deckKey;
      }
    });

    // Convert normalized key back to display name for editing
    const displayName = currentDeckKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    setEditingCardId(currentCard.id || null);
    setNewDeckKey(displayName); // Show user-friendly name, not normalized key
    setNewFront(currentCard.front);
    setNewBack(currentCard.back);
    setNewTag(currentCard.tags?.length ? currentCard.tags[0] : '');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCardId(null);
  };

  const handleDeleteDeck = (e, deckKey) => {
    e.stopPropagation(); // Prevent tab selection when clicking delete
    
    const deckName = deckKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    const cardCount = (decks[deckKey] || []).length;
    
    if (!window.confirm(`Delete "${deckName}" deck with ${cardCount} card(s)? This cannot be undone.`)) {
      return;
    }

    setDecks(prev => {
      const updated = { ...prev };
      delete updated[deckKey];
      return updated;
    });

    // Switch to 'all' if deleted deck was selected
    if (selectedDeck === deckKey) {
      setSelectedDeck('all');
      setCurrentIndex(0);
      setIsFlipped(false);
    }

    showToast(`"${deckName}" deck deleted.`);
  };

  // تم تحديث دالة الحذف لتصبح أكثر دقة
  const handleDeleteCard = (e) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this flashcard?');
    if (!confirmDelete) return;

    setDecks(prev => {
      const updatedDecks = { ...prev };
      Object.keys(updatedDecks).forEach(key => {
        if (Array.isArray(updatedDecks[key])) {
          updatedDecks[key] = updatedDecks[key].filter(c => {
            // التحقق بالـ ID إن وُجد، وإلا التحقق من خلال نص الواجهة الأمامية
            if (c.id && currentCard.id) {
              return c.id !== currentCard.id;
            }
            return c.front !== currentCard.front;
          });
        }
      });
      return updatedDecks;
    });

    setIsFlipped(false);
    
    if (currentIndex > 0 && currentIndex >= activeCards.length - 1) {
      setCurrentIndex(prev => prev - 1);
    }
    showToast('Card deleted.');
  };

  const handleGenerateMnemonic = async () => {
    if (!currentCard) return;
    setAiMnemonicLoading(true);
    setAiMnemonicOpen(true);
    setAiMnemonicData(null);

    try {
      const isCardArabic = isArabic(currentCard.front) || isArabic(currentCard.back);
      const systemPrompt = isCardArabic
        ? `أنت مدرب ذاكرة عالمي وعالم معرفي. بالنظر إلى سؤال وجواب بطاقة الاستذكار، أنشئ أسلوب ربط ذهني وتشبيه بصري جذاب (Mnemonic) وشرحاً مبسطاً يساعد الطالب على تثبيت المعلومة في الذاكرة طويلة المدى.
أخرج النتيجة بتنسيق JSON خالص فقط:
{
  "mnemonic": "جملة أو قصة بصرية ممتعة ومميزة للربط والتذكر",
  "analogy": "تشبيه واقعي بسيط من الحياة اليومية",
  "breakdown": "شرح موجز ومركّز من جملتين للمفهوم الجوهري"
}`
        : `You are a world-class memory coach and cognitive scientist.
Given a flashcard Question and Answer, generate a vivid visual mnemonic, analogy, and 2-sentence deep concept breakdown to lock it permanently into human memory.

OUTPUT FORMAT — Pure JSON object only:
{
  "mnemonic": "A vivid, bizarre, or memorable visual hook / story",
  "analogy": "An intuitive real-world analogy",
  "breakdown": "A crisp 2-sentence explanation of why this concept matters"
}
No markdown code fences. Pure JSON only.`;

      const payload = {
        model: VERCEL_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Question: "${currentCard.front}"\nAnswer: "${currentCard.back}"` }
        ],
        max_tokens: 800,
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
          signal: AbortSignal.timeout(15000),
        });
        const data = await res.json();
        if (res.ok) {
          const raw = data?.choices?.[0]?.message?.content || '';
          const clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
          parsed = JSON.parse(clean);
        }
      } catch (err) {
        console.warn('[Flashcard AI] Direct Vercel failed, trying local proxy:', err.message);
      }

      // 2. Local Proxy fallback
      if (!parsed) {
        try {
          const res = await fetch(VERCEL_BACKEND_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(20000),
          });
          if (res.ok) {
            const data = await res.json();
            const raw = data?.choices?.[0]?.message?.content || '';
            const clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
            parsed = JSON.parse(clean);
          }
        } catch (proxyErr) {
          console.warn('[Flashcard AI] Local proxy failed:', proxyErr.message);
        }
      }

      if (!parsed) throw new Error('AI service is temporarily busy.');

      setAiMnemonicData(parsed);
      addXpAndCoins(10, 2, 'AI Mnemonic Generated');
    } catch (err) {
      showToast(`Mnemonic failed: ${err.message}`);
      setAiMnemonicOpen(false);
    } finally {
      setAiMnemonicLoading(false);
    }
  };

  return (
    <div className="arena-card flashcard-arena-card">
      <div className="flashcard-arena-header">
        <div className="flashcard-title-flex">
          <FaGraduationCap style={{ color: '#38bdf8', fontSize: '1.4rem' }} />
          <div>
            <h3>{t('flashcards.arenaTitle')}</h3>
            <p>{t('flashcards.arenaSubtitle')}</p>
          </div>
        </div>

        <div className="flashcard-header-stats">
          <span className="fc-stat-chip">
            <strong>{cardStats.totalReviews || 0}</strong> {t('flashcards.reviewsDone')}
          </span>
          <button
            className="fc-add-btn"
            onClick={() => setIsHarvesterOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
              marginRight: '6px'
            }}
            title={t('flashcards.autoHarvestTitle')}
          >
            {t('flashcards.autoHarvest')}
          </button>
          <button className="fc-add-btn" onClick={openAddForm}>
            <FaPlus /> {t('flashcards.addCard')}
          </button>
        </div>
      </div>

      <div className="fc-deck-tabs">
        <button
          className={`fc-deck-tab ${selectedDeck === 'all' ? 'active' : ''}`}
          onClick={() => { setSelectedDeck('all'); setCurrentIndex(0); setIsFlipped(false); setAiMnemonicOpen(false); }}
        >
          {t('flashcards.allCards')} ({totalAllCardsCount})
        </button>
        {Object.keys(decks).map(deckKey => {
          const displayName = getDeckDisplayName(deckKey);
          
          return (
            <div key={deckKey} className="fc-deck-tab-wrapper">
              <button
                className={`fc-deck-tab ${selectedDeck === deckKey ? 'active' : ''}`}
                onClick={() => { setSelectedDeck(deckKey); setCurrentIndex(0); setIsFlipped(false); setAiMnemonicOpen(false); }}
                dir={isArabic(displayName) ? 'rtl' : 'ltr'}
                style={{ 
                  textAlign: isArabic(displayName) ? 'right' : 'left',
                  fontFamily: isArabic(displayName) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
                }}
              >
                {displayName} ({(decks[deckKey] || []).length})
              </button>
              <button
                className="fc-deck-delete-btn"
                onClick={(e) => handleDeleteDeck(e, deckKey)}
                title={`Delete ${displayName} deck`}
              >
                <FaTimes />
              </button>
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <form className="fc-add-card-form fade-in" onSubmit={handleSaveCard}>
          <div className="form-header-row">
            <h4>{editingCardId ? t('flashcards.editFlashcard') : t('flashcards.createCustomFlashcard')}</h4>
            <button type="button" className="fc-close-form" onClick={closeForm}>
              <FaTimes />
            </button>
          </div>

          <div className="fc-form-row">
            <label>{t('flashcards.targetDeck')}:</label>
            <input
              type="text"
              list="existing-decks"
              placeholder={t('flashcards.selectDeckPlaceholder')}
              value={newDeckKey}
              onChange={e => setNewDeckKey(e.target.value)}
              className="fc-input"
              dir={isArabic(newDeckKey) ? 'rtl' : 'ltr'}
              style={{ 
                textAlign: isArabic(newDeckKey) ? 'right' : 'left',
                fontFamily: isArabic(newDeckKey) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
              }}
              required
            />
            <datalist id="existing-decks">
              {Object.keys(decks).map(deckKey => {
                const displayName = getDeckDisplayName(deckKey);
                return <option key={deckKey} value={deckKey}>{displayName}</option>;
              })}
            </datalist>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaInfoCircle /> {t('flashcards.deckHint')}
            </small>
          </div>

          <div className="fc-form-row">
            <label>{t('flashcards.frontLabel')}</label>
            <textarea
              placeholder={t('flashcards.frontPlaceholder')}
              value={newFront}
              onChange={e => setNewFront(e.target.value)}
              className="fc-textarea"
              dir={isArabic(newFront) ? 'rtl' : 'ltr'}
              style={{ 
                textAlign: isArabic(newFront) ? 'right' : 'left',
                fontFamily: isArabic(newFront) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
              }}
              required
            />
          </div>

          <div className="fc-form-row">
            <label>{t('flashcards.backLabel')}</label>
            <textarea
              placeholder={t('flashcards.backPlaceholder')}
              value={newBack}
              onChange={e => setNewBack(e.target.value)}
              className="fc-textarea"
              dir={isArabic(newBack) ? 'rtl' : 'ltr'}
              style={{ 
                textAlign: isArabic(newBack) ? 'right' : 'left',
                fontFamily: isArabic(newBack) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
              }}
              required
            />
          </div>

          <div className="fc-form-row">
            <label>{t('flashcards.categoryTag')}</label>
            <input
              type="text"
              placeholder={t('flashcards.tagPlaceholder')}
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              className="fc-input"
              dir={isArabic(newTag) ? 'rtl' : 'ltr'}
              style={{ 
                textAlign: isArabic(newTag) ? 'right' : 'left',
                fontFamily: isArabic(newTag) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
              }}
            />
          </div>

          <div className="fc-form-actions">
            <button type="submit" className="fc-save-btn">
              <FaCheck /> {editingCardId ? t('flashcards.saveChanges') : t('flashcards.saveFlashcard')}
            </button>
          </div>
        </form>
      )}

      {currentCard ? (
        <div className="flashcard-viewport">
          <div className="fc-card-header-bar">
            <div className="fc-card-counter">
              <span className="fc-counter-label">{t('flashcards.cardCounter', { current: currentIndex + 1, total: activeCards.length })}</span>
              <div className="fc-tag-list">
                {currentCard.tags?.map((tagItem, idx) => (
                  <span key={idx} className="fc-tag-pill">
                    <FaTag style={{ fontSize: '0.65rem' }} /> {translateTag(tagItem)}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="fc-action-buttons">
              <button
                onClick={handleGenerateMnemonic}
                disabled={aiMnemonicLoading}
                className="fc-ai-mnemonic-btn"
                title="Generate AI Mnemonic and Concept Breakdown"
              >
                {aiMnemonicLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaLightbulb style={{ color: '#fbbf24' }} />}
                {aiMnemonicLoading ? t('flashcards.thinking') : t('flashcards.aiMnemonic')}
              </button>

              <button onClick={openEditForm} className="fc-icon-action-btn edit" title={t('flashcards.editCard')}>
                <FaEdit size={16} />
              </button>
              <button onClick={handleDeleteCard} className="fc-icon-action-btn delete" title={t('flashcards.deleteCard')}>
                <FaTrash size={16} />
              </button>
            </div>
          </div>

          <div
            className={`fc-flipper-box ${isFlipped ? 'flipped' : ''}`}
            onClick={() => !isFormOpen && setIsFlipped(!isFlipped)}
            title={t('flashcards.flipCard')}
          >
            <div className="fc-card fc-card-front">
              <div className="fc-card-label">{t('flashcards.question')}</div>
              <div 
                className="fc-card-content"
                dir={isArabic(currentCard.front) ? 'rtl' : 'ltr'}
                style={{ 
                  textAlign: isArabic(currentCard.front) ? 'right' : 'left',
                  fontFamily: isArabic(currentCard.front) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
                }}
              >
                {currentCard.front}
              </div>
              <div className="fc-flip-hint">
                <FaSyncAlt style={{ marginInlineEnd: '6px' }} /> {t('flashcards.clickToReveal')}
              </div>
            </div>

            <div className="fc-card fc-card-back">
              <div className="fc-card-label answer-label">{t('flashcards.explanation')}</div>
              <div 
                className="fc-card-content answer-content"
                dir={isArabic(currentCard.back) ? 'rtl' : 'ltr'}
                style={{ 
                  textAlign: isArabic(currentCard.back) ? 'right' : 'left',
                  fontFamily: isArabic(currentCard.back) ? '"Segoe UI", "Tahoma", "Arial", sans-serif' : 'inherit'
                }}
              >
                {currentCard.back.split('\n').map((line, idx) => (
                  <p key={idx} style={{ margin: '4px 0' }}>{line}</p>
                ))}
              </div>
              <div className="fc-flip-hint">
                <FaUndo style={{ marginInlineEnd: '6px' }} /> {t('flashcards.clickToFlipBack')}
              </div>
            </div>
          </div>

          {/* ── AI MNEMONIC DRAWER ────────────────────────────────────────── */}
          {aiMnemonicOpen && (
            <div className="fc-ai-drawer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem' }} className="fc-ai-title">
                  <FaRobot style={{ color: '#a855f7' }} /> {t('flashcards.aiMemoryLock')}
                </div>
                <button
                  onClick={() => setAiMnemonicOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <FaTimes />
                </button>
              </div>

              {aiMnemonicLoading && (
                <div className="fc-ai-loading" style={{ fontFamily: 'monospace', fontSize: '0.82rem', padding: '12px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FaBolt style={{ color: '#38bdf8' }} /> {t('flashcards.craftingMnemonic')}
                </div>
              )}

              {!aiMnemonicLoading && aiMnemonicData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div className="fc-ai-hook-box" style={{ borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <FaBrain style={{ color: '#a855f7', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong>{t('flashcards.mnemonicHook')}:</strong> {aiMnemonicData.mnemonic}
                    </div>
                  </div>
                  {aiMnemonicData.analogy && (
                    <div className="fc-ai-analogy-text" style={{ lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <FaLightbulb style={{ color: '#38bdf8', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>{t('flashcards.realWorldAnalogy')}:</strong> {aiMnemonicData.analogy}
                      </div>
                    </div>
                  )}
                  {aiMnemonicData.breakdown && (
                    <div className="fc-ai-takeaway-text" style={{ lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <FaTag style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>{t('flashcards.coreTakeaway')}:</strong> {aiMnemonicData.breakdown}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="fc-rating-controls">
            <span className="rating-hint">{t('flashcards.rateDifficulty')}</span>
            <div className="fc-btn-group">
              <button
                className="fc-rate-btn rate-hard"
                onClick={() => handleRate(1, 'Hard')}
                title="Review again in 1 day"
              >
                {t('flashcards.hard')}
              </button>
              <button
                className="fc-rate-btn rate-good"
                onClick={() => handleRate(3, 'Good')}
                title="Review in 3 days"
              >
                {t('flashcards.good')}
              </button>
              <button
                className="fc-rate-btn rate-easy"
                onClick={() => handleRate(7, 'Easy')}
                title="Review in 7 days"
              >
                {t('flashcards.easy')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-fc-state" style={{ textAlign: 'center', padding: '36px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed var(--border-color)', margin: '16px 0' }}>
          <FaGraduationCap style={{ fontSize: '2.5rem', color: '#64748b', marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '14px' }}>{t('flashcards.noCardsYet')}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="fc-add-btn" onClick={openAddForm}>
              <FaPlus /> {t('flashcards.addCard')}
            </button>
            {selectedDeck !== 'all' && (
              <button className="fc-deck-tab" onClick={() => setSelectedDeck('all')}>
                {t('flashcards.viewAllCards', { count: totalAllCardsCount })}
              </button>
            )}
          </div>
        </div>
      )}

      {toast && <div className="familiar-toast fade-in">{toast}</div>}

      {/* Auto Flashcard Harvester Modal */}
      <FlashcardHarvester
        isOpen={isHarvesterOpen}
        onClose={() => setIsHarvesterOpen(false)}
        onCardsAdded={(newCards) => {
          if (!newCards || newCards.length === 0) return;
          setDecks(prev => {
            const updated = { ...prev };
            newCards.forEach(c => {
              const deckKey = c.deck || 'data-science';
              if (!updated[deckKey]) updated[deckKey] = [];
              updated[deckKey] = [
                ...updated[deckKey],
                { id: c.id, front: c.question, back: c.answer, tags: ['harvested'] }
              ];
            });
            return updated;
          });
          showToast(`Harvested ${newCards.length} new flashcard(s)!`);
        }}
      />
    </div>
  );
}