"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Network } from "lucide-react";
import styles from "./ExecutiveTree.module.css";

type TreeNode = {
  id: string;
  label: string;
  detail?: string;
  children?: TreeNode[];
};

const treeData: TreeNode = {
  id: "root",
  label: "AI Enablement Engineering Director",
  detail: "Agentic AI adoption across engineering and enterprise workflows",
  children: [
    {
      id: "roadmap",
      label: "AI Enablement Roadmap",
      detail: "AI trends, use-case strategy, adoption roadmap",
      children: [
        { id: "insights", label: "Industry AI Insights" },
        { id: "use-cases", label: "Use-Case Portfolio" },
        { id: "adoption", label: "Adoption Governance" },
      ],
    },
    {
      id: "agentic",
      label: "Agentic Development Platform",
      detail: "LLMs, ML, autonomous workflows, evaluation loops",
      children: [
        { id: "agentic-workflows", label: "Agentic Workflows" },
        { id: "llm-toolchains", label: "LLM Toolchains" },
        { id: "quality", label: "Evaluation & Quality" },
      ],
    },
    {
      id: "developer-tools",
      label: "Developer Productivity Tools",
      detail: "Tools, services, and blueprints for AI developers",
      children: [
        { id: "blueprints", label: "Reusable Blueprints" },
        { id: "automation", label: "Workflow Automation" },
        { id: "services", label: "Internal AI Services" },
      ],
    },
    {
      id: "data",
      label: "AI-Ready Enterprise Data",
      detail: "Trusted data, knowledge graphs, cloud platforms",
      children: [
        { id: "foundations", label: "Data Foundations" },
        { id: "graphs", label: "Knowledge Graphs" },
        { id: "access", label: "Governed Access" },
      ],
    },
    {
      id: "execution",
      label: "Cross-Org Execution",
      detail: "Leaders, developers, partners, fast delivery",
      children: [
        { id: "stakeholders", label: "Stakeholder Alignment" },
        { id: "team-enablement", label: "Team Enablement" },
        { id: "speed", label: "Speed of Execution" },
      ],
    },
  ],
};

function TreeNodeCard({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) {
  const [expanded, setExpanded] = useState(isRoot || node.id === "roadmap" || node.id === "agentic");
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className={styles.nodeWrapper}>
      <button
        type="button"
        className={`${styles.nodeCard} ${isRoot ? styles.rootCard : ""}`}
        onClick={() => hasChildren && setExpanded((current) => !current)}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        <span className={styles.nodeLabel}>{node.label}</span>
        {node.detail && <span className={styles.nodeDetail}>{node.detail}</span>}
        {hasChildren && <span className={styles.iconCircle}>{expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}</span>}
      </button>

      {hasChildren && expanded && (
        <div className={styles.childrenBranch}>
          {node.children?.map((child) => (
            <div key={child.id} className={styles.childContainer}>
              <TreeNodeCard node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExecutiveTree() {
  return (
    <section id="architecture-tree" className={styles.treeSection}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <Network size={16} />
          AI Enablement Architecture Tree
        </p>
        <h2>How the profile connects AI strategy, agentic systems, tools, and cross-org adoption</h2>
      </div>
      <div className={styles.mapCanvas}>
        <TreeNodeCard node={treeData} isRoot />
      </div>
    </section>
  );
}
