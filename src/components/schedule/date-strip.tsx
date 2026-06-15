"use client";

import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { ScheduleDateItem } from "./schedule-utils";

interface DateStripProps {
  dates: ScheduleDateItem[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function DateStrip({
  dates,
  selectedDate,
  onDateSelect,
}: DateStripProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const selectedButton = buttonRefs.current[selectedDate];
    const todayButton = buttonRefs.current[dates.find((date) => date.isToday)?.key ?? ""];
    const fallbackButton = buttonRefs.current[dates[0]?.key ?? ""];

    (selectedButton ?? todayButton ?? fallbackButton)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [dates, selectedDate]);

  return (
    <ScrollArea className="-mx-4 w-[calc(100%+2rem)]">
      <div className="flex w-max snap-x snap-mandatory gap-3 px-4 pb-2">
        {dates.map((date) => {
          const isSelected = date.key === selectedDate;

          return (
            <button
              key={date.key}
              type="button"
              ref={(node) => {
                buttonRefs.current[date.key] = node;
              }}
              onClick={() => onDateSelect(date.key)}
              className={cn(
                "snap-start rounded-2xl border px-4 py-3 text-left transition-all",
                "min-w-[104px] shrink-0",
                isSelected
                  ? "border-brand-gold bg-brand-gold text-background shadow-lg shadow-brand-gold/20"
                  : "border-border bg-card hover:border-brand-gold/30 hover:bg-card/80"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    isSelected ? "text-background/80" : "text-muted-foreground"
                  )}
                >
                  {date.dayLabel}
                </span>
                {date.isToday && (
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      isSelected
                        ? "border-background/30 bg-background/15 text-background"
                        : "border-brand-gold/40 bg-brand-gold/10 text-brand-gold"
                    )}
                  >
                    Today
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold">{date.dayNumber}</span>
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    isSelected ? "text-background/80" : "text-muted-foreground"
                  )}
                >
                  {date.monthLabel}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-xs",
                  isSelected ? "text-background/80" : "text-muted-foreground"
                )}
              >
                {date.matchCount} match{date.matchCount === 1 ? "" : "es"}
              </p>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
