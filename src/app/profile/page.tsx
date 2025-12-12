"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { auth, db } from "@/lib/firebase";
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getInterviewStats } from "@/lib/interviews";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

interface UserPreferences {
  favoriteRole?: string;
  difficulty?: string;
  language?: string;
  videoQuality?: "low" | "medium" | "high";
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteRole: "",
    difficulty: "",
    language: "en",
  });

  // Stats
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUser(currentUser);
        setEmail(currentUser.email || "");

        // Load preferences from Firestore
        const prefsDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (prefsDoc.exists()) {
          const data = prefsDoc.data();
          setPreferences({
            favoriteRole: data.preferences?.favoriteRole || "",
            difficulty: data.preferences?.difficulty || "",
            language: data.preferences?.language || "en",
            videoQuality: data.preferences?.videoQuality || "medium",
          });
        } else {
          setPreferences({
            favoriteRole: "",
            difficulty: "",
            language: "en",
            videoQuality: "medium",
          });
        }

        // Load stats
        const statsData = await getInterviewStats(currentUser.uid);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleUpdateEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await updateEmail(user, email);
      setSuccess("Email updated successfully!");
    } catch (err: any) {
      const code = err?.code || "";
      const message =
        code === "auth/requires-recent-login"
          ? "Please log out and log back in to update your email."
          : code === "auth/email-already-in-use"
          ? "This email is already in use."
          : err?.message || "Failed to update email.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      const code = err?.code || "";
      const message =
        code === "auth/wrong-password"
          ? "Current password is incorrect."
          : code === "auth/weak-password"
          ? "Password is too weak. Please choose a stronger password."
          : err?.message || "Failed to update password.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          preferences,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setSuccess("Preferences saved successfully!");
    } catch (err: any) {
      setError("Failed to save preferences. Please try again.");
      console.error("Error saving preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto space-y-6 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your account settings and preferences.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </header>

          {/* Account Stats */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.averageScore.toFixed(1)}/10
                </p>
              </div>
            </div>
          </section>

          {/* Update Email */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Email Address</h2>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Email"}
              </button>
            </form>
          </section>

          {/* Update Password */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>

          {/* Preferences */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
            <form onSubmit={handleUpdatePreferences} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Role
                </label>
                <select
                  value={preferences.favoriteRole}
                  onChange={(e) =>
                    setPreferences({ ...preferences, favoriteRole: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a role</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Mobile Engineer">Mobile Engineer</option>
                  <option value="QA Engineer">QA Engineer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Difficulty
                </label>
                <select
                  value={preferences.difficulty}
                  onChange={(e) =>
                    setPreferences({ ...preferences, difficulty: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select difficulty</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences({ ...preferences, language: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Video Quality
                </label>
                <select
                  value={preferences.videoQuality || "medium"}
                  onChange={(e) =>
                    setPreferences({ ...preferences, videoQuality: e.target.value as "low" | "medium" | "high" })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="low">Low (500 Kbps) - Smaller files, faster upload</option>
                  <option value="medium">Medium (1 Mbps) - Balanced quality and size</option>
                  <option value="high">High (2 Mbps) - Better quality, larger files</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This will be your default recording quality for practice sessions
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </form>
          </section>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

