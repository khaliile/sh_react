import React from 'react';
import { FaBrain, FaCrown } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const DATA_SCIENCE_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 (BOTTOM - THE ROOTS) ═══
    {
      id: 'node-a',
      type: 'skillNode',
      position: { x: 50, y: 1500 },
      data: {
        title: 'Core Python',
        level: 'Level 0 • Python Root',
        track: 'python',
        microSkills: ['Data Types & Variables', 'Loops & Conditionals', 'Functions & Lambdas'],
        xpReward: 150,
        state: 'available',
        description: 'Master the fundamental building blocks of Python programming.',
      },
    },
    {
      id: 'node-b',
      type: 'skillNode',
      position: { x: 550, y: 1500 },
      data: {
        title: 'Linear Algebra',
        level: 'Level 0 • Math Root',
        track: 'math',
        microSkills: ['Vectors & Matrices', 'Dot Product', 'Eigenvalues'],
        xpReward: 150,
        state: 'available',
        description: 'Foundation of data transformations and geometric understanding.',
      },
    },

    // ═══ LEVEL 1 (ARCHITECTURE & INFERENCE) ═══
    {
      id: 'node-c',
      type: 'skillNode',
      position: { x: 50, y: 1150 },
      data: {
        title: 'Advanced Python',
        level: 'Level 1 • Architecture',
        track: 'python',
        microSkills: ['OOP & Classes', 'Inheritance', 'Decorators'],
        xpReward: 250,
        state: 'locked',
        description: 'Object-oriented paradigms for scalable machine learning systems.',
      },
    },
    {
      id: 'node-d',
      type: 'skillNode',
      position: { x: 550, y: 1150 },
      data: {
        title: 'Probability & Stats',
        level: 'Level 1 • Inference',
        track: 'math',
        microSkills: ['Normal Distribution', 'Bayes Theorem', 'p-value & Hypothesis'],
        xpReward: 250,
        state: 'locked',
        description: 'Statistical foundations for uncertainty quantification and inference.',
      },
    },

    // ═══ LEVEL 2 (CONVERGENCE & OPTIMIZATION) ═══
    {
      id: 'node-e',
      type: 'skillNode',
      position: { x: 50, y: 800 },
      data: {
        title: 'Data Forging',
        level: 'Level 2 • Convergence',
        track: 'convergence',
        microSkills: ['NumPy NDArrays', 'Pandas DataFrames', 'GroupBy & Agg'],
        xpReward: 400,
        state: 'locked',
        description: 'The Dual Tracks unite: vectorized data manipulation at scale.',
      },
    },
    {
      id: 'node-f',
      type: 'skillNode',
      position: { x: 550, y: 800 },
      data: {
        title: 'Calculus & Gradients',
        level: 'Level 2 • Optimization',
        track: 'math',
        microSkills: ['Derivatives', 'Chain Rule', 'Gradient Descent'],
        xpReward: 350,
        state: 'locked',
        description: 'The engine of machine learning: optimizing loss landscapes.',
      },
    },

    // ═══ LEVEL 3 (MACHINE LEARNING & DISCOVERY) ═══
    {
      id: 'node-g',
      type: 'skillNode',
      position: { x: -100, y: 450 },
      data: {
        title: 'EDA & Visualization',
        level: 'Level 3 • Discovery',
        track: 'applied',
        microSkills: ['Matplotlib & Seaborn', 'Feature Scaling', 'Encoding'],
        xpReward: 300,
        state: 'locked',
        description: 'Visual intelligence: extracting signal from noise through data storytelling.',
      },
    },
    {
      id: 'node-h',
      type: 'skillNode',
      position: { x: 300, y: 450 },
      data: {
        title: 'Supervised Learning',
        level: 'Level 3 • Prediction',
        track: 'ml',
        microSkills: ['Linear/Logistic Reg', 'Decision Trees', 'XGBoost'],
        xpReward: 500,
        state: 'locked',
        description: 'Predictive algorithms: classification, regression, and ensemble mastery.',
      },
    },
    {
      id: 'node-i',
      type: 'skillNode',
      position: { x: 700, y: 450 },
      data: {
        title: 'Unsupervised & Eval',
        level: 'Level 3 • Structure',
        track: 'ml',
        microSkills: ['K-Means Clustering', 'PCA', 'Confusion Matrix'],
        xpReward: 450,
        state: 'locked',
        description: 'Discovering hidden patterns and evaluating model performance.',
      },
    },

    // ═══ LEVEL 4 (THE APEX BOSS) ═══
    {
      id: 'node-j',
      type: 'skillNode',
      position: { x: 300, y: 100 },
      data: {
        title: 'Deep Learning',
        level: 'Level 4 • The Apex Boss',
        track: 'apex',
        microSkills: ['PyTorch Autograd', 'CNNs', 'Transformers'],
        xpReward: 800,
        state: 'locked',
        description: 'THE APEX CHALLENGE: Multi-billion parameter neural architectures.',
        isApex: true,
      },
    },

    // ═══ LEVEL 5 (THE SUMMIT) ═══
    {
      id: 'node-k',
      type: 'skillNode',
      position: { x: 300, y: -250 },
      data: {
        title: 'Local AI & LLMs',
        level: 'Level 5 • The Summit',
        track: 'summit',
        microSkills: ['Ollama Runtime', 'RAG Systems', 'Electron IPC', 'AI Agents'],
        xpReward: 1200,
        state: 'locked',
        description: 'THE ULTIMATE SUMMIT: Autonomous on-device AI agents and LLM orchestration.',
        isSummit: true,
      },
    },
  ],

  edges: [
    // Level 0 → Level 1
    { id: 'e-a-c', source: 'node-a', target: 'node-c', type: 'smoothstep', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' } },
    { id: 'e-b-d', source: 'node-b', target: 'node-d', type: 'smoothstep', animated: true, style: { stroke: '#fb7185', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' } },

    // Level 1 → Level 2
    { id: 'e-c-e', source: 'node-c', target: 'node-e', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-d-e', source: 'node-d', target: 'node-e', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-d-f', source: 'node-d', target: 'node-f', type: 'smoothstep', animated: true, style: { stroke: '#fb7185', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' } },

    // Level 2 → Level 3
    { id: 'e-e-g', source: 'node-e', target: 'node-g', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-e-h', source: 'node-e', target: 'node-h', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-f-h', source: 'node-f', target: 'node-h', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-e-i', source: 'node-e', target: 'node-i', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-f-i', source: 'node-f', target: 'node-i', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },

    // Level 3 → Level 4 (Apex Boss)
    { id: 'e-g-j', source: 'node-g', target: 'node-j', type: 'smoothstep', animated: true, style: { stroke: '#dc2626', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' } },
    { id: 'e-h-j', source: 'node-h', target: 'node-j', type: 'smoothstep', animated: true, style: { stroke: '#dc2626', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' } },
    { id: 'e-i-j', source: 'node-i', target: 'node-j', type: 'smoothstep', animated: true, style: { stroke: '#dc2626', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' } },

    // Level 4 → Level 5 (Summit)
    { id: 'e-j-k', source: 'node-j', target: 'node-k', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
  ],
};

export default function SkillTreePage() {
  return (
    <SkillTreeBase
      treeData={DATA_SCIENCE_SKILL_TREE}
      title="Data Science"
      TitleIcon={<FaBrain />}
      accentColor="#38bdf8"
      BossIcon={<FaCrown />}
    />
  );
}
