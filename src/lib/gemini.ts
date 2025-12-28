import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AvatarEmotion } from "@/types/realtime";
import type { ConversationMessage } from "@/types/realtime";

export interface GeminiAvatarResponse {
  text: string;
  emotion: AvatarEmotion;
  nextQuestion?: string;
  followUp?: boolean;
  readyToAdvance?: boolean;
}

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (genAI) return genAI;

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY for Gemini.");
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

function buildConversationSummary(history: ConversationMessage[]): string {
  if (!history.length) {
    return "No previous conversation. This is the first turn.";
  }

  const recent = history.slice(-6); // last 6 turns max
  const lines = recent.map((m) => {
    const who = m.role === "user" ? "User" : "Avatar";
    return `${who}: ${m.text}`;
  });

  return lines.join("\n");
}

export async function generateAvatarResponse(
  history: ConversationMessage[],
  userTranscript: string
): Promise<GeminiAvatarResponse> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const conversationSummary = buildConversationSummary(history);

  const prompt = `
You are a friendly, concise interview coach avatar helping a candidate practice.

CONTEXT
--------
Recent conversation:
${conversationSummary}

The candidate just answered a question with:
"""${userTranscript}"""

TASK
-----
1. Briefly respond to the candidate with encouraging but honest feedback in natural conversational style.
2. Decide whether to ask a follow-up question or move to the next main question.
3. Choose an emotion for your avatar based on your response:
   - "neutral"      → calm, professional
   - "encouraging"  → supportive, positive
   - "thinking"     → reflective, probing deeper
   - "concerned"    → gently challenging or pushing for clarification

OUTPUT
-------
Return ONLY JSON parsable by JSON.parse in this shape:
{
  "text": "what the avatar says to the candidate",
  "emotion": "neutral" | "encouraging" | "thinking" | "concerned",
  "nextQuestion": "the next question to ask, or empty string if none",
  "followUp": boolean,  // true if you are asking a follow-up question
  "readyToAdvance": boolean  // true if satisfied and ready to move to next main question
}

Rules:
- Keep "text" under 4 sentences.
- Always set a valid emotion string from the allowed list.
- When you are satisfied with the candidate's answer and ready to move to the next main question:
  * Explicitly say something like "Great answer! Now we can move to the next question" or "Perfect! Let's move on to the next question"
  * Set "readyToAdvance": true
  * Set "nextQuestion": "" (empty string, since we're moving to next main question)
  * Set "followUp": false
- When asking a follow-up question (not satisfied yet):
  * Set "readyToAdvance": false
  * Provide the follow-up question in "nextQuestion"
  * Set "followUp": true
- If you don't want to ask anything else now but aren't ready to advance, set "nextQuestion" to "", "followUp" to false, and "readyToAdvance" to false.
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const rawText = result.response.text();
  let cleaned = rawText.trim();

  // Strip potential markdown code fences
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/g, "");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("[gemini] Failed to parse avatar response JSON", {
      rawText,
      cleaned,
      error: err,
    });
    throw new Error("Gemini did not return valid JSON for avatar response.");
  }

  const emotion = (parsed.emotion || "neutral") as AvatarEmotion;
  const validEmotions: AvatarEmotion[] = [
    "neutral",
    "encouraging",
    "thinking",
    "concerned",
  ];
  const safeEmotion = validEmotions.includes(emotion) ? emotion : "neutral";

  const response: GeminiAvatarResponse = {
    text: String(parsed.text || "").trim() || "Thanks for your answer.",
    emotion: safeEmotion,
    nextQuestion:
      typeof parsed.nextQuestion === "string" ? parsed.nextQuestion : "",
    followUp: Boolean(parsed.followUp),
    readyToAdvance: Boolean(parsed.readyToAdvance),
  };

  return response;
}
