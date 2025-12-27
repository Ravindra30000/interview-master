"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ScoreDisplay({
  score,
  maxScore = 10,
  showLabel = true,
  size = "lg",
}: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (score / maxScore) * 100;

  // Determine score category and colors
  const getScoreCategory = () => {
    if (score >= 8) {
      return {
        category: "excellent",
        gradient: "bg-gradient-score-excellent",
        textColor: "text-score-excellent-DEFAULT",
        icon: CheckCircle2,
        label: "Excellent",
      };
    } else if (score >= 6) {
      return {
        category: "good",
        gradient: "bg-gradient-score-good",
        textColor: "text-score-good-DEFAULT",
        icon: TrendingUp,
        label: "Good",
      };
    } else {
      return {
        category: "needs-improvement",
        gradient: "bg-gradient-score-needs-improvement",
        textColor: "text-score-needs-improvement-DEFAULT",
        icon: AlertCircle,
        label: "Needs Improvement",
      };
    }
  };

  const category = getScoreCategory();
  const Icon = category.icon;

  // Animate score counting
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const sizeClasses = {
    sm: "w-24 h-24 text-2xl",
    md: "w-32 h-32 text-3xl",
    lg: "w-40 h-40 text-5xl",
  };

  const strokeWidth = size === "lg" ? 4 : size === "md" ? 3 : 2;
  const radius = size === "lg" ? 70 : size === "md" ? 60 : 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const sizeValue = size === "lg" ? 160 : size === "md" ? 128 : 96;
  const center = sizeValue / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: sizeValue, height: sizeValue }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={sizeValue}
          height={sizeValue}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${category.textColor} transition-all duration-1000 ease-out`}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold ${category.textColor} ${
              sizeClasses[size].split(" ")[2]
            }`}
          >
            {animatedScore.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500 mt-1">/ {maxScore}</span>
        </div>
      </div>
      {showLabel && (
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${category.textColor}`} />
          <span className={`font-semibold ${category.textColor}`}>
            {category.label}
          </span>
        </div>
      )}
    </div>
  );
}
