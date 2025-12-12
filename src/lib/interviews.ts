import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, setDoc, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import type { Interview } from "@/types";

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
    const interviewData = {
      userId,
      role: session.role,
      difficulty: session.difficulty,
      questions: session.questions,
      analysis: analysis || session.analysis || null,
      multimodalAnalysis: multimodalAnalysis || session.multimodalAnalysis || null,
      createdAt: Timestamp.now(),
      localScore: session.questions.reduce(
        (sum, q) => sum + (q.localScore || 0),
        0
      ) / session.questions.length,
    };

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

    return docId;
  } catch (error: any) {
    console.error("Error saving interview:", error);
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
      return null;
    }

    const data = docSnap.data();
    const questions = data.questions || [];
    const firstQuestion = questions[0] || {};
    
    return {
      id: docSnap.id,
      userId,
      role: data.role,
      difficulty: data.difficulty,
      question: firstQuestion.question || "",
      transcript: questions.map((q: any) => q.transcript).join("\n\n") || "",
      videoUrl: firstQuestion.videoUrl || data.videoUrl || undefined, // Support both old and new format
      createdAt: data.createdAt?.toDate() || new Date(),
      localMetrics: firstQuestion.localMetrics,
      analysis: data.analysis
        ? {
            score: data.analysis.score,
            feedback: data.analysis.feedback,
            improvements: data.analysis.improvements || [],
            analyzedAt: data.analysis.analyzedAt?.toDate() || new Date(),
          }
        : undefined,
      multimodalAnalysis: data.multimodalAnalysis || undefined,
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
    console.error("Error fetching interview:", error);
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
      
      interviews.push({
        id: doc.id,
        userId,
        role: data.role,
        difficulty: data.difficulty,
        question: firstQuestion.question || "",
        transcript: questions.map((q: any) => q.transcript).join("\n\n") || "",
        videoUrl: firstQuestion.videoUrl || data.videoUrl || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        localMetrics: firstQuestion.localMetrics,
        analysis: data.analysis
          ? {
              score: data.analysis.score,
              feedback: data.analysis.feedback,
              improvements: data.analysis.improvements || [],
              analyzedAt: data.analysis.analyzedAt?.toDate() || new Date(),
            }
          : undefined,
        multimodalAnalysis: data.multimodalAnalysis || undefined,
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
    console.error("Error fetching interviews:", error);
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
      
      interviews.push({
        id: doc.id,
        userId,
        role: data.role,
        difficulty: data.difficulty,
        question: firstQuestion.question || "",
        transcript: questions.map((q: any) => q.transcript).join("\n\n") || "",
        videoUrl: firstQuestion.videoUrl || data.videoUrl || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        localMetrics: firstQuestion.localMetrics,
        analysis: data.analysis
          ? {
              score: data.analysis.score,
              feedback: data.analysis.feedback,
              improvements: data.analysis.improvements || [],
              analyzedAt: data.analysis.analyzedAt?.toDate() || new Date(),
            }
          : undefined,
        multimodalAnalysis: data.multimodalAnalysis || undefined,
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
    console.error("Error fetching all interviews:", error);
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
      averageScore: scores.length > 0
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


