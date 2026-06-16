"use client";

import Image from "next/image";
import Link from "next/link";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { MatchWithDetails } from "@/types";

interface UpcomingMatchesProps {
  matches: MatchWithDetails[];
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const { locale, t } = useI18n();

  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        {t.home.noMatches}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {matches.map((match) => {
        const date = new Date(match.match_date);
        const loc = locale === "zh" ? "zh-CN" : "en-US";
        const dateStr = date.toLocaleDateString(loc, {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
        const timeStr = date.toLocaleTimeString(loc, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        return (
          <Link key={match.id} href={`/match/${match.id}`}>
            <div className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/5">
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{dateStr}</span>
                <span className="font-bold text-foreground">{timeStr}</span>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-6 w-8 overflow-hidden rounded-sm">
                    <Image
                      src={getFlagUrl(match.home_team.code)}
                      alt={getTeamName(match.home_team.name, locale)}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getTeamName(match.home_team.name, locale)}
                    </p>
                    {match.home_team.fifa_ranking && (
                      <p className="text-xs text-muted-foreground">
                        #{match.home_team.fifa_ranking}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">vs</span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {getTeamName(match.away_team.name, locale)}
                    </p>
                    {match.away_team.fifa_ranking && (
                      <p className="text-xs text-muted-foreground">
                        #{match.away_team.fifa_ranking}
                      </p>
                    )}
                  </div>
                  <div className="relative h-6 w-8 overflow-hidden rounded-sm">
                    <Image
                      src={getFlagUrl(match.away_team.code)}
                      alt={getTeamName(match.away_team.name, locale)}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {match.venue.name}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
