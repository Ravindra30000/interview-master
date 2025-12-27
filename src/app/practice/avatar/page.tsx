"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import InterviewRecorder from "@/components/InterviewRecorder";
import AvatarVideoPlayer from "@/components/AvatarVideoPlayer";
import { useAvatarSession } from "@/hooks/useAvatarSession";
import { getAvatarVideo } from "@/lib/avatarVideos";
import {
  MessageCircle,
  Video as VideoIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic,
} from "lucide-react";
import {
  fetchQuestions,
  filterQuestions,
  pickRandomQuestions,
  resetQuestionTracking,
} from "@/lib/questions";
import { saveInterviewSession } from "@/lib/interviews";
import { auth } from "@/lib/firebase";
import {
  uploadInterviewVideos,
  MAX_TOTAL_SIZE_PER_SESSION,
} from "@/lib/storage";
import type { Question } from "@/types";

export const dynamic = "force-dynamic";

export default function AvatarPracticePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") || "Backend Engineer";
  const difficulty = searchParams.get("difficulty") || "Mid";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestionText, setActiveQuestionText] = useState<string | null>(
    null
  );
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      questionIndex: number;
      question: string;
      transcript: string;
      duration: number;
      blob?: Blob | null;
    }>
  >([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    sessionId,
    lastResponse,
    nextQuestion,
    readyToAdvance,
    isLoading: avatarLoading,
    error: avatarError,
    sendUserAnswer,
    avatarMode,
    onAudioEnded,
    state,
  } = useAvatarSession();

  useEffect(() => {
    const load = async () => {
      try {
        resetQuestionTracking();
        const data = await fetchQuestions();
        const filtered = filterQuestions(data, role, difficulty);
        const picked = pickRandomQuestions(filtered, 5);
        setQuestions(picked);
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

  const idleVideoUrl = useMemo(() => {
    return (
      getAvatarVideo("neutral", "idle")?.url ||
      getAvatarVideo("thinking", "idle")?.url ||
      getAvatarVideo("encouraging", "idle")?.url ||
      null
    );
  }, []);

  useEffect(() => {
    if (currentQuestion && !isFollowUp) {
      setActiveQuestionText(currentQuestion.question);
    }
  }, [currentQuestion, isFollowUp]);

  const handleComplete = async (data: {
    blob: Blob | null;
    transcript: string;
    duration: number;
  }) => {
    if (currentQuestion && data.transcript.trim()) {
      setUserAnswers((prev) => [
        ...prev,
        {
          questionIndex: currentIndex,
          question: activeQuestionText || currentQuestion.question,
          transcript: data.transcript,
          duration: data.duration,
          blob: data.blob,
        },
      ]);
    }

    const response = await sendUserAnswer(data.transcript);
    if (!response) {
      return;
    }

    const next = response.nextQuestion?.trim();
    const readyToAdvanceFlag = response.avatarResponse.readyToAdvance ?? false;

    if (readyToAdvanceFlag) {
      setIsFollowUp(false);
    } else if (next) {
      setIsFollowUp(true);
      setFollowUpCount((c) => c + 1);
      setActiveQuestionText(next);
    } else {
      setIsFollowUp(false);
    }
  };

  const handleNextQuestion = () => {
    setIsFollowUp(false);
    setFollowUpCount(0);

    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setActiveQuestionText(nextQuestion?.question ?? null);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const conversationHistory = state?.conversationHistory ?? [];
      const userMessages = conversationHistory.filter(
        (msg) => msg.role === "user"
      );

      const answersToUse =
        userAnswers.length > 0
          ? userAnswers
          : userMessages.map((msg, idx) => ({
              questionIndex: Math.min(idx, questions.length - 1),
              question:
                questions[Math.min(idx, questions.length - 1)]?.question ||
                "Interview question",
              transcript: msg.text,
              duration: 0,
              blob: null,
            }));

      const allTranscripts = answersToUse
        .map(
          (answer, idx) => `Q${idx + 1}: ${answer.transcript || "No answer"}`
        )
        .join("\n\n");

      const firstQuestion =
        answersToUse[0]?.question ||
        questions[0]?.question ||
        "Interview practice";
      const firstFramework =
        questions[0]?.answerFramework || "Problem → Solution → Impact";
      const totalDuration = answersToUse.reduce(
        (sum, a) => sum + a.duration,
        0
      );

      const interviewId = Date.now().toString();

      const videoBlobs = answersToUse
        .map((answer) => answer.blob)
        .filter(Boolean);

      const totalSize = videoBlobs.reduce(
        (sum, blob) => sum + (blob?.size || 0),
        0
      );
      if (totalSize > MAX_TOTAL_SIZE_PER_SESSION) {
        const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
        const maxMB = (MAX_TOTAL_SIZE_PER_SESSION / (1024 * 1024)).toFixed(0);
        console.warn(
          `Session total size (${totalMB} MB) exceeds limit (${maxMB} MB). Some videos may not upload.`
        );
      }

      let videoUrls: (string | null)[] = [];
      if (videoBlobs.length > 0) {
        try {
          setStatusMessage("Uploading videos...");
          videoUrls = await uploadInterviewVideos(
            user.uid,
            interviewId,
            videoBlobs
          );
          const uploadedCount = videoUrls.filter(Boolean).length;
          const failedCount = videoBlobs.length - uploadedCount;
          console.log(
            `[avatar] Videos uploaded: ${uploadedCount}/${videoBlobs.length}`
          );

          if (failedCount > 0) {
            console.warn(
              `[avatar] ${failedCount} video(s) failed to upload (likely due to size limits)`
            );
          }

          if (uploadedCount > 0) {
            setStatusMessage("Verifying video uploads...");
            const verifiedUrls: (string | null)[] = [];
            let verifiedCount = 0;

            for (let i = 0; i < videoUrls.length; i++) {
              const url = videoUrls[i];
              if (!url) {
                verifiedUrls.push(null);
                continue;
              }

              try {
                const headResponse = await fetch(url, { method: "HEAD" });
                if (headResponse.ok) {
                  verifiedUrls.push(url);
                  verifiedCount++;
                  console.log(
                    `[avatar] Video ${i + 1} verified: ${url.substring(
                      0,
                      50
                    )}...`
                  );
                } else {
                  console.warn(
                    `[avatar] Video ${i + 1} verification failed: status ${
                      headResponse.status
                    }`
                  );
                  verifiedUrls.push(null);
                }
              } catch (verifyError: any) {
                console.error(
                  `[avatar] Video ${i + 1} verification error:`,
                  verifyError?.message || verifyError
                );
                verifiedUrls.push(null);
              }
            }

            videoUrls = verifiedUrls;
            console.log(
              `[avatar] Video verification complete: ${verifiedCount}/${uploadedCount} videos accessible`
            );

            if (verifiedCount === 0 && uploadedCount > 0) {
              console.warn(
                "[avatar] All uploaded videos failed verification - continuing with transcript analysis only"
              );
              setStatusMessage(
                "Video verification failed; continuing with transcript analysis."
              );
            } else if (verifiedCount < uploadedCount) {
              console.warn(
                `[avatar] ${
                  uploadedCount - verifiedCount
                } video(s) failed verification but continuing with ${verifiedCount} verified video(s)`
              );
            }
          }
        } catch (uploadError: any) {
          const errorMessage = uploadError?.message || String(uploadError);
          console.error(
            "[avatar] Video upload failed (continuing without videos):",
            errorMessage
          );
          setStatusMessage(
            "Video upload failed; continuing with transcript analysis."
          );
        }
      }

      const verifiedVideoUrls = videoUrls.filter(Boolean);
      console.log(
        `[avatar] Calling analysis API with ${verifiedVideoUrls.length} verified video URL(s)`
      );
      setStatusMessage(
        `Running AI analysis (transcript${
          verifiedVideoUrls.length > 0 ? " + video" : ""
        })...`
      );
      const response = await fetch(`/api/interviews/${interviewId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: allTranscripts,
          question: firstQuestion,
          framework: firstFramework,
          videoUrls: verifiedVideoUrls,
          durationSec: totalDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `AI analysis failed (status ${response.status}). Please try again.`
        );
      }

      const geminiData = await response.json();

      console.log("[avatar] Analysis API response received:", {
        hasScore: geminiData.score !== undefined,
        hasMultimodal: !!geminiData.multimodal,
        multimodalKeys: geminiData.multimodal
          ? Object.keys(geminiData.multimodal)
          : [],
        improvementsCount: geminiData.improvements?.length || 0,
      });

      if (!geminiData.score && geminiData.score !== 0) {
        console.warn("[avatar] Invalid Gemini response:", geminiData);
        throw new Error("Invalid response from analysis API");
      }

      if (geminiData.multimodal) {
        console.log("[avatar] Multimodal analysis details:", {
          overallScore: geminiData.multimodal.overall_score,
          hasEyeContact: !!geminiData.multimodal.eye_contact,
          hasBodyLanguagePatterns:
            !!geminiData.multimodal.body_language_patterns,
          hasProfessionalPresentation:
            !!geminiData.multimodal.professional_presentation,
          topImprovementsCount:
            geminiData.multimodal.top_improvements?.length || 0,
          allKeys: Object.keys(geminiData.multimodal),
        });
      }

      let cleanedMultimodal = null;
      if (geminiData.multimodal) {
        const cleanObject = (obj: any): any => {
          if (obj === null || obj === undefined) {
            return obj;
          }
          if (Array.isArray(obj)) {
            return obj.map((item) => cleanObject(item));
          }
          if (typeof obj === "object") {
            const cleaned: any = {};
            for (const [key, value] of Object.entries(obj)) {
              if (value !== undefined) {
                cleaned[key] = cleanObject(value);
              }
            }
            return cleaned;
          }
          return obj;
        };
        cleanedMultimodal = cleanObject(geminiData.multimodal);
        console.log("[avatar] Multimodal data cleaned for saving:", {
          hasMultimodal: !!cleanedMultimodal,
          keys: Object.keys(cleanedMultimodal),
          hasEyeContact: !!cleanedMultimodal.eye_contact,
          hasBodyLanguagePatterns: !!cleanedMultimodal.body_language_patterns,
          hasProfessionalPresentation:
            !!cleanedMultimodal.professional_presentation,
        });
      }

      const interviewSession = {
        role,
        difficulty,
        questions: answersToUse.map((answer, idx) => ({
          question: answer.question,
          transcript: answer.transcript,
          duration: answer.duration,
          videoUrl: videoUrls[idx] || null,
        })),
      };

      console.log(
        "[avatar] Saving interview to Firestore with cleaned multimodal data"
      );
      const savedInterviewId = await saveInterviewSession(
        user.uid,
        interviewSession,
        {
          score: geminiData.score,
          feedback: geminiData.feedback,
          improvements: geminiData.improvements || [],
        },
        cleanedMultimodal,
        interviewId
      );

      // Verify data was saved correctly by fetching it back
      try {
        const { getInterview } = await import("@/lib/interviews");
        const verifyInterview = await getInterview(user.uid, savedInterviewId);

        if (verifyInterview) {
          console.log("[avatar] Verification after save:", {
            interviewId: savedInterviewId,
            hasMultimodal: !!verifyInterview.multimodalAnalysis,
            multimodalKeys: verifyInterview.multimodalAnalysis
              ? Object.keys(verifyInterview.multimodalAnalysis)
              : [],
            overallScore: verifyInterview.multimodalAnalysis?.overall_score,
            hasEyeContact: !!verifyInterview.multimodalAnalysis?.eye_contact,
            hasBodyLanguagePatterns:
              !!verifyInterview.multimodalAnalysis?.body_language_patterns,
            hasProfessionalPresentation:
              !!verifyInterview.multimodalAnalysis?.professional_presentation,
          });

          if (!verifyInterview.multimodalAnalysis) {
            console.warn(
              "[avatar] WARNING: Multimodal data not found in saved interview. Data may not have persisted correctly."
            );
          }
        } else {
          console.warn(
            "[avatar] WARNING: Could not retrieve saved interview for verification"
          );
        }
      } catch (verifyError: any) {
        console.warn(
          "[avatar] Verification error (non-critical):",
          verifyError?.message || verifyError
        );
      }

      console.log(
        "[avatar] Report generation complete, redirecting to results:",
        savedInterviewId
      );
      setStatusMessage(null);
      router.push(`/results/${savedInterviewId}`);
    } catch (err: any) {
      console.error("[avatar] Report generation error:", {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      setError(
        err?.message ||
          "Failed to generate report. Please try again. If videos were uploaded, analysis may have failed - check console for details."
      );
      setStatusMessage(null);
      setIsGeneratingReport(false);
    }
  };

  const statusText =
    avatarLoading && !lastResponse
      ? "Avatar is preparing a response..."
      : avatarLoading
      ? "Updating avatar response..."
      : readyToAdvance
      ? "Ready to move to the next question"
      : "";

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
                Avatar Interview · Question {currentIndex + 1} of{" "}
                {Math.max(questions.length, 1)}
              </h1>
              {sessionId && (
                <p className="text-xs text-gray-500">
                  Session: <span className="font-mono">{sessionId}</span>
                </p>
              )}
            </div>
            <Link
              href="/practice"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Change selection
            </Link>
          </div>
        </div>

        <main className="max-w-6xl mx-auto p-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800">
                  Avatar coach
                </p>
                <AvatarVideoPlayer
                  videoUrl={
                    avatarMode === "speaking"
                      ? lastResponse?.videoUrl || idleVideoUrl
                      : idleVideoUrl
                  }
                  audioUrl={
                    avatarMode === "speaking"
                      ? lastResponse?.audioUrl || undefined
                      : undefined
                  }
                  autoPlay={true}
                  autoPlayAudio={avatarMode === "speaking"}
                  loop={true}
                  className="w-full"
                  onAudioEnded={() => {
                    if (onAudioEnded) {
                      onAudioEnded();
                    }
                  }}
                />
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 min-h-[64px]">
                  {lastResponse ? (
                    <>
                      <p className="font-semibold mb-1">Avatar:</p>
                      <p>{lastResponse.text}</p>
                      {nextQuestion && !readyToAdvance && (
                        <p className="mt-2 text-xs text-gray-600">
                          Follow-up question: {nextQuestion}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600">
                      The avatar&apos;s feedback will appear here after you
                      answer.
                    </p>
                  )}
                </div>
                {readyToAdvance && (
                  <button
                    onClick={
                      currentIndex + 1 >= questions.length
                        ? handleGenerateReport
                        : handleNextQuestion
                    }
                    disabled={isGeneratingReport}
                    className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {currentIndex + 1 >= questions.length
                      ? isGeneratingReport
                        ? "Generating Report..."
                        : "Interview Complete"
                      : "Next Question"}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {loading && (
                  <p className="text-sm text-gray-600">Loading questions...</p>
                )}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error} (ensure `public/questions.json` exists). Try
                    refreshing the page.
                  </div>
                )}
                {!loading && !error && currentQuestion && (
                  <InterviewRecorder
                    question={activeQuestionText || currentQuestion.question}
                    onComplete={handleComplete}
                    maxDurationSec={currentQuestion.timeLimit || 120}
                    videoQuality="medium"
                  />
                )}
              </div>
            </div>

            {statusText && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {statusText}
              </div>
            )}
            {statusMessage && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {statusMessage}
              </div>
            )}
            {avatarError && (
              <div className="card-modern p-4 border-red-200 bg-red-50 animate-slide-up">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Avatar Error
                    </p>
                    <p className="text-xs text-red-700">{avatarError}</p>
                  </div>
                </div>
              </div>
            )}
            {avatarError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {avatarError}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {/* Enhanced Question Details Card */}
            <div className="card-modern p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Question Details
                </h3>
              </div>
              {currentQuestion ? (
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="font-semibold text-gray-900 leading-relaxed">
                      {activeQuestionText || currentQuestion.question}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold text-gray-800">
                        {currentQuestion.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Framework:</span>
                      <span className="font-semibold text-gray-800">
                        {currentQuestion.answerFramework}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time Limit:</span>
                      <span className="font-semibold text-gray-800">
                        {currentQuestion.timeLimit || 120}s
                      </span>
                    </div>
                    {currentQuestion.redFlags && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          Avoid:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {currentQuestion.redFlags
                            .slice(0, 3)
                            .map((flag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                              >
                                {flag}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    {isFollowUp && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                          Follow-up #{followUpCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No question loaded.
                </p>
              )}
            </div>

            {/* Enhanced How It Works Card */}
            <div className="card-modern p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  How This Works
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold mt-0.5">
                    1
                  </span>
                  <span>Read the question and record your answer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold mt-0.5">
                    2
                  </span>
                  <span>
                    The avatar analyzes your response with Gemini 2.5 Flash and
                    speaks feedback using Google TTS.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold mt-0.5">
                    3
                  </span>
                  <span>
                    Move to the next question to continue the avatar interview.
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </RequireAuth>
  );
}
