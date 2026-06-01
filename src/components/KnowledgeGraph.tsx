"use client";

import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3";
import { Maximize2, Move, Network, RotateCcw, Search, ZoomIn, ZoomOut } from "lucide-react";
import type { KnowledgeGraphTriple, NormalizedProject } from "@/lib/profile-data";
import styles from "./KnowledgeGraph.module.css";

type GraphType = "person" | "project" | "experience" | "education" | "organization" | "technology" | "capability" | "outcome";
type GraphView = "integrated" | "career" | "education" | "portfolio" | "capabilities";

type GraphNode = {
  id: string;
  label: string;
  type: GraphType;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  degree: number;
};

type GraphEdge = KnowledgeGraphTriple & {
  id: string;
};

type SimNode = GraphNode & SimulationNodeDatum;
type SimEdge = GraphEdge & SimulationLinkDatum<SimNode>;

const graphWidth = 1080;
const graphHeight = 660;
const center = { x: graphWidth / 2, y: graphHeight / 2 };

const graphViews: Array<{ id: GraphView; label: string; relationships: string[] }> = [
  { id: "integrated", label: "Integrated", relationships: ["led", "held_role", "earned", "at", "from", "serves"] },
  { id: "career", label: "Career", relationships: ["held_role", "at", "during"] },
  { id: "education", label: "Education", relationships: ["earned", "from", "focuses_on"] },
  { id: "portfolio", label: "Portfolio", relationships: ["led", "serves", "supports"] },
  { id: "capabilities", label: "Capabilities", relationships: ["led", "demonstrates", "uses"] },
];

const clusterLabels: Record<GraphView, Array<{ label: string; x: number; y: number }>> = {
  integrated: [
    { label: "Career Arc", x: 135, y: 82 },
    { label: "Education", x: 145, y: 422 },
    { label: "Industry Portfolio", x: 682, y: 88 },
    { label: "Sanat", x: center.x, y: center.y - 58 },
  ],
  career: [
    { label: "Roles", x: 320, y: 92 },
    { label: "Organizations & Periods", x: 690, y: 92 },
  ],
  education: [
    { label: "Credentials", x: 285, y: 96 },
    { label: "Institutions & Focus", x: 690, y: 96 },
  ],
  portfolio: [
    { label: "Case Studies", x: 250, y: 96 },
    { label: "Industries & Outcomes", x: 690, y: 96 },
  ],
  capabilities: [
    { label: "Transformation Work", x: 185, y: 92 },
    { label: "Capabilities", x: 495, y: 92 },
    { label: "Platforms", x: 790, y: 92 },
  ],
};

const nodeRadius: Record<GraphType, number> = {
  person: 39,
  project: 28,
  experience: 25,
  education: 25,
  organization: 22,
  technology: 22,
  capability: 22,
  outcome: 23,
};

const typeOrder: GraphType[] = ["person", "experience", "education", "project", "capability", "technology", "outcome", "organization"];

const truncate = (value: string, max = 30) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const classifyNode = (label: string): GraphType => {
  const normalized = label.toLowerCase();
  if (normalized === "sanat") return "person";
  if (["ey", "deloitte", "infosys"].some((name) => normalized.includes(name))) return "organization";
  if (
    normalized.includes("director") ||
    normalized.includes("manager") ||
    normalized.includes("consultant") ||
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
    normalized.includes("institute") ||
    normalized.includes("applied data science")
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
      "edmcs",
      "essbase",
      "zuora",
      "salesforce",
      "peoplesoft",
    ].some((tech) => normalized.includes(tech))
  ) {
    return "technology";
  }
  if (["reporting", "planning", "compliance", "support", "decision", "faster", "trusted", "improved"].some((word) => normalized.includes(word))) {
    return "outcome";
  }
  return "capability";
};

const defaultAnchorFor = (node: Pick<GraphNode, "type" | "id">, index: number, count: number, view: GraphView) => {
  if (node.id === "Sanat") return center;

  const safeCount = Math.max(count, 1);
  const angle = (index / safeCount) * Math.PI * 2;

  if (view === "career") {
    if (node.type === "experience") return { x: 360 + (index % 2) * 310, y: 150 + index * 120 };
    if (node.type === "organization") return { x: 790, y: 170 + index * 105 };
    return { x: center.x + Math.cos(angle) * 290, y: center.y + Math.sin(angle) * 180 };
  }

  if (view === "education") {
    if (node.type === "education") return { x: 335 + (index % 2) * 360, y: 165 + Math.floor(index / 2) * 170 };
    return { x: 770, y: 165 + index * 120 };
  }

  if (view === "portfolio") {
    if (node.type === "project") return { x: center.x + Math.cos(angle) * 275, y: center.y + Math.sin(angle) * 195 };
    if (node.type === "outcome") return { x: 800 + Math.cos(angle) * 145, y: center.y + Math.sin(angle) * 210 };
    return { x: center.x + Math.cos(angle) * 230, y: center.y + Math.sin(angle) * 170 };
  }

  if (view === "capabilities") {
    if (node.type === "project") return { x: 235, y: 130 + index * 82 };
    if (node.type === "capability") return { x: center.x + Math.cos(angle) * 240, y: center.y + Math.sin(angle) * 210 };
    if (node.type === "technology") return { x: 815 + Math.cos(angle) * 165, y: center.y + Math.sin(angle) * 225 };
    return { x: center.x + Math.cos(angle) * 280, y: center.y + Math.sin(angle) * 200 };
  }

  const anchors: Record<GraphType, { x: number; y: number; radiusX: number; radiusY: number; start: number }> = {
    person: { x: center.x, y: center.y, radiusX: 0, radiusY: 0, start: 0 },
    experience: { x: 250, y: 250, radiusX: 95, radiusY: 190, start: -1.2 },
    education: { x: 255, y: 475, radiusX: 105, radiusY: 90, start: 0.2 },
    project: { x: center.x + 110, y: center.y, radiusX: 255, radiusY: 205, start: -0.35 },
    capability: { x: 735, y: 215, radiusX: 160, radiusY: 140, start: 0.5 },
    technology: { x: 760, y: 485, radiusX: 190, radiusY: 120, start: -0.9 },
    outcome: { x: 520, y: 105, radiusX: 210, radiusY: 70, start: 0.1 },
    organization: { x: 160, y: 175, radiusX: 70, radiusY: 95, start: -0.4 },
  };
  const anchor = anchors[node.type];
  const offsetAngle = anchor.start + angle;
  return {
    x: Math.round(anchor.x + Math.cos(offsetAngle) * anchor.radiusX),
    y: Math.round(anchor.y + Math.sin(offsetAngle) * anchor.radiusY),
  };
};

const linkDistanceFor = (edge: GraphEdge) => {
  if (edge.subject === "Sanat" || edge.object === "Sanat") return 148;
  if (edge.relationship === "uses") return 124;
  if (edge.relationship === "demonstrates") return 134;
  if (edge.relationship === "supports") return 154;
  return 118;
};

const toRenderableNodes = (nodes: SimNode[]): GraphNode[] =>
  nodes.map((node) => ({
    ...node,
    x: Math.round(clamp(node.x ?? node.anchorX, 48, graphWidth - 48)),
    y: Math.round(clamp(node.y ?? node.anchorY, 48, graphHeight - 48)),
  }));

type KnowledgeGraphProps = {
  triples: KnowledgeGraphTriple[];
  projects: NormalizedProject[];
};

export default function KnowledgeGraph({ triples, projects }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<Simulation<SimNode, SimEdge> | null>(null);
  const liveNodesRef = useRef<SimNode[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<GraphView>("integrated");
  const [selectedRelationship, setSelectedRelationship] = useState("all");
  const [selectedNodeId, setSelectedNodeId] = useState("Sanat");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [movedNodes, setMovedNodes] = useState<Record<string, { x: number; y: number }>>({});
  const [simulatedNodes, setSimulatedNodes] = useState<GraphNode[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const relationships = useMemo(() => {
    const activeView = graphViews.find((item) => item.id === view) ?? graphViews[0];
    const viewRelationships = triples
      .map((triple) => triple.relationship)
      .filter((relationship) => activeView.relationships.includes(relationship));

    return ["all", ...Array.from(new Set(viewRelationships)).sort((a, b) => a.localeCompare(b))];
  }, [triples, view]);

  const graph = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const activeView = graphViews.find((item) => item.id === view) ?? graphViews[0];
    const allEdges: GraphEdge[] = triples.map((triple, index) => ({
      ...triple,
      id: `${triple.subject}-${triple.relationship}-${triple.object}-${index}`,
    }));

    const filteredEdges = allEdges.filter((edge) => {
      const matchesView = activeView.relationships.includes(edge.relationship);
      const matchesRelationship = selectedRelationship === "all" || edge.relationship === selectedRelationship;
      const matchesQuery =
        !normalizedQuery || `${edge.subject} ${edge.relationship} ${edge.object}`.toLowerCase().includes(normalizedQuery);
      return matchesView && matchesRelationship && matchesQuery;
    });

    const shouldShowNeighborhood = selectedRelationship === "all" && !normalizedQuery && selectedNodeId !== "Sanat";
    const visibleEdges = shouldShowNeighborhood
      ? filteredEdges.filter((edge) => edge.subject === selectedNodeId || edge.object === selectedNodeId)
      : filteredEdges;

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

    const nodes = typeOrder.flatMap((type) =>
      labelsByType[type].map((label, index) => {
        const anchor = defaultAnchorFor({ id: label, type }, index, labelsByType[type].length, view);
        return {
          id: label,
          label,
          type,
          x: anchor.x,
          y: anchor.y,
          anchorX: anchor.x,
          anchorY: anchor.y,
          degree: degreeByLabel[label] ?? 0,
        };
      }),
    );

    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = visibleEdges.filter((edge) => nodeIds.has(edge.subject) && nodeIds.has(edge.object));

    return { nodes, edges, allEdges: filteredEdges };
  }, [query, selectedNodeId, selectedRelationship, triples, view]);

  useEffect(() => {
    const nodes: SimNode[] = graph.nodes.map((node) => {
      const moved = movedNodes[node.id];
      return {
        ...node,
        x: moved?.x ?? node.x,
        y: moved?.y ?? node.y,
        fx: moved?.x ?? null,
        fy: moved?.y ?? null,
      };
    });
    const links: SimEdge[] = graph.edges.map((edge) => ({
      ...edge,
      source: edge.subject,
      target: edge.object,
    }));

    liveNodesRef.current = nodes;
    simulationRef.current?.stop();

    const simulation = forceSimulation<SimNode>(nodes)
      .force("link", forceLink<SimNode, SimEdge>(links).id((node) => node.id).distance(linkDistanceFor).strength(0.56))
      .force("charge", forceManyBody<SimNode>().strength(view === "integrated" ? -430 : -360))
      .force("collide", forceCollide<SimNode>((node) => nodeRadius[node.type] + Math.min(node.degree, 6) + 18).iterations(2))
      .force("x", forceX<SimNode>((node) => node.anchorX).strength(view === "integrated" ? 0.1 : 0.13))
      .force("y", forceY<SimNode>((node) => node.anchorY).strength(view === "integrated" ? 0.1 : 0.13))
      .force("center", forceCenter(center.x, center.y))
      .alpha(0.92)
      .alphaDecay(0.055)
      .velocityDecay(0.42);

    let frame = 0;
    simulation.on("tick", () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setSimulatedNodes(toRenderableNodes(nodes));
      });
    });

    simulationRef.current = simulation;

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      simulation.stop();
    };
  }, [graph.edges, graph.nodes, movedNodes, view]);

  const activeNodes = simulatedNodes.length ? simulatedNodes : graph.nodes;
  const nodeById = useMemo(() => new Map(activeNodes.map((node) => [node.id, node])), [activeNodes]);
  const selectedNode = nodeById.get(selectedNodeId) ?? nodeById.get("Sanat");
  const activeNodeId = hoveredNodeId ?? selectedNode?.id ?? null;
  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    return new Set(
      graph.allEdges
        .filter((edge) => edge.subject === activeNodeId || edge.object === activeNodeId)
        .flatMap((edge) => [edge.subject, edge.object]),
    );
  }, [activeNodeId, graph.allEdges]);

  const selectedEdges = selectedNode
    ? graph.allEdges.filter((edge) => edge.subject === selectedNode.id || edge.object === selectedNode.id)
    : [];
  const visibleTransform = `translate(${center.x} ${center.y}) scale(${zoom}) translate(${-center.x} ${-center.y})`;

  const isFocused = (nodeId: string) => !activeNodeId || connectedNodeIds.size === 0 || connectedNodeIds.has(nodeId);
  const edgeIsFocused = (edge: GraphEdge) =>
    !activeNodeId || connectedNodeIds.size === 0 || edge.subject === activeNodeId || edge.object === activeNodeId;

  const eventToGraphPoint = (event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const svgPoint = point.matrixTransform(ctm.inverse());
    return {
      x: center.x + (svgPoint.x - center.x) / zoom,
      y: center.y + (svgPoint.y - center.y) / zoom,
    };
  };

  const beginDrag = (event: PointerEvent<SVGGElement>, nodeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    event.currentTarget.setPointerCapture(event.pointerId);

    const node = liveNodesRef.current.find((item) => item.id === nodeId);
    if (node) {
      node.fx = node.x;
      node.fy = node.y;
      simulationRef.current?.alphaTarget(0.26).restart();
    }
  };

  const moveDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId) return;
    const point = eventToGraphPoint(event);
    if (!point) return;
    const node = liveNodesRef.current.find((item) => item.id === draggingNodeId);
    if (!node) return;

    node.fx = clamp(point.x, 48, graphWidth - 48);
    node.fy = clamp(point.y, 48, graphHeight - 48);
    node.x = node.fx;
    node.y = node.fy;
    setSimulatedNodes(toRenderableNodes(liveNodesRef.current));
  };

  const endDrag = () => {
    if (draggingNodeId) {
      const node = liveNodesRef.current.find((item) => item.id === draggingNodeId);
      if (node) {
        const x = Math.round(clamp(node.x ?? node.anchorX, 48, graphWidth - 48));
        const y = Math.round(clamp(node.y ?? node.anchorY, 48, graphHeight - 48));
        node.fx = x;
        node.fy = y;
        setMovedNodes((current) => ({ ...current, [draggingNodeId]: { x, y } }));
      }
    }
    setDraggingNodeId(null);
    simulationRef.current?.alphaTarget(0.04).restart();
  };

  const resetLayout = () => {
    setDraggingNodeId(null);
    setMovedNodes({});
    simulationRef.current?.alpha(0.9).restart();
  };

  const selectView = (nextView: GraphView) => {
    setView(nextView);
    setSelectedRelationship("all");
    setSelectedNodeId("Sanat");
    setMovedNodes({});
  };

  return (
    <section id="knowledge-graph" className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            <Network size={16} />
            D3.js Knowledge Graph
          </p>
          <h2>Explore a force-directed network across career, education, projects, AI capabilities, platforms, and outcomes</h2>
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
        <div className={styles.viewTabs} aria-label="Knowledge graph views">
          {graphViews.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-current={view === item.id ? "page" : undefined}
              className={view === item.id ? styles.activeTab : ""}
              onClick={() => selectView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

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
            <button type="button" onClick={resetLayout} title="Reset D3 layout">
              <Move size={16} />
              Reset layout
            </button>
          </div>
        </div>

        <div className={styles.graphLayout}>
          <div className={styles.graphPanel}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              role="img"
              aria-label="D3 force-directed draggable profile knowledge graph"
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
            >
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
                {clusterLabels[view].map((item) => (
                  <text key={item.label} x={item.x} y={item.y} className={styles.clusterLabel} aria-hidden="true">
                    {item.label}
                  </text>
                ))}

                {graph.edges.map((edge) => {
                  const source = nodeById.get(edge.subject);
                  const target = nodeById.get(edge.object);
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

                {activeNodes.map((node) => {
                  const focused = isFocused(node.id);
                  const selected = selectedNode?.id === node.id;
                  const dragged = draggingNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x} ${node.y})`}
                      className={`${styles.node} ${styles[node.type]} ${focused ? styles.nodeActive : styles.nodeMuted} ${
                        selected ? styles.nodeSelected : ""
                      } ${dragged ? styles.nodeDragging : ""}`}
                      onPointerDown={(event) => beginDrag(event, node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Move or select ${node.label}`}
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
                {selectedEdges.length} relationship{selectedEdges.length === 1 ? "" : "s"} in this view. D3 keeps related
                nodes together while you drag individual nodes into place.
              </p>
            </div>

            <div className={styles.connectionList}>
              {selectedEdges.slice(0, 10).map((edge) => {
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
