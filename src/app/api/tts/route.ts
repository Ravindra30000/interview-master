import { NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/textToSpeech";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voice, audioConfig } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' parameter" },
        { status: 400 }
      );
    }

    const audioBuffer = await synthesizeSpeech({
      text,
      voice,
      audioConfig,
    });

    // Return audio as base64-encoded data URL
    const base64Audio = audioBuffer.toString("base64");
    const mimeType =
      audioConfig?.audioEncoding === "LINEAR16"
        ? "audio/wav"
        : audioConfig?.audioEncoding === "OGG_OPUS"
        ? "audio/ogg"
        : "audio/mpeg";

    return NextResponse.json({
      audioUrl: `data:${mimeType};base64,${base64Audio}`,
      mimeType,
      size: audioBuffer.length,
    });
  } catch (error: any) {
    console.error("[api/tts] Error generating speech:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to generate speech",
        details:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
