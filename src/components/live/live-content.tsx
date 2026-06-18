"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Radio } from "lucide-react";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { getVenueName } from "@/lib/i18n/venues";
import { useLiveMatches } from "@/lib/hooks/use-live-matches";
import type { MatchWithDetails } from "@/types";

/** Parse a match date string as UTC (the upstream times are UTC-based). */
function toUtcDate(value: string): Date {
  return new Date(value.endsWith("Z") ? value : `${value}Z`);
}

/** UTC calendar date, e.g. "2026-06-18". */
function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface LiveContentProps {
  matches: MatchWithDetails[];
}

export function LiveContent({ matches: initialMatches }: LiveContentProps) {
  const { locale } = useI18n();
  const { matches } = useLiveMatches(initialMatches);

  const { liveMatches, todayMatches } = useMemo(() => {
    const todayKey = utcDateKey(new Date());

    const live = matches.filter((m) => m.status === "live");
    const today = matches
      .filter(
        (m) =>
          m.status !== "live" &&
          utcDateKey(toUtcDate(m.match_date)) === todayKey
      )
      .sort(
        (a, b) =>
          toUtcDate(a.match_date).getTime() - toUtcDate(b.match_date).getTime()
      );

    return { liveMatches: live, todayMatches: today };
  }, [matches]);

  const hasLive = liveMatches.length > 0;

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 md:flex-row">
      {/* Main column: live matches */}
      <section className="flex-grow space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                hasLive ? "animate-pulse bg-red-500" : "bg-muted-foreground"
              }`}
            />
            <h1 className="font-display text-3xl font-bold">
              {locale === "zh" ? "实时比赛中心" : "Live Match Center"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Radio className="h-4 w-4" />
            <span>
              {hasLive
                ? locale === "zh"
                  ? "进行中"
                  : "Live"
                : locale === "zh"
                  ? "等待比赛"
                  : "Waiting for matches"}
            </span>
          </div>
        </div>

        {hasLive ? (
          <div className="space-y-4">
            {liveMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Radio className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 font-display text-xl font-bold">
              {locale === "zh"
                ? "当前没有正在进行的比赛"
                : "No matches currently in progress"}
            </h2>
            <p className="text-muted-foreground">
              {locale === "zh"
                ? "请在比赛日访问此页面查看实时更新"
                : "Visit this page on match days for live updates"}
            </p>
          </div>
        )}
      </section>

      {/* Sidebar: today's schedule */}
      <aside className="w-full shrink-0 space-y-4 lg:w-80">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
          {locale === "zh" ? "今日赛程" : "Today's Schedule"}
        </h2>
        {todayMatches.length > 0 ? (
          <div className="space-y-3">
            {todayMatches.map((match) => (
              <ScheduleCard key={match.id} match={match} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {locale === "zh"
              ? "今日暂无比赛安排"
              : "No matches scheduled for today"}
          </div>
        )}
      </aside>
    </main>
  );
}

function LiveMatchCard({
  match,
  locale,
}: {
  match: MatchWithDetails;
  locale: string;
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
              {locale === "zh"
                ? `${match.group.name}组`
                : `Group ${match.group.name}`}
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

function ScheduleCard({
  match,
  locale,
}: {
  match: MatchWithDetails;
  locale: string;
}) {
  const time = toUtcDate(match.match_date).toLocaleTimeString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-pitch-green"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-3 w-4 shrink-0 overflow-hidden rounded-sm">
            <Image
              src={getFlagUrl(match.home_team.code)}
              alt={getTeamName(match.home_team.name, locale)}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="text-sm font-medium">
            {getTeamName(match.home_team.name, locale)}
          </span>
        </div>

        <span className="text-xs text-muted-foreground">
          {time}
          <span className="ml-1 text-[10px]">
            {locale === "zh" ? "北京时间" : "CST"}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {getTeamName(match.away_team.name, locale)}
          </span>
          <div className="relative h-3 w-4 shrink-0 overflow-hidden rounded-sm">
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
      <div className="mt-1 text-center text-[10px] text-muted-foreground">
        {getVenueName(match.venue.name, locale)}
      </div>
    </Link>
  );
}
