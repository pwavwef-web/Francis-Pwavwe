import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ============================================================================
//  Firebase — single typed initialisation shared by contact + blogs. Config is
//  the same public web config the legacy site used (client-side by design;
//  access is governed by firestore.rules).
// ============================================================================

const firebaseConfig = {
  apiKey: 'AIzaSyB6lxgjNY4CRNHAe3pAgR5SYv1ohL8brOI',
  authDomain: 'francis-pwavwe.firebaseapp.com',
  projectId: 'francis-pwavwe',
  storageBucket: 'francis-pwavwe.firebasestorage.app',
  messagingSenderId: '658069378543',
  appId: '1:658069378543:web:87b1dcb0dd27d3255bd21a',
} as const;

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function db(): Firestore {
  if (!app) app = initializeApp(firebaseConfig);
  if (!dbInstance) dbInstance = getFirestore(app);
  return dbInstance;
}
