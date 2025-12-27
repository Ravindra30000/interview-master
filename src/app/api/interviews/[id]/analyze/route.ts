import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanupGeminiFile, prepareVideoForGemini } from "@/lib/videoAnalysis";

interface RequestBody {
  transcript: string;
  question: string;
  framework?: string;
  videoUrls?: string[];
  durationSec?: number;
}

const MAX_RETRIES = 2; // Reduced from 4 to minimize API calls and costs
const BASE_DELAY_MS = 750;
const MAX_INLINE_BYTES = 8 * 1024 * 1024; // 8MB for inline video
const MAX_FILE_API_BYTES = 20 * 1024 * 1024; // 20MB for File API
const MAX_VIDEOS_TO_ANALYZE = 2; // Limit video analysis to reduce costs

// Prioritize cheaper models first for cost optimization
// gemini-2.5-flash is cheaper and still supports multimodal analysis
const MULTIMODAL_MODELS = [
  "gemini-2.5-flash", // Primary - cheaper, confirmed working, supports multimodal
  "gemini-3-pro-preview", // Fallback - more expensive, use only if flash fails
  "gemini-2.5-pro", // Alternative fallback
  "gemini-1.5-pro", // Last resort
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as RequestBody;
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing Gemini API key");
      return NextResponse.json(
        { error: "Missing Gemini API key" },
        { status: 500 }
      );
    }

    if (!body.transcript || !body.question) {
      return NextResponse.json(
        { error: "Missing transcript or question" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const videoUrls = body.videoUrls?.filter(Boolean) || [];
    const videoCount = videoUrls.length;

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] request received", {
        hasTranscript: !!body.transcript,
        hasQuestion: !!body.question,
        videoCount,
        durationSec: body.durationSec || 0,
      });
    }

    // Helper function to process a single video
    async function processVideo(videoUrl: string): Promise<{
      videoPart: any | null;
      geminiFileUri: string | null;
      success: boolean;
      error?: string;
    }> {
      try {
        const videoResp = await fetch(videoUrl);
        if (!videoResp.ok) {
          throw new Error(`Failed to fetch video: status ${videoResp.status}`);
        }
        const videoBuffer = Buffer.from(await videoResp.arrayBuffer());
        const mimeType = videoResp.headers.get("Content-Type") || "video/webm";
        const videoSize = videoBuffer.length;

        if (process.env.NODE_ENV === "development") {
          console.log("[analyze] video fetched", {
            url: videoUrl.substring(0, 50) + "...",
            size: videoSize,
            sizeMB: (videoSize / 1024 / 1024).toFixed(2),
            mimeType,
          });
        }

        // Determine method: inline or File API
        const preparation = prepareVideoForGemini(videoBuffer, mimeType);

        if (preparation.method === "inline" && preparation.data) {
          // Use inline data for small videos
          if (process.env.NODE_ENV === "development") {
            console.log("[analyze] using inline video data", {
              size: preparation.size,
              sizeMB: (preparation.size / 1024 / 1024).toFixed(2),
            });
          }
          return {
            videoPart: preparation.data,
            geminiFileUri: null,
            success: true,
          };
        } else {
          // Video too large - log warning
          const errorMsg = `Video too large (${(
            preparation.size /
            1024 /
            1024
          ).toFixed(2)}MB)`;
          console.warn("[analyze] video too large, skipping", {
            size: preparation.size,
            sizeMB: (preparation.size / 1024 / 1024).toFixed(2),
            maxSizeMB: ((20 * 1024 * 1024) / 1024 / 1024).toFixed(0),
          });
          return {
            videoPart: null,
            geminiFileUri: null,
            success: false,
            error: errorMsg,
          };
        }
      } catch (videoErr: any) {
        const errorMessage = videoErr?.message || String(videoErr);
        console.error("[analyze] video processing failed", errorMessage);
        return {
          videoPart: null,
          geminiFileUri: null,
          success: false,
          error: errorMessage,
        };
      }
    }

    // Process all videos
    const processedVideos: Array<{
      videoPart: any | null;
      geminiFileUri: string | null;
      success: boolean;
      error?: string;
    }> = [];

    if (videoCount > 0) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[analyze] processing ${videoCount} video(s)`);
      }
      // Process videos sequentially to avoid overwhelming the API
      for (let i = 0; i < videoCount; i++) {
        const processed = await processVideo(videoUrls[i]);
        processedVideos.push(processed);
        if (process.env.NODE_ENV === "development") {
          console.log(`[analyze] video ${i + 1}/${videoCount} processed:`, {
            success: processed.success,
            hasVideoPart: !!processed.videoPart,
          });
        }
        // Small delay between video processing to avoid rate limits
        if (i < videoCount - 1) {
          await wait(200);
        }
      }
    }

    const successfulVideos = processedVideos.filter(
      (v) => v.success && v.videoPart
    );
    const hasVideo = successfulVideos.length > 0;

    const videoHint = hasVideo
      ? `VIDEO ANALYSIS AVAILABLE: ${
          successfulVideos.length
        } video recording(s) of the interview answer${
          successfulVideos.length > 1 ? "s" : ""
        } ${successfulVideos.length > 1 ? "are" : "is"} provided. Analyze ${
          successfulVideos.length > 1 ? "each video" : "the video"
        } comprehensively for:

- Facial expressions and emotions (confidence, nervousness, enthusiasm, authenticity)
- Body language (posture, gestures, positioning, eye contact)
- Voice delivery (pace, clarity, volume, articulation, tone variation)
- Confidence indicators (voice projection, posture, composure, nervous gestures)
- Timing and pacing (response length, pauses, time management)
- Lip sync and audio-video synchronization
- Professional presentation (appearance, environment, lighting)

ENHANCED METRICS REQUIRED:
- EYE CONTACT ANALYSIS: Track frequency of looking directly at camera vs. looking down/sideways. Calculate percentage of time maintaining eye contact. Identify patterns of eye movement (nervous vs. confident). Note specific timestamps or frequency of looking away.
- BODY LANGUAGE PATTERNS: Analyze frequency of specific gestures (hand movements, head tilts, nodding). Assess posture consistency throughout the answer. Identify movement patterns (still vs. fidgeting, excessive movement).
- PROFESSIONAL PRESENTATION: Evaluate environment quality (lighting, background, distractions). Assess appearance and grooming. Rate overall professional presence and presentation.

${
  successfulVideos.length > 1
    ? "When analyzing multiple videos, provide aggregated analysis across all videos, noting patterns and consistency across answers."
    : ""
}

Provide detailed analysis of all these aspects in your multimodal response.`
      : `NO VIDEO PROVIDED: Only transcript is available. Infer delivery and speaking style from the transcript text only. Note in your analysis that video was not available.`;

    // Select a multimodal-capable model with fallbacks
    let model: ReturnType<typeof genAI.getGenerativeModel> | null = null;
    let selectedModel = "";
    for (const candidate of MULTIMODAL_MODELS) {
      try {
        model = genAI.getGenerativeModel({ model: candidate });
        selectedModel = candidate;
        break;
      } catch (modelErr: any) {
        const errorMessage = modelErr?.message || String(modelErr);
        console.warn("[analyze] failed to init model", candidate, errorMessage);
        continue;
      }
    }
    if (!model) {
      return NextResponse.json(
        { error: "No available Gemini model for analysis." },
        { status: 503 }
      );
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] using model", selectedModel);
    }

    const prompt = `
You are an expert interview coach with expertise in communication, psychology, and body language analysis.

ANALYSIS TASK:
Analyze this interview answer comprehensively using both the video (if available) and transcript.

QUESTION: ${body.question}
FRAMEWORK: ${body.framework || "STAR (Situation, Task, Action, Result)"}
TRANSCRIPT: ${body.transcript}
${videoHint}

COMPREHENSIVE ANALYSIS REQUIREMENTS:

1. CONTENT ANALYSIS (from transcript):
   - Answer structure and organization
   - Relevance to the question
   - Use of framework (STAR, etc.)
   - Specificity and examples
   - Clarity and coherence

2. MULTIMODAL ANALYSIS (from video, if available):

   A. EMOTIONS & EXPRESSIONS:
      - Facial expressions showing confidence, nervousness, enthusiasm
      - Emotional tone and authenticity
      - Micro-expressions indicating stress or confidence
      - Overall emotional presence

   B. CONFIDENCE LEVEL:
      - Voice projection and volume consistency
      - Posture and body positioning (upright, slouched, leaning)
      - Eye contact with camera (frequency, duration, patterns)
      - Nervous gestures (fidgeting, hand movements, touching face)
      - Overall presence and composure
      - Eye contact frequency: percentage of time looking at camera vs. down/sideways
      - Eye movement patterns: identify nervous vs. confident eye behavior

   C. BODY LANGUAGE:
      - Posture (upright, slouched, leaning forward/back)
      - Hand gestures (appropriate, excessive, minimal, distracting)
      - Head movements (nodding, shaking, tilting)
      - Shoulder positioning and body alignment
      - Overall body positioning in frame
      - Movement and stillness
      - Gesture frequency: count and analyze specific gesture patterns
      - Posture consistency: assess if posture remains consistent throughout
      - Movement patterns: identify fidgeting, excessive movement, or appropriate stillness

   D. DELIVERY & VOICE:
      - Speaking pace (too fast, too slow, appropriate)
      - Pauses and silence usage (effective, awkward, none)
      - Voice clarity and articulation
      - Volume consistency and projection
      - Tone variation and emphasis
      - Filler words usage (um, uh, like, etc.)

   E. VOICE QUALITY:
      - Pronunciation and enunciation
      - Voice clarity and intelligibility
      - Volume appropriateness
      - Voice modulation and expression
      - Professional tone

   F. TIMING & PACING:
      - Response length appropriateness
      - Time management
      - Pacing and rhythm
      - Natural flow vs. rushed/slow

   G. LIP SYNC & SYNCHRONIZATION:
      - Audio-video synchronization
      - Natural speech flow
      - Timing between words and mouth movements
      - Overall coherence of audio-visual presentation

   H. PROFESSIONAL PRESENTATION:
      - Environment quality (lighting, background, distractions)
      - Appearance and grooming
      - Overall professional presence
      - Background appropriateness
      - Visual presentation quality

Return JSON ONLY in this exact structure:
{
  "score": number 0-10,  // Overall content score based on transcript
  "feedback": "2-3 sentences summarizing overall performance and key strengths/weaknesses",
  "improvements": ["specific actionable improvement 1", "specific actionable improvement 2", "specific actionable improvement 3"],
  "multimodal": {
    "overall_score": number 0-10,  // Overall multimodal performance score
    "emotions": {
      "score": number 0-10,
      "notes": "Detailed analysis of facial expressions, emotional tone, and authenticity observed in the video",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "confidence": {
      "score": number 0-10,
      "notes": "Analysis of confidence indicators: voice projection, posture, eye contact, nervous gestures, overall composure",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "body_language": {
      "score": number 0-10,
      "notes": "Analysis of posture, gestures, positioning, movement, and overall body language",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "delivery": {
      "score": number 0-10,
      "notes": "Analysis of speaking pace, pauses, flow, rhythm, and overall delivery style",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "voice": {
      "score": number 0-10,
      "notes": "Analysis of voice clarity, pronunciation, volume, articulation, and professional tone",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "timing": {
      "score": number 0-10,
      "notes": "Analysis of response length, time management, pacing, and timing appropriateness",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "lip_sync": {
      "score": number 0-10,
      "notes": "Analysis of audio-video synchronization, natural speech flow, and coherence",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "eye_contact": {
      "score": number 0-10,
      "percentage_at_camera": number 0-100,  // Percentage of time looking at camera
      "frequency_looking_away": "low" | "medium" | "high",  // How often looking down/sideways
      "notes": "Detailed analysis of eye contact patterns, frequency of looking at camera vs. away, and eye movement behavior",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "body_language_patterns": {
      "gesture_frequency": "low" | "medium" | "high",
      "posture_consistency": "consistent" | "variable" | "inconsistent",
      "movement_level": "still" | "moderate" | "excessive",
      "notes": "Analysis of gesture patterns, posture consistency, and movement throughout the answer",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "professional_presentation": {
      "score": number 0-10,
      "environment_quality": "excellent" | "good" | "fair" | "poor",
      "appearance": "professional" | "casual" | "needs_improvement",
      "notes": "Evaluation of environment, appearance, grooming, and overall professional presentation",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "top_improvements": ["most important improvement 1", "most important improvement 2", "most important improvement 3"]
  }
}

CRITICAL RULES:
- Always return valid JSON parsable by JSON.parse()
- Scores should be realistic and varied (not all 10s or all 1s)
- Suggestions must be specific, actionable, and constructive
- If video is not available, infer from transcript but note limitations in notes
- Be encouraging and constructive in all feedback
- Ensure all 7 multimodal dimensions are analyzed
- Notes should be detailed (2-3 sentences each)
- Suggestions should be specific and implementable
`;

    // Helper function to analyze a single video with retry logic
    async function analyzeVideo(
      videoPart: any,
      videoIndex: number,
      totalVideos: number,
      modelInstance: ReturnType<typeof genAI.getGenerativeModel>
    ): Promise<string> {
      let result;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const parts: any[] = [];

          // Add video part
          if (videoPart) {
            parts.push(videoPart);
          }

          // Add text prompt (include video index if multiple videos)
          const videoSpecificPrompt =
            totalVideos > 1
              ? `${prompt}\n\nNOTE: This is video ${
                  videoIndex + 1
                } of ${totalVideos}. Analyze this specific video, and we will aggregate results from all videos afterward.`
              : prompt;
          parts.push({ text: videoSpecificPrompt });

          if (process.env.NODE_ENV === "development") {
            console.log(
              `[analyze] sending video ${
                videoIndex + 1
              }/${totalVideos} to Gemini`,
              {
                model: selectedModel,
                hasVideo: !!videoPart,
                videoMethod: videoPart?.inlineData ? "inline" : "file_api",
                partsCount: parts.length,
              }
            );
          }

          result = await modelInstance.generateContent({
            contents: [
              {
                role: "user",
                parts,
              },
            ],
          });
          break;
        } catch (err: any) {
          const msg = err?.message || "";
          const isOverloaded =
            msg.includes("503") ||
            msg.includes("overloaded") ||
            msg.includes("RESOURCE_EXHAUSTED") ||
            msg.includes("UNAVAILABLE");
          const isServiceDisabled =
            msg.includes("SERVICE_DISABLED") ||
            msg.includes("has not been used") ||
            msg.includes("activation");

          if (isServiceDisabled) {
            console.error("Gemini service disabled or not activated:", msg);
            throw new Error(
              "Gemini API not enabled for this project. Please enable it in Google Cloud."
            );
          }

          const shouldRetry = isOverloaded && attempt < MAX_RETRIES - 1;
          console.warn(
            `[analyze] video ${videoIndex + 1} attempt ${
              attempt + 1
            } failed: ${msg}`
          );
          if (shouldRetry) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await wait(delay);
            continue;
          }

          throw err;
        }
      }

      if (!result) {
        throw new Error(
          `Gemini analysis unavailable for video ${videoIndex + 1}`
        );
      }

      return result.response.text();
    }

    // Analyze all videos or fall back to transcript-only
    const videoAnalysisResults: Array<{
      text: string;
      success: boolean;
      error?: string;
    }> = [];

    // Track API calls for cost monitoring (declare at function scope)
    let apiCallCount = 0;
    let transcriptApiCallCount = 0;
    let videosToAnalyze: Array<{
      videoPart: any;
      geminiFileUri: string | null;
      success: boolean;
      error?: string;
    }> = [];
    let successfulResults: Array<{
      text: string;
      success: boolean;
      error?: string;
    }> = [];

    if (hasVideo && successfulVideos.length > 0) {
      if (!model) {
        console.error("[analyze] Model not available for video analysis");
        return NextResponse.json(
          { error: "No available Gemini model for analysis." },
          { status: 503 }
        );
      }

      // COST OPTIMIZATION: Sample videos to limit API calls
      videosToAnalyze = successfulVideos;
      if (successfulVideos.length > MAX_VIDEOS_TO_ANALYZE) {
        // Select most representative videos: first (introduction) + last (final answer)
        // or first + longest if last is same as first
        const selectedIndices: number[] = [0]; // Always include first video

        if (successfulVideos.length > 1) {
          const lastIndex = successfulVideos.length - 1;
          if (lastIndex !== 0) {
            selectedIndices.push(lastIndex);
          } else {
            // If only one video, find the longest one (if we have size info)
            // For now, just take first two different ones
            if (successfulVideos.length > 1) {
              selectedIndices.push(1);
            }
          }
        }

        videosToAnalyze = selectedIndices.map((idx) => successfulVideos[idx]);

        console.log(
          `[analyze] Cost optimization: Analyzing ${videosToAnalyze.length} of ${successfulVideos.length} videos`,
          {
            totalVideos: successfulVideos.length,
            selectedCount: videosToAnalyze.length,
            selectedIndices,
            skippedCount: successfulVideos.length - videosToAnalyze.length,
          }
        );
      } else {
        console.log(
          `[analyze] Analyzing all ${successfulVideos.length} video(s) (within limit)`
        );
      }

      // Process selected videos
      for (let i = 0; i < videosToAnalyze.length; i++) {
        try {
          const text = await analyzeVideo(
            successfulVideos[i].videoPart,
            i,
            successfulVideos.length,
            model
          );
          videoAnalysisResults.push({ text, success: true });
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[analyze] video ${i + 1}/${
                successfulVideos.length
              } analyzed successfully`
            );
          }
          // Small delay between video analyses to avoid rate limits
          if (i < successfulVideos.length - 1) {
            await wait(500);
          }
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          console.error(`[analyze] video ${i + 1} analysis failed:`, errorMsg);
          videoAnalysisResults.push({
            text: "",
            success: false,
            error: errorMsg,
          });
          // Continue with other videos even if one fails
          console.warn(
            `[analyze] Video ${
              i + 1
            } analysis failed, continuing with remaining videos`
          );
        }
      }

      // Log cost summary
      console.log(`[analyze] Video analysis cost summary:`, {
        totalVideos: successfulVideos.length,
        analyzedVideos: videosToAnalyze.length,
        skippedVideos: successfulVideos.length - videosToAnalyze.length,
        apiCallsMade: apiCallCount,
        successfulAnalyses: videoAnalysisResults.filter((r) => r.success)
          .length,
      });

      // Log video analysis results summary
      const successfulVideoAnalyses = videoAnalysisResults.filter(
        (r) => r.success
      );
      const failedVideoAnalyses = videoAnalysisResults.filter(
        (r) => !r.success
      );
      console.log("[analyze] Video analysis results:", {
        total: videoAnalysisResults.length,
        successful: successfulVideoAnalyses.length,
        failed: failedVideoAnalyses.length,
        willAggregate: successfulVideoAnalyses.length > 0,
      });

      if (
        failedVideoAnalyses.length > 0 &&
        successfulVideoAnalyses.length > 0
      ) {
        console.warn(
          `[analyze] ${failedVideoAnalyses.length} video(s) failed analysis, but continuing with ${successfulVideoAnalyses.length} successful analysis(es)`
        );
      } else if (failedVideoAnalyses.length > 0) {
        console.error(
          "[analyze] All video analyses failed, falling back to transcript-only analysis"
        );
      }
    }

    // If we have video analysis results, aggregate them; otherwise analyze transcript only
    let aggregatedText = "";
    if (
      videoAnalysisResults.length > 0 &&
      videoAnalysisResults.some((r) => r.success)
    ) {
      // Aggregate results from multiple videos
      successfulResults = videoAnalysisResults.filter((r) => r.success);
      if (successfulResults.length === 1) {
        // Single video result - use directly (no aggregation needed)
        aggregatedText = successfulResults[0].text;
        console.log(
          "[analyze] Using single video result directly (no aggregation API call)"
        );
      } else if (successfulResults.length === 2) {
        // COST OPTIMIZATION: For 2 videos, merge client-side instead of API call
        console.log(
          "[analyze] Merging 2 video results client-side (skipping aggregation API call)"
        );

        try {
          // Parse both results
          let result1: any, result2: any;
          try {
            let cleaned1 = successfulResults[0].text.trim();
            if (cleaned1.startsWith("```json"))
              cleaned1 = cleaned1.replace(/^```json\s*/i, "");
            else if (cleaned1.startsWith("```"))
              cleaned1 = cleaned1.replace(/^```\s*/, "");
            if (cleaned1.endsWith("```"))
              cleaned1 = cleaned1.replace(/\s*```$/g, "");
            result1 = JSON.parse(cleaned1);
          } catch (e) {
            console.warn(
              "[analyze] Failed to parse first video result, using as text"
            );
            result1 = { feedback: successfulResults[0].text };
          }

          try {
            let cleaned2 = successfulResults[1].text.trim();
            if (cleaned2.startsWith("```json"))
              cleaned2 = cleaned2.replace(/^```json\s*/i, "");
            else if (cleaned2.startsWith("```"))
              cleaned2 = cleaned2.replace(/^```\s*/, "");
            if (cleaned2.endsWith("```"))
              cleaned2 = cleaned2.replace(/\s*```$/g, "");
            result2 = JSON.parse(cleaned2);
          } catch (e) {
            console.warn(
              "[analyze] Failed to parse second video result, using as text"
            );
            result2 = { feedback: successfulResults[1].text };
          }

          // Merge scores (average)
          const mergedScore =
            typeof result1.score === "number" &&
            typeof result2.score === "number"
              ? (result1.score + result2.score) / 2
              : result1.score || result2.score || 5;

          // Merge feedback (combine)
          const mergedFeedback =
            [result1.feedback || "", result2.feedback || ""]
              .filter(Boolean)
              .join(" ")
              .trim() || "Good effort across both answers.";

          // Merge improvements (deduplicate and combine)
          const improvements1 = Array.isArray(result1.improvements)
            ? result1.improvements
            : [];
          const improvements2 = Array.isArray(result2.improvements)
            ? result2.improvements
            : [];
          const mergedImprovements = Array.from(
            new Set([...improvements1, ...improvements2])
          ).slice(0, 5);

          // Merge multimodal data if present
          let mergedMultimodal: any = {};
          if (result1.multimodal && result2.multimodal) {
            // Average scores, combine notes and suggestions
            const multimodal1 = result1.multimodal;
            const multimodal2 = result2.multimodal;

            mergedMultimodal.overall_score =
              typeof multimodal1.overall_score === "number" &&
              typeof multimodal2.overall_score === "number"
                ? (multimodal1.overall_score + multimodal2.overall_score) / 2
                : multimodal1.overall_score || multimodal2.overall_score || 5;

            // Merge each dimension
            const dimensions = [
              "emotions",
              "confidence",
              "body_language",
              "delivery",
              "voice",
              "timing",
              "lip_sync",
            ];
            for (const dim of dimensions) {
              if (multimodal1[dim] && multimodal2[dim]) {
                const score1 = multimodal1[dim].score || 5;
                const score2 = multimodal2[dim].score || 5;
                mergedMultimodal[dim] = {
                  score: (score1 + score2) / 2,
                  notes: [multimodal1[dim].notes, multimodal2[dim].notes]
                    .filter(Boolean)
                    .join(" "),
                  suggestions: Array.from(
                    new Set([
                      ...(multimodal1[dim].suggestions || []),
                      ...(multimodal2[dim].suggestions || []),
                    ])
                  ).slice(0, 3),
                };
              } else {
                mergedMultimodal[dim] = multimodal1[dim] || multimodal2[dim];
              }
            }

            // Merge eye_contact, body_language_patterns, professional_presentation if present
            if (multimodal1.eye_contact && multimodal2.eye_contact) {
              mergedMultimodal.eye_contact = {
                ...multimodal1.eye_contact,
                score:
                  (multimodal1.eye_contact.score +
                    multimodal2.eye_contact.score) /
                  2,
                percentage_at_camera:
                  (multimodal1.eye_contact.percentage_at_camera +
                    multimodal2.eye_contact.percentage_at_camera) /
                  2,
                notes: [
                  multimodal1.eye_contact.notes,
                  multimodal2.eye_contact.notes,
                ]
                  .filter(Boolean)
                  .join(" "),
                suggestions: Array.from(
                  new Set([
                    ...(multimodal1.eye_contact.suggestions || []),
                    ...(multimodal2.eye_contact.suggestions || []),
                  ])
                ).slice(0, 3),
              };
            } else {
              mergedMultimodal.eye_contact =
                multimodal1.eye_contact || multimodal2.eye_contact;
            }

            if (
              multimodal1.body_language_patterns ||
              multimodal2.body_language_patterns
            ) {
              mergedMultimodal.body_language_patterns =
                multimodal1.body_language_patterns ||
                multimodal2.body_language_patterns;
            }

            if (
              multimodal1.professional_presentation &&
              multimodal2.professional_presentation
            ) {
              mergedMultimodal.professional_presentation = {
                ...multimodal1.professional_presentation,
                score:
                  (multimodal1.professional_presentation.score +
                    multimodal2.professional_presentation.score) /
                  2,
                notes: [
                  multimodal1.professional_presentation.notes,
                  multimodal2.professional_presentation.notes,
                ]
                  .filter(Boolean)
                  .join(" "),
                suggestions: Array.from(
                  new Set([
                    ...(multimodal1.professional_presentation.suggestions ||
                      []),
                    ...(multimodal2.professional_presentation.suggestions ||
                      []),
                  ])
                ).slice(0, 3),
              };
            } else {
              mergedMultimodal.professional_presentation =
                multimodal1.professional_presentation ||
                multimodal2.professional_presentation;
            }

            // Merge top improvements
            const topImp1 = Array.isArray(multimodal1.top_improvements)
              ? multimodal1.top_improvements
              : [];
            const topImp2 = Array.isArray(multimodal2.top_improvements)
              ? multimodal2.top_improvements
              : [];
            mergedMultimodal.top_improvements = Array.from(
              new Set([...topImp1, ...topImp2])
            ).slice(0, 5);
          } else {
            // Use Object.assign to avoid const reassignment issue
            Object.assign(
              mergedMultimodal,
              result1.multimodal || result2.multimodal || {}
            );
          }

          // Create merged result
          const mergedResult = {
            score: mergedScore,
            feedback: mergedFeedback,
            improvements: mergedImprovements,
            multimodal: mergedMultimodal,
          };

          aggregatedText = JSON.stringify(mergedResult);
          console.log(
            "[analyze] Client-side merge completed (saved 1 API call)"
          );
        } catch (mergeError: any) {
          console.warn(
            "[analyze] Client-side merge failed, using first result:",
            mergeError?.message
          );
          aggregatedText = successfulResults[0].text;
        }
      } else if (successfulResults.length >= 3) {
        // For 3+ videos, use API aggregation (rare case)
        console.log(
          `[analyze] Using API aggregation for ${successfulResults.length} videos`
        );
        const aggregationPrompt = `You have analyzed ${
          successfulResults.length
        } separate videos from an interview session. Each video contains a different answer. 

Your task is to aggregate the analysis results into a single comprehensive report that:
1. Combines scores (average or weighted based on answer quality)
2. Merges notes from all videos, identifying patterns and consistency
3. Combines suggestions, prioritizing the most impactful improvements
4. Provides overall feedback that reflects performance across all answers

Here are the individual analysis results:

${successfulResults
  .map((r, idx) => `=== VIDEO ${idx + 1} ANALYSIS ===\n${r.text}\n`)
  .join("\n")}

Return a single aggregated JSON response in the same structure as before, but representing the overall performance across all videos.`;

        // Analyze aggregated results
        let aggregationResult:
          | Awaited<ReturnType<typeof model.generateContent>>
          | undefined;
        apiCallCount++; // Track aggregation API call
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            aggregationResult = await model.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [{ text: aggregationPrompt }],
                },
              ],
            });
            break;
          } catch (err: any) {
            const msg = err?.message || "";
            const isOverloaded =
              msg.includes("503") ||
              msg.includes("overloaded") ||
              msg.includes("RESOURCE_EXHAUSTED") ||
              msg.includes("UNAVAILABLE");
            const shouldRetry = isOverloaded && attempt < MAX_RETRIES - 1;
            if (shouldRetry) {
              const delay = BASE_DELAY_MS * Math.pow(2, attempt);
              await wait(delay);
              continue;
            }
            throw err;
          }
        }
        aggregatedText =
          aggregationResult?.response.text() || successfulResults[0].text;
      }
    } else {
      // No video analysis - analyze transcript only
      if (!model) {
        return NextResponse.json(
          { error: "No available Gemini model for analysis." },
          { status: 503 }
        );
      }
      let result;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          });
          break;
        } catch (err: any) {
          const msg = err?.message || "";
          const isOverloaded =
            msg.includes("503") ||
            msg.includes("overloaded") ||
            msg.includes("RESOURCE_EXHAUSTED") ||
            msg.includes("UNAVAILABLE");
          const isServiceDisabled =
            msg.includes("SERVICE_DISABLED") ||
            msg.includes("has not been used") ||
            msg.includes("activation");

          if (isServiceDisabled) {
            console.error("Gemini service disabled or not activated:", msg);
            return NextResponse.json(
              {
                error:
                  "Gemini API not enabled for this project. Please enable it in Google Cloud.",
              },
              { status: 503 }
            );
          }

          const shouldRetry = isOverloaded && attempt < MAX_RETRIES - 1;
          console.warn(`Gemini attempt ${attempt + 1} failed: ${msg}`);
          if (shouldRetry) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await wait(delay);
            continue;
          }

          throw err;
        }
      }

      if (!result) {
        return NextResponse.json(
          { error: "Gemini analysis unavailable. Please retry." },
          { status: 503 }
        );
      }
      aggregatedText = result.response.text();
    }

    const text = aggregatedText;

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[analyze] raw response text (truncated)",
        text.slice(0, 400)
      );
      console.log("[analyze] full response text length:", text.length);
      console.log("[analyze] response starts with:", text.substring(0, 50));
      console.log(
        "[analyze] response ends with:",
        text.substring(Math.max(0, text.length - 50))
      );
    }

    // Log analysis summary
    console.log("[analyze] Analysis summary:", {
      videoCount,
      successfulVideos: successfulVideos.length,
      failedVideos: processedVideos.filter((v) => !v.success).length,
      hasVideoAnalysis: videoAnalysisResults.some((r) => r.success),
      transcriptOnly: !hasVideo || successfulVideos.length === 0,
    });

    let parsed;
    try {
      // Strip markdown code blocks if present (Gemini often wraps JSON in ```json ... ```)
      let cleanedText = text.trim();

      // Remove opening markdown code block
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "");
      }

      // Remove closing markdown code block
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.replace(/\s*```$/g, "");
      }

      // Trim again after removing markdown
      cleanedText = cleanedText.trim();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[analyze] cleaned text starts with:",
          cleanedText.substring(0, 50)
        );
      }

      parsed = JSON.parse(cleanedText);
    } catch (e: any) {
      // Fallback to legacy parsing if JSON is not returned
      const scoreMatch = text.match(/SCORE:\s*(\d+(?:\.\d+)?)/);
      const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*?)IMPROVEMENTS:/);
      const improvementsText =
        text.match(/IMPROVEMENTS:([\s\S]*?)$/)?.[1] || "";

      const legacy = {
        score: parseFloat(scoreMatch?.[1] || "5"),
        feedback: feedbackMatch?.[1]?.trim() || "Good effort! Keep practicing.",
        improvements: improvementsText
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.replace(/^-+\s*/, "").trim())
          .filter(Boolean),
      };
      if (legacy.improvements.length < 3) {
        legacy.improvements.push(
          "Practice speaking more confidently",
          "Use specific examples from your experience",
          "Structure your answers with clear beginning, middle, and end"
        );
        legacy.improvements = legacy.improvements.slice(0, 3);
      }
      return NextResponse.json(legacy);
    }

    // Normalize parsed response and ensure multimodal structure
    const multimodal = parsed.multimodal || null;

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] parsed response has multimodal:", !!multimodal);
      if (multimodal) {
        console.log("[analyze] multimodal keys:", Object.keys(multimodal));
      }
    }

    // Ensure multimodal has all required fields
    let normalizedMultimodal = null;
    if (multimodal) {
      normalizedMultimodal = {
        overall_score:
          typeof multimodal.overall_score === "number"
            ? multimodal.overall_score
            : parsed.score || 5,
        emotions: multimodal.emotions || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        confidence: multimodal.confidence || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        body_language: multimodal.body_language || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        delivery: multimodal.delivery || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        voice: multimodal.voice || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        timing: multimodal.timing || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        lip_sync: multimodal.lip_sync || {
          score: 5,
          notes: "Not analyzed",
          suggestions: [],
        },
        eye_contact: multimodal.eye_contact || {
          score: 5,
          percentage_at_camera: 0,
          frequency_looking_away: "medium" as "low" | "medium" | "high",
          notes: "Not analyzed",
          suggestions: [],
        },
        body_language_patterns: multimodal.body_language_patterns || {
          gesture_frequency: "medium" as "low" | "medium" | "high",
          posture_consistency: "variable" as
            | "consistent"
            | "variable"
            | "inconsistent",
          movement_level: "moderate" as "still" | "moderate" | "excessive",
          notes: "Not analyzed",
          suggestions: [],
        },
        professional_presentation: multimodal.professional_presentation || {
          score: 5,
          environment_quality: "good" as "excellent" | "good" | "fair" | "poor",
          appearance: "professional" as
            | "professional"
            | "casual"
            | "needs_improvement",
          notes: "Not analyzed",
          suggestions: [],
        },
        top_improvements: Array.isArray(multimodal.top_improvements)
          ? multimodal.top_improvements.slice(0, 3)
          : parsed.improvements?.slice(0, 3) || [],
      };

      if (process.env.NODE_ENV === "development") {
        console.log("[analyze] normalized multimodal structure:", {
          hasEmotions: !!normalizedMultimodal.emotions,
          hasConfidence: !!normalizedMultimodal.confidence,
          hasBodyLanguage: !!normalizedMultimodal.body_language,
          hasEyeContact: !!normalizedMultimodal.eye_contact,
          hasBodyLanguagePatterns:
            !!normalizedMultimodal.body_language_patterns,
          hasProfessionalPresentation:
            !!normalizedMultimodal.professional_presentation,
          overallScore: normalizedMultimodal.overall_score,
        });
      }
    } else if (hasVideo && successfulVideos.length > 0) {
      // If video was sent but no multimodal data returned, log warning
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[analyze] ${successfulVideos.length} video(s) was sent but no multimodal data in response. Model may not have analyzed video(s).`
        );
      }
    }

    const response = {
      score: typeof parsed.score === "number" ? parsed.score : 5,
      feedback: parsed.feedback || "Good effort! Keep practicing.",
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.slice(0, 3)
        : [
            "Practice speaking more confidently",
            "Use specific examples",
            "Improve structure",
          ],
      multimodal: normalizedMultimodal,
    };

    // Cleanup Gemini File API files if used
    for (const processedVideo of processedVideos) {
      if (processedVideo.geminiFileUri) {
        try {
          await cleanupGeminiFile(genAI, processedVideo.geminiFileUri);
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[analyze] cleaned up Gemini file",
              processedVideo.geminiFileUri
            );
          }
        } catch (cleanupErr: any) {
          // Non-critical - just log
          console.warn(
            "[analyze] file cleanup failed",
            cleanupErr?.message || cleanupErr
          );
        }
      }
    }

    // Calculate total API calls for cost tracking
    const totalApiCalls =
      hasVideo && successfulVideos.length > 0
        ? apiCallCount + (successfulResults.length >= 3 ? 1 : 0) // video calls + aggregation if needed
        : transcriptApiCallCount;

    // Log final response summary with cost tracking
    console.log("[analyze] Final response summary:", {
      hasMultimodal: !!response.multimodal,
      multimodalKeys: response.multimodal
        ? Object.keys(response.multimodal)
        : [],
      improvementsCount: response.improvements.length,
      score: response.score,
      videoAnalysisUsed: hasVideo && successfulVideos.length > 0,
      videoCountAnalyzed: hasVideo
        ? videosToAnalyze.length > 0
          ? videosToAnalyze.length
          : successfulVideos.length
        : 0,
      totalVideosReceived: videoCount,
      videosSkipped: hasVideo
        ? Math.max(
            0,
            successfulVideos.length -
              (videosToAnalyze.length > 0
                ? videosToAnalyze.length
                : successfulVideos.length)
          )
        : 0,
      totalApiCalls: totalApiCalls,
      aggregationMethod:
        successfulResults.length === 2
          ? "client-side"
          : successfulResults.length >= 3
          ? "API"
          : "none",
      costOptimization: {
        videosLimited:
          hasVideo && successfulVideos.length > MAX_VIDEOS_TO_ANALYZE,
        aggregationSkipped: successfulResults.length === 2,
        retriesReduced: MAX_RETRIES === 2,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] response normalized", {
        hasMultimodal: !!response.multimodal,
        multimodalKeys: response.multimodal
          ? Object.keys(response.multimodal)
          : [],
        improvementsCount: response.improvements.length,
        score: response.score,
      });
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Gemini analysis error:", err);
    console.error("Error details:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });
    return NextResponse.json(
      {
        error: err?.message || "Analysis failed",
        details:
          process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
