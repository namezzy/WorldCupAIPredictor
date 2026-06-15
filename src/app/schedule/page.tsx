import type { Metadata } from "next";

import { ScheduleView } from "@/components/schedule/schedule-view";
import { getAllMatches } from "@/lib/data/matches";

export const metadata: Metadata = {
  title: "Schedule",
  description: "FIFA World Cup 2026 match schedule - daily view of all matches",
};

export default async function SchedulePage() {
  const matches = await getAllMatches();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 font-display text-4xl font-bold">Match Schedule</h1>
      <p className="mb-6 text-muted-foreground">
        Daily schedule for all FIFA World Cup 2026 matches
      </p>
      <ScheduleView matches={matches} />
    </div>
  );
}
