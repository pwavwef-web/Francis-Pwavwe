import { notify } from './notify.ts';

// ============================================================================
//  CV download — the CV is now a real, hosted, crawlable PDF
//  (docs/Francis_Pwavwe_CV.pdf) linked directly from the markup. This module
//  only adds a small confirmation toast; it must NOT preventDefault, so the
//  browser follows the genuine anchor to the public PDF.
// ============================================================================

export function initCvDownload(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-download-cv]').forEach((link) => {
    link.addEventListener('click', () => {
      notify('Opening CV (PDF) in a new tab…', 'success');
    });
  });
}
