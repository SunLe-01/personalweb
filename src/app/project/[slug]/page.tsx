import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailShell } from "@/components/project-detail-shell";
import { getAdjacentProjects, getProjectBySlug, projects } from "@/data/portfolio";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found"
    };
  }

  return {
    title: `${project.title} | Artist Portfolio Shell`,
    description: project.description
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = getAdjacentProjects(slug);

  if (!previous || !next) {
    notFound();
  }

  return (
    <ProjectDetailShell project={project} previousProject={previous} nextProject={next} />
  );
}
