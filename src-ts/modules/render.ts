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
  renderSkills();
  renderTimeline();
  renderCertificates();
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
function projectCard(p: Project): string {
  const iconHtml = p.iconIsImage
    ? `<img src="${p.icon}" alt="" class="project__icon-img" loading="lazy">`
    : escapeHtml(p.icon);
  const link = p.link
    ? `<a href="${p.link.href}" class="project__link" ${
        p.link.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''
      }>${escapeHtml(p.link.label)} <span aria-hidden="true">-></span></a>`
    : '';
  const meta = p.meta ? `<p class="project__meta">${escapeHtml(p.meta)}</p>` : '';
  const status = p.status ? `<span class="project__status">${escapeHtml(p.status)}</span>` : '';
  const year = p.year ? `<span class="project__year">${escapeHtml(p.year)}</span>` : '';
  const impact = p.impact
    ? `<div class="project__impact"><span>Impact</span><p>${escapeHtml(p.impact)}</p></div>`
    : '';
  return `
    <article class="project tilt ${p.featured ? 'is-featured' : ''}" data-tags="${p.tags.join(
      ',',
    )}">
      <div class="project__top">
        <div class="project__icon">${iconHtml}</div>
        <div class="project__labels">${status}${year}</div>
      </div>
      <h3 class="project__title">${escapeHtml(p.title)}</h3>
      <p class="project__category">${escapeHtml(p.category)}</p>
      <p class="project__desc">${escapeHtml(p.description)}</p>
      ${impact}
      <div class="project__tags">${p.tags
        .map((t) => `<span class="pill">${escapeHtml(t)}</span>`)
        .join('')}</div>
      ${meta}
      ${link}
    </article>`;
}

function renderProjects(): void {
  const grid = qs('[data-projects]');
  const filters = qs('[data-project-filters]');
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
  if (!grid) return;
  grid.innerHTML = CERTIFICATES.map((c, i) => {
    const preview = c.image
      ? `<img src="${c.image}" alt="${escapeHtml(c.title)}" class="cert__img" loading="lazy">`
      : `<span class="cert__pdf">PDF</span>`;
    return `
      <article class="cert tilt" data-cert="${i}">
        <div class="cert__preview">${preview}</div>
        <div class="cert__info">
          <h3 class="cert__title">${escapeHtml(c.title)}</h3>
          <p class="cert__issuer">${escapeHtml(c.issuer)}</p>
          <p class="cert__date">${escapeHtml(c.date)}</p>
        </div>
      </article>`;
  }).join('');
  bindTilt(grid);

  grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-cert]');
    if (!card) return;
    const cert = CERTIFICATES[Number(card.dataset.cert)];
    if (cert.image) openLightbox(cert.image, cert.title);
    else window.open(cert.href, '_blank', 'noopener');
  });
}
