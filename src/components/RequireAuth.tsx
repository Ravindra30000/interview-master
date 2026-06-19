"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

/**
 * Auth guard that redirects unauthenticated users to /login.
 * Only users who have signed in with email/password can access protected pages.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        // Redirect unauthenticated users (including anonymous) to login
        router.replace("/login");
      }
    });
    return () => unsub();
  }, [router]);

  // Still loading auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // Only render children for authenticated (non-anonymous) users
  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}




