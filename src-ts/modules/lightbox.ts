import { escapeHtml } from '../util/dom.ts';

// ============================================================================
//  Lightbox — a glass modal for certificate previews and any image zoom.
// ============================================================================

let overlay: HTMLElement | null = null;

function ensure(): HTMLElement {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox__inner">
      <button class="lightbox__close" aria-label="Close">×</button>
      <img class="lightbox__img" alt="">
      <p class="lightbox__caption"></p>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || (e.target as HTMLElement).closest('.lightbox__close')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
  return overlay;
}

export function openLightbox(src: string, caption = ''): void {
  const box = ensure();
  (box.querySelector('.lightbox__img') as HTMLImageElement).src = src;
  (box.querySelector('.lightbox__img') as HTMLImageElement).alt = caption;
  (box.querySelector('.lightbox__caption') as HTMLElement).innerHTML = escapeHtml(caption);
  box.classList.add('is-open');
  document.body.classList.add('modal-open');
}

export function closeLightbox(): void {
  overlay?.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}
