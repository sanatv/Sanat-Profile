"use client";

import { ArrowUpRight, BriefcaseBusiness, Building2, Tags } from "lucide-react";
import type { NormalizedProject } from "@/lib/profile-data";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: NormalizedProject;
  onOpen: (project: NormalizedProject) => void;
  compact?: boolean;
};

export default function ProjectCard({ project, onOpen, compact = false }: ProjectCardProps) {
  const visibleTags = [...project.capabilities, ...project.technologies].slice(0, compact ? 5 : 7);

  return (
    <article className={styles.card}>
      <div className={styles.metaRow}>
        <span>
          <Building2 size={15} />
          {project.client}
        </span>
        <span>
          <BriefcaseBusiness size={15} />
          {project.role}
        </span>
      </div>

      <h3>{project.name}</h3>
      <p className={styles.summary}>{project.summary}</p>

      <div className={styles.tags} aria-label={`${project.client} capabilities and technologies`}>
        {visibleTags.map((tag) => (
          <span key={`${project.id}-${tag}`}>{tag}</span>
        ))}
      </div>

      <div className={styles.footer}>
        <p>
          <Tags size={14} />
          {project.industry}
        </p>
        <button type="button" onClick={() => onOpen(project)} title={`Open ${project.client} case study`}>
          <ArrowUpRight size={17} />
          <span>Details</span>
        </button>
      </div>
    </article>
  );
}
