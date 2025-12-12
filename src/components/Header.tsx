"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">
          InterviewMaster
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold text-gray-700">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          {user && (
            <>
              <Link href="/practice" className="hover:text-gray-900">
                Practice
              </Link>
              <Link href="/dashboard" className="hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-gray-900">
                Profile
              </Link>
            </>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition disabled:opacity-60"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}



