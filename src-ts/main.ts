import './styles/main.css';
import { PROFILE } from './data/content.ts';
import { onReady, qs } from './util/dom.ts';
import { initNav } from './modules/nav.ts';
import { renderContent } from './modules/render.ts';
import { initReveals, refreshScrollTriggers } from './modules/reveal.ts';
import { initMagnetic } from './modules/magnetic.ts';
import { initRoleRotator } from './modules/text-effects.ts';
import { initContact } from './modules/contact.ts';
import { initCvDownload } from './modules/cv.ts';
import { initBlogs } from './modules/blogs.ts';

// ============================================================================
//  Application entry — orchestrates boot order:
//  1. Render data-driven content into the DOM.
//  2. Wire interactions (nav, forms, blogs).
//  3. Start ambient visuals (background, cursor).
//  4. Kick scroll choreography once the preloader clears.
// ============================================================================

function boot(): void {
  // Build content from typed data before wiring anything that queries it.
  renderContent();

  // Interactions.
  initNav();
  initMagnetic();
  initContact();
  initCvDownload();
  initBlogs();

  // Rotating hero role.
  const roleEl = qs('#hero-role');
  if (roleEl) initRoleRotator(roleEl, PROFILE.roles);

  // Console signature (kept from the original site).
  console.log('%cFrancis Pwavwe%c — professional portfolio ready.', 'font-size:16px;font-weight:800;color:#1646a3', 'font-size:12px;color:#64748b');

  initReveals();
  // Re-measure once dynamic content + fonts settle.
  window.setTimeout(refreshScrollTriggers, 400);
}

onReady(boot);
