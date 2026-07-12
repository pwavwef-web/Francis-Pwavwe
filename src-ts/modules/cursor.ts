import { isTouch, prefersReducedMotion, qsa } from '../util/dom.ts';

// ============================================================================
//  Custom cursor — a precise dot plus a trailing ring that grows into a
//  targeting reticle over interactive elements. Disabled on touch devices.
//  The trailing loop only runs while the ring is catching up, pauses when the
//  tab is hidden, and degrades to an un-smoothed snap under reduced motion.
// ============================================================================

export function initCursor(): void {
  if (isTouch()) return;
  const reduced = prefersReducedMotion();

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let raf = 0;
  let running = false;

  function loop(): void {
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
      raf = requestAnimationFrame(loop);
    } else {
      running = false;
    }
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (reduced) {
        const t = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        dot.style.transform = t;
        ring.style.transform = t;
      } else if (!running && !document.hidden) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    }
  });

  const interactive = 'a, button, .tilt, .chip, input, textarea, [data-cursor]';
  qsa(interactive).forEach(bindHover);

  // Re-bind hovers for elements rendered later (projects, certs, blogs).
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches?.(interactive)) bindHover(node);
        node.querySelectorAll?.(interactive).forEach((c) => bindHover(c as HTMLElement));
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  function bindHover(elm: HTMLElement): void {
    if (elm.dataset.cursorBound) return;
    elm.dataset.cursorBound = '1';
    elm.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
    elm.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
  }

  window.addEventListener('pointerdown', () => document.body.classList.add('cursor-down'));
  window.addEventListener('pointerup', () => document.body.classList.remove('cursor-down'));
}
