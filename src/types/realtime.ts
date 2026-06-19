export type AvatarEmotion =
  | "neutral"
  | "encouraging"
  | "thinking"
  | "concerned";

export type SessionStatus = "greeting" | "idle" | "listening" | "processing" | "speaking" | "ready";

export interface AvatarState {
  emotion: AvatarEmotion;
  videoUrl: string | null;
  audioUrl: string | null;
  isPlaying: boolean;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface SessionState {
  userId: string;
  status: SessionStatus;
  currentQuestion: number;
  conversationHistory: ConversationMessage[];
  avatarState: AvatarState;
  createdAt: number;
  updatedAt: number;
}
