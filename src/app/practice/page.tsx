"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchQuestions,
  filterQuestions,
  pickRandomQuestions,
  getAvailableRoles,
  resetQuestionTracking,
} from "@/lib/questions";
import type { Question } from "@/types";
import Link from "next/link";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import ImportQuestionsButton from "@/components/ImportQuestionsButton";

export const dynamic = "force-dynamic";

const difficulties = ["Junior", "Mid", "Senior"];

export default function PracticeSetupPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [difficulty, setDifficulty] = useState("Mid");

  // Get available roles dynamically from questions
  const availableRoles = useMemo(
    () => getAvailableRoles(questions),
    [questions]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
        // Set default role to first available role
        if (data.length > 0 && !role) {
          const roles = getAvailableRoles(data);
          if (roles.length > 0) {
            setRole(roles[0]);
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reset tracking when role or difficulty changes
  useEffect(() => {
    resetQuestionTracking();
  }, [role, difficulty]);

  const selectedQuestions = useMemo(() => {
    if (!role) return [];
    const filtered = filterQuestions(questions, role, difficulty);
    return pickRandomQuestions(filtered, 5);
  }, [questions, role, difficulty]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="border-b border-gray-200 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold">Start New Interview</h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <main className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">
                  Select preferences
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Role{" "}
                      {availableRoles.length > 0 &&
                        `(${availableRoles.length} available)`}
                    </p>
                    {loading ? (
                      <p className="text-sm text-gray-600">Loading roles...</p>
                    ) : availableRoles.length === 0 ? (
                      <p className="text-sm text-red-600">
                        No roles available. Please import questions.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableRoles.map((r) => (
                          <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                              role === r
                                ? "bg-primary text-white border-primary"
                                : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Difficulty
                    </p>
                    <div className="flex gap-2">
                      {difficulties.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                            difficulty === d
                              ? "bg-primary text-white border-primary"
                              : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900">
                    Selected questions
                  </h2>
                  <span className="text-sm text-gray-600">
                    Showing 5 randomly picked
                  </span>
                </div>

                {loading && (
                  <p className="text-sm text-gray-600">Loading questions...</p>
                )}
                {error && (
                  <p className="text-sm text-red-600">
                    {error} (ensure `public/questions.json` exists)
                  </p>
                )}

                {!loading && !error && (
                  <div className="space-y-3">
                    {selectedQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          Q{idx + 1} · {q.category} · {q.difficulty}
                        </p>
                        <p className="text-sm text-gray-900">{q.question}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          Framework: {q.answerFramework}
                        </p>
                      </div>
                    ))}
                    {selectedQuestions.length === 0 && (
                      <p className="text-sm text-gray-600">
                        No questions for this selection.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Ready to practice?
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  We&apos;ll start with these 5 questions. Choose a mode below.
                </p>
                <Link
                  href={{
                    pathname: "/practice/session",
                    query: { role, difficulty },
                  }}
                  className="block text-center w-full bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-2"
                >
                  Classic practice mode
                </Link>
                <Link
                  href={{
                    pathname: "/practice/avatar",
                    query: { role, difficulty },
                  }}
                  className="block text-center w-full border border-primary text-primary px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Avatar interview mode
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  Avatar mode uses pre-recorded videos, Gemini 2.5 Flash and
                  Google TTS to act as an interview coach.
                </p>
              </div>
            </aside>
          </div>

          <div className="lg:w-2/3">
            <ImportQuestionsButton />
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
