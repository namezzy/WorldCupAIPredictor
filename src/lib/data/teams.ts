import { Team } from "@/types";

import { getLiveData } from "./worldcup-api";

async function allTeams(): Promise<Team[]> {
  const { teams } = await getLiveData();
  return teams;
}

export async function getAllTeams(): Promise<Team[]> {
  return [...(await allTeams())].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  return (await allTeams()).find((team) => team.slug === slug) ?? null;
}

export async function getTeamsByGroup(groupId: string): Promise<Team[]> {
  return (await allTeams())
    .filter((team) => team.group_id === groupId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTopRankedTeams(limit: number = 12): Promise<Team[]> {
  return [...(await allTeams())]
    .filter((team) => team.fifa_ranking !== null)
    .sort((a, b) => (a.fifa_ranking ?? 999) - (b.fifa_ranking ?? 999))
    .slice(0, limit);
}

export async function getTeamById(id: string): Promise<Team | null> {
  return (await allTeams()).find((team) => team.id === id) ?? null;
}

export async function searchTeams(query: string): Promise<Team[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return getAllTeams();
  }

  return (await allTeams())
    .filter((team) => {
      return (
        team.name.toLowerCase().includes(normalizedQuery) ||
        team.code.toLowerCase().includes(normalizedQuery) ||
        team.confederation.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
