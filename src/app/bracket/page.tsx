import type { Metadata } from "next";

import { BracketContent } from "@/components/bracket/bracket-content";
import { getAllMatches } from "@/lib/data/matches";

export const metadata: Metadata = {
  title: "Bracket",
  description: "FIFA World Cup 2026 knockout stage bracket",
};

export default async function BracketPage() {
  const matches = await getAllMatches();
  return <BracketContent initialMatches={matches} />;
}
