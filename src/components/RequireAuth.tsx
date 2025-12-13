"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

/**
 * Auth guard that auto-signs in anonymously for public/demo access.
 * This allows judges and visitors to use the app without creating an account.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u && !isSigningIn) {
        // Auto-sign in anonymously for demo/public access
        setIsSigningIn(true);
        try {
          await signInAnonymously(auth);
          // User will be set by onAuthStateChanged after successful sign in
        } catch (error: any) {
          console.error("Anonymous sign-in failed:", error);
          // Allow access anyway for demo purposes - don't block the UI
          setUser(null);
          setIsSigningIn(false);
        }
      } else if (u) {
        setUser(u);
        setIsSigningIn(false);
      }
    });
    return () => unsub();
  }, [router, isSigningIn]);

  if (user === undefined && isSigningIn) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // Allow access even if anonymous sign-in failed (for demo mode)
  // The app will handle null users gracefully
  return <>{children}</>;
}




