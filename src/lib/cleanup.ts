/**
 * Cleanup utilities for deleting old interviews without multimodal analysis
 */

import { db } from "./firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { storage } from "./firebase";
import { ref, listAll, deleteObject } from "firebase/storage";
import { deleteInterviewVideos } from "./storage";
import type { Interview } from "@/types";

export interface InterviewToDelete {
  id: string;
  userId: string;
  role: string;
  difficulty: string;
  createdAt: Date;
  hasMultimodal: boolean;
  hasAnalysis: boolean;
  questionCount: number;
  videoUrls: string[];
}

export interface CleanupResult {
  deletedInterviews: number;
  deletedVideos: number;
  errors: string[];
  totalSpaceFreed: number; // in bytes
}

/**
 * Get all interviews without multimodal analysis
 */
export async function getInterviewsWithoutMultimodal(
  userId: string
): Promise<InterviewToDelete[]> {
  try {
    const interviewsRef = collection(db, "users", userId, "interviews");
    const querySnapshot = await getDocs(interviewsRef);
    
    const interviewsToDelete: InterviewToDelete[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const hasMultimodal = !!data.multimodalAnalysis;
      const hasAnalysis = !!data.analysis;
      
      // Only include interviews without multimodal analysis
      if (!hasMultimodal) {
        const questions = data.questions || [];
        const videoUrls: string[] = [];
        
        // Collect all video URLs
        questions.forEach((q: any) => {
          if (q.videoUrl) {
            videoUrls.push(q.videoUrl);
          }
        });
        
        interviewsToDelete.push({
          id: docSnap.id,
          userId,
          role: data.role || "Unknown",
          difficulty: data.difficulty || "Unknown",
          createdAt: data.createdAt?.toDate() || new Date(),
          hasMultimodal: false,
          hasAnalysis,
          questionCount: questions.length,
          videoUrls,
        });
      }
    });
    
    // Sort by date (oldest first)
    interviewsToDelete.sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    return interviewsToDelete;
  } catch (error: any) {
    console.error("Error fetching interviews without multimodal:", error);
    throw new Error(`Failed to fetch interviews: ${error.message}`);
  }
}

/**
 * Delete all videos for an interview from Storage
 */
async function deleteInterviewVideosFromStorage(
  userId: string,
  interviewId: string,
  questionCount: number
): Promise<number> {
  let deletedCount = 0;
  
  try {
    // Try to list and delete all files in the interview folder
    const folderRef = ref(storage, `interviews/${userId}/${interviewId}`);
    const listResult = await listAll(folderRef);
    
    const deletePromises = listResult.items.map(async (item) => {
      try {
        await deleteObject(item);
        deletedCount++;
      } catch (err: any) {
        console.warn(`Failed to delete ${item.fullPath}:`, err);
      }
    });
    
    await Promise.all(deletePromises);
    
    // Also try deleting by index (for videos that might not be listed)
    if (deletedCount < questionCount) {
      try {
        await deleteInterviewVideos(userId, interviewId, questionCount);
        deletedCount = questionCount;
      } catch (error: any) {
        // Ignore - we already tried listing
      }
    }
  } catch (error: any) {
    console.error(`Error deleting videos for interview ${interviewId}:`, error);
    // Try fallback: delete by index
    try {
      await deleteInterviewVideos(userId, interviewId, questionCount);
      deletedCount = questionCount;
    } catch (fallbackError: any) {
      console.error("Fallback deletion also failed:", fallbackError);
    }
  }
  
  return deletedCount;
}

/**
 * Delete a single interview and its videos
 */
export async function deleteInterview(
  userId: string,
  interviewId: string,
  questionCount: number
): Promise<{ videosDeleted: number; success: boolean; error?: string }> {
  try {
    // Delete videos first
    const videosDeleted = await deleteInterviewVideosFromStorage(
      userId,
      interviewId,
      questionCount
    );
    
    // Delete Firestore document
    const interviewRef = doc(db, "users", userId, "interviews", interviewId);
    await deleteDoc(interviewRef);
    
    return { videosDeleted, success: true };
  } catch (error: any) {
    console.error(`Error deleting interview ${interviewId}:`, error);
    return {
      videosDeleted: 0,
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Delete multiple interviews in bulk
 */
export async function deleteInterviewsBulk(
  userId: string,
  interviewIds: string[],
  questionCounts: Map<string, number>,
  onProgress?: (current: number, total: number, interviewId: string) => void
): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedInterviews: 0,
    deletedVideos: 0,
    errors: [],
    totalSpaceFreed: 0,
  };
  
  for (let i = 0; i < interviewIds.length; i++) {
    const interviewId = interviewIds[i];
    const questionCount = questionCounts.get(interviewId) || 0;
    
    if (onProgress) {
      onProgress(i + 1, interviewIds.length, interviewId);
    }
    
    try {
      const deleteResult = await deleteInterview(userId, interviewId, questionCount);
      
      if (deleteResult.success) {
        result.deletedInterviews++;
        result.deletedVideos += deleteResult.videosDeleted;
      } else {
        result.errors.push(`Failed to delete interview ${interviewId}: ${deleteResult.error}`);
      }
    } catch (error: any) {
      result.errors.push(`Error deleting interview ${interviewId}: ${error.message}`);
    }
  }
  
  return result;
}

/**
 * Get total storage size estimate for interviews without multimodal
 */
export async function getStorageSizeEstimate(
  interviews: InterviewToDelete[]
): Promise<number> {
  // Rough estimate: average 5MB per video
  // This is just an estimate - actual size would require fetching each video
  const averageVideoSize = 5 * 1024 * 1024; // 5MB
  const totalVideos = interviews.reduce((sum, interview) => 
    sum + interview.questionCount, 0
  );
  
  return totalVideos * averageVideoSize;
}

