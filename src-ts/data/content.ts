import type {
  Certificate,
  ExperienceItem,
  NavItem,
  Project,
  Skill,
  SocialLink,
  Stat,
} from '../types.ts';

// ============================================================================
//  PROFILE
//  Positioning: ONE primary commercial identity — a digital product builder.
//  Tourism & education are the industries served, not competing job titles.
// ============================================================================
export const PROFILE = {
  name: 'Francis Pwavwe',
  handle: 'pwavwe.com',
  // Shown in the hero as an availability / positioning chip.
  credential: 'Open for projects & remote roles · Based in Ghana',
  roles: [
    'Digital Product Builder',
    'Tourism Professional',
    'Web & Platform Developer',
    'Founder of AZ Learner',
  ],
  tagline:
    'I build websites, platforms and AI-assisted tools for education, tourism and growing organisations. From campus applications to operational dashboards, I turn complicated workflows into digital products people can actually use.',
  email: 'francis@pwavwe.com',
  location: 'Cape Coast, Ghana',
  linkedin: 'https://linkedin.com/in/francis-pwavwe',
} as const;

// ============================================================================
//  NAVIGATION  (trimmed to support a single conversion funnel)
// ============================================================================
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'insights', label: 'Writing' },
  { id: 'contact', label: 'Contact' },
  { id: 'build', label: 'Build With Me', href: 'https://build.pwavwe.com', variant: 'cta' },
];

// The commercial studio (build.pwavwe.com) — pwavwe.com hands enquiries here.
export const STUDIO_URL = 'https://build.pwavwe.com';

export const SOCIALS: readonly SocialLink[] = [
  { label: 'Email', href: 'mailto:francis@pwavwe.com', icon: '✉' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/francis-pwavwe', icon: 'in' },
  { label: 'AZ Learner', href: 'https://azlearner.me', icon: '↗' },
];

// ============================================================================
//  STATS  (animated counters — reframed as builder proof)
// ============================================================================
export const STATS: readonly Stat[] = [
  { value: 15, suffix: '+', label: 'Digital Products Built' },
  { value: 6, suffix: '', label: 'Live Platforms Deployed' },
  { value: 3, suffix: '+', label: 'Years Building AZ Learner' },
  { value: 15, suffix: '', label: 'Certifications' },
];

// ============================================================================
//  PROOF BAR  (compact strip shown directly under the hero)
// ============================================================================
export const PROOF_POINTS: readonly string[] = [
  '15+ digital products built',
  'React · TypeScript · Firebase · Flutter',
  'Education, tourism & organisational systems',
  'Based in Ghana · working remotely',
];

// ============================================================================
//  ABOUT  (highlights)
// ============================================================================
export const ABOUT_PARAGRAPHS: readonly string[] = [
  'I am Francis Pwavwe — a digital product builder who designs and ships websites, platforms and AI-assisted tools. I turn complicated, manual workflows into software that real people can pick up and use.',
  'My edge is the industries I build for. As a Tourism Management graduate of the University of Cape Coast and founder of AZ Learner, I understand campus operations, tourism, and education from the inside — so the products I build fit how these organisations actually work.',
  'I have shipped election systems, booking platforms, campus apps, access-control tools and AI career software — most of them live in production today. Alongside the code, cadet-corps and student-leadership roles gave me the discipline to plan, coordinate and deliver under real deadlines.',
  'The through-line is simple: build purposeful digital systems that improve how organisations across Africa learn, operate and grow.',
];

export const ABOUT_HIGHLIGHTS: readonly { label: string; value: string }[] = [
  { label: 'Primary work', value: 'Digital Product Builder' },
  { label: 'Founder', value: 'AZ Learner' },
  { label: 'Industries', value: 'Education · Tourism · Orgs' },
  { label: 'Based in', value: 'Ghana · Remote' },
];

// ============================================================================
//  PROJECTS
//  Ordered strongest-engineering-first. The top entries carry full case-study
//  detail (role + stack + outcome). Forage job simulations live only in the
//  Credentials tab — never competing with shipped products.
// ============================================================================
export const PROJECTS: readonly Project[] = [
  {
    title: 'Pollaris Election Platform',
    category: 'Election Technology',
    tags: ['Technology', 'Leadership', 'Community'],
    icon: 'assets/project-covers/pollaris-mark.png',
    iconIsImage: true,
    coverImage: 'assets/project-covers/pollaris.webp',
    description:
      'Departmental elections were run manually — hard to secure, slow to tally, and impossible to audit. Pollaris is a configurable multi-election platform with voter-code access, ballot setup, staff dashboards, audit trails, certified results and election-scoped exports.',
    role: 'Product designer & full-stack developer',
    stack: ['React', 'TypeScript', 'Firebase', 'Auth & audit trails'],
    impact: 'Brought digital structure, transparency and auditable participation to real campus elections.',
    status: 'Live platform',
    year: '2026',
    link: { label: 'Visit Pollaris', href: 'https://absag-ucc1.web.app' },
    featured: true,
  },
  {
    title: 'VitaForge AI',
    category: 'AI Career Platform',
    tags: ['Education', 'Technology'],
    icon: 'assets/project-covers/vitaforge-mark.png',
    iconIsImage: true,
    coverImage: 'assets/project-covers/vitaforge-ai.webp',
    description:
      'Students struggle to turn scattered experience into strong applications. VitaForge is an AI career platform that builds polished CVs, tailored cover letters, ATS-ready applications and guided career materials — end to end.',
    role: 'Founder & developer',
    stack: ['React', 'TypeScript', 'AI / LLM', 'Firebase'],
    impact: 'Helps students convert real experience into stronger, job-ready applications with practical AI support.',
    status: 'Live platform',
    year: '2026',
    link: { label: 'Visit VitaForge', href: 'https://vitaforge.pwavwe.com' },
    featured: true,
  },
  {
    title: 'SMG Transport Agency',
    category: 'Transport Booking Platform',
    tags: ['Tourism', 'Technology'],
    icon: 'assets/project-covers/smg-logo-mark.png',
    iconIsImage: true,
    description:
      'A Ghanaian intercity travel operator needed to move ticketing online. SMG lets passengers search active routes, choose seats and pay online, then issues QR e-tickets — with staff operations and verification managed behind the scenes.',
    role: 'Product designer & developer',
    stack: ['React', 'Firebase', 'Online payments', 'QR e-tickets'],
    impact: 'Turns route discovery, seat reservations, payments and ticket verification into one smooth digital workflow.',
    status: 'Live platform',
    year: '2026',
    link: { label: 'Visit SMG Agency', href: 'https://smgagencygh.com' },
    featured: true,
  },
  {
    title: 'HallKey',
    category: 'Campus Access Technology',
    tags: ['Technology', 'Community'],
    icon: 'assets/project-covers/hallkey-mark.svg',
    iconIsImage: true,
    coverImage: 'assets/project-covers/hallkey.webp',
    description:
      'Hall key collection meant long queues and no accountability. HallKey lets students request a room key, verify by fingerprint and receive the mapped key, while hall staff get a live operational record of every handover.',
    role: 'Product designer & developer',
    stack: ['Firebase', 'Fingerprint verification', 'Realtime records'],
    impact: 'Reduces key-collection queues while improving access accountability for students, porters and administrators.',
    status: 'Live prototype',
    year: '2026',
    link: { label: 'Visit HallKey', href: 'https://hallkey.web.app' },
    featured: true,
  },
  {
    title: 'UCC SRC App',
    category: 'Mobile App · Google Play',
    tags: ['Technology', 'Leadership'],
    icon: 'assets/icon%20(2).png',
    iconIsImage: true,
    description:
      'The official Student Representative Council app for the University of Cape Coast — giving students one place for services, announcements, events and governance touchpoints, published live on Google Play.',
    role: 'Mobile developer',
    stack: ['Flutter', 'Android', 'Google Play'],
    impact: 'Connects student leadership with daily campus life through a clearer digital service channel.',
    status: 'Live on Google Play',
    year: '2026',
    link: {
      label: 'Download on Google Play',
      href: 'https://play.google.com/store/apps/details?id=com.uccsrc.uccsrcapp&hl=en-US',
    },
    liveBadges: [
      {
        label: 'Live Google Play downloads',
        src: 'https://img.shields.io/endpoint?url=https%3A%2F%2Fplay.cuzi.workers.dev%2Fplay%3Fi%3Dcom.uccsrc.uccsrcapp%26hl%3Den%26gl%3DUS%26l%3DDownloads%26m%3D%24installs&style=flat-square&labelColor=10213f&color=1d5ed8',
      },
      {
        label: 'Live Google Play update date',
        src: 'https://img.shields.io/endpoint?url=https%3A%2F%2Fplay.cuzi.workers.dev%2Fplay%3Fi%3Dcom.uccsrc.uccsrcapp%26hl%3Den%26gl%3DUS%26l%3DUpdated%26m%3D%24updated&style=flat-square&labelColor=10213f&color=0f766e',
      },
      {
        label: 'Live Google Play content rating',
        src: 'https://img.shields.io/endpoint?url=https%3A%2F%2Fplay.cuzi.workers.dev%2Fplay%3Fi%3Dcom.uccsrc.uccsrcapp%26hl%3Den%26gl%3DUS%26l%3DRated%26m%3D%24friendly&style=flat-square&labelColor=10213f&color=b88a1d',
      },
    ],
    featured: true,
  },
  {
    title: 'AZ Learner',
    category: 'Education Technology',
    tags: ['Education', 'Technology'],
    icon: '🎓',
    description:
      'The platform I founded and lead: an academic support system improving student retention and performance through purposeful learning paths, resource access, analytics-informed support and collaborative study tools.',
    role: 'Founder & CEO · product lead',
    stack: ['Web platform', 'Firebase', 'Learning tools'],
    impact: 'Built as a long-term academic support system for learners across UCC and beyond.',
    status: 'Founder-led',
    year: '2023-Present',
    link: { label: 'Visit azlearner.me', href: 'https://azlearner.me' },
    featured: true,
  },
  {
    title: 'Personal SWOT Analysis Quiz',
    category: 'AI Reflection Tool',
    tags: ['Technology', 'Education'],
    icon: '🧭',
    description:
      'A 100-question self-assessment that turns personal response patterns into a practical SWOT analysis covering strengths, weaknesses, opportunities, threats, and next-step recommendations.',
    stack: ['Web app', 'Adaptive scoring'],
    impact: 'Makes reflective strategy more accessible for students, founders, and emerging leaders.',
    status: 'Live tool',
    year: '2026',
    link: { label: 'Take the quiz', href: 'swot-quiz.html' },
  },
  {
    title: 'Project Kassena',
    category: 'Language Infrastructure · Community',
    tags: ['Community', 'Technology', 'Research'],
    icon: '🗣️',
    description:
      'Building a trusted digital Kasem dictionary, phrase corpus, and AI-ready language dataset, created with community input and designed for education, culture, and long-term preservation.',
    stack: ['Language dataset', 'Community tooling'],
    impact: 'Protects language heritage while preparing community knowledge for digital learning systems.',
    status: 'Research build',
    year: '2025-Present',
    meta: 'Started: April 20, 2025',
    link: { label: 'Visit Project Kassena', href: 'https://kassena.azlearner.me' },
  },
  {
    title: 'Luban Workshop Restaurant',
    category: 'Digital Marketing & Web',
    tags: ['Tourism', 'Technology'],
    icon: 'assets/project-covers/luban-logo.png',
    iconIsImage: true,
    description:
      "Improving the visibility of my department's Chinese restaurant through website design, search engine optimisation, and social media engagement.",
    stack: ['Website', 'SEO', 'Social'],
    impact: 'Connects hospitality operations with discoverable digital storytelling.',
    status: 'Strategy project',
    year: '2025',
    link: { label: 'Visit restaurant site', href: 'https://lubanrestaurant.com' },
  },
  {
    title: 'Advanced Tourism Concepts Ebook',
    category: 'Tourism Education',
    tags: ['Tourism', 'Education', 'Research'],
    icon: '📘',
    description:
      'A student-created learning resource that translates advanced tourism concepts into clearer notes, examples, and practical explanations for emerging tourism professionals.',
    impact: 'Turns academic knowledge into an accessible study companion for tourism learners.',
    status: 'Published',
    year: '2026',
    link: {
      label: 'Read the ebook',
      href: 'docs/archive/Advanced_Tourism_Concepts_UCC_Student_Creator_Ebook.pdf',
    },
  },
  {
    title: 'Torchlight Tours Social Strategy',
    category: 'Digital Marketing & Tourism',
    tags: ['Tourism', 'Technology'],
    icon: '📱',
    description:
      'A comprehensive social media strategy for Torchlight Tours, covering audience engagement, brand positioning, and conversion optimisation in a competitive tourism market.',
    impact: 'Sharpens the path from travel inspiration to inquiry for a tourism brand.',
    status: 'Consulting',
    year: '2024',
  },
  {
    title: 'Tourism Research & Analysis',
    category: 'Academic Research',
    tags: ['Research', 'Tourism'],
    icon: '📊',
    description:
      'Research on sustainable tourism development, visitor experience optimisation, and the impact of digital transformation on tourism operations in West Africa.',
    impact: 'Frames tourism growth through evidence, visitor experience, and digital transformation.',
    status: 'Ongoing research',
    year: '2024-Present',
  },
];

// ============================================================================
//  SERVICES  (condensed to three build offerings — a single, clear ask)
// ============================================================================
export const SKILLS: readonly Skill[] = [
  {
    icon: '🌐',
    name: 'Business & Brand Websites',
    description:
      'Fast, modern, SEO-ready websites for organisations, tourism brands and personal brands — designed, built and deployed live.',
  },
  {
    icon: '📊',
    name: 'Portals & Operational Dashboards',
    description:
      'Custom portals, admin dashboards and internal tools that turn manual, paper-based workflows into clear, trackable digital operations.',
  },
  {
    icon: '🤖',
    name: 'Web Apps & AI-Assisted Tools (MVPs)',
    description:
      'End-to-end web applications and AI-assisted tools — authentication, payments, data and dashboards — built and shipped as working products.',
  },
];

// ============================================================================
//  EXPERIENCE  (journey timeline)
// ============================================================================
export const EXPERIENCE: readonly ExperienceItem[] = [
  { kind: 'leadership', title: 'Founder & CEO', company: 'AZ Learner', date: '2023 – Present', description: 'Founded and leading an education-tech platform improving student retention and academic performance through purposeful digital products — from strategy through to shipped software.' },
  { kind: 'work', title: 'Digital Product Builder (Freelance)', company: 'Independent · Ghana / Remote', date: '2023 – Present', description: 'Designing and shipping websites, platforms and AI-assisted tools for education, tourism and growing organisations — including Pollaris, VitaForge, SMG Agency, HallKey and the UCC SRC app.' },
  { kind: 'work', title: 'Intern — Housekeeping & Food and Beverage', company: 'Kempinski Hotel Gold Coast City', date: 'Aug – Oct 2025', description: 'Hands-on experience in luxury hospitality operations — guest service excellence, operational efficiency, and five-star quality standards.' },
  { kind: 'education', title: 'Harvard Aspire Leaders Program', company: 'Cohort 5', date: '2025', description: 'Completed the Aspire Leaders Program — leadership frameworks, strategic thinking, and global perspectives.' },
  { kind: 'leadership', title: 'Committee Member — Water & Sanitation', company: 'SRC, University of Cape Coast', date: 'Feb – Jul 2026', description: "Served on the Student Representative Council's Water and Sanitation Committee, contributing to campus welfare and sustainability initiatives." },
  { kind: 'leadership', title: 'Head of Security & Transport Committee', company: 'Journey to the East Event', date: '2024', description: 'Led security and transportation operations for a major regional event — logistics, team coordination, and seamless safety protocols.' },
  { kind: 'work', title: 'Digital Strategy Consultant', company: 'Torchlight Tours', date: '2023 – 2024', description: 'Social media strategy to enhance brand visibility, audience engagement, and conversion rates in a competitive tourism market.' },
  { kind: 'leadership', title: 'Cadet Member', company: 'Oguaa Hall & UCC Armed Forces Cadet Corps', date: '2022 – Present', description: 'Developing leadership, discipline, and strategic thinking through military training and cadet corps activities.' },
  { kind: 'education', title: 'BSc Tourism Management (Graduate)', company: 'University of Cape Coast', date: '2021 – 2026', description: 'Graduated in 2026 with a background in tourism management, strategic planning and hospitality operations, including research on sustainable tourism.' },
  { kind: 'simulation', title: 'Vista Equity Partners — AI in Action (Forage)', company: 'Vista Equity Partners', date: 'March 2026', description: 'Prompt engineering and GenAI workflow automation for Portfolio Operations — synthesising NPS feedback into executive-ready insights and improving output relevance by iteration.' },
  { kind: 'simulation', title: 'BCG GenAI Job Simulation (Forage)', company: 'Boston Consulting Group', date: 'March 2026', description: 'AI-powered financial chatbot development — Python and pandas, interpreting 10-K/10-Q data with rule-based logic to deliver user-friendly financial insights.' },
  { kind: 'simulation', title: 'EY Technology Risk Simulation (Forage)', company: 'EY', date: 'February 2026', description: 'Understanding typical IT risks and processes for the Tech Risk team — relationship building, teaming, and productivity.' },
];

// ============================================================================
//  CERTIFICATES
// ============================================================================
const CERT = 'assets/certificates';
export const CERTIFICATES: readonly Certificate[] = [
  { title: 'Oguaa Hall Army Cadet Citation', issuer: 'Oguaa Hall Army Cadet, University of Cape Coast', date: 'Class of 2026', href: `${CERT}/ohac-citation-qm.png`, image: `${CERT}/ohac-citation-qm.png`, variant: 'portrait' },
  { title: 'SRC Water and Sanitation Committee Citation', issuer: "Students' Representative Council, University of Cape Coast", date: '2025/2026', href: `${CERT}/src-water-sanitation-committee-citation.jpg`, image: `${CERT}/src-water-sanitation-committee-citation.jpg`, variant: 'portrait', tags: ['Leadership'] },
  { title: '2025 Aspire Leaders Program', issuer: 'Aspire Institute', date: 'December 2025', href: `${CERT}/aspire-leaders-program-certificate.pdf` },
  { title: 'AI Fundamentals', issuer: 'Google · Coursera', date: 'April 18, 2026', href: `${CERT}/google-ai-fundamentals-certificate.jpg`, image: `${CERT}/google-ai-fundamentals-certificate.jpg` },
  { title: 'Technology Risk Virtual Job Simulation', issuer: 'EY · Forage', date: 'February 2026', href: `${CERT}/ey-technology-risk-certificate.png`, image: `${CERT}/ey-technology-risk-certificate.png` },
  { title: 'Generative AI Mastermind', issuer: 'Outskill', date: '2026', href: `${CERT}/outskill-genreative-ai-mastermind-certificate.png`, image: `${CERT}/outskill-genreative-ai-mastermind-certificate.png` },
  { title: 'AI in Action Job Simulation', issuer: 'Vista Equity Partners · Forage', date: 'March 2026', href: `${CERT}/AI-action-job-simulation-certificate.png`, image: `${CERT}/AI-action-job-simulation-certificate.png` },
  { title: 'GenAI Job Simulation', issuer: 'BCG · Forage', date: 'March 2026', href: `${CERT}/cbg-x-job-simulation-certificate.png`, image: `${CERT}/cbg-x-job-simulation-certificate.png` },
  { title: 'Internship Certificate', issuer: 'Kempinski Hotel Gold Coast City', date: 'Aug – Oct 2025', href: `${CERT}/kempinski-internship-certificate.png`, image: `${CERT}/kempinski-internship-certificate.png` },
  // NELS SS26 — curated to the two strongest sessions (was six) to keep the
  // credentials focused rather than a certificate museum.
  { title: 'Cross Cultural Communication with Stakeholders', issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate Cross Cultural Communication with Stakeholders.pdf` },
  { title: "Sustainability and SDG's", issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate Sustainability and SDG's.pdf` },
];

// ============================================================================
//  SUPPORT  (kept for the small footer link — no longer a homepage section)
// ============================================================================
export const SUPPORT = {
  intro:
    'AZ Learner is an independent, student-led initiative committed to transforming how students learn. Your contribution directly funds platform development, educational resources, and outreach to students who need it most.',
  paystack: 'https://paystack.shop/pay/fw5uib9s1g',
  impact: [
    { icon: '📚', title: 'Educational Resources', text: 'Free academic tools and study materials for students across disciplines at UCC and beyond.' },
    { icon: '⚙️', title: 'Platform Development', text: 'Continuous improvement of the AZ Learner platform, its features, and the infrastructure that runs it.' },
    { icon: '🌍', title: 'Expanding Reach', text: 'Outreach to bring quality academic support to underserved student communities across Africa.' },
  ],
} as const;

export const EBOOK_HREF =
  'docs/archive/Advanced_Tourism_Concepts_UCC_Student_Creator_Ebook.pdf';

// ============================================================================
//  NEWSLETTER
// ============================================================================
export const NEWSLETTER = {
  title: 'Join the Newsletter',
  desc:
    "Occasional notes on building digital products, tourism, education technology and what I'm shipping — insights and opportunities, straight to your inbox. No fixed schedule, no spam.",
  note: 'No spam · Unsubscribe any time',
  unsubscribeHref: 'unsubscribe.html',
} as const;
