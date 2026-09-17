import { FaBrain } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const DEEP_LEARNING_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 ═══
    { id: 'dl-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'Neural Network Basics', level: 'Level 0 • Foundation', track: 'network', microSkills: ['Perceptron', 'Activation Functions', 'Forward Propagation'], xpReward: 150, state: 'available', description: 'Foundation of deep learning: understand basic neural network architecture.' } },
    { id: 'dl-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Backpropagation', level: 'Level 0 • Training', track: 'network', microSkills: ['Gradient Descent', 'Chain Rule', 'Weight Updates'], xpReward: 150, state: 'available', description: 'Learn how neural networks learn through backpropagation algorithm.' } },
    // ═══ LEVEL 1 ═══
    { id: 'dl-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'Loss Functions', level: 'Level 1 • Optimization', track: 'web', microSkills: ['MSE Loss', 'Cross-Entropy', 'Regularization'], xpReward: 250, state: 'locked', description: 'Master different loss functions for various deep learning tasks.' } },
    { id: 'dl-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'Optimizers', level: 'Level 1 • Algorithms', track: 'web', microSkills: ['SGD', 'Adam', 'Learning Rate Scheduling'], xpReward: 250, state: 'locked', description: 'Advanced optimization algorithms for faster convergence.' } },
    // ═══ LEVEL 2 ═══
    { id: 'dl-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Convolutional Networks', level: 'Level 2 • CNNs', track: 'convergence', microSkills: ['Conv Layers', 'Pooling', 'Image Classification'], xpReward: 400, state: 'locked', description: 'Deep learning for computer vision with convolutional neural networks.' } },
    { id: 'dl-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'Recurrent Networks', level: 'Level 2 • RNNs', track: 'convergence', microSkills: ['LSTM', 'GRU', 'Sequence Modeling'], xpReward: 350, state: 'locked', description: 'Sequential data processing with recurrent neural networks.' } },
    { id: 'dl-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Attention Mechanisms', level: 'Level 2 • Attention', track: 'convergence', microSkills: ['Self-Attention', 'Multi-Head Attention', 'Positional Encoding'], xpReward: 400, state: 'locked', description: 'Revolutionary attention mechanisms that power modern transformers.' } },
    // ═══ LEVEL 3 ═══
    { id: 'dl-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'Transfer Learning', level: 'Level 3 • Pretrained', track: 'security', microSkills: ['Fine-tuning', 'Feature Extraction', 'Domain Adaptation'], xpReward: 450, state: 'locked', description: 'Leverage pre-trained models for faster and better results.' } },
    { id: 'dl-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Generative Models', level: 'Level 3 • Generation', track: 'security', microSkills: ['GANs', 'VAEs', 'Diffusion Models'], xpReward: 450, state: 'locked', description: 'Create new data with generative adversarial networks and VAEs.' } },
    { id: 'dl-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'Model Deployment', level: 'Level 3 • Production', track: 'security', microSkills: ['ONNX', 'TensorRT', 'Model Optimization'], xpReward: 500, state: 'locked', description: 'Deploy deep learning models to production environments.' } },
    // ═══ LEVEL 4 (APEX) ═══
    { id: 'dl-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'Transformer Architecture', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['BERT & GPT Models', 'Vision Transformers', 'Multimodal Learning', 'Large Language Models', 'Prompt Engineering'], xpReward: 1000, state: 'locked', description: 'Master transformer architecture: the foundation of modern AI.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'dl-a', target: 'dl-c', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-b-d', source: 'dl-b', target: 'dl-d', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-c-e', source: 'dl-c', target: 'dl-e', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-c-f', source: 'dl-c', target: 'dl-f', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-d-f', source: 'dl-d', target: 'dl-f', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-d-g', source: 'dl-d', target: 'dl-g', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-e-h', source: 'dl-e', target: 'dl-h', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-e-i', source: 'dl-e', target: 'dl-i', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-f-i', source: 'dl-f', target: 'dl-i', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-g-j', source: 'dl-g', target: 'dl-j', type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' } },
    { id: 'e-h-boss', source: 'dl-h', target: 'dl-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'dl-i', target: 'dl-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'dl-j', target: 'dl-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function DeepLearningSkillTree() {
  return (
    <SkillTreeBase
      treeData={DEEP_LEARNING_SKILL_TREE}
      title="Deep Learning"
      TitleIcon={<FaBrain />}
      accentColor="#a855f7"
      BossIcon={<FaBrain />}
    />
  );
}
