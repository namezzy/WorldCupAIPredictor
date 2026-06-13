import { Group, GroupStanding } from "@/types";

import { mockGroups, mockStandings } from "./mock-data";

export async function getAllGroups(): Promise<Group[]> {
  return [...mockGroups];
}

export async function getGroupStandings(groupId: string): Promise<GroupStanding[]> {
  return mockStandings
    .filter((standing) => standing.group_id === groupId)
    .sort((a, b) => a.position - b.position);
}

export async function getAllGroupsWithStandings(): Promise<
  Array<{ group: Group; standings: GroupStanding[] }>
> {
  const groups = await getAllGroups();

  return Promise.all(
    groups.map(async (group) => ({
      group,
      standings: await getGroupStandings(group.id),
    }))
  );
}
