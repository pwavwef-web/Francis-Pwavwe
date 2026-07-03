// ============================================================================
//  Preloader — a brief branded boot sequence with a counting percentage. It
//  resolves as soon as the window has loaded (or after a short floor), then
//  fades out and hands control to the entrance animations.
// ============================================================================

export function initPreloader(): Promise<void> {
  const loader = document.getElementById('preloader');
  const counter = document.getElementById('preloader-count');
  if (!loader || !counter) return Promise.resolve();

  return new Promise((resolve) => {
    let progress = 0;
    let loaded = false;
    window.addEventListener('load', () => (loaded = true), { once: true });

    const tick = window.setInterval(() => {
      // Ease toward 100, but don't finish until the window load event fired.
      const ceiling = loaded ? 100 : 90;
      progress += Math.max((ceiling - progress) * 0.12, 0.6);
      if (progress >= 100) progress = 100;
      counter.textContent = String(Math.floor(progress)).padStart(2, '0');

      if (progress >= 100 && loaded) {
        window.clearInterval(tick);
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        window.setTimeout(resolve, 620);
      }
    }, 40);

    // Hard safety timeout so the site never gets stuck behind the loader.
    window.setTimeout(() => {
      window.clearInterval(tick);
      counter.textContent = '100';
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      resolve();
    }, 4200);
  });
}
