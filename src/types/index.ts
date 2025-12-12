// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  preferences?: {
    favoriteRole?: string;
    difficulty?: string;
    language?: string;
  };
}

// Question Types
export interface Question {
  id: string;
  role: string;
  difficulty: "Junior" | "Mid" | "Senior";
  category: "Behavioral" | "Technical" | "System Design";
  question: string;
  answerFramework: string;
  redFlags: string[];
  timeLimit: number;
  commonAnswers?: string[];
}

// Interview Types
export interface Interview {
  id: string;
  userId: string;
  role: string;
  difficulty: string;
  question: string;
  transcript: string;
  videoUrl?: string; // Legacy: first question's video URL
  createdAt: Date;
  localMetrics?: {
    confidence: number;
    clarity: number;
    fillerWords: number;
    structure: number;
    length: number;
  };
  analysis?: {
    score: number;
    feedback: string;
    improvements: string[];
    analyzedAt: Date;
  };
  multimodalAnalysis?: {
    overall_score: number;
    delivery: { score: number; notes: string; suggestions: string[] };
    voice: { score: number; notes: string; suggestions: string[] };
    confidence: { score: number; notes: string; suggestions: string[] };
    timing: { score: number; notes: string; suggestions: string[] };
    body_language: { score: number; notes: string; suggestions: string[] };
    top_improvements: string[];
  };
  questions?: Array<{
    question: string;
    transcript: string;
    videoUrl?: string | null;
    duration: number;
    localMetrics?: {
      confidence: number;
      clarity: number;
      fillerWords: number;
      structure: number;
      length: number;
    };
    localScore?: number;
  }>;
}

// Answer Metrics
export interface AnswerMetrics {
  confidence: number;
  clarity: number;
  length: number;
  fillerWords: number;
  structure: number;
}

// Avatar Expression
export interface AvatarExpression {
  mood: "neutral" | "encouraging" | "concerned" | "thinking";
  eyeOpen: number;
  eyebrowAngle: number;
  mouthOpen: number;
}


