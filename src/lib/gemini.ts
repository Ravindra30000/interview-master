import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnswerMetrics } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeInterviewAnswer(
  question: string,
  answer: string,
  framework: string,
  localMetrics: AnswerMetrics
): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
}> {
  // Try Gemini 3 Pro first, fallback to Gemini 2.5 Flash
  let model = genAI.getGenerativeModel({ model: "gemini-3-pro" });

  const prompt = `
You are an expert interview coach. Analyze this interview answer and provide feedback.

QUESTION: "${question}"
ANSWER FRAMEWORK: "${framework}"
USER'S ANSWER: "${answer}"

Local Metrics (already calculated):
- Confidence: ${localMetrics.confidence}/1.0
- Clarity: ${localMetrics.clarity}/1.0
- Structure: ${localMetrics.structure}/1.0
- Filler Words Score: ${localMetrics.fillerWords}/1.0
- Answer Length: ${localMetrics.length}/1.0

Provide your response in this exact format:
SCORE: [0-10]
FEEDBACK: [2-3 sentences of constructive feedback]
IMPROVEMENTS:
- [specific improvement 1]
- [specific improvement 2]
- [specific improvement 3]

Be encouraging but honest. Focus on actionable improvements.
`;

  try {
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (modelError: any) {
      // If primary model fails (e.g., not found), try fallback
      if (modelError?.message?.includes("404") || modelError?.message?.includes("not found")) {
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        result = await model.generateContent(prompt);
      } else {
        throw modelError;
      }
    }
    const text = result.response.text();

    // Parse the response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*?)IMPROVEMENTS:/);
    const improvementsText = text.match(/IMPROVEMENTS:([\s\S]*?)$/)?.[1] || "";

    return {
      score: parseInt(scoreMatch?.[1] || "5"),
      feedback: feedbackMatch?.[1]?.trim() || "Great effort! Keep practicing.",
      improvements: improvementsText
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^-\s*/, "").trim())
        .filter((line) => line.length > 0),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze answer. Please try again.");
  }
}

