"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

// Web Speech API type definitions
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Constructor type for SpeechRecognition
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface Props {
  question: string;
  onComplete: (data: { blob: Blob | null; transcript: string; duration: number }) => void;
  maxDurationSec?: number;
  videoQuality?: "low" | "medium" | "high";
}

interface VideoQualityOption {
  label: string;
  bitrate: number;
  description: string;
}

const QUALITY_OPTIONS: Record<"low" | "medium" | "high", VideoQualityOption> = {
  low: {
    label: "Low (500 Kbps)",
    bitrate: 500000, // 500 Kbps
    description: "Smaller files, faster upload",
  },
  medium: {
    label: "Medium (1 Mbps)",
    bitrate: 1000000, // 1 Mbps
    description: "Balanced quality and size",
  },
  high: {
    label: "High (2 Mbps)",
    bitrate: 2000000, // 2 Mbps
    description: "Better quality, larger files",
  },
};

export default function InterviewRecorder({ question, onComplete, maxDurationSec = 120, videoQuality = "medium" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>(""); // Use ref to always have current transcript value
  const accumulatedTranscriptRef = useRef<string>(""); // Accumulated final transcript across all sessions
  const lastResultIndexRef = useRef<number>(0); // Track last processed result index

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sttAvailable, setSttAvailable] = useState<boolean | null>(null);
  const [expired, setExpired] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<"low" | "medium" | "high">(videoQuality);

  // Timer
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t + 1 >= maxDurationSec) {
          stopRecording();
          setExpired(true);
          return t + 1;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recording, maxDurationSec]);

  const startSpeechRecognition = () => {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      setSttAvailable(false);
      return;
    }
    setSttAvailable(true);
    const recognition: SpeechRecognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      
      // Process ALL results from the beginning to ensure we capture everything
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.5; // Default confidence if not provided
        const isFinal = result.isFinal;
        
        // Filter low-confidence results (unless they're final)
        if (confidence > 0.3 || isFinal) {
          if (isFinal) {
            // Final results: add to accumulated transcript with proper spacing
            finalText += transcript + " ";
          } else {
            // Interim results: show as temporary text
            interimText += transcript;
          }
        }
      }
      
      // Update accumulated transcript with final results
      if (finalText.trim()) {
        accumulatedTranscriptRef.current += finalText;
        lastResultIndexRef.current = event.results.length;
      }
      
      // Combine: accumulated final transcript + new interim text
      const fullTranscript = accumulatedTranscriptRef.current.trim() + (interimText ? " " + interimText : "");
      
      setTranscript(fullTranscript);
      transcriptRef.current = fullTranscript;
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = event.error;
      
      // Handle different error types
      if (errorType === "no-speech") {
        // Not an error - just no speech detected yet
        return;
      }
      
      if (errorType === "audio-capture") {
        setError("Microphone not accessible. Please check your microphone permissions and settings.");
        setSttAvailable(false);
      } else if (errorType === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access in your browser settings.");
        setSttAvailable(false);
      } else if (errorType === "network") {
        console.warn("Speech recognition network error - will retry");
        // Try to restart if still recording
        if (recording && recognitionRef.current) {
          setTimeout(() => {
            try {
              if (recognitionRef.current && recording) {
                recognitionRef.current.start();
              }
            } catch (e) {
              // Ignore restart errors
            }
          }, 1000);
        }
      } else {
        console.warn("Speech recognition error:", errorType);
        // For other errors, try to continue if still recording
        if (recording && recognitionRef.current) {
          setTimeout(() => {
            try {
              if (recognitionRef.current && recording) {
                recognitionRef.current.start();
              }
            } catch (e) {
              // Ignore restart errors
            }
          }, 500);
        }
      }
    };
    
    recognition.onend = () => {
      // If still recording, automatically restart recognition
      // This handles cases where recognition stops unexpectedly
      if (recording && recognitionRef.current) {
        try {
          // Small delay before restart to avoid immediate restart issues
          setTimeout(() => {
            if (recording && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          // Recognition might have been stopped intentionally
          recognitionRef.current = null;
        }
      } else {
        recognitionRef.current = null;
      }
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setSttAvailable(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      // Don't clear accumulatedTranscriptRef - preserve transcript across pause/resume
      recognitionRef.current = null;
    }
  };

  const startRecording = async () => {
    setError(null);
    // Reset transcript when starting a NEW recording
    // This ensures clean start for each new recording session
    setTranscript("");
    transcriptRef.current = "";
    accumulatedTranscriptRef.current = ""; // Reset accumulated transcript for new recording
    lastResultIndexRef.current = 0;
    setTimer(0);
    setExpired(false);
    try {
      // Request better audio quality for improved transcription accuracy
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1, // Mono is sufficient for speech
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Get selected quality settings
      const quality = QUALITY_OPTIONS[selectedQuality];
      
      // Configure MediaRecorder with compression settings based on selected quality
      const options: MediaRecorderOptions = {
        mimeType: "video/webm;codecs=vp9", // VP9 codec for better compression
        videoBitsPerSecond: quality.bitrate,
      };

      // Fallback to default if VP9 is not supported
      let mediaRecorder: MediaRecorder;
      if (MediaRecorder.isTypeSupported(options.mimeType!)) {
        mediaRecorder = new MediaRecorder(stream, options);
      } else {
        // Fallback to VP8 or default
        const fallbackOptions: MediaRecorderOptions = {
          mimeType: "video/webm;codecs=vp8",
          videoBitsPerSecond: quality.bitrate,
        };
        if (MediaRecorder.isTypeSupported(fallbackOptions.mimeType!)) {
          mediaRecorder = new MediaRecorder(stream, fallbackOptions);
        } else {
          // Last resort: use default with bitrate limit
          mediaRecorder = new MediaRecorder(stream, {
            videoBitsPerSecond: quality.bitrate,
          });
        }
      }

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob =
          chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: "video/webm" }) : null;
        
        // Check file size and show warning if needed
        if (blob) {
          const sizeMB = blob.size / (1024 * 1024);
          setFileSize(blob.size);
          
          // Warn if file is large (but still allow it)
          if (blob.size > 40 * 1024 * 1024) {
            // 40 MB warning threshold
            setSizeWarning(
              `Large file (${sizeMB.toFixed(2)} MB). Upload may fail if it exceeds 50 MB limit.`
            );
          } else if (blob.size > 50 * 1024 * 1024) {
            // 50 MB hard limit
            setSizeWarning(
              `File too large (${sizeMB.toFixed(2)} MB). Maximum is 50 MB. Upload will be blocked.`
            );
          } else {
            setSizeWarning(null);
          }
        }
        
        // Use ref to get the most current transcript value (fixes first video transcript issue)
        const currentTranscript = transcriptRef.current || transcript;
        onComplete({ blob, transcript: currentTranscript, duration: timer });
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      startSpeechRecognition();
      setRecording(true);
    } catch (err: any) {
      setError(err?.message || "Unable to access camera/microphone");
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    setRecording(false);
    mediaRecorderRef.current?.stop();
    stopSpeechRecognition();
  };

  const resetCurrent = () => {
    stopRecording();
    setTranscript("");
    transcriptRef.current = "";
    accumulatedTranscriptRef.current = ""; // Reset accumulated transcript
    lastResultIndexRef.current = 0;
    setTimer(0);
    setExpired(false);
    setFileSize(null);
    setSizeWarning(null);
    chunksRef.current = [];
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-1">Current question</p>
        <p className="text-base text-gray-900">{question}</p>
      </div>

      <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
        {recording && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            REC
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm font-semibold text-gray-700">
          Time: {formatTime(timer)} / {formatTime(maxDurationSec)}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>
            STT:{" "}
            {sttAvailable === null
              ? "detecting"
              : sttAvailable
              ? "on"
              : "unavailable (recording still works)"}
          </span>
          {!recording && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Quality</span>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value as "low" | "medium" | "high")}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={startRecording}
            disabled={recording}
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            Start
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
          >
            Stop
          </button>
          <button
            onClick={resetCurrent}
            disabled={recording}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition disabled:opacity-60"
          >
            Re-record
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-2">Transcript (live)</p>
        <div className="min-h-[60px] text-sm text-gray-800 whitespace-pre-wrap">
          {transcript || (expired ? "Time limit reached." : "Start speaking after you hit Start.")}
        </div>
      </div>

      {/* File size display and warnings */}
      {fileSize !== null && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">File size:</span>
            <span
              className={`text-sm font-semibold ${
                fileSize > 50 * 1024 * 1024
                  ? "text-red-600"
                  : fileSize > 40 * 1024 * 1024
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {(fileSize / (1024 * 1024)).toFixed(2)} MB
              {fileSize > 50 * 1024 * 1024 && " (Upload blocked)"}
            </span>
          </div>
          {sizeWarning && (
            <p
              className={`mt-2 text-xs ${
                fileSize > 50 * 1024 * 1024 ? "text-red-600" : "text-yellow-600"
              }`}
            >
              ⚠️ {sizeWarning}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

