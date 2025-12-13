import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadVideoToGemini, cleanupGeminiFile, prepareVideoForGemini } from "@/lib/videoAnalysis";

interface RequestBody {
  transcript: string;
  question: string;
  framework?: string;
  videoUrls?: string[];
  durationSec?: number;
}

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 750;
const MAX_INLINE_BYTES = 8 * 1024 * 1024; // 8MB for inline video
const MAX_FILE_API_BYTES = 20 * 1024 * 1024; // 20MB for File API

// Prioritize available models for full multimodal video analysis
// Based on API availability: gemini-3-pro-preview and gemini-2.5-flash are confirmed working
const MULTIMODAL_MODELS = [
  "gemini-3-pro-preview",    // Primary - preview version (available in account, supports multimodal)
  "gemini-2.5-flash",        // Fallback - confirmed working, supports multimodal
  "gemini-2.5-pro",          // Alternative fallback - also available
  "gemini-1.5-pro",          // Last resort
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
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    if (!body.transcript || !body.question) {
      return NextResponse.json(
        { error: "Missing transcript or question" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] request received", {
        hasTranscript: !!body.transcript,
        hasQuestion: !!body.question,
        videoCount: body.videoUrls?.length || 0,
        durationSec: body.durationSec || 0,
      });
    }

    // Process video for multimodal analysis
    let videoPart: any | null = null;
    let geminiFileUri: string | null = null;
    const firstVideoUrl = body.videoUrls?.[0];
    const hasVideo = !!firstVideoUrl;

    if (firstVideoUrl) {
      try {
        const videoResp = await fetch(firstVideoUrl);
        if (!videoResp.ok) {
          throw new Error(`Failed to fetch video: status ${videoResp.status}`);
        }
        const videoBuffer = Buffer.from(await videoResp.arrayBuffer());
        const mimeType = videoResp.headers.get("Content-Type") || "video/webm";
        const videoSize = videoBuffer.length;

        if (process.env.NODE_ENV === "development") {
          console.log("[analyze] video fetched", {
            size: videoSize,
            sizeMB: (videoSize / 1024 / 1024).toFixed(2),
            mimeType,
          });
        }

        // Determine method: inline or File API
        const preparation = prepareVideoForGemini(videoBuffer, mimeType);

        if (preparation.method === "inline" && preparation.data) {
          // Use inline data for small videos
          videoPart = preparation.data;
          if (process.env.NODE_ENV === "development") {
            console.log("[analyze] using inline video data", {
              size: preparation.size,
              sizeMB: (preparation.size / 1024 / 1024).toFixed(2),
            });
          }
        } else {
          // Video too large - log warning but continue without video
          console.warn("[analyze] video too large, skipping video analysis", {
            size: preparation.size,
            sizeMB: (preparation.size / 1024 / 1024).toFixed(2),
            maxSizeMB: (20 * 1024 * 1024 / 1024 / 1024).toFixed(0),
          });
          // Continue without video - will analyze transcript only
        }
      } catch (videoErr: any) {
        const errorMessage = videoErr?.message || String(videoErr);
        console.error("[analyze] video processing failed", errorMessage);
        // Continue without video - will analyze transcript only
      }
    }

    const videoHint = hasVideo && videoPart
      ? `VIDEO ANALYSIS AVAILABLE: A video recording of the interview answer is provided. Analyze the video comprehensively for:
- Facial expressions and emotions (confidence, nervousness, enthusiasm, authenticity)
- Body language (posture, gestures, positioning, eye contact)
- Voice delivery (pace, clarity, volume, articulation, tone variation)
- Confidence indicators (voice projection, posture, composure, nervous gestures)
- Timing and pacing (response length, pauses, time management)
- Lip sync and audio-video synchronization
- Professional presentation (appearance, environment, lighting)

Provide detailed analysis of all these aspects in your multimodal response.`
      : `NO VIDEO PROVIDED: Only transcript is available. Infer delivery and speaking style from the transcript text only. Note in your analysis that video was not available.`;

    // Select a multimodal-capable model with fallbacks
    let model = null;
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
      - Eye contact with camera
      - Nervous gestures (fidgeting, hand movements, touching face)
      - Overall presence and composure

   C. BODY LANGUAGE:
      - Posture (upright, slouched, leaning forward/back)
      - Hand gestures (appropriate, excessive, minimal, distracting)
      - Head movements (nodding, shaking, tilting)
      - Shoulder positioning and body alignment
      - Overall body positioning in frame
      - Movement and stillness

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

    // Retry on transient Gemini errors (e.g., 503 overloaded)
    let result;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const parts: any[] = [];
        
        // Add video part if available (inline or File API)
        if (videoPart) {
          parts.push(videoPart);
        }
        
        // Add text prompt
        parts.push({ text: prompt });

        if (process.env.NODE_ENV === "development") {
          console.log("[analyze] sending to Gemini", {
            model: selectedModel,
            hasVideo: !!videoPart,
            videoMethod: videoPart ? (videoPart.inlineData ? "inline" : "file_api") : "none",
            partsCount: parts.length,
          });
        }

        result = await model.generateContent({
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
          return NextResponse.json(
            { error: "Gemini API not enabled for this project. Please enable it in Google Cloud." },
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
    const text = result.response.text();

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] raw response text (truncated)", text.slice(0, 400));
      console.log("[analyze] full response text length:", text.length);
      console.log("[analyze] response starts with:", text.substring(0, 50));
      console.log("[analyze] response ends with:", text.substring(Math.max(0, text.length - 50)));
    }

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
        console.log("[analyze] cleaned text starts with:", cleanedText.substring(0, 50));
      }
      
      parsed = JSON.parse(cleanedText);
    } catch (e: any) {
      // Fallback to legacy parsing if JSON is not returned
      const scoreMatch = text.match(/SCORE:\s*(\d+(?:\.\d+)?)/);
      const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*?)IMPROVEMENTS:/);
      const improvementsText = text.match(/IMPROVEMENTS:([\s\S]*?)$/)?.[1] || "";

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
        overall_score: typeof multimodal.overall_score === "number" ? multimodal.overall_score : parsed.score || 5,
        emotions: multimodal.emotions || { score: 5, notes: "Not analyzed", suggestions: [] },
        confidence: multimodal.confidence || { score: 5, notes: "Not analyzed", suggestions: [] },
        body_language: multimodal.body_language || { score: 5, notes: "Not analyzed", suggestions: [] },
        delivery: multimodal.delivery || { score: 5, notes: "Not analyzed", suggestions: [] },
        voice: multimodal.voice || { score: 5, notes: "Not analyzed", suggestions: [] },
        timing: multimodal.timing || { score: 5, notes: "Not analyzed", suggestions: [] },
        lip_sync: multimodal.lip_sync || { score: 5, notes: "Not analyzed", suggestions: [] },
        top_improvements: Array.isArray(multimodal.top_improvements) 
          ? multimodal.top_improvements.slice(0, 3)
          : parsed.improvements?.slice(0, 3) || [],
      };
      
      if (process.env.NODE_ENV === "development") {
        console.log("[analyze] normalized multimodal structure:", {
          hasEmotions: !!normalizedMultimodal.emotions,
          hasConfidence: !!normalizedMultimodal.confidence,
          hasBodyLanguage: !!normalizedMultimodal.body_language,
          overallScore: normalizedMultimodal.overall_score,
        });
      }
    } else if (hasVideo && videoPart) {
      // If video was sent but no multimodal data returned, log warning
      if (process.env.NODE_ENV === "development") {
        console.warn("[analyze] Video was sent but no multimodal data in response. Model may not have analyzed video.");
      }
    }

    const response = {
      score: typeof parsed.score === "number" ? parsed.score : 5,
      feedback: parsed.feedback || "Good effort! Keep practicing.",
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.slice(0, 3)
        : ["Practice speaking more confidently", "Use specific examples", "Improve structure"],
      multimodal: normalizedMultimodal,
    };

    // Cleanup Gemini File API file if used
    if (geminiFileUri) {
      try {
        await cleanupGeminiFile(genAI, geminiFileUri);
        if (process.env.NODE_ENV === "development") {
          console.log("[analyze] cleaned up Gemini file", geminiFileUri);
        }
      } catch (cleanupErr: any) {
        // Non-critical - just log
        console.warn("[analyze] file cleanup failed", cleanupErr?.message || cleanupErr);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] response normalized", {
        hasMultimodal: !!response.multimodal,
        multimodalKeys: response.multimodal ? Object.keys(response.multimodal) : [],
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
        details: process.env.NODE_ENV === "development" ? err?.stack : undefined
      },
      { status: 500 }
    );
  }
}

