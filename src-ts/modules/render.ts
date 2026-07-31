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
import type { Certificate, ExperienceItem, Project } from '../types.ts';
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
    <article class="project ${p.featured ? 'is-featured' : ''}" data-tags="${p.tags.join(
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

function visibleFlowItems(rail: HTMLElement, selector: string): HTMLElement[] {
  return qsa<HTMLElement>(selector, rail).filter((item) => !item.classList.contains('is-hidden'));
}

interface FlowState {
  selector: string;
  activeItem: HTMLElement | null;
  pointerStart: number | null;
  wheelLocked: boolean;
}

const FLOW_STATES = new WeakMap<HTMLElement, FlowState>();

function paintFlowRail(rail: HTMLElement, selector: string): number {
  const items = visibleFlowItems(rail, selector);
  const state = FLOW_STATES.get(rail);
  let active = state?.activeItem ? items.indexOf(state.activeItem) : -1;
  if (active < 0) active = Math.min(1, Math.max(items.length - 1, 0));

  if (state) state.activeItem = items[active] ?? null;

  items.forEach((item, index) => {
    let delta = index - active;
    if (items.length > 2) {
      if (delta > items.length / 2) delta -= items.length;
      if (delta < -items.length / 2) delta += items.length;
    }

    const position =
      delta === 0
        ? 'center'
        : delta === -1
          ? 'left'
          : delta === 1
            ? 'right'
            : delta === -2
              ? 'far-left'
              : delta === 2
                ? 'far-right'
                : 'hidden';
    item.dataset.flowPosition = position;
    item.setAttribute('aria-hidden', String(position === 'hidden'));
    item.inert = position === 'hidden';
    if (position === 'center') item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });

  return active;
}

function centerFlowItem(rail: HTMLElement, selector: string, index: number): void {
  const items = visibleFlowItems(rail, selector);
  if (!items.length) return;
  const state = FLOW_STATES.get(rail);
  if (state) state.activeItem = items[(index + items.length) % items.length];
  paintFlowRail(rail, selector);
}

function resetFlowRail(rail: HTMLElement, selector: string): void {
  const items = visibleFlowItems(rail, selector);
  centerFlowItem(rail, selector, items.length > 2 ? 1 : 0);
}

function initFlowRail(rail: HTMLElement, selector: string): void {
  const state: FlowState = {
    selector,
    activeItem: null,
    pointerStart: null,
    wheelLocked: false,
  };
  FLOW_STATES.set(rail, state);
  rail.tabIndex = 0;
  rail.setAttribute('role', 'region');
  rail.setAttribute('aria-roledescription', 'carousel');

  rail.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    moveFlowRail(rail, selector, event.key === 'ArrowRight' ? 1 : -1);
  });

  rail.addEventListener(
    'wheel',
    (event) => {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontalIntent || state.wheelLocked) return;
      event.preventDefault();
      state.wheelLocked = true;
      moveFlowRail(rail, selector, (event.deltaX || event.deltaY) > 0 ? 1 : -1);
      window.setTimeout(() => {
        state.wheelLocked = false;
      }, 360);
    },
    { passive: false },
  );

  rail.addEventListener('pointerdown', (event) => {
    state.pointerStart = event.clientX;
    rail.setPointerCapture?.(event.pointerId);
  });

  rail.addEventListener('pointerup', (event) => {
    if (state.pointerStart === null) return;
    const distance = event.clientX - state.pointerStart;
    state.pointerStart = null;
    if (Math.abs(distance) >= 44) moveFlowRail(rail, selector, distance < 0 ? 1 : -1);
  });

  rail.addEventListener('pointercancel', () => {
    state.pointerStart = null;
  });

  rail.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>(selector);
    if (!item || item.dataset.flowPosition === 'center') return;
    const items = visibleFlowItems(rail, selector);
    centerFlowItem(rail, selector, items.indexOf(item));
  });

  window.requestAnimationFrame(() => resetFlowRail(rail, selector));
}

function moveFlowRail(rail: HTMLElement, selector: string, direction: 1 | -1): void {
  const items = visibleFlowItems(rail, selector);
  if (!items.length) return;
  const active = paintFlowRail(rail, selector);
  centerFlowItem(rail, selector, active + direction);
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
          `<button class="chip ${i === 0 ? 'is-active' : ''}" type="button" aria-pressed="${
            i === 0
          }" data-filter="${escapeHtml(
            c,
          )}">${escapeHtml(c)}</button>`,
      )
      .join('');
  }

  grid.innerHTML = PROJECTS.map(projectCard).join('');
  initFlowRail(grid, '.project');

  const scrollProjects = (direction: 1 | -1): void => {
    moveFlowRail(grid, '.project', direction);
  };

  prev?.addEventListener('click', () => scrollProjects(-1));
  next?.addEventListener('click', () => scrollProjects(1));

  filters?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (!btn) return;
    const filter = btn.dataset.filter ?? 'All';
    qsa<HTMLButtonElement>('.chip', filters).forEach((c) => {
      const isActive = c === btn;
      c.classList.toggle('is-active', isActive);
      c.setAttribute('aria-pressed', String(isActive));
    });
    qsa<HTMLElement>('.project', grid).forEach((card) => {
      const tags = (card.dataset.tags ?? '').split(',');
      const show = filter === 'All' || tags.includes(filter);
      card.classList.toggle('is-hidden', !show);
    });
    resetFlowRail(grid, '.project');
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
      if (rail) {
        resetFlowRail(rail, rail.matches('[data-certificates]') ? '.cert' : '.project');
      }
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
    if (window.location.hash === '#work') setPortfolioView('projects');
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

// --- Journey chapter viewer ---
type JourneyFilter = 'All' | ExperienceItem['kind'];

const JOURNEY_FILTERS: readonly { value: JourneyFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'work', label: 'Work' },
  { value: 'education', label: 'Learning' },
  { value: 'simulation', label: 'Simulations' },
];

function renderTimeline(): void {
  const timeline = qs('[data-timeline]');
  if (!timeline) return;
  timeline.innerHTML = `
    <div class="journey__filters" role="tablist" aria-label="Journey categories">
      ${JOURNEY_FILTERS.map(
        ({ value, label }, index) =>
          `<button class="journey__filter${index === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-journey-filter="${value}">${label}</button>`,
      ).join('')}
    </div>
    <div class="journey__viewer" aria-live="polite">
      <div class="journey__index" data-journey-index></div>
      <article class="journey__card" data-journey-card></article>
      <div class="journey__controls">
        <button class="journey__control" type="button" data-journey-prev aria-label="Previous journey chapter">&lsaquo;</button>
        <span class="journey__count" data-journey-count></span>
        <button class="journey__control" type="button" data-journey-next aria-label="Next journey chapter">&rsaquo;</button>
      </div>
    </div>`;

  const card = qs<HTMLElement>('[data-journey-card]', timeline);
  const index = qs<HTMLElement>('[data-journey-index]', timeline);
  const count = qs<HTMLElement>('[data-journey-count]', timeline);
  const previous = qs<HTMLButtonElement>('[data-journey-prev]', timeline);
  const next = qs<HTMLButtonElement>('[data-journey-next]', timeline);
  if (!card || !index || !count) return;

  let filter: JourneyFilter = 'All';
  let active = 0;

  const filteredItems = (): readonly ExperienceItem[] =>
    filter === 'All' ? EXPERIENCE : EXPERIENCE.filter((item) => item.kind === filter);

  const paintJourney = (): void => {
    const items = filteredItems();
    active = (active + items.length) % items.length;
    const item = items[active];

    index.innerHTML = items
      .map(
        (chapter, chapterIndex) => `
          <button class="journey__chapter${chapterIndex === active ? ' is-active' : ''}" type="button" data-journey-chapter="${chapterIndex}" aria-label="Open ${escapeHtml(chapter.title)}">
            <span>${escapeHtml(chapter.date)}</span>
            <strong>${escapeHtml(chapter.title)}</strong>
          </button>`,
      )
      .join('');

    card.innerHTML = `
      <div class="journey__card-topline">
        <span class="timeline__badge">${escapeHtml(item.kind)}</span>
        <span class="journey__number">${String(active + 1).padStart(2, '0')}</span>
      </div>
      <p class="timeline__date">${escapeHtml(item.date)}</p>
      <h3 class="timeline__title">${escapeHtml(item.title)}</h3>
      <p class="timeline__company">${escapeHtml(item.company)}</p>
      <p class="timeline__desc">${escapeHtml(item.description)}</p>`;
    card.dataset.kind = item.kind;
    count.textContent = `${active + 1} / ${items.length}`;
  };

  const move = (direction: 1 | -1): void => {
    active += direction;
    paintJourney();
  };

  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));

  timeline.addEventListener('click', (event) => {
    const filterButton = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-journey-filter]',
    );
    if (filterButton) {
      filter = (filterButton.dataset.journeyFilter ?? 'All') as JourneyFilter;
      active = 0;
      qsa<HTMLButtonElement>('[data-journey-filter]', timeline).forEach((button) => {
        const isActive = button === filterButton;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });
      paintJourney();
      return;
    }

    const chapter = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-journey-chapter]',
    );
    if (!chapter) return;
    active = Number(chapter.dataset.journeyChapter ?? 0);
    paintJourney();
  });

  timeline.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });

  paintJourney();
}

// --- Certificates (grid + lightbox) ---
function certificateTags(c: Certificate): readonly string[] {
  if (c.tags?.length) return c.tags;

  const haystack = `${c.title} ${c.issuer}`.toLowerCase();
  const tags: string[] = [];
  if (/(^|[^a-z])(ai|genai)([^a-z]|$)/.test(haystack)) tags.push('AI');
  if (haystack.includes('aspire') || haystack.includes('cadet') || haystack.includes('nels')) {
    tags.push('Leadership');
  }
  if (haystack.includes('kempinski') || haystack.includes('hotel')) tags.push('Hospitality');
  if (
    haystack.includes('aspire') ||
    haystack.includes('coursera') ||
    haystack.includes('forage') ||
    haystack.includes('nels') ||
    haystack.includes('outskill')
  ) {
    tags.push('Programs');
  }
  if (!tags.length) tags.push('Programs');
  return tags;
}

function certificateCard(c: Certificate, i: number): string {
  const preview = c.image
    ? `<img src="${c.image}" alt="${escapeHtml(c.title)}" class="cert__img" loading="lazy">`
    : `<span class="cert__pdf">PDF</span>`;
  const variantClass = c.variant ? ` cert--${c.variant}` : '';
  const tags = certificateTags(c).join(',');
  return `
    <article class="cert${variantClass}" data-cert="${i}" data-tags="${escapeHtml(
      tags,
    )}" tabindex="0" role="button" aria-label="Open ${escapeHtml(c.title)} credential">
      <div class="cert__preview">${preview}</div>
      <div class="cert__info">
        <h3 class="cert__title">${escapeHtml(c.title)}</h3>
        <p class="cert__issuer">${escapeHtml(c.issuer)}</p>
        <p class="cert__date">${escapeHtml(c.date)}</p>
      </div>
    </article>`;
}

function renderCertificates(): void {
  const grid = qs('[data-certificates]');
  const filters = qs('[data-cert-filters]');
  const prev = qs<HTMLButtonElement>('[data-cert-prev]');
  const next = qs<HTMLButtonElement>('[data-cert-next]');
  if (!grid) return;

  const categories = ['All', ...new Set(CERTIFICATES.flatMap(certificateTags))];
  if (filters) {
    filters.innerHTML = categories
      .map(
        (c, i) =>
          `<button class="chip ${i === 0 ? 'is-active' : ''}" type="button" aria-pressed="${
            i === 0
          }" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`,
      )
      .join('');
  }

  grid.innerHTML = CERTIFICATES.map(certificateCard).join('');
  initFlowRail(grid, '.cert');

  const scrollCertificates = (direction: 1 | -1): void => {
    moveFlowRail(grid, '.cert', direction);
  };

  const openCertificate = (card: HTMLElement): void => {
    if (!card) return;
    const cert = CERTIFICATES[Number(card.dataset.cert)];
    if (cert.image) openLightbox(cert.image, cert.title);
    else window.open(cert.href, '_blank', 'noopener');
  };

  prev?.addEventListener('click', () => scrollCertificates(-1));
  next?.addEventListener('click', () => scrollCertificates(1));

  filters?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (!btn) return;
    const filter = btn.dataset.filter ?? 'All';
    qsa<HTMLButtonElement>('.chip', filters).forEach((c) => {
      const isActive = c === btn;
      c.classList.toggle('is-active', isActive);
      c.setAttribute('aria-pressed', String(isActive));
    });
    qsa<HTMLElement>('.cert', grid).forEach((card) => {
      const tags = (card.dataset.tags ?? '').split(',');
      const show = filter === 'All' || tags.includes(filter);
      card.classList.toggle('is-hidden', !show);
    });
    resetFlowRail(grid, '.cert');
  });

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
