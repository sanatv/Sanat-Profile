import fs from "node:fs";
import path from "node:path";

const datasetPath = path.join(
  process.cwd(),
  "sanat_profile_handoff_package/data/profile/sanat_profile_portal_dataset_v1.json",
);
const profileDataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

export type Project = {
  "Project Name": string;
  "Client / Asset": string;
  Industry: string;
  "Your Role": string;
  "Business Problem": string;
  "Solution Summary": string;
  "Technologies / Platforms": string;
  Capabilities: string;
  Stakeholders: string;
  "Outcomes / Value": string;
  "Target Role Alignment": string;
  "5-Line Portal Summary": string;
  Tags: string;
  "Chatbot Keywords": string;
};

export type ResumeBullet = {
  Project: string;
  "AI Leader Bullet": string;
  "PPMD / Consulting Bullet": string;
  "FP&A / CFO Systems Bullet": string;
  "CDO / Data & AI Bullet": string;
};

export type ChatbotIntent = {
  intent: string;
  best_projects: string;
  answer_direction: string;
};

export type KnowledgeGraphTriple = {
  subject: string;
  relationship: string;
  object: string;
};

export type ProfileDataset = {
  metadata: {
    title: string;
    purpose: string;
    generated_from: string;
    notes: string;
  };
  projects: Project[];
  resume_bullets: ResumeBullet[];
  chatbot_intents: ChatbotIntent[];
  knowledge_graph_triples: KnowledgeGraphTriple[];
  tags: {
    "Role Tags": string[];
    "Capability Tags": string[];
    "Technology Tags": string[];
    "Outcome Tags": string[];
  };
};

export type NormalizedProject = {
  id: string;
  name: string;
  client: string;
  publicLabel: string;
  industry: string;
  role: string;
  problem: string;
  solution: string;
  technologies: string[];
  capabilities: string[];
  stakeholders: string[];
  outcomes: string;
  targetRoles: string[];
  summary: string;
  tags: string[];
  keywords: string[];
  businessFunctions: string[];
  resumeBullets?: ResumeBullet;
};

export const PROFILE_DATASET = profileDataset as ProfileDataset;

const splitList = (value: string) =>
  value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const primaryIndustry = (industry: string) => industry.split("/")[0].trim();
const publicIndustryLabel = (industry: string) => industry.split("/").map((part) => part.trim()).slice(0, 2).join(" / ");

const functionRules: Array<[string, string[]]> = [
  ["Finance / FP&A / CFO", ["finance", "fp&a", "cfo", "planning", "forecast", "aop", "consolidation", "revenue"]],
  ["Data Governance / MDM", ["governance", "mdm", "master data", "hierarchy", "dictionary", "data quality"]],
  ["SAP / S4 / Supply Chain", ["sap", "s/4", "bom", "supply chain", "material", "production version", "plant"]],
  ["AI / Agentic AI", ["genai", "agentic", "llm", "ai ", "ml", "machine learning", "xgboost", "random forest"]],
  ["Cloud / Data Platforms", ["azure", "gcp", "databricks", "data lake", "postgresql", "sqlite"]],
  ["Consulting / Practice Development", ["stakeholder", "advisory", "solution architect", "transformation", "demo", "accelerator"]],
  ["Regulatory / Compliance", ["regulatory", "compliance", "asc 606", "ferc", "traceability"]],
];

const deriveBusinessFunctions = (project: Project) => {
  const haystack = [
    project["Project Name"],
    project.Industry,
    project["Your Role"],
    project["Business Problem"],
    project["Solution Summary"],
    project.Capabilities,
    project.Stakeholders,
    project.Tags,
  ]
    .join(" ")
    .toLowerCase();

  return functionRules
    .filter(([, needles]) => needles.some((needle) => haystack.includes(needle)))
    .map(([label]) => label);
};

const resumeBulletByProject = new Map(
  PROFILE_DATASET.resume_bullets.map((bullet) => [bullet.Project.toLowerCase(), bullet]),
);

export const PROJECTS: NormalizedProject[] = PROFILE_DATASET.projects.map((project) => {
  const client = project["Client / Asset"];
  const resumeBullets = resumeBulletByProject.get(client.toLowerCase());

  return {
    id: slugify(`${client}-${project["Project Name"]}`),
    name: project["Project Name"],
    client,
    publicLabel: `${publicIndustryLabel(project.Industry)} transformation`,
    industry: project.Industry,
    role: project["Your Role"],
    problem: project["Business Problem"],
    solution: project["Solution Summary"],
    technologies: splitList(project["Technologies / Platforms"]),
    capabilities: splitList(project.Capabilities),
    stakeholders: splitList(project.Stakeholders),
    outcomes: project["Outcomes / Value"],
    targetRoles: splitList(project["Target Role Alignment"]),
    summary: project["5-Line Portal Summary"],
    tags: splitList(project.Tags),
    keywords: splitList(project["Chatbot Keywords"]),
    businessFunctions: deriveBusinessFunctions(project),
    resumeBullets,
  };
});

export const PROFILE_TAGS = PROFILE_DATASET.tags;

export const TARGET_ROLES = Array.from(
  new Set([...PROFILE_TAGS["Role Tags"], ...PROJECTS.flatMap((project) => project.targetRoles)]),
).sort((a, b) => a.localeCompare(b));

export const INDUSTRIES = Array.from(new Set(PROJECTS.map((project) => project.industry))).sort((a, b) =>
  a.localeCompare(b),
);

export const BUSINESS_FUNCTIONS = Array.from(
  new Set(PROJECTS.flatMap((project) => project.businessFunctions)),
).sort((a, b) => a.localeCompare(b));

export const EXECUTIVE_SUMMARY = {
  name: "Sanat Vats",
  location: "Evanston, IL",
  linkedin: "https://www.linkedin.com/in/sanat/",
  github: "https://github.com/sanatv",
  headline: "Enterprise Data, AI & Cloud Transformation Leader",
  subheadline:
    "Helping enterprises become AI-ready and AI-enabled through trusted data foundations, GenAI, Agentic AI, cloud platforms, MDM, SAP/S4, FP&A modernization, and enterprise governance.",
  positioning: [
    "Consulting Partner / PPMD Track",
    "AI-enabled FP&A / CFO Systems Leader",
    "CDO / Head of Data & AI",
  ],
  metrics: [
    { label: "Years of transformation experience", value: "20+" },
    { label: "Enterprise case studies", value: `${PROJECTS.length}` },
    { label: "Core target leadership lanes", value: "3" },
  ],
  highlights: [
    "Enterprise transformation leader with deep experience across data strategy, cloud platforms, master data, governance, SAP/S4, and CFO systems modernization.",
    "Bridges executive advisory and hands-on AI product building, including GenAI, agentic workflows, ML models, Python, React, Databricks, and graph-based analysis.",
    "Builds trusted, AI-ready data foundations that improve reporting confidence, planning speed, finance traceability, operating model clarity, and executive decision support.",
    "Known for translating complex business processes into scalable architectures across finance, supply chain, manufacturing, regulatory, and technology environments.",
  ],
};

export const CAREER_TIMELINE = [
  {
    organization: "EY",
    location: "Chicago, IL",
    title: "Senior Director / Senior Manager - AI & Data",
    period: "Oct 2012 - Present",
    highlights: [
      "Led enterprise data, analytics, governance, MDM, cloud, SAP/S4, finance, and AI transformation workstreams.",
      "Built and scaled teams across client-facing delivery, solution architecture, executive advisory, and market-facing AI assets.",
      "Developed GenAI, agentic AI, AI-enabled FP&A, and AI-ready data foundation capabilities for enterprise transformation.",
    ],
  },
  {
    organization: "Deloitte Consulting",
    location: "Chicago, IL",
    title: "Consultant - Data & Analytics",
    period: "May 2011 - Sept 2012",
    highlights: [
      "Designed enterprise metadata, EPM, and Hyperion DRM solutions for finance and reporting modernization.",
      "Translated finance data complexity into governed hierarchy, metadata, and planning/reporting structures.",
    ],
  },
  {
    organization: "Infosys Technologies",
    location: "Bangalore, India / Chicago, IL",
    title: "Senior Consultant",
    period: "Jan 2005 - May 2011",
    highlights: [
      "Delivered enterprise systems, finance transformation, M&A integration, EPM, and global delivery programs.",
      "Built early-career depth across ERP, planning, reporting, master data, and complex stakeholder delivery.",
    ],
  },
];

export const EDUCATION = [
  {
    institution: "MIT Professional Education",
    credential: "Applied Data Science Program",
    period: "June 2024",
    focus: "Applied data science, machine learning, GenAI, analytics, and modern AI methods.",
  },
  {
    institution: "Institute of Management Development and Research, Pune",
    credential: "MBA",
    period: "May 2003",
    focus: "Business management, finance, strategy, operations, and executive decision-making foundations.",
  },
  {
    institution: "Muzaffarpur Institute of Technology",
    credential: "Bachelor of Engineering",
    period: "May 2001",
    focus: "Engineering fundamentals, systems thinking, analytical problem-solving, and technology foundations.",
  },
];

export const FEATURED_PROJECT_IDS = [
  "nvidia-intelligent-bom-and-planning-master-data-transformation",
  "artha-ai-financial-intelligence-and-agentic-automation-platform",
  "mars-finance-data-foundation-mdm-architecture-and-persona-based-reporting",
  "ey-ai-finance-ai-enabled-fpanda-demo-product",
];

const clientNameVariants = PROJECTS.flatMap((project) => [
  { name: project.client, replacement: `the ${project.publicLabel}` },
  ...project.client
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => /^(NVIDIA|Artha|Mars|GM|Cisco|Exelon|Tyson|Moody’s|Moody's|EY)$/i.test(part))
    .map((name) => ({ name, replacement: `the ${project.publicLabel}` })),
  ...project.client
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part.length > 2)
    .map((name) => ({ name, replacement: `the ${project.publicLabel}` })),
]);

export function sanitizeClientNames(value: string) {
  const sanitized = clientNameVariants.reduce((text, { name, replacement }) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = /^[A-Za-z0-9]+$/.test(name) ? `\\b${escaped}\\b` : escaped;
    return text.replace(new RegExp(pattern, "gi"), replacement);
  }, value);

  return sanitized
    .replace(/\bNVIDIA\b/gi, "the Semiconductor transformation")
    .replace(/\bArtha\b/gi, "the Financial Analytics product")
    .replace(/\bMars\b/gi, "the CPG transformation")
    .replace(/\bGM\b/g, "the Automotive transformation")
    .replace(/\bCisco\b/gi, "the Technology transformation")
    .replace(/\bExelon\b/gi, "the Utilities transformation")
    .replace(/Moody[’']s/gi, "the Financial Services transformation")
    .replace(/\bTyson\b/gi, "the CPG transformation")
    .replace(/\bKraft\b/gi, "the CPG transformation")
    .replace(/\bCadbury\b/gi, "the CPG transformation")
    .replace(/\bMondelez\b/gi, "the CPG transformation")
    .replace(/\bEY\b/g, "the Consulting practice");
}

export function publicProject(project: NormalizedProject) {
  const resumeBullets = project.resumeBullets
    ? {
        ...project.resumeBullets,
        Project: project.publicLabel,
        "AI Leader Bullet": sanitizeClientNames(project.resumeBullets["AI Leader Bullet"]),
        "PPMD / Consulting Bullet": sanitizeClientNames(project.resumeBullets["PPMD / Consulting Bullet"]),
        "FP&A / CFO Systems Bullet": sanitizeClientNames(project.resumeBullets["FP&A / CFO Systems Bullet"]),
        "CDO / Data & AI Bullet": sanitizeClientNames(project.resumeBullets["CDO / Data & AI Bullet"]),
      }
    : undefined;

  return {
    ...project,
    client: project.publicLabel,
    problem: sanitizeClientNames(project.problem),
    solution: sanitizeClientNames(project.solution),
    outcomes: sanitizeClientNames(project.outcomes),
    summary: sanitizeClientNames(project.summary),
    keywords: project.keywords.map(sanitizeClientNames),
    resumeBullets,
  };
}

export const PUBLIC_PROJECTS = PROJECTS.map(publicProject);

const careerGraphTriples: KnowledgeGraphTriple[] = [
  ...CAREER_TIMELINE.flatMap((experience) => [
    { subject: "Sanat", relationship: "held_role", object: experience.title },
    { subject: experience.title, relationship: "at", object: experience.organization },
    { subject: experience.title, relationship: "during", object: experience.period },
  ]),
  ...EDUCATION.flatMap((education) => [
    { subject: "Sanat", relationship: "earned", object: education.credential },
    { subject: education.credential, relationship: "from", object: education.institution },
    { subject: education.credential, relationship: "focuses_on", object: education.focus },
  ]),
];

export const PUBLIC_KNOWLEDGE_GRAPH_TRIPLES: KnowledgeGraphTriple[] = [...careerGraphTriples, ...PROJECTS.flatMap((project) => {
  const caseNode = project.publicLabel;
  const capabilityTriples = project.capabilities.slice(0, 3).map((capability) => ({
    subject: caseNode,
    relationship: "demonstrates",
    object: capability,
  }));
  const technologyTriples = project.technologies.slice(0, 3).map((technology) => ({
    subject: caseNode,
    relationship: "uses",
    object: technology,
  }));

  return [
    { subject: "Sanat", relationship: "led", object: caseNode },
    { subject: caseNode, relationship: "serves", object: primaryIndustry(project.industry) },
    { subject: caseNode, relationship: "supports", object: sanitizeClientNames(project.outcomes).split(";")[0] },
    ...capabilityTriples,
    ...technologyTriples,
  ];
})];

export function buildChatContext(query = "") {
  const normalizedQuery = query.toLowerCase();
  const scored = PROJECTS.map((project) => {
    const text = [
      project.name,
      project.client,
      project.industry,
      project.role,
      project.problem,
      project.solution,
      project.outcomes,
      project.summary,
      ...project.technologies,
      ...project.capabilities,
      ...project.tags,
      ...project.keywords,
      ...project.targetRoles,
    ]
      .join(" ")
      .toLowerCase();

    const score = normalizedQuery
      .split(/\W+/)
      .filter((word) => word.length > 2)
      .reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);

    return { project, score };
  }).sort((a, b) => b.score - a.score);

  const selectedProjects = scored.slice(0, 5).map(({ project }) => publicProject(project));
  const intents = PROFILE_DATASET.chatbot_intents
    .filter((intent) => {
      const text = `${intent.intent} ${intent.best_projects} ${intent.answer_direction}`.toLowerCase();
      return normalizedQuery.split(/\W+/).some((word) => word.length > 3 && text.includes(word));
    })
    .slice(0, 3)
    .map((intent) => ({
      ...intent,
      best_projects: sanitizeClientNames(intent.best_projects),
      answer_direction: sanitizeClientNames(intent.answer_direction),
    }));

  return {
    summary: EXECUTIVE_SUMMARY,
    projects: selectedProjects,
    intents,
    safetyNotes: [
      "Do not name client or asset names. Refer to work by industry, business context, or transformation type.",
      "Do not overstate advisory, prototype, or demo work as production ownership.",
      "Use careful wording such as AI-ready, AI-assisted analysis, demo product, or prototype where appropriate.",
      "Do not claim full program budget ownership unless the provided context explicitly says so.",
    ],
  };
}
