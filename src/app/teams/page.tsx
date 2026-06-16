import type { Metadata } from "next";

import { TeamsContent } from "@/components/teams/teams-content";
import { getAllTeams } from "@/lib/data/teams";
import { getAllGroups } from "@/lib/data/groups";

export const metadata: Metadata = {
  title: "Teams",
  description: "All 48 teams competing in the FIFA World Cup 2026",
};

export default async function TeamsPage() {
  const [teams, groups] = await Promise.all([getAllTeams(), getAllGroups()]);

  return <TeamsContent teams={teams} groups={groups} />;
}
