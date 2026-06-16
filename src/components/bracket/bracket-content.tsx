"use client";

import { Trophy } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import {
  type BracketMatch,
  leftR32, leftR16, leftQF, leftSF,
  rightR32, rightR16, rightQF, rightSF,
  finalMatch, thirdPlace, roundLabels,
} from "./bracket-data";

const H = 800;

// Y positions for each match count (evenly distributed, centered)
const Y8 = [50, 150, 250, 350, 450, 550, 650, 750];
const Y4 = [100, 300, 500, 700];
const Y2 = [200, 600];
const Y1 = [400];

// All 8 SVG connector path sets (exact copy from cupgol.com)
const svgPaths: string[][] = [
  // SVG 0: 8→4 (left R32→R16)
  [
    "M 0 50 C 24 50, 24 100, 48 100",   "M 0 150 C 24 150, 24 100, 48 100",
    "M 0 250 C 24 250, 24 300, 48 300", "M 0 350 C 24 350, 24 300, 48 300",
    "M 0 450 C 24 450, 24 500, 48 500", "M 0 550 C 24 550, 24 500, 48 500",
    "M 0 650 C 24 650, 24 700, 48 700", "M 0 750 C 24 750, 24 700, 48 700",
  ],
  // SVG 1: 4→2 (left R16→QF)
  [
    "M 0 100 C 24 100, 24 200, 48 200", "M 0 300 C 24 300, 24 200, 48 200",
    "M 0 500 C 24 500, 24 600, 48 600", "M 0 700 C 24 700, 24 600, 48 600",
  ],
  // SVG 2: 2→1 (left QF→SF)
  ["M 0 200 C 24 200, 24 400, 48 400", "M 0 600 C 24 600, 24 400, 48 400"],
  // SVG 3: 1→2 (left SF→Center)
  ["M 0 400 C 24 400, 24 200, 48 200", "M 0 400 C 24 400, 24 600, 48 600"],
  // SVG 4: 2→1 (Center→right SF)
  ["M 0 200 C 24 200, 24 400, 48 400", "M 0 600 C 24 600, 24 400, 48 400"],
  // SVG 5: 1→2 (right SF→QF)
  ["M 0 400 C 24 400, 24 200, 48 200", "M 0 400 C 24 400, 24 600, 48 600"],
  // SVG 6: 2→4 (right QF→R16)
  [
    "M 0 200 C 24 200, 24 100, 48 100", "M 0 200 C 24 200, 24 300, 48 300",
    "M 0 600 C 24 600, 24 500, 48 500", "M 0 600 C 24 600, 24 700, 48 700",
  ],
  // SVG 7: 4→8 (right R16→R32)
  [
    "M 0 100 C 24 100, 24 50, 48 50",   "M 0 100 C 24 100, 24 150, 48 150",
    "M 0 300 C 24 300, 24 250, 48 250", "M 0 300 C 24 300, 24 350, 48 350",
    "M 0 500 C 24 500, 24 450, 48 450", "M 0 500 C 24 500, 24 550, 48 550",
    "M 0 700 C 24 700, 24 650, 48 650", "M 0 700 C 24 700, 24 750, 48 750",
  ],
];

function SvgConnector({ index }: { index: number }) {
  return (
    <svg
      width={48}
      height={H}
      className="shrink-0 pointer-events-none select-none overflow-visible z-0"
    >
      {svgPaths[index].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1.2"
          opacity="0.4"
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
}

function MatchCard({ match, locale }: { match: BracketMatch; locale: string }) {
  const home = locale === "zh" ? match.homeLabel.zh : match.homeLabel.en;
  const away = locale === "zh" ? match.awayLabel.zh : match.awayLabel.en;

  return (
    <a className="block w-[185px] relative z-10 transition-all duration-300 hover:scale-[1.02]">
      <div className="backdrop-blur-md border rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-card/75 border-border/50">
        {/* Header */}
        <div className="px-2.5 py-1.5 text-[10px] flex justify-between items-center border-b font-medium bg-secondary/50 border-border/40 text-muted-foreground">
          <span className="font-mono font-bold tracking-wider opacity-85">#{match.id}</span>
          <div className="flex items-center gap-1.5">
            <span>{match.date}</span>
          </div>
        </div>
        {/* Teams */}
        <div className="flex flex-col py-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 transition-colors duration-200 cursor-pointer hover:bg-secondary/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-3.5 border border-dashed border-foreground/20 rounded-[2px] bg-foreground/5 flex items-center justify-center shrink-0">
                <span className="text-[7px] text-muted-foreground/40">?</span>
              </div>
              <span className="font-medium text-xs truncate text-muted-foreground/60 italic">{home}</span>
            </div>
          </div>
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

function RoundColumn({
  matches,
  positions,
  locale,
  className: extraClass,
}: {
  matches: BracketMatch[];
  positions: number[];
  locale: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-around shrink-0 ${extraClass ?? ""}`}
      style={{ height: H }}
    >
      {matches.map((m, i) => (
        <div
          key={m.id}
          className="absolute"
          style={{ top: positions[i] - 40 }}
        >
          <MatchCard match={m} locale={locale} />
        </div>
      ))}
    </div>
  );
}

// Use absolute positioning for precise Y placement
function AbsoluteColumn({
  matches,
  positions,
  locale,
  extraClass,
}: {
  matches: BracketMatch[];
  positions: number[];
  locale: string;
  extraClass?: string;
}) {
  return (
    <div className={`relative shrink-0 ${extraClass ?? ""}`} style={{ height: H, width: 185 }}>
      {matches.map((m, i) => {
        const cardHeight = 80;
        const top = positions[i] - cardHeight / 2;
        return (
          <div key={m.id} className="absolute left-0 right-0" style={{ top }}>
            <MatchCard match={m} locale={locale} />
          </div>
        );
      })}
    </div>
  );
}

export function BracketContent() {
  const { locale } = useI18n();

  const rl = (key: keyof typeof roundLabels) =>
    locale === "zh" ? roundLabels[key].zh : roundLabels[key].en;

  const centerMatches = [finalMatch, thirdPlace];

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
          <div className="flex items-center" style={{ height: H }}>
            {/* Left R32 (8) */}
            <AbsoluteColumn matches={leftR32} positions={Y8} locale={locale} />
            <SvgConnector index={0} />
            {/* Left R16 (4) */}
            <AbsoluteColumn matches={leftR16} positions={Y4} locale={locale} />
            <SvgConnector index={1} />
            {/* Left QF (2) */}
            <AbsoluteColumn matches={leftQF} positions={Y2} locale={locale} />
            <SvgConnector index={2} />
            {/* Left SF (1) */}
            <AbsoluteColumn matches={leftSF} positions={Y1} locale={locale} />
            <SvgConnector index={3} />
            {/* Center: Final + 3rd (2) */}
            <AbsoluteColumn matches={centerMatches} positions={Y2} locale={locale} extraClass="z-10 px-2" />
            <SvgConnector index={4} />
            {/* Right SF (1) */}
            <AbsoluteColumn matches={rightSF} positions={Y1} locale={locale} />
            <SvgConnector index={5} />
            {/* Right QF (2) */}
            <AbsoluteColumn matches={rightQF} positions={Y2} locale={locale} />
            <SvgConnector index={6} />
            {/* Right R16 (4) */}
            <AbsoluteColumn matches={rightR16} positions={Y4} locale={locale} />
            <SvgConnector index={7} />
            {/* Right R32 (8) */}
            <AbsoluteColumn matches={rightR32} positions={Y8} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
