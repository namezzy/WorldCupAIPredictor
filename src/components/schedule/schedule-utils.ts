import type { MatchWithDetails } from "@/types";

export interface ScheduleDateItem {
  key: string;
  fullLabel: string;
  dayLabel: string;
  dayNumber: string;
  monthLabel: string;
  matchCount: number;
  isToday: boolean;
}

export interface ScheduleTimeSlot {
  key: string;
  label: string;
  matches: MatchWithDetails[];
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

const dayNumberFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`);
}

export function getTodayDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function getMatchDateKey(matchDate: string) {
  return matchDate.slice(0, 10);
}

export function getMatchTimeKey(matchDate: string) {
  return new Date(matchDate).toISOString().slice(11, 16);
}

export function getTimeSlotLabel(timeKey: string) {
  return `${timeKey} UTC`;
}

export function getScheduleDateHeading(dateKey: string) {
  return fullDateFormatter.format(parseDateKey(dateKey));
}

export function buildScheduleDates(
  matches: MatchWithDetails[],
  todayKey = getTodayDateKey()
): ScheduleDateItem[] {
  const counts = new Map<string, number>();

  for (const match of matches) {
    const dateKey = getMatchDateKey(match.match_date);
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  }

  return [...counts.keys()].sort().map((dateKey) => {
    const date = parseDateKey(dateKey);

    return {
      key: dateKey,
      fullLabel: getScheduleDateHeading(dateKey),
      dayLabel: weekdayFormatter.format(date),
      dayNumber: dayNumberFormatter.format(date),
      monthLabel: monthFormatter.format(date),
      matchCount: counts.get(dateKey) ?? 0,
      isToday: dateKey === todayKey,
    };
  });
}

export function getDefaultScheduleDate(
  dateKeys: string[],
  todayKey = getTodayDateKey()
) {
  if (!dateKeys.length) {
    return "";
  }

  if (dateKeys.includes(todayKey)) {
    return todayKey;
  }

  return dateKeys.find((dateKey) => dateKey > todayKey) ?? dateKeys.at(-1) ?? "";
}

export function groupMatchesByDate(matches: MatchWithDetails[]) {
  const grouped = new Map<string, MatchWithDetails[]>();

  for (const match of [...matches].sort((a, b) => a.match_date.localeCompare(b.match_date))) {
    const dateKey = getMatchDateKey(match.match_date);
    const dateMatches = grouped.get(dateKey) ?? [];
    dateMatches.push(match);
    grouped.set(dateKey, dateMatches);
  }

  return grouped;
}

export function groupMatchesByTime(matches: MatchWithDetails[]): ScheduleTimeSlot[] {
  const grouped = new Map<string, MatchWithDetails[]>();

  for (const match of [...matches].sort((a, b) => a.match_date.localeCompare(b.match_date))) {
    const timeKey = getMatchTimeKey(match.match_date);
    const timeMatches = grouped.get(timeKey) ?? [];
    timeMatches.push(match);
    grouped.set(timeKey, timeMatches);
  }

  return [...grouped.entries()].map(([key, slotMatches]) => ({
    key,
    label: getTimeSlotLabel(key),
    matches: slotMatches,
  }));
}
