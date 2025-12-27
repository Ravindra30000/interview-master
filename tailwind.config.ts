import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066FF",
        secondary: "#F5F5F5",
        accent: "#00CC88",
        "text-dark": "#1A1A1A",
        "text-light": "#666666",
        border: "#E0E0E0",
        // Score range colors
        "score-excellent": {
          DEFAULT: "#10B981",
          light: "#059669",
          dark: "#047857",
        },
        "score-good": {
          DEFAULT: "#3B82F6",
          light: "#2563EB",
          dark: "#1D4ED8",
        },
        "score-needs-improvement": {
          DEFAULT: "#F59E0B",
          light: "#EF4444",
          dark: "#DC2626",
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.12)",
        large: "0 8px 24px rgba(0, 0, 0, 0.16)",
        glow: "0 0 20px rgba(0, 102, 255, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-score-excellent":
          "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        "gradient-score-good":
          "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        "gradient-score-needs-improvement":
          "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
