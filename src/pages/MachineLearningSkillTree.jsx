import { FaRobot } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const ML_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 (BOTTOM - FOUNDATIONS) ═══
    { id: 'ml-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'Supervised Learning', level: 'Level 0 • Foundation', track: 'network', microSkills: ['Linear Regression', 'Logistic Regression', 'Train/Test Split'], xpReward: 150, state: 'available', description: 'Master supervised learning algorithms with labeled training data.' } },
    { id: 'ml-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Feature Engineering', level: 'Level 0 • Data Prep', track: 'network', microSkills: ['Scaling & Normalization', 'Encoding Categorical Data', 'Feature Selection'], xpReward: 150, state: 'available', description: 'Transform raw data into meaningful features for ML models.' } },
    // ═══ LEVEL 1 (CLASSIFICATION & REGRESSION) ═══
    { id: 'ml-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'Decision Trees', level: 'Level 1 • Classification', track: 'web', microSkills: ['Tree Splitting', 'Entropy & Gini', 'Pruning'], xpReward: 250, state: 'locked', description: 'Build interpretable tree-based classification models.' } },
    { id: 'ml-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'Support Vector Machines', level: 'Level 1 • SVM', track: 'web', microSkills: ['Kernel Trick', 'Margin Optimization', 'Hyperplanes'], xpReward: 250, state: 'locked', description: 'Powerful classification with support vector machines.' } },
    // ═══ LEVEL 2 (ENSEMBLE METHODS) ═══
    { id: 'ml-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Random Forests', level: 'Level 2 • Ensemble', track: 'convergence', microSkills: ['Bagging', 'Bootstrap Sampling', 'Feature Importance'], xpReward: 400, state: 'locked', description: 'Combine multiple decision trees for robust predictions.' } },
    { id: 'ml-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'Gradient Boosting', level: 'Level 2 • Boosting', track: 'convergence', microSkills: ['XGBoost', 'LightGBM', 'AdaBoost'], xpReward: 350, state: 'locked', description: 'Sequential ensemble learning with gradient boosting.' } },
    { id: 'ml-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Unsupervised Learning', level: 'Level 2 • Clustering', track: 'convergence', microSkills: ['K-Means', 'DBSCAN', 'Hierarchical Clustering'], xpReward: 400, state: 'locked', description: 'Find patterns in unlabeled data with clustering algorithms.' } },
    // ═══ LEVEL 3 (ADVANCED TECHNIQUES) ═══
    { id: 'ml-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'Dimensionality Reduction', level: 'Level 3 • PCA', track: 'security', microSkills: ['PCA', 't-SNE', 'UMAP'], xpReward: 450, state: 'locked', description: 'Reduce feature space while preserving information.' } },
    { id: 'ml-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Model Evaluation', level: 'Level 3 • Metrics', track: 'security', microSkills: ['Confusion Matrix', 'ROC-AUC', 'Cross-Validation'], xpReward: 450, state: 'locked', description: 'Evaluate and compare model performance with proper metrics.' } },
    { id: 'ml-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'Hyperparameter Tuning', level: 'Level 3 • Optimization', track: 'security', microSkills: ['Grid Search', 'Random Search', 'Bayesian Optimization'], xpReward: 500, state: 'locked', description: 'Optimize model hyperparameters for best performance.' } },
    // ═══ LEVEL 4 (APEX - ADVANCED ML) ═══
    { id: 'ml-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'ML System Design', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['AutoML & Neural Architecture Search', 'Feature Stores', 'Model Monitoring & Drift Detection', 'A/B Testing', 'MLOps Pipeline'], xpReward: 1000, state: 'locked', description: 'Build production-grade ML systems with MLOps best practices.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'ml-a', target: 'ml-c', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-b-d', source: 'ml-b', target: 'ml-d', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-c-e', source: 'ml-c', target: 'ml-e', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-c-f', source: 'ml-c', target: 'ml-f', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-d-f', source: 'ml-d', target: 'ml-f', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-d-g', source: 'ml-d', target: 'ml-g', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-e-h', source: 'ml-e', target: 'ml-h', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-e-i', source: 'ml-e', target: 'ml-i', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-f-i', source: 'ml-f', target: 'ml-i', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-g-j', source: 'ml-g', target: 'ml-j', type: 'smoothstep', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
    { id: 'e-h-boss', source: 'ml-h', target: 'ml-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'ml-i', target: 'ml-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'ml-j', target: 'ml-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function MachineLearningSkillTree() {
  return (
    <SkillTreeBase
      treeData={ML_SKILL_TREE}
      title="Machine Learning"
      TitleIcon={<FaRobot />}
      accentColor="#ec4899"
      BossIcon={<FaRobot />}
    />
  );
}
