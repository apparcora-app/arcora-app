// Firebase Configuration and Initialization
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, type FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Check if Firebase config is valid
const placeholderFragments = [
  'your_',
  'your-',
  'your ',
  'placeholder',
  'replace',
  'change-me',
  'changeme',
  'todo',
  '<',
  '>',
];

const isConfiguredValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  return (
    trimmedValue.length > 0 &&
    !placeholderFragments.some((fragment) => normalizedValue.includes(fragment))
  );
};

const isValidConfig = Object.values(firebaseConfig).every(isConfiguredValue);

if (isValidConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable offline persistence
  enableIndexedDbPersistence(db, {
    forceOwnership: false,
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence.');
    }
  });

  // Connect to emulators in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  }
} else if (import.meta.env.DEV) {
  console.warn('Firebase configuration is incomplete. Using mock mode for development.');
  // Create mock instances for development
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
} else {
  throw new Error('Firebase configuration is missing or contains placeholder values.');
}

export { app, auth, db, storage };
export default app;
