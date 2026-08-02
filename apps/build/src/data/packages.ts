// The three fixed packages shown on the site. Prices are confirmed starting
// points ("from"); the exact quote is agreed in a written proposal.
// Names and prices are set by Francis; the `includes` scope wording is safe to
// edit at any time without touching the components.

export type Package = {
  slug: string;
  name: string;
  /** Display price, e.g. 'GHS 2,500'. Always shown after the word "from". */
  priceFrom: string;
  tagline: string;
  bestFor: string;
  includes: string[];
  /** Must match one of the request-form projectTypes so the CTA can pre-select it. */
  requestType: string;
  featured?: boolean;
};

export const packages: Package[] = [
  {
    slug: 'business-website',
    name: 'Business Website',
    priceFrom: 'GHS 2,500',
    tagline: 'A credible, fast website that explains the work and makes the next step obvious.',
    bestFor: 'Individuals, professionals, businesses and campaigns that need a clear online home.',
    includes: [
      'Up to about five core pages',
      'Mobile-first, responsive design',
      'Contact or enquiry form',
      'Basic SEO and social-sharing setup',
      'Launched on your own domain',
    ],
    requestType: 'Website',
  },
  {
    slug: 'custom-portal-dashboard',
    name: 'Custom Portal or Dashboard',
    priceFrom: 'GHS 5,000',
    tagline: 'A secure web app for real workflows — logins, records, roles and payments.',
    bestFor: 'Teams and organisations replacing messy spreadsheets, inboxes or manual processes.',
    includes: [
      'Secure user accounts and roles',
      'Admin dashboard and records',
      'Bookings, membership or payment tracking',
      'Cloud database (Firebase)',
      'Data export and handover',
    ],
    requestType: 'Web application',
    featured: true,
  },
  {
    slug: 'mvp-web-app',
    name: 'MVP Web App',
    priceFrom: 'GHS 8,000',
    tagline: "A founder's first product — a focused, launch-ready version to test the idea.",
    bestFor: 'Founders and early teams validating a product before a larger investment.',
    includes: [
      'Product scoping and core feature set',
      'Firebase-backed web application',
      'Authentication, database and key integrations',
      'Launch preparation and deployment',
      'Technical handover and documentation',
    ],
    requestType: 'Web application',
  },
];
