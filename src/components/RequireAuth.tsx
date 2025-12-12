"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

/**
 * Simple client-side auth guard. If no user, redirect to /login.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}




