import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import type { BlogComment, BlogDoc, BlogInteraction } from '../types.ts';
import { escapeHtml, prefersReducedMotion, qs } from '../util/dom.ts';
import { db } from './firebase.ts';
import { notify } from './notify.ts';

// ============================================================================
//  Blog engine — realtime Firestore feed, glass modal reader with anonymous
//  likes + comments, share, and deep-link hash routing (#blog-<id>).
// ============================================================================

const STORAGE_KEY = 'blogInteractions';
const locale = navigator.language || 'en-US';

let blogs: BlogDoc[] = [];
let loaded = false;
let current: BlogDoc | null = null;

// ---------- interaction storage ----------
function interactions(): Record<string, BlogInteraction> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, BlogInteraction>) : {};
}
function toggleLike(id: string): BlogInteraction {
  const all = interactions();
  all[id] ??= { liked: false, comments: [] };
  all[id].liked = !all[id].liked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[id];
}
function sessionId(): string {
  let id = localStorage.getItem('blogSessionId');
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('blogSessionId', id);
  }
  return id;
}

// ---------- sanitisation helpers ----------
function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? '';
}
function safeUrl(url?: string | null): string | null {
  if (!url) return null;
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
  div.querySelectorAll('script').forEach((s) => s.remove());
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
  const store = interactions();

  if (!blogs.length) {
    container.innerHTML = `<div class="blog-empty">No blogs yet — check back soon.</div>`;
    return;
  }

  container.innerHTML = blogs
    .map((blog) => {
      const text = extractText(blog.content ?? '');
      const preview = text.split('\n').filter(Boolean).slice(0, 5).join(' ').slice(0, 220);
      const img = firstImage(blog.content ?? '');
      const liked = store[blog.id]?.liked ?? false;
      return `
      <article class="blog-card tilt" data-blog="${blog.id}">
        <div class="blog-card__media">${
          img ? `<img src="${escapeHtml(img)}" alt="" loading="lazy">` : '<span>📝</span>'
        }</div>
        <div class="blog-card__body">
          <h3 class="blog-card__title">${escapeHtml(blog.title ?? 'Untitled')}</h3>
          <p class="blog-card__meta">${fmtDate(blog.timestamp)}</p>
          <p class="blog-card__preview">${escapeHtml(preview)}${text.length > 220 ? '…' : ''}</p>
          <div class="blog-card__actions">
            <button class="blog-act ${liked ? 'is-active' : ''}" data-act="like" data-id="${
              blog.id
            }"><span>${liked ? '❤️' : '🤍'}</span>${blog.likes ?? 0}</button>
            <button class="blog-act" data-act="open" data-id="${blog.id}"><span>💬</span>${
              blog.comments ?? 0
            }</button>
            <button class="blog-act" data-act="open" data-id="${blog.id}">Read →</button>
          </div>
        </div>
      </article>`;
    })
    .join('');
}

export function initBlogs(): void {
  const container = qs('#blogsContainer');
  if (container) {
    container.innerHTML = `<div class="blog-empty">Loading insights…</div>`;
    try {
      const q = query(collection(db(), 'blogs'), orderBy('timestamp', 'desc'));
      onSnapshot(
        q,
        (snap) => {
          blogs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogDoc, 'id'>) }));
          loaded = true;
          renderCards();
          openFromHash();
        },
        (err) => {
          console.error('blogs listener error', err);
          if (container)
            container.innerHTML = `<div class="blog-empty">Insights are unavailable right now.</div>`;
        },
      );
    } catch (err) {
      console.error('blogs setup error', err);
      container.innerHTML = `<div class="blog-empty">Insights feature is currently unavailable.</div>`;
    }

    // Delegated card actions.
    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
      if (btn) {
        const id = btn.dataset.id!;
        if (btn.dataset.act === 'like') void like(id);
        if (btn.dataset.act === 'open') openBlog(id);
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
  const AMOUNT = 380;
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  left.addEventListener('click', () => container.scrollBy({ left: -AMOUNT, behavior }));
  right.addEventListener('click', () => container.scrollBy({ left: AMOUNT, behavior }));
}

async function like(id: string): Promise<void> {
  const state = toggleLike(id);
  renderCards();
  try {
    await updateDoc(doc(db(), 'blogs', id), { likes: increment(state.liked ? 1 : -1) });
  } catch (err) {
    console.error('like update failed', err);
  }
}

function share(id: string): void {
  const blog = blogs.find((b) => b.id === id);
  const clean = safeId(id);
  if (!blog || !clean) return;
  const url = `${location.href.split('#')[0]}#blog-${clean}`;
  const text = `Check out this blog: ${blog.title ?? 'Untitled'}`;
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
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBlog();
    });
  }
  return modal;
}

function openBlog(id: string): void {
  const blog = blogs.find((b) => b.id === id);
  const clean = safeId(id);
  if (!blog || !clean) return;
  current = blog;

  const img = firstImage(blog.content ?? '');
  const store = interactions();
  const liked = store[blog.id]?.liked ?? false;
  const modal = modalEl();

  modal.innerHTML = `
    <div class="blog-modal__inner">
      <button class="blog-modal__close" data-close aria-label="Close">×</button>
      ${img ? `<img class="blog-modal__hero" src="${escapeHtml(img)}" alt="">` : ''}
      <div class="blog-modal__body">
        <h2 class="blog-modal__title">${escapeHtml(blog.title ?? 'Untitled')}</h2>
        <p class="blog-modal__meta">Published ${fmtDate(blog.timestamp, true)}</p>
        <div class="blog-modal__content">${sanitizeHtml(blog.content ?? '')}</div>
        <div class="blog-modal__actions">
          <button class="blog-act ${liked ? 'is-active' : ''}" data-act="like" data-id="${
            blog.id
          }"><span>${liked ? '❤️' : '🤍'}</span> Like (${blog.likes ?? 0})</button>
          <button class="blog-act" data-act="share" data-id="${blog.id}"><span>🔗</span> Share</button>
        </div>
        <div class="blog-comments">
          <h3>Comments</h3>
          <div class="blog-comments__form">
            <textarea id="commentInput" placeholder="Share your thoughts anonymously…"></textarea>
            <button class="btn btn--primary" data-act="comment" data-id="${blog.id}">Post Comment</button>
          </div>
          <div class="blog-comments__list" id="commentsList">Loading comments…</div>
        </div>
      </div>
    </div>`;

  modal.classList.add('is-open');
  document.body.classList.add('modal-open');
  history.replaceState(null, '', `${location.pathname}${location.search}#blog-${clean}`);

  modal.querySelector('[data-close]')?.addEventListener('click', () => closeBlog());
  modal.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!b) return;
    const bid = b.dataset.id!;
    if (b.dataset.act === 'like') void like(bid).then(() => openBlog(bid));
    if (b.dataset.act === 'share') share(bid);
    if (b.dataset.act === 'comment') void submitComment(bid);
  });

  void loadComments(id);
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

async function loadComments(id: string): Promise<void> {
  const list = document.getElementById('commentsList');
  if (!list) return;
  try {
    const snap = await getDoc(doc(db(), 'blogs', id));
    const comments = (snap.data()?.blogComments ?? []) as BlogComment[];
    list.innerHTML = comments.length
      ? comments
          .map(
            (c) => `
        <div class="blog-comment">
          <div class="blog-comment__head">Anonymous · ${escapeHtml(
            new Date(c.timestamp).toLocaleString(),
          )}</div>
          <div class="blog-comment__text">${escapeHtml(c.text)}</div>
        </div>`,
          )
          .join('')
      : '<div class="blog-empty">No comments yet. Be the first!</div>';
  } catch (err) {
    console.error('load comments failed', err);
    list.innerHTML = '<div class="blog-empty">Unable to load comments.</div>';
  }
}

async function submitComment(id: string): Promise<void> {
  const input = document.getElementById('commentInput') as HTMLTextAreaElement | null;
  const text = input?.value.trim();
  if (!text) {
    notify('Please enter a comment.', 'info');
    return;
  }
  try {
    const comment: BlogComment = { text, timestamp: new Date().toISOString(), sessionId: sessionId() };
    await updateDoc(doc(db(), 'blogs', id), {
      blogComments: arrayUnion(comment),
      comments: increment(1),
    });
    if (input) input.value = '';
    notify('Comment posted!', 'success');
    void loadComments(id);
  } catch (err) {
    console.error('post comment failed', err);
    notify('Unable to post comment. Try again.', 'error');
  }
}

function openFromHash(): void {
  const hash = location.hash;
  if (!hash.startsWith('#blog-')) return;
  const id = safeId(hash.slice(6));
  if (id && loaded && blogs.find((b) => b.id === id)) openBlog(id);
}
