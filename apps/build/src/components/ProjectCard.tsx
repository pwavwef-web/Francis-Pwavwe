import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../data/projects';
import { track } from '../lib/analytics';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <Link to={`/work/${project.slug}`} className="project-image" onClick={() => void track('portfolio_project_view', { project: project.slug, location: 'card' })}>
        {project.image ? <img src={project.image} alt={`${project.title} project interface`} loading="lazy" /> : <span className="project-fallback">{project.title.slice(0, 2)}</span>}
      </Link>
      <div className="project-card-body">
        <p className="kicker">{project.category} · {project.status}</p>
        <h3><Link to={`/work/${project.slug}`}>{project.title}</Link></h3>
        <p>{project.summary}</p>
        <Link className="text-link" to={`/work/${project.slug}`}>Read case study <ArrowUpRight size={16} /></Link>
      </div>
    </article>
  );
}
