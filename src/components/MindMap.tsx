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
    { id: 'summary', label: 'Professional Summary' },
    { id: 'competencies', label: 'Core Competencies' },
    { 
      id: 'exp', 
      label: 'Professional Experience',
      children: [
        { id: 'ey', label: 'EY (2012–Present)' },
        { id: 'del', label: 'Deloitte Consulting (2011–2012)' },
        { id: 'inf', label: 'Infosys (2005–2011)' }
      ]
    },
    { id: 'skills', label: 'Technical Skills' },
    { id: 'edu', label: 'Education' },
    { id: 'clients', label: 'Notable Clients' }
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
