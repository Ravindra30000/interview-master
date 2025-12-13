/**
 * Video analysis utilities for Gemini File API integration
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_INLINE_SIZE = 8 * 1024 * 1024; // 8MB for inline data
const MAX_FILE_API_SIZE = 20 * 1024 * 1024; // 20MB for File API

export interface GeminiFileUpload {
  fileUri: string;
  mimeType: string;
  displayName: string;
}

/**
 * Upload video to Gemini File API for analysis
 * @param genAI - GoogleGenerativeAI instance
 * @param videoBuffer - Video buffer
 * @param mimeType - Video MIME type
 * @param displayName - Display name for the file
 * @returns File URI and metadata
 */
export async function uploadVideoToGemini(
  genAI: GoogleGenerativeAI,
  videoBuffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<GeminiFileUpload> {
  try {
    // Check if File API is available (may not be in all SDK versions)
    // For now, we'll use a workaround: convert to base64 and use inline for larger files
    // Note: Gemini File API might require different SDK methods
    
    // Try to use File API if available
    // The SDK might expose this differently, so we'll handle both cases
    const base64Data = videoBuffer.toString("base64");
    
    // For SDK 0.21.0, File API might not be directly available
    // We'll use inline data with increased limit or implement REST API call
    // For production, consider using REST API directly for File API
    
    // Temporary: Return error to use inline method instead
    // In production, implement proper File API using REST calls
    throw new Error("File API not yet implemented - using inline method for videos up to 20MB");
    
    // TODO: Implement proper File API using REST API calls
    // const response = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': mimeType },
    //   body: videoBuffer
    // });
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error("[videoAnalysis] File API upload failed:", errorMessage);
    throw new Error(`Failed to upload video to Gemini: ${errorMessage}`);
  }
}

/**
 * Delete uploaded file from Gemini File API
 * @param genAI - GoogleGenerativeAI instance
 * @param fileUri - File URI to delete
 */
export async function cleanupGeminiFile(
  genAI: GoogleGenerativeAI,
  fileUri: string
): Promise<void> {
  try {
    // Extract file name from URI
    const fileName = fileUri.split("/").pop();
    if (fileName) {
      await genAI.deleteFile(fileName);
    }
  } catch (error: any) {
    // Don't throw - cleanup is not critical
    console.warn("[videoAnalysis] File cleanup failed:", error?.message || error);
  }
}

/**
 * Prepare video for Gemini analysis
 * Determines whether to use inline data or File API
 * @param videoBuffer - Video buffer
 * @param mimeType - Video MIME type
 * @returns Object indicating method and data
 */
export function prepareVideoForGemini(
  videoBuffer: Buffer,
  mimeType: string
): {
  method: "inline" | "file_api";
  size: number;
  data?: { inlineData: { data: string; mimeType: string } };
  needsUpload?: boolean;
} {
  const size = videoBuffer.length;
  
  // For now, increase inline limit to 20MB since File API needs REST implementation
  // Gemini can handle larger inline videos in some cases
  const INLINE_LIMIT = 20 * 1024 * 1024; // 20MB - increased for Gemini 3 Pro
  
  if (size <= INLINE_LIMIT) {
    // Use inline data for videos up to 20MB
    return {
      method: "inline",
      size,
      data: {
        inlineData: {
          data: videoBuffer.toString("base64"),
          mimeType: mimeType,
        },
      },
    };
  } else {
    // Video too large - will need compression
    throw new Error(
      `Video too large (${(size / 1024 / 1024).toFixed(2)}MB). Maximum: ${INLINE_LIMIT / 1024 / 1024}MB. Please use lower quality setting or record shorter answers.`
    );
  }
}

