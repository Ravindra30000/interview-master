import { generateAvatarResponse } from "@/lib/gemini";
import type { ConversationMessage } from "@/types/realtime";
import type { GeminiAvatarResponse } from "@/lib/gemini";

export interface AvatarResponse {
  text: string;
  emotion: string;
  videoUrl: string | null;
  audioUrl: string | null;
  nextQuestion?: string;
  readyToAdvance: boolean;
}

/**
 * Process user answer and generate avatar response
 */
export async function processUserAnswer(
  userTranscript: string,
  conversationHistory: ConversationMessage[]
): Promise<AvatarResponse> {
  // Call Gemini to get avatar response
  const geminiResponse: GeminiAvatarResponse = await generateAvatarResponse(
    conversationHistory,
    userTranscript
  );

  // Return structured response
  return {
    text: geminiResponse.text,
    emotion: geminiResponse.emotion,
    videoUrl: null, // Will be set by API route after TTS and video selection
    audioUrl: null, // Will be set by API route after TTS
    nextQuestion: geminiResponse.nextQuestion,
    readyToAdvance: geminiResponse.readyToAdvance ?? false,
  };
}
