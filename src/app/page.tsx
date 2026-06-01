import ProfilePortal from "@/components/ProfilePortal";
import {
  BUSINESS_FUNCTIONS,
  CAREER_TIMELINE,
  EDUCATION,
  EXECUTIVE_SUMMARY,
  FEATURED_PROJECT_IDS,
  INDUSTRIES,
  PROFILE_TAGS,
  PUBLIC_KNOWLEDGE_GRAPH_TRIPLES,
  PUBLIC_PROJECTS,
} from "@/lib/profile-data";

export default function Home() {
  return (
    <ProfilePortal
      summary={EXECUTIVE_SUMMARY}
      projects={PUBLIC_PROJECTS}
      tags={PROFILE_TAGS}
      industries={INDUSTRIES}
      businessFunctions={BUSINESS_FUNCTIONS}
      graphTriples={PUBLIC_KNOWLEDGE_GRAPH_TRIPLES}
      featuredProjectIds={FEATURED_PROJECT_IDS}
      careerTimeline={CAREER_TIMELINE}
      education={EDUCATION}
    />
  );
}
