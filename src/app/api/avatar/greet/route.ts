import { NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/textToSpeech";
import { generateAvatarVideo } from "@/lib/avatarGeneration";
import { getAvatarVideo } from "@/lib/avatarVideos";

export const dynamic = "force-dynamic";

interface RequestBody {
  sessionId: string;
  role?: string;
  difficulty?: string;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { sessionId, role, difficulty } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Generate greeting text based on role and difficulty
    const roleText = role || "this position";
    const difficultyText = difficulty ? ` (${difficulty} level)` : "";
    const greetingText = `Hello! I'm your interviewer today. Welcome to your interview for ${roleText}${difficultyText}. I'm here to help you practice and improve. Let's begin with the first question.`;

    // Generate TTS audio
    const audioBuffer = await synthesizeSpeech({
      text: greetingText,
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
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Cost-saving toggle: use pre-recorded videos only
    const usePrerecorded = process.env.USE_PRERECORDED_AVATAR === "true";

    const getFallbackVideo = () => {
      const avatarVideo =
        getAvatarVideo("encouraging" as any, "speaking") ||
        getAvatarVideo("neutral" as any, "speaking") ||
        getAvatarVideo("neutral" as any, "idle");
      return avatarVideo?.url || null;
    };

    let videoUrl: string | null = null;

    if (usePrerecorded) {
      videoUrl = getFallbackVideo();
      return NextResponse.json({
        videoUrl,
        audioUrl,
        text: greetingText,
        fallbackUsed: true,
      });
    }

    // Generate avatar video with lip-sync
    try {
      const avatarResult = await generateAvatarVideo({
        text: greetingText,
        audioBuffer: audioBuffer,
        emotion: "encouraging",
      });
      videoUrl = avatarResult.videoUrl;
      console.log(
        `[api/avatar/greet] Generated greeting video in ${avatarResult.generationTime}ms using ${avatarResult.provider}`
      );
    } catch (avatarError: any) {
      console.error(
        "[api/avatar/greet] Avatar generation failed, using pre-recorded fallback:",
        avatarError?.message || avatarError
      );
      videoUrl = getFallbackVideo();
    }

    return NextResponse.json({
      videoUrl,
      audioUrl,
      text: greetingText,
      fallbackUsed: !videoUrl,
    });
  } catch (error: any) {
    console.error("[api/avatar/greet] Error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to generate greeting",
        details:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
