import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { track } from '../lib/analytics';
import { MotionLayer } from './MotionLayer';

const navigation = [
  ['/work', 'Work'], ['/services', 'Services'], ['/process', 'Process'],
  ['/about', 'About'], ['/contact', 'Contact'],
] as const;

export function Layout() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

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
          {navigation.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
        <Link className="button button-small header-cta" to="/request" onClick={() => void track('hero_request_click', { location: 'navigation' })}>Request a Build <ArrowUpRight size={16} /></Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
        <div className={`mobile-menu ${open ? 'is-open' : ''}`} id="mobile-menu" aria-hidden={!open}>
          <nav aria-label="Mobile navigation">
            {navigation.map(([to, label]) => <NavLink key={to} to={to} tabIndex={open ? 0 : -1}>{label}</NavLink>)}
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
            {navigation.slice(0, 4).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          </nav>
          <nav aria-label="Footer information">
            <h2>Information</h2>
            <Link to="/request">Request a Build</Link>
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
