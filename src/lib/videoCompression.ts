/**
 * Video compression utilities for optimizing videos before Gemini analysis
 */

/**
 * Compress video blob to target size
 * @param blob - Original video blob
 * @param targetSizeMB - Target size in MB (default: 10MB)
 * @returns Compressed video blob
 */
export async function compressVideo(
  blob: Blob,
  targetSizeMB: number = 10
): Promise<Blob> {
  // For now, return original blob
  // In production, you could use FFmpeg.wasm or server-side compression
  // Client-side compression is complex, so we'll rely on recording settings
  
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  
  // If already under target, return as-is
  if (blob.size <= targetSizeBytes) {
    return blob;
  }
  
  // For now, we'll rely on MediaRecorder settings for compression
  // Future: Implement FFmpeg.wasm compression here
  console.warn(`Video size (${(blob.size / 1024 / 1024).toFixed(2)}MB) exceeds target (${targetSizeMB}MB). Using original.`);
  return blob;
}

/**
 * Validate video format for Gemini analysis
 * @param blob - Video blob to validate
 * @returns Validation result
 */
export function validateVideoFormat(blob: Blob): { valid: boolean; error?: string } {
  const validTypes = ['video/webm', 'video/mp4', 'video/quicktime'];
  const blobType = blob.type.toLowerCase();
  
  if (!validTypes.some(type => blobType.includes(type))) {
    return {
      valid: false,
      error: `Unsupported video format: ${blob.type}. Supported: WebM, MP4, QuickTime`
    };
  }
  
  return { valid: true };
}

/**
 * Get optimal video settings for analysis
 * @returns Recommended settings
 */
export function getOptimalVideoSettings(): {
  maxResolution: string;
  maxBitrate: number;
  maxDuration: number;
  targetSizeMB: number;
} {
  return {
    maxResolution: '1280x720', // 720p max for analysis
    maxBitrate: 2000000, // 2 Mbps
    maxDuration: 120, // 2 minutes
    targetSizeMB: 15, // Target 15MB max
  };
}

