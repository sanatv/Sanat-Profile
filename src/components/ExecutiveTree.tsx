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
  label: "Enterprise Data, AI & Cloud Transformation Leader",
  detail: "Executive profile architecture",
  children: [
    {
      id: "ai",
      label: "AI-Ready Enterprise",
      detail: "GenAI, agentic workflows, ML, graph analysis",
      children: [
        { id: "ai-foundations", label: "Trusted Data Foundations" },
        { id: "ai-products", label: "AI Finance Products" },
        { id: "ai-automation", label: "Agentic Automation" },
      ],
    },
    {
      id: "finance",
      label: "CFO Systems Modernization",
      detail: "FP&A, EPM, planning, forecasting, reporting",
      children: [
        { id: "planning", label: "Planning & Forecasting" },
        { id: "variance", label: "Variance Commentary" },
        { id: "traceability", label: "Finance Traceability" },
      ],
    },
    {
      id: "data",
      label: "CDO / Governance Agenda",
      detail: "MDM, stewardship, data quality, operating model",
      children: [
        { id: "mdm", label: "Master Data Management" },
        { id: "governance", label: "Governance Model" },
        { id: "quality", label: "Data Quality Rules" },
      ],
    },
    {
      id: "sap",
      label: "SAP/S4 & Supply Chain Data",
      detail: "BOM, material master, CFIN, production readiness",
      children: [
        { id: "bom", label: "BOM Architecture" },
        { id: "cfin", label: "Central Finance" },
        { id: "supply", label: "Planning Data Flow" },
      ],
    },
    {
      id: "consulting",
      label: "Consulting Leadership",
      detail: "Transformation roadmap, stakeholders, reusable assets",
      children: [
        { id: "roadmap", label: "Executive Roadmaps" },
        { id: "stakeholders", label: "Stakeholder Alignment" },
        { id: "accelerators", label: "Market Accelerators" },
      ],
    },
  ],
};

function TreeNodeCard({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) {
  const [expanded, setExpanded] = useState(isRoot || node.id === "ai" || node.id === "finance");
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
          Executive Architecture Tree
        </p>
        <h2>How the profile connects from strategy to delivery proof</h2>
      </div>
      <div className={styles.mapCanvas}>
        <TreeNodeCard node={treeData} isRoot />
      </div>
    </section>
  );
}
