import { FaDatabase } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const SQL_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 ═══
    { id: 'sql-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'SQL Basics', level: 'Level 0 • Foundation', track: 'network', microSkills: ['SELECT Queries', 'WHERE Clauses', 'ORDER BY'], xpReward: 150, state: 'available', description: 'Master fundamental SQL query syntax and structure.' } },
    { id: 'sql-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Data Types & Tables', level: 'Level 0 • Schema', track: 'network', microSkills: ['CREATE TABLE', 'Data Types', 'PRIMARY KEY'], xpReward: 150, state: 'available', description: 'Design database tables with proper data types and constraints.' } },
    // ═══ LEVEL 1 ═══
    { id: 'sql-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'JOINs & Relations', level: 'Level 1 • Relationships', track: 'web', microSkills: ['INNER JOIN', 'LEFT/RIGHT JOIN', 'Foreign Keys'], xpReward: 250, state: 'locked', description: 'Combine data from multiple tables using JOIN operations.' } },
    { id: 'sql-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'Aggregate Functions', level: 'Level 1 • Analytics', track: 'web', microSkills: ['COUNT, SUM, AVG', 'GROUP BY', 'HAVING'], xpReward: 250, state: 'locked', description: 'Perform calculations and summaries on grouped data.' } },
    // ═══ LEVEL 2 ═══
    { id: 'sql-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Subqueries', level: 'Level 2 • Advanced', track: 'convergence', microSkills: ['Nested SELECT', 'Correlated Subqueries', 'EXISTS'], xpReward: 400, state: 'locked', description: 'Write complex queries with nested SELECT statements.' } },
    { id: 'sql-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'Window Functions', level: 'Level 2 • Analytics', track: 'convergence', microSkills: ['ROW_NUMBER', 'RANK', 'PARTITION BY'], xpReward: 350, state: 'locked', description: 'Advanced analytics with window functions and partitions.' } },
    { id: 'sql-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Indexing', level: 'Level 2 • Performance', track: 'convergence', microSkills: ['CREATE INDEX', 'B-Tree', 'Query Optimization'], xpReward: 400, state: 'locked', description: 'Optimize query performance with strategic indexing.' } },
    // ═══ LEVEL 3 ═══
    { id: 'sql-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'Transactions', level: 'Level 3 • ACID', track: 'security', microSkills: ['BEGIN/COMMIT', 'ROLLBACK', 'Isolation Levels'], xpReward: 450, state: 'locked', description: 'Ensure data consistency with transaction management.' } },
    { id: 'sql-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Stored Procedures', level: 'Level 3 • Automation', track: 'security', microSkills: ['CREATE PROCEDURE', 'Parameters', 'Control Flow'], xpReward: 450, state: 'locked', description: 'Create reusable database logic with stored procedures.' } },
    { id: 'sql-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'Database Design', level: 'Level 3 • Architecture', track: 'security', microSkills: ['Normalization', 'ER Diagrams', 'Schema Design'], xpReward: 500, state: 'locked', description: 'Design scalable and efficient database architectures.' } },
    // ═══ LEVEL 4 (APEX) ═══
    { id: 'sql-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'Database Engineering', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['Query Optimization', 'Replication & Sharding', 'NoSQL vs SQL', 'Data Warehousing', 'ETL Pipelines'], xpReward: 1000, state: 'locked', description: 'Master database engineering: from query optimization to distributed systems.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'sql-a', target: 'sql-c', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-b-d', source: 'sql-b', target: 'sql-d', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-c-e', source: 'sql-c', target: 'sql-e', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-c-f', source: 'sql-c', target: 'sql-f', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-d-f', source: 'sql-d', target: 'sql-f', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-d-g', source: 'sql-d', target: 'sql-g', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-e-h', source: 'sql-e', target: 'sql-h', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-e-i', source: 'sql-e', target: 'sql-i', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-f-i', source: 'sql-f', target: 'sql-i', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-g-j', source: 'sql-g', target: 'sql-j', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e-h-boss', source: 'sql-h', target: 'sql-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'sql-i', target: 'sql-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'sql-j', target: 'sql-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function SQLSkillTree() {
  return (
    <SkillTreeBase
      treeData={SQL_SKILL_TREE}
      title="SQL & Databases"
      TitleIcon={<FaDatabase />}
      accentColor="#3b82f6"
      BossIcon={<FaDatabase />}
    />
  );
}
