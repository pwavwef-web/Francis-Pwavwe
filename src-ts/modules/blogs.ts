import type { BlogDoc } from '../types.ts';
import { prefersReducedMotion, qs } from '../util/dom.ts';
import {
  bindGlobalModalKeys,
  blogCard,
  closeBlogModal,
  fetchBlogs,
  hashBlogId,
  openBlogExternal,
  openBlogModal,
  shareBlog,
} from './blog-core.ts';

// ============================================================================
//  Landing insights rail — shows the most recent posts in a horizontal rail and
//  caps it with a "See all blogs" card that links to the full /blogs page. All
//  feed loading, sanitising and the reading modal live in ./blog-core.ts.
// ============================================================================

const RAIL_LIMIT = 7;
let blogs: BlogDoc[] = [];
let loaded = false;

const byId = (id: string): BlogDoc | undefined => blogs.find((b) => b.id === id);

function seeAllCard(): string {
  return `
    <a class="blog-card blog-card--all tilt" href="blogs.html" aria-label="See all blog posts">
      <div class="blog-card--all__inner">
        <span class="blog-card--all__glyph" aria-hidden="true">→</span>
        <h3 class="blog-card--all__title">See all blogs</h3>
        <p class="blog-card--all__text">Browse the full archive of The Pwavwe Papers.</p>
        <span class="blog-card--all__cta">Open the archive</span>
      </div>
    </a>`;
}

function renderCards(): void {
  const container = qs('#blogsContainer');
  if (!container) return;

  if (!blogs.length) {
    container.innerHTML = `<div class="blog-empty">No posts found on blogs.pwavwe.com yet.</div>`;
    return;
  }

  container.innerHTML = blogs.map((blog) => blogCard(blog)).join('') + seeAllCard();
}

export function initBlogs(): void {
  bindGlobalModalKeys();
  const container = qs('#blogsContainer');
  if (container) {
    container.innerHTML = `<div class="blog-empty">Loading insights…</div>`;
    void fetchBlogs(RAIL_LIMIT)
      .then((posts) => {
        blogs = posts;
        loaded = true;
        renderCards();
        openFromHash();
      })
      .catch((err) => {
        console.error('blogger feed error', err);
        container.innerHTML = `<div class="blog-empty">Unable to load blogs from Blogger right now.</div>${seeAllCard()}`;
      });

    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
      if (btn) {
        const id = btn.dataset.id!;
        if (btn.dataset.act === 'open') openBlogModal(byId(id));
        if (btn.dataset.act === 'external') openBlogExternal(byId(id));
        if (btn.dataset.act === 'share') shareBlog(byId(id));
        return;
      }
      // Let the "See all" anchor navigate normally.
      if ((e.target as HTMLElement).closest('.blog-card--all')) return;
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-blog]');
      if (card) openBlogModal(byId(card.dataset.blog!));
    });
  }

  setupScrollButtons();
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#blog-')) openFromHash();
    else closeBlogModal(true);
  });
}

function setupScrollButtons(): void {
  const left = qs('#scrollLeft');
  const right = qs('#scrollRight');
  const container = qs('#blogsContainer');
  if (!left || !right || !container) return;
  const amount = 380;
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  left.addEventListener('click', () => container.scrollBy({ left: -amount, behavior }));
  right.addEventListener('click', () => container.scrollBy({ left: amount, behavior }));
}

function openFromHash(): void {
  const id = hashBlogId();
  if (id && loaded) openBlogModal(byId(id));
}
