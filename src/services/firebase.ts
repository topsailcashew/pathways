import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with memory-only cache (prevents IndexedDB errors in dev)
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: false, // Use websockets instead
});

// Initialize services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize App Check
if (import.meta.env.PROD) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('placeholder-recaptcha-key'),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  // Development mode - use debug token
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN;
}
