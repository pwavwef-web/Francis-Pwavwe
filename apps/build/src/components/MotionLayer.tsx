import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const revealSelector = [
  '.hero',
  '.page-hero',
  '.section-heading',
  '.why-section > *',
  '.request-band',
  '.request-intro',
  '.form-panel',
  '.case-image-wrap',
  '.case-body aside',
  'main > article > header',
  '.project-card',
  '.service-card',
  '.audience-grid article',
  '.process-line li',
  '.faq-list details',
  '.service-list > article',
  '.full-process li',
  '.principles article',
  '.contact-grid article',
  '.case-narrative section',
].join(',');

const ambientSelector = [
  '.hero',
  '.section-contrast',
  '.audiences',
  '.process-preview',
  '.request-band',
].join(',');

export function MotionLayer() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.querySelector('main');
    if (!root) return;

    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>(revealSelector));
    const ambientTargets = Array.from(root.querySelectorAll<HTMLElement>(ambientSelector));
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    revealTargets.forEach((target, index) => {
      const order = index % 6;
      target.classList.add('motion-reveal');
      target.style.setProperty('--reveal-delay', `${order * 65}ms`);
      target.style.setProperty('--process-delay', `${order * 90 + 250}ms`);
    });

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

    const ambientObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-motion-active', entry.isIntersecting));
    }, { rootMargin: '0px', threshold: .15 });

    revealTargets.forEach((target) => revealObserver.observe(target));
    ambientTargets.forEach((target) => ambientObserver.observe(target));

    return () => {
      revealObserver.disconnect();
      ambientObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
