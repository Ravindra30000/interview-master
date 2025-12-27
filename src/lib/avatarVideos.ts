import type { AvatarEmotion } from "@/types/realtime";

export type AvatarPhase = "idle" | "speaking" | "wrapup";

export interface AvatarVideo {
  emotion: AvatarEmotion;
  phase: AvatarPhase;
  url: string;
}

// Avatar video registry - URLs from Firebase Storage
const AVATAR_VIDEOS: AvatarVideo[] = [
  // Idle videos
  {
    emotion: "neutral",
    phase: "idle",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fidle-neutral.mp4?alt=media&token=5fdd03b5-a99f-48ff-8217-d2a0b73e0ef9",
  },
  {
    emotion: "neutral",
    phase: "idle",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fidle-neutral-2.mp4?alt=media&token=4edae975-2508-470c-beac-9ba8c50e1dcf",
  },
  {
    emotion: "encouraging",
    phase: "idle",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fidle-encouraging.mp4?alt=media&token=68d355df-5eb2-4cae-88e4-19c9a1d64a07",
  },
  {
    emotion: "thinking",
    phase: "idle",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fidle-thinking.mp4?alt=media&token=a6d459e1-20b7-4565-951f-742d737d5ae8",
  },
  {
    emotion: "concerned",
    phase: "idle",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fidle-concerned.mp4?alt=media&token=2a7ccedb-800e-440b-98aa-2a123e3398e7",
  },
  // Speaking videos
  {
    emotion: "neutral",
    phase: "speaking",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fspeaking-neutral-01.mp4?alt=media&token=07886f8b-0756-4878-8869-86d60b6ff30e",
  },
  {
    emotion: "neutral",
    phase: "speaking",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fspeaking-neutral-02.mp4?alt=media&token=7c48d7a7-fa22-4fb8-9659-e3b24a513aa5",
  },
  {
    emotion: "encouraging",
    phase: "speaking",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fspeaking-encouraging-01.mp4?alt=media&token=c5d533b8-43f6-4cbc-b490-f6dff717c2d3",
  },
  {
    emotion: "encouraging",
    phase: "speaking",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fspeaking-encouraging-02.mp4?alt=media&token=0c74361e-77a8-42d4-af1c-338b3ae6a8ce",
  },
  {
    emotion: "encouraging",
    phase: "speaking",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fspeaking-encouraging-03.mp4?alt=media&token=44a279bd-a0e0-45b8-a764-0e3fa990ee0e",
  },
  {
    emotion: "concerned",
    phase: "speaking",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Fspeaking-concerned-01.mp4?alt=media&token=d53ca4bf-e2a7-49a0-9224-940f885f24a9",
  },
  // Wrapup videos
  {
    emotion: "neutral",
    phase: "wrapup",
    url: "https://firebasestorage.googleapis.com/v0/b/interview-master-d8c6f.firebasestorage.app/o/avatars%2Favatarsspeaking-wrapup-01.mp4?alt=media&token=36417a49-7936-4f29-90a8-b9e73ba99260",
  },
];

/**
 * Get an avatar video by emotion and phase
 * Returns a random video if multiple matches exist
 */
export function getAvatarVideo(
  emotion: AvatarEmotion,
  phase: AvatarPhase
): AvatarVideo | null {
  const matches = AVATAR_VIDEOS.filter(
    (v) => v.emotion === emotion && v.phase === phase
  );

  if (matches.length === 0) {
    // Fallback: try to find any video with matching phase
    const phaseMatches = AVATAR_VIDEOS.filter((v) => v.phase === phase);
    if (phaseMatches.length > 0) {
      return phaseMatches[Math.floor(Math.random() * phaseMatches.length)];
    }
    return null;
  }

  // Return random match if multiple exist
  return matches[Math.floor(Math.random() * matches.length)];
}

/**
 * Get all available avatar videos
 */
export function getAllAvatarVideos(): AvatarVideo[] {
  return AVATAR_VIDEOS;
}
