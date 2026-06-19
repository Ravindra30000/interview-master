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

export type AvatarMode = "greeting" | "idle" | "listening" | "processing" | "speaking" | "ready";

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

export interface GreetingResponse {
  videoUrl: string;
  audioUrl: string;
  text: string;
}

export interface AvatarSessionState {
  sessionId: string | null;
  state: SessionState | null;
  lastResponse: AvatarApiResponse["avatarResponse"] | null;
  greetingResponse: GreetingResponse | null;
  nextQuestion: string | null;
  readyToAdvance: boolean;
  isLoading: boolean;
  error: string | null;
  startInterview: (role?: string, difficulty?: string) => Promise<GreetingResponse | null>;
  sendUserAnswer: (transcript: string) => Promise<AvatarApiResponse | null>;
  avatarMode: AvatarMode;
  onAudioEnded: () => void;
  setAvatarMode: (mode: AvatarMode) => void;
}

export function useAvatarSession(): AvatarSessionState {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [lastResponse, setLastResponse] = useState<
    AvatarApiResponse["avatarResponse"] | null
  >(null);
  const [greetingResponse, setGreetingResponse] = useState<GreetingResponse | null>(null);
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

  const startInterview = useCallback(
    async (role?: string, difficulty?: string): Promise<GreetingResponse | null> => {
      if (!sessionId) {
        setError("Session not initialized");
        return null;
      }

      setIsLoading(true);
      setError(null);
      setAvatarMode("greeting");

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Call greeting API
        const response = await fetch("/api/avatar/greet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            role,
            difficulty,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data: GreetingResponse = await response.json();

        // Update session state
        await updateSessionState(sessionId, {
          status: "greeting",
          avatarState: {
            emotion: "encouraging",
            videoUrl: data.videoUrl,
            audioUrl: data.audioUrl,
            isPlaying: true,
          },
        });

        setGreetingResponse(data);
        return data;
      } catch (err: any) {
        console.error("[useAvatarSession] Start interview error:", err);
        setError(err?.message || "Failed to start interview");
        setAvatarMode("idle");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

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

        setAvatarMode("processing");
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
          const errorMessage = errorData.error || `API error: ${response.status}`;
          
          // Preserve error type for UI handling
          const error = new Error(errorMessage);
          (error as any).errorType = errorData.errorType;
          (error as any).status = response.status;
          throw error;
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
    if (avatarMode === "speaking" || avatarMode === "greeting") {
      const nextMode: AvatarMode = avatarMode === "greeting" ? "idle" : "ready";
      setAvatarMode(nextMode);
      if (sessionId) {
        updateSessionState(sessionId, {
          status: nextMode === "ready" ? "ready" : "idle",
          avatarState: {
            emotion: "neutral",
            videoUrl: lastResponse?.videoUrl || null,
            audioUrl: null,
            isPlaying: false,
          },
        }).catch((err) => {
          console.error("[useAvatarSession] Update state error:", err);
        });
      }
    }
  }, [avatarMode, sessionId, lastResponse]);

  return {
    sessionId,
    state,
    lastResponse,
    greetingResponse,
    nextQuestion,
    readyToAdvance,
    isLoading,
    error,
    startInterview,
    sendUserAnswer,
    avatarMode,
    onAudioEnded: handleAudioEnded,
    setAvatarMode,
  };
}
