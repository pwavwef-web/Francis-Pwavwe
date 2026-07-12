import { prefersReducedMotion, qs, qsa } from '../util/dom.ts';

// ============================================================================
//  Navigation — sticky navbar that condenses on scroll, smooth in-page links,
//  a scroll-progress rail, scrollspy that lights the active link, and a
//  full-screen mobile menu.
// ============================================================================

export function initNav(): void {
  const navbar = qs('.navbar');
  const toggle = qs('.nav-toggle');
  const menu = qs('.nav-menu');
  const links = qsa<HTMLAnchorElement>('.nav-link');
  const progress = qs('.scroll-progress-bar');
  const sections = qsa<HTMLElement>('section[id]');

  // --- Smooth scroll + close menu ---
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('#')) return;
      const target = href === '#' ? null : document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
      closeMenu();
    });
  });

  // --- Mobile menu ---
  function closeMenu(): void {
    menu?.classList.remove('is-open');
    toggle?.classList.remove('is-active');
    document.body.classList.remove('menu-open');
  }
  toggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('is-open');
    toggle.classList.toggle('is-active', open);
    document.body.classList.toggle('menu-open', open);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // --- Scroll-driven UI (navbar condense + progress rail + scrollspy) ---
  let ticking = false;
  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      navbar?.classList.toggle('is-scrolled', y > 24);

      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      if (progress) progress.style.width = `${pct}%`;

      // Scrollspy — pick the section whose top has crossed the midline.
      const mid = y + window.innerHeight * 0.35;
      let activeId = sections[0]?.id ?? '';
      for (const section of sections) {
        if (section.offsetTop <= mid) activeId = section.id;
      }
      links.forEach((l) =>
        l.classList.toggle('is-active', l.getAttribute('href') === `#${activeId}`),
      );

      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
