import { NextResponse } from "next/server";
import { processUserAnswer } from "@/lib/avatarConversation";
import { synthesizeSpeech } from "@/lib/textToSpeech";
import { generateAvatarVideo } from "@/lib/avatarGeneration";
import { getAvatarVideo } from "@/lib/avatarVideos";
import type { ConversationMessage } from "@/types/realtime";

export const dynamic = "force-dynamic";

interface RequestBody {
  sessionId: string;
  userTranscript: string;
  conversationHistory: ConversationMessage[];
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { sessionId, userTranscript, conversationHistory } = body;

    if (!userTranscript || !sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId or userTranscript" },
        { status: 400 }
      );
    }

    // Step 1: Get avatar response from Gemini
    const avatarResponse = await processUserAnswer(
      userTranscript,
      conversationHistory
    );

    // Step 2: Generate TTS audio
    let audioUrl: string | null = null;
    let audioBuffer: Buffer | null = null;
    let videoUrl: string | null = null;

    // Cost-saving toggle: use pre-recorded videos only
    const usePrerecorded = process.env.USE_PRERECORDED_AVATAR === "true";

    audioBuffer = await synthesizeSpeech({
      text: avatarResponse.text,
      voice: {
        languageCode: "en-US",
        name: "en-US-Neural2-D",
        ssmlGender: "MALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
      },
    });

    // Convert buffer to base64 data URL for frontend playback
    const base64Audio = audioBuffer.toString("base64");
    audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    const getFallbackVideo = () => {
      const avatarVideo =
        getAvatarVideo(avatarResponse.emotion as any, "speaking") ||
        getAvatarVideo("neutral" as any, "speaking") ||
        getAvatarVideo("neutral" as any, "idle");
      return avatarVideo?.url || null;
    };

    // If configured to use pre-recorded only, short-circuit here
    if (usePrerecorded) {
      videoUrl = getFallbackVideo();
      return NextResponse.json({
        avatarResponse: {
          text: avatarResponse.text,
          emotion: avatarResponse.emotion,
          videoUrl,
          audioUrl,
          readyToAdvance: avatarResponse.readyToAdvance,
        },
        nextQuestion: avatarResponse.nextQuestion,
        fallbackUsed: true,
      });
    }

    // Step 3: Generate avatar video with lip-sync using API, fallback on error
    try {
      const avatarResult = await generateAvatarVideo({
        text: avatarResponse.text,
        audioBuffer: audioBuffer,
        emotion: avatarResponse.emotion,
      });
      videoUrl = avatarResult.videoUrl;
      console.log(
        `[api/avatar/respond] Generated avatar video in ${avatarResult.generationTime}ms using ${avatarResult.provider}`
      );
    } catch (avatarError: any) {
      console.error(
        "[api/avatar/respond] Avatar generation failed, using pre-recorded fallback:",
        avatarError?.message || avatarError
      );
      videoUrl = getFallbackVideo();
    }

    // Return response
    return NextResponse.json({
      avatarResponse: {
        text: avatarResponse.text,
        emotion: avatarResponse.emotion,
        videoUrl,
        audioUrl,
        readyToAdvance: avatarResponse.readyToAdvance,
      },
      nextQuestion: avatarResponse.nextQuestion,
      fallbackUsed: usePrerecorded || !videoUrl,
    });
  } catch (error: any) {
    console.error("[api/avatar/respond] Error:", error);
    
    // Check if it's a 402 Payment Required error (insufficient credits)
    const errorMessage = error?.message || "Failed to generate avatar response";
    const isInsufficientCredits = errorMessage.includes("insufficient credits") || 
                                  errorMessage.includes("402 Payment Required");
    
    return NextResponse.json(
      {
        error: errorMessage,
        errorType: isInsufficientCredits ? "INSUFFICIENT_CREDITS" : "GENERATION_ERROR",
        details:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: isInsufficientCredits ? 402 : 500 }
    );
  }
}
