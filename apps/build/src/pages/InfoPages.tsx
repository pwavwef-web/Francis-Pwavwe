import { ArrowUpRight, Check, Mail, MessageCircle, Phone, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Packages } from '../components/Packages';
import { PaymentTerms } from '../components/PaymentTerms';
import { Seo } from '../components/Seo';
import { processSteps, services } from '../data/services';
import { hasWhatsApp, studio, whatsappLink } from '../data/studio';
import { track } from '../lib/analytics';

export function ServicesPage() {
  return <>
    <Seo title="Services — Pwavwe Studio" description="Websites, web and mobile applications, AI integrations, campus systems and focused MVP development by Francis Pwavwe." path="/services" />
    <section className="page-hero section-pad"><p className="eyebrow">SERVICES</p><h1>Build what the work<br /><em>actually needs.</em></h1><p>The service is a starting shape. The proposal is built around your problem, users and operating reality.</p></section>
    <Packages heading="Start from a fixed package." intro="Pick the closest package as a starting point. It sets a clear scope and a from-price; the final quote is confirmed in your proposal." />
    <section className="section-pad service-list">{services.map(({ icon: Icon, title, problem, suitableFor, deliverables, slug }, index) => <article id={slug} key={title}><div className="service-number">0{index + 1}</div><div className="service-icon"><Icon /></div><div className="service-content"><h2>{title}</h2><h3>The problem it addresses</h3><p>{problem}</p><h3>Best suited to</h3><p>{suitableFor}</p><h3>Possible deliverables</h3><ul>{deliverables.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul><Link className="text-link" to={`/request?type=${encodeURIComponent(title)}`} onClick={() => void track('service_cta_click', { service: slug })}>Request this kind of build <ArrowUpRight size={16} /></Link></div></article>)}</section>
    <PaymentTerms contrast />
    <section className="request-band section-pad"><div><p className="eyebrow">NOT SURE WHICH FITS?</p><h2>Describe the situation.</h2><p>You are not expected to diagnose the technology before you ask for help.</p></div><Link className="button button-light" to="/request">Start a request <ArrowUpRight size={18} /></Link></section>
  </>;
}

export function ProcessPage() {
  return <>
    <Seo title="Build Process — Pwavwe Studio" description="See how a Pwavwe Studio project moves from the first request through scope, design, build, testing, launch and support." path="/process" />
    <section className="page-hero section-pad"><p className="eyebrow">PROCESS</p><h1>Fewer surprises.<br /><em>Better decisions.</em></h1><p>A clear process protects the idea, the budget and the people doing the work. Every phase has a purpose.</p></section>
    <section className="section-pad full-process"><ol>{processSteps.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{description}</p></div></li>)}</ol></section>
    <section className="process-note section-pad"><p><strong>Good to know:</strong> Submitting a request does not guarantee acceptance, create a contract or commit you to payment. Scope, schedule and pricing exist only after they are agreed in writing.</p><Link className="button" to="/request">Request a Build <ArrowUpRight size={18} /></Link></section>
  </>;
}

export function AboutPage() {
  return <>
    <Seo title="About Francis & Pwavwe Studio" description="Meet Francis Pwavwe, a product builder in Ghana turning untidy real-world problems into useful digital systems." path="/about" />
    <section className="page-hero section-pad"><p className="eyebrow">ABOUT</p><h1>Personal attention.<br /><em>Product discipline.</em></h1><p>Pwavwe Studio is the focused build practice of Francis Pwavwe.</p></section>
    <section className="about-grid section-pad"><div className="about-statement"><span className="large-mark">P/</span><p>Based in Cape Coast, Ghana.<br />Working across borders.</p></div><div className="about-copy"><h2>I like problems that are still a little messy.</h2><p>I am Francis Pwavwe—a Tourism Management student, founder of AZ Learner and a product builder working across websites, applications, campus tools and practical AI systems.</p><p>The studio grew from building for situations I could see up close: students looking for clearer access to services, organisations managing important work through scattered messages, travellers needing a better booking path and early ideas that required more than a polished mock-up.</p><p>My tourism and campus leadership background keeps the work grounded in people, operations and service—not only screens. I design the journey, build the product and stay close enough to understand what breaks when it meets real life.</p><p>I am ambitious about what technology can do, but honest about scope, evidence and uncertainty. If an idea does not need AI, I will not force it in. If a first version should be smaller, I will say so.</p><Link className="button" to="/request">Tell me what you’re working on <ArrowUpRight size={18} /></Link></div></section>
    <section className="principles section-pad"><p className="eyebrow">WORKING PRINCIPLES</p><div><article><span>01</span><h3>Start with the situation</h3><p>Technology is selected after the people, constraints and desired change are understood.</p></article><article><span>02</span><h3>Make decisions visible</h3><p>Scope, trade-offs and exclusions should be clear enough for both sides to challenge.</p></article><article><span>03</span><h3>Build for handover</h3><p>A product should survive contact with the person who maintains it after launch.</p></article></div></section>
  </>;
}

export function ContactPage() {
  return <>
    <Seo title="Contact — Pwavwe Studio" description="Contact Francis Pwavwe about a website, application, campus platform, AI integration or product idea." path="/contact" />
    <section className="page-hero section-pad"><p className="eyebrow">CONTACT</p><h1>Choose the next<br /><em>useful conversation.</em></h1><p>For a new project, the structured request gives me the context to respond well. For everything else, email works.</p></section>
    <section className="contact-grid section-pad"><article><Mail /><p className="eyebrow">PROJECT REQUESTS</p><h2>Have a build in mind?</h2><p>Share the problem, users, timeline and budget range. You will receive a reference number immediately.</p><Link className="button" to="/request">Request a Build <ArrowUpRight size={18} /></Link></article>{hasWhatsApp() && <article><Phone /><p className="eyebrow">WHATSAPP</p><h2>Chat on WhatsApp</h2><p>Best for quick questions, updates and voice notes — fast, informal back-and-forth about a build.</p><a className="button" href={whatsappLink('Hi Francis, I found Pwavwe Studio and would like to talk about a build.')} target="_blank" rel="noopener noreferrer" onClick={() => void track('contact_whatsapp_click', { location: 'contact' })}>Message on WhatsApp <ArrowUpRight size={16} /></a></article>}<article><MessageCircle /><p className="eyebrow">PROJECT EMAIL</p><h2>{studio.email}</h2><p>Use this for project follow-ups, partnership enquiries and studio-related questions.</p><a className="text-link" href={`mailto:${studio.email}`} onClick={() => void track('contact_email_click', { location: 'contact' })}>Write an email <ArrowUpRight size={16} /></a></article><article><Video /><p className="eyebrow">PERSONAL REPLY</p><h2>{studio.personalEmail}</h2><p>Best for speaking invitations, personal correspondence and conversations outside a formal project request.</p><a className="text-link" href={`mailto:${studio.personalEmail}`}>Contact Francis <ArrowUpRight size={16} /></a></article></section>
  </>;
}

export function PrivacyPage() {
  return <LegalLayout title="Privacy Notice" path="/privacy" effective="Effective date: 31 July 2026 (editable before formal legal review)">
    <h2>What this notice covers</h2><p>This notice explains how Pwavwe Studio handles information sent through this website. It is written in plain English and is not a claim that the notice has received independent legal review.</p>
    <h2>Information collected</h2><p>A project request may include your name, email, optional phone number, organisation, project description, intended users, features, timeline, budget range, links, notes and contact preferences. Technical anti-abuse signals may be processed temporarily. Admin sign-in records include basic account identity information.</p>
    <h2>Why it is collected</h2><p>The information is used to review your request, ask useful questions, prepare a proposal when appropriate, manage the project pipeline, prevent abuse and keep a record of decisions. The information is not sold.</p>
    <h2>Contact and marketing consent</h2><p>Permission to contact you about a project is required for submission. Marketing consent is separate, optional and unchecked by default. Choosing it creates a separate consent record; not choosing it does not affect your request.</p>
    <h2>Access, retention and service providers</h2><p>Authorised studio administrators and trusted service providers used to host, secure and deliver the service may process the information. Project requests may be retained while they are active and for a reasonable business-record period afterwards, then deleted or anonymised when no longer needed. A final retention schedule should be set after formal business and legal review.</p>
    <h2>Your choices</h2><p>You may ask for access, correction or deletion where appropriate by emailing <a href="mailto:projects@pwavwe.com">projects@pwavwe.com</a>. Marketing messages must provide a way to unsubscribe.</p>
    <h2>Business information</h2><p>Business address and formal registration details: <strong>add when available or legally required.</strong></p>
  </LegalLayout>;
}

export function TermsPage() {
  return <LegalLayout title="Terms & Request Disclaimer" path="/terms" effective="Effective date: 31 July 2026 (editable before formal legal review)">
    <h2>A request is not a contract</h2><p>Submitting a project request does not guarantee acceptance, reserve a schedule, create a contract or commit either party to payment. Prices, milestones and delivery dates are confirmed only in a written proposal or agreement.</p>
    <h2>Scope and intellectual property</h2><p>Features, responsibilities, exclusions, ownership, licences and intellectual-property terms are defined per project. Do not assume that a draft, proposal or conversation transfers rights.</p>
    <h2>Materials you supply</h2><p>You must have permission to provide and use text, images, data, trademarks, code and other materials supplied for a project. Do not send sensitive data unless it is necessary and an appropriate handling method has been agreed.</p>
    <h2>Projects that may be declined</h2><p>Pwavwe Studio may decline work that is illegal, deceptive, unsafe, exploitative or outside available capacity. No academic cheating, impersonation, fabricated data, dishonest research or falsification services are provided.</p>
    <h2>Accuracy and availability</h2><p>Project information on this site describes current or past work in good faith. External services and links may change. Any product warranties or support commitments are set out in the relevant project agreement.</p>
    <h2>Formal details</h2><p>Business address and formal registration information: <strong>add when available or required.</strong> Contact <a href="mailto:projects@pwavwe.com">projects@pwavwe.com</a> with questions.</p>
  </LegalLayout>;
}

function LegalLayout({ title, path, effective, children }: { title: string; path: string; effective: string; children: React.ReactNode }) {
  return <><Seo title={`${title} — Pwavwe Studio`} description={`${title} for project requests and website use at Pwavwe Studio.`} path={path} /><header className="legal-hero section-pad"><p className="eyebrow">INFORMATION</p><h1>{title}</h1><p>{effective}</p></header><article className="legal-copy section-pad">{children}</article></>;
}
