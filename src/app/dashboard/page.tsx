"use client";

import Link from "next/link";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState, useMemo } from "react";
import { getRecentInterviews, getInterviewStats, getAllInterviews } from "@/lib/interviews";
import { countFirestoreQuestions } from "@/lib/questions";
import { auth } from "@/lib/firebase";
import type { Interview } from "@/types";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [allInterviews, setAllInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    recentScores: [] as number[],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [checkingQuestions, setCheckingQuestions] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const [interviewData, statsData] = await Promise.all([
          getAllInterviews(user.uid),
          getInterviewStats(user.uid),
        ]);

        setAllInterviews(interviewData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter interviews based on search and filters
  const filteredInterviews = useMemo(() => {
    return allInterviews.filter((interview) => {
      const matchesSearch = 
        searchQuery === "" ||
        interview.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.question.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || interview.role === roleFilter;
      const matchesDifficulty = difficultyFilter === "all" || interview.difficulty === difficultyFilter;

      return matchesSearch && matchesRole && matchesDifficulty;
    });
  }, [allInterviews, searchQuery, roleFilter, difficultyFilter]);

  // Get unique roles and difficulties for filters
  const uniqueRoles = useMemo(() => {
    const roles = new Set(allInterviews.map((i) => i.role));
    return Array.from(roles).sort();
  }, [allInterviews]);

  const uniqueDifficulties = useMemo(() => {
    const difficulties = new Set(allInterviews.map((i) => i.difficulty));
    return Array.from(difficulties).sort();
  }, [allInterviews]);

  // Prepare chart data
  const scoreTrendData = useMemo(() => {
    const sorted = [...filteredInterviews]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-10); // Last 10 interviews
    
    return sorted.map((interview, index) => {
      const score = interview.analysis?.score || 
        (interview.localMetrics 
          ? (interview.localMetrics.confidence + interview.localMetrics.clarity + interview.localMetrics.structure) / 3 * 10 
          : 0);
      return {
        name: `Session ${index + 1}`,
        score: Number(score.toFixed(1)),
        date: interview.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
    });
  }, [filteredInterviews]);

  const roleDistributionData = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    filteredInterviews.forEach((interview) => {
      roleCounts[interview.role] = (roleCounts[interview.role] || 0) + 1;
    });
    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
    }));
  }, [filteredInterviews]);

  const difficultyDistributionData = useMemo(() => {
    const difficultyCounts: Record<string, number> = {};
    filteredInterviews.forEach((interview) => {
      difficultyCounts[interview.difficulty] = (difficultyCounts[interview.difficulty] || 0) + 1;
    });
    return Object.entries(difficultyCounts).map(([difficulty, count]) => ({
      difficulty,
      count,
    }));
  }, [filteredInterviews]);

  const handleVerifyQuestions = async () => {
    setCheckingQuestions(true);
    setQuestionStatus(null);
    try {
      const count = await countFirestoreQuestions();
      setQuestionCount(count);
      if (count >= 595) {
        setQuestionStatus(`✅ ${count} questions found in Firestore.`);
      } else {
        setQuestionStatus(
          `⚠️ Only ${count} questions found. Expected 595. Re-import using ImportQuestionsButton.`
        );
      }
    } catch (err: any) {
      setQuestionStatus(err?.message || "Failed to verify questions. Check your Firebase rules/connection.");
    } finally {
      setCheckingQuestions(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track your practice sessions and monitor your progress.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/practice"
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Practice
              </Link>
              <Link
                href="/"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Home
              </Link>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Total Interviews</p>
              <p className="text-4xl font-bold text-gray-900">
                {loading ? "—" : stats.totalInterviews}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {filteredInterviews.length} match current filters
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Average Score</p>
              <p className="text-4xl font-bold text-blue-600">
                {loading ? "—" : stats.averageScore.toFixed(1)}/10
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on all interviews
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-semibold mb-1">Latest Status</p>
              <p className="text-lg font-semibold text-green-600 mt-2">
                {loading ? "—" : filteredInterviews.length > 0 ? "Active" : "No Data"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {filteredInterviews.length > 0 
                  ? `${filteredInterviews.length} interview${filteredInterviews.length !== 1 ? 's' : ''} found`
                  : "Start your first practice"}
              </p>
            </div>
          </section>

          {/* Charts Section */}
          {!loading && filteredInterviews.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Trend Chart */}
              {scoreTrendData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Score Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={scoreTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#0066FF" 
                        strokeWidth={2}
                        name="Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Role Distribution Chart */}
              {roleDistributionData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Practice by Role</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roleDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0066FF" name="Interviews" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          )}

          {/* Difficulty Distribution */}
          {!loading && difficultyDistributionData.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Practice by Difficulty</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={difficultyDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00CC88" name="Interviews" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Question Import Verification */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Question Import Check</h3>
              <button
                onClick={handleVerifyQuestions}
                disabled={checkingQuestions}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {checkingQuestions ? "Checking..." : "Verify 595 Questions"}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Confirms Firestore has all 595 questions. Use this after importing.
            </p>
            {questionStatus && (
              <p className="mt-3 text-sm">
                {questionStatus}
              </p>
            )}
            {questionCount !== null && questionStatus === null && (
              <p className="mt-3 text-sm text-gray-700">
                Found {questionCount} questions.
              </p>
            )}
          </section>

          {/* Filters and Search */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by role, difficulty, or question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {uniqueDifficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interviews List */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Interviews ({filteredInterviews.length})
              </h2>
              <Link
                href="/practice"
                className="text-blue-600 font-semibold hover:underline text-sm"
              >
                Practice again
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <p className="text-gray-600 text-sm py-6">Loading interviews...</p>
              ) : filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => {
                  const score = interview.analysis?.score || 
                    (interview.localMetrics 
                      ? (interview.localMetrics.confidence + interview.localMetrics.clarity + interview.localMetrics.structure) / 3 * 10 
                      : 0);
                  const date = interview.createdAt instanceof Date 
                    ? interview.createdAt.toLocaleDateString() 
                    : new Date(interview.createdAt).toLocaleDateString();
                  
                  return (
                    <div
                      key={interview.id}
                      className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {interview.role} ({interview.difficulty})
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {interview.question}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {date}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">
                            {score.toFixed(1)}/10
                          </span>
                          <p className="text-xs text-gray-500">
                            {interview.analysis ? "AI Score" : "Local Score"}
                          </p>
                        </div>
                        <Link
                          href={`/results/${interview.id}`}
                          className="text-blue-600 font-semibold hover:underline text-sm px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm mb-2">
                    {allInterviews.length === 0 
                      ? "No interviews yet. Start your first practice!"
                      : "No interviews match your filters. Try adjusting your search."}
                  </p>
                  {allInterviews.length === 0 && (
                    <Link
                      href="/practice"
                      className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Start Practice
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}
