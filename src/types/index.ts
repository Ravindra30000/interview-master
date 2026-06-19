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
    emotions: { score: number; notes: string; suggestions: string[] };
    confidence: { score: number; notes: string; suggestions: string[] };
    body_language: { score: number; notes: string; suggestions: string[] };
    delivery: { score: number; notes: string; suggestions: string[] };
    voice: { score: number; notes: string; suggestions: string[] };
    timing: { score: number; notes: string; suggestions: string[] };
    lip_sync: { score: number; notes: string; suggestions: string[] };
    eye_contact?: {
      score: number;
      percentage_at_camera: number;
      frequency_looking_away: "low" | "medium" | "high";
      notes: string;
      suggestions: string[];
    };
    body_language_patterns?: {
      gesture_frequency: "low" | "medium" | "high";
      posture_consistency: "consistent" | "variable" | "inconsistent";
      movement_level: "still" | "moderate" | "excessive";
      notes: string;
      suggestions: string[];
    };
    professional_presentation?: {
      score: number;
      environment_quality: "excellent" | "good" | "fair" | "poor";
      appearance: "professional" | "casual" | "needs_improvement";
      notes: string;
      suggestions: string[];
    };
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

// Avatar Persona Types (for Company Customization)
export interface AvatarPersona {
  id: string;
  type: "system" | "company"; // System = default, Company = custom
  createdBy: string; // User ID of creator
  companyId?: string; // Company ID if type is "company"

  // Identity
  name: string;
  role: string; // e.g., "Senior Hiring Manager"
  companyName?: string;

  // Appearance (for video generation)
  appearance: {
    ethnicity?: string; // Optional: influences appearance
    gender?: "male" | "female" | "neutral";
    ageRange?: "young" | "mid" | "senior";
    style?: "casual" | "professional" | "formal";
  };

  // Behavior
  behavior: {
    pace: "slow" | "normal" | "fast"; // Speech rate
    formality: "casual" | "professional";
    encouragement: "supportive" | "neutral" | "challenging";
    gestures: boolean; // Show hand movements
    eyeContact: boolean; // Look directly at camera
  };

  // Instructions (for Gemini)
  instructions: {
    systemPrompt: string; // How avatar should behave
    evaluationCriteria: string[]; // What to assess
    followUpStrategy: string; // How to probe deeper
  };

  // Interview Config
  interviewConfig: {
    duration: number; // minutes
    questionCount: number;
    allowFollowUps: boolean;
    scoringEnabled: boolean;
  };

  // API-specific IDs
  apiConfig: {
    provider: "did" | "heygen";
    avatarId?: string; // Provider-specific avatar ID
    presenterId?: string; // D-ID presenter ID
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  domain?: string; // Company domain/website
  logoUrl?: string;
  createdAt: Date;
  createdBy: string; // User ID of company admin
  avatarPersonas: string[]; // Array of AvatarPersona IDs
  settings: {
    allowPublicPractice: boolean; // Can candidates practice with company avatar
    requireInvitation: boolean; // Require invitation to interview
  };
}
