"use client";

import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";
import { getInterview } from "@/lib/interviews";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait for auth state to be determined before loading interview
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecked(true);
      if (!user) {
        setErrorMessage("Please log in to view results");
        setLoading(false);
        return;
      }

      // Auth is ready, proceed to load interview
      if (!interviewId) {
        setErrorMessage("Invalid interview ID");
        setLoading(false);
        return;
      }

      try {
        // If interviewId is a timestamp (legacy URL), use fallback
        if (interviewId && !isNaN(Number(interviewId)) && interviewId.length > 10) {
          const demoScore = searchParams.get("score");
          const geminiScore = searchParams.get("geminiScore");
          const feedback = searchParams.get("feedback");
          const improvementsStr = searchParams.get("improvements");
          
          const improvements = improvementsStr ? improvementsStr.split("|||").filter(Boolean) : undefined;
          const finalScore = geminiScore ? Number(geminiScore) : (demoScore ? Number(demoScore) : 7.8);
          
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
              feedback: feedback || (error 
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

        // Fetch from Firestore
        const interviewData = await getInterview(user.uid, interviewId);
        if (!interviewData) {
          setErrorMessage("Interview not found");
          setLoading(false);
          return;
        }

        setInterview(interviewData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading interview:", err);
        setErrorMessage(err.message || "Failed to load interview");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [interviewId, error, searchParams]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !interview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Error</p>
            <p className="text-gray-700">{errorMessage || "No results found."}</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const data: ResultData = {
    score: interview.analysis?.score || interview.localMetrics ? 
      (interview.localMetrics!.confidence + interview.localMetrics!.clarity + interview.localMetrics!.structure) / 3 * 10 : 0,
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
      multimodalKeys: interview.multimodalAnalysis ? Object.keys(interview.multimodalAnalysis) : [],
    });
  }

  const exportToCSV = () => {
    const rows: string[][] = [
      ["Interview Results", ""],
      ["Date", interview.createdAt.toLocaleDateString()],
      ["Role", interview.role],
      ["Difficulty", interview.difficulty],
      ["Score", data.score?.toFixed(1) || "N/A"],
      ["", ""],
      ["Feedback", data.feedback || ""],
      ["", ""],
      ["Improvements", ""],
      ...(data.improvements || []).map((imp, idx) => [`${idx + 1}.`, imp]),
      ["", ""],
      ["Questions & Answers", ""],
    ];

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

    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `interview-results-${interviewId}-${new Date().toISOString().split('T')[0]}.csv`);
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

    const questionsHtml = interview.questions && interview.questions.length > 0
      ? interview.questions.map((q, idx) => `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #0066FF; margin-bottom: 8px;">Question ${idx + 1}</h3>
            <p style="margin-bottom: 8px;"><strong>Question:</strong> ${q.question || ""}</p>
            <p style="margin-bottom: 8px;"><strong>Answer:</strong> ${(q.transcript || "").replace(/\n/g, "<br>")}</p>
            <p style="color: #666; font-size: 12px;">Duration: ${q.duration}s${q.localScore !== undefined ? ` | Local Score: ${q.localScore.toFixed(1)}/10` : ""}</p>
          </div>
        `).join("")
      : `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #0066FF; margin-bottom: 8px;">Question</h3>
          <p style="margin-bottom: 8px;"><strong>Question:</strong> ${interview.question || ""}</p>
          <p style="margin-bottom: 8px;"><strong>Answer:</strong> ${(interview.transcript || "").replace(/\n/g, "<br>")}</p>
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
            ${(data.improvements || []).map((imp, idx) => `<li>${idx + 1}. ${imp}</li>`).join("")}
            ${!data.improvements?.length ? "<li>No improvements listed.</li>" : ""}
          </ul>
          
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-600 mb-1">Your Score</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold text-blue-600">{data.score?.toFixed(1) ?? "—"}</p>
                <p className="text-sm text-gray-500">/10</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500">Status</p>
                <p className="text-lg font-semibold text-green-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Feedback</h2>
            <p className="text-sm text-gray-800 leading-relaxed">{data.feedback}</p>
          </div>

          {data.multimodal && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Speaking & Delivery (Multimodal)</h2>
                <span className="text-sm font-semibold text-blue-600">
                  Overall: {data.multimodal.overall_score?.toFixed?.(1) ?? "—"}/10
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "delivery", label: "Delivery" },
                  { key: "voice", label: "Voice" },
                  { key: "confidence", label: "Confidence" },
                  { key: "timing", label: "Timing" },
                  { key: "body_language", label: "Body Language" },
                ].map((item) => {
                  const section = (data.multimodal as any)[item.key];
                  return (
                    <div key={item.key} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                        <span className="text-sm font-bold text-blue-600">
                          {section?.score !== undefined ? `${section.score.toFixed(1)}/10` : "—"}
                        </span>
                      </div>
                      {section?.notes && (
                        <p className="text-sm text-gray-700 mb-2">{section.notes}</p>
                      )}
                      {Array.isArray(section?.suggestions) && section.suggestions.length > 0 && (
                        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                          {section.suggestions.slice(0, 3).map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
              {Array.isArray(data.multimodal.top_improvements) && data.multimodal.top_improvements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Top Improvements</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {data.multimodal.top_improvements.slice(0, 3).map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Areas to improve</h2>
            <ul className="space-y-2">
              {data.improvements?.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-800">
                  <span className="text-blue-600 font-bold">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
              {!data.improvements?.length && (
                <li className="text-sm text-gray-600">No improvements listed.</li>
              )}
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Playback</h2>
            {interview.questions && interview.questions.length > 0 ? (
              <div className="space-y-6">
                {interview.questions.map((q, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Question {idx + 1}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">{q.question}</p>
                    </div>
                    {q.videoUrl ? (
                      <video 
                        controls 
                        className="w-full rounded-lg bg-black mb-3" 
                        src={q.videoUrl}
                        preload="metadata"
                      />
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center mb-3">
                        <p className="text-sm text-gray-600">No video available for this question</p>
                      </div>
                    )}
                    {q.transcript && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Transcript</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.transcript}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : data.videoUrl ? (
              <div>
                <video controls className="w-full rounded-lg bg-black mb-3" src={data.videoUrl} />
                {data.transcript && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Transcript</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.transcript}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-600">No video available.</p>
                {data.transcript && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Transcript</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Export Results</h2>
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="flex-1 text-center bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Export as PDF
              </button>
              <button
                onClick={exportToCSV}
                className="flex-1 text-center bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Export as CSV
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Download your interview results for offline viewing or sharing
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/practice"
              className="flex-1 text-center bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Practice again
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

