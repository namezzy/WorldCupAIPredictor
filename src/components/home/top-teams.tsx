"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { Team, Group } from "@/types";

interface TopTeamsProps {
  teams: Team[];
  groups: Group[];
}

const medalColors = ["#ffd700", "#c0c0c0", "#cd7f32"];

export function TopTeams({ teams, groups }: TopTeamsProps) {
  const { locale, t } = useI18n();
  const groupsById = Object.fromEntries(groups.map((g) => [g.id, g]));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {teams.map((team, i) => {
        const group = team.group_id ? groupsById[team.group_id] : null;
        const medal = i < 3 ? medalColors[i] : null;

        return (
          <Link key={team.id} href={`/team/${team.slug}`}>
            <div className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/5">
              <span className="absolute left-2 top-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                #{i + 1}
              </span>
              {medal && (
                <Trophy
                  className="absolute right-2 top-2 h-4 w-4"
                  style={{ color: medal }}
                />
              )}
              <div className="relative mb-3 mt-2 h-8 w-12 overflow-hidden rounded-sm">
                <Image
                  src={getFlagUrl(team.code)}
                  alt={getTeamName(team.name, locale)}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="text-sm font-medium transition-colors group-hover:text-pitch-green">
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
