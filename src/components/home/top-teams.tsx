"use client";

import Image from "next/image";
import Link from "next/link";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { Team, Group } from "@/types";

interface TopTeamsProps {
  teams: Team[];
  groups: Group[];
}

export function TopTeams({ teams, groups }: TopTeamsProps) {
  const { locale, t } = useI18n();
  const groupsById = Object.fromEntries(groups.map((g) => [g.id, g]));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {teams.map((team) => {
        const group = team.group_id ? groupsById[team.group_id] : null;

        return (
          <Link key={team.id} href={`/team/${team.slug}`}>
            <div className="group flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/5">
              <div className="relative mb-3 h-8 w-12 overflow-hidden rounded-sm">
                <Image
                  src={getFlagUrl(team.code)}
                  alt={getTeamName(team.name, locale)}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="mb-1 text-xs font-bold text-brand-gold">
                #{team.fifa_ranking}
              </span>
              <p className="text-sm font-medium">
                {getTeamName(team.name, locale)}
              </p>
              {group && (
                <span className="mt-1 text-xs text-muted-foreground">
                  {group.name} {t.home.group}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
