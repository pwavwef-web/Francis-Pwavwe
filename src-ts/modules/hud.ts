import { isTouch, prefersReducedMotion, qs, qsa } from '../util/dom.ts';

// ============================================================================
//  HUD + ambient chrome:
//   • a live GMT clock in the corner readout (Ghana sits on GMT+0),
//   • a seamless infinite data ticker,
//   • pointer parallax that gives the hero real depth.
// ============================================================================

export function initHud(): void {
  initClock();
  initTicker();
  initParallax();
}

function initClock(): void {
  const el = qs<HTMLElement>('[data-hud-clock]');
  if (!el) return;
  const pad = (n: number): string => String(n).padStart(2, '0');
  const paint = (): void => {
    const d = new Date();
    // Cape Coast is GMT+0 year-round; derive from UTC for correctness anywhere.
    el.textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  };
  paint();
  window.setInterval(paint, 1000);
}

function initTicker(): void {
  const track = qs<HTMLElement>('[data-ticker]');
  if (!track) return;
  // Duplicate the content once so a -50% translate loops seamlessly.
  track.innerHTML += track.innerHTML;
}

function initParallax(): void {
  if (isTouch() || prefersReducedMotion()) return;
  const scene = qs<HTMLElement>('[data-parallax-scene]');
  if (!scene) return;
  const layers = qsa<HTMLElement>('[data-parallax-layer]', scene);
  if (!layers.length) return;

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;

  function onMove(e: PointerEvent): void {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    tx = nx;
    ty = ny;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function loop(): void {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    for (const layer of layers) {
      const depth = Number(layer.dataset.parallaxLayer || 0.05);
      const mx = -cx * depth * 260;
      const my = -cy * depth * 260;
      layer.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
    }
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
    }
  }

  window.addEventListener('pointermove', onMove, { passive: true });
}
