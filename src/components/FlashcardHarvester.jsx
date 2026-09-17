import React, { useState } from 'react';
import { FaTimes, FaPlus, FaMagic, FaBookOpen, FaCheck, FaTrash, FaRobot, FaBolt, FaDatabase, FaCalculator, FaBook } from 'react-icons/fa';
import { useRpgStorage } from '../hooks/useRpgStorage';

/**
 * Heuristic parser to turn pasted study text / lecture notes into Q&A flashcards.
 * Parses:
 * 1. Term: Definition / Term - Definition
 * 2. Q: ... A: ...
 * 3. Markdown bold: **Term** - Definition or **Term**: Definition
 * 4. Numbered list with colons or dashes
 */
function parseNotesToCards(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const cards = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern 1: Q: ... / A: ... (single or multi line)
    const qaMatch = line.match(/^(?:Q|Question):\s*(.+)$/i);
    if (qaMatch) {
      const q = qaMatch[1].trim();
      let a = '';
      if (i + 1 < lines.length && lines[i + 1].match(/^(?:A|Answer):\s*(.+)$/i)) {
        a = lines[i + 1].replace(/^(?:A|Answer):\s*/i, '').trim();
        i++;
      }
      if (q && a) {
        cards.push({ question: q, answer: a, category: 'General' });
        continue;
      }
    }

    // Pattern 2: Markdown **Term** : Definition or **Term** - Definition
    const boldMatch = line.match(/^\*?\*?([^*:\-\n]{2,60})\*?\*?\s*[:–—-]\s*(.+)$/);
    if (boldMatch) {
      const q = boldMatch[1].replace(/\*\*/g, '').trim();
      const a = boldMatch[2].trim();
      if (q.length > 2 && a.length > 2) {
        cards.push({ question: q, answer: a, category: 'General' });
        continue;
      }
    }

    // Pattern 3: Numbered item e.g. "1. Photosynthesis: process of..."
    const numMatch = line.match(/^\d+[\.\)]\s*([A-Za-z0-9\s_\-]{2,50})\s*[:=–—-]\s*(.+)$/);
    if (numMatch) {
      const q = numMatch[1].trim();
      const a = numMatch[2].trim();
      if (q.length > 2 && a.length > 2) {
        cards.push({ question: q, answer: a, category: 'General' });
        continue;
      }
    }

    // Pattern 4: Simple Term = Definition or Term => Definition
    const defMatch = line.match(/^([A-Za-z0-9\s_\-]{2,50})\s*(?:=>|->|=|is defined as|means)\s*(.+)$/i);
    if (defMatch) {
      const q = defMatch[1].trim();
      const a = defMatch[2].trim();
      if (q.length > 2 && a.length > 2) {
        cards.push({ question: q, answer: a, category: 'General' });
        continue;
      }
    }
  }

  // Fallback: If no structured pairs found, try splitting paragraphs with question marks
  if (cards.length === 0 && text.includes('?')) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    for (let i = 0; i < sentences.length - 1; i++) {
      if (sentences[i].endsWith('?')) {
        cards.push({
          question: sentences[i],
          answer: sentences[i + 1],
          category: 'General'
        });
        i++;
      }
    }
  }

  return cards;
}

export default function FlashcardHarvester({ isOpen, onClose, onCardsAdded }) {
  const [rawText, setRawText] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('data-science');
  const [parsedCards, setParsedCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const { addXpAndCoins } = useRpgStorage();

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const extracted = parseNotesToCards(rawText);
      setParsedCards(extracted.map((c, idx) => ({ ...c, id: `harvest_${Date.now()}_${idx}`, difficulty: 'medium' })));
      setIsProcessing(false);
      if (extracted.length === 0) {
        setNotification({ type: 'warning', message: 'No clear Term: Definition or Q&A pairs found. Try using "Term: Definition" or "Q: ... A: ..." syntax, or use AI Harvest for unstructured text!' });
      } else {
        setNotification({ type: 'success', message: `Successfully harvested ${extracted.length} flashcard(s)!` });
      }
    }, 300);
  };

  // ── AI Harvest: calls /api/harvest-flashcards backed by Vercel Gateway (minimax-m3-free) ─
  const handleAIHarvest = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setNotification({ type: 'info', message: 'AI is analyzing your text with 1M-context MiniMax M3... This may take 10-30s for large texts.' });
    try {
      const res = await fetch('http://localhost:8000/api/harvest-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, subject_tag: selectedDeck }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Server error ${res.status}`);
      }
      const aiCards = (data.cards || []).map((c, idx) => ({
        ...c,
        id: `ai_${Date.now()}_${idx}`,
        difficulty: c.difficulty || 'medium',
      }));
      if (aiCards.length === 0) {
        setNotification({ type: 'warning', message: 'AI found no flashcards in the text. Try a more detailed study excerpt.' });
      } else {
        setParsedCards(aiCards);
        setNotification({ type: 'success', message: `AI harvested ${aiCards.length} structured flashcards via MiniMax M3!` });
      }
    } catch (err) {
      const isOffline = err.message.includes('fetch') || err.message.includes('Failed');
      setNotification({
        type: 'error',
        message: isOffline
          ? 'Could not reach the AI server (localhost:8000). Make sure server.py is running.'
          : `AI Harvest failed: ${err.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCard = (id, field, value) => {
    setParsedCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCard = (id) => {
    setParsedCards(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveAll = () => {
    if (parsedCards.length === 0) return;
    try {
      const customKey = 'app_custom_flashcards';
      const existing = JSON.parse(localStorage.getItem(customKey) || '[]');
      const newItems = parsedCards.map(c => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
        deck: selectedDeck,
        createdAt: Date.now()
      }));

      const merged = [...existing, ...newItems];
      localStorage.setItem(customKey, JSON.stringify(merged));

      // Trigger custom storage event for sync
      window.dispatchEvent(new CustomEvent('flashcards-updated', { detail: { count: newItems.length, deck: selectedDeck } }));

      // Reward XP for harvesting knowledge
      const xpEarned = newItems.length * 20;
      const coinsEarned = newItems.length * 5;
      addXpAndCoins(xpEarned, coinsEarned, `Harvested ${newItems.length} Flashcards`);

      if (onCardsAdded) onCardsAdded(newItems);

      setNotification({ type: 'success', message: `Added ${newItems.length} cards to ${selectedDeck}! (+${xpEarned} XP)` });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setNotification({ type: 'error', message: 'Failed to save flashcards to local storage.' });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(8px)', padding: '16px'
    }}>
      <div className="harvester-modal" onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card, #0f172a)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}>
              <FaMagic />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #f8fafc)' }}>
                Auto Flashcard Harvester
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
                Paste lecture notes or study snippets to auto-extract structured flashcards
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#94a3b8',
            fontSize: '1.2rem', cursor: 'pointer', padding: '4px'
          }}>
            <FaTimes />
          </button>
        </div>

        {notification && (
          <div style={{
            padding: '10px 16px', borderRadius: '10px', marginBottom: '16px',
            fontSize: '0.85rem', fontWeight: 600,
            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : notification.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${notification.type === 'success' ? '#10b981' : notification.type === 'warning' ? '#f59e0b' : '#ef4444'}`,
            color: notification.type === 'success' ? '#34d399' : notification.type === 'warning' ? '#fbbf24' : '#f87171'
          }}>
            {notification.message}
          </div>
        )}

        {/* Deck Selection & Paste Area */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary, #cbd5e1)' }}>
              Target Deck:
            </label>
            <select
              value={selectedDeck}
              onChange={e => setSelectedDeck(e.target.value)}
              style={{
                background: 'var(--bg-main, #1e293b)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="data-science">Data Science &amp; AI</option>
              <option value="mathematics">Mathematics &amp; Logic</option>
              <option value="english">English &amp; Vocabulary</option>
              <option value="general">General Mastery</option>
            </select>
          </div>

          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Paste your study text here... Examples:&#10;&#10;Eigenvalue: A scalar associated with a linear system of equations&#10;Q: What is Overfitting? A: Model learns noise in the training data&#10;**Gradient Descent**: Optimization algorithm to minimize cost function&#10;1. Convolutional Layer: Feature extractor using sliding filters"
            rows={6}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              color: '#f8fafc',
              padding: '14px',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {/* AI Harvest — Primary (Vercel Gateway) */}
          <button
            id="ai-harvest-btn"
            onClick={handleAIHarvest}
            disabled={isProcessing || !rawText.trim()}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: isProcessing || !rawText.trim()
                ? 'rgba(139,92,246,0.3)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isProcessing || !rawText.trim() ? 'not-allowed' : 'pointer',
              opacity: isProcessing || !rawText.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(168,85,247,0.35)',
              transition: 'all 0.2s',
            }}
          >
            <FaRobot />
            {isProcessing ? 'AI Analyzing...' : 'AI Harvest (1M Context)'}
          </button>

          {/* Quick Parse — Secondary (heuristic) */}
          <button
            id="quick-parse-btn"
            onClick={handleParse}
            disabled={isProcessing || !rawText.trim()}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(56,189,248,0.4)',
              background: 'transparent',
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: isProcessing || !rawText.trim() ? 'not-allowed' : 'pointer',
              opacity: isProcessing || !rawText.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <FaBolt />
            Quick Parse
          </button>
        </div>

        {/* Parsed Cards Preview */}
        {parsedCards.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary, #cbd5e1)' }}>
                Review Harvested Cards ({parsedCards.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                +{parsedCards.length * 20} XP on Save
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
              {parsedCards.map((card, idx) => (
                <div key={card.id} style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, minWidth: '20px' }}>
                    #{idx + 1}
                  </span>
                  {/* Difficulty badge */}
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px',
                    minWidth: '46px',
                    textAlign: 'center',
                    background: card.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : card.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: card.difficulty === 'hard' ? '#f87171' : card.difficulty === 'easy' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${card.difficulty === 'hard' ? '#f87171' : card.difficulty === 'easy' ? '#34d399' : '#fbbf24'}44`,
                  }}>
                    {card.difficulty || 'med'}
                  </span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input
                      type="text"
                      value={card.question}
                      onChange={e => handleUpdateCard(card.id, 'question', e.target.value)}
                      placeholder="Front / Question"
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: '6px',
                        color: '#38bdf8',
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      value={card.answer}
                      onChange={e => handleUpdateCard(card.id, 'answer', e.target.value)}
                      placeholder="Back / Answer"
                      style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: '#cbd5e1',
                        padding: '4px 8px',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#f87171',
                      padding: '6px 8px',
                      cursor: 'pointer'
                    }}
                    title="Remove card"
                  >
                    <FaTrash style={{ fontSize: '0.75rem' }} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAll}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <FaCheck /> Add All {parsedCards.length} Cards to Arena Deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
