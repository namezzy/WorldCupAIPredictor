import type { Metadata } from "next";

import { GroupGrid } from "@/components/groups/group-grid";
import { getAllGroups } from "@/lib/data/groups";

export const metadata: Metadata = {
  title: "Groups",
  description: "FIFA World Cup 2026 group stage standings and results",
};

export default async function GroupsPage() {
  const groups = await getAllGroups();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 font-display text-4xl font-bold">Group Stage</h1>
      <p className="mb-8 text-muted-foreground">
        12 groups of 4 teams competing for knockout stage qualification
      </p>
      <GroupGrid groups={groups} />
    </div>
  );
}
