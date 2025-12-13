"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { auth } from "@/lib/firebase";
import {
  getInterviewsWithoutMultimodal,
  deleteInterviewsBulk,
  getStorageSizeEstimate,
  type InterviewToDelete,
  type CleanupResult,
} from "@/lib/cleanup";
import { formatFileSize } from "@/lib/storage";

export default function CleanupPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewToDelete[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentId: "" });
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<number>(0);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/login");
          return;
        }

        setLoading(true);
        const interviewsWithoutMultimodal = await getInterviewsWithoutMultimodal(user.uid);
        setInterviews(interviewsWithoutMultimodal);
        
        // Calculate storage estimate
        const estimate = await getStorageSizeEstimate(interviewsWithoutMultimodal);
        setStorageEstimate(estimate);
      } catch (err: any) {
        setError(err.message || "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, [router]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === interviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(interviews.map((i) => i.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one interview to delete");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedIds.size} interview(s)?\n\nThis will permanently delete:\n- All videos from Storage\n- All interview data from Firestore\n\nThis action cannot be undone!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated");
        return;
      }

      setDeleting(true);
      setError(null);
      setResult(null);

      const interviewIds = Array.from(selectedIds);
      const questionCounts = new Map<string, number>();
      interviews.forEach((interview) => {
        if (selectedIds.has(interview.id)) {
          questionCounts.set(interview.id, interview.questionCount);
        }
      });

      const deleteResult = await deleteInterviewsBulk(
        user.uid,
        interviewIds,
        questionCounts,
        (current, total, interviewId) => {
          setProgress({ current, total, currentId: interviewId });
        }
      );

      setResult(deleteResult);

      // Remove deleted interviews from the list
      setInterviews((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err.message || "Failed to delete interviews");
    } finally {
      setDeleting(false);
      setProgress({ current: 0, total: 0, currentId: "" });
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-6xl mx-auto p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading interviews...</p>
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
        <main className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cleanup Old Interviews</h1>
            <p className="text-gray-600 mb-4">
              Interviews without multimodal analysis can be deleted to free up storage space.
            </p>
            
            {interviews.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-semibold">
                  ✅ All interviews have multimodal analysis! No cleanup needed.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-900 font-semibold">
                        Found {interviews.length} interview(s) without multimodal analysis
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        Estimated storage: {formatFileSize(storageEstimate)}
                      </p>
                    </div>
                    <button
                      onClick={selectAll}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      {selectedIds.size === interviews.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                  </div>
                )}

                {result && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-900 font-semibold mb-2">✅ Cleanup Complete!</p>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>Deleted interviews: {result.deletedInterviews}</li>
                      <li>Deleted videos: {result.deletedVideos}</li>
                      <li>Estimated space freed: {formatFileSize(result.totalSpaceFreed)}</li>
                      {result.errors.length > 0 && (
                        <li className="text-red-600">
                          Errors: {result.errors.length}
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {result.errors.slice(0, 5).map((err, idx) => (
                              <li key={idx} className="text-xs">{err}</li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {deleting && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-900 font-semibold">
                      Deleting... {progress.current} / {progress.total}
                    </p>
                    {progress.currentId && (
                      <p className="text-yellow-700 text-sm mt-1">
                        Current: {progress.currentId.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            <input
                              type="checkbox"
                              checked={selectedIds.size === interviews.length && interviews.length > 0}
                              onChange={selectAll}
                              className="rounded"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Difficulty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Questions
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Videos
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {interviews.map((interview) => (
                          <tr
                            key={interview.id}
                            className={`hover:bg-gray-50 ${
                              selectedIds.has(interview.id) ? "bg-blue-50" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(interview.id)}
                                onChange={() => toggleSelect(interview.id)}
                                disabled={deleting}
                                className="rounded"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.createdAt.toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.role}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.difficulty}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.questionCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.videoUrls.length}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                No Multimodal
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedIds.size > 0 && (
                  <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4">
                    <div>
                      <p className="text-red-900 font-semibold">
                        {selectedIds.size} interview(s) selected for deletion
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        This will permanently delete all videos and interview data. This action cannot be undone!
                      </p>
                    </div>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? "Deleting..." : `Delete ${selectedIds.size} Interview(s)`}
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

