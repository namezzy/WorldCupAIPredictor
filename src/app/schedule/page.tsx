import type { Metadata } from "next";

import { ScheduleContent } from "@/components/schedule/schedule-content";
import { getAllMatches } from "@/lib/data/matches";
import { getAllGroups } from "@/lib/data/groups";
import { getAllTeams } from "@/lib/data/teams";

export const metadata: Metadata = {
  title: "Schedule",
  description: "FIFA World Cup 2026 match schedule - all matches",
};

export default async function SchedulePage() {
  const [matches, groups, teams] = await Promise.all([
    getAllMatches(),
    getAllGroups(),
    getAllTeams(),
  ]);

  return <ScheduleContent matches={matches} groups={groups} teams={teams} />;
}
