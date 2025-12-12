import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function calculateScore(metrics: {
  confidence: number;
  clarity: number;
  structure: number;
  fillerWords: number;
}): number {
  const weights = {
    confidence: 0.3,
    clarity: 0.3,
    structure: 0.2,
    fillerWords: 0.2,
  };

  const score =
    metrics.confidence * weights.confidence +
    metrics.clarity * weights.clarity +
    metrics.structure * weights.structure +
    metrics.fillerWords * weights.fillerWords;

  return Math.round(score * 10 * 10) / 10; // Scale to 0-10, 1 decimal
}




