"use client";

import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  createAvatarSession,
  updateSessionState,
  subscribeToSession,
  getSessionRef,
} from "@/lib/realtime";
import type { SessionState, ConversationMessage } from "@/types/realtime";

export type AvatarMode = "idle" | "speaking" | "listening";

export interface AvatarApiResponse {
  avatarResponse: {
    text: string;
    emotion: string;
    videoUrl: string | null;
    audioUrl: string | null;
    readyToAdvance: boolean;
  };
  nextQuestion?: string;
}

export interface AvatarSessionState {
  sessionId: string | null;
  state: SessionState | null;
  lastResponse: AvatarApiResponse["avatarResponse"] | null;
  nextQuestion: string | null;
  readyToAdvance: boolean;
  isLoading: boolean;
  error: string | null;
  sendUserAnswer: (transcript: string) => Promise<AvatarApiResponse | null>;
  avatarMode: AvatarMode;
  onAudioEnded: () => void;
}

export function useAvatarSession(): AvatarSessionState {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [lastResponse, setLastResponse] = useState<
    AvatarApiResponse["avatarResponse"] | null
  >(null);
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);
  const [readyToAdvance, setReadyToAdvance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("idle");

  // Initialize session (wait for auth state)
  useEffect(() => {
    const { onAuthStateChanged } = require("firebase/auth");
    
    // Wait for auth state to be determined
    const unsubscribeAuth = onAuthStateChanged(auth, async (user: any) => {
      if (!user) {
        // Still waiting for anonymous sign-in from RequireAuth
        // Don't set error yet, wait for sign-in to complete
        return;
      }

      // User is authenticated, initialize session
      if (sessionId) {
        // Session already initialized
        return;
      }

      try {
        const newSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        await createAvatarSession(newSessionId, {
          userId: user.uid,
          status: "idle",
          currentQuestion: 0,
          conversationHistory: [],
          avatarState: {
            emotion: "neutral",
            videoUrl: null,
            audioUrl: null,
            isPlaying: true, // Start with playing state for idle video
          },
        });

        setSessionId(newSessionId);
        setAvatarMode("idle"); // Set initial mode to idle so video autoplays
        setError(null); // Clear any previous errors
      } catch (err: any) {
        console.error("[useAvatarSession] Session init error:", err);
        setError(err?.message || "Failed to initialize session");
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [sessionId]);

  // Subscribe to session state changes
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToSession(sessionId, (newState) => {
      if (newState) {
        setState(newState);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const sendUserAnswer = useCallback(
    async (transcript: string): Promise<AvatarApiResponse | null> => {
      if (!sessionId || !transcript.trim()) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Update session with user message
        const conversationHistory = state?.conversationHistory || [];
        const userMessage: ConversationMessage = {
          role: "user",
          text: transcript,
          timestamp: Date.now(),
        };

        const updatedHistory = [...conversationHistory, userMessage];

        await updateSessionState(sessionId, {
          status: "processing",
          conversationHistory: updatedHistory,
        });

        // Call avatar API
        const response = await fetch("/api/avatar/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userTranscript: transcript,
            conversationHistory: updatedHistory,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data: AvatarApiResponse = await response.json();

        // Update session with avatar response
        const assistantMessage: ConversationMessage = {
          role: "assistant",
          text: data.avatarResponse.text,
          timestamp: Date.now(),
        };

        await updateSessionState(sessionId, {
          status: "speaking",
          conversationHistory: [...updatedHistory, assistantMessage],
          avatarState: {
            emotion: data.avatarResponse.emotion as any,
            videoUrl: data.avatarResponse.videoUrl,
            audioUrl: data.avatarResponse.audioUrl,
            isPlaying: true,
          },
        });

        setLastResponse(data.avatarResponse);
        setNextQuestion(data.nextQuestion || null);
        setReadyToAdvance(data.avatarResponse.readyToAdvance ?? false);
        setAvatarMode("speaking");

        return data;
      } catch (err: any) {
        console.error("[useAvatarSession] Send answer error:", err);
        setError(err?.message || "Failed to send answer");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, state]
  );

  const handleAudioEnded = useCallback(() => {
    if (avatarMode === "speaking") {
      setAvatarMode("idle");
      if (sessionId) {
        updateSessionState(sessionId, {
          status: "idle",
          avatarState: {
            emotion: "neutral",
            videoUrl: null,
            audioUrl: null,
            isPlaying: false,
          },
        }).catch((err) => {
          console.error("[useAvatarSession] Update state error:", err);
        });
      }
    }
  }, [avatarMode, sessionId]);

  return {
    sessionId,
    state,
    lastResponse,
    nextQuestion,
    readyToAdvance,
    isLoading,
    error,
    sendUserAnswer,
    avatarMode,
    onAudioEnded: handleAudioEnded,
  };
}
