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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key-for-build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: normalizedStorageBucket || "dummy-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:dummy",
};

if (rawStorageBucket && rawStorageBucket !== normalizedStorageBucket) {
  console.warn(
    "[firebase] storageBucket normalized. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET to the bare bucket name, e.g. interview-master-d8c6f.appspot.com"
  );
}

// Initialize Firebase (singleton)
// Use dummy config during build if real config is missing
// This prevents build errors, but Firebase won't work until runtime with real config
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  const hasValidConfig = 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "dummy-key-for-build";
  
  if (hasValidConfig) {
    // Use real config
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  } else {
    // During build, use dummy config to prevent initialization errors
    // This will be re-initialized at runtime with real config
    const dummyConfig = {
      apiKey: "dummy-key-for-build",
      authDomain: "dummy.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:dummy",
    };
    // Use a unique name to avoid conflicts
    app = getApps().length === 0 
      ? initializeApp(dummyConfig, "dummy-build-app")
      : getApps().find(a => a.name === "dummy-build-app") || initializeApp(dummyConfig, "dummy-build-app");
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error: any) {
  // If initialization still fails, log but don't throw during build
  const errorMessage = error?.message || String(error);
  if (typeof window !== "undefined") {
    // In browser, throw the error
    throw new Error(`Firebase initialization failed: ${errorMessage}`);
  }
  // During build, use dummy instances
  console.warn(`[firebase] Build-time initialization failed: ${errorMessage}. Using dummy instances.`);
  const dummyConfig = {
    apiKey: "dummy-key-for-build",
    authDomain: "dummy.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummy",
  };
  app = initializeApp(dummyConfig, "dummy-build-app-fallback");
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };

