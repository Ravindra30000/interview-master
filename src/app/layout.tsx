import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InterviewMaster - AI-Powered Interview Coaching",
  description: "Practice interviews with AI-powered feedback and improve your interview skills",
  metadataBase: new URL("https://interview-master.example.com"),
  openGraph: {
    title: "InterviewMaster - AI Interview Practice",
    description: "Practice interviews with AI feedback, video recording, and transcripts.",
    url: "https://interview-master.example.com",
    siteName: "InterviewMaster",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InterviewMaster",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewMaster - AI Interview Practice",
    description: "Practice interviews with AI feedback, video recording, and transcripts.",
    images: ["/og-image.png"],
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




