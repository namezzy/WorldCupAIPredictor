"use client";

import { Trophy } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import {
  type BracketMatch,
  leftR32, leftR16, leftQF, leftSF,
  rightR32, rightR16, rightQF, rightSF,
  finalMatch, thirdPlace, roundLabels,
} from "./bracket-data";

const MATCH_HEIGHT = 100;
const TOTAL_HEIGHT = 800;
const SVG_WIDTH = 48;

function MatchCard({ match, locale }: { match: BracketMatch; locale: string }) {
  const home = locale === "zh" ? match.homeLabel.zh : match.homeLabel.en;
  const away = locale === "zh" ? match.awayLabel.zh : match.awayLabel.en;

  return (
    <a className="block w-[185px] relative z-10 transition-all duration-300 hover:scale-[1.02]">
      <div className="backdrop-blur-md border rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-card/75 border-border/50">
        {/* Header: match number + date/time */}
        <div className="px-2.5 py-1.5 text-[10px] flex justify-between items-center border-b font-medium bg-secondary/50 border-border/40 text-muted-foreground">
          <span className="font-mono font-bold tracking-wider opacity-85">#{match.id}</span>
          <div className="flex items-center gap-1.5">
            <span>{match.date}</span>
          </div>
        </div>
        {/* Team rows */}
        <div className="flex flex-col py-1">
          {/* Home */}
          <div className="flex items-center justify-between px-2.5 py-1.5 transition-colors duration-200 cursor-pointer hover:bg-secondary/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-3.5 border border-dashed border-foreground/20 rounded-[2px] bg-foreground/5 flex items-center justify-center shrink-0">
                <span className="text-[7px] text-muted-foreground/40">?</span>
              </div>
              <span className="font-medium text-xs truncate text-muted-foreground/60 italic">{home}</span>
            </div>
          </div>
          {/* Away */}
          <div className="flex items-center justify-between px-2.5 py-1.5 transition-colors duration-200 cursor-pointer hover:bg-secondary/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-3.5 border border-dashed border-foreground/20 rounded-[2px] bg-foreground/5 flex items-center justify-center shrink-0">
                <span className="text-[7px] text-muted-foreground/40">?</span>
              </div>
              <span className="font-medium text-xs truncate text-muted-foreground/60 italic">{away}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

function RoundColumn({ matches, locale }: { matches: BracketMatch[]; locale: string }) {
  // Distribute matches evenly across the total height
  const spacing = TOTAL_HEIGHT / matches.length;
  return (
    <div className="flex flex-col justify-around shrink-0 z-10" style={{ height: TOTAL_HEIGHT }}>
      {matches.map((m) => (
        <div key={m.id} className="flex items-center" style={{ height: spacing }}>
          <MatchCard match={m} locale={locale} />
        </div>
      ))}
    </div>
  );
}

// Generate SVG connector paths between rounds using bezier curves
function Connector({ fromCount, toCount }: { fromCount: number; toCount: number }) {
  const fromSpacing = TOTAL_HEIGHT / fromCount;
  const toSpacing = TOTAL_HEIGHT / toCount;
  const paths: string[] = [];

  for (let i = 0; i < toCount; i++) {
    const toY = toSpacing * i + toSpacing / 2;
    // Each "to" slot connects from 2 "from" slots
    const fromIdx1 = i * 2;
    const fromIdx2 = i * 2 + 1;
    if (fromIdx1 < fromCount) {
      const fromY1 = fromSpacing * fromIdx1 + fromSpacing / 2;
      paths.push(`M 0 ${fromY1} C ${SVG_WIDTH / 2} ${fromY1}, ${SVG_WIDTH / 2} ${toY}, ${SVG_WIDTH} ${toY}`);
    }
    if (fromIdx2 < fromCount) {
      const fromY2 = fromSpacing * fromIdx2 + fromSpacing / 2;
      paths.push(`M 0 ${fromY2} C ${SVG_WIDTH / 2} ${fromY2}, ${SVG_WIDTH / 2} ${toY}, ${SVG_WIDTH} ${toY}`);
    }
  }

  return (
    <svg
      width={SVG_WIDTH}
      height={TOTAL_HEIGHT}
      className="shrink-0 pointer-events-none select-none overflow-visible z-0"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1.2"
          opacity="0.4"
        />
      ))}
    </svg>
  );
}

// Reverse connector (expanding from center outward)
function ConnectorReverse({ fromCount, toCount }: { fromCount: number; toCount: number }) {
  const fromSpacing = TOTAL_HEIGHT / fromCount;
  const toSpacing = TOTAL_HEIGHT / toCount;
  const paths: string[] = [];

  for (let i = 0; i < fromCount; i++) {
    const fromY = fromSpacing * i + fromSpacing / 2;
    const toIdx1 = i * 2;
    const toIdx2 = i * 2 + 1;
    if (toIdx1 < toCount) {
      const toY1 = toSpacing * toIdx1 + toSpacing / 2;
      paths.push(`M 0 ${fromY} C ${SVG_WIDTH / 2} ${fromY}, ${SVG_WIDTH / 2} ${toY1}, ${SVG_WIDTH} ${toY1}`);
    }
    if (toIdx2 < toCount) {
      const toY2 = toSpacing * toIdx2 + toSpacing / 2;
      paths.push(`M 0 ${fromY} C ${SVG_WIDTH / 2} ${fromY}, ${SVG_WIDTH / 2} ${toY2}, ${SVG_WIDTH} ${toY2}`);
    }
  }

  return (
    <svg
      width={SVG_WIDTH}
      height={TOTAL_HEIGHT}
      className="shrink-0 pointer-events-none select-none overflow-visible z-0"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1.2"
          opacity="0.4"
        />
      ))}
    </svg>
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
        <Trophy className="h-5 w-5 text-brand-gold" />
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {locale === "zh" ? "淘汰赛对阵图" : "Knockout Bracket"}
        </h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        {locale === "zh"
          ? "32强单败淘汰制赛程，左右拖动查看完整的冠军晋级路线。"
          : "32-team single elimination bracket. Scroll horizontally to see the full path to the title."}
      </p>

      {/* Scrollable bracket */}
      <div className="overflow-x-auto pb-8 pt-4">
        <div className="flex min-w-max px-8 items-center justify-center mx-auto">
          <div className="flex items-center" style={{ height: TOTAL_HEIGHT }}>
            {/* LEFT HALF: R32 → R16 → QF → SF */}
            <RoundColumn matches={leftR32} locale={locale} />
            <Connector fromCount={8} toCount={4} />
            <RoundColumn matches={leftR16} locale={locale} />
            <Connector fromCount={4} toCount={2} />
            <RoundColumn matches={leftQF} locale={locale} />
            <Connector fromCount={2} toCount={1} />
            <RoundColumn matches={leftSF} locale={locale} />

            {/* CENTER: SF → Final connector */}
            <Connector fromCount={1} toCount={1} />

            {/* FINAL + 3RD PLACE */}
            <div className="flex flex-col justify-around shrink-0 z-10" style={{ height: TOTAL_HEIGHT }}>
              <div className="flex flex-col items-center gap-8">
                {/* Final */}
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl bg-brand-gold/10 blur-xl" />
                  <div className="relative">
                    <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-brand-gold flex items-center justify-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {rl("F")}
                    </div>
                    <MatchCard match={finalMatch} locale={locale} />
                  </div>
                </div>
                {/* 3rd place */}
                <div>
                  <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {rl("3rd")}
                  </div>
                  <MatchCard match={thirdPlace} locale={locale} />
                </div>
              </div>
            </div>

            {/* CENTER → SF connector */}
            <ConnectorReverse fromCount={1} toCount={1} />

            {/* RIGHT HALF: SF → QF → R16 → R32 */}
            <RoundColumn matches={rightSF} locale={locale} />
            <ConnectorReverse fromCount={1} toCount={2} />
            <RoundColumn matches={rightQF} locale={locale} />
            <ConnectorReverse fromCount={2} toCount={4} />
            <RoundColumn matches={rightR16} locale={locale} />
            <ConnectorReverse fromCount={4} toCount={8} />
            <RoundColumn matches={rightR32} locale={locale} />
          </div>
        </div>

        {/* Round labels bar */}
        <div className="mt-6 flex min-w-max items-center justify-center px-8">
          {[
            { w: 185, label: rl("R32") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("R16") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("QF") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("SF") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("F"), gold: true },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("SF") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("QF") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("R16") },
            { w: SVG_WIDTH, label: "" },
            { w: 185, label: rl("R32") },
          ].map((col, i) => (
            <div
              key={i}
              className="shrink-0 text-center"
              style={{ width: col.w }}
            >
              {col.label && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    (col as { gold?: boolean }).gold
                      ? "text-brand-gold"
                      : "text-muted-foreground"
                  }`}
                >
                  {col.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
