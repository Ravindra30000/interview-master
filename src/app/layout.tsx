import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InterviewMaster - AI-Powered Interview Coaching",
  description: "Practice interviews with AI-powered feedback and improve your interview skills",
  metadataBase: new URL("https://interview-master-921696971578.us-central1.run.app"),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>",
    shortcut: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>",
  },
  openGraph: {
    title: "InterviewMaster - AI Interview Practice",
    description: "Practice interviews with AI feedback, video recording, and transcripts.",
    url: "https://interview-master-921696971578.us-central1.run.app",
    siteName: "InterviewMaster",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "InterviewMaster - AI Interview Practice",
    description: "Practice interviews with AI feedback, video recording, and transcripts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}




