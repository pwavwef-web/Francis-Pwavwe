import { gsap } from 'gsap';
import { prefersReducedMotion } from '../util/dom.ts';

// ============================================================================
//  Cinematic boot sequence — an assembling wordmark, a progress ring that fills
//  as assets load, and cycling status lines. When the window is ready it wipes
//  upward to reveal the page and hands off to the entrance choreography.
// ============================================================================

const STATUS = [
  'INITIALISING INTERFACE',
  'CALIBRATING SHADERS',
  'DECRYPTING PORTFOLIO',
  'SYNCING TIMELINE',
  'RENDERING NEBULA',
  'SYSTEM ONLINE',
];
const CIRC = 339.292; // 2π·54

export function initPreloader(): Promise<void> {
  const loader = document.getElementById('preloader');
  const counter = document.getElementById('preloader-count');
  const arc = document.querySelector<SVGCircleElement>('.preloader__arc');
  const status = document.getElementById('preloader-status');
  const brand = document.querySelector<HTMLElement>('[data-preloader-brand]');
  if (!loader || !counter) return Promise.resolve();

  // Split the wordmark into per-character spans for an assemble-in reveal.
  if (brand && !prefersReducedMotion()) {
    const text = brand.textContent ?? '';
    brand.textContent = '';
    const spans = Array.from(text).map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      brand.appendChild(s);
      return s;
    });
    gsap.from(spans, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out',
    });
  }

  return new Promise((resolve) => {
    let progress = 0;
    let loaded = false;
    let statusIdx = -1;
    let done = false;
    window.addEventListener('load', () => (loaded = true), { once: true });

    function setStatus(i: number): void {
      const clamped = Math.min(i, STATUS.length - 1);
      if (clamped === statusIdx || !status) return;
      statusIdx = clamped;
      status.textContent = STATUS[clamped];
    }

    function finish(): void {
      if (done) return;
      done = true;
      window.clearInterval(tick);
      counter!.textContent = '100';
      if (arc) arc.style.strokeDashoffset = '0';
      setStatus(STATUS.length - 1);
      loader!.classList.add('is-done');
      document.body.classList.remove('is-loading');
      window.setTimeout(resolve, 720);
    }

    const tick = window.setInterval(() => {
      const ceiling = loaded ? 100 : 90;
      progress += Math.max((ceiling - progress) * 0.1, 0.5);
      if (progress >= 100) progress = 100;
      counter!.textContent = String(Math.floor(progress)).padStart(2, '0');
      if (arc) arc.style.strokeDashoffset = String(CIRC * (1 - progress / 100));
      setStatus(Math.floor(progress / (100 / STATUS.length)));
      if (progress >= 100 && loaded) finish();
    }, 40);

    // Hard safety timeout so the site never gets stuck behind the loader.
    window.setTimeout(finish, 4200);
  });
}
