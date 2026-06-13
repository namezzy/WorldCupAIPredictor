import type { Metadata } from "next";
import { Suspense } from "react";

import { MatchFilters } from "@/components/matches/match-filters";
import { MatchList } from "@/components/matches/match-list";
import { getAllMatches } from "@/lib/data/matches";

export const metadata: Metadata = {
  title: "Match Schedule",
  description: "Browse all FIFA World Cup 2026 matches with AI predictions",
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; group?: string; date?: string }>;
}) {
  const params = await searchParams;
  const matches = await getAllMatches({
    stage: params.stage,
    groupId: params.group,
    date: params.date,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 font-display text-4xl font-bold">Match Schedule</h1>
      <p className="mb-8 text-muted-foreground">
        All {matches.length} matches with AI-powered predictions
      </p>
      <Suspense fallback={null}>
        <MatchFilters />
      </Suspense>
      <MatchList matches={matches} />
    </div>
  );
}
