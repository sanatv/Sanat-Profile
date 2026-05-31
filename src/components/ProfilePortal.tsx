"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Filter,
  GraduationCap,
  Github,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import ExecutiveTree from "@/components/ExecutiveTree";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import ProjectCard from "@/components/ProjectCard";
import type { KnowledgeGraphTriple, NormalizedProject, ProfileDataset } from "@/lib/profile-data";
import styles from "./ProfilePortal.module.css";

type ExecutiveSummary = {
  name: string;
  location: string;
  linkedin: string;
  github: string;
  headline: string;
  subheadline: string;
  positioning: string[];
  metrics: Array<{ label: string; value: string }>;
  highlights: string[];
};

type CareerExperience = {
  organization: string;
  location: string;
  title: string;
  period: string;
  highlights: string[];
};

type EducationItem = {
  institution: string;
  credential: string;
  period: string;
  focus: string;
};

type PortalProps = {
  summary: ExecutiveSummary;
  projects: NormalizedProject[];
  tags: ProfileDataset["tags"];
  roles: string[];
  industries: string[];
  businessFunctions: string[];
  graphTriples: KnowledgeGraphTriple[];
  featuredProjectIds: string[];
  careerTimeline: CareerExperience[];
  education: EducationItem[];
};

type Filters = {
  query: string;
  role: string;
  capability: string;
  technology: string;
  industry: string;
  businessFunction: string;
};

const emptyFilters: Filters = {
  query: "",
  role: "",
  capability: "",
  technology: "",
  industry: "",
  businessFunction: "",
};

const sectionLinks = [
  ["profile", "Profile"],
  ["experience", "Experience"],
  ["case-studies", "Case Studies"],
  ["architecture-tree", "Tree"],
  ["ai-portfolio", "AI Portfolio"],
  ["finance", "Finance"],
  ["governance", "Governance"],
  ["sap", "SAP/S4"],
  ["consulting", "Consulting"],
  ["knowledge-graph", "Graph"],
  ["ask-profile", "Ask"],
];

const roleDescriptions: Record<string, string> = {
  "Consulting Partner / PPMD Track":
    "Client-facing transformation leadership across complex data, finance, MDM, SAP, and AI modernization programs.",
  "AI-enabled FP&A / CFO Systems Leader":
    "Finance data, EPM, planning, forecasting, variance, reporting, and AI-assisted decision intelligence.",
  "CDO / Head of Data & AI":
    "Trusted data foundations, governance operating models, stewardship, MDM, data quality, and AI-ready platforms.",
};

const matches = (value: string, selected: string) =>
  !selected || value.toLowerCase().includes(selected.toLowerCase()) || selected.toLowerCase().includes(value.toLowerCase());

const roleAliases: Record<string, string[]> = {
  "Consulting Partner / PPMD Track": ["ppmd", "consulting", "solution architect", "enterprise data"],
  "AI-enabled FP&A / CFO Systems Leader": ["fp&a", "cfo", "finance", "epm"],
  "CDO / Head of Data & AI": ["cdo", "data", "governance", "mdm", "cloud"],
};

const projectMatchesRole = (project: NormalizedProject, selectedRole: string) => {
  if (!selectedRole) return true;
  const aliases = roleAliases[selectedRole] ?? [selectedRole];
  const haystack = [
    ...project.targetRoles,
    project.role,
    project.name,
  ].join(" ").toLowerCase();

  return aliases.some((alias) => haystack.includes(alias.toLowerCase())) || project.targetRoles.some((role) => matches(role, selectedRole));
};

const projectContains = (project: NormalizedProject, query: string) => {
  if (!query.trim()) return true;
  const haystack = [
    project.name,
    project.client,
    project.industry,
    project.role,
    project.problem,
    project.solution,
    project.outcomes,
    project.summary,
    ...project.capabilities,
    ...project.technologies,
    ...project.targetRoles,
    ...project.tags,
    ...project.businessFunctions,
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.selectWrap}>
      <span>{label}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">All</option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  );
}

export default function ProfilePortal({
  summary,
  projects,
  tags,
  roles,
  industries,
  businessFunctions,
  graphTriples,
  featuredProjectIds,
  careerTimeline,
  education,
}: PortalProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedProject, setSelectedProject] = useState<NormalizedProject | null>(null);

  const featuredProjects = useMemo(
    () =>
      featuredProjectIds
        .map((id) => projects.find((project) => project.id === id))
        .filter((project): project is NormalizedProject => Boolean(project)),
    [featuredProjectIds, projects],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const roleMatch = projectMatchesRole(project, filters.role);
        const capabilityMatch =
          !filters.capability ||
          [...project.capabilities, ...project.tags].some((capability) => matches(capability, filters.capability));
        const technologyMatch =
          !filters.technology ||
          [...project.technologies, ...project.tags].some((technology) => matches(technology, filters.technology));
        const industryMatch = !filters.industry || project.industry === filters.industry;
        const functionMatch =
          !filters.businessFunction || project.businessFunctions.includes(filters.businessFunction);

        return (
          projectContains(project, filters.query) &&
          roleMatch &&
          capabilityMatch &&
          technologyMatch &&
          industryMatch &&
          functionMatch
        );
      }),
    [filters, projects],
  );

  const aiProjects = projects.filter((project) =>
    [...project.capabilities, ...project.tags, ...project.businessFunctions].some((item) =>
      /genai|agentic|ai|machine learning|ml/i.test(item),
    ),
  );
  const financeProjects = projects.filter((project) => project.businessFunctions.includes("Finance / FP&A / CFO"));
  const governanceProjects = projects.filter((project) => project.businessFunctions.includes("Data Governance / MDM"));
  const sapProjects = projects.filter((project) => project.businessFunctions.includes("SAP / S4 / Supply Chain"));
  const consultingProjects = projects.filter((project) =>
    project.businessFunctions.includes("Consulting / Practice Development"),
  );

  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <main className={styles.portal}>
      <nav className={styles.nav} aria-label="Profile sections">
        <strong>Sanat Vats</strong>
        <div>
          {sectionLinks.map(([href, label]) => (
            <a key={href} href={`#${href}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="profile" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <Sparkles size={17} />
            {summary.headline}
          </p>
          <h1>{summary.name}</h1>
          <p className={styles.subheadline}>{summary.subheadline}</p>
          <div className={styles.heroActions}>
            <a href="#case-studies">Explore case studies</a>
            <a href="#ask-profile">Ask my profile</a>
          </div>
          <div className={styles.contactRow}>
            <span>
              <MapPin size={15} />
              {summary.location}
            </span>
            <a href="mailto:sanatv@gmail.com">
              <Mail size={15} />
              Email
            </a>
            <a href={summary.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={15} />
              LinkedIn
            </a>
            <a href={summary.github} target="_blank" rel="noreferrer">
              <Github size={15} />
              GitHub
            </a>
          </div>
        </div>
        <aside className={styles.heroPanel} aria-label="Executive summary">
          {summary.metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </aside>
      </section>

      <section className={styles.executiveSummary} aria-label="Executive summary">
        <div>
          <p className={styles.eyebrow}>Executive Summary</p>
          <h2>Transformation leader for AI-ready data, CFO systems, and enterprise governance</h2>
        </div>
        <div className={styles.summaryGrid}>
          {summary.highlights.map((highlight) => (
            <article key={highlight}>
              <strong>{highlight.split(" ").slice(0, 4).join(" ")}</strong>
              <p>{highlight}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className={styles.experienceSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>
              <BriefcaseBusiness size={16} />
              Historical Experience & Education
            </p>
            <h2>Career foundation behind the transformation portfolio</h2>
          </div>
        </div>

        <div className={styles.experienceLayout}>
          <div className={styles.timelinePanel}>
            {careerTimeline.map((experience) => (
              <article key={`${experience.organization}-${experience.period}`} className={styles.timelineCard}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineHeader}>
                  <span>
                    <Building2 size={15} />
                    {experience.organization}
                  </span>
                  <span>{experience.period}</span>
                </div>
                <h3>{experience.title}</h3>
                <p>{experience.location}</p>
                <ul>
                  {experience.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <aside className={styles.educationPanel}>
            <div className={styles.educationHeader}>
              <GraduationCap size={20} />
              <h3>Education</h3>
            </div>
            {education.map((item) => (
              <article key={`${item.institution}-${item.credential}`}>
                <span>{item.period}</span>
                <h4>{item.credential}</h4>
                <p>{item.institution}</p>
                <small>{item.focus}</small>
              </article>
            ))}
          </aside>
        </div>
      </section>

      <section className={styles.roleGrid} aria-label="Target roles">
        {summary.positioning.map((role) => (
          <button
            type="button"
            key={role}
            className={filters.role === role ? styles.activeRole : ""}
            onClick={() => updateFilter("role", filters.role === role ? "" : role)}
            title={`Filter by ${role}`}
          >
            <BriefcaseBusiness size={18} />
            <strong>{role}</strong>
            <span>{roleDescriptions[role]}</span>
          </button>
        ))}
      </section>

      <ExecutiveTree />

      <section id="case-studies" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>
              <Layers3 size={16} />
              Flagship Case Studies
            </p>
            <h2>Enterprise programs and AI product assets from the dataset</h2>
          </div>
        </div>
        <div className={styles.featureGrid}>
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.filterHeader}>
          <div>
            <p className={styles.eyebrow}>
              <Filter size={16} />
              Project Library
            </p>
            <h2>Filter by role, capability, technology, industry, and function</h2>
          </div>
          <button type="button" onClick={() => setFilters(emptyFilters)} title="Clear all filters">
            <X size={16} />
            Clear
          </button>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchWrap}>
            <span>Search</span>
            <div>
              <Search size={16} />
              <input
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
                placeholder="Search projects, outcomes, platforms"
              />
            </div>
          </label>
          <FilterSelect label="Target role" value={filters.role} options={roles} onChange={(value) => updateFilter("role", value)} />
          <FilterSelect
            label="Capability"
            value={filters.capability}
            options={tags["Capability Tags"]}
            onChange={(value) => updateFilter("capability", value)}
          />
          <FilterSelect
            label="Technology"
            value={filters.technology}
            options={tags["Technology Tags"]}
            onChange={(value) => updateFilter("technology", value)}
          />
          <FilterSelect
            label="Industry"
            value={filters.industry}
            options={industries}
            onChange={(value) => updateFilter("industry", value)}
          />
          <FilterSelect
            label="Business function"
            value={filters.businessFunction}
            options={businessFunctions}
            onChange={(value) => updateFilter("businessFunction", value)}
          />
        </div>

        <div className={styles.resultsMeta}>{filteredProjects.length} matching case studies</div>
        <div className={styles.projectGrid}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} compact />
          ))}
        </div>
      </section>

      <ProofSection id="ai-portfolio" title="AI & Agentic AI Portfolio" projects={aiProjects} onOpen={setSelectedProject} />
      <ProofSection id="finance" title="Finance / FP&A / CFO Transformation" projects={financeProjects} onOpen={setSelectedProject} />
      <ProofSection id="governance" title="Data Governance / MDM / CDO Agenda" projects={governanceProjects} onOpen={setSelectedProject} />
      <ProofSection id="sap" title="SAP / S4 / Supply Chain Data" projects={sapProjects} onOpen={setSelectedProject} />
      <ProofSection
        id="consulting"
        title="Consulting Leadership / Practice Development"
        projects={consultingProjects}
        onOpen={setSelectedProject}
      />

      <KnowledgeGraph triples={graphTriples} projects={projects} />

      <section id="ask-profile" className={styles.askSection}>
        <div className={styles.askCopy}>
          <p className={styles.eyebrow}>
            <Bot size={16} />
            Ask My Profile
          </p>
          <h2>Recruiter chatbot grounded in the profile dataset</h2>
          <p>
            Ask about AI experience, SAP/S4 work, FP&A transformations, MDM, cloud data platforms, industry exposure, or
            specific case studies.
          </p>
        </div>
        <div className={styles.chatShell}>
          <ChatInterface />
        </div>
      </section>

      <section className={styles.videoSection} aria-label="Video overview">
        <h2>Video Overview</h2>
        <div className={styles.videoWrapper}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/D6mBZSFgveA"
            title="Video Overview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p>Generated with help of AI.</p>
      </section>

      {selectedProject && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setSelectedProject(null)}>
          <article className={styles.modal} role="dialog" aria-modal="true" aria-label={`${selectedProject.industry} case study`}>
            <button type="button" className={styles.closeButton} onClick={() => setSelectedProject(null)} title="Close details">
              <X size={18} />
            </button>
            <p className={styles.eyebrow}>{selectedProject.industry}</p>
            <h2>{selectedProject.name}</h2>
            <div className={styles.detailGrid}>
              <div>
                <h3>Business Problem</h3>
                <p>{selectedProject.problem}</p>
              </div>
              <div>
                <h3>Solution</h3>
                <p>{selectedProject.solution}</p>
              </div>
              <div>
                <h3>Outcomes / Value</h3>
                <p>{selectedProject.outcomes}</p>
              </div>
              <div>
                <h3>Role Alignment</h3>
                <p>{selectedProject.targetRoles.join(", ")}</p>
              </div>
            </div>
            <div className={styles.detailTags}>
              {[...selectedProject.capabilities, ...selectedProject.technologies, ...selectedProject.businessFunctions].map((tag) => (
                <span key={`${selectedProject.id}-${tag}`}>{tag}</span>
              ))}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

function ProofSection({
  id,
  title,
  projects,
  onOpen,
}: {
  id: string;
  title: string;
  projects: NormalizedProject[];
  onOpen: (project: NormalizedProject) => void;
}) {
  return (
    <section id={id} className={styles.proofSection}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Portfolio Lane</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className={styles.proofGrid}>
        {projects.slice(0, 4).map((project) => (
          <button key={`${id}-${project.id}`} type="button" onClick={() => onOpen(project)}>
            <strong>{project.industry}</strong>
            <span>{project.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
