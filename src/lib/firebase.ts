import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
// Guard against accidental full URL values which break Storage requests
const normalizedStorageBucket = rawStorageBucket
  ? rawStorageBucket.replace(/^https?:\/\//, "").replace(/\/.*/, "")
  : undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: normalizedStorageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (rawStorageBucket && rawStorageBucket !== normalizedStorageBucket) {
  console.warn(
    "[firebase] storageBucket normalized. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET to the bare bucket name, e.g. interview-master-d8c6f.appspot.com"
  );
}

// Initialize Firebase (singleton)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };

