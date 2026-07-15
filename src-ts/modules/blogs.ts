import type { BlogDoc } from '../types.ts';
import { escapeHtml, prefersReducedMotion, qs } from '../util/dom.ts';
import { notify } from './notify.ts';

// ============================================================================
//  Blog engine - reads public posts from Blogger and renders them in the
//  existing insights rail with modal reading and deep-link support.
// ============================================================================

const BLOG_FEED_URL = 'https://blogs.pwavwe.com/feeds/posts/default?alt=json-in-script&max-results=8';
const locale = navigator.language || 'en-US';

interface BloggerText {
  $t?: string;
}

interface BloggerLink {
  rel?: string;
  href?: string;
}

interface BloggerEntry {
  id?: BloggerText;
  title?: BloggerText;
  content?: BloggerText;
  summary?: BloggerText;
  published?: BloggerText;
  updated?: BloggerText;
  link?: BloggerLink[];
  thr$total?: BloggerText;
}

interface BloggerFeed {
  feed?: {
    entry?: BloggerEntry[];
  };
}

let blogs: BlogDoc[] = [];
let loaded = false;
let current: BlogDoc | null = null;

// ---------- feed loading ----------
function loadJsonp<T>(url: string, timeoutMs = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = `__pwavweBlogFeed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Blogger feed request timed out.'));
    }, timeoutMs);

    const cleanup = () => {
      window.clearTimeout(timer);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callback];
    };

    (window as unknown as Record<string, (data: T) => void>)[callback] = (data) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}&callback=${encodeURIComponent(callback)}`;
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error('Unable to load Blogger feed.'));
    };
    document.head.appendChild(script);
  });
}

function timestampFrom(value?: string): { toDate(): Date } | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : { toDate: () => date };
}

function postLink(entry: BloggerEntry): string | undefined {
  return entry.link?.find((link) => link.rel === 'alternate')?.href;
}

function postId(entry: BloggerEntry): string {
  const rawId = entry.id?.$t ?? postLink(entry) ?? `${Date.now()}-${Math.random()}`;
  const bloggerPostId = rawId.match(/post-(\d+)/)?.[1];
  return bloggerPostId ?? rawId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-48);
}

function mapEntry(entry: BloggerEntry): BlogDoc {
  const url = postLink(entry);
  const content = entry.content?.$t ?? entry.summary?.$t ?? '';
  const comments = Number(entry.thr$total?.$t ?? 0);

  return {
    id: postId(entry),
    title: entry.title?.$t ?? 'Untitled',
    content,
    comments: Number.isFinite(comments) ? comments : 0,
    timestamp: timestampFrom(entry.published?.$t ?? entry.updated?.$t),
    url,
  };
}

async function fetchBlogs(): Promise<void> {
  const data = await loadJsonp<BloggerFeed>(BLOG_FEED_URL);
  blogs = (data.feed?.entry ?? []).map(mapEntry);
  loaded = true;
}

// ---------- sanitisation helpers ----------
function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? '';
}

function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('//')) return `https:${url}`;
  return /^(https?:\/\/|data:image\/)/i.test(url) ? url : null;
}

function firstImage(html: string): string | null {
  const div = document.createElement('div');
  div.innerHTML = html;
  const img = div.querySelector('img');
  return img ? safeUrl(img.getAttribute('src')) : null;
}

function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('script, iframe, object, embed').forEach((el) => el.remove());
  div.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
    });

    const href = el.getAttribute('href');
    if (href && !safeUrl(href) && !href.startsWith('#') && !href.startsWith('mailto:')) {
      el.removeAttribute('href');
    }

    const src = el.getAttribute('src');
    if (src && !safeUrl(src)) el.removeAttribute('src');
  });
  return div.innerHTML;
}

function safeId(id: string): string | null {
  const clean = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean.length ? clean : null;
}

function fmtDate(ts: BlogDoc['timestamp'], withTime = false): string {
  const date = ts?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

// ---------- rendering ----------
function renderCards(): void {
  const container = qs('#blogsContainer');
  if (!container) return;

  if (!blogs.length) {
    container.innerHTML = `<div class="blog-empty">No posts found on blogs.pwavwe.com yet.</div>`;
    return;
  }

  container.innerHTML = blogs
    .map((blog) => {
      const text = extractText(blog.content ?? '');
      const preview = text.split('\n').filter(Boolean).slice(0, 5).join(' ').slice(0, 220);
      const img = firstImage(blog.content ?? '');
      return `
      <article class="blog-card tilt" data-blog="${blog.id}">
        <div class="blog-card__media">${
          img ? `<img src="${escapeHtml(img)}" alt="" loading="lazy">` : '<span>Post</span>'
        }</div>
        <div class="blog-card__body">
          <h3 class="blog-card__title">${escapeHtml(blog.title ?? 'Untitled')}</h3>
          <p class="blog-card__meta">${fmtDate(blog.timestamp)}</p>
          <p class="blog-card__preview">${escapeHtml(preview)}${text.length > 220 ? '...' : ''}</p>
          <div class="blog-card__actions">
            <button class="blog-act" data-act="open" data-id="${blog.id}">Read</button>
            ${
              blog.url
                ? `<button class="blog-act" data-act="external" data-id="${blog.id}">Blogger</button>`
                : ''
            }
            <button class="blog-act" data-act="share" data-id="${blog.id}">Share</button>
          </div>
        </div>
      </article>`;
    })
    .join('');
}

export function initBlogs(): void {
  const container = qs('#blogsContainer');
  if (container) {
    container.innerHTML = `<div class="blog-empty">Loading insights...</div>`;
    void fetchBlogs()
      .then(() => {
        renderCards();
        openFromHash();
      })
      .catch((err) => {
        console.error('blogger feed error', err);
        container.innerHTML = `<div class="blog-empty">Unable to load blogs from Blogger right now.</div>`;
      });

    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
      if (btn) {
        const id = btn.dataset.id!;
        if (btn.dataset.act === 'open') openBlog(id);
        if (btn.dataset.act === 'external') openExternal(id);
        if (btn.dataset.act === 'share') share(id);
        return;
      }
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-blog]');
      if (card) openBlog(card.dataset.blog!);
    });
  }

  setupScrollButtons();
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#blog-')) openFromHash();
    else if (current) closeBlog(true);
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

function openExternal(id: string): void {
  const blog = blogs.find((b) => b.id === id);
  if (!blog?.url) return;
  window.open(blog.url, '_blank', 'noopener,noreferrer');
}

function share(id: string): void {
  const blog = blogs.find((b) => b.id === id);
  const clean = safeId(id);
  if (!blog || !clean) return;
  const url = `${location.href.split('#')[0]}#blog-${clean}`;
  const text = `Read this post from The Pwavwe Papers: ${blog.title ?? 'Untitled'}`;
  if (navigator.share) {
    navigator.share({ title: blog.title ?? 'Blog Post', text, url }).catch(() => {});
  } else {
    navigator.clipboard
      .writeText(`${text}\n${url}`)
      .then(() => notify('Blog link copied to clipboard!', 'success'))
      .catch(() => notify('Unable to share right now.', 'error'));
  }
}

function modalEl(): HTMLElement {
  let modal = document.getElementById('blogModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'blogModal';
    modal.className = 'blog-modal';
    document.body.appendChild(modal);
  }
  return modal;
}

function openBlog(id: string): void {
  const blog = blogs.find((b) => b.id === id);
  const clean = safeId(id);
  if (!blog || !clean) return;
  current = blog;

  const img = firstImage(blog.content ?? '');
  const modal = modalEl();

  modal.innerHTML = `
    <div class="blog-modal__inner">
      <button class="blog-modal__close" data-close aria-label="Close">x</button>
      ${img ? `<img class="blog-modal__hero" src="${escapeHtml(img)}" alt="">` : ''}
      <div class="blog-modal__body">
        <h2 class="blog-modal__title">${escapeHtml(blog.title ?? 'Untitled')}</h2>
        <p class="blog-modal__meta">Published ${fmtDate(blog.timestamp, true)} on The Pwavwe Papers</p>
        <div class="blog-modal__content">${sanitizeHtml(blog.content ?? '')}</div>
        <div class="blog-modal__actions">
          ${blog.url ? `<button class="blog-act" data-act="external" data-id="${blog.id}">Open on Blogger</button>` : ''}
          <button class="blog-act" data-act="share" data-id="${blog.id}">Share</button>
        </div>
      </div>
    </div>`;

  modal.classList.add('is-open');
  document.body.classList.add('modal-open');
  history.replaceState(null, '', `${location.pathname}${location.search}#blog-${clean}`);

  modal.onclick = (e) => {
    if (e.target === modal) closeBlog();
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act], [data-close]');
    if (!btn) return;
    if (btn.hasAttribute('data-close')) closeBlog();
    if (btn.dataset.act === 'external') openExternal(btn.dataset.id!);
    if (btn.dataset.act === 'share') share(btn.dataset.id!);
  };
}

function closeBlog(skipHash = false): void {
  const modal = document.getElementById('blogModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  current = null;
  if (!skipHash && location.hash.startsWith('#blog-')) {
    history.replaceState(null, '', `${location.pathname}${location.search}#insights`);
  }
}

function openFromHash(): void {
  const hash = location.hash;
  if (!hash.startsWith('#blog-')) return;
  const id = safeId(hash.slice(6));
  if (id && loaded && blogs.find((b) => b.id === id)) openBlog(id);
}
