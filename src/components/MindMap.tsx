'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './MindMap.module.css';

type NodeData = {
  id: string;
  label: string;
  children?: NodeData[];
};

const mapData: NodeData = {
  id: 'root',
  label: 'Sanat Vats Profile',
  children: [
    {
      id: 'summary',
      label: 'Professional Summary',
      children: [
        { id: 'sum1', label: 'Data & AI Executive' },
        { id: 'sum2', label: '20+ Years Experience' },
        { id: 'sum3', label: 'Enterprise Scale Transformation' },
        { id: 'sum4', label: 'Global Team Leadership' }
      ]
    },
    {
      id: 'competencies',
      label: 'Core Competencies',
      children: [
        {
          id: 'ai-analytics',
          label: 'AI & Analytics',
          children: [
            { id: 'genai', label: 'Generative AI & LLMs' },
            { id: 'agentic', label: 'Agentic AI' },
            { id: 'predictive', label: 'Predictive Modeling' }
          ]
        },
        {
          id: 'data-strategy',
          label: 'Data Strategy',
          children: [
            { id: 'gov', label: 'Data Governance' },
            { id: 'mdm', label: 'Master Data Management' },
            { id: 'monetize', label: 'Data Monetization' }
          ]
        },
        {
          id: 'platforms',
          label: 'Platforms',
          children: [
            { id: 'azure', label: 'Azure' },
            { id: 'databricks', label: 'Databricks' },
            { id: 'gcp', label: 'GCP' }
          ]
        }
      ]
    },
    { 
      id: 'exp', 
      label: 'Professional Experience',
      children: [
        {
          id: 'ey',
          label: 'EY (2012–Present)',
          children: [
            { id: 'ey1', label: 'Senior Director AI & Data' },
            { id: 'ey2', label: 'P&L Management ($5-10M)' },
            { id: 'ey3', label: 'Enterprise AI/ML Adoption' }
          ]
        },
        {
          id: 'del',
          label: 'Deloitte Consulting (2011–2012)',
          children: [
            { id: 'del1', label: 'Hyperion DRM Solutions' },
            { id: 'del2', label: 'Metadata Management' }
          ]
        },
        {
          id: 'inf',
          label: 'Infosys (2005–2011)',
          children: [
            { id: 'inf1', label: 'Financial Transformation' },
            { id: 'inf2', label: 'Global Delivery Model' }
          ]
        }
      ]
    },
    {
      id: 'skills',
      label: 'Technical Skills',
      children: [
        {
          id: 'data-sci',
          label: 'Data Science',
          children: [
            { id: 'py', label: 'Python' },
            { id: 'nn', label: 'Neural Nets & CNN' },
            { id: 'rf', label: 'Random Forest' }
          ]
        },
        {
          id: 'ent-sys',
          label: 'Enterprise Systems',
          children: [
            { id: 'oracle', label: 'Oracle ERP' },
            { id: 'sap', label: 'SAP MDG' },
            { id: 'anaplan', label: 'Anaplan' }
          ]
        }
      ]
    },
    {
      id: 'edu',
      label: 'Education',
      children: [
        { id: 'edu1', label: 'MIT Applied Data Science' },
        { id: 'edu2', label: 'MBA' },
        { id: 'edu3', label: 'Bachelor of Engineering' }
      ]
    },
    {
      id: 'clients',
      label: 'Notable Clients',
      children: [
        { id: 'cl1', label: 'NVIDIA' },
        { id: 'cl2', label: 'Microsoft' },
        { id: 'cl3', label: 'Kraft Foods' },
        { id: 'cl4', label: 'General Motors' }
      ]
    }
  ]
};

function MapNode({ node, isRoot = false }: { node: NodeData, isRoot?: boolean }) {
  const [expanded, setExpanded] = useState(node.id === 'root' || node.id === 'exp');
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={styles.nodeWrapper}>
      <div 
        className={`${styles.nodeCard} ${isRoot ? styles.rootCard : ''}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <span className={styles.nodeLabel}>{node.label}</span>
        {hasChildren && (
          <div className={styles.iconCircle}>
            {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div className={styles.childrenBranch}>
          {node.children!.map((child) => (
            <div key={child.id} className={styles.childContainer}>
              <MapNode node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MindMap() {
  return (
    <div className={`glass-panel ${styles.mindMapContainer}`}>
      <div className={styles.header}>
        <h3 className="text-gradient">Interactive Interactive Mind Map</h3>
        <p className={styles.subtitle}>Explore the NotebookLM-style structure of my profile</p>
      </div>
      <div className={styles.mapCanvas}>
        <MapNode node={mapData} isRoot={true} />
      </div>
    </div>
  );
}
