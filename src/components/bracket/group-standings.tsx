"use client";

import { useMemo } from "react";
import Link from "next/link";

import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { cn, getFlagUrl } from "@/lib/utils";
import type { Group, GroupStanding } from "@/types";

export interface GroupWithStandings {
  group: Group;
  standings: GroupStanding[];
}

/** Compute the team ids of the 8 best third-placed teams across all groups. */
function bestThirdTeamIds(groups: GroupWithStandings[]): Set<string> {
  const thirds = groups
    .map((g) => [...g.standings].sort((a, b) => a.position - b.position)[2])
    .filter(Boolean) as GroupStanding[];

  thirds.sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for
  );

  return new Set(thirds.slice(0, 8).map((s) => s.team_id));
}

function StandingRow({
  standing,
  rank,
  qualifies,
  bestThird,
  locale,
}: {
  standing: GroupStanding;
  rank: number;
  qualifies: boolean;
  bestThird: boolean;
  locale: string;
}) {
  const team = standing.team;
  const flag = team ? team.flag_url || getFlagUrl(team.code) : null;
  const diff = standing.goal_difference;

  const teamInner = (
    <>
      <span className="w-4 text-center text-[11px] tabular-nums text-muted-foreground/60">
        {rank}
      </span>
      <span className="flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-white/5 bg-black/10">
        {flag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flag}
            alt={team?.code ?? ""}
            className="h-3 w-4 rounded-sm object-cover"
            loading="lazy"
          />
        ) : null}
      </span>
      <span className="truncate font-medium">
        {team ? getTeamName(team.name, locale) : "—"}
      </span>
    </>
  );

  return (
    <tr
      className={cn(
        "border-t border-border/30 border-l-2 transition-colors hover:bg-secondary/40",
        qualifies
          ? "border-l-green-500"
          : bestThird
            ? "border-l-brand-gold"
            : "border-l-transparent"
      )}
    >
      <td className="px-3 py-1.5">
        {team ? (
          <Link
            href={`/team/${team.slug}`}
            className="flex min-w-0 items-center gap-2 hover:underline"
          >
            {teamInner}
          </Link>
        ) : (
          <span className="flex min-w-0 items-center gap-2">{teamInner}</span>
        )}
      </td>
      <td className="text-center font-bold tabular-nums">{standing.points}</td>
      <td className="text-center tabular-nums text-muted-foreground">
        {standing.played}
      </td>
      <td className="text-center tabular-nums text-muted-foreground">
        {diff > 0 ? `+${diff}` : diff}
      </td>
    </tr>
  );
}

export function GroupStandings({
  groupsWithStandings,
}: {
  groupsWithStandings: GroupWithStandings[];
}) {
  const { locale } = useI18n();
  const isZh = locale === "zh";

  const bestThirds = useMemo(
    () => bestThirdTeamIds(groupsWithStandings),
    [groupsWithStandings]
  );

  if (groupsWithStandings.length === 0) return null;

  const th = isZh
    ? { team: "球队", pts: "积分", played: "场次", gd: "净胜" }
    : { team: "Team", pts: "Pts", played: "P", gd: "GD" };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold">
          {isZh ? "小组积分榜" : "Group Standings"}
        </h2>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
            {isZh ? "直接出线（前二）" : "Qualified (Top 2)"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-gold" />
            {isZh ? "最佳第三名" : "Best 3rd Place"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groupsWithStandings.map(({ group, standings }) => {
          const sorted = [...standings].sort((a, b) => a.position - b.position);
          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-xl border border-border/60 bg-card/70"
            >
              <div className="border-b border-border/40 bg-secondary/50 px-3 py-2">
                <span className="text-sm font-bold">
                  {isZh ? `${group.name} 组` : `Group ${group.name}`}
                </span>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    <th className="px-3 py-1.5 text-left font-medium">
                      {th.team}
                    </th>
                    <th className="w-8 py-1.5 text-center font-medium">
                      {th.pts}
                    </th>
                    <th className="w-8 py-1.5 text-center font-medium">
                      {th.played}
                    </th>
                    <th className="w-8 py-1.5 text-center font-medium">
                      {th.gd}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((standing, i) => (
                    <StandingRow
                      key={standing.id}
                      standing={standing}
                      rank={i + 1}
                      qualifies={i < 2}
                      bestThird={
                        i === 2 && bestThirds.has(standing.team_id)
                      }
                      locale={locale}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
