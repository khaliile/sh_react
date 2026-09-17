import { FaRobot } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const AI_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 (BOTTOM - FOUNDATIONS) ═══
    { id: 'ai-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'AI Fundamentals', level: 'Level 0 • Foundation', track: 'network', microSkills: ['Search Algorithms', 'Problem Solving', 'State Space'], xpReward: 150, state: 'available', description: 'Foundation of artificial intelligence: problem-solving and search.' } },
    { id: 'ai-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Knowledge Representation', level: 'Level 0 • Logic', track: 'network', microSkills: ['Logic', 'Ontologies', 'Semantic Networks'], xpReward: 150, state: 'available', description: 'Represent knowledge using logical and symbolic approaches.' } },
    // ═══ LEVEL 1 (CLASSICAL AI) ═══
    { id: 'ai-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'Heuristic Search', level: 'Level 1 • Search', track: 'web', microSkills: ['A* Algorithm', 'Greedy Search', 'Heuristics'], xpReward: 250, state: 'locked', description: 'Advanced search algorithms with heuristic guidance.' } },
    { id: 'ai-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'Planning & Reasoning', level: 'Level 1 • Planning', track: 'web', microSkills: ['STRIPS', 'Constraint Satisfaction', 'Planning'], xpReward: 250, state: 'locked', description: 'Automated planning and logical reasoning systems.' } },
    // ═══ LEVEL 2 (LEARNING & VISION) ═══
    { id: 'ai-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Computer Vision', level: 'Level 2 • Vision', track: 'convergence', microSkills: ['Image Processing', 'Object Detection', 'Segmentation'], xpReward: 400, state: 'locked', description: 'Enable machines to interpret and understand visual information.' } },
    { id: 'ai-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'Natural Language Processing', level: 'Level 2 • NLP', track: 'convergence', microSkills: ['Text Processing', 'Language Models', 'NER'], xpReward: 350, state: 'locked', description: 'Process and understand human language with AI.' } },
    { id: 'ai-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Reinforcement Learning', level: 'Level 2 • RL', track: 'convergence', microSkills: ['Q-Learning', 'Policy Gradient', 'Reward Systems'], xpReward: 400, state: 'locked', description: 'Train agents through interaction and rewards.' } },
    // ═══ LEVEL 3 (ADVANCED AI) ═══
    { id: 'ai-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'Multi-Agent Systems', level: 'Level 3 • Agents', track: 'security', microSkills: ['Agent Coordination', 'Game Theory', 'Distributed AI'], xpReward: 450, state: 'locked', description: 'Coordinate multiple intelligent agents working together.' } },
    { id: 'ai-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Explainable AI', level: 'Level 3 • XAI', track: 'security', microSkills: ['Model Interpretability', 'SHAP', 'LIME'], xpReward: 450, state: 'locked', description: 'Make AI decisions transparent and interpretable.' } },
    { id: 'ai-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'AI Ethics & Safety', level: 'Level 3 • Ethics', track: 'security', microSkills: ['Bias Detection', 'Fairness', 'AI Alignment'], xpReward: 500, state: 'locked', description: 'Ensure AI systems are ethical, fair, and safe.' } },
    // ═══ LEVEL 4 (APEX) ═══
    { id: 'ai-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'Advanced AI Systems', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['Large Language Models', 'Multimodal AI', 'AI Agents', 'AutoML', 'Meta-Learning'], xpReward: 1000, state: 'locked', description: 'Master cutting-edge AI systems and architectures.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'ai-a', target: 'ai-c', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-b-d', source: 'ai-b', target: 'ai-d', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-c-e', source: 'ai-c', target: 'ai-e', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-c-f', source: 'ai-c', target: 'ai-f', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-d-f', source: 'ai-d', target: 'ai-f', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-d-g', source: 'ai-d', target: 'ai-g', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-e-h', source: 'ai-e', target: 'ai-h', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-e-i', source: 'ai-e', target: 'ai-i', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-f-i', source: 'ai-f', target: 'ai-i', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-g-j', source: 'ai-g', target: 'ai-j', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-h-boss', source: 'ai-h', target: 'ai-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'ai-i', target: 'ai-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'ai-j', target: 'ai-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function AISkillTree() {
  return (
    <SkillTreeBase
      treeData={AI_SKILL_TREE}
      title="AI"
      TitleIcon={<FaRobot />}
      accentColor="#f59e0b"
      BossIcon={<FaRobot />}
    />
  );
}
