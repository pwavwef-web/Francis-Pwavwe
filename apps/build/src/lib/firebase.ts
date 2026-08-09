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

export const submitBuildRequest = httpsCallable<Record<string, unknown>, { reference: string; emailDelayed?: boolean }>(functions, 'submitBuildRequest');
export const listBuildRequests = httpsCallable<Record<string, unknown>, { requests: AdminRequest[] }>(functions, 'listBuildRequests');
export const getBuildRequest = httpsCallable<{ requestId: string }, { request: AdminRequest }>(functions, 'getBuildRequest');
export const updateBuildRequest = httpsCallable<{ requestId: string; changes: Record<string, unknown> }, { ok: boolean }>(functions, 'updateBuildRequest');
export const deleteBuildRequest = httpsCallable<{ requestId: string; confirmation: string }, { ok: boolean }>(functions, 'deleteBuildRequest');
export const verifyBuildAdmin = httpsCallable<Record<string, never>, { authorized: boolean }>(functions, 'verifyBuildAdmin');

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
