import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { Seo } from '../components/Seo';
import { publishedProjects } from '../data/projects';
import { track } from '../lib/analytics';

export function WorkPage() {
  return <>
    <Seo title="Selected Work — Pwavwe Studio" description="Explore websites, applications, campus platforms and AI-enabled products built by Francis Pwavwe." path="/work" />
    <section className="page-hero section-pad"><p className="eyebrow">WORK</p><h1>Systems built around<br /><em>real situations.</em></h1><p>No invented metrics. No mystery case studies. Just the problem, the decisions and what exists now.</p></section>
    <section className="section-pad page-section"><div className="project-grid">{publishedProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section>
  </>;
}

export function ProjectPage() {
  const { slug = '' } = useParams();
  const project = publishedProjects.find((item) => item.slug === slug);
  if (!project) return <MissingProject />;
  const related = publishedProjects.filter((item) => item.slug !== slug).slice(0, 2);
  return <>
    <Seo title={`${project.title} Case Study — Pwavwe Studio`} description={project.summary} path={`/work/${project.slug}`} />
    <article>
      <header className="case-hero section-pad">
        <Link className="back-link" to="/work"><ArrowLeft size={16} /> All work</Link>
        <p className="eyebrow">{project.category} · {project.status}</p>
        <h1>{project.title}</h1><p>{project.summary}</p>
        {project.externalUrl && <a className="button button-small" href={project.externalUrl} target="_blank" rel="noreferrer" onClick={() => void track('portfolio_project_view', { project: project.slug, location: 'external' })}>Open live project <ArrowUpRight size={16} /></a>}
      </header>
      <div className="case-image-wrap">{project.image ? <img src={project.image} alt={`${project.title} interface preview`} /> : <div className="project-fallback">{project.title}</div>}</div>
      <div className="case-body section-pad">
        <aside><p className="eyebrow">PROJECT NOTES</p><dl><dt>Status</dt><dd>{project.status}</dd><dt>Users</dt><dd>{project.users}</dd><dt>Technology</dt><dd>{project.technology.join(' · ')}</dd></dl></aside>
        <div className="case-narrative">
          <section><span>01</span><h2>The original problem</h2><p>{project.problem}</p></section>
          <section><span>02</span><h2>Who experienced it</h2><p>{project.users}</p></section>
          <section><span>03</span><h2>What was built</h2><p>{project.solution}</p><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>
          <section><span>04</span><h2>Technical approach</h2><p>{project.technology.join(', ')}. The implementation follows the needs of this product; the technology list is not treated as the outcome.</p></section>
          <section><span>05</span><h2>Difficult decisions</h2><p>{project.challenges}</p></section>
          <section><span>06</span><h2>Result or current status</h2><p>{project.status}. This case study intentionally avoids claims that cannot be verified from the project record.</p></section>
          <section><span>07</span><h2>Lessons</h2><p>{project.lessons}</p></section>
        </div>
      </div>
    </article>
    <section className="section-pad related"><div className="section-heading"><div><p className="eyebrow">RELATED WORK</p><h2>More working systems.</h2></div></div><div className="project-grid">{related.map((item) => <ProjectCard key={item.slug} project={item} />)}</div></section>
    <section className="request-band section-pad"><div><p className="eyebrow">SOMETHING SIMILAR?</p><h2>Bring the context, not a clone.</h2></div><Link className="button button-light" to="/request">Request a Build <ArrowUpRight size={18} /></Link></section>
  </>;
}

function MissingProject() {
  return <section className="empty-state section-pad"><Seo title="Case Study Not Found — Pwavwe Studio" description="This case study is unavailable." path="/work" noIndex /><p className="eyebrow">MISSING CASE STUDY</p><h1>That project is not on the shelf.</h1><p>It may be unpublished, renamed or the link may be wrong.</p><Link className="button" to="/work"><ArrowLeft size={16} /> Browse published work</Link></section>;
}
