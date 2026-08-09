import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { hasWhatsApp, whatsappLink } from '../data/studio';
import { track } from '../lib/analytics';
import { MotionLayer } from './MotionLayer';

const navigation = [
  ['/work', 'Work'], ['/services', 'Services'], ['/services#packages', 'Pricing'],
  ['/process', 'Process'], ['/about', 'About'], ['/contact', 'Contact'],
] as const;

export function Layout() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const location = useLocation();

  // "Pricing" is a jump-link to a section of the Services page, not a page of
  // its own, so it renders as a plain Link — no active state, no aria-current —
  // leaving "Services" as the single current-page indicator.
  const renderNav = (to: string, label: string, tabIndex?: number) =>
    to.includes('#')
      ? <Link key={to} to={to} tabIndex={tabIndex}>{label}</Link>
      : <NavLink key={to} to={to} tabIndex={tabIndex}>{label}</NavLink>;

  useEffect(() => {
    // Manage scroll ourselves so deep links with a hash are not overridden by
    // the browser restoring the previous position after our programmatic jump.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    setOpen(false);
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // A hash may target content on a lazy-loaded route that has not mounted
    // yet, so retry briefly until the element exists, then stop.
    const id = decodeURIComponent(location.hash.slice(1));
    let cancelled = false;
    let attempts = 0;
    const scrollToTarget = () => {
      if (cancelled) return;
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: 'start' });
      } else if (attempts++ < 20) {
        window.setTimeout(scrollToTarget, 50);
      }
    };
    scrollToTarget();
    return () => { cancelled = true; };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  return (
    <div className="site-shell">
      <MotionLayer />
      <a className="skip-link" href="#main-content">Skip to content</a>
      {!online && <div className="offline-banner" role="status">You are offline. Pages already loaded remain available; submissions will wait for a connection.</div>}
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Pwavwe Studio home">
          <span className="brand-mark" aria-hidden="true">P/</span>
          <span>Pwavwe <b>Studio</b></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(([to, label]) => renderNav(to, label))}
        </nav>
        <Link className="button button-small header-cta" to="/request" onClick={() => void track('hero_request_click', { location: 'navigation' })}>Request a Build <ArrowUpRight size={16} /></Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
        <div className={`mobile-menu ${open ? 'is-open' : ''}`} id="mobile-menu" aria-hidden={!open}>
          <nav aria-label="Mobile navigation">
            {navigation.map(([to, label]) => renderNav(to, label, open ? 0 : -1))}
            <NavLink className="mobile-primary" to="/request" tabIndex={open ? 0 : -1}>Request a Build <ArrowUpRight size={18} /></NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      {!location.pathname.startsWith('/request') && !location.pathname.startsWith('/admin') && (
        <Link className="floating-cta" to="/request">Request a Build <ArrowUpRight size={16} /></Link>
      )}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <Link className="brand footer-brand" to="/"><span className="brand-mark">P/</span><span>Pwavwe <b>Studio</b></span></Link>
            <p>Websites, apps and AI-enabled systems built from real problems—not tutorial clones.</p>
            <a href="mailto:projects@pwavwe.com" onClick={() => void track('contact_email_click', { location: 'footer' })}>projects@pwavwe.com</a>
          </div>
          <nav aria-label="Footer navigation">
            <h2>Explore</h2>
            {navigation.slice(0, 5).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          </nav>
          <nav aria-label="Footer information">
            <h2>Information</h2>
            <Link to="/request">Request a Build</Link>
            <Link to="/testimonials">Testimonials</Link>
            {hasWhatsApp() && <a href={whatsappLink('Hi Francis, I found Pwavwe Studio.')} target="_blank" rel="noopener noreferrer" onClick={() => void track('contact_whatsapp_click', { location: 'footer' })}>WhatsApp</a>}
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <a href="https://pwavwe.com">Personal website</a>
          </nav>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Pwavwe Studio</span><span>Built by Francis Pwavwe in Ghana.</span></div>
      </footer>
    </div>
  );
}
