"use client";

import Image from "next/image";
import Link from "next/link";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { Team, Group } from "@/types";

interface TeamsContentProps {
  teams: Team[];
  groups: Group[];
}

export function TeamsContent({ teams, groups }: TeamsContentProps) {
  const { locale } = useI18n();

  // Group teams by their group_id
  const teamsByGroup = groups.map((group) => ({
    group,
    teams: teams.filter((t) => t.group_id === group.id),
  }));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      {/* Page header */}
      <h1 className="mb-1 font-display text-3xl font-bold md:text-4xl">
        {locale === "zh" ? "48支参赛队伍" : "48 Participating Teams"}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {locale === "zh"
          ? "点击队伍查看详情、阵容和赛程"
          : "Click a team for details, squad and schedule"}
      </p>

      {/* Groups */}
      <div className="space-y-10">
        {teamsByGroup.map(({ group, teams: groupTeams }) => (
          <div key={group.id}>
            {/* Group header badge */}
            <div className="mb-4 inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-300/20 text-sm font-bold text-blue-300 ring-2 ring-blue-300/40">
                {group.name}
              </span>
              <span className="text-xl font-bold text-slate-200">
                {locale === "zh" ? `${group.name}组` : `Group ${group.name}`}
              </span>
            </div>

            {/* Team cards grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {groupTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card/80 px-4 py-3 transition-all hover:border-green-500/50 hover:bg-card"
                >
                  <div className="relative h-7 w-10 shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                    <Image
                      src={getFlagUrl(team.code)}
                      alt={getTeamName(team.name, locale)}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold transition-colors group-hover:text-green-400">
                      {getTeamName(team.name, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      FIFA #{team.fifa_ranking ?? "N/A"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
