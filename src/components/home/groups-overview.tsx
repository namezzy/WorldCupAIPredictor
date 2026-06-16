"use client";

import Image from "next/image";
import Link from "next/link";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { Group, GroupStanding } from "@/types";

interface GroupsOverviewProps {
  groupsWithStandings: Array<{
    group: Group;
    standings: GroupStanding[];
  }>;
}

export function GroupsOverview({ groupsWithStandings }: GroupsOverviewProps) {
  const { locale, t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {groupsWithStandings.map(({ group, standings }) => (
        <Link key={group.id} href="/teams">
          <div className="overflow-hidden rounded-2xl border border-border transition-all hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/5">
            {/* Dark header */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-brand-navy to-[#0a2540] px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 font-display text-sm font-bold text-white">
                {group.name}
              </span>
              <span className="text-sm font-medium text-white/80">
                {t.home.group}
              </span>
            </div>

            {/* Team list */}
            <div className="bg-card p-3 space-y-1.5">
              {standings.map((standing) =>
                standing.team ? (
                  <div
                    key={standing.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <div className="relative h-4 w-6 shrink-0 overflow-hidden rounded-sm">
                      <Image
                        src={getFlagUrl(standing.team.code)}
                        alt={getTeamName(standing.team.name, locale)}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">
                      {getTeamName(standing.team.name, locale)}
                    </span>
                    {standing.team.fifa_ranking && (
                      <span className="text-xs text-muted-foreground">
                        #{standing.team.fifa_ranking}
                      </span>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
