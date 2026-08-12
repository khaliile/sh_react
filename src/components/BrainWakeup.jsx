import { useState, useEffect, useCallback } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

// ─── Puzzle generators ────────────────────────────────────────────────────────
const WORDS = [
  'python','matrix','algebra','dataset','formula','theory','syntax','vector',
  'scalar','kernel','neuron','tensor','gradient','function','variable',
  'segment','routine','pattern','problem','insight'
];

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word ? scramble(word) : result;
}

function seededRandom(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generatePuzzle(seed) {
  const type = 0; // always math
  if (type === 0) {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(seededRandom(seed + 1) * 3)];
    let a, b, answer;
    if (op === '+') { a = Math.floor(seededRandom(seed+2)*90)+10; b = Math.floor(seededRandom(seed+3)*90)+10; answer = a+b; }
    else if (op === '-') { a = Math.floor(seededRandom(seed+2)*90)+50; b = Math.floor(seededRandom(seed+3)*40)+5; answer = a-b; }
    else { a = Math.floor(seededRandom(seed+2)*12)+2; b = Math.floor(seededRandom(seed+3)*12)+2; answer = a*b; }
    return { type: 'math', question: `${a} ${op} ${b} = ?`, answer: String(answer), hint: `Think ${op === '×' ? 'multiplication' : op === '+' ? 'addition' : 'subtraction'}` };
  } else if (type === 1) {
    const start = Math.floor(seededRandom(seed+1)*20)+1;
    const step = Math.floor(seededRandom(seed+2)*15)+2;
    const seq = [start, start+step, start+2*step, start+3*step];
    return { type: 'sequence', question: `${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ?`, answer: String(start+4*step), hint: `Difference is ${step}` };
  } else {
    const idx = Math.floor(seededRandom(seed+1)*WORDS.length);
    const word = WORDS[idx];
    const jumbled = scramble(word);
    return { type: 'word', question: `Unscramble: ${jumbled.toUpperCase()}`, answer: word, hint: `${word.length} letters, starts with ${word[0].toUpperCase()}` };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BrainWakeup() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const seed = todayKey.split('-').reduce((a, b) => a + parseInt(b), 0);
  const puzzle = generatePuzzle(seed);

  const [wakeupLog, setWakeupLog] = useAppStorage('app_wakeup_log', {});
  const todayEntry = wakeupLog[todayKey] || {};

  const [input, setInput] = useState('');
  const [status, setStatus] = useState(todayEntry.solved ? 'solved' : 'idle'); // idle | wrong | solved
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);

  const streak = (() => {
    let s = 0, d = new Date();
    while (true) {
      const k = d.toISOString().slice(0,10);
      if (wakeupLog[k]?.solved) { s++; d.setDate(d.getDate()-1); } else break;
    }
    return s;
  })();

  const check = useCallback(() => {
    const ans = input.trim().toLowerCase();
    const correct = puzzle.answer.toLowerCase();
    if (ans === correct) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setWakeupLog(prev => ({
        ...prev,
        [todayKey]: { solved: true, secs: elapsed, type: puzzle.type, ts: Date.now() }
      }));
      setStatus('solved');
    } else {
      setShake(true);
      setStatus('wrong');
      setTimeout(() => setShake(false), 500);
    }
  }, [input, puzzle, startTime, todayKey, setWakeupLog]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Enter') check(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [check]);

  const typeLabels = { math: 'Math', sequence: 'Sequence', word: 'Word' };
  const typeColors = { math: '#3b82f6', sequence: '#10b981', word: '#f59e0b' };

  return (
    <div className="arena-card wakeup-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Brain Wakeup</h3>
          <p className="arena-card-sub">Solve today's puzzle to unlock your brain</p>
        </div>
        <div className="wakeup-streak">
          <span className="wakeup-streak-fire"></span>
          <span className="wakeup-streak-num">{streak}</span>
          <span className="wakeup-streak-label">day streak</span>
        </div>
      </div>

      {status === 'solved' ? (
        <div className="wakeup-solved">
          <div className="wakeup-solved-icon">✓</div>
          <div className="wakeup-solved-title">Brain Unlocked!</div>
          <div className="wakeup-solved-sub">
            Solved in {todayEntry.secs}s — come back tomorrow for a new challenge
          </div>
          <div className="wakeup-solved-type" style={{ color: typeColors[todayEntry.type] || '#10b981' }}>
            {typeLabels[todayEntry.type] || 'Puzzle'} challenge
          </div>
        </div>
      ) : (
        <>
          <div className="wakeup-type-badge" style={{ background: `${typeColors[puzzle.type]}22`, color: typeColors[puzzle.type] }}>
            {typeLabels[puzzle.type]}
          </div>
          <div className="wakeup-question">{puzzle.question}</div>

          {showHint && (
            <div className="wakeup-hint">Hint: {puzzle.hint}</div>
          )}

          <div className={`wakeup-input-row ${shake ? 'wakeup-shake' : ''}`}>
            <input
              className={`wakeup-input ${status === 'wrong' ? 'wakeup-input-wrong' : ''}`}
              value={input}
              onChange={e => { setInput(e.target.value); setStatus('idle'); }}
              placeholder="Your answer..."
              autoFocus
            />
            <button className="wakeup-submit-btn" onClick={check}>Check</button>
          </div>

          {status === 'wrong' && (
            <div className="wakeup-wrong-msg">Not quite — try again!</div>
          )}

          <button className="wakeup-hint-btn" onClick={() => setShowHint(h => !h)}>
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        </>
      )}
    </div>
  );
}
