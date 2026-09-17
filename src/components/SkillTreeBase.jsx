import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  FaLock,
  FaCheckCircle,
  FaBolt,
  FaCrown,
  FaUnlock,
  FaPlus,
  FaMinus,
  FaExpand,
} from 'react-icons/fa';
import '../pages/SkillTreePage.css';
import { useLanguage } from '../contexts/LanguageContext';

// ══════════════════════════════════════════════════════════════════════════════
// SHARED SKILL TREE BASE — all skill-tree pages use this component
// Props:
//   treeData    { nodes, edges }   — the skill tree data
//   title       string             — page heading text
//   TitleIcon   React element      — icon to show next to the title
//   accentColor string             — primary color (hex) for this tree
//   BossIcon    React element      — icon shown inside the boss node skull area
// ══════════════════════════════════════════════════════════════════════════════

// Shared track-to-color map.
const BASE_TRACK_COLORS = {
  network:     '#f59e0b',
  web:         '#3b82f6',
  convergence: '#8b5cf6',
  security:    '#ef4444',
  boss:        '#f59e0b',
  python:      '#38bdf8',
  math:        '#fb7185',
  applied:     '#10b981',
  ml:          '#f59e0b',
  apex:        '#dc2626',
  summit:      '#a855f7',
};

function SkillNode({ data, accentColor }) {
  const [hovered, setHovered] = useState(false);
  const isBoss = data.track === 'boss' || data.track === 'apex' || data.track === 'summit' || data.isApex || data.isSummit;
  const isLocked = data.state === 'locked';
  const isCompleted = data.state === 'completed';
  const isAvailable = data.state === 'available';

  const nodeAccent = data.accentColor || accentColor || '#38bdf8';
  const color = isBoss
    ? (BASE_TRACK_COLORS[data.track] ?? BASE_TRACK_COLORS.boss)
    : (BASE_TRACK_COLORS[data.track] ?? nodeAccent);

  return (
    <>
      <Handle type="target" position={Position.Bottom} className="n8n-handle" style={{ background: color }} />
      <Handle type="target" position={Position.Left} className="n8n-handle" style={{ background: color }} />

      <div
        className={`skill-node ${data.state} ${isBoss ? 'boss-node' : ''} ${hovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ '--accent-color': color, '--node-border': color }}
      >
        <div className="skill-node-accent-bar" style={{ background: color }} />

        <div className="skill-node-top-bar">
          <span
            className="skill-node-level-badge"
            style={{
              color: color,
              borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
            }}
          >
            {data.level}
          </span>
          <div className="skill-node-status-icon" style={{ color: isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : isLocked ? '#64748b' : color }}>
            {isLocked    && <FaLock />}
            {isCompleted && <FaCheckCircle />}
            {isAvailable && <FaBolt />}
            {isBoss && !isLocked && !isCompleted && !isAvailable && <FaCrown />}
          </div>
        </div>

        <div className="skill-node-header">
          <h3 className="skill-node-title">{data.title}</h3>
        </div>

        <ul className="skill-node-micro-list">
          {data.microSkills.map((skill, i) => (
            <li key={i} className="skill-node-micro-item">
              <span className="skill-node-micro-bullet" style={{ background: color }} />
              <span className="skill-node-micro-text">{skill}</span>
            </li>
          ))}
        </ul>

        <div className="skill-node-footer">
          <div className="skill-node-xp">
            <FaBolt className="skill-node-xp-icon" />
            <span>+{data.xpReward} XP</span>
          </div>
        </div>

        {isBoss && data.bossIcon && (
          <div className="skill-node-boss-skull">{data.bossIcon}</div>
        )}
      </div>

      <Handle type="source" position={Position.Top} className="n8n-handle" style={{ background: color }} />
      <Handle type="source" position={Position.Right} className="n8n-handle" style={{ background: color }} />
    </>
  );
}

// nodeTypes must be stable (created outside render) to avoid ReactFlow re-mounting nodes.
// We create it once here; accentColor is passed via node.data.accentColor.
const nodeTypes = {
  skillNode: SkillNode,
};

// ── Inner canvas (must be inside ReactFlowProvider) ──────────────────────────
function SkillFlowCanvas({ treeData, title, TitleIcon, accentColor, BossIcon }) {
  const { t, lang } = useLanguage();
  // Inject accentColor + bossIcon into each node's data at mount time.
  const initialNodes = useMemo(
    () =>
      treeData.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          accentColor,
          bossIcon: n.data.track === 'boss' ? BossIcon : null,
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally empty — treeData is module-level constant, never changes
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(treeData.edges);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const [isLightMode, setIsLightMode] = useState(() => {
    return (
      document.documentElement.getAttribute('data-theme') === 'light' ||
      document.body.getAttribute('data-theme') === 'light'
    );
  });

  useEffect(() => {
    const updateThemeState = () => {
      const isLight =
        document.documentElement.getAttribute('data-theme') === 'light' ||
        document.body.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    };
    window.addEventListener('theme-changed', updateThemeState);
    window.addEventListener('storage', updateThemeState);
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      window.removeEventListener('theme-changed', updateThemeState);
      window.removeEventListener('storage', updateThemeState);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400, minZoom: 0.8, maxZoom: 1.0 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  const toggleLock  = useCallback(() => setIsLocked((p) => !p), []);
  const closeModal  = useCallback(() => setSelectedNode(null), []);
  const onNodeClick = useCallback((_evt, node) => setSelectedNode(node), []);

  const masterSkill = useCallback(() => {
    if (!selectedNode || selectedNode.data.state !== 'available') return;

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return { ...n, data: { ...n.data, state: 'completed' } };
        }

        const dependentEdges = treeData.edges.filter((e) => e.source === selectedNode.id);
        const dependentIds   = dependentEdges.map((e) => e.target);

        if (dependentIds.includes(n.id) && n.data.state === 'locked') {
          const parentEdges = treeData.edges.filter((e) => e.target === n.id);
          const parentNodes = nds.filter((pn) => parentEdges.some((pe) => pe.source === pn.id));
          const allDone     = parentNodes.every(
            (pn) => pn.id === selectedNode.id || pn.data.state === 'completed'
          );
          if (allDone) return { ...n, data: { ...n.data, state: 'available' } };
        }

        return n;
      })
    );

    closeModal();
  }, [selectedNode, setNodes, closeModal, treeData.edges]);

  const { earnedXP, totalXP } = useMemo(() => {
    const earned = nodes
      .filter((n) => n.data.state === 'completed')
      .reduce((s, n) => s + n.data.xpReward, 0);
    const total = nodes.reduce((s, n) => s + n.data.xpReward, 0);
    return { earnedXP: earned, totalXP: total };
  }, [nodes]);

  const xpProgress = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0;

  // Dynamic badge colours derived from accentColor hex → rgba helpers
  const badgeBg     = `${accentColor}26`;  // ~15% opacity
  const badgeBorder = `${accentColor}4D`;  // ~30% opacity

  return (
    <div className="skill-tree-page">
      {/* ── Split Header Layout ─────────────────────────────────── */}
      <div className="skill-tree-split-header-wrapper">
        {/* Left Navbar: Title + Icon */}
        <div className="skill-tree-left-navbar">
          <span className="skill-tree-title-icon" style={{ color: accentColor }}>
            {TitleIcon}
          </span>
          <h1 className="skill-tree-title-text">{title}</h1>
        </div>

        {/* Right Navbar: XP Info */}
        <div className="skill-tree-right-navbar">
          <div className="skill-tree-xp-numbers">
            <span className="skill-tree-xp-current" style={{ color: accentColor }}>{earnedXP}</span>
            <span className="skill-tree-xp-separator">/</span>
            <span className="skill-tree-xp-total">{totalXP}</span>
          </div>
          <span
            className="skill-tree-xp-badge"
            style={{ color: accentColor, borderColor: badgeBorder, background: badgeBg }}
          >
            XP
          </span>
          <div className="skill-tree-xp-bar-wrapper">
            <div className="skill-tree-xp-bar-track">
              <div
                className="skill-tree-xp-bar-fill"
                style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}CC 100%)` }}
              />
            </div>
            <span className="skill-tree-xp-percentage" style={{ color: accentColor }}>
              {Math.round(xpProgress)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── ReactFlow canvas ────────────────────────────────────────────── */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18, minZoom: 0.75, maxZoom: 1.05 }}
          minZoom={0.25}
          maxZoom={2.0}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          nodesDraggable={!isLocked}
          nodesConnectable={false}
          elementsSelectable={!isLocked}
          panOnDrag={!isLocked}
          zoomOnScroll={!isLocked}
          zoomOnPinch={!isLocked}
          preventScrolling={!isLocked}
          style={{ background: 'transparent' }}
          className="skill-tree-reactflow"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={2}
            color={isLightMode ? '#64748b' : 'rgba(255, 255, 255, 0.4)'}
            className="skill-tree-background"
          />
        </ReactFlow>

        {/* ── Floating Interactive Controls Dock (Vertical Left Side) ── */}
        <div className="skill-tree-controls-dock" aria-label="Workflow Controls">
          <button
            type="button"
            className="skill-dock-btn"
            onClick={() => zoomIn({ duration: 300 })}
            title={lang === 'ar' ? 'تكبير (+)' : 'Zoom In (+)'}
            aria-label="Zoom In"
          >
            <FaPlus />
          </button>
          <button
            type="button"
            className="skill-dock-btn"
            onClick={() => zoomOut({ duration: 300 })}
            title={lang === 'ar' ? 'تصغير (-)' : 'Zoom Out (-)'}
            aria-label="Zoom Out"
          >
            <FaMinus />
          </button>
          <button
            type="button"
            className="skill-dock-btn fit-view-btn"
            onClick={() => fitView({ padding: 0.15, duration: 400 })}
            title={lang === 'ar' ? 'إظهار المخطط بالكامل' : 'Show All (Fit View)'}
            aria-label="Fit View"
          >
            <FaExpand />
          </button>
          <div className="dock-divider" />
          <button
            type="button"
            className={`skill-dock-btn lock-btn ${isLocked ? 'locked' : 'unlocked'}`}
            onClick={toggleLock}
            title={isLocked ? (lang === 'ar' ? 'المخطط مقفل (اضغط للتحرير)' : 'Locked (Click to unlock)') : (lang === 'ar' ? 'المخطط حر (اضغط للقفل)' : 'Unlocked (Click to lock)')}
            aria-label="Toggle Lock"
          >
            {isLocked ? <FaLock /> : <FaUnlock />}
          </button>
        </div>
      </div>

      {/* ── Node detail modal ───────────────────────────────────────────── */}
      {selectedNode && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: isLightMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '56px 20px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: 'calc(100vh - 96px)',
              background: isLightMode
                ? 'linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)'
                : 'linear-gradient(160deg, #0b1124 0%, #080b18 100%)',
              border: isLightMode
                ? '1.5px solid rgba(56, 189, 248, 0.5)'
                : '1.5px solid rgba(56,189,248,0.55)',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isLightMode
                ? '0 16px 50px rgba(15, 23, 42, 0.16), 0 0 40px rgba(56,189,248,0.12)'
                : '0 16px 50px rgba(0,0,0,0.92), 0 0 40px rgba(56,189,248,0.18)',
              animation: 'none',
              flexShrink: 0,
            }}
          >
            {/* Top bar */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '14px 16px 12px',
              background: isLightMode ? 'rgba(241, 245, 249, 0.95)' : 'rgba(56,189,248,0.06)',
              borderBottom: isLightMode ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(56,189,248,0.15)',
              flexShrink: 0,
              gap: '12px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontSize: '18px', fontWeight: 800,
                  color: isLightMode ? '#0f172a' : '#f0f6ff',
                  margin: '0 0 4px 0', letterSpacing: '-0.02em',
                  textShadow: 'none',
                  lineHeight: 1.2,
                }}>{selectedNode.data.title}</h2>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: (selectedNode.data.track === 'boss' || selectedNode.data.track === 'apex' || selectedNode.data.track === 'summit' || selectedNode.data.isApex || selectedNode.data.isSummit)
                    ? (BASE_TRACK_COLORS[selectedNode.data.track] ?? BASE_TRACK_COLORS.boss)
                    : (BASE_TRACK_COLORS[selectedNode.data.track] ?? selectedNode.data.accentColor ?? accentColor ?? '#38bdf8'),
                  background: isLightMode
                    ? `color-mix(in srgb, ${(selectedNode.data.track === 'boss' || selectedNode.data.track === 'apex' || selectedNode.data.track === 'summit' || selectedNode.data.isApex || selectedNode.data.isSummit) ? (BASE_TRACK_COLORS[selectedNode.data.track] ?? BASE_TRACK_COLORS.boss) : (BASE_TRACK_COLORS[selectedNode.data.track] ?? selectedNode.data.accentColor ?? accentColor ?? '#38bdf8')} 16%, #ffffff)`
                    : `color-mix(in srgb, ${(selectedNode.data.track === 'boss' || selectedNode.data.track === 'apex' || selectedNode.data.track === 'summit' || selectedNode.data.isApex || selectedNode.data.isSummit) ? (BASE_TRACK_COLORS[selectedNode.data.track] ?? BASE_TRACK_COLORS.boss) : (BASE_TRACK_COLORS[selectedNode.data.track] ?? selectedNode.data.accentColor ?? accentColor ?? '#38bdf8')} 20%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${(selectedNode.data.track === 'boss' || selectedNode.data.track === 'apex' || selectedNode.data.track === 'summit' || selectedNode.data.isApex || selectedNode.data.isSummit) ? (BASE_TRACK_COLORS[selectedNode.data.track] ?? BASE_TRACK_COLORS.boss) : (BASE_TRACK_COLORS[selectedNode.data.track] ?? selectedNode.data.accentColor ?? accentColor ?? '#38bdf8')} 45%, transparent)`,
                  padding: '2.5px 8px',
                  borderRadius: '5px',
                  display: 'inline-block',
                }}>{selectedNode.data.level}</span>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: '28px', height: '28px', flexShrink: 0,
                  background: isLightMode ? '#f1f5f9' : 'rgba(30,41,59,0.7)',
                  border: isLightMode ? '1px solid #cbd5e1' : '1px solid rgba(100,116,139,0.4)',
                  borderRadius: '50%',
                  color: isLightMode ? '#64748b' : '#94a3b8',
                  fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.15s ease',
                }}
              >×</button>
            </div>

            {/* Scrollable body */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: '12px',
              background: isLightMode ? '#ffffff' : 'transparent',
            }}>
              <p style={{
                fontSize: '13px', lineHeight: 1.65,
                color: isLightMode ? '#475569' : '#94a3b8',
                margin: 0, fontStyle: 'italic',
              }}>{selectedNode.data.description}</p>

              <div>
                <h4 style={{
                  fontSize: '10px', fontWeight: 800,
                  color: isLightMode ? '#0284c7' : '#38bdf8',
                  margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1.5px',
                }}>Mastery Objectives</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedNode.data.microSkills.map((skill, idx) => (
                    <li key={idx} style={{
                      fontSize: '12px',
                      color: isLightMode ? '#1e293b' : '#c8d8f0',
                      padding: '8px 12px',
                      background: isLightMode ? 'rgba(241, 245, 249, 0.8)' : 'rgba(30,41,59,0.55)',
                      borderRadius: '7px',
                      borderLeft: isLightMode ? '2px solid #0284c7' : '2px solid #38bdf8',
                      fontFamily: "'Consolas','Monaco',monospace",
                    }}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 16px',
              borderTop: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(71,85,105,0.25)',
              background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '13px', fontWeight: 800,
                color: isLightMode ? '#d97706' : '#f59e0b',
                textShadow: isLightMode ? 'none' : '0 0 8px rgba(245,158,11,0.4)',
              }}>{t('skills.xpReward')}: +{selectedNode.data.xpReward} XP</span>
              <button
                className={`modal-action-btn ${selectedNode.data.state}`}
                onClick={masterSkill}
                disabled={selectedNode.data.state !== 'available'}
              >
                {selectedNode.data.state === 'completed' && t('skills.mastered')}
                {selectedNode.data.state === 'available' && t('skills.unlock')}
                {selectedNode.data.state === 'locked'    && t('skills.locked')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function SkillTreeBase({ treeData, title, TitleIcon, accentColor, BossIcon }) {
  return (
    <ReactFlowProvider>
      <SkillFlowCanvas
        treeData={treeData}
        title={title}
        TitleIcon={TitleIcon}
        accentColor={accentColor}
        BossIcon={BossIcon}
      />
    </ReactFlowProvider>
  );
}
