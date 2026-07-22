import type { BlogDoc } from '../types.ts';
import { escapeHtml } from '../util/dom.ts';
import { notify } from './notify.ts';

// ============================================================================
//  Blog core — the single source of truth for reading public posts from the
//  Blogger feed (blogs.pwavwe.com), sanitising their HTML, rendering cards, and
//  the shared reading modal. Both the landing rail (a curated few) and the
//  standalone /blogs page (every post) consume this module so there is exactly
//  one feed loader and one HTML sanitiser on the site.
// ============================================================================

const FEED_BASE = 'https://blogs.pwavwe.com/feeds/posts/default?alt=json-in-script';
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
    openSearch$totalResults?: BloggerText;
  };
}

// ---------- feed loading (JSONP; the Blogger feed has no CORS headers) --------
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

interface FeedPage {
  entries: BlogDoc[];
  total: number;
}

async function fetchPage(startIndex: number, pageSize: number): Promise<FeedPage> {
  const url = `${FEED_BASE}&max-results=${pageSize}&start-index=${startIndex}`;
  const data = await loadJsonp<BloggerFeed>(url);
  const entries = (data.feed?.entry ?? []).map(mapEntry);
  const total = Number(data.feed?.openSearch$totalResults?.$t ?? entries.length);
  return { entries, total: Number.isFinite(total) ? total : entries.length };
}

/** Load a single page of the most recent posts (used by the landing rail). */
export async function fetchBlogs(maxResults = 8): Promise<BlogDoc[]> {
  const { entries } = await fetchPage(1, maxResults);
  return entries;
}

/**
 * Load every published post, paging through the feed until the reported total
 * is reached. Guarded so a runaway/growing blog can never loop forever.
 */
export async function fetchAllBlogs(pageSize = 150): Promise<BlogDoc[]> {
  const first = await fetchPage(1, pageSize);
  const all = [...first.entries];
  let start = 1 + pageSize;
  let guard = 0;

  while (all.length < first.total && first.entries.length > 0 && guard < 8) {
    const page = await fetchPage(start, pageSize);
    if (!page.entries.length) break;
    all.push(...page.entries);
    start += pageSize;
    guard += 1;
  }

  return all;
}

// ---------- sanitisation helpers ---------------------------------------------
export function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  // Rich Blogger posts often lead with a <style> block; keep its CSS out of
  // previews, search text and reading-time estimates.
  div.querySelectorAll('style, script, noscript').forEach((el) => el.remove());
  return (div.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('//')) return `https:${url}`;
  return /^(https?:\/\/|data:image\/)/i.test(url) ? url : null;
}

function splitTrailingUrlPunctuation(value: string): { url: string; trailing: string } {
  let url = value;
  let trailing = '';
  while (/[.,!?;:)\]}]+$/.test(url)) {
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

function linkifyPlainUrls(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();

  while (node) {
    const textNode = node as Text;
    const parent = textNode.parentElement;
    const value = textNode.nodeValue ?? '';
    if (
      parent &&
      !parent.closest('a, script, style, textarea, code, pre') &&
      /(https?:\/\/|www\.)/i.test(value)
    ) {
      nodes.push(textNode);
    }
    node = walker.nextNode();
  }

  const urlPattern = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
  nodes.forEach((textNode) => {
    const value = textNode.nodeValue ?? '';
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of value.matchAll(urlPattern)) {
      const start = match.index ?? 0;
      const raw = match[0];
      const { url, trailing } = splitTrailingUrlPunctuation(raw);
      const href = safeUrl(url.startsWith('www.') ? `https://${url}` : url);

      fragment.append(document.createTextNode(value.slice(lastIndex, start)));
      if (href && url) {
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = url;
        fragment.append(anchor);
      } else {
        fragment.append(document.createTextNode(url));
      }
      if (trailing) fragment.append(document.createTextNode(trailing));
      lastIndex = start + raw.length;
    }

    fragment.append(document.createTextNode(value.slice(lastIndex)));
    textNode.replaceWith(fragment);
  });
}

export function firstImage(html: string): string | null {
  const div = document.createElement('div');
  div.innerHTML = html;
  const img = div.querySelector('img');
  return img ? safeUrl(img.getAttribute('src')) : null;
}

export function sanitizeHtml(html: string): string {
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
  linkifyPlainUrls(div);
  return div.innerHTML;
}

export function safeId(id: string): string | null {
  const clean = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean.length ? clean : null;
}

export function fmtDate(ts: BlogDoc['timestamp'], withTime = false): string {
  const date = ts?.toDate?.();
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

/** Plain-text preview (first few lines, capped) for a card body. */
export function blogPreview(blog: BlogDoc, maxLen = 220): string {
  const text = extractText(blog.content ?? '');
  const preview = text.split('\n').filter(Boolean).slice(0, 5).join(' ').slice(0, maxLen);
  return preview + (text.length > maxLen ? '…' : '');
}

/** Rough reading-time estimate in minutes (≈200 wpm), min 1. */
export function readingMinutes(blog: BlogDoc): number {
  const words = extractText(blog.content ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ---------- shared card markup ------------------------------------------------
export interface BlogCardOptions {
  featured?: boolean;
  showMinutes?: boolean;
}

/** Markup for a single blog card — identical on the rail and the /blogs grid. */
export function blogCard(blog: BlogDoc, opts: BlogCardOptions = {}): string {
  const img = firstImage(blog.content ?? '');
  const minutes = opts.showMinutes ? `<span class="blog-card__dot">•</span>${readingMinutes(blog)} min read` : '';
  const featured = opts.featured ? ' blog-card--featured' : '';
  return `
    <article class="blog-card tilt${featured}" data-blog="${blog.id}" data-reveal="up">
      <div class="blog-card__media">${
        img ? `<img src="${escapeHtml(img)}" alt="" loading="lazy">` : '<span>✎</span>'
      }</div>
      <div class="blog-card__body">
        <h3 class="blog-card__title">${escapeHtml(blog.title ?? 'Untitled')}</h3>
        <p class="blog-card__meta">${fmtDate(blog.timestamp)}${minutes}</p>
        <p class="blog-card__preview">${escapeHtml(blogPreview(blog))}</p>
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
}

// ---------- sharing / external -----------------------------------------------
export function openBlogExternal(blog: BlogDoc | undefined): void {
  if (!blog?.url) return;
  window.open(blog.url, '_blank', 'noopener,noreferrer');
}

export function shareBlog(blog: BlogDoc | undefined): void {
  const clean = blog ? safeId(blog.id) : null;
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

// ---------- reading modal (shared) -------------------------------------------
let current: BlogDoc | null = null;

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

export function openBlogModal(blog: BlogDoc | undefined): void {
  const clean = blog ? safeId(blog.id) : null;
  if (!blog || !clean) return;
  current = blog;

  const img = firstImage(blog.content ?? '');
  const modal = modalEl();

  modal.innerHTML = `
    <div class="blog-modal__inner">
      <button class="blog-modal__close" data-close aria-label="Close">×</button>
      ${img ? `<img class="blog-modal__hero" src="${escapeHtml(img)}" alt="">` : ''}
      <div class="blog-modal__body">
        <h2 class="blog-modal__title">${escapeHtml(blog.title ?? 'Untitled')}</h2>
        <p class="blog-modal__meta">Published ${fmtDate(blog.timestamp, true)} · ${readingMinutes(
          blog,
        )} min read · The Pwavwe Papers</p>
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
    if (e.target === modal) return closeBlogModal();
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act], [data-close]');
    if (!btn) return;
    if (btn.hasAttribute('data-close')) return closeBlogModal();
    if (btn.dataset.act === 'external') openBlogExternal(current ?? undefined);
    if (btn.dataset.act === 'share') shareBlog(current ?? undefined);
  };
}

export function closeBlogModal(skipHash = false): void {
  const modal = document.getElementById('blogModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  current = null;
  if (!skipHash && location.hash.startsWith('#blog-')) {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
}

/** The blog id encoded in the current URL hash (`#blog-<id>`), if any. */
export function hashBlogId(): string | null {
  if (!location.hash.startsWith('#blog-')) return null;
  return safeId(location.hash.slice(6));
}

export function isModalOpen(): boolean {
  return current !== null;
}

// Global affordances shared by every surface: Escape closes the reader.
let escBound = false;
export function bindGlobalModalKeys(): void {
  if (escBound) return;
  escBound = true;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen()) closeBlogModal();
  });
}
