import type { Metadata } from "next";

import { BracketContent } from "@/components/bracket/bracket-content";

export const metadata: Metadata = {
  title: "Bracket",
  description: "FIFA World Cup 2026 knockout stage bracket",
};

export default function BracketPage() {
  return <BracketContent />;
}
