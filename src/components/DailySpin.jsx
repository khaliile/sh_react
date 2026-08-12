import { useState, useRef } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

const CHALLENGES = [
  { id: 'no_breaks',    text: 'No unplanned breaks today',         icon: '!', xp: 50 },
  { id: 'blocks_45',   text: 'Study in 45-min focus blocks only',  icon: '45', xp: 40 },
  { id: 'teach',       text: 'Teach one concept to yourself aloud', icon: 'T', xp: 60 },
  { id: 'pomodoro3',   text: '3 Pomodoros before lunch',           icon: 'P', xp: 45 },
  { id: 'no_phone',    text: 'Zero phone use until 6pm',           icon: 'X', xp: 55 },
  { id: 'review',      text: 'Review yesterday\'s notes first',    icon: 'R', xp: 35 },
  { id: 'hardest',     text: 'Tackle your hardest task first',     icon: 'H', xp: 65 },
  { id: 'early',       text: 'Start studying before 9am',          icon: 'E', xp: 70 },
];

// Seeded pick from challenges based on today's date
function getTodayChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  const seed  = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  return CHALLENGES[seed % CHALLENGES.length];
}

const WHEEL_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444',
  '#a78bfa','#ec4899','#06b6d4','#84cc16'
];

export default function DailySpin() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [spinLog, setSpinLog] = useAppStorage('app_spin_log', {});

  const todayEntry = spinLog[todayKey];
  const todayChallenge = getTodayChallenge();

  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [showResult, setShowResult] = useState(!!todayEntry);
  const [justCompleted, setJustCompleted] = useState(false);
  const wheelRef = useRef(null);

  const spin = () => {
    if (spinning || todayEntry) return;
    setSpinning(true);
    const spins = 5 + Math.random() * 3;
    const targetIdx = CHALLENGES.indexOf(todayChallenge);
    const segAngle = 360 / CHALLENGES.length;
    const targetAngle = 360 - (targetIdx * segAngle + segAngle / 2);
    const finalAngle = angle + spins * 360 + targetAngle;
    setAngle(finalAngle);
    setTimeout(() => {
      setSpinning(false);
      setShowResult(true);
      setSpinLog(prev => ({ ...prev, [todayKey]: { id: todayChallenge.id, spun: true, done: false, ts: Date.now() } }));
    }, 3500);
  };

  const markDone = () => {
    setSpinLog(prev => ({ ...prev, [todayKey]: { ...prev[todayKey], done: true } }));
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 2000);
  };

  const totalXP = Object.values(spinLog).filter(e => e.done).reduce((s, e) => {
    const ch = CHALLENGES.find(c => c.id === e.id);
    return s + (ch?.xp || 0);
  }, 0);

  const alreadyDone = todayEntry?.done;

  return (
    <div className="arena-card spin-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Daily Challenge</h3>
          <p className="arena-card-sub">Spin once a day for your wildcard mission</p>
        </div>
        <div className="spin-xp-badge">
          <span className="spin-xp-val">{totalXP}</span>
          <span className="spin-xp-label">XP</span>
        </div>
      </div>

      {/* Wheel */}
      <div className="wheel-wrapper">
        <div className="wheel-pointer">▼</div>
        <div
          ref={wheelRef}
          className="spin-wheel"
          style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none' }}
        >
          {CHALLENGES.map((ch, i) => {
            const segAngle = 360 / CHALLENGES.length;
            const rotate = i * segAngle;
            const skewY = 90 - segAngle;
            return (
              <div
                key={ch.id}
                className="wheel-segment"
                style={{
                  '--seg-color': WHEEL_COLORS[i],
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                <div className="wheel-segment-inner" style={{ background: WHEEL_COLORS[i] }}>
                  <span className="wheel-seg-icon">{ch.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {!spinning && !showResult && (
          <button className="spin-btn" onClick={spin}>
            SPIN
          </button>
        )}
        {spinning && (
          <div className="spin-center-msg">Spinning...</div>
        )}
        {showResult && !spinning && (
          <div className="spin-center-result">{todayChallenge.icon}</div>
        )}
      </div>

      {/* Result */}
      {showResult && !spinning && (
        <div className={`spin-result ${alreadyDone ? 'spin-result-done' : ''}`}>
          <div className="spin-result-label">Today's Challenge</div>
          <div className="spin-result-text">{todayChallenge.text}</div>
          <div className="spin-result-xp">+{todayChallenge.xp} XP on completion</div>

          {alreadyDone ? (
            <div className="spin-done-banner">
              {justCompleted ? 'XP Earned!' : 'Completed — great work!'}
            </div>
          ) : (
            <button className="spin-complete-btn" onClick={markDone}>
              Mark Complete (+{todayChallenge.xp} XP)
            </button>
          )}
        </div>
      )}

      {!showResult && !spinning && (
        <div className="spin-idle-hint">A new challenge is waiting — give it a spin!</div>
      )}
    </div>
  );
}
