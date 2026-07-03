import { isTouch, prefersReducedMotion, qsa } from '../util/dom.ts';

// ============================================================================
//  Magnetic buttons + 3D tilt cards. Both are opt-in via data attributes and
//  no-op on touch / reduced-motion.
// ============================================================================

export function initMagnetic(): void {
  if (isTouch() || prefersReducedMotion()) return;

  qsa<HTMLElement>('[data-magnetic]').forEach((elm) => {
    const strength = Number(elm.dataset.magnetic || 0.4);
    elm.addEventListener('pointermove', (e) => {
      const rect = elm.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      elm.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    elm.addEventListener('pointerleave', () => {
      elm.style.transform = '';
    });
  });
}

/** Bind 3D tilt to a set of elements (called after dynamic rendering too). */
export function bindTilt(root: ParentNode = document): void {
  if (isTouch() || prefersReducedMotion()) return;

  qsa<HTMLElement>('.tilt', root).forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';
    const max = 8;

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) * 2 * max;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      card.style.setProperty('--spot-x', `${px * 100}%`);
      card.style.setProperty('--spot-y', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}
