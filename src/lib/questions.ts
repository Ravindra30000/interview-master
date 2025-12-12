import type { Question } from "@/types";
import { db } from "./firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

/**
 * Fetch questions from Firestore, with fallback to local JSON
 */
export async function fetchQuestions(): Promise<Question[]> {
  try {
    // Try to fetch from Firestore first
    const questionsRef = collection(db, "questions");
    const q = query(questionsRef, limit(500)); // Limit to prevent huge reads
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const questions: Question[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questions.push({
          id: doc.id,
          role: data.role || "",
          difficulty: data.difficulty || "Mid",
          category: data.category || "Behavioral",
          question: data.question || "",
          answerFramework: data.answerFramework || "",
          redFlags: data.redFlags || [],
          timeLimit: data.timeLimit || 120,
          commonAnswers: data.commonAnswers || [],
        } as Question);
      });

      if (questions.length > 0) {
        console.log(`Loaded ${questions.length} questions from Firestore`);
        return questions;
      }
    }

    // Fallback to local JSON if Firestore is empty or fails
    console.log("Firestore empty or failed, falling back to local JSON");
    const res = await fetch("/questions.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load questions from both Firestore and local JSON");
    }
    const data = await res.json();
    return data.questions as Question[];
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    
    // Final fallback to local JSON
    try {
      const res = await fetch("/questions.json", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load questions");
      }
      const data = await res.json();
      console.log(`Loaded ${data.questions?.length || 0} questions from local JSON (fallback)`);
      return data.questions as Question[];
    } catch (fallbackError: any) {
      const errorMessage = fallbackError?.message || String(fallbackError);
      console.error("Both Firestore and local JSON failed:", errorMessage);
      throw new Error("Failed to load questions. Please ensure questions are imported to Firestore or questions.json exists.");
    }
  }
}

/**
 * Count questions stored in Firestore
 */
export async function countFirestoreQuestions(): Promise<number> {
  try {
    const questionsRef = collection(db, "questions");
    const snapshot = await getDocs(questionsRef);
    return snapshot.size;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error("Error counting Firestore questions:", errorMessage);
    throw error;
  }
}

export function filterQuestions(
  questions: Question[],
  role: string,
  difficulty: string
): Question[] {
  return questions.filter(
    (q) =>
      (!role || q.role.toLowerCase() === role.toLowerCase()) &&
      (!difficulty || q.difficulty.toLowerCase() === difficulty.toLowerCase())
  );
}

// Session-based tracking to avoid showing same questions in same session
const recentQuestionIds = new Set<string>();
const MAX_RECENT_TRACK = 50; // Track last 50 questions shown

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pick random questions with improved randomization, session tracking, and category balancing
 */
export function pickRandomQuestions(questions: Question[], count = 5): Question[] {
  if (questions.length === 0) return [];
  if (questions.length <= count) {
    // If we have fewer questions than requested, return all
    return shuffleArray(questions);
  }

  // Filter out recently shown questions
  const availableQuestions = questions.filter(
    (q) => !recentQuestionIds.has(q.id)
  );

  // If we don't have enough non-recent questions, reset the tracker
  let questionsToPickFrom = availableQuestions;
  if (availableQuestions.length < count) {
    console.log("Not enough non-recent questions, resetting tracker");
    recentQuestionIds.clear();
    questionsToPickFrom = questions;
  }

  // Group by category for balanced selection
  const byCategory: Record<string, Question[]> = {
    Behavioral: [],
    Technical: [],
    "System Design": [],
  };

  questionsToPickFrom.forEach((q) => {
    const category = q.category || "Technical";
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(q);
  });

  // Calculate target distribution (roughly balanced)
  const selected: Question[] = [];
  const categoryCounts = {
    Behavioral: Math.ceil(count * 0.3), // ~30%
    Technical: Math.ceil(count * 0.5), // ~50%
    "System Design": Math.floor(count * 0.2), // ~20%
  };

  // Shuffle each category
  Object.keys(byCategory).forEach((category) => {
    byCategory[category] = shuffleArray(byCategory[category]);
  });

  // Pick from each category
  Object.entries(categoryCounts).forEach(([category, targetCount]) => {
    const categoryQuestions = byCategory[category] || [];
    const toTake = Math.min(targetCount, categoryQuestions.length);
    selected.push(...categoryQuestions.slice(0, toTake));
  });

  // If we still need more questions, fill from remaining
  if (selected.length < count) {
    const remaining = questionsToPickFrom.filter(
      (q) => !selected.find((s) => s.id === q.id)
    );
    const shuffledRemaining = shuffleArray(remaining);
    selected.push(...shuffledRemaining.slice(0, count - selected.length));
  }

  // Shuffle final selection and take only requested count
  const finalSelection = shuffleArray(selected).slice(0, count);

  // Track these questions as recently shown
  finalSelection.forEach((q) => {
    recentQuestionIds.add(q.id);
    // Keep tracker size manageable
    if (recentQuestionIds.size > MAX_RECENT_TRACK) {
      const firstId = Array.from(recentQuestionIds)[0];
      recentQuestionIds.delete(firstId);
    }
  });

  return finalSelection;
}

/**
 * Reset session tracking (call when starting a new practice session)
 */
export function resetQuestionTracking(): void {
  recentQuestionIds.clear();
}

/**
 * Get all unique roles from questions
 */
export function getAvailableRoles(questions: Question[]): string[] {
  const roles = new Set<string>();
  questions.forEach((q) => {
    if (q.role) {
      roles.add(q.role);
    }
  });
  return Array.from(roles).sort();
}


