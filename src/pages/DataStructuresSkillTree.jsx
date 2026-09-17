import { FaProjectDiagram } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const DS_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 (BOTTOM - FOUNDATIONS) ═══
    { id: 'ds-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'Arrays & Lists', level: 'Level 0 • Foundation', track: 'network', microSkills: ['Arrays', 'Linked Lists', 'Dynamic Arrays'], xpReward: 150, state: 'available', description: 'Foundation of data structures: linear collections of elements.' } },
    { id: 'ds-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Stacks & Queues', level: 'Level 0 • Linear', track: 'network', microSkills: ['Stack Operations', 'Queue Operations', 'Deque'], xpReward: 150, state: 'available', description: 'Essential linear data structures with specific access patterns.' } },
    // ═══ LEVEL 1 (HASH & SEARCH) ═══
    { id: 'ds-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'Hash Tables', level: 'Level 1 • Hashing', track: 'web', microSkills: ['Hash Functions', 'Collision Resolution', 'Hash Maps'], xpReward: 250, state: 'locked', description: 'Fast key-value lookups using hash-based data structures.' } },
    { id: 'ds-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'Binary Search Trees', level: 'Level 1 • Trees', track: 'web', microSkills: ['BST Operations', 'Tree Traversal', 'Balanced Trees'], xpReward: 250, state: 'locked', description: 'Hierarchical data structures for efficient searching and sorting.' } },
    // ═══ LEVEL 2 (ADVANCED TREES) ═══
    { id: 'ds-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Heaps & Priority Queues', level: 'Level 2 • Heaps', track: 'convergence', microSkills: ['Min/Max Heap', 'Heap Operations', 'Priority Queues'], xpReward: 400, state: 'locked', description: 'Specialized trees for maintaining priority-based collections.' } },
    { id: 'ds-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'AVL & Red-Black Trees', level: 'Level 2 • Balanced', track: 'convergence', microSkills: ['AVL Trees', 'Red-Black Trees', 'Self-Balancing'], xpReward: 350, state: 'locked', description: 'Self-balancing binary search trees with guaranteed performance.' } },
    { id: 'ds-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Tries & Suffix Trees', level: 'Level 2 • String DS', track: 'convergence', microSkills: ['Trie Operations', 'Suffix Trees', 'Pattern Matching'], xpReward: 400, state: 'locked', description: 'Specialized trees for efficient string operations and searching.' } },
    // ═══ LEVEL 3 (GRAPHS & ADVANCED) ═══
    { id: 'ds-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'Graph Structures', level: 'Level 3 • Graphs', track: 'security', microSkills: ['Adjacency Lists', 'Adjacency Matrix', 'Graph Representation'], xpReward: 450, state: 'locked', description: 'Represent and manipulate complex relationships with graphs.' } },
    { id: 'ds-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Disjoint Sets', level: 'Level 3 • Union-Find', track: 'security', microSkills: ['Union-Find', 'Path Compression', 'Connected Components'], xpReward: 450, state: 'locked', description: 'Efficient algorithms for managing disjoint set operations.' } },
    { id: 'ds-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'Segment Trees', level: 'Level 3 • Range Queries', track: 'security', microSkills: ['Segment Trees', 'Fenwick Trees', 'Range Updates'], xpReward: 500, state: 'locked', description: 'Advanced trees for efficient range query operations.' } },
    // ═══ LEVEL 4 (APEX) ═══
    { id: 'ds-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'Advanced Algorithms', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['Dynamic Programming', 'Graph Algorithms', 'Greedy Algorithms', 'Complexity Analysis', 'Algorithm Design'], xpReward: 1000, state: 'locked', description: 'Master advanced algorithmic techniques and problem-solving strategies.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'ds-a', target: 'ds-c', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-b-d', source: 'ds-b', target: 'ds-d', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-c-e', source: 'ds-c', target: 'ds-e', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-c-f', source: 'ds-c', target: 'ds-f', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-d-f', source: 'ds-d', target: 'ds-f', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-d-g', source: 'ds-d', target: 'ds-g', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-e-h', source: 'ds-e', target: 'ds-h', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-e-i', source: 'ds-e', target: 'ds-i', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-f-i', source: 'ds-f', target: 'ds-i', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-g-j', source: 'ds-g', target: 'ds-j', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
    { id: 'e-h-boss', source: 'ds-h', target: 'ds-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'ds-i', target: 'ds-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'ds-j', target: 'ds-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function DataStructuresSkillTree() {
  return (
    <SkillTreeBase
      treeData={DS_SKILL_TREE}
      title="Data Structures"
      TitleIcon={<FaProjectDiagram />}
      accentColor="#8b5cf6"
      BossIcon={<FaProjectDiagram />}
    />
  );
}
