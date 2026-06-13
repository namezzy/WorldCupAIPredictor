import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "WorldCup AI Predictor | AI-Powered Match Predictions",
    template: "%s | WorldCup AI Predictor",
  },
  description:
    "AI-powered World Cup 2026 match predictions, live scores, team analysis, and user predictions with global leaderboards.",
  keywords: [
    "World Cup 2026",
    "AI predictions",
    "football",
    "soccer",
    "match predictions",
    "FIFA",
    "sports analytics",
  ],
  openGraph: {
    title: "WorldCup AI Predictor",
    description: "AI-powered World Cup 2026 match predictions and analysis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorldCup AI Predictor",
    description: "AI-powered World Cup 2026 match predictions and analysis",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
