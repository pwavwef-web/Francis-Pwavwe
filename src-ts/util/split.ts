// Split a plain-text element into per-word <span>s for staggered animation.
// Only safe for elements whose content is pure text (no nested markup).
//
// Accessibility: the animated word spans are hidden from assistive tech and a
// single visually-hidden copy of the full sentence is appended, so screen
// readers announce the line once, cleanly — never word-by-word.

export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return [];
  el.textContent = '';

  const words: HTMLElement[] = [];
  text.split(' ').forEach((word, i) => {
    if (i > 0) el.appendChild(document.createTextNode(' '));
    const span = document.createElement('span');
    span.className = 'split-word';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word;
    el.appendChild(span);
    words.push(span);
  });

  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  el.appendChild(sr);

  return words;
}
