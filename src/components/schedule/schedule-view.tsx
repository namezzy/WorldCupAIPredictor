"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ListTree } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { MatchWithDetails } from "@/types";

import { DateStrip } from "./date-strip";
import { ScheduleMatchCard } from "./schedule-match-card";
import {
  buildScheduleDates,
  getDefaultScheduleDate,
  getScheduleDateHeading,
  getTodayDateKey,
  groupMatchesByDate,
  groupMatchesByTime,
} from "./schedule-utils";

interface ScheduleViewProps {
  matches: MatchWithDetails[];
}

export function ScheduleView({ matches }: ScheduleViewProps) {
  const todayKey = useMemo(() => getTodayDateKey(), []);
  const dates = useMemo(() => buildScheduleDates(matches, todayKey), [matches, todayKey]);
  const dateKeys = useMemo(() => dates.map((date) => date.key), [dates]);
  const groupedByDate = useMemo(() => groupMatchesByDate(matches), [matches]);
  const [showAllDates, setShowAllDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    getDefaultScheduleDate(dateKeys, todayKey)
  );

  useEffect(() => {
    if (!dateKeys.length) {
      return;
    }

    if (!dateKeys.includes(selectedDate)) {
      setSelectedDate(getDefaultScheduleDate(dateKeys, todayKey));
    }
  }, [dateKeys, selectedDate, todayKey]);

  const activeDateKey = dateKeys.includes(selectedDate)
    ? selectedDate
    : getDefaultScheduleDate(dateKeys, todayKey);

  const activeDate = dates.find((date) => date.key === activeDateKey);
  const visibleDates = showAllDates
    ? dates
    : dates.filter((date) => date.key === activeDateKey);

  return (
    <div className="space-y-6">
      <section className="glass-card space-y-4 p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Scroll through each matchday or switch to the full tournament timeline.
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {showAllDates
                ? `${matches.length} matches across ${dates.length} dates`
                : activeDate
                  ? `${activeDate.matchCount} match${activeDate.matchCount === 1 ? "" : "es"} on ${activeDate.fullLabel}`
                  : "No matches scheduled"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={showAllDates ? "outline" : "secondary"}
              className={!showAllDates ? "border-brand-gold/30 text-brand-gold" : ""}
              onClick={() => setShowAllDates(false)}
            >
              <CalendarDays className="mr-1" />
              Selected date
            </Button>
            <Button
              variant={showAllDates ? "secondary" : "outline"}
              className={showAllDates ? "border-brand-gold/30 text-brand-gold" : ""}
              onClick={() => setShowAllDates(true)}
            >
              <ListTree className="mr-1" />
              All dates
            </Button>
          </div>
        </div>

        {dates.length > 0 && (
          <DateStrip
            dates={dates}
            selectedDate={activeDateKey}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowAllDates(false);
            }}
          />
        )}
      </section>

      {visibleDates.length > 0 ? (
        <div className="space-y-8">
          {visibleDates.map((date) => {
            const dayMatches = groupedByDate.get(date.key) ?? [];
            const timeSlots = groupMatchesByTime(dayMatches);

            return (
              <section key={date.key} className="space-y-5">
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-bold">
                      {getScheduleDateHeading(date.key)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {date.matchCount} match{date.matchCount === 1 ? "" : "es"} scheduled
                    </p>
                  </div>
                  {date.isToday && (
                    <span className="text-sm font-semibold text-brand-gold">
                      Today&apos;s matches
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {timeSlots.map((slot) => (
                    <div key={`${date.key}-${slot.key}`} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 font-display text-lg font-bold text-brand-gold">
                          {slot.label}
                        </span>
                        <Separator className="flex-1 bg-border/60" />
                      </div>

                      <div className="space-y-3">
                        {slot.matches.map((match, index) => (
                          <ScheduleMatchCard
                            key={match.id}
                            match={match}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-muted-foreground">
          No matches available for the current schedule.
        </div>
      )}
    </div>
  );
}
