import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, qsa } from '../util/dom.ts';
import { splitWords } from '../util/split.ts';
import { scramble } from './text-effects.ts';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
//  Scroll choreography — hero entrance, staggered reveals, counters, timeline
//  draw-in, parallax, and heading scrambles. All guarded by reduced-motion.
// ============================================================================

export function initReveals(): void {
  const reduced = prefersReducedMotion();

  if (reduced) {
    // Make everything visible immediately.
    qsa('[data-reveal], .reveal').forEach((el) => el.classList.add('is-in'));
    runCounters();
    return;
  }

  // --- Hero entrance timeline ---
  const heroBits = qsa('[data-hero]');
  if (heroBits.length) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(heroBits, { y: 44, opacity: 0, duration: 0.9, stagger: 0.12, delay: 0.15 });

    const name = qs('.hero__name') as HTMLElement | null;
    if (name) {
      tl.fromTo(
        name,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power4.out' },
        0.3,
      );
    }
    const visual = qs('.hero__visual') as HTMLElement | null;
    if (visual) {
      tl.from(
        visual,
        { scale: 0.84, opacity: 0, rotate: -5, duration: 1.3, ease: 'power3.out' },
        0.1,
      );
    }
  }

  // --- Word-split rises for plain-text lines ---
  qsa<HTMLElement>('[data-split], .section__subtitle').forEach((el) => {
    const words = splitWords(el);
    if (!words.length) return;
    gsap.from(words, {
      opacity: 0,
      y: 26,
      rotateX: -50,
      transformPerspective: 600,
      transformOrigin: '50% 100%',
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });

  // --- Generic reveals (fade/slide) with stagger by group ---
  qsa<HTMLElement>('[data-reveal]').forEach((el) => {
    const dir = el.dataset.reveal || 'up';
    const from: gsap.TweenVars = { opacity: 0, duration: 0.8, ease: 'power3.out' };
    if (dir === 'up') from.y = 46;
    if (dir === 'down') from.y = -46;
    if (dir === 'left') from.x = 46;
    if (dir === 'right') from.x = -46;
    if (dir === 'scale') from.scale = 0.92;

    gsap.from(el, {
      ...from,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: () => el.classList.add('is-in'),
    });
  });

  // --- Staggered grids (children animate in sequence) ---
  qsa<HTMLElement>('[data-stagger]').forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[];
    gsap.from(items, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 80%', once: true },
    });
  });

  // --- Section-title scramble on entry ---
  qsa<HTMLElement>('[data-scramble]').forEach((el) => {
    el.dataset.text = el.textContent ?? '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => scramble(el),
    });
  });

  // --- Timeline progress line draws as you scroll ---
  const timeline = qs('.timeline');
  if (timeline) {
    gsap.to('.timeline__progress', {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 60%',
        end: 'bottom 70%',
        scrub: true,
      },
    });
  }

  // --- Parallax layers ---
  qsa<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = Number(el.dataset.parallax || 0.2);
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  runCounters();
}

function qs(sel: string): Element | null {
  return document.querySelector(sel);
}

// --- Animated stat counters ---
function runCounters(): void {
  qsa<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count || 0);
    if (prefersReducedMotion()) {
      el.textContent = String(target);
      return;
    }
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.floor(obj.n));
      },
    });
  });
}

export function refreshScrollTriggers(): void {
  ScrollTrigger.refresh();
}
