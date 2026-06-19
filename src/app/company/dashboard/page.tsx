"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { auth } from "@/lib/firebase";
import {
  getUserCompanies,
  getUserAvatarPersonas,
  getCompany,
} from "@/lib/avatarPersona";
import { getInterview, getAllInterviews } from "@/lib/interviews";
import type { Company, AvatarPersona, Interview } from "@/types";
import {
  Loader2,
  Plus,
  Building2,
  User,
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [personas, setPersonas] = useState<AvatarPersona[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Load companies and personas
        const [companiesData, personasData, interviewsData] = await Promise.all([
          getUserCompanies(user.uid),
          getUserAvatarPersonas(user.uid),
          getAllInterviews(user.uid),
        ]);

        setCompanies(companiesData);
        setPersonas(personasData);
        setInterviews(interviewsData);

        // Select first company if available
        if (companiesData.length > 0) {
          setSelectedCompany(companiesData[0]);
        }
      } catch (err: any) {
        console.error("[CompanyDashboard] Load error:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter interviews by selected company
  const companyInterviews = selectedCompany
    ? interviews.filter((interview) => {
        // You might want to add companyId to Interview type
        return true; // For now, show all interviews
      })
    : interviews;

  // Calculate statistics
  const stats = {
    totalInterviews: companyInterviews.length,
    averageScore:
      companyInterviews.length > 0
        ? companyInterviews.reduce((sum, i) => {
            const score =
              i.analysis?.score ||
              i.multimodalAnalysis?.overall_score ||
              0;
            return sum + score;
          }, 0) / companyInterviews.length
        : 0,
    completionRate:
      companyInterviews.length > 0
        ? (companyInterviews.filter((i) => i.analysis).length /
            companyInterviews.length) *
          100
        : 0,
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Company Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your company avatars and view candidate results
              </p>
            </div>
            <Link
              href="/company/avatar/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Avatar
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-modern p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalInterviews}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="card-modern p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.averageScore.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="card-modern p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completionRate.toFixed(0)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Companies & Avatars */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card-modern p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Companies</h2>
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                {companies.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No companies yet. Create an avatar to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => setSelectedCompany(company)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedCompany?.id === company.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {company.avatarPersonas.length} avatar(s)
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-modern p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Avatar Personas</h2>
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                {personas.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">
                    No avatars created yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {personas.slice(0, 5).map((persona) => (
                      <div
                        key={persona.id}
                        className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <p className="font-medium text-gray-900">
                          {persona.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {persona.role}
                        </p>
                        {persona.companyName && (
                          <p className="text-xs text-gray-400 mt-1">
                            {persona.companyName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/company/avatar/create"
                  className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Create New Avatar →
                </Link>
              </div>
            </div>

            {/* Interviews List */}
            <div className="lg:col-span-2">
              <div className="card-modern p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Interviews</h2>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>

                {companyInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No interviews yet</p>
                    <p className="text-sm text-gray-400">
                      Candidate interviews will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companyInterviews.slice(0, 10).map((interview) => {
                      const score =
                        interview.analysis?.score ||
                        interview.multimodalAnalysis?.overall_score ||
                        0;
                      return (
                        <Link
                          key={interview.id}
                          href={`/results/${interview.id}`}
                          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {interview.role} - {interview.difficulty}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(interview.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                  {score.toFixed(0)}
                                </p>
                                <p className="text-xs text-gray-500">Score</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
