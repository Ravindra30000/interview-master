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
      },
    },
  },
  plugins: [],
};
export default config;




