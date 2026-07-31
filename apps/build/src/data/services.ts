import { Bot, Building2, Globe2, GraduationCap, LayoutDashboard, Rocket } from 'lucide-react';

export const services = [
  {
    slug: 'websites',
    icon: Globe2,
    title: 'Websites',
    problem: 'You need a credible online home that explains the work clearly and makes the next step obvious.',
    suitableFor: 'Students, researchers, professionals, organisations, campaigns and growing businesses.',
    deliverables: ['Personal and portfolio sites', 'Business and departmental sites', 'Campaign landing pages', 'Research and project sites'],
  },
  {
    slug: 'web-applications',
    icon: LayoutDashboard,
    title: 'Web Applications',
    problem: 'A spreadsheet, inbox or manual process has become too messy to run reliably.',
    suitableFor: 'Teams that need a shared workflow, records, permissions or customer-facing tools.',
    deliverables: ['Management portals', 'Membership and booking systems', 'Administrative dashboards', 'Payment tracking and publishing platforms'],
  },
  {
    slug: 'mobile-applications',
    icon: GraduationCap,
    title: 'Mobile Applications',
    problem: 'Your users need the product where they already are: on their phones.',
    suitableFor: 'Student communities, organisations and early products with a clear mobile use case.',
    deliverables: ['Student tools', 'Community applications', 'Organisation apps', 'Cross-platform MVPs'],
  },
  {
    slug: 'ai-systems',
    icon: Bot,
    title: 'AI Systems & Integrations',
    problem: 'There is repetitive knowledge work that could be faster, more searchable or easier to review.',
    suitableFor: 'Teams with a real workflow and enough context to use AI responsibly.',
    deliverables: ['AI-assisted workflows', 'Content and document tools', 'Intelligent search', 'Recommendation features and product prototypes'],
  },
  {
    slug: 'campus-systems',
    icon: Building2,
    title: 'Campus & Organisational Systems',
    problem: 'Important operations are being managed through scattered messages and disconnected records.',
    suitableFor: 'Campus bodies, departments, associations and membership organisations.',
    deliverables: ['Election and registration portals', 'Membership platforms', 'Certificate and communication systems', 'Payment and debt tracking'],
  },
  {
    slug: 'mvp-development',
    icon: Rocket,
    title: 'MVP & Product Development',
    problem: 'The idea is promising, but it needs a disciplined first version instead of an endless feature list.',
    suitableFor: 'Founders and teams testing a focused product before making a larger investment.',
    deliverables: ['Product discovery and scoping', 'Interactive prototypes', 'Firebase-backed MVPs', 'Launch preparation and technical handover'],
  },
] as const;

export const processSteps = [
  ['Request', 'You describe the idea, problem, intended users, timeline and available budget.'],
  ['Clarify', 'Francis reviews the request and asks the questions needed to understand the work.'],
  ['Scope', 'The project becomes agreed features, milestones, responsibilities and exclusions.'],
  ['Propose', 'You receive a proposal covering scope, schedule and pricing.'],
  ['Design', 'The product structure, interface and user journey are designed.'],
  ['Build', 'The agreed product is developed in useful, reviewable milestones.'],
  ['Test', 'Relevant devices, browsers and user journeys are checked before launch.'],
  ['Launch', 'The product is deployed, documented and handed over.'],
  ['Support', 'Agreed maintenance, monitoring or future improvements continue after launch.'],
] as const;
