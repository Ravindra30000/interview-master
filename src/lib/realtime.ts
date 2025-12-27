import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  Database,
} from "firebase/database";
import { app } from "@/lib/firebase";
import type {
  SessionState,
  AvatarState,
  ConversationMessage,
} from "@/types/realtime";

let database: Database | null = null;

function getRealtimeDatabase(): Database {
  if (database) return database;

  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL for Realtime Database"
    );
  }

  database = getDatabase(app, databaseURL);
  return database;
}

export function getSessionRef(sessionId: string) {
  const db = getRealtimeDatabase();
  return ref(db, `sessions/${sessionId}`);
}

export async function createAvatarSession(
  sessionId: string,
  state: Omit<SessionState, "createdAt" | "updatedAt">
) {
  const db = getRealtimeDatabase();
  const sessionRef = ref(db, `sessions/${sessionId}`);

  const now = Date.now();
  const fullState: SessionState = {
    ...state,
    createdAt: now,
    updatedAt: now,
  };

  await set(sessionRef, fullState);
  return sessionId;
}

export async function updateSessionState(
  sessionId: string,
  state: Partial<SessionState>
) {
  const db = getRealtimeDatabase();
  const sessionRef = ref(db, `sessions/${sessionId}`);

  // Get current state first
  const current = await getSessionState(sessionId);
  if (!current) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const updates: any = {
    ...current,
    ...state,
    updatedAt: Date.now(),
  };

  await set(sessionRef, updates);
}

export async function getSessionState(
  sessionId: string
): Promise<SessionState | null> {
  const db = getRealtimeDatabase();
  const sessionRef = ref(db, `sessions/${sessionId}`);
  const snapshot = await get(sessionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as SessionState;
}

export function subscribeToSession(
  sessionId: string,
  callback: (state: SessionState | null) => void
) {
  const db = getRealtimeDatabase();
  const sessionRef = ref(db, `sessions/${sessionId}`);

  const unsubscribe = onValue(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as SessionState);
    } else {
      callback(null);
    }
  });

  return () => {
    off(sessionRef);
    unsubscribe();
  };
}
