import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const defaults = {
  apiKey: 'AIzaSyCMwy_PRlS7H2NjEvMVI44PKUS2K0dpjz8',
  authDomain: 'francis-pwavwe.firebaseapp.com',
  projectId: 'francis-pwavwe',
  storageBucket: 'francis-pwavwe.firebasestorage.app',
  messagingSenderId: '658069378543',
  appId: '1:658069378543:web:1a1caa8433c201b85bd21a',
};

export const siteUrl = (import.meta.env.VITE_SITE_URL ?? 'https://build.pwavwe.com').replace(/\/$/, '');

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? defaults.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? defaults.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? defaults.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? defaults.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? defaults.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? defaults.appId,
});

if (import.meta.env.VITE_APP_CHECK_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app, 'us-central1');

if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export const submitBuildRequest = httpsCallable<Record<string, unknown>, { reference: string; emailDelayed?: boolean; smsDelayed?: boolean }>(functions, 'submitBuildRequest');
export const listBuildRequests = httpsCallable<Record<string, unknown>, { requests: AdminRequest[] }>(functions, 'listBuildRequests');
export const getBuildRequest = httpsCallable<{ requestId: string }, { request: AdminRequest }>(functions, 'getBuildRequest');
export const updateBuildRequest = httpsCallable<{ requestId: string; changes: Record<string, unknown> }, { ok: boolean }>(functions, 'updateBuildRequest');
export const deleteBuildRequest = httpsCallable<{ requestId: string; confirmation: string }, { ok: boolean }>(functions, 'deleteBuildRequest');
export const verifyBuildAdmin = httpsCallable<Record<string, never>, { authorized: boolean }>(functions, 'verifyBuildAdmin');
export const listRequestActivity = httpsCallable<{ requestId: string }, { activity: RequestActivity[] }>(functions, 'listRequestActivity');
export const listRequestMessages = httpsCallable<{ requestId: string }, { messages: RequestMessage[] }>(functions, 'listRequestMessages');
export const verifyRequesterCode = httpsCallable<{ email: string; reference: string }, { session: RequesterSession; portal: RequesterPortal }>(functions, 'verifyRequesterCode');
export const getRequesterRequest = httpsCallable<RequesterSession, { portal: RequesterPortal }>(functions, 'getRequesterRequest');
export const updateRequesterPreferences = httpsCallable<RequesterSession & { preferences: NotificationPreferences }, { ok: boolean; preferences: NotificationPreferences; smsEnabled?: boolean; smsAvailable?: boolean }>(functions, 'updateRequesterPreferences');
export const submitRequesterMessage = httpsCallable<RequesterSession & { body: string }, { ok: boolean; emailDelayed: boolean }>(functions, 'submitRequesterMessage');

export const submitTestimonial = httpsCallable<Record<string, unknown>, { reference: string; emailDelayed?: boolean }>(functions, 'submitTestimonial');
export const listTestimonials = httpsCallable<Record<string, unknown>, { testimonials: AdminTestimonial[] }>(functions, 'listTestimonials');
export const getTestimonial = httpsCallable<{ testimonialId: string }, { testimonial: AdminTestimonial }>(functions, 'getTestimonial');
export const updateTestimonial = httpsCallable<{ testimonialId: string; changes: Record<string, unknown> }, { ok: boolean; published: boolean }>(functions, 'updateTestimonial');
export const deleteTestimonial = httpsCallable<{ testimonialId: string; confirmation: string }, { ok: boolean }>(functions, 'deleteTestimonial');
export const reanalyzeTestimonial = httpsCallable<{ testimonialId: string }, { sentiment: TestimonialSentiment }>(functions, 'reanalyzeTestimonial');
export const sendAdminEmail = httpsCallable<{
  to: string;
  subject: string;
  body: string;
  contextType: 'general' | 'build_request' | 'testimonial';
  contextId?: string;
  reference?: string;
}, { ok: boolean }>(functions, 'sendAdminEmail');
export const sendAdminSms = httpsCallable<{ requestId: string; body: string; force?: boolean }, { ok: boolean }>(functions, 'sendAdminSms');

export type NotificationCategory = 'status' | 'timeline' | 'messages' | 'github' | 'milestones';
export type NotificationDigest = 'immediate' | 'daily' | 'important';
export type NotificationChannelPreferences = Record<NotificationCategory, boolean>;
export type NotificationPreferences = {
  email: NotificationChannelPreferences;
  sms: NotificationChannelPreferences;
  digest: NotificationDigest;
};

export type RequesterSession = {
  requestId: string;
  sessionId: string;
  token: string;
  expiresAt?: string;
};

export type RequestActivity = {
  id: string;
  action: string;
  category?: string;
  title?: string;
  summary?: string;
  subject?: string;
  url?: string;
  public?: boolean;
  publicChangedKeys?: string[];
  changedKeys?: string[];
  actorEmail?: string;
  createdAt?: { seconds: number } | string | null;
};

export type RequestMessage = {
  id: string;
  direction: string;
  channel: string;
  subject?: string;
  body: string;
  to?: string;
  senderEmail?: string;
  emailStatus?: string;
  createdAt?: { seconds: number } | string | null;
};

export type ProjectHealth = 'on_track' | 'watch' | 'at_risk' | 'paused';
export type DeliveryConfidence = 'high' | 'medium' | 'low';
export type ProjectItemVisibility = { visibleToRequester?: boolean };

export type ProjectMilestone = ProjectItemVisibility & {
  id: string;
  title: string;
  status: 'planned' | 'active' | 'complete' | 'blocked';
  owner?: string;
  dueDate?: string;
  completedAt?: string;
  summary?: string;
};

export type ProjectTask = ProjectItemVisibility & {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'blocked' | 'done';
  owner?: string;
  dueDate?: string;
  notes?: string;
};

export type ProjectDecision = ProjectItemVisibility & {
  id: string;
  title: string;
  status: 'open' | 'decided' | 'revisit';
  decidedAt?: string;
  summary?: string;
};

export type ProjectRisk = ProjectItemVisibility & {
  id: string;
  title: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'mitigating' | 'resolved';
  mitigation?: string;
};

export type ProjectMeeting = ProjectItemVisibility & {
  id: string;
  title: string;
  scheduledAt?: string;
  channel?: string;
  notes?: string;
  actionItems?: string[];
};

export type RequesterPortalRequest = {
  id: string;
  reference: string;
  name: string;
  organisation: string;
  projectType: string;
  projectSummary: string;
  status: string;
  publicNote?: string;
  nextUpdateAt?: string;
  estimatedStartAt?: string;
  estimatedDeliveryAt?: string;
  proposalUrl?: string;
  driveFolderUrl?: string;
  sharedLinks?: string[];
  githubLinks?: string[];
  preferredTimeline?: string;
  budgetRange?: string;
  projectHealth?: ProjectHealth;
  deliveryConfidence?: DeliveryConfidence;
  currentFocus?: string;
  nextStep?: string;
  acceptanceCriteria?: string[];
  projectMilestones?: ProjectMilestone[];
  projectTasks?: ProjectTask[];
  projectDecisions?: ProjectDecision[];
  projectRisks?: ProjectRisk[];
  projectMeetings?: ProjectMeeting[];
  notificationPreferences: NotificationPreferences;
  smsEnabled: boolean;
  smsAvailable: boolean;
  timeline: { key: string; label: string; state: 'complete' | 'current' | 'upcoming'; detail: string }[];
  createdAt?: { seconds: number } | string | null;
  updatedAt?: { seconds: number } | string | null;
  lastGithubUpdateAt?: { seconds: number } | string | null;
};

export type RequesterPortal = {
  request: RequesterPortalRequest;
  activity: RequestActivity[];
  messages: RequestMessage[];
};

export type PublicTestimonial = {
  name: string;
  role?: string;
  organisation?: string;
  quote: string;
  rating: number;
  projectName?: string;
  featured?: boolean;
  order?: number;
  sourceId?: string;
};

// Public, display-safe testimonials. Written only by trusted callable Functions
// and readable by anyone, so this never exposes emails or private feedback.
// The Firestore SDK is imported dynamically so it stays out of the initial
// bundle — the landing page only pays for it once testimonials are requested.
// Sorting is done client-side to avoid needing a composite index.
export async function fetchPublicTestimonials(max = 60): Promise<PublicTestimonial[]> {
  const { collection, getDocs, getFirestore, limit, orderBy, query } = await import('firebase/firestore');
  const snapshot = await getDocs(query(collection(getFirestore(app), 'publicTestimonials'), orderBy('approvedAt', 'desc'), limit(max)));
  const items = snapshot.docs.map((document) => document.data() as PublicTestimonial);
  return items.sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 0) - (b.order ?? 0));
}

export type AdminTestimonial = {
  id: string;
  reference: string;
  authorName: string;
  authorRole?: string;
  authorOrganisation?: string;
  authorEmail?: string;
  projectName?: string;
  projectRef?: string;
  rating: number;
  testimonial: string;
  privateFeedback?: string;
  wouldRecommend?: boolean;
  publishConsent?: boolean;
  displayNameConsent?: boolean;
  displayName?: string;
  displayRole?: string;
  displayOrganisation?: string;
  displayQuote?: string;
  status: string;
  published?: boolean;
  featured?: boolean;
  order?: number;
  internalNotes?: string;
  emailStatus?: string;
  sentimentStatus?: 'pending' | 'analyzed' | 'failed';
  sentiment?: TestimonialSentiment | null;
  createdAt?: { seconds: number } | string;
  updatedAt?: { seconds: number } | string;
};

export type TestimonialSentiment = {
  label: 'positive' | 'mixed' | 'neutral' | 'negative';
  score: number;
  confidence: number;
  summary: string;
  themes: string[];
  followUpRecommended: boolean;
  model?: string;
  analyzedAt?: { seconds: number } | string;
};

export type AdminRequest = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone?: string;
  organisation: string;
  projectType: string;
  projectSummary: string;
  problemStatement: string;
  targetUsers: string;
  features: string;
  existingWebsite?: string;
  referenceLinks?: string;
  budgetRange: string;
  preferredTimeline: string;
  preferredContact: string;
  discoverySource?: string;
  additionalNotes?: string;
  contactConsent: boolean;
  marketingConsent: boolean;
  smsConsent?: boolean;
  smsStatus?: string;
  notificationPreferences?: NotificationPreferences;
  requesterAccessEnabled?: boolean;
  publicStatus?: string;
  publicNote?: string;
  nextUpdateAt?: string;
  estimatedStartAt?: string;
  estimatedDeliveryAt?: string;
  sharedLinks?: string[];
  githubLinks?: string[];
  projectHealth?: ProjectHealth;
  deliveryConfidence?: DeliveryConfidence;
  currentFocus?: string;
  nextStep?: string;
  acceptanceCriteria?: string[];
  projectMilestones?: ProjectMilestone[];
  projectTasks?: ProjectTask[];
  projectDecisions?: ProjectDecision[];
  projectRisks?: ProjectRisk[];
  projectMeetings?: ProjectMeeting[];
  lastGithubUpdateAt?: { seconds: number } | string;
  lastRequesterMessageAt?: { seconds: number } | string;
  lastOutboundSmsAt?: { seconds: number } | string;
  status: string;
  priority: string;
  internalNotes?: string;
  internalTags?: string[];
  proposalUrl?: string;
  driveFolderUrl?: string;
  followUpDate?: string;
  createdAt?: { seconds: number } | string;
  updatedAt?: { seconds: number } | string;
};
