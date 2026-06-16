"use client";

import { Trophy } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import {
  type BracketMatch,
  leftR32, leftR16, leftQF, leftSF,
  rightR32, rightR16, rightQF, rightSF,
  finalMatch, thirdPlace, roundLabels,
} from "./bracket-data";

function MatchCard({
  match,
  locale,
}: {
  match: BracketMatch;
  locale: string;
}) {
  const home = locale === "zh" ? match.homeLabel.zh : match.homeLabel.en;
  const away = locale === "zh" ? match.awayLabel.zh : match.awayLabel.en;

  return (
    <div className="w-[180px] overflow-hidden rounded-xl border border-border/50 bg-card/75 shadow-lg backdrop-blur-md transition-all hover:border-brand-gold/30 hover:shadow-brand-gold/5">
      {/* Header */}
      <div className="flex items-center justify-between bg-secondary/50 px-2.5 py-1">
        <span className="text-[10px] font-bold text-muted-foreground">#{match.id}</span>
        <span className="text-[10px] text-muted-foreground">{match.date}</span>
      </div>
      {/* Home */}
      <div className="flex cursor-pointer items-center justify-between px-2.5 py-1.5 transition-colors hover:bg-secondary/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-3.5 w-5 shrink-0 rounded-[2px] border border-dashed border-border bg-secondary/50" />
          <span className="truncate text-xs font-bold">{home}</span>
        </div>
      </div>
      {/* Away */}
      <div className="flex cursor-pointer items-center justify-between px-2.5 py-1.5 transition-colors hover:bg-secondary/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-3.5 w-5 shrink-0 rounded-[2px] border border-dashed border-border bg-secondary/50" />
          <span className="truncate text-xs font-bold">{away}</span>
        </div>
      </div>
      {/* Time */}
      <div className="border-t border-border/30 px-2.5 py-1 text-center text-[10px] text-muted-foreground">
        {match.time} UTC
      </div>
    </div>
  );
}

function RoundColumn({
  matches,
  locale,
  label,
}: {
  matches: BracketMatch[];
  locale: string;
  label: string;
}) {
  return (
    <div className="flex shrink-0 flex-col justify-around z-10 px-2" style={{ minHeight: `${matches.length * 100}px` }}>
      {matches.map((m) => (
        <div key={m.id} className="py-2">
          <MatchCard match={m} locale={locale} />
        </div>
      ))}
    </div>
  );
}

function Connector({ count }: { count: number }) {
  return (
    <div className="flex shrink-0 flex-col justify-around" style={{ minHeight: `${count * 100}px` }}>
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <svg key={i} width="32" height={100} className="shrink-0 overflow-visible text-border">
          <line x1="0" y1="25" x2="16" y2="25" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="75" x2="16" y2="75" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="25" x2="16" y2="75" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="50" x2="32" y2="50" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ))}
    </div>
  );
}

export function BracketContent() {
  const { locale } = useI18n();

  const rl = (key: keyof typeof roundLabels) =>
    locale === "zh" ? roundLabels[key].zh : roundLabels[key].en;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {locale === "zh" ? "淘汰赛对阵图" : "Knockout Bracket"}
        </h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        {locale === "zh"
          ? "32强单败淘汰制赛程，左右拖动查看完整的冠军晋级路线。"
          : "32-team single elimination bracket. Scroll horizontally to see the full path to the title."}
      </p>

      {/* Round labels */}
      <div className="overflow-x-auto pb-8 pt-4">
        <div className="min-w-max px-4">
          {/* Round headers */}
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center gap-0">
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("R32")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("R16")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("QF")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("SF")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="h-3 w-3 text-brand-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">{rl("F")}</span>
                </div>
              </div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("SF")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("QF")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("R16")}</div>
              <div className="w-[32px]" />
              <div className="w-[196px] text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rl("R32")}</div>
            </div>
          </div>

          {/* Bracket rows */}
          <div className="flex items-center justify-center">
            {/* Left half: R32 → R16 → QF → SF */}
            <RoundColumn matches={leftR32} locale={locale} label={rl("R32")} />
            <Connector count={8} />
            <RoundColumn matches={leftR16} locale={locale} label={rl("R16")} />
            <Connector count={4} />
            <RoundColumn matches={leftQF} locale={locale} label={rl("QF")} />
            <Connector count={2} />
            <RoundColumn matches={leftSF} locale={locale} label={rl("SF")} />
            <Connector count={1} />

            {/* Center: Final + 3rd */}
            <div className="flex shrink-0 flex-col items-center justify-center gap-6 px-2 z-10">
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-brand-gold/10 blur-lg" />
                <div className="relative">
                  <MatchCard match={finalMatch} locale={locale} />
                </div>
              </div>
              <div className="text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {rl("3rd")}
                </p>
                <MatchCard match={thirdPlace} locale={locale} />
              </div>
            </div>

            <Connector count={1} />
            {/* Right half: SF → QF → R16 → R32 */}
            <RoundColumn matches={rightSF} locale={locale} label={rl("SF")} />
            <Connector count={2} />
            <RoundColumn matches={rightQF} locale={locale} label={rl("QF")} />
            <Connector count={4} />
            <RoundColumn matches={rightR16} locale={locale} label={rl("R16")} />
            <Connector count={8} />
            <RoundColumn matches={rightR32} locale={locale} label={rl("R32")} />
          </div>
        </div>
      </div>
    </div>
  );
}
