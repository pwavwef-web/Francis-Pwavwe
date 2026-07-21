import { notify } from './notify.ts';

// ============================================================================
//  CV generator — builds a plain-text CV on the fly and triggers a download.
//  (Preserves the legacy site's downloadable CV feature, now typed.)
// ============================================================================

const CV_TEXT = `FRANCIS PWAVWE
Strategic Thinker. Tourism Professional. Digital Innovator.

CONTACT
Email: pwavwef@gmail.com
Location: Cape Coast, Ghana
LinkedIn: https://linkedin.com/in/francis-pwavwe

PROFILE
Tourism Management student at the University of Cape Coast and Founder of AZ Learner — an
academic support platform designed to improve student retention and performance through
innovative digital solutions. Member of the Oguaa Hall Army Cadet Corps and the UCC Armed
Forces Cadet Corps, bringing military precision to strategic thinking with a creative,
innovative approach to problem-solving.

EDUCATION & PROGRAMS
- BCG GenAI Job Simulation (Forage) — March 2026
- Harvard Aspire Leaders Program, Cohort 5 — 2025
- Tourism Management Student, University of Cape Coast — 2021-Present

EXPERIENCE
- Intern, Housekeeping & Food and Beverage — Kempinski Hotel Gold Coast City (Aug-Oct 2025)
- Founder & CEO — AZ Learner (2023-Present)
- Head of Security & Transport — Journey to the East (2024)
- Digital Strategy Consultant — Torchlight Tours (2023-2024)
- Cadet Member — Oguaa Hall & UCC Armed Forces Cadet Corps (2022-Present)

SERVICES
Tourism Strategy & Planning · Research & Insight Reports · Travel & Tour Operations ·
Event & Logistics Coordination · Digital Strategy Consulting · Education Technology Support ·
Speaking & Workshop Facilitation

VISION
To become a leading international tourism strategist, pioneering innovative systems that
transform the African tourism landscape while revolutionising student experiences across the
continent.

© 2026 Francis Pwavwe. Building the future, one strategic decision at a time.`;

export function initCvDownload(): void {
  document.querySelectorAll<HTMLElement>('[data-download-cv]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const blob = new Blob([CV_TEXT], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Francis_Pwavwe_CV.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify('CV downloaded successfully!', 'success');
    });
  });
}
