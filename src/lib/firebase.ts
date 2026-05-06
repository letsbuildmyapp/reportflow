import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Emulator-only config; real project values get filled in at handoff (.env.local).
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'reportflow-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'demo-reportflow',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'reportflow-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MSG_SENDER_ID ?? '0',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '0',
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

const useEmulator =
  import.meta.env.VITE_USE_EMULATOR === 'true' ||
  (import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_PROJECT_ID);

if (useEmulator) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    // eslint-disable-next-line no-console
    console.info('[ReportFlow] Connected to Firebase emulators');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[ReportFlow] Emulator connection failed', e);
  }
}
