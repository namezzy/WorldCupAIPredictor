import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Providers } from "@/components/providers";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
      >
        <Providers>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <div className="hidden md:block">
            <Footer />
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
