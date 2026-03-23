'use client';

import { Github, Linkedin, Mail, MapPin, Briefcase, GraduationCap, Code } from 'lucide-react';
import styles from './BentoGrid.module.css';

export default function BentoGrid() {
  const metrics = [
    { label: 'Years Exp', value: '20+' },
    { label: 'Value Generated', value: '$20M+' },
    { label: 'Team Size', value: '25+' },
  ];

  const skills = [
    'Gen AI / Agentic AI', 'Data Products', 'Databricks', 'Azure & GCP',
    'Data Governance', 'MDM', 'SAP MDG', 'Oracle ERP', 
    'FP&A', 'EPM', 'SCM', 'Python', 'Machine Learning'
  ];

  return (
    <div className={styles.bentoGrid}>
      {/* Profile Card */}
      <div className={`glass-panel ${styles.card} ${styles.profileCard}`}>
        <div className={styles.avatarPlaceholder}>SV</div>
        <h2>Sanat Vats</h2>
        <p className={styles.role}>Data & AI Executive</p>
        <div className={styles.contactInfo}>
          <span><MapPin size={16} /> Evanston, IL</span>
          <span><Mail size={16} /> sanatv@gmail.com</span>
        </div>
        <div className={styles.links}>
          <a href="https://www.linkedin.com/in/sanat/" target="_blank" rel="noreferrer" className={styles.socialBtn}>
            <Linkedin size={20} /> LinkedIn
          </a>
          <a href="https://github.com/sanatv" target="_blank" rel="noreferrer" className={styles.socialBtn}>
            <Github size={20} /> GitHub
          </a>
        </div>
      </div>

      {/* Metrics Card */}
      <div className={`glass-panel ${styles.card} ${styles.metricsCard}`}>
        {metrics.map(m => (
          <div key={m.label} className={styles.metric}>
            <h3 className="text-gradient">{m.value}</h3>
            <p>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Skills Card */}
      <div className={`glass-panel ${styles.card} ${styles.skillsCard}`}>
        <h3 className={styles.cardTitle}><Code size={20} /> Core Expertise</h3>
        <div className={styles.skillTags}>
          {skills.map(s => (
            <span key={s} className={styles.tag}>{s}</span>
          ))}
        </div>
      </div>

      {/* Experience Summary */}
      <div className={`glass-panel ${styles.card} ${styles.expCard}`}>
        <h3 className={styles.cardTitle}><Briefcase size={20} /> Recent Experience</h3>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <h4>EY</h4>
            <p className={styles.timelineRole}>Senior Director - AI & Data</p>
            <p className={styles.timelineDate}>Oct 2012 - Present</p>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <h4>Deloitte Consulting</h4>
            <p className={styles.timelineRole}>Consultant - Data & Analytics</p>
            <p className={styles.timelineDate}>May 2011 - Sept 2012</p>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className={`glass-panel ${styles.card} ${styles.eduCard}`}>
        <h3 className={styles.cardTitle}><GraduationCap size={20} /> Education Highlights</h3>
        <ul className={styles.eduList}>
          <li><strong>MIT Professional Education</strong> - Applied Data Science (GenAI, ML)</li>
          <li><strong>MBA</strong> - Institute of Management Development & Research</li>
        </ul>
      </div>
    </div>
  );
}
