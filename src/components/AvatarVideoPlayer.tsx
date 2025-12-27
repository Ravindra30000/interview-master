"use client";

import { useEffect, useRef } from "react";

interface AvatarVideoPlayerProps {
  videoUrl: string | null;
  audioUrl?: string | null;
  autoPlay?: boolean;
  autoPlayAudio?: boolean;
  loop?: boolean;
  className?: string;
  onAudioEnded?: () => void;
  onVideoReady?: () => void;
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
}: AvatarVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle video URL changes and autoplay
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;

      // Load the new video
      video.load();

      // Autoplay when video is ready
      const handleCanPlay = () => {
        if (autoPlay) {
          video.play().catch((err) => {
            console.error("[AvatarVideoPlayer] Video play error:", err);
          });
        }
        if (onVideoReady) {
          onVideoReady();
        }
      };

      video.addEventListener("canplay", handleCanPlay);

      // If video is already loaded, play immediately
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
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

  if (!videoUrl) {
    return (
      <div
        className={`${className} bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]`}
      >
        <p className="text-gray-500 text-sm">No avatar video available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-lg border border-gray-200 bg-black"
        muted={true}
        loop={loop}
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
