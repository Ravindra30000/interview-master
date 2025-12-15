const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually"];

export interface AnswerMetrics {
  confidence: number; // 0-1 (placeholder, can be improved with face analysis)
  clarity: number; // 0-1 (based on vocabulary variety)
  fillerWords: number; // 0-1 (1 = none, lower if many)
  structure: number; // 0-1
  length: number; // 0-1 (relative to target length)
}

export function analyzeAnswerLocally(
  transcript: string,
  answerFramework: string,
  targetWordCount = 120
): AnswerMetrics {
  const text = transcript || "";
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Filler detection
  let fillerCount = 0;
  for (const f of FILLER_WORDS) {
    const regex = new RegExp(`\\b${f}\\b`, "gi");
    fillerCount += (text.match(regex) || []).length;
  }
  const fillerScore = Math.max(0, 1 - fillerCount / 10); // degrade with more fillers

  // Length score: closer to targetWordCount is better up to a point
  const lengthScore = Math.min(wordCount / targetWordCount, 1);

  // Clarity: unique word ratio
  const unique = new Set(words.map((w) => w.toLowerCase())).size || 1;
  const clarity = Math.min(unique / (wordCount || 1), 1);

  // Structure: very light heuristic using framework parts count
  const parts = answerFramework.split("→").map((p) => p.trim());
  let structureScore = 0.5;
  if (parts.length >= 2 && wordCount > 50) structureScore = 0.7;
  if (parts.length >= 3 && wordCount > 100) structureScore = 0.9;

  // Confidence: placeholder constant (could be improved with video cues)
  const confidence = 0.7;

  return {
    confidence,
    clarity,
    fillerWords: fillerScore,
    structure: structureScore,
    length: lengthScore,
  };
}

export function toTenPointScore(metrics: AnswerMetrics): number {
  const weights = {
    confidence: 0.25,
    clarity: 0.25,
    structure: 0.2,
    fillerWords: 0.15,
    length: 0.15,
  };
  const score =
    metrics.confidence * weights.confidence +
    metrics.clarity * weights.clarity +
    metrics.structure * weights.structure +
    metrics.fillerWords * weights.fillerWords +
    metrics.length * weights.length;
  return Math.round(score * 10 * 10) / 10; // 0-10, 1 decimal
}





