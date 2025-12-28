import { NextResponse } from "next/server";
import { processUserAnswer } from "@/lib/avatarConversation";
import { synthesizeSpeech } from "@/lib/textToSpeech";
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

    // Step 2: Generate TTS audio and return as data URL
    let audioUrl: string | null = null;
    try {
      const audioBuffer = await synthesizeSpeech({
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

      // Convert buffer to base64 data URL instead of uploading to Storage
      // This avoids server-side authentication issues and works for small audio files
      const base64Audio = audioBuffer.toString("base64");
      audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
    } catch (ttsError: any) {
      console.error("[api/avatar/respond] TTS error:", ttsError);
      // Continue without audio - video can still play
    }

    // Step 3: Select appropriate avatar video based on emotion
    const avatarVideo = getAvatarVideo(
      avatarResponse.emotion as any,
      "speaking"
    );
    const videoUrl = avatarVideo?.url || null;

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
    });
  } catch (error: any) {
    console.error("[api/avatar/respond] Error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to generate avatar response",
        details:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
