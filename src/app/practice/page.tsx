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
import {
  Code,
  Briefcase,
  BarChart,
  Palette,
  DollarSign,
  Folder,
  Search,
  TrendingUp,
  Shield,
  Heart,
  Package,
  Users,
  UserCircle,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

const difficulties = ["Junior", "Mid", "Senior"];

export default function PracticeSetupPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [difficulty, setDifficulty] = useState("Mid");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  // Get available roles dynamically from questions
  const availableRoles = useMemo(
    () => getAvailableRoles(questions),
    [questions]
  );

  // Filter roles based on search
  const filteredRoles: string[] = useMemo(() => {
    if (!roleSearchQuery) return availableRoles;
    return availableRoles.filter((role: string) =>
      role.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );
  }, [availableRoles, roleSearchQuery]);

  // Domain categorization (comprehensive)
  const categorizeRole = (role: string): string => {
    const roleLower = role.toLowerCase();

    // Engineering (expanded)
    if (
      roleLower.includes("engineer") ||
      roleLower.includes("developer") ||
      roleLower.includes("devops") ||
      roleLower.includes("qa") ||
      roleLower.includes("full stack") ||
      roleLower.includes("mobile") ||
      roleLower.includes("security engineer") ||
      roleLower.includes("cloud engineer") ||
      roleLower.includes("sre") ||
      roleLower.includes("site reliability") ||
      (roleLower.includes("architect") &&
        !roleLower.includes("data architect")) ||
      roleLower.includes("embedded") ||
      roleLower.includes("game developer")
    ) {
      return "Engineering";
    }

    // Business (expanded)
    if (
      roleLower.includes("product manager") ||
      roleLower.includes("mba") ||
      roleLower.includes("business analyst") ||
      roleLower.includes("strategy consultant") ||
      roleLower.includes("operations manager") ||
      roleLower.includes("project manager") ||
      roleLower.includes("program manager") ||
      (roleLower.includes("business development") &&
        !roleLower.includes("representative")) ||
      (roleLower.includes("management consultant") &&
        !roleLower.includes("technology")) ||
      roleLower.includes("supply chain manager")
    ) {
      return "Business";
    }

    // Data & Analytics (expanded)
    if (
      roleLower.includes("data scientist") ||
      roleLower.includes("data engineer") ||
      roleLower.includes("data analyst") ||
      roleLower.includes("machine learning engineer") ||
      roleLower.includes("business intelligence") ||
      roleLower.includes("analytics engineer") ||
      roleLower.includes("data architect") ||
      roleLower.includes("quantitative analyst")
    ) {
      return "Data & Analytics";
    }

    // Design (expanded)
    if (
      roleLower.includes("designer") ||
      roleLower.includes("ux") ||
      roleLower.includes("ui") ||
      roleLower.includes("graphic designer") ||
      roleLower.includes("design systems") ||
      roleLower.includes("user researcher")
    ) {
      return "Design";
    }

    // Finance
    if (
      roleLower.includes("finance") ||
      roleLower.includes("investment") ||
      roleLower.includes("financial advisor") ||
      roleLower.includes("risk analyst") ||
      roleLower.includes("corporate finance") ||
      roleLower.includes("fintech")
    ) {
      return "Finance";
    }

    // Marketing & Sales
    if (
      roleLower.includes("marketing") ||
      (roleLower.includes("sales") && !roleLower.includes("engineer")) ||
      roleLower.includes("seo") ||
      roleLower.includes("content marketing") ||
      roleLower.includes("account executive") ||
      roleLower.includes("business development representative")
    ) {
      return "Marketing & Sales";
    }

    // Cybersecurity
    if (
      (roleLower.includes("security") && !roleLower.includes("engineer")) ||
      roleLower.includes("cybersecurity") ||
      roleLower.includes("penetration tester") ||
      roleLower.includes("compliance officer") ||
      roleLower.includes("information security")
    ) {
      return "Cybersecurity";
    }

    // Healthcare & Biotech
    if (
      roleLower.includes("healthcare") ||
      roleLower.includes("bioinformatics") ||
      roleLower.includes("clinical research") ||
      roleLower.includes("medical device")
    ) {
      return "Healthcare & Biotech";
    }

    // Operations & Supply Chain
    if (
      (roleLower.includes("operations") &&
        !roleLower.includes("manager") &&
        !roleLower.includes("analyst")) ||
      (roleLower.includes("supply chain") && !roleLower.includes("manager")) ||
      roleLower.includes("logistics") ||
      roleLower.includes("process improvement") ||
      roleLower.includes("quality assurance manager")
    ) {
      return "Operations & Supply Chain";
    }

    // Consulting
    if (
      (roleLower.includes("consultant") && !roleLower.includes("strategy")) ||
      roleLower.includes("technology consultant") ||
      roleLower.includes("implementation consultant")
    ) {
      return "Consulting";
    }

    // Human Resources
    if (
      roleLower.includes("hr") ||
      roleLower.includes("human resources") ||
      roleLower.includes("talent acquisition") ||
      roleLower.includes("compensation")
    ) {
      return "Human Resources";
    }

    // Education & Training
    if (
      roleLower.includes("instructional") ||
      (roleLower.includes("training") && !roleLower.includes("specialist")) ||
      roleLower.includes("educational technology")
    ) {
      return "Education & Training";
    }

    return "Other";
  };

  // Domain configuration with color classes
  const getDomainColorClass = (domain: string): string => {
    const colorMap: Record<string, string> = {
      Engineering: "text-blue-600",
      Business: "text-green-600",
      "Data & Analytics": "text-purple-600",
      Design: "text-pink-600",
      Finance: "text-emerald-600",
      "Marketing & Sales": "text-orange-600",
      Cybersecurity: "text-red-600",
      "Healthcare & Biotech": "text-rose-600",
      "Operations & Supply Chain": "text-indigo-600",
      Consulting: "text-teal-600",
      "Human Resources": "text-cyan-600",
      "Education & Training": "text-amber-600",
      Other: "text-gray-600",
    };
    return colorMap[domain] || "text-gray-600";
  };

  const domainConfig: Record<
    string,
    { icon: any; color: string; order: number }
  > = {
    Engineering: { icon: Code, color: "blue", order: 1 },
    Business: { icon: Briefcase, color: "green", order: 2 },
    "Data & Analytics": { icon: BarChart, color: "purple", order: 3 },
    Design: { icon: Palette, color: "pink", order: 4 },
    Finance: { icon: DollarSign, color: "emerald", order: 5 },
    "Marketing & Sales": { icon: TrendingUp, color: "orange", order: 6 },
    Cybersecurity: { icon: Shield, color: "red", order: 7 },
    "Healthcare & Biotech": { icon: Heart, color: "rose", order: 8 },
    "Operations & Supply Chain": { icon: Package, color: "indigo", order: 9 },
    Consulting: { icon: Users, color: "teal", order: 10 },
    "Human Resources": { icon: UserCircle, color: "cyan", order: 11 },
    "Education & Training": { icon: GraduationCap, color: "amber", order: 12 },
    Other: { icon: Folder, color: "gray", order: 13 },
  };

  // Group roles by domain
  const rolesByDomain = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    filteredRoles.forEach((role) => {
      const domain = categorizeRole(role);
      if (!grouped[domain]) {
        grouped[domain] = [];
      }
      grouped[domain].push(role);
    });
    return grouped;
  }, [filteredRoles]);

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
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Role{" "}
                      {availableRoles.length > 0 &&
                        `(${availableRoles.length} available)`}
                    </label>
                    {loading ? (
                      <p className="text-sm text-gray-600">Loading roles...</p>
                    ) : availableRoles.length === 0 ? (
                      <p className="text-sm text-red-600">
                        No roles available. Please import questions.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search roles..."
                            value={roleSearchQuery}
                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Quick Select Dropdown */}
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white shadow-sm"
                        >
                          <option value="">Quick select a role...</option>
                          {filteredRoles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>

                        {/* Domain-organized Role Cards */}
                        {Object.keys(rolesByDomain).length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {Object.entries(rolesByDomain)
                              .sort(
                                ([a], [b]) =>
                                  (domainConfig[a]?.order || 999) -
                                  (domainConfig[b]?.order || 999)
                              )
                              .map(([domain, roles]) => {
                                const IconComponent =
                                  domainConfig[domain]?.icon || Folder;
                                const iconColorClass =
                                  getDomainColorClass(domain);
                                return (
                                  <div
                                    key={domain}
                                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <IconComponent
                                        className={`w-5 h-5 ${iconColorClass}`}
                                      />
                                      <h3 className="font-semibold text-gray-900">
                                        {domain}
                                      </h3>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {roles.length}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {roles.map((r) => (
                                        <button
                                          key={r}
                                          onClick={() => setRole(r)}
                                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            role === r
                                              ? "bg-primary text-white border-primary shadow-md scale-105"
                                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm"
                                          }`}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : roleSearchQuery && filteredRoles.length === 0 ? (
                          <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-600">
                              No roles match your search.
                            </p>
                            <button
                              onClick={() => setRoleSearchQuery("")}
                              className="mt-2 text-xs text-primary hover:underline"
                            >
                              Clear search
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                    >
                      {difficulties.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
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
