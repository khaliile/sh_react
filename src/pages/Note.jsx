import React, { useEffect, useMemo, useState } from 'react';
import {
  FaBook,
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaThumbtack,
  FaArrowLeft,
  FaSave,
  FaRobot,
  FaLightbulb,
  FaListUl,
  FaLayerGroup,
  FaQuestionCircle,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaCopy,
  FaCheck,
  FaCoins,
  FaStar,
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useRpgStorage } from '../hooks/useRpgStorage';
import './Note.css';

const STORAGE_KEY = 'study_hub_notes';
const categories = ['All', 'Math', 'Data science', 'Python', 'English', 'Ideas'];

const getBadgeClass = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('math')) return 'badge-math';
  if (cat.includes('data')) return 'badge-datascience';
  if (cat.includes('python')) return 'badge-python';
  if (cat.includes('english')) return 'badge-english';
  if (cat.includes('idea')) return 'badge-ideas';
  return 'badge-default';
};

const CATEGORY_LOCALIZATIONS = {
  All: { en: 'All', ar: 'الكل' },
  Math: { en: 'Math', ar: 'الرياضيات' },
  'Data science': { en: 'Data science', ar: 'علم البيانات' },
  Python: { en: 'Python', ar: 'بايثون' },
  English: { en: 'English', ar: 'الإنجليزية' },
  Ideas: { en: 'Ideas', ar: 'أفكار' },
  Study: { en: 'Study', ar: 'دراسة' }
};

const getCategoryLabel = (cat, isAr) => {
  return CATEGORY_LOCALIZATIONS[cat]?.[isAr ? 'ar' : 'en'] || cat;
};

// ── Vercel AI Gateway constants ─────────────────────────────────────────────
const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
const VERCEL_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const VERCEL_BACKEND_PROXY = 'http://localhost:8000/api/ai-gateway';
const VERCEL_MODEL = 'google/gemini-2.5-flash';

async function callVercelAI(systemPrompt, userPrompt, maxTokens = 1500) {
  const universalPrompt = `${systemPrompt}\n\nCRITICAL INSTRUCTION FOR ALL CHARACTERS: DO NOT output any internal thinking processes, plans, or <think> tags. Output ONLY the final spoken words of your assigned character. Keep it entirely in-character. No roleplay asterisks.`;
  const payload = {
    model: VERCEL_MODEL,
    messages: [
      { role: 'system', content: universalPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  };

  // 1. Direct Gateway
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
      const content = data?.choices?.[0]?.message?.content?.trim() || '';
      if (content) return content.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();
    }
  } catch (err) {
    console.warn('[Note AI] Direct Vercel failed, trying local proxy:', err.message);
  }

  // 2. Local Python Gateway Proxy
  try {
    const res = await fetch(VERCEL_BACKEND_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content?.trim() || '';
      if (content) return content.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();
    }
  } catch (proxyErr) {
    console.warn('[Note AI] Local proxy failed:', proxyErr.message);
  }

  throw new Error('AI service is temporarily unavailable. Please try again.');
}


export default function Note() {
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const { addXpAndCoins } = useRpgStorage();
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNote, setActiveNote] = useState(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Study'
  });

  // Ensure active theme remains synchronized
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
  }, []);

  // ── AI Co-Pilot State ───────────────────────────────────────────────────────
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState(null); // 'explain' | 'summary' | 'flashcards' | 'quiz' | null
  const [aiResult, setAiResult] = useState('');
  const [aiFlashcards, setAiFlashcards] = useState([]);
  const [aiQuiz, setAiQuiz] = useState([]);
  const [quizRevealed, setQuizRevealed] = useState({});
  const [aiToast, setAiToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setAiToast({ msg, type });
    setTimeout(() => setAiToast(null), 3000);
  };

  // ── AI Action Handlers (Powered by Vercel 1M-Context MiniMax M3) ────────────
  const handleFeynmanExplain = async () => {
    if (!form.content.trim()) {
      triggerToast('Please write some note content first!', 'warning');
      return;
    }
    setAiLoading(true);
    setAiMode('explain');
    setAiResult('');
    try {
      const isArabic = /[\u0600-\u06FF]/.test(form.content);
      const systemPrompt = isArabic
        ? "أنت معلم عبقري يستخدم أسلوب فاينمان التعليمي (Feynman Technique). اشرح المفاهيم الموجودة في ملاحظات الطالب بأسلوب مبسط جداً، واستخدم تشبيهات وأمثلة من الحياة اليومية لشرح الفكرة بدقة ووضوح. اجعل الشرح جذاباً ومنظماً."
        : "You are a master teacher using the Feynman Technique. Explain the core ideas in the student's study note as simply and intuitively as possible, using crystal-clear everyday analogies. Make it memorable and structured.";

      const text = await callVercelAI(systemPrompt, `Here is my study note titled "${form.title}":\n\n${form.content}`);
      setAiResult(text);
      addXpAndCoins(25, 5, 'AI Feynman Concept Breakdown');
    } catch (err) {
      triggerToast(`AI request failed: ${err.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!form.content.trim()) {
      triggerToast('Please write some note content first!', 'warning');
      return;
    }
    setAiLoading(true);
    setAiMode('summary');
    setAiResult('');
    try {
      const isArabic = /[\u0600-\u06FF]/.test(form.content);
      const systemPrompt = isArabic
        ? "أنت خبير تلخيص أكاديمي. استخرج أهم النقاط الرئيسية والمفاهيم الجوهرية والمعادلات/التعريفات من ملاحظات الطالب على شكل قائمة نقطية مركزة وقابلة للمراجعة السريعة."
        : "You are an elite academic summarizer. Extract the most critical key takeaways, core definitions, and actionable takeaways from the student's note into structured bullet points for high-yield exam revision.";

      const text = await callVercelAI(systemPrompt, `Please summarize this study note titled "${form.title}":\n\n${form.content}`);
      setAiResult(text);
      addXpAndCoins(20, 5, 'AI Note Summary Generated');
    } catch (err) {
      triggerToast(`AI request failed: ${err.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!form.content.trim()) {
      triggerToast('Please write some note content first!', 'warning');
      return;
    }
    setAiLoading(true);
    setAiMode('flashcards');
    setAiFlashcards([]);
    try {
      const systemPrompt = `You are an educational flashcard generator. Extract 4 to 8 high-yield flashcards from the student's note.
You MUST return ONLY a JSON array with this exact structure:
[
  { "question": "Clear question testing one concept", "answer": "Concise direct answer", "difficulty": "easy" | "medium" | "hard" }
]
No markdown, no code fences. Output pure JSON array only.`;

      const raw = await callVercelAI(systemPrompt, `Generate flashcards from note "${form.title}":\n\n${form.content}`);
      let clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiFlashcards(parsed);
      } else {
        throw new Error('No flashcard array returned');
      }
    } catch (err) {
      triggerToast(`Flashcard generation failed: ${err.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveFlashcardsToDeck = () => {
    if (aiFlashcards.length === 0) return;
    try {
      const customKey = 'app_custom_flashcards';
      const existing = JSON.parse(localStorage.getItem(customKey) || '[]');
      const newItems = aiFlashcards.map((c, idx) => ({
        id: `note_card_${Date.now()}_${idx}`,
        question: c.question,
        answer: c.answer,
        deck: form.category.toLowerCase().includes('data') ? 'data-science' : form.category.toLowerCase().includes('math') ? 'mathematics' : form.category.toLowerCase().includes('english') ? 'english' : 'general',
        createdAt: Date.now()
      }));

      localStorage.setItem(customKey, JSON.stringify([...existing, ...newItems]));
      window.dispatchEvent(new CustomEvent('flashcards-updated', { detail: { count: newItems.length } }));
      
      const xpReward = newItems.length * 20;
      addXpAndCoins(xpReward, newItems.length * 5, `Saved ${newItems.length} Note Flashcards`);
      triggerToast(`Added ${newItems.length} flashcards to Arena Deck (+${xpReward} XP)!`, 'success');
      setAiMode(null);
    } catch (e) {
      triggerToast('Failed to save flashcards to storage.', 'error');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!form.content.trim()) {
      triggerToast('Please write some note content first!', 'warning');
      return;
    }
    setAiLoading(true);
    setAiMode('quiz');
    setAiQuiz([]);
    setQuizRevealed({});
    try {
      const systemPrompt = `You are a test preparation specialist. Generate 3 high-yield active-recall quiz questions based on the note.
You MUST return ONLY a JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text",
    "hint": "Brief memory hint or clue",
    "answer": "Detailed correct explanation and answer"
  }
]
No markdown code fences, just raw JSON array.`;

      const raw = await callVercelAI(systemPrompt, `Create a 3-question active recall test from note "${form.title}":\n\n${form.content}`);
      let clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiQuiz(parsed);
        addXpAndCoins(30, 8, 'Generated Note Active Recall Quiz');
      } else {
        throw new Error('No quiz array returned');
      }
    } catch (err) {
      triggerToast(`Quiz generation failed: ${err.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAppendToNote = () => {
    if (!aiResult) return;
    setForm(prev => ({
      ...prev,
      content: prev.content + '\n\n---\n### AI Study Notes:\n' + aiResult
    }));
    triggerToast('Appended AI insights to note!', 'success');
    setAiMode(null);
  };

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim();

    return [...notes]
      .filter((note) => {
        const matchesSearch =
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query);

        const matchesCategory =
          activeCategory === 'All' || 
          note.category.toLowerCase() === activeCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        return (
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
        );
      });
  }, [notes, search, activeCategory]);

  const createNote = () => {
    setForm({
      title: '',
      content: '',
      category: 'Study'
    });
    setAiMode(null);
    setActiveNote('new');
  };

  const editNote = (note) => {
    setForm({
      title: note.title,
      content: note.content,
      category: note.category || 'Study'
    });
    setAiMode(null);
    setActiveNote(note);
  };

  const closeEditor = () => {
    setActiveNote(null);
    setAiMode(null);
    setForm({
      title: '',
      content: '',
      category: 'Study'
    });
  };

  const saveNote = () => {
    if (!form.title.trim() && !form.content.trim()) {
      closeEditor();
      return;
    }

    const title = form.title.trim() || t('notes.untitled');
    const now = new Date().toISOString();

    if (activeNote === 'new') {
      const newNote = {
        id: Date.now().toString(),
        title,
        content: form.content,
        category: form.category,
        pinned: false,
        createdAt: now,
        updatedAt: now
      };

      setNotes((prev) => [newNote, ...prev]);
    } else {
      setNotes((prev) =>
        prev.map((item) =>
          item.id === activeNote.id
            ? {
                ...item,
                title,
                content: form.content,
                category: form.category,
                updatedAt: now
              }
            : item
        )
      );
    }

    closeEditor();
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
    if (activeNote && activeNote.id === id) {
      closeEditor();
    }
  };

  const togglePin = (id) => {
    setNotes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to save note
  useEffect(() => {
    if (activeNote === null) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
        triggerToast(isAr ? 'تم حفظ الملاحظة بنجاح!' : 'Note saved successfully!', 'success');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote, form]);

  if (activeNote !== null) {
    const isNew = activeNote === 'new';

    return (
      <div className="note-page-container">
        {/* Toast notification */}
        {aiToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: aiToast.type === 'error' ? '#ef4444' : aiToast.type === 'warning' ? '#f59e0b' : '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {aiToast.msg}
          </div>
        )}

        <div className="editor-topbar">
          <div className="editor-topbar-left">
            <button className="btn-icon" onClick={closeEditor} title={t('common.back')}>
              <FaArrowLeft />
            </button>
            <div className="header-title-group">
              <div className="header-icon-wrapper" style={{ width: '42px', height: '42px', borderRadius: '11px' }}>
                <FaBook style={{ fontSize: '18px' }} />
              </div>
              <div>
                <h1 className="header-title">
                  {isNew ? (t('notes.newNote') || (isAr ? 'ملاحظة جديدة' : 'New Note')) : (t('common.edit') || (isAr ? 'تعديل الملاحظة' : 'Edit Note'))}
                </h1>
                {!isNew && activeNote.updatedAt && (
                  <span className="updated-label">
                    {t('notes.lastEdited', { date: formatDate(activeNote.updatedAt) })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="editor-topbar-actions">
            {!isNew && (
              <button
                className="btn-icon btn-danger"
                onClick={() => deleteNote(activeNote.id)}
                title={t('notes.deleteNote')}
              >
                <FaTrash />
              </button>
            )}
            <button className="btn-primary" onClick={saveNote} title="Ctrl + S">
              <FaSave /> {t('notes.saveNote') || (isAr ? 'حفظ الملاحظة' : 'Save Note')}
            </button>
          </div>
        </div>

        {/* ── AI STUDY CO-PILOT TOOLBAR ────────────────────────────────────── */}
        <div className="note-ai-toolbar">
          <div className="note-ai-title">
            <span className="ai-pulse-dot"></span>
            <FaRobot style={{ color: '#a855f7', fontSize: '1.1rem' }} />
            <span>{isAr ? 'المساعد الذكي (سياق 1M):' : 'AI Co-Pilot (1M Context):'}</span>
          </div>

          <button
            onClick={handleFeynmanExplain}
            disabled={aiLoading}
            className="note-ai-btn note-ai-btn-feynman"
            title={isAr ? 'شرح المفاهيم المعقدة بأسلوب فاينمان' : 'Explain complex concepts using the Feynman Technique'}
          >
            <FaLightbulb style={{ color: '#f59e0b' }} /> {isAr ? 'شرح فاينمان' : 'Feynman Explain'}
          </button>

          <button
            onClick={handleSummarize}
            disabled={aiLoading}
            className="note-ai-btn note-ai-btn-summary"
            title={isAr ? 'استخراج أهم النقاط والمفاهيم الجوهرية' : 'Summarize key takeaways into high-yield bullets'}
          >
            <FaListUl style={{ color: '#0284c7' }} /> {isAr ? 'النقاط الرئيسية' : 'Key Takeaways'}
          </button>

          <button
            onClick={handleGenerateFlashcards}
            disabled={aiLoading}
            className="note-ai-btn note-ai-btn-flashcards"
            title={isAr ? 'استخراج بطاقات مراجعة وإضافتها للساحة' : 'Extract flashcards and add them straight to your Arena deck'}
          >
            <FaLayerGroup style={{ color: '#10b981' }} /> {isAr ? 'استخراج البطاقات' : 'Extract Flashcards'}
          </button>

          <button
            onClick={handleGenerateQuiz}
            disabled={aiLoading}
            className="note-ai-btn note-ai-btn-quiz"
            title={isAr ? 'إنشاء اختبار استرجاع نشط من 3 أسئلة' : 'Generate a 3-question active recall test'}
          >
            <FaQuestionCircle style={{ color: '#d97706' }} /> {isAr ? 'اختبار سريع' : 'Rapid Quiz'}
          </button>
        </div>

        {/* ── AI STUDY CO-PILOT RESULT PANEL ───────────────────────────────── */}
        {aiLoading && (
          <div className="note-ai-loading-box">
            <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '1.2rem', color: '#a855f7' }} />
            <span>{isAr ? 'جارٍ تحليل الملاحظة بواسطة الذكاء الاصطناعي بسياق 1M...' : 'MiniMax M3 is analyzing your note with 1M context window...'}</span>
          </div>
        )}

        {!aiLoading && aiMode && (
          <div className="note-ai-result-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--note-border)', paddingBottom: '10px' }}>
              <div className="ai-panel-header">
                <FaRobot style={{ color: '#a855f7' }} />
                {aiMode === 'explain' && (isAr ? 'تفكيك المفاهيم بأسلوب فاينمان' : 'Feynman Concept Breakdown')}
                {aiMode === 'summary' && (isAr ? 'النقاط والمفاهيم الرئيسية' : 'High-Yield Key Takeaways')}
                {aiMode === 'flashcards' && (isAr ? `البطاقات المستخرجة (${aiFlashcards.length})` : `Extracted Flashcards (${aiFlashcards.length})`)}
                {aiMode === 'quiz' && (isAr ? 'اختبار الاسترجاع النشط (3 أسئلة)' : '3-Question Active Recall Quiz')}
              </div>
              <button
                onClick={() => setAiMode(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--note-text-muted)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Text results (Explain / Summary) */}
            {(aiMode === 'explain' || aiMode === 'summary') && aiResult && (
              <div>
                <div className="ai-panel-text">
                  {aiResult}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleAppendToNote}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '9px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: '0 4px 14px rgba(168, 85, 247, 0.25)'
                    }}
                  >
                    <FaPlus /> {isAr ? 'إدراج في الملاحظة' : 'Append to Note'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult);
                      triggerToast(isAr ? 'تم نسخ النص إلى الحافظة!' : 'Copied to clipboard!');
                    }}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '9px',
                      border: '1.5px solid var(--note-border)',
                      background: 'var(--note-bg-card)',
                      color: 'var(--note-text-title)',
                      fontWeight: 650,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}
                  >
                    <FaCopy /> {isAr ? 'نسخ النص' : 'Copy Text'}
                  </button>
                </div>
              </div>
            )}

            {/* Flashcards preview */}
            {aiMode === 'flashcards' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' }}>
                  {aiFlashcards.map((c, i) => (
                    <div key={i} className="ai-card-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="ai-card-item-title">Q: {c.question}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 9px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', fontWeight: 700 }}>
                          {c.difficulty || 'medium'}
                        </span>
                      </div>
                      <div className="ai-card-item-desc">A: {c.answer}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveFlashcardsToDeck}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '11px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <FaCheck /> {isAr ? `إضافة جميع الـ ${aiFlashcards.length} بطاقات إلى ساحة المراجعة (+${aiFlashcards.length * 20} XP)` : `Add All ${aiFlashcards.length} Cards to Arena Deck (+${aiFlashcards.length * 20} XP)`}
                </button>
              </div>
            )}

            {/* Quiz preview */}
            {aiMode === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {aiQuiz.map((q) => (
                  <div key={q.id} className="ai-card-item">
                    <div className="ai-card-item-title" style={{ color: 'var(--note-text-title)', fontWeight: 750, fontSize: '0.9rem', marginBottom: '8px' }}>
                      #{q.id}. {q.question}
                    </div>
                    {q.hint && (
                      <div style={{ color: 'var(--note-text-muted)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaLightbulb style={{ color: '#f59e0b' }} /> {isAr ? 'تلميح:' : 'Hint:'} {q.hint}
                      </div>
                    )}
                    {quizRevealed[q.id] ? (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '9px',
                        padding: '11px 14px',
                        color: '#10b981',
                        fontSize: '0.85rem',
                        lineHeight: '1.55'
                      }}>
                        <strong>{isAr ? 'الإجابة:' : 'Answer:'}</strong> {q.answer}
                      </div>
                    ) : (
                      <button
                        onClick={() => setQuizRevealed(prev => ({ ...prev, [q.id]: true }))}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid rgba(56, 189, 248, 0.4)',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#0284c7',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isAr ? 'إظهار الإجابة' : 'Reveal Answer'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="editor-body">
          <div className="category-select-wrapper">
            <div className="subject-pill-group">
              {categories
                .filter((item) => item !== 'All')
                .map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`subject-pill subject-pill-${item.toLowerCase().replace(/\s+/g, '-')} ${form.category === item ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, category: item })}
                  >
                    {getCategoryLabel(item, isAr)}
                  </button>
                ))}
            </div>
          </div>

          <input
            className="editor-title-input"
            type="text"
            placeholder={t('notes.untitled') || (isAr ? 'عنوان الملاحظة...' : 'Untitled Note')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
          />

          <textarea
            className="editor-textarea"
            placeholder={isAr ? "اكتب ملاحظاتك الدراسية أو الصق محتوى المحاضرة هنا..." : "Write your study notes or paste lecture material here..."}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            dir={isAr ? "rtl" : "ltr"}
          />

          <div className="char-count">
            <span>
              {isAr ? 'اختصار: اضغط Ctrl + S للحفظ الفوري' : 'Shortcut: Press Ctrl + S to save instantly'}
            </span>
            <span>
              {form.content.trim() ? form.content.trim().split(/\s+/).length : 0} {isAr ? 'كلمة' : 'words'} • {form.content.length} {isAr ? 'حرف' : 'characters'}
            </span>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="note-page-container">
      <div className="list-header">
        <div className="header-title-group">
          <div className="header-icon-wrapper">
            <FaBook />
          </div>
          <div>
            <h1 className="header-title">
              {t('notes.title') || (isAr ? 'ملاحظات الباحث' : 'Scholar Notes')}
              <span className="header-count-badge">
                {filteredNotes.length} {isAr ? 'ملاحظة' : 'notes'}
              </span>
            </h1>
          </div>
        </div>

        <button className="btn-primary" onClick={createNote}>
          <FaPlus /> {t('notes.newNote') || (isAr ? 'ملاحظة جديدة' : 'New Note')}
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder={t('notes.searchNotes') || (isAr ? 'البحث في الملاحظات...' : 'Search notes...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {categories.map((category) => (
            <button
              key={category}
              className={`pill-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {getCategoryLabel(category, isAr)}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-circle">
            <FaBook />
          </div>
          <h2 className="empty-title">
            {search
              ? (isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No matching notes found')
              : (t('notes.noNotesYet') || (isAr ? 'لم يتم إنشاء أي ملاحظات بعد!' : 'No notes created yet. Click "New Note" to begin!'))}
          </h2>
          <p className="empty-subtitle">
            {search
              ? (isAr ? 'جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.' : 'Try adjusting your search query or choosing another category filter.')
              : (isAr ? 'ابدأ بتدوين ملاحظات دراستك، معادلاتك وأفكارك بسهولة مع مساعد الذكاء الاصطناعي.' : 'Capture your knowledge, lecture summaries, and formulas with AI study assistance and flashcards.')}
          </p>
          {!search && (
            <button className="btn-primary" onClick={createNote}>
              <FaPlus /> {t('notes.newNote') || (isAr ? 'ملاحظة جديدة' : 'New Note')}
            </button>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-card ${note.pinned ? 'pinned' : ''}`}
              onClick={() => editNote(note)}
            >
              <div className="note-card-top">
                <span className={`category-badge ${getBadgeClass(note.category)}`}>
                  {note.category}
                </span>
                <button
                  className={`btn-pin ${note.pinned ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note.id);
                  }}
                  title={note.pinned ? 'Unpin' : 'Pin'}
                >
                  <FaThumbtack />
                </button>
              </div>

              <h2 className="note-card-title">{note.title}</h2>
              <p className="note-card-content">{note.content}</p>

              <div className="note-card-footer">
                <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                <div className="card-actions">
                  <button
                    className="card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      editNote(note);
                    }}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="card-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}