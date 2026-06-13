import type { Metadata } from "next";

import { TeamGrid } from "@/components/teams/team-grid";
import { getAllTeams } from "@/lib/data/teams";

export const metadata: Metadata = {
  title: "Teams",
  description: "All 48 teams competing in the FIFA World Cup 2026",
};

export default async function TeamsPage() {
  const teams = await getAllTeams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 font-display text-4xl font-bold">Teams</h1>
      <p className="mb-8 text-muted-foreground">
        All 48 nations competing in the FIFA World Cup 2026
      </p>
      <TeamGrid teams={teams} />
    </div>
  );
}
