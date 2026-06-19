"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic } from "lucide-react";

export type AvatarState = "greeting" | "idle" | "listening" | "processing" | "speaking" | "ready";

interface AvatarVideoPlayerProps {
  videoUrl: string | null;
  audioUrl?: string | null;
  autoPlay?: boolean;
  autoPlayAudio?: boolean;
  loop?: boolean;
  className?: string;
  onAudioEnded?: () => void;
  onVideoReady?: () => void;
  isLoading?: boolean;
  avatarState?: AvatarState; // New prop for state-based visual feedback
}

export default function AvatarVideoPlayer({
  videoUrl,
  audioUrl,
  autoPlay = true,
  autoPlayAudio = false,
  loop = true,
  className = "",
  onAudioEnded,
  onVideoReady,
  isLoading = false,
  avatarState = "idle",
}: AvatarVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Handle video URL changes and autoplay
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;
      setVideoLoading(true);
      setVideoError(null);

      // Load the new video
      video.load();

      // Autoplay when video is ready
      const handleCanPlay = () => {
        setVideoLoading(false);
        if (autoPlay) {
          video.play().catch((err) => {
            console.error("[AvatarVideoPlayer] Video play error:", err);
            setVideoError("Failed to play video");
          });
        }
        if (onVideoReady) {
          onVideoReady();
        }
      };

      const handleError = () => {
        setVideoLoading(false);
        setVideoError("Failed to load video");
        console.error("[AvatarVideoPlayer] Video load error");
      };

      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleError);

      // If video is already loaded, play immediately
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("error", handleError);
      };
    } else if (!videoUrl) {
      setVideoLoading(false);
    }
  }, [videoUrl, autoPlay, onVideoReady]);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;

      if (autoPlayAudio) {
        // Wait for audio to be ready, then play
        const handleCanPlayThrough = () => {
          audio.play().catch((err) => {
            console.error("[AvatarVideoPlayer] Audio play error:", err);
          });
        };

        audio.addEventListener("canplaythrough", handleCanPlayThrough);

        // If audio is already loaded, play immediately
        if (audio.readyState >= 3) {
          handleCanPlayThrough();
        }

        return () => {
          audio.removeEventListener("canplaythrough", handleCanPlayThrough);
        };
      }
    }
  }, [audioUrl, autoPlayAudio]);

  // Handle audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !onAudioEnded) return;

    const handleEnded = () => {
      onAudioEnded();
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onAudioEnded]);

  // Determine what to show based on avatar state
  const getStateMessage = () => {
    switch (avatarState) {
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing your answer...";
      case "greeting":
        return isLoading ? "Preparing greeting..." : "Loading greeting...";
      default:
        return isLoading ? "Generating avatar video..." : "Loading video...";
    }
  };

  if (videoError) {
    return (
      <div
        className={`${className} bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px] border border-red-100`}
      >
        <p className="text-red-500 text-sm font-medium px-4 text-center">
          {videoError}
        </p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div
        className={`${className} bg-gray-100 rounded-lg flex flex-col items-center justify-center min-h-[300px] relative border border-gray-100`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-gray-600 text-sm">{getStateMessage()}</p>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {videoLoading && (avatarState as string) !== "processing" && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      )}
      {avatarState === "listening" && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-blue-500 bg-opacity-30 rounded-full p-3 animate-pulse">
            <Mic className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      )}
      {avatarState === "processing" && (
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex flex-col items-center justify-center z-10 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-5 flex flex-col items-center shadow-2xl max-w-xs text-center border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-gray-900 text-sm font-bold mb-1">Analyzing Answer</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Evaluating response metrics and preparing the next question...
            </p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-lg border border-gray-200 bg-black relative"
        muted={true}
        loop={loop && avatarState !== "speaking" && avatarState !== "greeting"}
        playsInline
        autoPlay={autoPlay}
        preload="auto"
      />
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
          preload="auto"
        />
      )}
    </div>
  );
}
