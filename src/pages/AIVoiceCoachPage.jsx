import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaChartBar, FaMicrophone, FaVolumeUp, FaShieldAlt, FaPhoneAlt } from 'react-icons/fa';

const AIVoiceCoach = lazy(() => import('../components/AIVoiceCoach'));

export default function AIVoiceCoachPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  const pageStyle = {
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #020614 0%, #0f1630 50%, #0c1a3a 100%)',
    padding: '40px 24px',
    fontFamily: 'Inter, system-ui, sans-serif',
    gap: '28px',
    textAlign: 'center',
  };

  const iconStyle = {
    fontSize: '3.5rem',
    color: '#38bdf8',
    lineHeight: 1,
    filter: 'drop-shadow(0 0 24px rgba(56,189,248,0.4))',
  };

  const h1Style = {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#f1f5f9',
    margin: 0,
    letterSpacing: '-0.5px',
  };

  const subStyle = {
    fontSize: '0.95rem',
    color: 'rgba(148,163,184,0.75)',
    maxWidth: '420px',
    lineHeight: 1.7,
    margin: 0,
  };

  const featureGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    width: '100%',
    maxWidth: '420px',
  };

  const featureCard = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '14px 16px',
    textAlign: 'left',
  };

  const featureTitleStyle = {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '4px',
  };

  const featureDescStyle = {
    fontSize: '0.73rem',
    color: 'rgba(148,163,184,0.65)',
    lineHeight: 1.5,
  };

  const startBtnStyle = {
    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    border: 'none',
    borderRadius: '50px',
    padding: '16px 48px',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.05rem',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '0.3px',
    boxShadow: '0 12px 32px rgba(14,165,233,0.4)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const backBtnStyle = {
    background: 'none',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: '30px',
    padding: '8px 22px',
    color: 'rgba(148,163,184,0.6)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.15s ease, color 0.15s ease',
  };

  const features = [
    { icon: <FaChartBar style={{ color: '#38bdf8' }} />, title: 'Full Data Awareness', desc: 'Knows your XP, coins, boss HP, and all quest progress' },
    { icon: <FaMicrophone style={{ color: '#ec4899' }} />, title: 'Real Voice Input', desc: 'Speak naturally — no typing required' },
    { icon: <FaVolumeUp style={{ color: '#a855f7' }} />, title: 'Voice Response', desc: 'AI responds via Piper TTS or browser speech' },
    { icon: <FaShieldAlt style={{ color: '#10b981' }} />, title: 'Study Analysis', desc: 'Analyzes your hours, streak, and schedule slot' },
  ];

  return (
    <div style={pageStyle}>
      <div style={iconStyle}><FaRobot /></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <h1 style={h1Style}>AI Study Coach</h1>
        <p style={subStyle}>
          Your personal coach who already knows everything about your study progress.
          Have a real voice conversation — get personalized insights, motivation, and strategy.
        </p>
      </div>

      <div style={featureGrid}>
        {features.map(f => (
          <div key={f.title} style={featureCard}>
            <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{f.icon}</div>
            <div style={featureTitleStyle}>{f.title}</div>
            <div style={featureDescStyle}>{f.desc}</div>
          </div>
        ))}
      </div>

      <button
        id="coach-page-start-btn"
        style={startBtnStyle}
        onClick={() => setStarted(true)}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(14,165,233,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,165,233,0.4)';
        }}
      >
        <FaPhoneAlt /> Start Voice Call
      </button>

      <button
        style={backBtnStyle}
        onClick={() => navigate(-1)}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(148,163,184,0.5)';
          e.currentTarget.style.color = 'rgba(148,163,184,0.9)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)';
          e.currentTarget.style.color = 'rgba(148,163,184,0.6)';
        }}
      >
        ← Go back
      </button>

      <p style={{ fontSize: '0.68rem', color: 'rgba(148,163,184,0.3)', margin: 0 }}>
        Requires API key in settings · Microphone permission needed · Piper TTS on :8100 for best voice quality
      </p>

      {/* Voice Coach Modal */}
      {started && (
        <Suspense fallback={null}>
          <AIVoiceCoach onClose={() => { setStarted(false); navigate(-1); }} />
        </Suspense>
      )}
    </div>
  );
}
