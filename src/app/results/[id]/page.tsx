"use client";

import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import ScoreDisplay from "@/components/ScoreDisplay";
import { getInterview } from "@/lib/interviews";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  CheckCircle2,
  Download,
  Printer,
  Video,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react";
import type { Interview } from "@/types";

interface ResultData {
  score?: number;
  feedback?: string;
  improvements?: string[];
  videoUrl?: string;
  transcript?: string;
  multimodal?: Interview["multimodalAnalysis"];
}

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const interviewId = params.id as string;
  const error = searchParams.get("error");

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Set<number>>(
    new Set()
  );
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  // Wait for auth state to be ready before proceeding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Extract search params values before useEffect to avoid dependency issues
  const demoScore = searchParams.get("score");
  const geminiScore = searchParams.get("geminiScore");
  const feedback = searchParams.get("feedback");
  const improvementsStr = searchParams.get("improvements");

  useEffect(() => {
    // Wait for auth to be ready before proceeding
    if (!authReady) {
      return;
    }

    const loadInterview = async () => {
      try {
        if (!user) {
          setErrorMessage("Please log in to view results");
          setLoading(false);
          return;
        }

        // Always try Firestore first (this includes valid numeric IDs like timestamps)
        const interviewData = await getInterview(user.uid, interviewId);

        if (interviewData) {
          // Found in Firestore - use it (includes multimodal data)
          setInterview(interviewData);
          setLoading(false);
          return;
        }

        // Not found in Firestore - check if this is a legacy URL with query parameters
        // Use extracted values from searchParams (already extracted above)
        // Only use legacy fallback if query parameters indicate it's a legacy URL
        const hasLegacyParams =
          demoScore || geminiScore || feedback || improvementsStr;

        if (hasLegacyParams) {
          // Legacy URL format - create fallback interview object
          const improvements = improvementsStr
            ? improvementsStr.split("|||").filter(Boolean)
            : undefined;
          const finalScore = geminiScore
            ? Number(geminiScore)
            : demoScore
            ? Number(demoScore)
            : 7.8;

          setInterview({
            id: interviewId,
            userId: user.uid,
            role: "",
            difficulty: "",
            question: "",
            transcript: "",
            createdAt: new Date(),
            analysis: {
              score: finalScore,
              feedback:
                feedback ||
                (error
                  ? "Analysis unavailable. Using local scoring. " +
                    "Strong structure and clarity. Reduce filler words and add specific metrics to strengthen your answers."
                  : "Strong structure and clarity. Reduce filler words and add specific metrics to strengthen your answers."),
              improvements: improvements || [
                "Add 1-2 measurable outcomes for your projects",
                "Reduce filler words; pause instead of using 'um/uh'",
                "Tighten intros to focus on problem → action → impact",
              ],
              analyzedAt: new Date(),
            },
          });
          setLoading(false);
          return;
        }

        // Not found in Firestore and no legacy params - show error
        setErrorMessage("Interview not found");
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading interview:", err);
        setErrorMessage(err.message || "Failed to load interview");
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    } else {
      setErrorMessage("Invalid interview ID");
      setLoading(false);
    }
  }, [
    authReady,
    user,
    interviewId,
    error,
    demoScore,
    geminiScore,
    feedback,
    improvementsStr,
  ]);

  // Show loading state while auth is initializing or data is loading
  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">
              {!authReady ? "Initializing..." : "Loading results..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Only show error if auth is ready and we have a confirmed error state
  // Don't show error if we're still loading or auth is not ready
  if (authReady && (errorMessage || (!loading && !interview))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="card-modern p-6 text-center">
            <p className="text-red-600 font-semibold mb-2 text-lg">Error</p>
            <p className="text-gray-700 mb-4">
              {errorMessage || "No results found."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setLoading(true);
                  setErrorMessage(null);
                  // Retry loading
                  if (user && interviewId) {
                    getInterview(user.uid, interviewId)
                      .then((data) => {
                        if (data) {
                          setInterview(data);
                        } else {
                          setErrorMessage("Interview not found");
                        }
                        setLoading(false);
                      })
                      .catch((err) => {
                        setErrorMessage(
                          err.message || "Failed to load interview"
                        );
                        setLoading(false);
                      });
                  }
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Early return if interview is not loaded yet (should be handled by error state above, but safety check)
  if (!interview) {
    return null;
  }

  // Helper functions for toggling transcripts and questions
  const toggleTranscript = (index: number) => {
    setExpandedTranscripts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAllTranscripts = () => {
    if (interview.questions) {
      const allIndices = interview.questions.map((_, idx) => idx);
      setExpandedTranscripts(new Set(allIndices));
    }
  };

  const collapseAllTranscripts = () => {
    setExpandedTranscripts(new Set());
  };

  // Truncate text utility
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const data: ResultData = {
    // Use AI score first, then multimodal overall score, then local metrics as last resort
    score:
      interview.analysis?.score ||
      interview.multimodalAnalysis?.overall_score ||
      (interview.localMetrics
        ? ((interview.localMetrics.confidence +
            interview.localMetrics.clarity +
            interview.localMetrics.structure) /
            3) *
          10
        : 0),
    feedback: interview.analysis?.feedback || "No feedback available.",
    improvements: interview.analysis?.improvements || [],
    videoUrl: interview.videoUrl,
    transcript: interview.transcript,
    multimodal: interview.multimodalAnalysis,
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[results] interview", {
      id: interview.id,
      hasMultimodal: !!interview.multimodalAnalysis,
      multimodalKeys: interview.multimodalAnalysis
        ? Object.keys(interview.multimodalAnalysis)
        : [],
    });
  }

  const exportToCSV = () => {
    const rows: string[][] = [
      ["Interview Results", ""],
      ["Date", interview.createdAt.toLocaleDateString()],
      ["Role", interview.role],
      ["Difficulty", interview.difficulty],
      ["Overall Score", data.score?.toFixed(1) || "N/A"],
      ["", ""],
      ["Feedback", data.feedback || ""],
      ["", ""],
      ["Areas to Improve", ""],
      ...(data.improvements || []).map((imp, idx) => [`${idx + 1}.`, imp]),
      ["", ""],
    ];

    // Add multimodal analysis if available
    if (data.multimodal) {
      rows.push(["Multimodal Analysis", ""]);
      rows.push([
        "Overall Multimodal Score",
        data.multimodal.overall_score?.toFixed(1) || "N/A",
      ]);
      rows.push(["", ""]);

      // Add each dimension
      const dimensions = [
        { key: "emotions", label: "Emotions & Expressions" },
        { key: "confidence", label: "Confidence" },
        { key: "body_language", label: "Body Language" },
        { key: "delivery", label: "Delivery" },
        { key: "voice", label: "Voice Quality" },
        { key: "timing", label: "Timing & Pacing" },
        { key: "lip_sync", label: "Lip Sync & Synchronization" },
      ];

      dimensions.forEach((dim) => {
        const section = (data.multimodal as any)[dim.key];
        if (section) {
          rows.push([
            dim.label,
            `Score: ${section.score?.toFixed(1) || "N/A"}/10`,
          ]);
          if (section.notes) {
            rows.push(["", `Notes: ${section.notes}`]);
          }
          if (
            Array.isArray(section.suggestions) &&
            section.suggestions.length > 0
          ) {
            section.suggestions.forEach((s: string) => {
              rows.push(["", `  - ${s}`]);
            });
          }
          rows.push(["", ""]);
        }
      });

      if (
        Array.isArray(data.multimodal.top_improvements) &&
        data.multimodal.top_improvements.length > 0
      ) {
        rows.push(["Top Multimodal Improvements", ""]);
        data.multimodal.top_improvements.forEach((tip, idx) => {
          rows.push([`${idx + 1}.`, tip]);
        });
        rows.push(["", ""]);
      }
    }

    rows.push(["Questions & Answers", ""]);

    if (interview.questions && interview.questions.length > 0) {
      interview.questions.forEach((q, idx) => {
        rows.push([`Question ${idx + 1}`, q.question || ""]);
        rows.push(["Answer", q.transcript || ""]);
        rows.push(["Duration", `${q.duration}s`]);
        if (q.localScore !== undefined) {
          rows.push(["Local Score", q.localScore.toFixed(1)]);
        }
        rows.push(["", ""]);
      });
    } else {
      rows.push(["Question", interview.question || ""]);
      rows.push(["Answer", interview.transcript || ""]);
    }

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `interview-results-${interviewId}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Create a printable version in a new window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to export as PDF");
      return;
    }

    const questionsHtml =
      interview.questions && interview.questions.length > 0
        ? interview.questions
            .map(
              (q, idx) => `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #0066FF; margin-bottom: 8px;">Question ${
              idx + 1
            }</h3>
            <p style="margin-bottom: 8px;"><strong>Question:</strong> ${
              q.question || ""
            }</p>
            <p style="margin-bottom: 8px;"><strong>Answer:</strong> ${(
              q.transcript || ""
            ).replace(/\n/g, "<br>")}</p>
            <p style="color: #666; font-size: 12px;">Duration: ${q.duration}s${
                q.localScore !== undefined
                  ? ` | Local Score: ${q.localScore.toFixed(1)}/10`
                  : ""
              }</p>
          </div>
        `
            )
            .join("")
        : `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066FF; margin-bottom: 8px;">Question</h3>
          <p style="margin-bottom: 8px;"><strong>Question:</strong> ${
            interview.question || ""
          }</p>
          <p style="margin-bottom: 8px;"><strong>Answer:</strong> ${(
            interview.transcript || ""
          ).replace(/\n/g, "<br>")}</p>
        </div>
      `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Interview Results - ${interviewId}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
              body { margin: 0; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 { color: #0066FF; margin-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #0066FF; padding-bottom: 5px; }
            h3 { color: #0066FF; margin-top: 20px; margin-bottom: 10px; }
            .score { font-size: 48px; font-weight: bold; color: #0066FF; margin: 20px 0; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
            .feedback { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .improvements { margin: 15px 0; }
            .improvements li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <h1>Interview Results</h1>
          <div class="meta">
            <p><strong>Date:</strong> ${interview.createdAt.toLocaleDateString()}</p>
            <p><strong>Role:</strong> ${interview.role}</p>
            <p><strong>Difficulty:</strong> ${interview.difficulty}</p>
          </div>
          
          <div class="score">${data.score?.toFixed(1) || "—"}/10</div>
          
          <h2>Feedback</h2>
          <div class="feedback">
            ${(data.feedback || "").replace(/\n/g, "<br>")}
          </div>
          
          <h2>Areas to Improve</h2>
          <ul class="improvements">
            ${(data.improvements || [])
              .map((imp, idx) => `<li>${idx + 1}. ${imp}</li>`)
              .join("")}
            ${
              !data.improvements?.length
                ? "<li>No improvements listed.</li>"
                : ""
            }
          </ul>
          
          ${
            data.multimodal
              ? `
          <h2>Multimodal Analysis</h2>
          <div class="meta">
            <p><strong>Overall Multimodal Score:</strong> ${
              data.multimodal.overall_score?.toFixed(1) || "N/A"
            }/10</p>
          </div>
          <div class="feedback" style="margin-bottom: 30px;">
            ${Object.entries({
              emotions: "Emotions & Expressions",
              confidence: "Confidence",
              body_language: "Body Language",
              delivery: "Delivery",
              voice: "Voice Quality",
              timing: "Timing & Pacing",
              lip_sync: "Lip Sync & Synchronization",
            })
              .map(([key, label]) => {
                const section = (data.multimodal as any)[key];
                if (!section) return "";
                return `
                <div style="margin: 15px 0; padding: 12px; background: #f9f9f9; border-left: 3px solid #0066FF; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0;"><strong>${label}:</strong> <span style="color: #0066FF; font-weight: bold;">${
                  section.score?.toFixed(1) || "N/A"
                }/10</span></p>
                  ${
                    section.notes
                      ? `<p style="font-size: 13px; color: #666; margin: 5px 0; line-height: 1.5;">${section.notes}</p>`
                      : ""
                  }
                  ${
                    Array.isArray(section.suggestions) &&
                    section.suggestions.length > 0
                      ? `
                    <ul style="font-size: 12px; margin: 8px 0 0 0; padding-left: 20px; color: #555;">
                      ${section.suggestions
                        .map(
                          (s: string) => `<li style="margin: 4px 0;">${s}</li>`
                        )
                        .join("")}
                    </ul>
                  `
                      : ""
                  }
                </div>
              `;
              })
              .join("")}
            ${
              Array.isArray(data.multimodal.top_improvements) &&
              data.multimodal.top_improvements.length > 0
                ? `
              <div style="margin-top: 20px; padding: 12px; background: #e8f4f8; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #0066FF;">Top Multimodal Improvements:</p>
                <ul style="font-size: 13px; margin: 0; padding-left: 20px; color: #555;">
                  ${data.multimodal.top_improvements
                    .map(
                      (tip: string) => `<li style="margin: 6px 0;">${tip}</li>`
                    )
                    .join("")}
                </ul>
              </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }
          
          <h2>Questions & Answers</h2>
          ${questionsHtml}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center;">
            <p>Generated by InterviewMaster on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto p-6 space-y-8">
          {/* Enhanced Score Display */}
          <div className="card-modern p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Your Performance Score
                </p>
                <ScoreDisplay score={data.score || 0} size="lg" />
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    Completed
                  </span>
                </div>
                {interview.role && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {interview.role}
                    </p>
                  </div>
                )}
                {interview.difficulty && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {interview.difficulty}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Feedback Card */}
          <div className="card-modern p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Feedback</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-11">
              {data.feedback}
            </p>
          </div>

          {data.multimodal && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Speaking & Delivery (Multimodal)
                </h2>
                <span className="text-sm font-semibold text-blue-600">
                  Overall: {data.multimodal.overall_score?.toFixed?.(1) ?? "—"}
                  /10
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "emotions", label: "Emotions & Expressions" },
                  { key: "confidence", label: "Confidence" },
                  { key: "body_language", label: "Body Language" },
                  { key: "delivery", label: "Delivery" },
                  { key: "voice", label: "Voice Quality" },
                  { key: "timing", label: "Timing & Pacing" },
                  { key: "lip_sync", label: "Lip Sync & Sync" },
                ].map((item) => {
                  const section = (data.multimodal as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      className="border border-gray-100 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {item.label}
                        </p>
                        <span className="text-sm font-bold text-blue-600">
                          {section?.score !== undefined
                            ? `${section.score.toFixed(1)}/10`
                            : "—"}
                        </span>
                      </div>
                      {section?.notes && (
                        <p className="text-sm text-gray-700 mb-2">
                          {section.notes}
                        </p>
                      )}
                      {Array.isArray(section?.suggestions) &&
                        section.suggestions.length > 0 && (
                          <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                            {section.suggestions
                              .slice(0, 3)
                              .map((s: string, idx: number) => (
                                <li key={idx}>{s}</li>
                              ))}
                          </ul>
                        )}
                    </div>
                  );
                })}
              </div>
              {Array.isArray(data.multimodal.top_improvements) &&
                data.multimodal.top_improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Top Improvements
                    </p>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      {data.multimodal.top_improvements
                        .slice(0, 3)
                        .map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* Enhanced Improvements Card */}
          <div className="card-modern p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Areas to Improve
              </h2>
            </div>
            {data.improvements && data.improvements.length > 0 ? (
              <div className="space-y-3">
                {data.improvements.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-800 flex-1">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No specific improvements listed.
              </p>
            )}
          </div>

          {/* Enhanced Playback Section - Compact Grid Layout */}
          <div className="card-modern p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Video className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Video Playback
                </h2>
                {interview.questions && interview.questions.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({interview.questions.length}{" "}
                    {interview.questions.length === 1 ? "video" : "videos"})
                  </span>
                )}
              </div>
              {interview.questions &&
                interview.questions.length > 0 &&
                interview.questions.some((q) => q.transcript) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={expandAllTranscripts}
                      className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllTranscripts}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Collapse All
                    </button>
                  </div>
                )}
            </div>
            {interview.questions && interview.questions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interview.questions.map((q, idx) => {
                  const isTranscriptExpanded = expandedTranscripts.has(idx);
                  const isQuestionExpanded = expandedQuestions.has(idx);
                  const questionText = q.question || "";
                  const shouldTruncateQuestion = questionText.length > 120;
                  const displayQuestion =
                    shouldTruncateQuestion && !isQuestionExpanded
                      ? truncateText(questionText, 120)
                      : questionText;

                  return (
                    <div
                      key={idx}
                      className="card-modern p-4 flex flex-col hover:shadow-medium transition-all duration-300"
                    >
                      {/* Compact Question Header */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 bg-indigo-500 text-white rounded-full text-xs font-bold">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-semibold text-gray-800">
                              Question {idx + 1}
                            </p>
                          </div>
                          {q.transcript && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                              <FileText className="w-3 h-3" />
                              Transcript
                            </span>
                          )}
                        </div>
                        <div className="pl-9">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {displayQuestion}
                          </p>
                          {shouldTruncateQuestion && (
                            <button
                              onClick={() => toggleQuestion(idx)}
                              className="mt-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                              {isQuestionExpanded ? (
                                <>
                                  <Minimize2 className="w-3 h-3" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <Maximize2 className="w-3 h-3" />
                                  Show Full Question
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Compact Video Player */}
                      <div className="mb-3 flex-shrink-0">
                        {q.videoUrl ? (
                          <div className="relative group rounded-lg overflow-hidden bg-gray-900 aspect-video">
                            <video
                              controls
                              className="w-full h-full object-contain"
                              src={q.videoUrl}
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center border border-gray-200 aspect-video flex items-center justify-center">
                            <div>
                              <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-600">
                                No video available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Collapsible Transcript */}
                      {q.transcript && (
                        <div className="mt-auto">
                          <button
                            onClick={() => toggleTranscript(idx)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium text-gray-700"
                          >
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {isTranscriptExpanded ? "Hide" : "Show"}{" "}
                              Transcript
                            </span>
                            {isTranscriptExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {isTranscriptExpanded && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100 animate-slide-up">
                              <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                                {q.transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : data.videoUrl ? (
              <div>
                <div className="relative group mb-4">
                  <video
                    controls
                    className="w-full rounded-xl bg-gray-900 shadow-large"
                    src={data.videoUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                </div>
                {data.transcript && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Transcript
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {data.transcript}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No video available.</p>
                {data.transcript && (
                  <div className="mt-4 text-left p-4 bg-white rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Transcript
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {data.transcript}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Export Section */}
          <div className="card-modern p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Export Results
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportToPDF}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-soft hover:shadow-medium"
              >
                <Printer className="w-5 h-5" />
                Export as PDF
              </button>
              <button
                onClick={exportToCSV}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-soft hover:shadow-medium"
              >
                <FileText className="w-5 h-5" />
                Export as CSV
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Download your interview results for offline viewing or sharing
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/practice"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-soft hover:shadow-medium text-center"
            >
              <TrendingUp className="w-5 h-5" />
              Practice Again
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
