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
// ============================================================================
export const PROFILE = {
  name: 'Francis Pwavwe',
  handle: 'pwavwe.com',
  credential: 'Tourism Management · University of Cape Coast · Ghana',
  roles: [
    'Strategic Thinker',
    'Tourism Professional',
    'Digital Innovator',
    'Founder of AZ Learner',
  ],
  tagline:
    'Advancing digital innovation in education and tourism — building purposeful systems that elevate academic performance and redefine strategic possibilities across Africa.',
  email: 'francis@pwavwe.com',
  location: 'Cape Coast, Ghana',
  linkedin: 'https://linkedin.com/in/francis-pwavwe',
} as const;

// ============================================================================
//  NAVIGATION  (reorganised information architecture)
// ============================================================================
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Capabilities' },
  { id: 'journey', label: 'Journey' },
  { id: 'insights', label: 'Insights' },
  { id: 'vision', label: 'Vision' },
  { id: 'contact', label: 'Contact' },
];

export const SOCIALS: readonly SocialLink[] = [
  { label: 'Email', href: 'mailto:francis@pwavwe.com', icon: '✉' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/francis-pwavwe', icon: 'in' },
  { label: 'AZ Learner', href: 'https://azlearner.me', icon: '↗' },
];

// ============================================================================
//  STATS  (animated counters)
// ============================================================================
export const STATS: readonly Stat[] = [
  { value: 13, suffix: '+', label: 'Featured Projects' },
  { value: 11, suffix: '', label: 'Certifications' },
  { value: 3, suffix: '+', label: 'Years Building AZ Learner' },
  { value: 5, suffix: '', label: 'Global Programs' },
];

// ============================================================================
//  ABOUT  (highlights)
// ============================================================================
export const ABOUT_PARAGRAPHS: readonly string[] = [
  'I am Francis Pwavwe — a Tourism Management student at the University of Cape Coast and Founder of AZ Learner, an academic support platform dedicated to improving student retention and performance through purposeful digital innovation.',
  'As an active member of both the Oguaa Hall Army Cadet Corps and the UCC Armed Forces Cadet Corps, I have cultivated the discipline, structure, and strategic focus that inform every undertaking I pursue.',
  'I currently serve on the SRC Water and Sanitation Committee at the University of Cape Coast, contributing to campus welfare and sustainability initiatives since February 2026.',
  'My work sits at the intersection of leadership, digital systems, and innovation — always focused on building systems that transform experiences and generate sustainable growth across the African educational and tourism landscape.',
];

export const ABOUT_HIGHLIGHTS: readonly { label: string; value: string }[] = [
  { label: 'Founder & CEO', value: 'AZ Learner' },
  { label: 'Program', value: 'Harvard Aspire Leaders' },
  { label: 'Focus', value: 'Tourism Strategy · EdTech' },
  { label: 'Based in', value: 'Cape Coast, Ghana' },
];

// ============================================================================
//  PROJECTS
// ============================================================================
export const PROJECTS: readonly Project[] = [
  {
    title: 'UCC SRC App',
    category: 'Mobile App Development',
    tags: ['Technology', 'Leadership'],
    icon: 'assets/icon%20(2).png',
    iconIsImage: true,
    description:
      'The official Student Representative Council app for the University of Cape Coast, designed to give students seamless access to services, announcements, events, and governance touchpoints.',
    impact: 'Connects student leadership with daily campus life through a clearer digital service channel.',
    status: 'Recent build',
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
    title: 'Luban Workshop Restaurant',
    category: 'Digital Marketing & Web',
    tags: ['Tourism', 'Technology'],
    icon: 'assets/project-covers/luban-logo.png',
    iconIsImage: true,
    coverImage: 'assets/project-covers/luban-logo.png',
    description:
      "Improving the visibility of my department's Chinese restaurant through website design, search engine optimisation, and social media engagement.",
    impact: 'Connects hospitality operations with discoverable digital storytelling.',
    status: 'Strategy project',
    year: '2025',
    link: { label: 'Visit restaurant site', href: 'https://lubanrestaurant.com' },
    featured: true,
  },
  {
    title: 'VitaForge AI',
    category: 'AI Career Platform',
    tags: ['Education', 'Technology'],
    icon: 'VF',
    coverImage: 'assets/project-covers/vitaforge.png',
    description:
      'A student-first AI career platform for building polished CVs, tailored cover letters, ATS-ready applications, and guided career materials.',
    impact: 'Helps students turn experience into stronger job applications with practical AI support.',
    status: 'Live platform',
    year: '2026',
    link: { label: 'Visit VitaForge', href: 'https://vitaforge.pwavwe.com' },
    featured: true,
  },
  {
    title: 'Department Election Portal',
    category: 'Election Technology',
    tags: ['Technology', 'Leadership', 'Community'],
    icon: 'EP',
    coverImage: 'assets/project-covers/election-portal-logo.png',
    description:
      'A secure web voting portal used to organise elections for three departments across June and July 2026, supporting smoother student governance workflows.',
    impact: 'Brought digital structure, transparency, and easier participation to departmental elections.',
    status: 'Used in elections',
    year: 'Jun-Jul 2026',
    link: { label: 'Visit election portal', href: 'https://absag-ucc1.web.app' },
    featured: true,
  },
  {
    title: 'AZ Learner',
    category: 'Education Technology',
    tags: ['Education', 'Technology'],
    icon: '🎓',
    description:
      'An academic support platform improving student retention and performance through purposeful learning paths, resource access, analytics-informed support, and collaborative study tools.',
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
    impact: 'Makes reflective strategy more accessible for students, founders, and emerging leaders.',
    status: 'Live tool',
    year: '2026',
    link: { label: 'Take the quiz', href: 'swot-quiz.html' },
    featured: true,
  },
  {
    title: 'Project Kassena',
    category: 'Language Infrastructure · Community',
    tags: ['Community', 'Technology', 'Research'],
    icon: '🗣️',
    description:
      'Building a trusted digital Kasem dictionary, phrase corpus, and AI-ready language dataset, created with community input and designed for education, culture, and long-term preservation.',
    impact: 'Protects language heritage while preparing community knowledge for digital learning systems.',
    status: 'Research build',
    year: '2025-Present',
    meta: 'Started: April 20, 2025',
    link: { label: 'Visit Project Kassena', href: 'https://kassena.azlearner.me' },
    featured: true,
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
    featured: true,
  },
  {
    title: 'Francis Pwavwe Productions',
    category: 'Digital Media & Personal Brand',
    tags: ['Technology', 'Leadership'],
    icon: '🎙️',
    description:
      'A digital media and production identity for publishing voice, video, writing, and student-centered stories with a polished, credible portfolio presence.',
    impact: 'Creates a structured channel for thought leadership, creative work, and professional storytelling.',
    status: 'Brand system',
    year: '2026',
    link: { label: 'Explore productions', href: 'fp-index.html' },
  },
  {
    title: 'Campus Sustainability Operations',
    category: 'Student Welfare & Service',
    tags: ['Leadership', 'Community'],
    icon: '💧',
    description:
      'Committee work supporting water, sanitation, and campus welfare priorities through service coordination, problem tracking, and student-centered improvements.',
    impact: 'Contributes to a healthier campus experience through practical service leadership.',
    status: 'Active service',
    year: '2026-Present',
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
    title: 'Journey to the East',
    category: 'Event Leadership & Coordination',
    tags: ['Leadership'],
    icon: '🚗',
    description:
      'Head of Security and Transport Committee for a major event, coordinating logistics, participant safety, and the team responsible for seamless transport and security operations.',
    impact: 'Delivered structure and calm execution for a complex event environment.',
    status: 'Event leadership',
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
//  SKILLS
// ============================================================================
export const SKILLS: readonly Skill[] = [
  { icon: '🗺️', name: 'Tourism Planning', description: 'Strategic development and management of tourism experiences.' },
  { icon: '📈', name: 'Research & Data Analysis', description: 'Evidence-based decision making and insight generation.' },
  { icon: '✈️', name: 'Travel & Tour Operations', description: 'End-to-end management of travel services and experiences.' },
  { icon: '🎯', name: 'Event Coordination', description: 'Seamless planning and execution of complex events.' },
  { icon: '👥', name: 'Leadership & Team Management', description: 'Building and guiding high-performing teams.' },
  { icon: '💡', name: 'Digital Strategy', description: 'Leveraging technology for competitive advantage.' },
  { icon: '🔄', name: 'Systems Thinking', description: 'Holistic approach to complex problem-solving.' },
  { icon: '🎤', name: 'Public Speaking', description: 'Clear and compelling communication to diverse audiences.' },
];

// ============================================================================
//  EXPERIENCE  (journey timeline)
// ============================================================================
export const EXPERIENCE: readonly ExperienceItem[] = [
  { kind: 'simulation', title: 'Vista Equity Partners — AI in Action (Forage)', company: 'Vista Equity Partners', date: 'March 2026', description: 'Prompt engineering and GenAI workflow automation for Portfolio Operations — synthesising NPS feedback into executive-ready insights and improving output relevance by >50% through iteration.' },
  { kind: 'simulation', title: 'BCG GenAI Job Simulation (Forage)', company: 'Boston Consulting Group', date: 'March 2026', description: 'AI-powered financial chatbot development — Python and pandas, interpreting 10-K/10-Q data with rule-based logic to deliver user-friendly financial insights.' },
  { kind: 'simulation', title: 'EY Technology Risk Simulation (Forage)', company: 'EY', date: 'February 2026', description: 'Understanding typical IT risks and processes for the Tech Risk team — relationship building, teaming, and productivity.' },
  { kind: 'leadership', title: 'Committee Member — Water & Sanitation', company: 'SRC, University of Cape Coast', date: 'Feb 2026 – Present', description: "Serving on the Student Representative Council's Water and Sanitation Committee, contributing to campus welfare and sustainability initiatives." },
  { kind: 'work', title: 'Intern — Housekeeping & Food and Beverage', company: 'Kempinski Hotel Gold Coast City', date: 'Aug – Oct 2025', description: 'Hands-on experience in luxury hospitality operations — guest service excellence, operational efficiency, and five-star quality standards.' },
  { kind: 'education', title: 'Harvard Aspire Leaders Program', company: 'Cohort 5', date: '2025', description: 'Completed the prestigious Harvard Aspire Leaders Program — leadership frameworks, strategic thinking, and global perspectives.' },
  { kind: 'leadership', title: 'Founder & CEO', company: 'AZ Learner', date: '2023 – Present', description: 'Founded and leading an education-tech platform improving student retention and academic performance through innovative digital solutions.' },
  { kind: 'leadership', title: 'Head of Security & Transport Committee', company: 'Journey to the East Event', date: '2024', description: 'Led security and transportation operations for a major regional event — logistics, team coordination, and seamless safety protocols.' },
  { kind: 'leadership', title: 'Cadet Member', company: 'Oguaa Hall & UCC Armed Forces Cadet Corps', date: '2022 – Present', description: 'Developing leadership, discipline, and strategic thinking through military training and cadet corps activities.' },
  { kind: 'work', title: 'Digital Strategy Consultant', company: 'Torchlight Tours', date: '2023 – 2024', description: 'Social media strategy to enhance brand visibility, audience engagement, and conversion rates in a competitive tourism market.' },
  { kind: 'education', title: 'Tourism Management Student', company: 'University of Cape Coast', date: '2021 – Present', description: 'Comprehensive education in tourism management, strategic planning, and hospitality operations, with research on sustainable tourism.' },
];

// ============================================================================
//  CERTIFICATES
// ============================================================================
const CERT = 'assets/certificates';
export const CERTIFICATES: readonly Certificate[] = [
  { title: 'Technology Risk Virtual Job Simulation', issuer: 'EY · Forage', date: 'February 2026', href: `${CERT}/ey-technology-risk-certificate.png`, image: `${CERT}/ey-technology-risk-certificate.png` },
  { title: 'Generative AI Mastermind', issuer: 'Outskill', date: '2026', href: `${CERT}/outskill-genreative-ai-mastermind-certificate.png`, image: `${CERT}/outskill-genreative-ai-mastermind-certificate.png` },
  { title: 'AI in Action Job Simulation', issuer: 'Vista Equity Partners · Forage', date: 'March 2026', href: `${CERT}/AI-action-job-simulation-certificate.png`, image: `${CERT}/AI-action-job-simulation-certificate.png` },
  { title: 'GenAI Job Simulation', issuer: 'BCG · Forage', date: 'March 2026', href: `${CERT}/cbg-x-job-simulation-certificate.png`, image: `${CERT}/cbg-x-job-simulation-certificate.png` },
  { title: 'Internship Certificate', issuer: 'Kempinski Hotel Gold Coast City', date: 'Aug – Oct 2025', href: `${CERT}/kempinski-internship-certificate.png`, image: `${CERT}/kempinski-internship-certificate.png` },
  { title: 'Welcome Session', issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate Welcome Session.pdf` },
  { title: 'Cross Cultural Communication with Stakeholders', issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate Cross Cultural Communication with Stakeholders.pdf` },
  { title: 'New Ways of Student Organising II', issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate New Ways of Student Organising II.pdf` },
  { title: 'Communication with Decision Makers', issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Communication with Decision Makers.pdf` },
  { title: "Sustainability and SDG's", issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate Sustainability and SDG's.pdf` },
  { title: 'Dealing with Resistance in the Student Movement', issuer: 'NELS SS26', date: '2026', href: `${CERT}/NELS SS26_Certificate Dealing with Resistance in the Student Movement.pdf` },
];

// ============================================================================
//  VISION
// ============================================================================
export const VISION = {
  statement:
    'To become a leading international tourism strategist, pioneering innovative systems that transform the African tourism landscape while revolutionising student experiences across the continent.',
  paragraphs: [
    "I envision a future where strategic thinking meets digital innovation — where African students have access to world-class educational support systems, and where tourism operations leverage technology to create sustainable, impactful experiences. Through AZ Learner and my work in tourism management, I'm building the foundation for this transformation, one system at a time.",
    "My goal is to bridge the gap between traditional tourism management and digital innovation — creating frameworks that drive both economic growth and educational excellence. I'm committed to developing solutions that don't just solve problems; they redefine possibilities.",
  ],
} as const;

// ============================================================================
//  SUPPORT
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

export const VOICE_OVERVIEW_EMBED =
  'https://drive.google.com/file/d/179FRNVt-wG2wZdPcCwGZN3ifQ1Fqgu1s/preview';
export const VOICE_OVERVIEW_LINK =
  'https://drive.google.com/file/d/179FRNVt-wG2wZdPcCwGZN3ifQ1Fqgu1s/view?usp=sharing';
