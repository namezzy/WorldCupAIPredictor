"use client";

import Image from "next/image";
import Link from "next/link";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { GroupStanding } from "@/types";

interface GroupTableProps {
  groupName: string;
  standings: GroupStanding[];
}

export function GroupTable({ groupName, standings }: GroupTableProps) {
  const { locale } = useI18n();
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border/50 bg-brand-gold/5 px-4 py-3">
        <h3 className="font-display text-lg font-bold">Group {groupName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground">
              <th className="w-8 px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="w-8 px-1 py-2 text-center">P</th>
              <th className="w-8 px-1 py-2 text-center">W</th>
              <th className="w-8 px-1 py-2 text-center">D</th>
              <th className="w-8 px-1 py-2 text-center">L</th>
              <th className="w-10 px-1 py-2 text-center">GF</th>
              <th className="w-10 px-1 py-2 text-center">GA</th>
              <th className="w-10 px-1 py-2 text-center">GD</th>
              <th className="w-10 px-3 py-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-border/30 transition-colors hover:bg-secondary/50 ${
                  index < 2 ? "bg-green-500/5" : ""
                }`}
              >
                <td className="px-3 py-2.5 text-muted-foreground">{row.position}</td>
                <td className="px-3 py-2.5">
                  {row.team ? (
                    <Link
                      href={`/team/${row.team.slug}`}
                      className="flex items-center gap-2 transition-colors hover:text-brand-gold"
                    >
                      <div className="relative h-4 w-6 shrink-0">
                        <Image
                          src={getFlagUrl(row.team.code)}
                          alt={getTeamName(row.team.name, locale)}
                          fill
                          className="rounded-[2px] object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="truncate font-medium">{getTeamName(row.team.name, locale)}</span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">TBD</span>
                  )}
                </td>
                <td className="px-1 py-2.5 text-center">{row.played}</td>
                <td className="px-1 py-2.5 text-center">{row.won}</td>
                <td className="px-1 py-2.5 text-center">{row.drawn}</td>
                <td className="px-1 py-2.5 text-center">{row.lost}</td>
                <td className="px-1 py-2.5 text-center">{row.goals_for}</td>
                <td className="px-1 py-2.5 text-center">{row.goals_against}</td>
                <td className="px-1 py-2.5 text-center">
                  <span
                    className={
                      row.goal_difference > 0
                        ? "text-green-400"
                        : row.goal_difference < 0
                          ? "text-red-400"
                          : ""
                    }
                  >
                    {row.goal_difference > 0 ? "+" : ""}
                    {row.goal_difference}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center font-bold">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/30 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-green-500/20" />
          <span>Qualifies for knockout stage</span>
        </div>
      </div>
    </div>
  );
}
