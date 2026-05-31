"use client";

import { useMemo, useState } from "react";
import { Maximize2, Network, RotateCcw, Search, ZoomIn, ZoomOut } from "lucide-react";
import type { KnowledgeGraphTriple, NormalizedProject } from "@/lib/profile-data";
import styles from "./KnowledgeGraph.module.css";

type GraphType = "person" | "project" | "experience" | "education" | "technology" | "capability" | "outcome";

type GraphNode = {
  id: string;
  label: string;
  type: GraphType;
  x: number;
  y: number;
  degree: number;
};

type GraphEdge = KnowledgeGraphTriple & {
  id: string;
};

const graphWidth = 980;
const graphHeight = 620;
const center = { x: graphWidth / 2, y: graphHeight / 2 };

const classifyNode = (label: string): GraphType => {
  const normalized = label.toLowerCase();
  if (normalized === "sanat") return "person";
  if (
    normalized.includes("director") ||
    normalized.includes("manager") ||
    normalized.includes("consultant") ||
    normalized.includes("ey") ||
    normalized.includes("deloitte") ||
    normalized.includes("infosys") ||
    normalized.includes("2012") ||
    normalized.includes("2011") ||
    normalized.includes("2005")
  ) {
    return "experience";
  }
  if (
    normalized.includes("mit") ||
    normalized.includes("mba") ||
    normalized.includes("bachelor") ||
    normalized.includes("education") ||
    normalized.includes("institute")
  ) {
    return "education";
  }
  if (normalized.includes("transformation") || normalized.includes("product")) return "project";
  if (
    [
      "react",
      "python",
      "openai",
      "gemini",
      "gcp",
      "sap",
      "hyperion",
      "onestream",
      "databricks",
      "networkx",
      "azure",
      "sql",
      "postgresql",
      "plm",
    ].some((tech) => normalized.includes(tech))
  ) {
    return "technology";
  }
  if (["reporting", "planning", "compliance", "support", "decision", "faster", "trusted"].some((word) => normalized.includes(word))) {
    return "outcome";
  }
  return "capability";
};

const typeOrder: GraphType[] = ["person", "project", "experience", "education", "technology", "capability", "outcome"];

const typeRadius: Record<GraphType, number> = {
  person: 0,
  project: 155,
  experience: 205,
  education: 230,
  technology: 250,
  capability: 315,
  outcome: 365,
};

const typeAngleOffset: Record<GraphType, number> = {
  person: 0,
  project: -0.5,
  experience: 1.8,
  education: -2.15,
  technology: 0.35,
  capability: 1.05,
  outcome: -1.25,
};

const nodeRadius: Record<GraphType, number> = {
  person: 38,
  project: 27,
  experience: 24,
  education: 24,
  technology: 22,
  capability: 22,
  outcome: 23,
};

const truncate = (value: string, max = 27) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);

type KnowledgeGraphProps = {
  triples: KnowledgeGraphTriple[];
  projects: NormalizedProject[];
};

export default function KnowledgeGraph({ triples, projects }: KnowledgeGraphProps) {
  const [query, setQuery] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("all");
  const [selectedNodeId, setSelectedNodeId] = useState("Sanat");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const relationships = useMemo(
    () => ["all", ...Array.from(new Set(triples.map((triple) => triple.relationship))).sort((a, b) => a.localeCompare(b))],
    [triples],
  );

  const graph = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredEdges: GraphEdge[] = triples
      .map((triple, index) => ({ ...triple, id: `${triple.subject}-${triple.relationship}-${triple.object}-${index}` }))
      .filter((triple) => {
        const matchesRelationship = selectedRelationship === "all" || triple.relationship === selectedRelationship;
        const matchesQuery =
          !normalizedQuery ||
          `${triple.subject} ${triple.relationship} ${triple.object}`.toLowerCase().includes(normalizedQuery);
        return matchesRelationship && matchesQuery;
      });

    const visibleEdges =
      normalizedQuery || selectedRelationship !== "all" || !selectedNodeId
        ? filteredEdges
        : filteredEdges.filter((edge) => edge.subject === selectedNodeId || edge.object === selectedNodeId);

    const labels = Array.from(new Set(visibleEdges.flatMap((edge) => [edge.subject, edge.object, selectedNodeId]).filter(Boolean)));
    const degreeByLabel = filteredEdges.reduce<Record<string, number>>((acc, edge) => {
      acc[edge.subject] = (acc[edge.subject] ?? 0) + 1;
      acc[edge.object] = (acc[edge.object] ?? 0) + 1;
      return acc;
    }, {});

    const labelsByType = typeOrder.reduce<Record<GraphType, string[]>>(
      (acc, type) => ({ ...acc, [type]: labels.filter((label) => classifyNode(label) === type) }),
      {} as Record<GraphType, string[]>,
    );

    const nodes: GraphNode[] = typeOrder.flatMap((type) =>
      labelsByType[type].map((label, index) => {
        if (label === "Sanat") {
          return { id: label, label, type, x: center.x, y: center.y, degree: degreeByLabel[label] ?? 0 };
        }

        const typeNodes = labelsByType[type];
        const angle = typeAngleOffset[type] + (index / Math.max(typeNodes.length, 1)) * Math.PI * 2;
        const degreeBoost = Math.min((degreeByLabel[label] ?? 1) * 4, 28);
        const radius = typeRadius[type] + (index % 2) * 34 - degreeBoost;
        return {
          id: label,
          label,
          type,
          x: Math.round(center.x + Math.cos(angle) * radius),
          y: Math.round(center.y + Math.sin(angle) * radius * 0.68),
          degree: degreeByLabel[label] ?? 0,
        };
      }),
    );

    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = visibleEdges.filter((edge) => nodeIds.has(edge.subject) && nodeIds.has(edge.object));

    return { nodes, edges, allEdges: filteredEdges };
  }, [query, selectedNodeId, selectedRelationship, triples]);

  const activeNodeId = hoveredNodeId ?? selectedNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    return new Set(
    graph.allEdges
        .filter((edge) => edge.subject === activeNodeId || edge.object === activeNodeId)
        .flatMap((edge) => [edge.subject, edge.object]),
    );
  }, [activeNodeId, graph.allEdges]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes.find((node) => node.id === "Sanat");
  const selectedEdges = selectedNode
    ? graph.allEdges.filter((edge) => edge.subject === selectedNode.id || edge.object === selectedNode.id)
    : [];
  const visibleTransform = `translate(${center.x} ${center.y}) scale(${zoom}) translate(${-center.x} ${-center.y})`;

  const isFocused = (nodeId: string) => !activeNodeId || connectedNodeIds.size === 0 || connectedNodeIds.has(nodeId);
  const edgeIsFocused = (edge: GraphEdge) =>
    !activeNodeId || connectedNodeIds.size === 0 || edge.subject === activeNodeId || edge.object === activeNodeId;

  return (
    <section id="knowledge-graph" className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            <Network size={16} />
            Interactive Knowledge Graph
          </p>
          <h2>Explore industries, capabilities, platforms, and outcomes as connected proof</h2>
        </div>
        <label className={styles.search}>
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search graph"
            aria-label="Search knowledge graph"
          />
        </label>
      </div>

      <div className={styles.graphShell}>
        <div className={styles.toolbar} aria-label="Knowledge graph controls">
          <div className={styles.relationships}>
            {relationships.map((relationship) => (
              <button
                type="button"
                key={relationship}
                className={selectedRelationship === relationship ? styles.activeChip : ""}
                onClick={() => setSelectedRelationship(relationship)}
              >
                {relationship.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          <div className={styles.zoomControls}>
            <button type="button" onClick={() => setZoom((value) => Math.max(0.72, value - 0.12))} title="Zoom out">
              <ZoomOut size={16} />
            </button>
            <button type="button" onClick={() => setZoom((value) => Math.min(1.45, value + 0.12))} title="Zoom in">
              <ZoomIn size={16} />
            </button>
            <button type="button" onClick={() => setZoom(1)} title="Reset zoom">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className={styles.graphLayout}>
          <div className={styles.graphPanel}>
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} role="img" aria-label="Interactive profile knowledge graph">
              <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                <filter id="nodeGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={visibleTransform}>
                {graph.edges.map((edge) => {
                  const source = graph.nodes.find((node) => node.id === edge.subject);
                  const target = graph.nodes.find((node) => node.id === edge.object);
                  if (!source || !target) return null;
                  const focused = edgeIsFocused(edge);

                  return (
                    <g key={edge.id} className={focused ? styles.edgeGroupActive : styles.edgeGroup}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        className={styles.edge}
                        markerEnd="url(#arrowhead)"
                      />
                      <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2} className={styles.edgeLabel}>
                        {edge.relationship.replaceAll("_", " ")}
                      </text>
                    </g>
                  );
                })}

                {graph.nodes.map((node) => {
                  const focused = isFocused(node.id);
                  const selected = selectedNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x} ${node.y})`}
                      className={`${styles.node} ${styles[node.type]} ${focused ? styles.nodeActive : styles.nodeMuted} ${
                        selected ? styles.nodeSelected : ""
                      }`}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNodeId(node.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${node.label}`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedNodeId(node.id);
                        }
                      }}
                    >
                      <circle r={nodeRadius[node.type] + Math.min(node.degree, 6)} filter={selected ? "url(#nodeGlow)" : undefined} />
                      <text y={nodeRadius[node.type] + 18}>{truncate(node.label)}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          <aside className={styles.inspector} aria-label="Selected graph node">
            <div>
              <p className={styles.inspectorEyebrow}>{selectedNode?.type ?? "node"}</p>
              <h3>{selectedNode?.label ?? "Select a node"}</h3>
              <p>
                {selectedEdges.length} relationship{selectedEdges.length === 1 ? "" : "s"} in the current view.
              </p>
            </div>

            <div className={styles.connectionList}>
              {selectedEdges.slice(0, 8).map((edge) => {
                const direction = edge.subject === selectedNode?.id ? edge.object : edge.subject;
                return (
                  <button type="button" key={edge.id} onClick={() => setSelectedNodeId(direction)}>
                    <span>{edge.relationship.replaceAll("_", " ")}</span>
                    <strong>{direction}</strong>
                  </button>
                );
              })}
              {selectedEdges.length === 0 && <p>Select another node or clear filters to see relationships.</p>}
            </div>
          </aside>
        </div>
      </div>

      <div className={styles.legend} aria-label="Knowledge graph legend">
        {typeOrder.map((type) => (
          <span key={type} className={styles[type]}>
            <i />
            {type}
          </span>
        ))}
      </div>

      <div className={styles.projectStrip}>
        {projects.slice(0, 5).map((project) => (
          <button type="button" key={project.id} onClick={() => setSelectedNodeId(project.client)}>
            <Maximize2 size={14} />
            {project.client}
          </button>
        ))}
      </div>
    </section>
  );
}
