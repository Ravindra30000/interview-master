import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import type { Timestamp as FirestoreTimestamp } from "firebase/firestore";
import type { Interview } from "@/types";

/**
 * Safely convert Firestore Timestamp to Date
 * Handles cases where timestamp might already be converted, null, or different type
 */
function safeToDate(timestamp: any): Date {
  if (!timestamp) {
    return new Date();
  }

  // If it's already a Date, return it
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // If it's a Firestore Timestamp, convert it
  if (timestamp && typeof timestamp.toDate === "function") {
    try {
      return timestamp.toDate();
    } catch (err) {
      console.warn("[interviews] Timestamp conversion error:", err);
      return new Date();
    }
  }

  // If it's a number (milliseconds), convert it
  if (typeof timestamp === "number") {
    return new Date(timestamp);
  }

  // If it's a string, try to parse it
  if (typeof timestamp === "string") {
    const parsed = new Date(timestamp);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback to current date
  return new Date();
}

/**
 * Recursively remove undefined values from an object
 * Firestore does not support undefined values, so we need to clean them
 */
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedValues(item));
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Validate multimodal analysis data structure
 */
function validateMultimodalData(multimodal: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!multimodal || typeof multimodal !== "object") {
    errors.push("Multimodal data is not an object");
    return { valid: false, errors };
  }

  if (Array.isArray(multimodal)) {
    errors.push("Multimodal data cannot be an array");
    return { valid: false, errors };
  }

  // Check for required top-level fields
  if (typeof multimodal.overall_score !== "number") {
    errors.push("Missing or invalid overall_score");
  }

  return { valid: errors.length === 0, errors };
}

export interface InterviewSession {
  role: string;
  difficulty: string;
  questions: Array<{
    question: string;
    transcript: string;
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
  analysis?: {
    score: number;
    feedback: string;
    improvements: string[];
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
}

/**
 * Save a complete interview session to Firestore
 * @param interviewId - Optional interview ID. If not provided, Firestore will generate one.
 */
export async function saveInterviewSession(
  userId: string,
  session: InterviewSession,
  analysis?: { score: number; feedback: string; improvements: string[] },
  multimodalAnalysis?: Interview["multimodalAnalysis"],
  interviewId?: string
): Promise<string> {
  try {
    // Log multimodal data before processing
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[interviews] saveInterviewSession - multimodal data received:",
        {
          hasMultimodal: !!multimodalAnalysis,
          keys: multimodalAnalysis ? Object.keys(multimodalAnalysis) : [],
          overallScore: multimodalAnalysis?.overall_score,
        }
      );
    }

    // Validate multimodal data if provided
    if (multimodalAnalysis) {
      const validation = validateMultimodalData(multimodalAnalysis);
      if (!validation.valid) {
        console.warn(
          "[interviews] Multimodal data validation failed:",
          validation.errors
        );
      }
    }

    // Build interview data object
    const rawInterviewData = {
      userId,
      role: session.role,
      difficulty: session.difficulty,
      questions: session.questions,
      analysis: analysis || session.analysis || null,
      multimodalAnalysis:
        multimodalAnalysis || session.multimodalAnalysis || null,
      createdAt: Timestamp.now(),
      localScore:
        session.questions.reduce((sum, q) => sum + (q.localScore || 0), 0) /
        session.questions.length,
    };

    // Clean undefined values from entire object
    const interviewData = removeUndefinedValues(rawInterviewData);

    // Log cleaned data before saving
    if (process.env.NODE_ENV === "development") {
      console.log("[interviews] Data before saving:", {
        hasMultimodal: !!interviewData.multimodalAnalysis,
        multimodalKeys: interviewData.multimodalAnalysis
          ? Object.keys(interviewData.multimodalAnalysis)
          : [],
        hasAnalysis: !!interviewData.analysis,
        questionsCount: interviewData.questions?.length || 0,
      });
    }

    let docId: string;

    if (interviewId) {
      // Use provided ID
      const docRef = doc(db, "users", userId, "interviews", interviewId);
      await setDoc(docRef, interviewData);
      docId = interviewId;
    } else {
      // Let Firestore generate ID
      const docRef = await addDoc(
        collection(db, "users", userId, "interviews"),
        interviewData
      );
      docId = docRef.id;
    }

    // Verify data was saved correctly by fetching it back
    try {
      const verifyRef = doc(db, "users", userId, "interviews", docId);
      const verifySnap = await getDoc(verifyRef);

      if (verifySnap.exists()) {
        const savedData = verifySnap.data();
        if (process.env.NODE_ENV === "development") {
          console.log("[interviews] Verification after save:", {
            docId,
            hasMultimodal: !!savedData.multimodalAnalysis,
            multimodalKeys: savedData.multimodalAnalysis
              ? Object.keys(savedData.multimodalAnalysis)
              : [],
            multimodalType: typeof savedData.multimodalAnalysis,
            isArray: Array.isArray(savedData.multimodalAnalysis),
            overallScore: savedData.multimodalAnalysis?.overall_score,
          });
        }
      } else {
        console.warn(
          "[interviews] Verification failed: document does not exist after save"
        );
      }
    } catch (verifyError: any) {
      console.warn(
        "[interviews] Verification error (non-critical):",
        verifyError?.message
      );
    }

    return docId;
  } catch (error: any) {
    console.error("[interviews] Error saving interview:", error);
    console.error("[interviews] Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    throw new Error(`Failed to save interview: ${error.message}`);
  }
}

/**
 * Get a single interview by ID
 */
export async function getInterview(
  userId: string,
  interviewId: string
): Promise<Interview | null> {
  try {
    const docRef = doc(db, "users", userId, "interviews", interviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[interviews] getInterview - document does not exist:",
          interviewId
        );
      }
      return null;
    }

    const data = docSnap.data();
    const questions = data.questions || [];
    const firstQuestion = questions[0] || {};

    // CRITICAL: Extract multimodal data FIRST before any timestamp conversions
    // This ensures multimodal data is always extracted even if timestamp conversion fails
    let extractedMultimodal: Interview["multimodalAnalysis"] = undefined;
    if (
      data.multimodalAnalysis &&
      typeof data.multimodalAnalysis === "object" &&
      !Array.isArray(data.multimodalAnalysis) &&
      data.multimodalAnalysis !== null
    ) {
      extractedMultimodal =
        data.multimodalAnalysis as Interview["multimodalAnalysis"];

      if (process.env.NODE_ENV === "development" && extractedMultimodal) {
        console.log("[interviews] getInterview - extracted multimodal:", {
          hasMultimodal: !!extractedMultimodal,
          keys: Object.keys(extractedMultimodal),
          overallScore: extractedMultimodal.overall_score,
          hasEyeContact: !!extractedMultimodal.eye_contact,
          hasBodyLanguagePatterns: !!extractedMultimodal.body_language_patterns,
          hasProfessionalPresentation:
            !!extractedMultimodal.professional_presentation,
        });
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[interviews] getInterview - multimodal data invalid or missing:",
          {
            exists: !!data.multimodalAnalysis,
            type: typeof data.multimodalAnalysis,
            isArray: Array.isArray(data.multimodalAnalysis),
            isNull: data.multimodalAnalysis === null,
          }
        );
      }
    }

    // Log raw Firestore data for debugging (after multimodal extraction)
    if (process.env.NODE_ENV === "development") {
      console.log("[interviews] getInterview - raw Firestore data:", {
        interviewId,
        hasMultimodal: !!data.multimodalAnalysis,
        multimodalType: typeof data.multimodalAnalysis,
        isArray: Array.isArray(data.multimodalAnalysis),
        isNull: data.multimodalAnalysis === null,
        multimodalKeys: data.multimodalAnalysis
          ? Object.keys(data.multimodalAnalysis)
          : [],
        extractedMultimodalKeys: extractedMultimodal
          ? Object.keys(extractedMultimodal)
          : [],
      });
    }

    // Safe timestamp conversion with error handling
    let createdAtDate: Date;
    try {
      createdAtDate = safeToDate(data.createdAt);
    } catch (err: any) {
      console.warn("[interviews] Error converting createdAt:", err?.message);
      createdAtDate = new Date();
    }

    // Safe analysis timestamp conversion
    let analyzedAtDate: Date | undefined;
    if (data.analysis?.analyzedAt) {
      try {
        analyzedAtDate = safeToDate(data.analysis.analyzedAt);
      } catch (err: any) {
        console.warn("[interviews] Error converting analyzedAt:", err?.message);
        analyzedAtDate = new Date();
      }
    }

    return {
      id: docSnap.id,
      userId,
      role: data.role,
      difficulty: data.difficulty,
      question: firstQuestion.question || "",
      transcript: questions.map((q: any) => q.transcript).join("\n\n") || "",
      videoUrl: firstQuestion.videoUrl || data.videoUrl || undefined, // Support both old and new format
      createdAt: createdAtDate,
      localMetrics: firstQuestion.localMetrics,
      analysis: data.analysis
        ? {
            score: data.analysis.score,
            feedback: data.analysis.feedback,
            improvements: data.analysis.improvements || [],
            analyzedAt: analyzedAtDate || new Date(),
          }
        : undefined,
      multimodalAnalysis: extractedMultimodal,
      // Store all questions with their video URLs
      questions: questions.map((q: any) => ({
        question: q.question,
        transcript: q.transcript,
        videoUrl: q.videoUrl,
        duration: q.duration,
        localMetrics: q.localMetrics,
        localScore: q.localScore,
      })),
    };
  } catch (error: any) {
    console.error("[interviews] Error fetching interview:", error);
    console.error("[interviews] Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    throw new Error(`Failed to fetch interview: ${error.message}`);
  }
}

/**
 * Get recent interviews for a user
 */
export async function getRecentInterviews(
  userId: string,
  limitCount: number = 10
): Promise<Interview[]> {
  try {
    const q = query(
      collection(db, "users", userId, "interviews"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const interviews: Interview[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const questions = data.questions || [];
      const firstQuestion = questions[0] || {};

      // Properly extract multimodalAnalysis with type checking
      let extractedMultimodal: Interview["multimodalAnalysis"] = undefined;
      if (
        data.multimodalAnalysis &&
        typeof data.multimodalAnalysis === "object" &&
        !Array.isArray(data.multimodalAnalysis) &&
        data.multimodalAnalysis !== null
      ) {
        extractedMultimodal =
          data.multimodalAnalysis as Interview["multimodalAnalysis"];
      }

      interviews.push({
        id: doc.id,
        userId,
        role: data.role,
        difficulty: data.difficulty,
        question: firstQuestion.question || "",
        transcript: questions.map((q: any) => q.transcript).join("\n\n") || "",
        videoUrl: firstQuestion.videoUrl || data.videoUrl || undefined,
        createdAt: safeToDate(data.createdAt),
        localMetrics: firstQuestion.localMetrics,
        analysis: data.analysis
          ? {
              score: data.analysis.score,
              feedback: data.analysis.feedback,
              improvements: data.analysis.improvements || [],
              analyzedAt: safeToDate(data.analysis.analyzedAt),
            }
          : undefined,
        multimodalAnalysis: extractedMultimodal,
        questions: questions.map((q: any) => ({
          question: q.question,
          transcript: q.transcript,
          videoUrl: q.videoUrl,
          duration: q.duration,
          localMetrics: q.localMetrics,
          localScore: q.localScore,
        })),
      });
    });

    return interviews;
  } catch (error: any) {
    console.error("[interviews] Error fetching interviews:", error);
    return [];
  }
}

/**
 * Get all interviews for a user (for filtering/search)
 */
export async function getAllInterviews(userId: string): Promise<Interview[]> {
  try {
    const q = query(
      collection(db, "users", userId, "interviews"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const interviews: Interview[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const questions = data.questions || [];
      const firstQuestion = questions[0] || {};

      // Properly extract multimodalAnalysis with type checking
      let extractedMultimodal: Interview["multimodalAnalysis"] = undefined;
      if (
        data.multimodalAnalysis &&
        typeof data.multimodalAnalysis === "object" &&
        !Array.isArray(data.multimodalAnalysis) &&
        data.multimodalAnalysis !== null
      ) {
        extractedMultimodal =
          data.multimodalAnalysis as Interview["multimodalAnalysis"];
      }

      interviews.push({
        id: doc.id,
        userId,
        role: data.role,
        difficulty: data.difficulty,
        question: firstQuestion.question || "",
        transcript: questions.map((q: any) => q.transcript).join("\n\n") || "",
        videoUrl: firstQuestion.videoUrl || data.videoUrl || undefined,
        createdAt: safeToDate(data.createdAt),
        localMetrics: firstQuestion.localMetrics,
        analysis: data.analysis
          ? {
              score: data.analysis.score,
              feedback: data.analysis.feedback,
              improvements: data.analysis.improvements || [],
              analyzedAt: safeToDate(data.analysis.analyzedAt),
            }
          : undefined,
        multimodalAnalysis: extractedMultimodal,
        questions: questions.map((q: any) => ({
          question: q.question,
          transcript: q.transcript,
          videoUrl: q.videoUrl,
          duration: q.duration,
          localMetrics: q.localMetrics,
          localScore: q.localScore,
        })),
      });
    });

    return interviews;
  } catch (error: any) {
    console.error("[interviews] Error fetching all interviews:", error);
    return [];
  }
}

/**
 * Get interview statistics for a user
 */
export async function getInterviewStats(userId: string): Promise<{
  totalInterviews: number;
  averageScore: number;
  recentScores: number[];
}> {
  try {
    const q = query(
      collection(db, "users", userId, "interviews"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const interviews = querySnapshot.docs.map((doc) => doc.data());

    const scores = interviews
      .map((i) => i.analysis?.score || i.localScore)
      .filter((s): s is number => typeof s === "number");

    return {
      totalInterviews: interviews.length,
      averageScore:
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0,
      recentScores: scores.slice(0, 10),
    };
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return {
      totalInterviews: 0,
      averageScore: 0,
      recentScores: [],
    };
  }
}
