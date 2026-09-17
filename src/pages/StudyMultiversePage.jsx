import React, { useState, useRef, useMemo } from 'react';
import {
  FaGlobe, FaUnlock, FaLock, FaArrowRight, FaSearch,
  FaBrain, FaRobot, FaDatabase, FaCalculator, FaNetworkWired,
  FaChartLine, FaCodeBranch, FaInfoCircle, FaPlus, FaMinus
} from 'react-icons/fa';
import { GiGalaxy, GiSolarSystem, GiAtom } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import './StudyMultiversePage.css';

const NODES_DATA = [
  {
    id: 'math', x: 500, y: 210,
    labelEn: 'Mathematics', labelAr: 'الرياضيات',
    color: '#fbbf24', icon: <FaCalculator />, tier: 0,
    descEn: 'The foundation of all analytical thinking. Master algebra, calculus, and statistics.',
    descAr: 'أساس كل تفكير تحليلي وعلمي. إتقان الجبر وحساب التفاضل والتكامل والإحصاء.',
    tagsEn: ['Foundation', 'Core'], tagsAr: ['الأساس', 'جوهر'],
    unlocks: ['ml', 'ds', 'physics']
  },
  {
    id: 'ds', x: 280, y: 140,
    labelEn: 'Data Science', labelAr: 'علوم البيانات',
    color: '#22d3ee', icon: <FaDatabase />, tier: 1,
    descEn: 'Extract insights from data. Covers pandas, NumPy, visualization, and analytics.',
    descAr: 'استخلاص الرؤى من البيانات الخام باستخدام بايثون ومكتبات التحليل البصري.',
    tagsEn: ['Analytics', 'Python'], tagsAr: ['تحليلات', 'بايثون'],
    unlocks: ['ml', 'bigdata']
  },
  {
    id: 'ml', x: 400, y: 320,
    labelEn: 'Machine Learning', labelAr: 'تعلم الآلة',
    color: '#a78bfa', icon: <FaRobot />, tier: 2,
    descEn: 'Train models to learn patterns. Supervised, unsupervised, and reinforcement learning.',
    descAr: 'تدريب النماذج على اكتشاف الأنماط والتنبؤ بالمستقبل والتعلم المعزز.',
    tagsEn: ['Advanced', 'AI'], tagsAr: ['متقدم', 'ذكاء اصطناعي'],
    unlocks: ['dl', 'nlp', 'cv']
  },
  {
    id: 'dl', x: 560, y: 380,
    labelEn: 'Deep Learning', labelAr: 'التعلم العميق',
    color: '#f472b6', icon: <FaBrain />, tier: 3,
    descEn: 'Neural networks and modern AI. PyTorch, TensorFlow, transformers.',
    descAr: 'الشبكات العصبية الاصطناعية العميقة وتطبيقات بايتورش والمحولات.',
    tagsEn: ['Expert', 'Neural Nets'], tagsAr: ['خبير', 'شبكات عصبية'],
    unlocks: ['llm', 'cv']
  },
  {
    id: 'nlp', x: 300, y: 420,
    labelEn: 'NLP', labelAr: 'معالجة اللغات الطبيعية',
    color: '#34d399', icon: <FaGlobe />, tier: 3,
    descEn: 'Natural language processing. Text classification, sentiment, BERT, GPT architectures.',
    descAr: 'معالجة وفهم النصوص البشرية، وتصنيف المشاعر ونماذج المحولات اللغوية.',
    tagsEn: ['Language', 'AI'], tagsAr: ['لغة', 'ذكاء اصطناعي'],
    unlocks: ['llm']
  },
  {
    id: 'cv', x: 700, y: 340,
    labelEn: 'Computer Vision', labelAr: 'الرؤية الحاسوبية',
    color: '#fb923c', icon: <FaSearch />, tier: 3,
    descEn: 'Image recognition, object detection, segmentation. CNNs and ViTs.',
    descAr: 'التعرف على الصور وتتبع الكائنات وتجزئة المشاهد البصرية عبر الشبكات الالتفافية.',
    tagsEn: ['Vision', 'AI'], tagsAr: ['رؤية', 'ذكاء اصطناعي'],
    unlocks: ['llm']
  },
  {
    id: 'bigdata', x: 140, y: 250,
    labelEn: 'Big Data', labelAr: 'البيانات الضخمة',
    color: '#60a5fa', icon: <FaDatabase />, tier: 2,
    descEn: 'Hadoop, Spark, distributed computing, data pipelines at scale.',
    descAr: 'هندسة البيانات الضخمة والحوسبة الموزعة وخطوط أنابيب البيانات الموسعة.',
    tagsEn: ['Engineering', 'Scale'], tagsAr: ['هندسة', 'توسع'],
    unlocks: ['ml']
  },
  {
    id: 'networking', x: 700, y: 160,
    labelEn: 'Networking', labelAr: 'الشبكات والإنترنت',
    color: '#818cf8', icon: <FaNetworkWired />, tier: 1,
    descEn: 'TCP/IP, DNS, HTTP, security protocols. Foundation for cloud and distributed systems.',
    descAr: 'بروتوكولات الاتصال وأمان الشبكات، الأساس الراسخ للأنظمة السحابية الموزعة.',
    tagsEn: ['Infrastructure'], tagsAr: ['بنية تحتية'],
    unlocks: ['cloud']
  },
  {
    id: 'cloud', x: 820, y: 260,
    labelEn: 'Cloud Computing', labelAr: 'الحوسبة السحابية',
    color: '#38bdf8', icon: <FaChartLine />, tier: 2,
    descEn: 'AWS, GCP, Azure. Containerization, serverless, DevOps workflows.',
    descAr: 'إدارة البنية السحابية والحاويات والخدمات اللامركزية ونهج ديف أوبس الحديث.',
    tagsEn: ['DevOps', 'Scale'], tagsAr: ['ديف أوبس', 'سحابة'],
    unlocks: []
  },
  {
    id: 'llm', x: 500, y: 480,
    labelEn: 'LLM Engineering', labelAr: 'هندسة النماذج اللغوية الضخمة',
    color: '#e879f9', icon: <FaGlobe />, tier: 4,
    descEn: 'Build with large language models. RAG, fine-tuning, agents, prompt engineering.',
    descAr: 'بناء وكلاء الذكاء الاصطناعي وهندسة الأوامر واسترجاع المعرفة المولد (RAG).',
    tagsEn: ['Frontier', 'AI'], tagsAr: ['طليعة الذكاء', 'وكلاء'],
    unlocks: []
  },
  {
    id: 'physics', x: 640, y: 90,
    labelEn: 'Physics', labelAr: 'الفيزياء',
    color: '#fcd34d', icon: <GiAtom />, tier: 1,
    descEn: 'Classical mechanics, thermodynamics, quantum theory — bridges math to reality.',
    descAr: 'الميكانيكا والديناميكا الحرارية — الجسر العلمي الرابط بين الرياضيات والواقع.',
    tagsEn: ['Science', 'Theory'], tagsAr: ['علوم', 'نظريات'],
    unlocks: ['cv']
  },
];

const EDGES = [
  { from: 'math',       to: 'ml' },
  { from: 'math',       to: 'ds' },
  { from: 'math',       to: 'physics' },
  { from: 'ds',         to: 'ml' },
  { from: 'ds',         to: 'bigdata' },
  { from: 'ml',         to: 'dl' },
  { from: 'ml',         to: 'nlp' },
  { from: 'ml',         to: 'cv' },
  { from: 'dl',         to: 'llm' },
  { from: 'nlp',        to: 'llm' },
  { from: 'cv',         to: 'llm' },
  { from: 'networking', to: 'cloud' },
  { from: 'physics',    to: 'cv' },
];

export default function StudyMultiversePage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [selected, setSelected] = useState(null);
  const [unlocked, setUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mv_unlocked') || '["math","ds"]'); }
    catch { return ['math', 'ds']; }
  });
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef(null);

  const getNodeById = (id) => NODES_DATA.find(n => n.id === id);
  const isUnlocked = (id) => unlocked.includes(id);

  const unlockNode = (id) => {
    if (isUnlocked(id)) return;
    const next = [...unlocked, id];
    setUnlocked(next);
    try {
      localStorage.setItem('mv_unlocked', JSON.stringify(next));
    } catch {}
  };

  const selectedNode = selected ? getNodeById(selected) : null;

  const viewBox = useMemo(() => {
    const scale = 1 / zoom;
    const vw = 960 * scale;
    const vh = 560 * scale;
    const ox = (960 - vw) / 2;
    const oy = (560 - vh) / 2;
    return `${ox} ${oy} ${vw} ${vh}`;
  }, [zoom]);

  const legendItems = [
    { color: '#4ade80', label: isRTL ? 'مسار مفتوح' : 'Unlocked' },
    { color: '#818cf8', label: isRTL ? 'قيد الإنجاز' : 'In Progress' },
    { color: '#334155', label: isRTL ? 'مسار مقفل' : 'Locked' },
  ];

  return (
    <div className={`multiverse ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="multiverse-header">
        <h1>
          <GiGalaxy style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'أكوان الدراسة المتعددة — خريطة المسارات' : 'Study Multiverse'}
        </h1>
        <p>
          {isRTL
            ? 'تصفح الكون المتفرع لجميع المسارات التعليمية الممكنة — انقر على أي مسار لاستكشافه وفتحه'
            : 'Navigate the branching universe of all possible learning paths — click to explore'}
        </p>
        <span className="multiverse-badge">
          <GiSolarSystem style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? `${unlocked.length} مسارات مفتوحة` : `${unlocked.length} Paths Unlocked`}
        </span>
      </div>

      {/* ── SVG Node Map ── */}
      <div className="multiverse-map-wrap">
        <div className="multiverse-map-header">
          <h2>
            <FaCodeBranch style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
            {isRTL ? 'كون مسارات التعلم' : 'Learning Universe'}
          </h2>
          <div className="multiverse-zoom-btns">
            <button className="multiverse-zoom-btn" onClick={() => setZoom(z => Math.min(2, z + 0.2))} title={isRTL ? 'تكبير' : 'Zoom in'}>
              <FaPlus />
            </button>
            <button className="multiverse-zoom-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} title={isRTL ? 'تصغير' : 'Zoom out'}>
              <FaMinus />
            </button>
          </div>
        </div>

        <svg
          ref={svgRef}
          className="multiverse-svg"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="mv-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {EDGES.map((e, i) => {
            const from = getNodeById(e.from);
            const to = getNodeById(e.to);
            if (!from || !to) return null;
            const bothUnlocked = isUnlocked(e.from) && isUnlocked(e.to);
            return (
              <line
                key={i}
                className="mv-edge"
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={bothUnlocked ? from.color : 'rgba(100,116,139,0.3)'}
                strokeWidth={bothUnlocked ? 2 : 1}
                strokeDasharray={bothUnlocked ? 'none' : '6 4'}
                opacity={bothUnlocked ? 0.5 : 0.25}
              />
            );
          })}

          {/* Nodes */}
          {NODES_DATA.map(node => {
            const isActive = isUnlocked(node.id);
            const isSelected = selected === node.id;
            const r = isSelected ? 26 : 20;
            const nodeLabel = isRTL ? node.labelAr : node.labelEn;
            return (
              <g
                key={node.id}
                className="mv-node"
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelected(node.id === selected ? null : node.id)}
              >
                {isSelected && (
                  <circle r={r + 10} fill="none" stroke={node.color} strokeWidth="1.5" opacity="0.3"
                    style={{ animation: 'mv-select-ring 1.5s ease-in-out infinite' }} />
                )}
                <circle
                  className="mv-node-circle"
                  r={r}
                  fill={isActive ? `${node.color}22` : 'rgba(15,23,42,0.8)'}
                  stroke={isActive ? node.color : '#334155'}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isActive ? 'url(#mv-glow)' : 'none'}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="700"
                  fill={isActive ? node.color : '#475569'}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {isActive ? '●' : '○'}
                </text>
                <text
                  className="mv-node-text"
                  textAnchor="middle"
                  y={r + 14}
                  fontSize="9"
                  fill={isActive ? node.color : '#475569'}
                >
                  {nodeLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Detail Panel ── */}
      {selectedNode && (
        <div className="multiverse-detail">
          <div className="multiverse-detail-header">
            <div className="multiverse-detail-icon" style={{ color: selectedNode.color }}>
              {selectedNode.icon}
            </div>
            <div>
              <div className="multiverse-detail-name" style={{ color: selectedNode.color }}>
                {isRTL ? selectedNode.labelAr : selectedNode.labelEn}
              </div>
              <p className="multiverse-detail-path">
                {isRTL ? `المستوى ${selectedNode.tier + 1} — ` : `Tier ${selectedNode.tier + 1} — `}
                {isUnlocked(selectedNode.id) ? (isRTL ? 'مفتوح' : 'Unlocked') : (isRTL ? 'مقفل' : 'Locked')}
              </p>
            </div>
            {!isUnlocked(selectedNode.id) && (
              <button
                onClick={() => unlockNode(selectedNode.id)}
                style={{
                  [isRTL ? 'marginRight' : 'marginLeft']: 'auto',
                  padding: '0.5rem 1.1rem',
                  background: `${selectedNode.color}22`,
                  border: `1px solid ${selectedNode.color}55`,
                  borderRadius: '10px',
                  color: selectedNode.color,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <FaUnlock /> {isRTL ? 'فتح هذا المسار' : 'Unlock Path'}
              </button>
            )}
          </div>

          <div className="multiverse-detail-tags">
            {(isRTL ? selectedNode.tagsAr : selectedNode.tagsEn).map(t => (
              <span key={t} className="multiverse-tag"
                style={{ background: `${selectedNode.color}18`, border: `1px solid ${selectedNode.color}44`, color: selectedNode.color }}>
                {t}
              </span>
            ))}
          </div>

          <p className="multiverse-detail-desc">
            {isRTL ? selectedNode.descAr : selectedNode.descEn}
          </p>

          {selectedNode.unlocks.length > 0 && (
            <div className="multiverse-detail-unlocks">
              <FaArrowRight style={{ color: selectedNode.color, flexShrink: 0, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
              {isRTL ? 'يفتح المسارات التالية: ' : 'Unlocks: '}
              {selectedNode.unlocks.map(uid => {
                const n = getNodeById(uid);
                return n ? (
                  <span key={uid} className="multiverse-unlock-chip" onClick={() => setSelected(uid)} style={{ cursor: 'pointer' }}>
                    {isRTL ? n.labelAr : n.labelEn}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="multiverse-legend">
        {legendItems.map(l => (
          <div className="multiverse-legend-item" key={l.label}>
            <div className="multiverse-legend-dot" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
