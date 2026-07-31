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
