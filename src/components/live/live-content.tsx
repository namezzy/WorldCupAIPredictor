"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Radio, Clock, MapPin } from "lucide-react";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import type { MatchWithDetails } from "@/types";

interface LiveContentProps {
  matches: MatchWithDetails[];
}

export function LiveContent({ matches }: LiveContentProps) {
  const { locale } = useI18n();

  // Separate live, today's scheduled, and recently finished matches
  const { liveMatches, todayMatches, recentMatches } = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    const live = matches.filter((m) => m.status === "live");
    const today = matches.filter(
      (m) => m.status === "scheduled" && m.match_date.startsWith(todayKey)
    );
    const recent = matches
      .filter((m) => m.status === "finished")
      .sort(
        (a, b) =>
          new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
      )
      .slice(0, 6);

    return { liveMatches: live, todayMatches: today, recentMatches: recent };
  }, [matches]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Main content */}
        <div className="flex-grow space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold md:text-4xl">
                {locale === "zh" ? "实时比赛中心" : "Live Match Center"}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>UTC</span>
            </div>
          </div>

          {/* Live matches section */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  liveMatches.length > 0
                    ? "animate-pulse bg-red-500"
                    : "bg-muted-foreground"
                }`}
              />
              <h2 className="font-display text-lg font-bold">
                {locale === "zh" ? "等待比赛" : "Waiting for Matches"}
              </h2>
            </div>

            {liveMatches.length > 0 ? (
              <div className="space-y-4">
                {liveMatches.map((match) => (
                  <LiveMatchCard key={match.id} match={match} locale={locale} isLive />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Radio className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="mb-2 font-display text-lg font-bold">
                  {locale === "zh"
                    ? "当前没有正在进行的比赛"
                    : "No matches currently in progress"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh"
                    ? "请在比赛日访问此页面查看实时更新"
                    : "Visit this page on match days for live updates"}
                </p>
              </div>
            )}
          </section>

          {/* Today's schedule */}
          <section>
            <h2 className="mb-4 font-display text-lg font-bold">
              {locale === "zh" ? "今日赛程" : "Today's Schedule"}
            </h2>

            {todayMatches.length > 0 ? (
              <div className="space-y-3">
                {todayMatches.map((match) => (
                  <TodayMatchCard key={match.id} match={match} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {locale === "zh"
                  ? "今日暂无比赛安排"
                  : "No matches scheduled for today"}
              </div>
            )}
          </section>

          {/* Recent results */}
          {recentMatches.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-bold">
                {locale === "zh" ? "近期赛果" : "Recent Results"}
              </h2>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <TodayMatchCard
                    key={match.id}
                    match={match}
                    locale={locale}
                    showScore
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveMatchCard({
  match,
  locale,
  isLive,
}: {
  match: MatchWithDetails;
  locale: string;
  isLive?: boolean;
}) {
  return (
    <Link href={`/match/${match.id}`} className="block">
      <div className="overflow-hidden rounded-xl border-2 border-red-500/30 bg-card transition-all hover:shadow-lg">
        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            {locale === "zh" ? "进行中" : "LIVE"}
          </span>
          {match.group && (
            <span className="ml-auto text-xs text-muted-foreground">
              {locale === "zh" ? `${match.group.name}组` : `Group ${match.group.name}`}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-12 overflow-hidden rounded-sm">
              <Image
                src={getFlagUrl(match.home_team.code)}
                alt={getTeamName(match.home_team.name, locale)}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-bold">
              {getTeamName(match.home_team.name, locale)}
            </span>
          </div>
          <div className="font-display text-3xl font-bold">
            {match.home_score ?? 0} - {match.away_score ?? 0}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">
              {getTeamName(match.away_team.name, locale)}
            </span>
            <div className="relative h-8 w-12 overflow-hidden rounded-sm">
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
      </div>
    </Link>
  );
}

function TodayMatchCard({
  match,
  locale,
  showScore,
}: {
  match: MatchWithDetails;
  locale: string;
  showScore?: boolean;
}) {
  const time = new Date(match.match_date).toLocaleTimeString(
    locale === "zh" ? "zh-CN" : "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  );

  return (
    <Link href={`/match/${match.id}`} className="block">
      <div className="flex items-center rounded-lg border border-border bg-card p-4 transition-colors hover:border-pitch-green">
        {/* Home team */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative h-4 w-6 shrink-0 overflow-hidden rounded-sm">
            <Image
              src={getFlagUrl(match.home_team.code)}
              alt={getTeamName(match.home_team.name, locale)}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="truncate text-sm font-bold">
            {getTeamName(match.home_team.name, locale)}
          </span>
        </div>

        {/* Score / Time */}
        <div className="mx-4 shrink-0 text-center">
          {showScore && match.home_score !== null ? (
            <span className="font-display text-lg font-bold">
              {match.home_score} - {match.away_score}
            </span>
          ) : (
            <div>
              <span className="font-display text-sm font-bold">{time}</span>
              <span className="ml-1 text-[10px] text-muted-foreground">UTC</span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="truncate text-sm font-bold">
            {getTeamName(match.away_team.name, locale)}
          </span>
          <div className="relative h-4 w-6 shrink-0 overflow-hidden rounded-sm">
            <Image
              src={getFlagUrl(match.away_team.code)}
              alt={getTeamName(match.away_team.name, locale)}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Venue */}
        <div className="ml-4 hidden items-center gap-1 text-xs text-muted-foreground md:flex">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{match.venue.name}</span>
        </div>
      </div>
    </Link>
  );
}
