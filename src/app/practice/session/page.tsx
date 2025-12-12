"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchQuestions, filterQuestions, pickRandomQuestions, resetQuestionTracking } from "@/lib/questions";
import type { Question } from "@/types";
import InterviewRecorder from "@/components/InterviewRecorder";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { analyzeAnswerLocally, toTenPointScore, type AnswerMetrics } from "@/lib/localScoring";
import { saveInterviewSession } from "@/lib/interviews";
import { auth, db } from "@/lib/firebase";
import { uploadInterviewVideos, MAX_TOTAL_SIZE_PER_SESSION } from "@/lib/storage";
import { doc, getDoc } from "firebase/firestore";

export default function PracticeSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") || "Backend Engineer";
  const difficulty = searchParams.get("difficulty") || "Mid";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    { transcript: string; duration: number; blob?: Blob; blobUrl?: string; localMetrics?: AnswerMetrics; localScore?: number; question?: string; framework?: string }[]
  >([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState<number | null>(null);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [videoQuality, setVideoQuality] = useState<"low" | "medium" | "high">("medium");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Reset tracking for new session
        resetQuestionTracking();
        const data = await fetchQuestions();
        const filtered = filterQuestions(data, role, difficulty);
        const picked = pickRandomQuestions(filtered, 5);
        setQuestions(picked);

        // Load user's video quality preference
        const user = auth.currentUser;
        if (user) {
          const prefsDoc = await getDoc(doc(db, "users", user.uid));
          if (prefsDoc.exists()) {
            const prefs = prefsDoc.data().preferences;
            if (prefs?.videoQuality) {
              setVideoQuality(prefs.videoQuality);
            }
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role, difficulty]);

  const currentQuestion = useMemo(
    () => (questions.length > 0 ? questions[currentIndex] : null),
    [questions, currentIndex]
  );

  const handleComplete = (data: { blob: Blob | null; transcript: string; duration: number }) => {
    const blobUrl = data.blob ? URL.createObjectURL(data.blob) : undefined;
    const question = currentQuestion;
    const localMetrics = question
      ? analyzeAnswerLocally(data.transcript, question.answerFramework || "", question.timeLimit || 120)
      : undefined;
    const localScore = localMetrics ? toTenPointScore(localMetrics) : undefined;
    setResults((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        transcript: data.transcript,
        duration: data.duration,
        blob: data.blob || undefined,
        blobUrl,
        localMetrics,
        localScore,
        question: question?.question,
        framework: question?.answerFramework,
      };
      return updated;
    });
  };

  const handleEditTranscript = (index: number) => {
    setEditingTranscript(index);
    setEditedTranscript(results[index]?.transcript || "");
  };

  const handleSaveTranscript = (index: number) => {
    const question = questions[index];
    const updatedTranscript = editedTranscript.trim();
    const localMetrics = question
      ? analyzeAnswerLocally(updatedTranscript, question.answerFramework || "", question.timeLimit || 120)
      : undefined;
    const localScore = localMetrics ? toTenPointScore(localMetrics) : undefined;
    
    setResults((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        transcript: updatedTranscript,
        localMetrics,
        localScore,
      };
      return updated;
    });
    setEditingTranscript(null);
    setEditedTranscript("");
  };

  const handleCancelEdit = () => {
    setEditingTranscript(null);
    setEditedTranscript("");
  };

  const goNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Finish session - analyze with Gemini
      setAnalyzing(true);
      setStatusMessage("Uploading videos and running AI analysis...");
      try {
        // Check if we have any transcripts
        const validResults = results.filter(r => r.transcript && r.transcript.trim().length > 0);
        if (validResults.length === 0) {
          throw new Error("No transcripts available for analysis. Please record at least one answer.");
        }

        // Generate interview ID first (for video uploads)
        const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Upload videos to Firebase Storage first so we can provide URLs to Gemini
        const videoBlobs = results.map((r) => r.blob || null);
        let videoUrls: (string | null)[] = [];
        
        // Check total session size before uploading
        const totalSize = videoBlobs.reduce((sum, blob) => sum + (blob?.size || 0), 0);
        if (totalSize > MAX_TOTAL_SIZE_PER_SESSION) {
          const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
          const maxMB = (MAX_TOTAL_SIZE_PER_SESSION / (1024 * 1024)).toFixed(0);
          console.warn(
            `Session total size (${totalMB} MB) exceeds limit (${maxMB} MB). Some videos may not upload.`
          );
          alert(
            `Warning: Total session size (${totalMB} MB) exceeds recommended limit (${maxMB} MB). Some videos may not upload.`
          );
        }

        try {
          setStatusMessage("Uploading videos...");
          videoUrls = await uploadInterviewVideos(auth.currentUser?.uid || "", interviewId, videoBlobs);
          const uploadedCount = videoUrls.filter(Boolean).length;
          const failedCount = videoBlobs.filter(Boolean).length - uploadedCount;
          console.log(`Videos uploaded: ${uploadedCount}/${videoBlobs.filter(Boolean).length}`);
          
          if (failedCount > 0) {
            console.warn(`${failedCount} video(s) failed to upload (likely due to size limits)`);
          }
        } catch (uploadError) {
          console.error("Video upload failed (continuing without videos):", uploadError);
          setStatusMessage("Video upload failed; saving without videos.");
          // Continue without videos - not critical
        }

        // Aggregate all transcripts for overall analysis
        const allTranscripts = validResults
          .map((r, idx) => `Q${idx + 1}: ${r.transcript || "No answer"}`)
          .join("\n\n");
        const firstQuestion = validResults[0]?.question || "Interview practice";
        const firstFramework = validResults[0]?.framework || "Problem → Solution → Impact";

        // Call Gemini API
        setStatusMessage("Running AI analysis (transcript + video)...");
        if (process.env.NODE_ENV === "development") {
          console.log("[practice] analyze payload", {
            videoUrls: videoUrls.filter(Boolean),
            transcriptLength: allTranscripts.length,
            totalDuration: validResults.reduce((sum, r) => sum + r.duration, 0),
          });
        }
        const response = await fetch(`/api/interviews/${Date.now()}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: allTranscripts,
            question: firstQuestion,
            framework: firstFramework,
            videoUrls: videoUrls.filter(Boolean),
            durationSec: validResults.reduce((sum, r) => sum + r.duration, 0),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error:", errorData);
          throw new Error(errorData.error || `AI analysis failed (status ${response.status}). Please try again.`);
        }

        const geminiData = await response.json();
        
        // Validate response structure
        if (!geminiData.score && geminiData.score !== 0) {
          console.warn("Invalid Gemini response:", geminiData);
          throw new Error("Invalid response from analysis API");
        }

        // Save interview to Firestore
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const interviewSession = {
          role,
          difficulty,
          questions: validResults.map((r, idx) => ({
            question: questions[idx]?.question || r.question || "",
            transcript: r.transcript,
            duration: r.duration,
            localMetrics: r.localMetrics,
            localScore: r.localScore,
            videoUrl: videoUrls[idx] || null,
          })),
        };

        // Save interview with the pre-generated ID
        const savedInterviewId = await saveInterviewSession(
          user.uid,
          interviewSession,
          {
            score: geminiData.score,
            feedback: geminiData.feedback,
            improvements: geminiData.improvements || [],
          },
          geminiData.multimodal || undefined,
          interviewId
        );

        // Redirect to results page with interview ID
        router.push(`/results/${savedInterviewId}`);
        setStatusMessage(null);
      } catch (err) {
        console.error("Analysis error:", err);
        setStatusMessage(err instanceof Error ? err.message : "Analysis failed. Falling back to local save.");
        
        // Try to save with local scoring only
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Generate interview ID for video uploads
          const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Upload videos (non-blocking)
          const videoBlobs = results.map((r) => r.blob || null);
          let videoUrls: (string | null)[] = [];
          
          // Check total session size
          const totalSize = videoBlobs.reduce((sum, blob) => sum + (blob?.size || 0), 0);
          if (totalSize > MAX_TOTAL_SIZE_PER_SESSION) {
            const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
            const maxMB = (MAX_TOTAL_SIZE_PER_SESSION / (1024 * 1024)).toFixed(0);
            console.warn(`Session size (${totalMB} MB) exceeds limit (${maxMB} MB)`);
          }
          
          try {
            videoUrls = await uploadInterviewVideos(user.uid, interviewId, videoBlobs);
            const uploadedCount = videoUrls.filter(Boolean).length;
            console.log(`Videos uploaded: ${uploadedCount}/${videoBlobs.filter(Boolean).length}`);
          } catch (uploadError) {
            console.error("Video upload failed (continuing without videos):", uploadError);
          }

          const interviewSession = {
            role,
            difficulty,
            questions: results.map((r, idx) => ({
              question: questions[idx]?.question || r.question || "",
              transcript: r.transcript,
              duration: r.duration,
              localMetrics: r.localMetrics,
              localScore: r.localScore,
              videoUrl: videoUrls[idx] || null,
            })),
          };
          
          const savedInterviewId = await saveInterviewSession(
            user.uid,
            interviewSession,
            undefined,
            interviewId
          );
          router.push(`/results/${savedInterviewId}?error=analysis_failed`);
          setStatusMessage(null);
        } catch (saveErr) {
          console.error("Failed to save interview:", saveErr);
          setStatusMessage("Unable to save interview. Your answers may not be stored.");
          // Last resort: use URL params
          const score = results.reduce((sum, r) => sum + (r?.localScore || 0), 0) / (results.length || 1);
          router.push(`/results/${Date.now()}?score=${score.toFixed(1)}&error=save_failed`);
        }
      } finally {
        setAnalyzing(false);
      }
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="border-b border-gray-200 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">
                Role: {role} · Difficulty: {difficulty}
              </p>
              <h1 className="text-lg font-semibold">
                Question {currentIndex + 1} of {Math.max(questions.length, 5)}
              </h1>
            </div>
            <Link href="/practice" className="text-gray-500 hover:text-gray-700 text-sm">
              Change selection
            </Link>
          </div>
        </div>

        <main className="max-w-6xl mx-auto p-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {loading && <p className="text-sm text-gray-600">Loading questions...</p>}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error} (ensure `public/questions.json` exists). Try refreshing the page.
              </div>
            )}
            {!loading && !error && currentQuestion && (
              <InterviewRecorder
                question={currentQuestion.question}
                onComplete={handleComplete}
                maxDurationSec={currentQuestion.timeLimit || 120}
                videoQuality={videoQuality}
              />
            )}
            {statusMessage && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {statusMessage}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-2">Question details</h3>
              {currentQuestion ? (
                <div className="space-y-2 text-sm text-gray-800">
                  <p className="font-semibold text-gray-900">{currentQuestion.question}</p>
                  <p>Category: {currentQuestion.category}</p>
                  <p>Framework: {currentQuestion.answerFramework}</p>
                  {currentQuestion.redFlags && (
                    <p className="text-xs text-gray-600">
                      Avoid: {currentQuestion.redFlags.slice(0, 3).join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Time limit: {currentQuestion.timeLimit || 120}s
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No question loaded.</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-2">Progress</h3>
              <p className="text-sm text-gray-700 mb-2">
                Answer each question, then click Next. Final results page is pending.
              </p>
              <button
                onClick={goNext}
                disabled={questions.length === 0 || analyzing}
                className="w-full bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {analyzing
                  ? "Analyzing with AI..."
                  : currentIndex + 1 < questions.length
                  ? "Next question"
                  : "Finish session"}
              </button>
              {results[currentIndex]?.transcript && (
                <p className="text-xs text-gray-600 mt-2">
                  Transcript captured ({results[currentIndex].duration}s)
                </p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-2">Recorded answers</h3>
              <div className="space-y-3">
                {results.map((r, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-600 font-semibold">Q{idx + 1}</p>
                      {editingTranscript !== idx && (
                        <button
                          onClick={() => handleEditTranscript(idx)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {editingTranscript === idx ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedTranscript}
                          onChange={(e) => setEditedTranscript(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          rows={4}
                          placeholder="Edit your transcript..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveTranscript(idx)}
                            className="flex-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-blue-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-800 line-clamp-3">
                        {r.transcript || "No transcript"}
                      </p>
                    )}
                    {r.blobUrl && (
                      <video src={r.blobUrl} controls className="mt-2 w-full rounded" />
                    )}
                    {r.localScore !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Local score: {r.localScore.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                ))}
                {results.length === 0 && (
                  <p className="text-sm text-gray-600">Recordings will appear here after you stop.</p>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </RequireAuth>
  );
}

