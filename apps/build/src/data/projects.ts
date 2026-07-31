export type Project = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  problem: string;
  users: string;
  solution: string;
  features: string[];
  technology: string[];
  challenges: string;
  lessons: string;
  status: string;
  externalUrl?: string;
  image?: string;
  featured: boolean;
  publicationPermission: boolean;
};

export const projects: Project[] = [
  {
    title: 'UCC SRC App',
    slug: 'ucc-src-app',
    summary: 'A clearer digital service channel between student leadership and daily campus life.',
    category: 'Mobile application',
    problem: 'Important council services, announcements, events and governance touchpoints can be difficult to find when they are spread across several channels.',
    users: 'Students and Student Representative Council teams at the University of Cape Coast.',
    solution: 'A focused mobile application that brings core SRC information and student services into one accessible place.',
    features: ['Announcements and updates', 'Events and campus information', 'Student-service touchpoints', 'Mobile-first navigation'],
    technology: ['Cross-platform mobile application', 'Cloud-backed content and services'],
    challenges: 'A campus product has to keep varied information understandable without turning the interface into another noticeboard.',
    lessons: 'Useful campus technology starts with the student journey, then gives administrators the simplest possible way to keep it current.',
    status: 'Published on Google Play',
    externalUrl: 'https://play.google.com/store/apps/details?id=com.uccsrc.uccsrcapp&hl=en-US',
    image: '/project-covers/ucc-src-app.webp',
    featured: true,
    publicationPermission: true,
  },
  {
    title: 'SMG Transport Agency',
    slug: 'smg-transport-agency',
    summary: 'An intercity travel booking workflow covering route discovery, seats, payment and QR tickets.',
    category: 'Web application',
    problem: 'Passengers need a dependable path from finding an active route to holding a verifiable ticket, while staff need visibility behind the scenes.',
    users: 'Intercity travellers and the SMG Transport Agency operations team.',
    solution: 'A Ghana-focused booking platform where passengers search routes, select seats, pay online and receive QR e-tickets.',
    features: ['Route search', 'Seat selection', 'Online payment', 'QR e-tickets', 'Staff operations tools'],
    technology: ['Responsive web application', 'Payment integration', 'QR ticket workflow'],
    challenges: 'Booking, payment and verification must behave like one journey even though each step has different failure cases.',
    lessons: 'Operational tools are strongest when the customer-facing flow and the staff workflow are designed together.',
    status: 'Live platform',
    externalUrl: 'https://smgagencygh.com',
    image: '/project-covers/smg-transport-agency.webp',
    featured: true,
    publicationPermission: true,
  },
  {
    title: 'VitaForge AI',
    slug: 'vitaforge-ai',
    summary: 'A student-first AI career platform for stronger, more deliberate job applications.',
    category: 'AI-enabled product',
    problem: 'Students often struggle to turn real experience into clear CVs, tailored letters and application material that fits a role.',
    users: 'Students and early-career applicants preparing professional applications.',
    solution: 'An AI-assisted workspace for CVs, cover letters, ATS-aware application material and guided career documents.',
    features: ['CV builder', 'Tailored cover letters', 'ATS-aware guidance', 'Reusable career material'],
    technology: ['AI-assisted workflows', 'Web application', 'Structured document generation'],
    challenges: 'The AI must support the user’s real experience rather than inventing credentials or flattening every voice into the same template.',
    lessons: 'The useful part of AI is not more text; it is a better decision path with honest human review built in.',
    status: 'Live platform',
    externalUrl: 'https://vitaforge.pwavwe.com',
    image: '/project-covers/vitaforge-ai.webp',
    featured: true,
    publicationPermission: true,
  },
  {
    title: 'Pollaris',
    slug: 'pollaris',
    summary: 'A configurable campus election platform built around managed access and auditable results.',
    category: 'Campus system',
    problem: 'Campus elections need a controlled voting journey, clear administration and results that can be checked without making the experience confusing for voters.',
    users: 'Student voters, election officers and campus organisations.',
    solution: 'A multi-election platform covering voter-code access, ballots, staff tools, audit trails, certified results and election-scoped exports.',
    features: ['Voter-code access', 'Configurable ballots', 'Election dashboards', 'Audit trails', 'Results and exports'],
    technology: ['Responsive web application', 'Firebase-backed workflows', 'Role-aware administration'],
    challenges: 'Election software must balance ease of participation with deliberate controls, traceability and clear operational boundaries.',
    lessons: 'Trust comes from understandable rules, careful state changes and evidence that administrators can inspect after the vote.',
    status: 'Election platform',
    externalUrl: 'https://absag-ucc1.web.app',
    image: '/project-covers/pollaris.webp',
    featured: true,
    publicationPermission: true,
  },
  {
    title: 'HallKey',
    slug: 'hallkey',
    summary: 'A smart hall key-access prototype designed to reduce queues and improve accountability.',
    category: 'Campus system',
    problem: 'Manual key collection can produce queues and weak operational visibility for students, porters and hall administrators.',
    users: 'University hall residents, porters and hall administrators.',
    solution: 'A prototype where a student requests a mapped room key, verifies their identity and gives staff a live operational record.',
    features: ['Key requests', 'Identity verification concept', 'Room-to-key mapping', 'Live staff record'],
    technology: ['Web prototype', 'Identity-aware workflow', 'Cloud-backed records'],
    challenges: 'Physical access workflows need graceful fallbacks and careful privacy decisions before they can move beyond a prototype.',
    lessons: 'Digitising a queue is not enough; the design must make exceptions, accountability and staff reality visible.',
    status: 'Live prototype',
    externalUrl: 'https://hallkey.web.app',
    image: '/project-covers/hallkey.webp',
    featured: true,
    publicationPermission: true,
  },
  {
    title: 'AZ Learner',
    slug: 'az-learner',
    summary: 'A founder-led academic support platform built around purposeful learning and student progress.',
    category: 'Education technology',
    problem: 'Students need more intentional ways to find learning resources, organise support and build consistent academic habits.',
    users: 'University students at UCC and learners beyond the campus.',
    solution: 'An evolving education platform with learning paths, resource access, analytics-informed support and collaborative study tools.',
    features: ['Learning resources', 'Purposeful study paths', 'Progress support', 'Collaborative learning tools'],
    technology: ['Web platform', 'Education workflows', 'Cloud services'],
    challenges: 'A long-term student platform has to remain useful as needs change without accumulating features that obscure the core learning journey.',
    lessons: 'Founder-led products improve through repeated contact with the actual problem, not a one-time feature list.',
    status: 'Active, founder-led platform',
    externalUrl: 'https://azlearner.me',
    image: '/project-covers/az-learner.webp',
    featured: true,
    publicationPermission: true,
  },
];

export const publishedProjects = projects.filter((project) => project.publicationPermission);
