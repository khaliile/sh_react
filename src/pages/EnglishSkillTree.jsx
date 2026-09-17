import { FaLanguage } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const ENGLISH_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 (BOTTOM - FOUNDATIONS) ═══
    {
      id: 'eng-a',
      type: 'skillNode',
      position: { x: 50, y: 1200 },
      data: {
        title: 'Grammar Fundamentals',
        level: 'Level 0 • Foundation',
        track: 'network',
        microSkills: ['Parts of Speech', 'Sentence Structures', 'Phonetics & Pronunciation'],
        xpReward: 150,
        state: 'available',
        description: 'Master core English mechanics: parts of speech, syntax, and foundational sentence structure.'
      }
    },
    {
      id: 'eng-b',
      type: 'skillNode',
      position: { x: 550, y: 1200 },
      data: {
        title: 'Core Vocabulary',
        level: 'Level 0 • Lexicon',
        track: 'network',
        microSkills: ['High-Frequency Words', 'Roots, Prefixes & Suffixes', 'Context Clues'],
        xpReward: 150,
        state: 'available',
        description: 'Build a solid vocabulary foundation using etymology, morphemes, and word families.'
      }
    },

    // ═══ LEVEL 1 (APPLIED MECHANICS) ═══
    {
      id: 'eng-c',
      type: 'skillNode',
      position: { x: 50, y: 900 },
      data: {
        title: 'Advanced Tenses & Clauses',
        level: 'Level 1 • Syntax',
        track: 'web',
        microSkills: ['Perfect & Continuous Tenses', 'Conditionals (0-3)', 'Relative & Adverbial Clauses'],
        xpReward: 250,
        state: 'locked',
        description: 'Master complex verbal aspects, subjunctive mood, and sophisticated clause structures.'
      }
    },
    {
      id: 'eng-d',
      type: 'skillNode',
      position: { x: 550, y: 900 },
      data: {
        title: 'Critical Reading & Analysis',
        level: 'Level 1 • Comprehension',
        track: 'web',
        microSkills: ['Skimming & Scanning', 'Inference & Tone Detection', 'Academic Text Deconstruction'],
        xpReward: 250,
        state: 'locked',
        description: 'Analyze complex articles, essays, and literature with rapid comprehension.'
      }
    },

    // ═══ LEVEL 2 (COMMUNICATION & WRITING) ═══
    {
      id: 'eng-e',
      type: 'skillNode',
      position: { x: -100, y: 600 },
      data: {
        title: 'Essay & Academic Writing',
        level: 'Level 2 • Composition',
        track: 'convergence',
        microSkills: ['Thesis Statements', 'Paragraph Cohesion', 'Argumentative Structure'],
        xpReward: 400,
        state: 'locked',
        description: 'Write clear, compelling essays with rigorous logical flow and transitional devices.'
      }
    },
    {
      id: 'eng-f',
      type: 'skillNode',
      position: { x: 300, y: 600 },
      data: {
        title: 'Conversational Fluency',
        level: 'Level 2 • Speech',
        track: 'convergence',
        microSkills: ['Idioms & Phrasal Verbs', 'Natural Cadence', 'Active Listening Responses'],
        xpReward: 350,
        state: 'locked',
        description: 'Speak spontaneously and comfortably in diverse social and professional discussions.'
      }
    },
    {
      id: 'eng-g',
      type: 'skillNode',
      position: { x: 700, y: 600 },
      data: {
        title: 'Professional & Business English',
        level: 'Level 2 • Business',
        track: 'convergence',
        microSkills: ['Executive Emailing', 'Presentation Delivery', 'Negotiation Phrasing'],
        xpReward: 400,
        state: 'locked',
        description: 'Communicate with authority in corporate, startup, and global business settings.'
      }
    },

    // ═══ LEVEL 3 (ADVANCED RHETORIC & ORATORY) ═══
    {
      id: 'eng-h',
      type: 'skillNode',
      position: { x: -100, y: 300 },
      data: {
        title: 'Rhetoric & Persuasion',
        level: 'Level 3 • Rhetoric',
        track: 'security',
        microSkills: ['Ethos, Pathos & Logos', 'Figurative Language', 'Persuasive Speech Writing'],
        xpReward: 450,
        state: 'locked',
        description: 'Harness classical and modern rhetorical devices to persuade, inspire, and lead.'
      }
    },
    {
      id: 'eng-i',
      type: 'skillNode',
      position: { x: 300, y: 300 },
      data: {
        title: 'Technical & Research Writing',
        level: 'Level 3 • Technical',
        track: 'security',
        microSkills: ['Abstracts & Lit Reviews', 'Formal Precision', 'Technical Documentation'],
        xpReward: 450,
        state: 'locked',
        description: 'Write clear, rigorous scientific papers, technical reports, and documentation.'
      }
    },
    {
      id: 'eng-j',
      type: 'skillNode',
      position: { x: 700, y: 300 },
      data: {
        title: 'Public Speaking & Intonation',
        level: 'Level 3 • Oratory',
        track: 'security',
        microSkills: ['Stress & Pitch Modulation', 'Impromptu Speaking', 'Audience Engagement'],
        xpReward: 500,
        state: 'locked',
        description: 'Deliver engaging keynotes and impromptu speeches with clear pronunciation and presence.'
      }
    },

    // ═══ LEVEL 4 (APEX BOSS) ═══
    {
      id: 'eng-boss',
      type: 'skillNode',
      position: { x: 250, y: -70 },
      data: {
        title: 'English Mastery Apex',
        level: 'Level 4 • APEX BOSS',
        track: 'boss',
        microSkills: ['Native-Level Fluency', 'Master Oratory', 'Scholarly Writing', 'Spontaneous Debate', 'Nuanced Literary Analysis'],
        xpReward: 1000,
        state: 'locked',
        description: 'Complete mastery of the English language across speaking, writing, and high-stakes communication.'
      }
    },
  ],
  edges: [
    { id: 'e-a-c', source: 'eng-a', target: 'eng-c', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-b-d', source: 'eng-b', target: 'eng-d', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-c-e', source: 'eng-c', target: 'eng-e', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-c-f', source: 'eng-c', target: 'eng-f', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-d-f', source: 'eng-d', target: 'eng-f', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-d-g', source: 'eng-d', target: 'eng-g', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-e-h', source: 'eng-e', target: 'eng-h', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-e-i', source: 'eng-e', target: 'eng-i', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-f-i', source: 'eng-f', target: 'eng-i', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-g-j', source: 'eng-g', target: 'eng-j', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-h-boss', source: 'eng-h', target: 'eng-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'eng-i', target: 'eng-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'eng-j', target: 'eng-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function EnglishSkillTree() {
  return (
    <SkillTreeBase
      treeData={ENGLISH_SKILL_TREE}
      title="English Mastery"
      TitleIcon={<FaLanguage />}
      accentColor="#f59e0b"
      BossIcon={<FaLanguage />}
    />
  );
}
