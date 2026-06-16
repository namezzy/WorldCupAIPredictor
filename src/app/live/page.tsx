import type { Metadata } from "next";

import { LiveContent } from "@/components/live/live-content";
import { getAllMatches } from "@/lib/data/matches";

export const metadata: Metadata = {
  title: "Live",
  description: "Live match center - real-time scores and today's schedule",
};

export default async function LivePage() {
  const matches = await getAllMatches();
  return <LiveContent matches={matches} />;
}
