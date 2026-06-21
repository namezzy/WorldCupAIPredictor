"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  ListFilter,
  MapPin,
} from "lucide-react";

import { getFlagUrl, getStageLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { getVenueName } from "@/lib/i18n/venues";
import type { MatchWithDetails, Group, Team } from "@/types";

interface ScheduleContentProps {
  matches: MatchWithDetails[];
  groups: Group[];
  teams: Team[];
}

type ViewMode = "calendar" | "list";

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

const weekdaysZh = ["一", "二", "三", "四", "五", "六", "日"];
const weekdaysEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = lastDay.getDate();
  return { startDow, daysInMonth };
}

function getMatchTime(matchDate: string): string {
  const d = new Date(matchDate);
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ScheduleContent({ matches, groups, teams }: ScheduleContentProps) {
  const { locale } = useI18n();

  const [filterDate, setFilterDate] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    // Default to month of first match or current month
    const firstMatch = matches[0];
    if (firstMatch) {
      const d = new Date(firstMatch.match_date);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

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

  // Group filtered matches by date key
  const matchesByDate = useMemo(() => {
    const map = new Map<string, MatchWithDetails[]>();
    for (const m of filtered) {
      const key = m.match_date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [filtered]);

  // Featured match: next upcoming or latest match
  const featuredMatch = useMemo(() => {
    const now = new Date();
    const upcoming = filtered
      .filter((m) => new Date(m.match_date) > now)
      .sort((a, b) => a.match_date.localeCompare(b.match_date));
    return upcoming[0] || filtered[filtered.length - 1] || null;
  }, [filtered]);

  const prevMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
    });
  }, []);

  const monthLabel = useMemo(() => {
    const d = new Date(calendarMonth.year, calendarMonth.month, 1);
    if (locale === "zh") {
      const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
      return `${months[calendarMonth.month]} ${calendarMonth.year}`;
    }
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [calendarMonth, locale]);

  const selectClass =
    "w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none appearance-none";
  const labelClass =
    "text-xs font-medium text-muted-foreground";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      {/* Header card */}
      <div className="mb-6 rounded-2xl border border-border bg-card/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-1 font-display text-3xl font-bold md:text-4xl">
              {locale === "zh" ? "2026 世界杯赛程" : "2026 World Cup Schedule"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {locale === "zh"
                ? "实时比赛数据与 AI 预测建模，覆盖 2026 赛事全周期。"
                : "Live match data and AI prediction modeling across the full 2026 tournament."}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListFilter className="h-4 w-4" />
            {locale === "zh" ? "筛选条件" : "Filters"}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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
      </div>

      {/* Featured Match */}
      {featuredMatch && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-bold text-green-400">
              {locale === "zh" ? "焦点比赛" : "Featured Match"}
            </span>
            <div className="h-px flex-grow bg-border" />
          </div>
          <FeaturedMatchCard match={featuredMatch} locale={locale} />
        </div>
      )}

      {/* Schedule Calendar Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              {locale === "zh" ? "赛程日历" : "Schedule Calendar"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {locale === "zh"
                ? `共找到 ${filtered.length} 场比赛 · 时间以 GMT+8 显示`
                : `${filtered.length} matches found · Times in local timezone`}
            </p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "calendar"
                  ? "bg-brand-gold/20 text-brand-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={locale === "zh" ? "日历视图" : "Calendar view"}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-brand-gold/20 text-brand-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={locale === "zh" ? "列表视图" : "List view"}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CalendarView
          calendarMonth={calendarMonth}
          monthLabel={monthLabel}
          matchesByDate={matchesByDate}
          locale={locale}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />
      ) : (
        <ListView matchesByDate={matchesByDate} locale={locale} filtered={filtered} />
      )}
    </div>
  );
}

/* ─── Featured Match Card ──────────────────────────────────────────────────── */

function FeaturedMatchCard({ match, locale }: { match: MatchWithDetails; locale: string }) {
  const isFinished = match.status === "finished";
  const stageLabel = match.group
    ? locale === "zh" ? `${match.group.name}组` : `Group ${match.group.name}`
    : getStageLabel(match.stage);

  const time = getMatchTime(match.match_date);
  const fullDate = new Date(match.match_date).toLocaleDateString(
    locale === "zh" ? "zh-CN" : "en-US",
    { year: "numeric", month: "2-digit", day: "2-digit" }
  );

  return (
    <Link href={`/match/${match.id}`} className="block">
      <article className="overflow-hidden rounded-2xl border border-border border-l-4 border-l-green-500 bg-card transition-all hover:shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Left: match info */}
          <div className="flex flex-col justify-between border-b border-border p-6 md:w-1/2 md:border-b-0 md:border-r">
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400">
                {stageLabel}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {time}
              </span>
            </div>

            <div className="my-4 flex items-center justify-between gap-6">
              {/* Home team */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative h-12 w-16">
                  <Image
                    src={getFlagUrl(match.home_team.code)}
                    alt={getTeamName(match.home_team.name, locale)}
                    fill
                    className="rounded object-cover"
                    unoptimized
                  />
                </div>
                <span className="w-full truncate text-center text-sm font-bold">
                  {getTeamName(match.home_team.name, locale)}
                </span>
              </div>

              {/* Score / VS */}
              <div className="flex shrink-0 flex-col items-center">
                {isFinished && match.home_score !== null ? (
                  <span className="font-display text-3xl font-bold">
                    {match.home_score} - {match.away_score}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground/60">vs</span>
                )}
              </div>

              {/* Away team */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative h-12 w-16">
                  <Image
                    src={getFlagUrl(match.away_team.code)}
                    alt={getTeamName(match.away_team.name, locale)}
                    fill
                    className="rounded object-cover"
                    unoptimized
                  />
                </div>
                <span className="w-full truncate text-center text-sm font-bold">
                  {getTeamName(match.away_team.name, locale)}
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-1.5 pt-3 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs">
                {getVenueName(match.venue.name, locale)}, {match.venue.city}
              </span>
            </div>
          </div>

          {/* Right: date & prediction */}
          <div className="flex flex-col items-center justify-center bg-secondary/20 p-6 text-center md:w-1/2">
            <p className="mb-1 text-base font-bold">{fullDate}</p>
            <p className="text-xs text-muted-foreground">
              {getVenueName(match.venue.name, locale)}
            </p>
            {match.prediction && (
              <div className="mt-4 w-full max-w-xs">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{getTeamName(match.home_team.name, locale)} {match.prediction.home_win_prob}%</span>
                  <span>{locale === "zh" ? "平" : "Draw"} {match.prediction.draw_prob}%</span>
                  <span>{getTeamName(match.away_team.name, locale)} {match.prediction.away_win_prob}%</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
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

/* ─── Calendar View ────────────────────────────────────────────────────────── */

function CalendarView({
  calendarMonth,
  monthLabel,
  matchesByDate,
  locale,
  onPrevMonth,
  onNextMonth,
}: {
  calendarMonth: { year: number; month: number };
  monthLabel: string;
  matchesByDate: Map<string, MatchWithDetails[]>;
  locale: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const { startDow, daysInMonth } = getMonthDays(calendarMonth.year, calendarMonth.month);
  const weekdays = locale === "zh" ? weekdaysZh : weekdaysEn;

  // Build calendar cells
  const cells: Array<{ day: number | null; dateKey: string | null }> = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateKey });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-4">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-display text-lg font-bold">{monthLabel}</span>
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-secondary/20">
        {weekdays.map((wd) => (
          <div key={wd} className="px-2 py-2.5 text-center text-xs font-medium text-muted-foreground">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const dayMatches = cell.dateKey ? matchesByDate.get(cell.dateKey) || [] : [];
          const hasMatches = dayMatches.length > 0;
          const today = new Date();
          const isToday =
            cell.day !== null &&
            today.getFullYear() === calendarMonth.year &&
            today.getMonth() === calendarMonth.month &&
            today.getDate() === cell.day;

          return (
            <div
              key={idx}
              className={`min-h-[120px] border-b border-r border-border/50 p-2 ${
                cell.day === null ? "bg-secondary/10" : ""
              } ${isToday ? "bg-brand-gold/5" : ""}`}
            >
              {cell.day !== null && (
                <>
                  {/* Day number and match count */}
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span
                      className={`text-lg font-bold ${
                        isToday ? "text-brand-gold" : hasMatches ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {hasMatches && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {dayMatches.length}{locale === "zh" ? "场" : ""}
                      </span>
                    )}
                  </div>

                  {/* Match mini cards */}
                  <div className="space-y-1.5">
                    {dayMatches.slice(0, 3).map((match) => (
                      <CalendarMatchMini key={match.id} match={match} locale={locale} />
                    ))}
                    {dayMatches.length > 3 && (
                      <p className="text-center text-[10px] text-muted-foreground">
                        +{dayMatches.length - 3} {locale === "zh" ? "场" : "more"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Calendar Mini Match Card ─────────────────────────────────────────────── */

function CalendarMatchMini({ match, locale }: { match: MatchWithDetails; locale: string }) {
  const isFinished = match.status === "finished";
  const groupLabel = match.group
    ? locale === "zh" ? `${match.group.name}组` : `Grp ${match.group.name}`
    : null;
  const time = getMatchTime(match.match_date);

  return (
    <Link href={`/match/${match.id}`} className="block">
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-1.5 transition-colors hover:border-brand-gold/30 hover:bg-secondary/70">
        {/* Home team row */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            <div className="relative h-3 w-4 shrink-0">
              <Image
                src={getFlagUrl(match.home_team.code)}
                alt=""
                fill
                className="rounded-[1px] object-cover"
                unoptimized
              />
            </div>
            <span className="truncate text-[11px] font-medium">
              {getTeamName(match.home_team.name, locale)}
            </span>
          </div>
          {isFinished && match.home_score !== null && (
            <span className="text-[11px] font-bold">{match.home_score}</span>
          )}
        </div>
        {/* Away team row */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            <div className="relative h-3 w-4 shrink-0">
              <Image
                src={getFlagUrl(match.away_team.code)}
                alt=""
                fill
                className="rounded-[1px] object-cover"
                unoptimized
              />
            </div>
            <span className="truncate text-[11px] font-medium">
              {getTeamName(match.away_team.name, locale)}
            </span>
          </div>
          {isFinished && match.away_score !== null && (
            <span className="text-[11px] font-bold">{match.away_score}</span>
          )}
        </div>
        {/* Time & group badge */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {groupLabel && (
            <span className="rounded bg-green-500/10 px-1 py-0.5 text-[9px] font-bold text-green-400">
              {groupLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── List View ────────────────────────────────────────────────────────────── */

function ListView({
  matchesByDate,
  locale,
  filtered,
}: {
  matchesByDate: Map<string, MatchWithDetails[]>;
  locale: string;
  filtered: MatchWithDetails[];
}) {
  const sortedEntries = useMemo(
    () => Array.from(matchesByDate.entries()).sort(([a], [b]) => a.localeCompare(b)),
    [matchesByDate]
  );

  if (sortedEntries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {locale === "zh" ? "没有符合条件的比赛" : "No matches match your filters"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedEntries.map(([dateKey, dayMatches]) => {
        const dateObj = new Date(dateKey + "T00:00:00");
        const dateLabel = dateObj.toLocaleDateString(
          locale === "zh" ? "zh-CN" : "en-US",
          { year: "numeric", month: "long", day: "numeric", weekday: "short" }
        );

        return (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-bold text-green-400">{dateLabel}</span>
              <span className="text-[10px] text-muted-foreground">
                {dayMatches.length}{locale === "zh" ? "场比赛" : ` match${dayMatches.length > 1 ? "es" : ""}`}
              </span>
              <div className="h-px flex-grow bg-border" />
            </div>

            <div className="space-y-2">
              {dayMatches.map((match) => (
                <ListMatchCard key={match.id} match={match} locale={locale} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── List Match Card ──────────────────────────────────────────────────────── */

function ListMatchCard({ match, locale }: { match: MatchWithDetails; locale: string }) {
  const isFinished = match.status === "finished";
  const time = getMatchTime(match.match_date);
  const groupLabel = match.group
    ? locale === "zh" ? `${match.group.name}组` : `Group ${match.group.name}`
    : getStageLabel(match.stage);

  return (
    <Link href={`/match/${match.id}`} className="block">
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-gold/30 hover:shadow-md">
        {/* Time */}
        <div className="w-12 shrink-0 text-center">
          <span className="text-sm font-bold text-muted-foreground">{time}</span>
        </div>

        {/* Teams & score */}
        <div className="min-w-0 flex-1">
          {/* Home */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative h-4 w-5 shrink-0">
                <Image
                  src={getFlagUrl(match.home_team.code)}
                  alt=""
                  fill
                  className="rounded-[2px] object-cover"
                  unoptimized
                />
              </div>
              <span className="truncate text-sm font-medium">
                {getTeamName(match.home_team.name, locale)}
              </span>
            </div>
            {isFinished && match.home_score !== null && (
              <span className="text-sm font-bold">{match.home_score}</span>
            )}
          </div>
          {/* Away */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative h-4 w-5 shrink-0">
                <Image
                  src={getFlagUrl(match.away_team.code)}
                  alt=""
                  fill
                  className="rounded-[2px] object-cover"
                  unoptimized
                />
              </div>
              <span className="truncate text-sm font-medium">
                {getTeamName(match.away_team.name, locale)}
              </span>
            </div>
            {isFinished && match.away_score !== null && (
              <span className="text-sm font-bold">{match.away_score}</span>
            )}
          </div>
        </div>

        {/* Venue & group */}
        <div className="hidden shrink-0 text-right sm:block">
          <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400">
            {groupLabel}
          </span>
          <p className="mt-1 max-w-[140px] truncate text-[11px] text-muted-foreground">
            {getVenueName(match.venue.name, locale)}
          </p>
        </div>
      </div>
    </Link>
  );
}
