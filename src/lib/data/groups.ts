import { Group, GroupStanding } from "@/types";

import { getLiveData } from "./worldcup-api";

export async function getAllGroups(): Promise<Group[]> {
  const { groupsWithStandings } = await getLiveData();
  return groupsWithStandings.map((g) => g.group);
}

export async function getGroupStandings(
  groupId: string
): Promise<GroupStanding[]> {
  const { groupsWithStandings } = await getLiveData();
  const entry = groupsWithStandings.find((g) => g.group.id === groupId);
  return entry ? [...entry.standings].sort((a, b) => a.position - b.position) : [];
}

export async function getAllGroupsWithStandings(): Promise<
  Array<{ group: Group; standings: GroupStanding[] }>
> {
  const { groupsWithStandings } = await getLiveData();
  return groupsWithStandings;
}
