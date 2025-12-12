import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface RequestBody {
  transcript: string;
  question: string;
  framework?: string;
  videoUrls?: string[];
  durationSec?: number;
}

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 750;
const MAX_VIDEO_BYTES = 8 * 1024 * 1024; // 8MB cap for inline video
// Prefer stable, generally available multimodal models; fall back to text if needed
const MULTIMODAL_MODELS = [
  "gemini-2.5-flash",       // Primary model - stable and available
  "gemini-1.5-flash",       // Fallback option
  "gemini-1.5-pro",         // Last resort
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
    
    const videoHint =
      body.videoUrls && body.videoUrls.length > 0
        ? `Video evidence is available at: ${body.videoUrls.slice(0, 3).join(
            ", "
          )}. Evaluate delivery, lip sync, voice clarity, confidence, body language, and timing using the video.`
        : `No video provided. Infer delivery and speaking style from the transcript only.`;

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] request received", {
        hasTranscript: !!body.transcript,
        hasQuestion: !!body.question,
        videoCount: body.videoUrls?.length || 0,
        durationSec: body.durationSec || 0,
      });
    }

    // Try to inline the first video (if small enough) so Gemini can actually see it
    let videoInlinePart: any | null = null;
    const firstVideoUrl = body.videoUrls?.[0];
    if (firstVideoUrl) {
      try {
        const videoResp = await fetch(firstVideoUrl);
        if (!videoResp.ok) {
          throw new Error(`Failed to fetch video: status ${videoResp.status}`);
        }
        const buf = Buffer.from(await videoResp.arrayBuffer());
        if (buf.byteLength <= MAX_VIDEO_BYTES) {
          videoInlinePart = {
            inlineData: {
              data: buf.toString("base64"),
              mimeType: videoResp.headers.get("Content-Type") || "video/webm",
            },
          };
          if (process.env.NODE_ENV === "development") {
            console.log("[analyze] inlining video", {
              bytes: buf.byteLength,
              mimeType: videoResp.headers.get("Content-Type"),
            });
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn("[analyze] video too large to inline", {
              bytes: buf.byteLength,
              cap: MAX_VIDEO_BYTES,
            });
          }
        }
      } catch (videoErr: any) {
        const errorMessage = videoErr?.message || String(videoErr);
        console.error("[analyze] video fetch/inline failed", errorMessage);
      }
    }

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
You are an expert interview coach. Analyze this interview answer and provide concise feedback.

Question: ${body.question}
Framework: ${body.framework || "None provided"}
Transcript: ${body.transcript}
${videoHint}
If video is available, consider speaking pace, pauses, filler words, articulation, lip sync, confidence, posture, gaze, and timing.

Return JSON ONLY in this exact shape:
{
  "score": number 0-10,
  "feedback": "2 sentences",
  "improvements": ["item1", "item2", "item3"],
  "multimodal": {
    "overall_score": number 0-10,
    "delivery": { "score": number 0-10, "notes": "string", "suggestions": ["", ""] },
    "voice": { "score": number 0-10, "notes": "string", "suggestions": ["", ""] },
    "confidence": { "score": number 0-10, "notes": "string", "suggestions": ["", ""] },
    "timing": { "score": number 0-10, "notes": "string", "suggestions": ["", ""] },
    "body_language": { "score": number 0-10, "notes": "string", "suggestions": ["", ""] },
    "top_improvements": ["", "", ""]
  }
}

Rules:
- Always return valid JSON parsable by JSON.parse.
- Keep suggestions concise and actionable.
`;

    // Retry on transient Gemini errors (e.g., 503 overloaded)
    let result;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const parts: any[] = [];
        if (videoInlinePart) {
          parts.push(videoInlinePart);
        }
        parts.push({ text: prompt });

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
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
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

    // Normalize parsed response
    const response = {
      score: typeof parsed.score === "number" ? parsed.score : 5,
      feedback: parsed.feedback || "Good effort! Keep practicing.",
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.slice(0, 3)
        : ["Practice speaking more confidently", "Use specific examples", "Improve structure"],
      multimodal: parsed.multimodal || null,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] response normalized", {
        hasMultimodal: !!response.multimodal,
        multimodalKeys: response.multimodal ? Object.keys(response.multimodal) : [],
        improvementsCount: response.improvements.length,
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

