import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Maximum file size limits (in bytes)
export const MAX_VIDEO_SIZE_PER_FILE = 50 * 1024 * 1024; // 50 MB per video
export const MAX_TOTAL_SIZE_PER_SESSION = 200 * 1024 * 1024; // 200 MB per session (5 videos × 40MB avg)

/**
 * Validate video blob size
 * @param blob - Video blob to validate
 * @param maxSize - Maximum allowed size in bytes (default: MAX_VIDEO_SIZE_PER_FILE)
 * @returns Validation result with error message if invalid
 */
export function validateVideoSize(
  blob: Blob,
  maxSize: number = MAX_VIDEO_SIZE_PER_FILE
): { valid: boolean; error?: string } {
  if (blob.size > maxSize) {
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Video too large (${sizeMB} MB). Maximum allowed: ${maxMB} MB. Please record a shorter answer or re-record with lower quality.`,
    };
  }
  return { valid: true };
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "5.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Upload a video blob to Firebase Storage
 * @param userId - User ID
 * @param interviewId - Interview ID
 * @param questionIndex - Question index (0-based)
 * @param blob - Video blob to upload
 * @returns Download URL of the uploaded video
 * @throws Error if video size exceeds limit
 */
export async function uploadVideo(
  userId: string,
  interviewId: string,
  questionIndex: number,
  blob: Blob
): Promise<string> {
  // Validate size before upload
  const validation = validateVideoSize(blob);
  if (!validation.valid) {
    throw new Error(validation.error || "Video file too large");
  }

  try {
    const fileName = `interviews/${userId}/${interviewId}/question-${questionIndex}.webm`;
    const storageRef = ref(storage, fileName);

    // Upload the blob
    await uploadBytes(storageRef, blob, {
      contentType: "video/webm",
      cacheControl: "public, max-age=31536000", // 1 year cache
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading video:", error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
}

/**
 * Upload multiple video blobs for an interview session
 * @param userId - User ID
 * @param interviewId - Interview ID
 * @param videos - Array of video blobs (can be null/undefined)
 * @returns Array of download URLs (null for missing videos or if upload fails)
 */
export async function uploadInterviewVideos(
  userId: string,
  interviewId: string,
  videos: (Blob | null | undefined)[]
): Promise<(string | null)[]> {
  // Check total session size before uploading
  const totalSize = videos.reduce((sum, blob) => sum + (blob?.size || 0), 0);
  if (totalSize > MAX_TOTAL_SIZE_PER_SESSION) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_TOTAL_SIZE_PER_SESSION / (1024 * 1024)).toFixed(0);
    console.warn(
      `Session total size (${totalMB} MB) exceeds limit (${maxMB} MB). Some videos may not be uploaded.`
    );
  }

  const uploadPromises = videos.map(async (blob, index) => {
    if (!blob) {
      return null;
    }
    try {
      return await uploadVideo(userId, interviewId, index, blob);
    } catch (error: any) {
      // Log specific error for size limits
      if (error?.message?.includes("too large")) {
        console.error(`Video ${index + 1} too large:`, error.message);
      } else {
        console.error(`Failed to upload video for question ${index}:`, error);
      }
      return null;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete a video from Firebase Storage
 * @param userId - User ID
 * @param interviewId - Interview ID
 * @param questionIndex - Question index
 */
export async function deleteVideo(
  userId: string,
  interviewId: string,
  questionIndex: number
): Promise<void> {
  try {
    const fileName = `interviews/${userId}/${interviewId}/question-${questionIndex}.webm`;
    const storageRef = ref(storage, fileName);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error("Error deleting video:", error);
    // Don't throw - deletion is not critical
  }
}

/**
 * Delete all videos for an interview
 * @param userId - User ID
 * @param interviewId - Interview ID
 * @param questionCount - Number of questions
 */
export async function deleteInterviewVideos(
  userId: string,
  interviewId: string,
  questionCount: number
): Promise<void> {
  const deletePromises = Array.from({ length: questionCount }, (_, index) =>
    deleteVideo(userId, interviewId, index)
  );
  await Promise.all(deletePromises);
}


