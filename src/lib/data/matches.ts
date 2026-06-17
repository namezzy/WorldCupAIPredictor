import { MatchWithDetails } from "@/types";

import { getLiveData } from "./worldcup-api";

interface GetAllMatchesFilters {
  stage?: string;
  groupId?: string;
  date?: string;
}

async function allMatches(): Promise<MatchWithDetails[]> {
  const { matches } = await getLiveData();
  return matches;
}

export async function getAllMatches(
  filters: GetAllMatchesFilters = {}
): Promise<MatchWithDetails[]> {
  const { stage, groupId, date } = filters;

  return (await allMatches())
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
  return (await allMatches()).find((match) => match.id === id) ?? null;
}

export async function getHotMatches(): Promise<MatchWithDetails[]> {
  return [...(await allMatches())]
    .filter((match) => match.prediction)
    .sort(
      (a, b) =>
        (b.prediction?.confidence ?? 0) - (a.prediction?.confidence ?? 0)
    )
    .slice(0, 6);
}

export async function getUpcomingMatches(
  limit: number = 8
): Promise<MatchWithDetails[]> {
  return [...(await allMatches())]
    .filter((match) => match.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    )
    .slice(0, limit);
}

export async function getFeaturedMatch(): Promise<MatchWithDetails | null> {
  const upcoming = await getUpcomingMatches(1);
  return upcoming[0] ?? null;
}

export async function getMatchesByTeam(
  teamId: string
): Promise<MatchWithDetails[]> {
  return (await allMatches())
    .filter(
      (match) => match.home_team_id === teamId || match.away_team_id === teamId
    )
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );
}
