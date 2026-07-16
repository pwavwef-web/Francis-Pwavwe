import {
  ABOUT_HIGHLIGHTS,
  ABOUT_PARAGRAPHS,
  CERTIFICATES,
  EXPERIENCE,
  NAV_ITEMS,
  PROJECTS,
  SKILLS,
  SOCIALS,
  STATS,
} from '../data/content.ts';
import type { Project } from '../types.ts';
import { escapeHtml, qs, qsa } from '../util/dom.ts';
import { bindTilt } from './magnetic.ts';
import { openLightbox } from './lightbox.ts';

// ============================================================================
//  Content rendering — every section below is generated from the typed data
//  model in data/content.ts. Editing content never means touching markup.
// ============================================================================

export function renderContent(): void {
  renderNav();
  renderStats();
  renderAbout();
  renderProjects();
  renderCertificates();
  initPortfolioTabs();
  renderSkills();
  renderTimeline();
  bindTilt();
}

// --- Navigation links + socials ---
function renderNav(): void {
  const menu = qs('.nav-menu');
  if (menu) {
    menu.innerHTML = NAV_ITEMS.map(
      (item, i) =>
        `<li style="--i:${i}"><a href="#${item.id}" class="nav-link">${escapeHtml(
          item.label,
        )}</a></li>`,
    ).join('');
  }

  qsa('[data-socials]').forEach((holder) => {
    holder.innerHTML = SOCIALS.map(
      (s) =>
        `<a class="social-link" href="${s.href}" ${
          s.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''
        } aria-label="${escapeHtml(s.label)}"><span>${escapeHtml(s.icon)}</span></a>`,
    ).join('');
  });
}

// --- Stats ---
function renderStats(): void {
  const holder = qs('[data-stats]');
  if (!holder) return;
  holder.innerHTML = STATS.map(
    (s) => `
    <div class="stat" data-reveal="up">
      <div class="stat__value"><span data-count="${s.value}">0</span>${escapeHtml(s.suffix)}</div>
      <div class="stat__label">${escapeHtml(s.label)}</div>
    </div>`,
  ).join('');
}

// --- About ---
function renderAbout(): void {
  const text = qs('[data-about-text]');
  if (text) {
    text.innerHTML = ABOUT_PARAGRAPHS.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  }
  const highlights = qs('[data-about-highlights]');
  if (highlights) {
    highlights.innerHTML = ABOUT_HIGHLIGHTS.map(
      (hl) => `
      <div class="highlight tilt">
        <span class="highlight__label">${escapeHtml(hl.label)}</span>
        <span class="highlight__value">${escapeHtml(hl.value)}</span>
      </div>`,
    ).join('');
  }
}

// --- Projects with category filter ---
function projectVisualId(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const PROJECT_COVERS: Readonly<Record<string, string>> = {
  'ucc-src-app': 'assets/project-covers/ucc-src-app.webp',
  'smg-transport-agency': 'assets/project-covers/smg-transport-agency.webp',
  'vitaforge-ai': 'assets/project-covers/vitaforge-ai.webp',
  'pollaris-election-platform': 'assets/project-covers/pollaris.webp',
  'hallkey': 'assets/project-covers/hallkey.webp',
  'az-learner': 'assets/project-covers/az-learner.webp',
  'personal-swot-analysis-quiz': 'assets/project-covers/swot-quiz.webp',
  'project-kassena': 'assets/project-covers/project-kassena.webp',
  'advanced-tourism-concepts-ebook': 'assets/project-covers/tourism-ebook.webp',
  'francis-pwavwe-productions': 'assets/project-covers/productions.webp',
  'campus-sustainability-operations': 'assets/project-covers/sustainability-operations.webp',
  'luban-workshop-restaurant': 'assets/project-covers/luban-workshop.webp',
  'torchlight-tours-social-strategy': 'assets/project-covers/torchlight-tours.webp',
  'journey-to-the-east': 'assets/project-covers/journey-east.webp',
  'tourism-research-and-analysis': 'assets/project-covers/tourism-research.webp',
};

function projectCard(p: Project): string {
  const iconHtml = p.iconIsImage
    ? `<img src="${p.icon}" alt="" class="project__icon-img" loading="lazy">`
    : escapeHtml(p.icon);
  const link = p.link
    ? `<a href="${p.link.href}" class="project__link" ${
        p.link.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''
      } aria-label="${escapeHtml(p.link.label)}">Learn More <span aria-hidden="true">-></span></a>`
    : '';
  const meta = p.meta ? `<p class="project__meta">${escapeHtml(p.meta)}</p>` : '';
  const badges = p.liveBadges?.length
    ? `<div class="project__badges" aria-label="Live store stats">${p.liveBadges
        .map(
          (badge) =>
            `<img src="${badge.src}" alt="${escapeHtml(badge.label)}" loading="lazy" decoding="async">`,
        )
        .join('')}</div>`
    : '';
  const status = p.status ? `<span class="project__status">${escapeHtml(p.status)}</span>` : '';
  const year = p.year ? `<span class="project__year">${escapeHtml(p.year)}</span>` : '';
  const impact = p.impact
    ? `<div class="project__impact"><span>Impact</span><p>${escapeHtml(p.impact)}</p></div>`
    : '';
  const visualId = projectVisualId(p.title);
  const coverImage = p.coverImage ?? PROJECT_COVERS[visualId];
  const cover = coverImage
    ? `<img src="${coverImage}" alt="" class="project__cover-img" loading="lazy" decoding="async">`
    : '';
  return `
    <article class="project tilt ${p.featured ? 'is-featured' : ''}" data-tags="${p.tags.join(
      ',',
    )}" data-visual="${visualId}">
      <div class="project__cover">
        ${cover}
        <div class="project__cover-shade" aria-hidden="true"></div>
        <div class="project__labels">${status}${year}</div>
        <div class="project__cover-mark" aria-hidden="true">
          <div class="project__icon">${iconHtml}</div>
        </div>
      </div>
      <div class="project__body">
        <h3 class="project__title">${escapeHtml(p.title)}</h3>
        <p class="project__category">${escapeHtml(p.category)}</p>
        ${badges}
        <p class="project__desc">${escapeHtml(p.description)}</p>
        ${impact}
        <div class="project__tags">${p.tags
          .map((t) => `<span class="pill">${escapeHtml(t)}</span>`)
          .join('')}</div>
        ${meta}
        ${link}
      </div>
    </article>`;
}

function renderProjects(): void {
  const grid = qs('[data-projects]');
  const filters = qs('[data-project-filters]');
  const prev = qs<HTMLButtonElement>('[data-project-prev]');
  const next = qs<HTMLButtonElement>('[data-project-next]');
  if (!grid) return;

  const categories = ['All', ...new Set(PROJECTS.flatMap((p) => p.tags))];
  if (filters) {
    filters.innerHTML = categories
      .map(
        (c, i) =>
          `<button class="chip ${i === 0 ? 'is-active' : ''}" data-filter="${escapeHtml(
            c,
          )}">${escapeHtml(c)}</button>`,
      )
      .join('');
  }

  grid.innerHTML = PROJECTS.map(projectCard).join('');
  bindTilt(grid);

  const scrollProjects = (direction: 1 | -1): void => {
    const card = grid.querySelector<HTMLElement>('.project:not(.is-hidden)');
    const distance = card ? card.offsetWidth + 24 : Math.round(grid.clientWidth * 0.9);
    grid.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  prev?.addEventListener('click', () => scrollProjects(-1));
  next?.addEventListener('click', () => scrollProjects(1));

  filters?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (!btn) return;
    const filter = btn.dataset.filter ?? 'All';
    qsa('.chip', filters).forEach((c) => c.classList.toggle('is-active', c === btn));
    qsa<HTMLElement>('.project', grid).forEach((card) => {
      const tags = (card.dataset.tags ?? '').split(',');
      const show = filter === 'All' || tags.includes(filter);
      card.classList.toggle('is-hidden', !show);
    });
    grid.scrollTo({ left: 0, behavior: 'smooth' });
  });
}

type PortfolioView = 'projects' | 'certificates';

function setPortfolioView(view: PortfolioView): void {
  const tabs = qsa<HTMLButtonElement>('[data-work-tab]');
  const panels = qsa<HTMLElement>('[data-work-panel]');

  tabs.forEach((tab) => {
    const isActive = tab.dataset.workTab === view;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.workPanel === view;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;

    if (isActive) {
      const rail = qs<HTMLElement>('[data-projects], [data-certificates]', panel);
      rail?.scrollTo({ left: 0, behavior: 'smooth' });
    }
  });
}

function initPortfolioTabs(): void {
  const tabs = qsa<HTMLButtonElement>('[data-work-tab]');
  if (!tabs.length) return;

  const viewForTab = (tab: HTMLButtonElement): PortfolioView =>
    tab.dataset.workTab === 'certificates' ? 'certificates' : 'projects';

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setPortfolioView(viewForTab(tab)));

    tab.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;

      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      const nextTab = tabs[nextIndex];
      nextTab.focus();
      setPortfolioView(viewForTab(nextTab));
    });
  });

  setPortfolioView(window.location.hash === '#credentials' ? 'certificates' : 'projects');

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#credentials') setPortfolioView('certificates');
  });
}

// --- Skills ---
function renderSkills(): void {
  const grid = qs('[data-skills]');
  if (!grid) return;
  grid.innerHTML = SKILLS.map(
    (s) => `
    <div class="skill tilt">
      <div class="skill__glow"></div>
      <div class="skill__icon">${escapeHtml(s.icon)}</div>
      <h3 class="skill__name">${escapeHtml(s.name)}</h3>
      <p class="skill__desc">${escapeHtml(s.description)}</p>
    </div>`,
  ).join('');
  bindTilt(grid);
}

// --- Timeline ---
function renderTimeline(): void {
  const timeline = qs('[data-timeline]');
  if (!timeline) return;
  timeline.innerHTML =
    '<div class="timeline__line"><div class="timeline__progress"></div></div>' +
    EXPERIENCE.map(
      (item, i) => `
      <div class="timeline__item" data-reveal="${i % 2 === 0 ? 'right' : 'left'}">
        <div class="timeline__marker" data-kind="${item.kind}"></div>
        <div class="timeline__card tilt">
          <span class="timeline__badge">${escapeHtml(item.kind)}</span>
          <h3 class="timeline__title">${escapeHtml(item.title)}</h3>
          <p class="timeline__company">${escapeHtml(item.company)}</p>
          <p class="timeline__date">${escapeHtml(item.date)}</p>
          <p class="timeline__desc">${escapeHtml(item.description)}</p>
        </div>
      </div>`,
    ).join('');
}

// --- Certificates (grid + lightbox) ---
function renderCertificates(): void {
  const grid = qs('[data-certificates]');
  const prev = qs<HTMLButtonElement>('[data-cert-prev]');
  const next = qs<HTMLButtonElement>('[data-cert-next]');
  if (!grid) return;
  grid.innerHTML = CERTIFICATES.map((c, i) => {
    const preview = c.image
      ? `<img src="${c.image}" alt="${escapeHtml(c.title)}" class="cert__img" loading="lazy">`
      : `<span class="cert__pdf">PDF</span>`;
    const variantClass = c.variant ? ` cert--${c.variant}` : '';
    return `
      <article class="cert tilt${variantClass}" data-cert="${i}" tabindex="0" role="button" aria-label="Open ${escapeHtml(
        c.title,
      )} credential">
        <div class="cert__preview">${preview}</div>
        <div class="cert__info">
          <h3 class="cert__title">${escapeHtml(c.title)}</h3>
          <p class="cert__issuer">${escapeHtml(c.issuer)}</p>
          <p class="cert__date">${escapeHtml(c.date)}</p>
        </div>
      </article>`;
  }).join('');
  bindTilt(grid);

  const scrollCertificates = (direction: 1 | -1): void => {
    const card = grid.querySelector<HTMLElement>('.cert');
    const distance = card ? card.offsetWidth + 24 : Math.round(grid.clientWidth * 0.9);
    grid.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  const openCertificate = (card: HTMLElement): void => {
    if (!card) return;
    const cert = CERTIFICATES[Number(card.dataset.cert)];
    if (cert.image) openLightbox(cert.image, cert.title);
    else window.open(cert.href, '_blank', 'noopener');
  };

  prev?.addEventListener('click', () => scrollCertificates(-1));
  next?.addEventListener('click', () => scrollCertificates(1));

  grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-cert]');
    if (card) openCertificate(card);
  });

  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-cert]');
    if (!card) return;
    e.preventDefault();
    openCertificate(card);
  });
}
