import type { Metadata } from "next";

import { LeaderboardContent } from "@/components/leaderboard/leaderboard-content";
import { mockCurrentUserId, mockLeaderboard } from "@/lib/data/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Track the top World Cup AI Predictor players and climb the podium.",
};

export default function LeaderboardPage() {
  return (
    <LeaderboardContent
      entries={mockLeaderboard}
      currentUserId={mockCurrentUserId}
    />
  );
}
