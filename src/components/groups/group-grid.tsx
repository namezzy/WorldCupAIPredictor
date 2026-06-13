import { getGroupStandings } from "@/lib/data/groups";
import { Group } from "@/types";

import { GroupTable } from "./group-table";

interface GroupGridProps {
  groups: Group[];
}

export async function GroupGrid({ groups }: GroupGridProps) {
  const groupsWithStandings = await Promise.all(
    groups.map(async (group) => ({
      group,
      standings: await getGroupStandings(group.id),
    }))
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {groupsWithStandings.map(({ group, standings }) => (
        <GroupTable key={group.id} groupName={group.name} standings={standings} />
      ))}
    </div>
  );
}
