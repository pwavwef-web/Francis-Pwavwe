import { prefersReducedMotion } from '../util/dom.ts';

// ============================================================================
//  Text effects — a rotating role typewriter and a scramble/decode reveal for
//  section headings.
// ============================================================================

export function initRoleRotator(el: HTMLElement, roles: readonly string[]): void {
  if (prefersReducedMotion()) {
    el.textContent = roles[0] ?? '';
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function step(): void {
    const current = roles[roleIndex] ?? '';
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        window.setTimeout(step, 1600);
        return;
      }
      window.setTimeout(step, 70);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        window.setTimeout(step, 260);
        return;
      }
      window.setTimeout(step, 35);
    }
  }
  step();
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________';

/** Decode-scramble a single element's text when it enters the viewport. */
export function scramble(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  const target = el.dataset.text ?? el.textContent ?? '';
  let frame = 0;
  const queue = Array.from(target).map((char, i) => ({
    char,
    start: Math.floor(Math.random() * 20) + i * 2,
    end: Math.floor(Math.random() * 20) + i * 2 + 20,
  }));

  function update(): void {
    let output = '';
    let complete = 0;
    for (const item of queue) {
      if (frame >= item.end) {
        complete++;
        output += item.char;
      } else if (frame >= item.start) {
        output += `<span class="scramble-glyph">${
          GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }</span>`;
      } else {
        output += '';
      }
    }
    el.innerHTML = output;
    if (complete < queue.length) {
      frame++;
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }
  update();
}
