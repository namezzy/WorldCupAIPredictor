import { MatchWithDetails } from "@/types";

import { mockMatches } from "./mock-data";

interface GetAllMatchesFilters {
  stage?: string;
  groupId?: string;
  date?: string;
}

export async function getAllMatches(
  filters: GetAllMatchesFilters = {}
): Promise<MatchWithDetails[]> {
  const { stage, groupId, date } = filters;

  return mockMatches
    .filter((match) => {
      if (stage && match.stage !== stage) {
        return false;
      }

      if (groupId && match.group_id !== groupId) {
        return false;
      }

      if (date && !match.match_date.startsWith(date)) {
        return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );
}

export async function getMatchById(
  id: string
): Promise<MatchWithDetails | null> {
  return mockMatches.find((match) => match.id === id) ?? null;
}

export async function getHotMatches(): Promise<MatchWithDetails[]> {
  return [...mockMatches]
    .filter((match) => match.prediction)
    .sort(
      (a, b) =>
        (b.prediction?.confidence ?? 0) - (a.prediction?.confidence ?? 0)
    )
    .slice(0, 6);
}

export async function getMatchesByTeam(
  teamId: string
): Promise<MatchWithDetails[]> {
  return mockMatches
    .filter(
      (match) => match.home_team_id === teamId || match.away_team_id === teamId
    )
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );
}
