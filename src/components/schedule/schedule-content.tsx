"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, ListFilter } from "lucide-react";

import { getFlagUrl, getStageLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import type { MatchWithDetails, Group, Team } from "@/types";

interface ScheduleContentProps {
  matches: MatchWithDetails[];
  groups: Group[];
  teams: Team[];
}

const stages = [
  { value: "all", en: "All Stages", zh: "全部阶段" },
  { value: "group", en: "Group Stage", zh: "小组赛" },
  { value: "round_of_32", en: "Round of 32", zh: "1/16决赛" },
  { value: "round_of_16", en: "Round of 16", zh: "1/8决赛" },
  { value: "quarter_final", en: "Quarter Final", zh: "1/4决赛" },
  { value: "semi_final", en: "Semi Final", zh: "半决赛" },
  { value: "third_place", en: "3rd Place", zh: "三四名决赛" },
  { value: "final", en: "Final", zh: "决赛" },
];

function getMatchDates(matches: MatchWithDetails[]): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    set.add(m.match_date.slice(0, 10));
  }
  return Array.from(set).sort();
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ScheduleContent({ matches, groups, teams }: ScheduleContentProps) {
  const { locale } = useI18n();

  const [filterDate, setFilterDate] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");

  const allDates = useMemo(() => getMatchDates(matches), [matches]);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (filterDate !== "all" && !m.match_date.startsWith(filterDate)) return false;
      if (filterGroup !== "all" && m.group_id !== filterGroup) return false;
      if (filterStage !== "all" && m.stage !== filterStage) return false;
      if (filterTeam !== "all" && m.home_team_id !== filterTeam && m.away_team_id !== filterTeam) return false;
      return true;
    });
  }, [matches, filterDate, filterGroup, filterStage, filterTeam]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const map = new Map<string, MatchWithDetails[]>();
    for (const m of filtered) {
      const key = m.match_date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const selectClass =
    "w-full rounded border border-border bg-card px-2 py-1.5 text-sm focus:border-brand-gold focus:outline-none";
  const labelClass =
    "text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      {/* Header */}
      <h1 className="mb-1 font-display text-3xl font-bold md:text-4xl">
        {locale === "zh" ? "2026 世界杯赛程" : "2026 World Cup Schedule"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {locale === "zh"
          ? "实时比赛数据与 AI 预测建模，覆盖 2026 赛事全周期。"
          : "Live match data and AI prediction modeling across the full 2026 tournament."}
      </p>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ListFilter className="h-4 w-4" />
          {locale === "zh" ? "筛选条件" : "Filters"}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Date filter */}
          <div className="space-y-1">
            <label className={labelClass}>
              {locale === "zh" ? "日期" : "Date"}
            </label>
            <select
              className={selectClass}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">
                {locale === "zh" ? "全部日期" : "All Dates"}
              </option>
              {allDates.map((d) => (
                <option key={d} value={d}>
                  {formatDateShort(d)}
                </option>
              ))}
            </select>
          </div>

          {/* Group filter */}
          <div className="space-y-1">
            <label className={labelClass}>
              {locale === "zh" ? "小组" : "Group"}
            </label>
            <select
              className={selectClass}
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            >
              <option value="all">
                {locale === "zh" ? "全部小组" : "All Groups"}
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {locale === "zh" ? `${g.name}组` : `Group ${g.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Stage filter */}
          <div className="space-y-1">
            <label className={labelClass}>
              {locale === "zh" ? "阶段" : "Stage"}
            </label>
            <select
              className={selectClass}
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
            >
              {stages.map((s) => (
                <option key={s.value} value={s.value}>
                  {locale === "zh" ? s.zh : s.en}
                </option>
              ))}
            </select>
          </div>

          {/* Team filter */}
          <div className="space-y-1">
            <label className={labelClass}>
              {locale === "zh" ? "球队" : "Team"}
            </label>
            <select
              className={selectClass}
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              <option value="all">
                {locale === "zh" ? "全部球队" : "All Teams"}
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {getTeamName(t.name, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Match count */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {locale === "zh"
            ? `共找到 ${filtered.length} 场比赛`
            : `${filtered.length} matches found`}
        </span>
        <div className="h-px flex-grow bg-border" />
      </div>

      {/* Match list by date */}
      {matchesByDate.length > 0 ? (
        <div className="space-y-8">
          {matchesByDate.map(([dateKey, dayMatches]) => {
            const dateObj = new Date(dateKey + "T00:00:00");
            const dateLabel = dateObj.toLocaleDateString(
              locale === "zh" ? "zh-CN" : "en-US",
              { year: "numeric", month: "long", day: "numeric", weekday: "short" }
            );

            return (
              <div key={dateKey}>
                {/* Date separator */}
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-pitch-green">
                    {dateLabel}
                  </span>
                  <div className="h-px flex-grow bg-border" />
                </div>

                {/* Match cards */}
                <div className="space-y-4">
                  {dayMatches.map((match) => (
                    <ScheduleMatchCard
                      key={match.id}
                      match={match}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {locale === "zh" ? "没有符合条件的比赛" : "No matches match your filters"}
        </div>
      )}
    </div>
  );
}

function ScheduleMatchCard({
  match,
  locale,
}: {
  match: MatchWithDetails;
  locale: string;
}) {
  const isFinished = match.status === "finished";
  const stageLabel = match.group
    ? locale === "zh"
      ? `${match.group.name}组`
      : `Group ${match.group.name}`
    : getStageLabel(match.stage);

  const time = new Date(match.match_date).toLocaleTimeString(
    locale === "zh" ? "zh-CN" : "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  );

  const fullDate = new Date(match.match_date).toLocaleDateString(
    locale === "zh" ? "zh-CN" : "en-US",
    { year: "numeric", month: "2-digit", day: "2-digit" }
  );

  return (
    <Link href={`/match/${match.id}`} className="block">
      <article className="overflow-hidden rounded-xl border border-border border-l-4 border-l-pitch-green bg-card transition-all hover:shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Left: match info */}
          <div className="flex flex-col justify-between border-b border-border p-6 md:w-2/5 md:border-b-0 md:border-r">
            {/* Stage & time */}
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded bg-pitch-green/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-pitch-green">
                {stageLabel}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {time}
              </span>
            </div>

            {/* Teams VS */}
            <div className="my-4 flex items-center justify-between gap-4">
              {/* Home team */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
                  <div className="relative h-6 w-8">
                    <Image
                      src={getFlagUrl(match.home_team.code)}
                      alt={getTeamName(match.home_team.name, locale)}
                      fill
                      className="rounded-sm object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <span className="w-full truncate text-center text-xs font-bold tracking-tight sm:text-sm">
                  {getTeamName(match.home_team.name, locale)}
                </span>
              </div>

              {/* Score or VS */}
              <div className="flex shrink-0 flex-col items-center">
                {isFinished && match.home_score !== null ? (
                  <span className="font-display text-2xl font-bold">
                    {match.home_score} - {match.away_score}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                    VS
                  </span>
                )}
              </div>

              {/* Away team */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
                  <div className="relative h-6 w-8">
                    <Image
                      src={getFlagUrl(match.away_team.code)}
                      alt={getTeamName(match.away_team.name, locale)}
                      fill
                      className="rounded-sm object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <span className="w-full truncate text-center text-xs font-bold tracking-tight sm:text-sm">
                  {getTeamName(match.away_team.name, locale)}
                </span>
              </div>
            </div>

            {/* Venue */}
            <div className="mt-auto flex min-w-0 items-center gap-1 pt-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs">
                {match.venue.name}, {match.venue.city}
              </span>
            </div>
          </div>

          {/* Right: date & venue detail */}
          <div className="flex flex-col items-center justify-center bg-secondary/20 p-6 text-center md:w-3/5">
            <p className="mb-2 text-sm font-bold">
              {fullDate}
            </p>
            <p className="text-xs text-muted-foreground">
              {match.venue.name}
            </p>
            {match.prediction && (
              <div className="mt-4 w-full max-w-xs">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{getTeamName(match.home_team.name, locale)} {match.prediction.home_win_prob}%</span>
                  <span>{locale === "zh" ? "平" : "Draw"} {match.prediction.draw_prob}%</span>
                  <span>{getTeamName(match.away_team.name, locale)} {match.prediction.away_win_prob}%</span>
                </div>
                <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="bg-green-500" style={{ width: `${match.prediction.home_win_prob}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${match.prediction.draw_prob}%` }} />
                  <div className="bg-red-500" style={{ width: `${match.prediction.away_win_prob}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
