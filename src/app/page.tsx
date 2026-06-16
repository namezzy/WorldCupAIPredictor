import { HomeContent } from "@/components/home/home-content";
import {
  getUpcomingMatches,
  getFeaturedMatch,
} from "@/lib/data/matches";
import { getTopRankedTeams } from "@/lib/data/teams";
import { getAllGroups, getAllGroupsWithStandings } from "@/lib/data/groups";

export default async function HomePage() {
  const [upcomingMatches, featuredMatch, topTeams, groups, groupsWithStandings] =
    await Promise.all([
      getUpcomingMatches(8),
      getFeaturedMatch(),
      getTopRankedTeams(12),
      getAllGroups(),
      getAllGroupsWithStandings(),
    ]);

  return (
    <HomeContent
      upcomingMatches={upcomingMatches}
      featuredMatch={featuredMatch}
      topTeams={topTeams}
      groups={groups}
      groupsWithStandings={groupsWithStandings}
    />
  );
}
