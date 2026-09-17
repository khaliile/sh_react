import { FaCalculator } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const MATH_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 (BOTTOM - FOUNDATIONS) ═══
    { id: 'math-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'Linear Algebra', level: 'Level 0 • Foundation', track: 'network', microSkills: ['Vectors', 'Matrices', 'Matrix Operations'], xpReward: 150, state: 'available', description: 'Foundation of computational mathematics: vectors, matrices, and transformations.' } },
    { id: 'math-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Calculus', level: 'Level 0 • Analysis', track: 'network', microSkills: ['Derivatives', 'Integrals', 'Limits'], xpReward: 150, state: 'available', description: 'Mathematical analysis: understand change and accumulation through calculus.' } },
    // ═══ LEVEL 1 (ADVANCED MATH) ═══
    { id: 'math-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'Eigenvalues & Decomposition', level: 'Level 1 • Advanced LA', track: 'web', microSkills: ['Eigenvalues', 'Eigenvectors', 'SVD'], xpReward: 250, state: 'locked', description: 'Advanced linear algebra: eigendecomposition and singular value decomposition.' } },
    { id: 'math-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'Multivariable Calculus', level: 'Level 1 • Higher Calc', track: 'web', microSkills: ['Partial Derivatives', 'Gradients', 'Jacobians'], xpReward: 250, state: 'locked', description: 'Calculus in multiple dimensions: essential for optimization.' } },
    // ═══ LEVEL 2 (APPLIED MATH) ═══
    { id: 'math-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Probability Theory', level: 'Level 2 • Probability', track: 'convergence', microSkills: ['Random Variables', 'Distributions', 'Bayes Theorem'], xpReward: 400, state: 'locked', description: 'Foundation of uncertainty: probability distributions and statistical inference.' } },
    { id: 'math-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'Optimization', level: 'Level 2 • Optimization', track: 'convergence', microSkills: ['Gradient Descent', 'Convex Optimization', 'Constraints'], xpReward: 350, state: 'locked', description: 'Find optimal solutions using mathematical optimization techniques.' } },
    { id: 'math-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Numerical Methods', level: 'Level 2 • Computation', track: 'convergence', microSkills: ['Numerical Integration', 'Root Finding', 'Approximation'], xpReward: 400, state: 'locked', description: 'Computational approaches to solving complex mathematical problems.' } },
    // ═══ LEVEL 3 (SPECIALIZED) ═══
    { id: 'math-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'Information Theory', level: 'Level 3 • Information', track: 'security', microSkills: ['Entropy', 'Mutual Information', 'KL Divergence'], xpReward: 450, state: 'locked', description: 'Measure and quantify information using information theory.' } },
    { id: 'math-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Graph Theory', level: 'Level 3 • Graphs', track: 'security', microSkills: ['Graph Algorithms', 'Network Analysis', 'Shortest Paths'], xpReward: 450, state: 'locked', description: 'Mathematical study of networks and relationships.' } },
    { id: 'math-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'Signal Processing', level: 'Level 3 • Signals', track: 'security', microSkills: ['Fourier Transform', 'Convolution', 'Frequency Domain'], xpReward: 500, state: 'locked', description: 'Analyze and manipulate signals using mathematical transformations.' } },
    // ═══ LEVEL 4 (APEX - ADVANCED TOPICS) ═══
    { id: 'math-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'Mathematical ML', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['Statistical Learning Theory', 'Kernel Methods', 'Tensor Calculus', 'Variational Methods', 'Stochastic Processes'], xpReward: 1000, state: 'locked', description: 'Master the mathematics behind modern machine learning.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'math-a', target: 'math-c', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-b-d', source: 'math-b', target: 'math-d', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-c-e', source: 'math-c', target: 'math-e', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-c-f', source: 'math-c', target: 'math-f', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-d-f', source: 'math-d', target: 'math-f', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-d-g', source: 'math-d', target: 'math-g', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-e-h', source: 'math-e', target: 'math-h', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-e-i', source: 'math-e', target: 'math-i', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-f-i', source: 'math-f', target: 'math-i', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-g-j', source: 'math-g', target: 'math-j', type: 'smoothstep', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
    { id: 'e-h-boss', source: 'math-h', target: 'math-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'math-i', target: 'math-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'math-j', target: 'math-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function MathSkillTree() {
  return (
    <SkillTreeBase
      treeData={MATH_SKILL_TREE}
      title="Mathematics"
      TitleIcon={<FaCalculator />}
      accentColor="#06b6d4"
      BossIcon={<FaCalculator />}
    />
  );
}
