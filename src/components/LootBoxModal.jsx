import { useState, useEffect } from 'react';
import { FaCoins, FaStar, FaFlask, FaGem, FaBomb, FaGift, FaBoxOpen, FaCheck } from 'react-icons/fa';
import { useRpgStorage } from '../hooks/useRpgStorage';
import './LootBoxModal.css';

// ── Loot Table ───────────────────────────────────────────────────────────────
const LOOT_TABLE = [
  // Common (60%)
  { id: 'coins_small',  rarity: 'common',    label: '+15 Coins',              weight: 30, type: 'coins',     value: 15 },
  { id: 'coins_med',    rarity: 'common',    label: '+30 Coins',              weight: 20, type: 'coins',     value: 30 },
  { id: 'xp_small',    rarity: 'common',    label: '+20 XP',                 weight: 10, type: 'xp',        value: 20 },
  // Rare (28%)
  { id: 'coins_large',  rarity: 'rare',      label: '+75 Coins',              weight: 14, type: 'coins',     value: 75 },
  { id: 'xp_med',      rarity: 'rare',      label: '+50 XP Burst',           weight: 10, type: 'xp',        value: 50 },
  { id: 'buff_xp',     rarity: 'rare',      label: 'XP Boost (15 min)',      weight: 4,  type: 'buff',      value: 15 },
  // Epic (10%)
  { id: 'fragment_1',  rarity: 'epic',      label: 'Theme Fragment',          weight: 7,  type: 'fragment',  value: 1 },
  { id: 'coins_epic',  rarity: 'epic',      label: '+150 Coins',             weight: 3,  type: 'coins',     value: 150 },
  // Legendary (2%)
  { id: 'boss_bomb',   rarity: 'legendary', label: 'Boss Bomb (250 DMG)!',   weight: 1,  type: 'boss_bomb', value: 250 },
  { id: 'xp_legendary',rarity: 'legendary', label: '+200 XP Jackpot!',       weight: 1,  type: 'xp',        value: 200 },
];

const RARITY_COLORS = {
  common:    { bg: 'linear-gradient(135deg,#334155,#1e293b)', border: '#64748b', glow: '#94a3b8', label: 'Common' },
  rare:      { bg: 'linear-gradient(135deg,#1e3a5f,#0f172a)', border: '#3b82f6', glow: '#60a5fa', label: 'Rare' },
  epic:      { bg: 'linear-gradient(135deg,#3b0764,#1e0a3c)', border: '#a855f7', glow: '#c084fc', label: 'Epic' },
  legendary: { bg: 'linear-gradient(135deg,#451a03,#1c0a00)', border: '#f59e0b', glow: '#fbbf24', label: 'Legendary' },
};

// Deterministic radial explosion offsets for particle burst
const PARTICLE_OFFSETS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 2 * Math.PI;
  const dist = 60 + ((i * 37) % 40);
  return {
    tx: `${Math.round(Math.cos(angle) * dist)}px`,
    ty: `${Math.round(Math.sin(angle) * dist)}px`,
  };
});

function weightedRandom() {
  const total = LOOT_TABLE.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of LOOT_TABLE) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return LOOT_TABLE[0];
}

export default function LootBoxModal({ onClose, reward }) {
  const [phase, setPhase] = useState('closed'); // closed → shaking → opening → reveal
  const { addXpAndCoins, damageBoss } = useRpgStorage();

  const [loot] = useState(() => reward || weightedRandom());
  const rarity = RARITY_COLORS[loot.rarity] || RARITY_COLORS.common;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shaking'), 100);
    const t2 = setTimeout(() => setPhase('opening'), 1200);
    const t3 = setTimeout(() => {
      setPhase('reveal');
      // Apply reward
      if (loot.type === 'coins') addXpAndCoins(0, loot.value, 'Loot Drop');
      if (loot.type === 'xp') addXpAndCoins(loot.value, 0, 'Loot Drop');
      if (loot.type === 'boss_bomb') damageBoss(loot.value, 'Loot Drop Bomb');
      if (loot.type === 'buff') {
        try {
          const inv = JSON.parse(localStorage.getItem('app_rpg_inventory') || '{}');
          const until = Date.now() + loot.value * 60 * 1000;
          const updated = { ...inv, activeBuffs: { ...(inv.activeBuffs || {}), doubleXpUntil: until } };
          localStorage.setItem('app_rpg_inventory', JSON.stringify(updated));
        } catch { /* noop */ }
      }
      if (loot.type === 'fragment') {
        try {
          const raw = JSON.parse(localStorage.getItem('app_theme_fragments') || '{"count":0}');
          const newCount = (raw.count || 0) + 1;
          localStorage.setItem('app_theme_fragments', JSON.stringify({ count: newCount }));
          if (newCount >= 3) {
            addXpAndCoins(0, 200, 'Fragment Set Complete');
            localStorage.setItem('app_theme_fragments', JSON.stringify({ count: 0 }));
          }
        } catch { /* noop */ }
      }
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loot, addXpAndCoins, damageBoss]);

  return (
    <div className="lb-overlay" onClick={phase === 'reveal' ? onClose : undefined}>
      <div className="lb-panel" onClick={e => e.stopPropagation()}>
        <div className="lb-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <FaBoxOpen style={{ color: '#38bdf8' }} /> Session Loot Drop
        </div>

        {phase !== 'reveal' && (
          <div
            className="lb-crate"
            data-phase={phase}
            title="Opening..."
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '3rem' }}
          >
            <FaGift />
          </div>
        )}

        {phase === 'reveal' && (
          <>
            {/* Particle burst */}
            {PARTICLE_OFFSETS.map((p, i) => (
              <div
                key={i}
                className="lb-particle"
                style={{
                  top: '40%',
                  left: '50%',
                  background: rarity.glow,
                  '--tx': p.tx,
                  '--ty': p.ty,
                }}
              />
            ))}
            <div className="lb-reveal" style={{ '--rarity-glow': rarity.glow }}>
              <div
                className="lb-reward-card"
                style={{
                  '--rarity-bg': rarity.bg,
                  '--rarity-border': rarity.border,
                  '--rarity-glow': rarity.glow,
                }}
              >
                <div className="lb-rarity-badge">⬡ {rarity.label}</div>
                <div className="lb-reward-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loot.type === 'coins' && <FaCoins style={{ color: '#f59e0b' }} />}
                  {loot.type === 'xp' && <FaStar style={{ color: '#38bdf8' }} />}
                  {loot.type === 'buff' && <FaFlask style={{ color: '#a855f7' }} />}
                  {loot.type === 'fragment' && <FaGem style={{ color: '#06b6d4' }} />}
                  {loot.type === 'boss_bomb' && <FaBomb style={{ color: '#ef4444' }} />}
                  <span>{loot.label}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {phase === 'reveal' && (
          <button className="lb-close-btn" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FaCheck /> Claim Reward
          </button>
        )}

        {phase !== 'reveal' && (
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 8 }}>Opening crate...</div>
        )}
      </div>
    </div>
  );
}
