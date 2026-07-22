import './styles/main.css';
import { SOCIALS } from './data/content.ts';
import { escapeHtml, onReady, qs, qsa } from './util/dom.ts';
import type { BlogDoc } from './types.ts';
import {
  bindGlobalModalKeys,
  blogCard,
  closeBlogModal,
  extractText,
  fetchAllBlogs,
  hashBlogId,
  openBlogExternal,
  openBlogModal,
  shareBlog,
} from './modules/blog-core.ts';

// ============================================================================
//  /blogs — the full writing archive. Loads every post from the Blogger feed,
//  features the newest one, lays the rest out in a responsive grid, and adds a
//  live search filter. Reading, sharing and sanitising are handled by
//  ./modules/blog-core.ts (shared with the landing rail).
// ============================================================================

let all: BlogDoc[] = [];
let loaded = false;

const byId = (id: string): BlogDoc | undefined => all.find((b) => b.id === id);

// --- Socials in the top bar (data-driven, matches the portfolio) ---
function renderSocials(): void {
  qsa('[data-socials]').forEach((holder) => {
    holder.innerHTML = SOCIALS.map(
      (s) =>
        `<a class="social-link" href="${s.href}" ${
          s.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''
        } aria-label="${escapeHtml(s.label)}"><span>${escapeHtml(s.icon)}</span></a>`,
    ).join('');
  });
}

// --- Entrance animation — deliberately fail-safe. The fade-up only plays while
//     <body> carries `is-revealing`; if the script never runs (or errors), the
//     [data-reveal] elements keep their natural opacity and stay fully visible.
//     No content is ever gated behind a decorative effect. ---
function startReveal(): void {
  document.body.classList.add('is-revealing');
  staggerReveal(qsa<HTMLElement>('.blogpage__hero [data-reveal]'), 90, 540);
}
function staggerReveal(els: HTMLElement[], step = 45, cap = 480): void {
  els.forEach((el, i) => {
    el.style.animationDelay = `${Math.min(i * step, cap)}ms`;
  });
}
function endReveal(): void {
  document.body.classList.remove('is-revealing');
}

// --- Rendering ---
function updateCount(shown: number, total: number): void {
  const el = qs('[data-blog-count]');
  if (!el) return;
  if (shown === total) {
    el.textContent = total === 1 ? '1 post' : `${total} posts`;
  } else {
    el.textContent = `${shown} of ${total} posts`;
  }
}

function renderFeed(posts: BlogDoc[], useFeatured = true): void {
  const featured = qs('#blogsFeatured');
  const grid = qs('#blogsGrid');
  const noResults = qs('#blogsNoResults');
  if (!featured || !grid) return;

  if (!posts.length) {
    featured.innerHTML = '';
    grid.innerHTML = '';
    if (noResults) noResults.hidden = false;
    return;
  }
  if (noResults) noResults.hidden = true;

  if (useFeatured) {
    // Default view: spotlight the newest post, grid the rest.
    const [first, ...rest] = posts;
    featured.innerHTML = blogCard(first, { featured: true, showMinutes: true });
    grid.innerHTML = rest.map((blog) => blogCard(blog, { showMinutes: true })).join('');
  } else {
    // Filtered view: no "Latest" spotlight — every match is an equal grid card.
    featured.innerHTML = '';
    grid.innerHTML = posts.map((blog) => blogCard(blog, { showMinutes: true })).join('');
  }

  // Stagger the cards' entrance only during the initial reveal window.
  if (document.body.classList.contains('is-revealing')) {
    staggerReveal(qsa<HTMLElement>('#blogsFeatured .blog-card, #blogsGrid .blog-card'), 45, 480);
  }
}

// --- Search filter ---
function applyFilter(query: string): void {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderFeed(all);
    updateCount(all.length, all.length);
    return;
  }
  const matches = all.filter((blog) => {
    const haystack = `${blog.title ?? ''} ${extractText(blog.content ?? '')}`.toLowerCase();
    return haystack.includes(q);
  });
  renderFeed(matches, false);
  updateCount(matches.length, all.length);
}

function initSearch(): void {
  const input = qs<HTMLInputElement>('#blogSearch');
  if (!input) return;
  let timer = 0;
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => applyFilter(input.value), 140);
  });
}

// --- Delegated actions (open / external / share / card click) ---
function initActions(): void {
  const feed = qs('.blogpage__feed');
  if (!feed) return;
  feed.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (btn) {
      const id = btn.dataset.id!;
      if (btn.dataset.act === 'open') openBlogModal(byId(id));
      if (btn.dataset.act === 'external') openBlogExternal(byId(id));
      if (btn.dataset.act === 'share') shareBlog(byId(id));
      return;
    }
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-blog]');
    if (card) openBlogModal(byId(card.dataset.blog!));
  });
}

function openFromHash(): void {
  const id = hashBlogId();
  if (id && loaded) openBlogModal(byId(id));
}

function setYear(): void {
  const el = qs('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}

function boot(): void {
  setYear();
  renderSocials();
  bindGlobalModalKeys();
  startReveal();
  initSearch();
  initActions();

  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#blog-')) openFromHash();
    else closeBlogModal(true);
  });

  void fetchAllBlogs()
    .then((posts) => {
      all = posts;
      loaded = true;
      renderFeed(all);
      updateCount(all.length, all.length);
      openFromHash();
      // Close the entrance window so later filter re-renders appear instantly.
      window.setTimeout(endReveal, 1500);
    })
    .catch((err) => {
      console.error('blogger feed error', err);
      const grid = qs('#blogsGrid');
      const featured = qs('#blogsFeatured');
      const count = qs('[data-blog-count]');
      if (featured) featured.innerHTML = '';
      if (grid) {
        grid.innerHTML =
          '<div class="blog-empty">Unable to load the archive from Blogger right now. Please try again shortly, or visit <a href="https://blogs.pwavwe.com" target="_blank" rel="noopener">blogs.pwavwe.com</a>.</div>';
      }
      if (count) count.textContent = 'Archive unavailable';
      endReveal();
    });
}

onReady(boot);
