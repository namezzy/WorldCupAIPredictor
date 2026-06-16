"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturedMatch } from "@/components/home/featured-match";
import { UpcomingMatches } from "@/components/home/upcoming-matches";
import { TopTeams } from "@/components/home/top-teams";
import { GroupsOverview } from "@/components/home/groups-overview";
import { CtaSection } from "@/components/home/cta-section";
import { useI18n } from "@/lib/i18n";
import { MatchWithDetails, Team, Group, GroupStanding } from "@/types";

interface HomeContentProps {
  upcomingMatches: MatchWithDetails[];
  featuredMatch: MatchWithDetails | null;
  topTeams: Team[];
  groups: Group[];
  groupsWithStandings: Array<{ group: Group; standings: GroupStanding[] }>;
}

function SectionHeader({
  title,
  hint,
  linkText,
  linkHref,
}: {
  title: string;
  hint?: string;
  linkText: string;
  linkHref: string;
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="flex items-center gap-3 font-display text-2xl font-bold">
          {title}
        </h2>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      <Link
        href={linkHref}
        className="inline-flex items-center gap-1 text-sm font-bold text-pitch-green transition-colors hover:underline"
      >
        {linkText}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function HomeContent({
  upcomingMatches,
  featuredMatch,
  topTeams,
  groups,
  groupsWithStandings,
}: HomeContentProps) {
  const { t } = useI18n();

  return (
    <div className="pb-0">
      <HeroSection />

      {/* Featured Match + AI Showcase (2-column) */}
      {featuredMatch && <FeaturedMatch match={featuredMatch} />}

      {/* Upcoming Matches */}
      <section className="mx-auto max-w-[1280px] px-4 py-12">
        <SectionHeader
          title={t.home.upcoming}
          hint={t.home.upcomingHint}
          linkText={t.home.fullSchedule}
          linkHref="/schedule"
        />
        <UpcomingMatches matches={upcomingMatches} />
      </section>

      {/* Top Teams - with alt background */}
      <section className="bg-card/50 py-12">
        <div className="mx-auto max-w-[1280px] px-4">
          <SectionHeader
            title={t.home.topTeams}
            hint={t.home.topTeamsHint}
            linkText={t.home.allTeams}
            linkHref="/teams"
          />
          <TopTeams teams={topTeams} groups={groups} />
        </div>
      </section>

      {/* Groups */}
      <section className="mx-auto max-w-[1280px] px-4 py-12">
        <SectionHeader
          title={t.home.groups}
          hint={t.home.groupsDesc}
          linkText={t.home.viewAllGroups}
          linkHref="/teams"
        />
        <GroupsOverview groupsWithStandings={groupsWithStandings} />
      </section>

      {/* CTA */}
      <CtaSection />
    </div>
  );
}
