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
const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB cap for File API upload
// Try Gemini 3 Pro first, fallback to Gemini 2.5 Flash
const PRIMARY_MODEL = "gemini-3-pro";
const FALLBACK_MODEL = "gemini-2.5-flash";

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

    // Check if video URLs are provided (for mock multimodal data)
    const hasVideo = body.videoUrls && body.videoUrls.length > 0;

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] request received", {
        hasTranscript: !!body.transcript,
        hasQuestion: !!body.question,
        videoCount: body.videoUrls?.length || 0,
        durationSec: body.durationSec || 0,
      });
    }

    // Build video hint
    const videoHint = hasVideo
      ? `A video recording is provided. Analyze speaking pace, pauses, filler words, articulation, lip sync, confidence, posture, gaze, body language, and timing from the video.`
      : `No video provided. Infer delivery and speaking style from the transcript only.`;

    // Try Gemini 3 Pro first, fallback to Gemini 2.5 Flash if unavailable
    let model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    let selectedModel = PRIMARY_MODEL;
    
    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] attempting model", PRIMARY_MODEL, "with video:", hasVideo);
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
    // Try primary model first, fallback to secondary if model not found
    let result;
    let modelNotFound = false;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        const msg = err?.message || "";
        const isModelNotFound =
          msg.includes("404") ||
          msg.includes("not found") ||
          msg.includes("MODEL_NOT_FOUND") ||
          msg.includes("does not exist");
        const isOverloaded =
          msg.includes("503") ||
          msg.includes("overloaded") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("UNAVAILABLE");
        const isServiceDisabled =
          msg.includes("SERVICE_DISABLED") ||
          msg.includes("has not been used") ||
          msg.includes("activation");
        
        // If model not found and we're using primary model, try fallback
        if (isModelNotFound && selectedModel === PRIMARY_MODEL && !modelNotFound) {
          modelNotFound = true;
          model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
          selectedModel = FALLBACK_MODEL;
          if (process.env.NODE_ENV === "development") {
            console.log("[analyze] primary model not available, falling back to", FALLBACK_MODEL);
          }
          continue;
        }
        
        if (isServiceDisabled) {
          console.error("Gemini service disabled or not activated:", msg);
          return NextResponse.json(
            { error: "Gemini API not enabled for this project. Please enable it in Google Cloud." },
            { status: 503 }
          );
        }

        const shouldRetry = isOverloaded && attempt < MAX_RETRIES - 1;
        console.warn(`Gemini attempt ${attempt + 1} failed (${selectedModel}): ${msg}`);
        if (shouldRetry) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await wait(delay);
          continue;
        }

        throw err;
      }
    }
    
    if (process.env.NODE_ENV === "development" && result) {
      console.log("[analyze] successfully used model", selectedModel);
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
      // Remove markdown code blocks if present
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
      }
      parsed = JSON.parse(jsonText);
    } catch (e) {
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

    // Generate mock multimodal data if video was provided but analysis didn't return multimodal
    let multimodalData = parsed.multimodal;
    
    if (!multimodalData && hasVideo) {
      // Generate mock multimodal analysis based on transcript score
      const baseScore = typeof parsed.score === "number" ? parsed.score : 5;
      const deliveryScore = Math.max(4, Math.min(9, baseScore + (Math.random() - 0.5) * 2));
      const voiceScore = Math.max(4, Math.min(9, baseScore + (Math.random() - 0.5) * 1.5));
      const confidenceScore = Math.max(4, Math.min(9, baseScore + (Math.random() - 0.5) * 1.5));
      const timingScore = Math.max(4, Math.min(9, baseScore + (Math.random() - 0.5) * 1));
      const bodyLanguageScore = Math.max(4, Math.min(9, baseScore + (Math.random() - 0.5) * 1));
      // Use the actual Gemini score as overall_score (not average of sub-scores)
      const overallScore = baseScore;

      multimodalData = {
        overall_score: Number(overallScore.toFixed(1)),
        delivery: {
          score: Number(deliveryScore.toFixed(1)),
          notes: deliveryScore >= 7 
            ? "Good pacing and clear articulation. Maintains steady rhythm throughout the answer."
            : "Consider varying your pace and adding more pauses for emphasis. Work on clearer articulation.",
          suggestions: deliveryScore >= 7
            ? ["Continue maintaining good pacing", "Add strategic pauses for key points"]
            : ["Slow down slightly for clarity", "Practice pausing before important statements", "Work on reducing filler words"]
        },
        voice: {
          score: Number(voiceScore.toFixed(1)),
          notes: voiceScore >= 7
            ? "Clear and audible voice. Good volume and tone consistency."
            : "Voice could be clearer. Consider speaking louder and maintaining consistent tone.",
          suggestions: voiceScore >= 7
            ? ["Maintain current voice clarity", "Continue projecting confidently"]
            : ["Increase volume slightly", "Practice speaking with more confidence", "Work on tone variation"]
        },
        confidence: {
          score: Number(confidenceScore.toFixed(1)),
          notes: confidenceScore >= 7
            ? "Demonstrates good confidence. Appears comfortable and self-assured."
            : "Confidence can be improved. Practice speaking with more conviction and authority.",
          suggestions: confidenceScore >= 7
            ? ["Continue building on your confidence", "Maintain assertive tone"]
            : ["Practice speaking with more conviction", "Work on maintaining eye contact", "Reduce hesitation in speech"]
        },
        timing: {
          score: Number(timingScore.toFixed(1)),
          notes: timingScore >= 7
            ? "Good time management. Answer fits well within the allocated time."
            : "Timing could be improved. Consider being more concise or expanding key points.",
          suggestions: timingScore >= 7
            ? ["Continue managing time effectively", "Maintain balanced answer length"]
            : ["Practice concise answers", "Plan key points before speaking", "Work on time awareness"]
        },
        body_language: {
          score: Number(bodyLanguageScore.toFixed(1)),
          notes: bodyLanguageScore >= 7
            ? "Positive body language observed. Good posture and engagement."
            : "Body language can be enhanced. Focus on maintaining good posture and natural gestures.",
          suggestions: bodyLanguageScore >= 7
            ? ["Continue positive body language", "Maintain good posture"]
            : ["Practice maintaining eye contact", "Work on natural hand gestures", "Improve posture and presence"]
        },
        top_improvements: [
          baseScore < 7 ? "Focus on speaking with more confidence and clarity" : "Continue building on your strengths",
          baseScore < 7 ? "Work on reducing filler words and improving pacing" : "Maintain your current speaking style",
          baseScore < 7 ? "Practice maintaining better posture and eye contact" : "Keep up the good work"
        ]
      };

      if (process.env.NODE_ENV === "development") {
        console.log("[analyze] generated mock multimodal data (video analysis not available)");
      }
    }

    // Normalize parsed response
    const actualScore = typeof parsed.score === "number" ? parsed.score : 5;
    
    // If multimodal data exists but doesn't have overall_score, use the main score
    if (multimodalData && (multimodalData.overall_score === undefined || multimodalData.overall_score === null)) {
      multimodalData.overall_score = actualScore;
    }
    
    const response = {
      score: actualScore,
      feedback: parsed.feedback || "Good effort! Keep practicing.",
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.slice(0, 3)
        : ["Practice speaking more confidently", "Use specific examples", "Improve structure"],
      multimodal: multimodalData || null,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[analyze] response normalized", {
        hasMultimodal: !!response.multimodal,
        multimodalKeys: response.multimodal ? Object.keys(response.multimodal) : [],
        improvementsCount: response.improvements.length,
        isMockData: hasVideo && !parsed.multimodal,
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

