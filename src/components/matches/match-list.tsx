import { MatchWithDetails } from "@/types";

import { MatchCard } from "./match-card";

interface MatchListProps {
  matches: MatchWithDetails[];
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No matches found for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {matches.map((match, index) => (
        <MatchCard key={match.id} match={match} index={index} />
      ))}
    </div>
  );
}
