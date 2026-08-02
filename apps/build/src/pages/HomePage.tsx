import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Packages } from '../components/Packages';
import { ProjectCard } from '../components/ProjectCard';
import { Seo } from '../components/Seo';
import { publishedProjects } from '../data/projects';
import { processSteps, services } from '../data/services';
import { track } from '../lib/analytics';

const audiences = [
  ['Students & researchers', 'Portfolio and CV sites, research tools, project websites, survey dashboards and honest student-business MVPs.'],
  ['Campus organisations', 'Election systems, membership tools, payment tracking, event registration and administrative dashboards.'],
  ['Businesses & creators', 'Business sites, bookings, customer portals, creator platforms, internal dashboards and AI-assisted workflows.'],
  ['Founders with early ideas', 'MVP planning, product prototypes, Firebase-backed platforms, AI integrations and launch preparation.'],
] as const;

const faqs = [
  ['What types of projects do you accept?', 'Focused websites, applications, campus platforms, early products and useful AI integrations where the problem and intended users can be understood clearly.'],
  ['Do you work only with people in Ghana?', 'No. Pwavwe Studio is based in Ghana and can work remotely with clients elsewhere when the project and communication fit.'],
  ['Can I request only a website?', 'Absolutely. A clear, well-built website is a complete project—not a consolation prize for not building an app.'],
  ['Can you improve an existing product?', 'Yes. Share the current product, what is not working and any access or technical constraints in your request.'],
  ['Do I need a complete idea before contacting you?', 'No. A useful problem is enough to start a conversation. Early discovery can turn it into a sensible first scope.'],
  ['How is pricing determined?', 'Pricing depends on scope, risk, integrations, content readiness, timeline and the level of ongoing support. It is confirmed in a written proposal.'],
  ['Does submitting the form commit me to payment?', 'No. A request is not a contract, does not guarantee acceptance and creates no payment obligation.'],
  ['Do you provide maintenance after launch?', 'Maintenance and monitoring can be included when the product needs them. The exact support arrangement is agreed per project.'],
  ['Can you build student projects?', 'Yes—for legitimate products, research tools and tutoring-supported learning. I will not complete assessed work dishonestly, fabricate data or impersonate a student.'],
  ['What projects will you not accept?', 'Work that is illegal, deceptive, exploitative, built for academic cheating, fabricated research, impersonation or harm.'],
] as const;

export function HomePage() {
  return (
    <>
      <Seo title="Pwavwe Studio — Websites, Apps and AI Systems" description="Francis Pwavwe designs and builds websites, applications, campus platforms and AI-enabled systems for students, organisations, creators and growing businesses." />
      <section className="hero section-pad">
        <div className="hero-copy">
          <p className="eyebrow"><span /> INDEPENDENT PRODUCT STUDIO · GHANA</p>
          <h1>Bring the idea.<br /><em>Let’s make it work.</em></h1>
          <p className="hero-lede">I design and build websites, applications, campus platforms and AI-enabled systems for students, organisations, creators and growing businesses.</p>
          <div className="hero-chips" aria-label="Studio capabilities"><span>Websites</span><span>Digital products</span><span>Useful AI</span></div>
          <div className="button-row">
            <Link className="button" to="/request" onClick={() => void track('hero_request_click', { location: 'hero' })}>Request a Build <ArrowUpRight size={18} /></Link>
            <Link className="button button-ghost" to="/work">View My Work <ArrowRight size={18} /></Link>
          </div>
        </div>
        <figure className="hero-art">
          <img
            src="/pwavwe-studio-hero.webp"
            alt="A connected path showing an idea moving through scope and build to a live digital system"
            width="1324"
            height="1188"
          />
        </figure>
      </section>
      <div className="trust-strip"><span className="status-dot" /> Real problems <b>→</b> focused experiments <b>→</b> working systems.</div>

      <section className="section-pad" aria-labelledby="selected-work">
        <div className="section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2 id="selected-work">Products with a job to do.</h2></div><Link className="text-link" to="/work">See all work <ArrowUpRight size={16} /></Link></div>
        <div className="project-grid">{publishedProjects.slice(0, 3).map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
      </section>

      <section className="section-pad section-contrast" aria-labelledby="services-heading">
        <div className="section-heading"><div><p className="eyebrow">WHAT I BUILD</p><h2 id="services-heading">The right shape for the problem.</h2></div><p>Not every idea needs an app. Not every workflow needs AI. The work starts by choosing what actually helps.</p></div>
        <div className="service-grid">{services.map(({ icon: Icon, title, problem, slug }) => <article className="service-card" key={title}><Icon /><h3>{title}</h3><p>{problem}</p><Link className="text-link" to={`/services#${slug}`} onClick={() => void track('service_cta_click', { service: slug })}>Explore service <ArrowUpRight size={16} /></Link></article>)}</div>
      </section>

      <Packages />

      <section className="section-pad audiences" aria-labelledby="audience-heading">
        <p className="eyebrow">WHO I WORK WITH</p><h2 id="audience-heading">Different contexts. Same need for clarity.</h2>
        <div className="audience-grid">{audiences.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="section-pad process-preview" aria-labelledby="process-heading">
        <div className="section-heading"><div><p className="eyebrow">THE BUILD PROCESS</p><h2 id="process-heading">Clear enough to trust.</h2></div><Link className="text-link" to="/process">See the full process <ArrowUpRight size={16} /></Link></div>
        <ol className="process-line">{processSteps.slice(0, 5).map(([title, description], index) => <li key={title}><span>{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </section>

      <section className="section-pad why-section">
        <div><p className="eyebrow">WHY FRANCIS</p><h2>The builder stays close to the problem.</h2></div>
        <div className="why-copy"><p>I work across product thinking, interface design and development, so context does not disappear between hand-offs. The questions stay practical: Who is stuck? What should change? What must be true for this to work in real life?</p><p>That matters especially for campus and growing-business systems, where the polished screen is only one part of the job. Operations, permissions, unreliable connections and the person maintaining it next month all count.</p></div>
      </section>

      <section className="request-band section-pad"><div><p className="eyebrow">HAVE SOMETHING IN MIND?</p><h2>Start with the untidy version.</h2><p>You do not need a finished specification. Tell me what is happening now, who it affects and what “working” should look like.</p></div><Link className="button button-light" to="/request">Request a Build <ArrowUpRight size={18} /></Link></section>

      <section className="section-pad faq-section" aria-labelledby="faq-heading"><p className="eyebrow">FREQUENTLY ASKED</p><h2 id="faq-heading">Useful answers before the call.</h2><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    </>
  );
}
