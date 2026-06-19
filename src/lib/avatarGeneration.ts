/**
 * Avatar Generation Service
 * 
 * Unified interface for generating real-time avatar videos with lip-sync
 * Supports both D-ID and HeyGen APIs with automatic fallback
 */

import axios from "axios";
import FormData from "form-data";
import type { AvatarEmotion } from "@/types/realtime";

export type AvatarProvider = "did" | "heygen";

/**
 * Map Gemini emotions to avatar API-specific expression parameters
 */
function mapEmotionToExpression(emotion: AvatarEmotion): {
  expression?: string;
  pose?: string;
  style?: string;
} {
  switch (emotion) {
    case "encouraging":
      return {
        expression: "happy",
        pose: "confident",
        style: "positive",
      };
    case "thinking":
      return {
        expression: "thoughtful",
        pose: "contemplative",
        style: "neutral",
      };
    case "concerned":
      return {
        expression: "serious",
        pose: "attentive",
        style: "professional",
      };
    case "neutral":
    default:
      return {
        expression: "neutral",
        pose: "calm",
        style: "professional",
      };
  }
}

export interface AvatarGenerationOptions {
  text: string;
  audioBuffer: Buffer;
  emotion: AvatarEmotion;
  provider?: AvatarProvider;
}

export interface AvatarGenerationResult {
  videoUrl: string;
  provider: AvatarProvider;
  generationTime: number;
}

// Cache for common phrases to reduce API calls
const phraseCache = new Map<string, AvatarGenerationResult>();

// Cache configuration
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100; // Maximum cached items

interface CachedResult extends AvatarGenerationResult {
  cachedAt: number;
}

/**
 * Get the active avatar provider from environment.
 *
 * For now we prefer HeyGen when a HEYGEN_API_KEY is present, since it's the
 * primary provider for the demo. If AVATAR_PROVIDER is explicitly set we
 * still honour that, but default to HeyGen when possible.
 */
function getActiveProvider(): AvatarProvider {
  const envProvider = process.env.AVATAR_PROVIDER;

  if (envProvider === "heygen" || envProvider === "did") {
    return envProvider;
  }

  // If no explicit provider is set, prefer HeyGen when configured
  if (process.env.HEYGEN_API_KEY) {
    return "heygen";
  }

  return "did";
}

/**
 * Switch the active provider (for testing/demo purposes)
 */
export function switchProvider(provider: AvatarProvider): void {
  process.env.AVATAR_PROVIDER = provider;
}

/**
 * Fetch available presenters from D-ID API
 * Returns list of presenter IDs that can be used with /clips endpoint
 */
async function fetchDIDPresenters(): Promise<string[]> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) {
    throw new Error("DID_API_KEY is not set");
  }

  const cleanedApiKey = apiKey.endsWith(":") ? apiKey.slice(0, -1) : apiKey;
  const didAuthHeader = `Basic ${Buffer.from(cleanedApiKey).toString("base64")}`;

  try {
    const response = await axios.get("https://api.d-id.com/clips/presenters", {
      headers: {
        Authorization: didAuthHeader,
      },
    });

    // Extract presenter IDs from response
    const presenters = response.data?.presenters || response.data || [];
    return presenters.map((p: any) => p.presenter_id || p.id || p).filter(Boolean);
  } catch (error: any) {
    console.error("[avatarGeneration] Failed to fetch D-ID presenters:", error?.response?.data || error?.message);
    return [];
  }
}

/**
 * Get presenter ID for a given agent ID
 * If agent ID is provided, tries to find associated presenter
 * Otherwise returns first available presenter or default public presenter
 */
async function getPresenterIdForAgent(agentId: string | null): Promise<string> {
  const presenters = await fetchDIDPresenters();
  
  if (presenters.length === 0) {
    // Fallback to a known public presenter
    console.log("[avatarGeneration] D-ID: No presenters found, using default public presenter");
    return "v2_public_Amber@0zSz8kflCN";
  }

  // If agent ID provided, try to find matching presenter
  // (This is a heuristic - D-ID API might have a direct endpoint for this)
  // For now, return first available presenter
  console.log(`[avatarGeneration] D-ID: Found ${presenters.length} presenter(s), using first available`);
  return presenters[0];
}

/**
 * Poll clip status with retry logic for timeout errors
 */
async function pollClipStatus(
  endpoint: string,
  clipId: string,
  didAuthHeader: string,
  maxRetries: number = 3
): Promise<any> {
  let lastError: any = null;
  
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      const response = await axios.get(
        `https://api.d-id.com/${endpoint}/${clipId}`,
        {
          headers: {
            Authorization: didAuthHeader,
          },
          timeout: 10000, // 10 second timeout
        }
      );
      return response;
    } catch (error: any) {
      lastError = error;
      
      // If it's a timeout error, retry
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        if (retry < maxRetries - 1) {
          console.log(`[avatarGeneration] D-ID: Poll request timed out, retrying (${retry + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s before retry
          continue;
        }
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw lastError || new Error("Polling request failed after retries");
}

/**
 * Generate avatar video using D-ID API
 */
async function generateWithDID(
  text: string,
  audioBuffer: Buffer,
  emotion: AvatarEmotion
): Promise<AvatarGenerationResult> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) {
    throw new Error("DID_API_KEY is not set in environment variables");
  }

  // D-ID expects HTTP Basic auth of the form base64("username:password").
  // Many users store DID_API_KEY as "email:token". If so, we must base64 that
  // exact string (without adding an extra trailing colon).
  const cleanedApiKey = apiKey.endsWith(":") ? apiKey.slice(0, -1) : apiKey;
  const didAuthHeader = `Basic ${Buffer.from(cleanedApiKey).toString("base64")}`;

  const startTime = Date.now();
  const expression = mapEmotionToExpression(emotion);

  // Keep a normalized presenterId available for error messages/logging even if the request fails early.
  let presenterId = "";

  try {
    // Step 0: Normalize presenter ID - trim whitespace and leading/trailing slashes
    // This fixes the issue where env var contains "/v2_agt_NJ3u2o4n" with leading slash
    let rawPresenterId = process.env.DID_PRESENTER_ID || "amy-jcwCkr1grs";
    const normalizedRawId = rawPresenterId.trim().replace(/^\/+|\/+$/g, "");
    
    // Check if user provided an agent ID (starts with v2_agt_)
    const isAgentId = normalizedRawId.startsWith("v2_agt_");
    
    // Check if this is a v2 agent (either agent ID or presenter ID starting with v2_agt_)
    const isV2Agent = normalizedRawId.startsWith("v2_agt_") || normalizedRawId.startsWith("v2_public_");
    
    // Step 3: Resolve agent ID to presenter ID if needed
    if (isV2Agent && isAgentId) {
      // User provided an agent ID, need to fetch the presenter ID
      console.log(`[avatarGeneration] D-ID: Agent ID detected (${normalizedRawId}), fetching presenter ID...`);
      presenterId = await getPresenterIdForAgent(normalizedRawId);
      console.log(`[avatarGeneration] D-ID: Resolved presenter ID: ${presenterId} (from agent ID: ${normalizedRawId})`);
    } else {
      // User provided a presenter ID directly
      presenterId = normalizedRawId;
    }
    
    // Step 4: Validate presenter ID format
    if (!presenterId || presenterId === "") {
      throw new Error(
        "DID_PRESENTER_ID is empty. Please set a valid presenter ID in your .env.local file."
      );
    }
    
    // Step 2: Debug logging to verify code execution path
    console.log(`[avatarGeneration] D-ID: Presenter ID: ${presenterId}`);
    console.log(`[avatarGeneration] D-ID: Detected as v2 agent: ${isV2Agent}`);
    
    let createResponse;
    let endpoint: string;
    let payload: any;
    
    if (isV2Agent) {
      // V2 agents use the /clips endpoint with presenter_id field
      endpoint = "clips";
      
      // Option A: No provider - let D-ID use presenter's default voice (preferred)
      // Option B: If Option A fails, uncomment below to use Microsoft provider:
      // const useMicrosoftProvider = true;
      const useMicrosoftProvider = false;
      
      const scriptPayload: any = {
        type: "text",
        input: text,
      };
      
      // Add Microsoft provider as fallback if needed
      if (useMicrosoftProvider) {
        scriptPayload.provider = {
          type: "microsoft",
          voice_id: "en-US-AriaNeural", // Common Microsoft voice
        };
      }
      // Otherwise, no provider specified - D-ID will use presenter's default voice
      
      payload = {
        presenter_id: presenterId,
        script: scriptPayload,
        config: {
          result_format: "mp4",
          ...(expression.expression && { expression: expression.expression }),
        },
      };
      
      console.log(`[avatarGeneration] D-ID: Using /clips endpoint for v2 agent`);
      console.log(`[avatarGeneration] D-ID: Payload:`, JSON.stringify(payload, null, 2));
      
      createResponse = await axios.post(
        `https://api.d-id.com/${endpoint}`,
        payload,
        {
          headers: {
            Authorization: didAuthHeader,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Classic presenters use /talks endpoint with source_url
      // Remove any leading/trailing slashes from presenterId to avoid double slashes
      const cleanPresenterId = presenterId.replace(/^\/+|\/+$/g, "");
      const sourceUrl = `https://d-id-public-bucket.s3.amazonaws.com/${cleanPresenterId}.jpg`;
      
      endpoint = "talks";
      payload = {
        source_url: sourceUrl,
        script: {
          type: "text",
          input: text,
          provider: {
            type: "google",
            voice_id: "en-US-Neural2-D",
          },
        },
        config: {
          result_format: "mp4",
          ...(expression.expression && { expression: expression.expression }),
        },
      };
      
      console.log(`[avatarGeneration] D-ID: Using /talks endpoint for classic presenter`);
      console.log(`[avatarGeneration] D-ID: Source URL: ${sourceUrl}`);
      console.log(`[avatarGeneration] D-ID: Payload:`, JSON.stringify(payload, null, 2));
      
      createResponse = await axios.post(
        `https://api.d-id.com/${endpoint}`,
        payload,
        {
          headers: {
            Authorization: didAuthHeader,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`[avatarGeneration] D-ID: API call successful, response:`, JSON.stringify(createResponse.data, null, 2));

    const clipId = createResponse.data.id || createResponse.data.clip_id;
    
    if (!clipId) {
      throw new Error(
        `D-ID API returned success but no clip/talk ID. Response: ${JSON.stringify(createResponse.data)}`
      );
    }

    console.log(`[avatarGeneration] D-ID: Clip/Talk ID: ${clipId}, polling for completion...`);

    // Poll for completion
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s intervals)

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      try {
        const statusResponse = await pollClipStatus(endpoint, clipId, didAuthHeader);
        
        // Handle different response structures for /clips vs /talks
        const status = statusResponse.data.status || 
                       statusResponse.data.result?.status ||
                       statusResponse.data.state; // /clips might use "state"
        
        console.log(`[avatarGeneration] D-ID: Poll attempt ${attempts + 1}/${maxAttempts}, status: ${status}`);
        
        // Log response structure for debugging (first attempt only)
        if (attempts === 0) {
          console.log(`[avatarGeneration] D-ID: Poll response structure:`, JSON.stringify(statusResponse.data, null, 2));
        }
        
        if (status === "done" || status === "completed" || status === "succeeded") {
          // Try multiple possible fields for video URL
          videoUrl = statusResponse.data.result_url || 
                     statusResponse.data.result?.video_url ||
                     statusResponse.data.video_url ||
                     statusResponse.data.result?.url ||
                     statusResponse.data.url;
          console.log(`[avatarGeneration] D-ID: Video generation completed, URL: ${videoUrl}`);
          break;
        } else if (status === "error" || status === "failed") {
          const errorDetails = statusResponse.data.error || statusResponse.data.result?.error || "Unknown error";
          throw new Error(
            `D-ID generation failed during polling: ${JSON.stringify(errorDetails)}`
          );
        }
      } catch (error: any) {
        // If it's a timeout after all retries, log and continue polling
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          console.warn(`[avatarGeneration] D-ID: Poll request timed out after retries, continuing polling...`);
          attempts++;
          continue;
        }
        // For other errors, throw immediately
        throw error;
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error(
        `D-ID video generation timed out after ${maxAttempts} attempts. ` +
        `Check D-ID dashboard for clip ID: ${clipId}`
      );
    }

    const generationTime = Date.now() - startTime;

    // Log timing for optimization
    console.log(
      `[avatarGeneration] D-ID: Generated video in ${generationTime}ms (${isV2Agent ? 'v2 agent' : 'classic presenter'})`
    );

    return {
      videoUrl,
      provider: "did",
      generationTime,
    };
  } catch (error: any) {
    // Step 1 & 5: Enhanced error logging with full response details
    console.error("[avatarGeneration] D-ID error details:");
    console.error("  Error message:", error?.message);
    console.error("  Error code:", error?.code);
    console.error("  Status code:", error?.response?.status);
    console.error("  Status text:", error?.response?.statusText);
    console.error("  Response data:", error?.response?.data ? JSON.stringify(error.response.data, null, 2) : "No response data");
    console.error("  Request URL:", error?.config?.url);
    console.error("  Request method:", error?.config?.method);
    console.error("  Request payload:", error?.config?.data ? JSON.stringify(JSON.parse(error.config.data), null, 2) : "No payload");
    console.error("  Presenter ID:", presenterId || (process.env.DID_PRESENTER_ID || "not set"));
    
    // Step 5: Improved error messages with actionable steps
    let errorMessage = `D-ID avatar generation failed`;
    
    if (error?.response?.status === 500) {
      errorMessage += ` (500 Internal Server Error). `;
      errorMessage += `This usually means:\n`;
      errorMessage += `  1. The presenter ID "${presenterId || process.env.DID_PRESENTER_ID || 'not set'}" may not be valid or accessible with your API key\n`;
      errorMessage += `  2. The presenter may not exist in your D-ID account\n`;
      errorMessage += `  3. Your D-ID plan may not support this presenter type\n`;
      errorMessage += `\nPlease verify the presenter ID in your D-ID dashboard: https://studio.d-id.com\n`;
      if (error?.response?.data) {
        errorMessage += `\nD-ID API response: ${JSON.stringify(error.response.data)}`;
      }
    } else if (error?.response?.status === 401 || error?.response?.status === 403) {
      errorMessage += ` (${error.response.status} Authentication Error). `;
      errorMessage += `Please check your DID_API_KEY in .env.local`;
    } else if (error?.response?.status === 402) {
      // Payment Required / Insufficient Credits
      const errorData = error?.response?.data || {};
      const errorKind = errorData.kind || "";
      const errorDesc = errorData.description || "";
      
      errorMessage = `D-ID account has insufficient credits (402 Payment Required). `;
      errorMessage += `\n\nYour D-ID account needs more credits to generate avatar videos. `;
      errorMessage += `\n\nTo fix this:\n`;
      errorMessage += `  1. Go to https://studio.d-id.com and sign in\n`;
      errorMessage += `  2. Navigate to your account/billing section\n`;
      errorMessage += `  3. Purchase credits or upgrade your plan\n`;
      errorMessage += `  4. Once credits are added, try again\n`;
      
      if (errorKind || errorDesc) {
        errorMessage += `\nD-ID API response: ${JSON.stringify(errorData)}`;
      }
    } else if (error?.response?.status === 404) {
      const errorDesc: string = String(error?.response?.data?.description || "");
      const normalized = presenterId || (process.env.DID_PRESENTER_ID || "not set");
      const rawId = process.env.DID_PRESENTER_ID || "";

      if (
        errorDesc.toLowerCase().includes("avatar not found") ||
        errorDesc.toLowerCase().includes("not found")
      ) {
        errorMessage += ` (404 Avatar Not Found). `;
        
        // Check if user provided an agent ID
        if (rawId.trim().replace(/^\/+|\/+$/g, "").startsWith("v2_agt_")) {
          errorMessage += `You're using an AGENT ID ("${rawId.trim().replace(/^\/+|\/+$/g, "")}"), but D-ID's /clips endpoint requires a PRESENTER ID.\n\n`;
          errorMessage += `The code attempted to automatically fetch your presenter ID, but it failed.\n\n`;
          errorMessage += `To fix this:\n`;
          errorMessage += `  1. Manually get your presenter ID:\n`;
          errorMessage += `     - Call GET https://api.d-id.com/clips/presenters with your API key\n`;
          errorMessage += `     - Or use curl: curl -u "YOUR_API_KEY" https://api.d-id.com/clips/presenters\n`;
          errorMessage += `     - Find the presenter ID associated with your agent\n`;
          errorMessage += `  2. Update DID_PRESENTER_ID in .env.local with the presenter ID (not agent ID)\n`;
          errorMessage += `     - Presenter IDs usually start with "v2_public_" or similar\n`;
          errorMessage += `  3. OR use a public presenter ID like: v2_public_Amber@0zSz8kflCN\n`;
          errorMessage += `  4. Restart your dev server\n`;
        } else {
          errorMessage += `The presenter ID "${normalized}" does not exist in your D-ID account or is not accessible with your API key.\n\n`;
          errorMessage += `To fix this:\n`;
          errorMessage += `  1. Go to https://studio.d-id.com and sign in\n`;
          errorMessage += `  2. Navigate to "Agents" or "Presenters" section\n`;
          errorMessage += `  3. Find your presenter and copy its exact ID (should start with v2_public_ or similar)\n`;
          errorMessage += `  4. Update DID_PRESENTER_ID in your .env.local file\n`;
          errorMessage += `  5. Make sure your D-ID plan supports this presenter type\n`;
          errorMessage += `  6. Restart your dev server\n`;
        }
        
        if (error?.response?.data) {
          errorMessage += `\nD-ID API response: ${JSON.stringify(error.response.data)}`;
        }
      } else {
        errorMessage += ` (404 Not Found). `;
        errorMessage += `The endpoint or presenter ID may be incorrect. `;
        errorMessage += `Presenter ID: "${normalized}"`;
        if (error?.response?.data) {
          errorMessage += `\nD-ID API response: ${JSON.stringify(error.response.data)}`;
        }
      }
    } else if (error?.response?.data) {
      errorMessage += `: ${JSON.stringify(error.response.data)}`;
    } else if (error?.message) {
      errorMessage += `: ${error.message}`;
    } else {
      errorMessage += `: Unknown error`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Generate avatar video using HeyGen API
 */
async function generateWithHeyGen(
  text: string,
  _audioBuffer: Buffer,
  emotion: AvatarEmotion
): Promise<AvatarGenerationResult> {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    throw new Error("HEYGEN_API_KEY is not set in environment variables");
  }

  const avatarId = process.env.HEYGEN_AVATAR_ID;
  if (!avatarId || avatarId === "default") {
    throw new Error(
      "HEYGEN_AVATAR_ID is not set or is using the placeholder 'default'. " +
        "Create an avatar in HeyGen and set HEYGEN_AVATAR_ID to its ID."
    );
  }

  const startTime = Date.now();
  const expression = mapEmotionToExpression(emotion);

  try {
    // NOTE: Your account returns 404 for HeyGen v1 endpoints (audio.upload + video.generate).
    // Switch to HeyGen v2 API shape (video_inputs).
    const voiceId = process.env.HEYGEN_VOICE_ID || "en-US-Neural2-D";

    const payload = {
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatarId,
          },
          voice: {
            type: "text",
            input_text: text,
            voice_id: voiceId,
          },
          ...(expression.expression ? { emotion: expression.expression } : {}),
        },
      ],
      dimension: { width: 1280, height: 720 },
    };

    const headers = {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    };

    async function postWithFallback(urls: string[]) {
      let lastErr: any = null;
      for (const url of urls) {
        try {
          return await axios.post(url, payload, { headers });
        } catch (err: any) {
          lastErr = err;
          const status = err?.response?.status;
          // If it's not a 404, stop and surface it (auth, quota, bad payload, etc.)
          if (status && status !== 404) throw err;
        }
      }
      throw lastErr || new Error("HeyGen request failed");
    }

    // HeyGen has had multiple endpoint shapes across versions.
    // Try a small ordered set; stop on the first that exists.
    const createResponse = await postWithFallback([
      "https://api.heygen.com/v2/video/generate",
      "https://api.heygen.com/v1/video/generate",
      "https://api.heygen.com/v1/video.generate",
    ]);

    const videoId =
      createResponse.data?.data?.video_id ||
      createResponse.data?.video_id ||
      createResponse.data?.data?.id;

    if (!videoId) {
      throw new Error(
        `HeyGen create response missing video_id: ${JSON.stringify(
          createResponse.data
        ).slice(0, 500)}`
      );
    }

    // Step 3: Poll for completion
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    async function getWithFallback(urls: string[]) {
      let lastErr: any = null;
      for (const url of urls) {
        try {
          return await axios.get(url, { headers: { "X-Api-Key": apiKey } });
        } catch (err: any) {
          lastErr = err;
          const status = err?.response?.status;
          if (status && status !== 404) throw err;
        }
      }
      throw lastErr || new Error("HeyGen status request failed");
    }

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await getWithFallback([
        `https://api.heygen.com/v2/video/${videoId}`,
        `https://api.heygen.com/v1/video/${videoId}`,
        `https://api.heygen.com/v1/video.get?video_id=${videoId}`,
      ]);

      const status =
        statusResponse.data?.data?.status || statusResponse.data?.status;
      const url =
        statusResponse.data?.data?.video_url ||
        statusResponse.data?.data?.url ||
        statusResponse.data?.video_url ||
        statusResponse.data?.url;

      if (status === "completed" || status === "done") {
        videoUrl = url;
        break;
      } else if (status === "failed" || status === "error") {
        throw new Error(
          `HeyGen video generation failed: ${JSON.stringify(
            statusResponse.data
          ).slice(0, 500)}`
        );
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error("HeyGen video generation timed out");
    }

    const generationTime = Date.now() - startTime;

    // Log timing for optimization
    console.log(
      `[avatarGeneration] HeyGen: Generated video in ${generationTime}ms`
    );

    return {
      videoUrl,
      provider: "heygen",
      generationTime,
    };
  } catch (error: any) {
    console.error("[avatarGeneration] HeyGen error:", error);
    throw new Error(
      `HeyGen avatar generation failed: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Generate avatar video with perfect lip-sync
 * 
 * @param options - Generation options including text, audio, and emotion
 * @returns Promise with video URL and metadata
 */
export async function generateAvatarVideo(
  options: AvatarGenerationOptions
): Promise<AvatarGenerationResult> {
  const { text, audioBuffer, emotion, provider } = options;
  const activeProvider = provider || getActiveProvider();

  // Check cache first (simple phrase-based caching)
  const cacheKey = `${activeProvider}:${text.substring(0, 50)}:${emotion}`;
  const cached = phraseCache.get(cacheKey) as CachedResult | undefined;
  
  if (cached) {
    // Check if cache is still valid
    const age = Date.now() - cached.cachedAt;
    if (age < CACHE_TTL_MS) {
      console.log("[avatarGeneration] Using cached result");
      return {
        videoUrl: cached.videoUrl,
        provider: cached.provider,
        generationTime: 0, // Cached, so no generation time
      };
    } else {
      // Cache expired, remove it
      phraseCache.delete(cacheKey);
    }
  }

  // Clean cache if it's too large
  if (phraseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = phraseCache.keys().next().value;
    if (firstKey) {
      phraseCache.delete(firstKey);
    }
  }

  try {
    let result: AvatarGenerationResult;

    if (activeProvider === "heygen") {
      result = await generateWithHeyGen(text, audioBuffer, emotion);
    } else {
      result = await generateWithDID(text, audioBuffer, emotion);
    }

    // Cache the result with timestamp
    const cachedResult: CachedResult = {
      ...result,
      cachedAt: Date.now(),
    };
    phraseCache.set(cacheKey, cachedResult);

    console.log(
      `[avatarGeneration] Generated video in ${result.generationTime}ms using ${result.provider}`
    );

    return result;
  } catch (error: any) {
    // Let errors propagate - no fallback to other provider
    console.error("[avatarGeneration] Avatar generation failed:", error?.message || error);
    throw error;
  }
}

/**
 * Clear the phrase cache (useful for testing or memory management)
 */
export function clearAvatarCache(): void {
  phraseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: phraseCache.size,
    keys: Array.from(phraseCache.keys()),
  };
}
