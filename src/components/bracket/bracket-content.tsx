"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useLiveMatches } from "@/lib/hooks/use-live-matches";
import { getTeamName } from "@/lib/i18n/teams";
import { cn, getFlagUrl } from "@/lib/utils";
import type { MatchWithDetails, Team } from "@/types";
import {
  GroupStandings,
  type GroupWithStandings,
} from "./group-standings";
import {
  type KoMatch,
  koMatchById,
  slotLabel,
  LEFT_ROOT,
  RIGHT_ROOT,
  FINAL_ID,
  THIRD_PLACE_ID,
} from "./bracket-data";

const H = 800;
const CONNECTOR_W = 48;

/** Build the 4 columns [R32, R16, QF, SF] for one half by walking the win tree. */
function buildColumns(rootId: number): KoMatch[][] {
  const cols: KoMatch[][] = [[], [], [], []];
  const walk = (id: number, depth: number) => {
    const match = koMatchById.get(id);
    if (!match) return;
    const feed = (token: string) => {
      if (/^W\d+$/.test(token)) walk(Number(token.slice(1)), depth + 1);
    };
    feed(match.homeId);
    feed(match.awayId);
    const col = 3 - depth;
    if (col >= 0 && col <= 3) cols[col].push(match);
  };
  walk(rootId, 0);
  return cols;
}

/** Whether two matches are directly connected (one feeds the other). */
function isConnected(a: KoMatch, b: KoMatch): boolean {
  const refs = (m: KoMatch) => [m.homeId, m.awayId];
  if (refs(b).includes(`W${a.id}`) || refs(b).includes(`L${a.id}`)) return true;
  if (refs(a).includes(`W${b.id}`) || refs(a).includes(`L${b.id}`)) return true;
  return false;
}

function Connector({
  leftMatches,
  rightMatches,
  hoveredId,
}: {
  leftMatches: KoMatch[];
  rightMatches: KoMatch[];
  hoveredId: number | null;
}) {
  const paths = useMemo(() => {
    const out: { d: string; active: boolean }[] = [];
    const la = leftMatches.length;
    const ra = rightMatches.length;
    leftMatches.forEach((s, i) => {
      rightMatches.forEach((n, d) => {
        if (!isConnected(s, n)) return;
        const sy = (H / la) * (i + 0.5);
        const ty = (H / ra) * (d + 0.5);
        const half = CONNECTOR_W / 2;
        const dStr = `M 0 ${sy} C ${half} ${sy}, ${half} ${ty}, ${CONNECTOR_W} ${ty}`;
        const active = hoveredId === s.id || hoveredId === n.id;
        out.push({ d: dStr, active });
      });
    });
    return out;
  }, [leftMatches, rightMatches, hoveredId]);

  return (
    <svg
      width={CONNECTOR_W}
      height={H}
      className="shrink-0 pointer-events-none select-none overflow-visible z-0"
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={p.active ? "#22c55e" : "hsl(var(--border))"}
          strokeWidth={p.active ? 2.5 : 1.2}
          opacity={p.active ? 0.95 : 0.25}
          className="transition-all duration-300"
          style={{
            filter: p.active ? "drop-shadow(0 0 4px #22c55e)" : "none",
          }}
        />
      ))}
    </svg>
  );
}

function fmtDate(iso: string): { date: string; time: string } {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return { date: "", time: "" };
  return { date: `${m[2]}/${m[3]}`, time: `${m[4]}:${m[5]}` };
}

/** Winning side of a finished, decided match — null if unplayed/drawn/unknown. */
function winningSide(m: MatchWithDetails | undefined): "home" | "away" | null {
  if (!m || m.status !== "finished") return null;
  if (m.home_score === null || m.away_score === null) return null;
  if (m.home_score === m.away_score) return null;
  return m.home_score > m.away_score ? "home" : "away";
}

/**
 * Resolve the team occupying one side of a knockout match, walking the bracket
 * tree. Prefers the API-provided team; otherwise, when the slot is fed by a
 * finished match (Wxx / Lxx), computes the advancing team recursively.
 * Returns null for slots whose feeder match has not been decided yet.
 */
function resolveParticipant(
  matchId: number,
  side: "home" | "away",
  liveById: Map<number, MatchWithDetails>,
  depth = 0
): Team | null {
  if (depth > 10) return null;

  const live = liveById.get(matchId);
  if (live) {
    const teamId = side === "home" ? live.home_team_id : live.away_team_id;
    const team = side === "home" ? live.home_team : live.away_team;
    if (teamId && team) return team;
  }

  const ko = koMatchById.get(matchId);
  if (!ko) return null;
  const token = side === "home" ? ko.homeId : ko.awayId;

  const wl = token.match(/^([WL])(\d+)$/);
  if (!wl) return null; // group-position slot not yet assigned by the API

  const feederId = Number(wl[2]);
  const win = winningSide(liveById.get(feederId));
  if (!win) return null;

  const lose = win === "home" ? "away" : "home";
  const wantSide = wl[1] === "W" ? win : lose;
  return resolveParticipant(feederId, wantSide, liveById, depth + 1);
}

function TeamRow({
  label,
  team,
  locale,
  score,
  showScore,
  win,
  loss,
}: {
  label: string;
  team: Team | null;
  locale: string;
  score: number | null;
  showScore: boolean;
  win: boolean;
  loss: boolean;
}) {
  const flag = team ? team.flag_url || getFlagUrl(team.code) : null;
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 transition-colors duration-200 hover:bg-secondary/30">
      <div className="flex items-center gap-2 min-w-0">
        {team && flag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flag}
            alt={team.code}
            className="w-5 h-3.5 object-cover rounded-[2px] shrink-0 border border-white/10"
            loading="lazy"
          />
        ) : (
          <div className="w-5 h-3.5 border border-dashed border-foreground/20 rounded-[2px] bg-foreground/5 flex items-center justify-center shrink-0">
            <span className="text-[7px] text-muted-foreground/40">?</span>
          </div>
        )}
        <span
          className={cn(
            "font-medium text-xs truncate",
            team
              ? win
                ? "font-bold text-foreground"
                : loss
                  ? "text-muted-foreground/50"
                  : "text-foreground"
              : "text-muted-foreground/60 italic"
          )}
        >
          {team ? getTeamName(team.name, locale) : label}
        </span>
      </div>
      {showScore && score !== null && (
        <span
          className={cn(
            "font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm select-none shrink-0",
            win ? "text-green-500 bg-green-500/10" : "text-muted-foreground/60"
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function MatchCard({
  match,
  locale,
  hovered,
  onHover,
  liveById,
}: {
  match: KoMatch;
  locale: string;
  hovered: boolean;
  onHover: (id: number | null) => void;
  liveById: Map<number, MatchWithDetails>;
}) {
  const live = liveById.get(match.id);
  const status = live?.status ?? "scheduled";
  const isLive = status === "live";
  const showScore = status === "finished" || status === "live";

  const homeTeam = resolveParticipant(match.id, "home", liveById);
  const awayTeam = resolveParticipant(match.id, "away", liveById);
  const homeScore = live?.home_score ?? null;
  const awayScore = live?.away_score ?? null;

  const decided =
    showScore && homeScore !== null && awayScore !== null && homeScore !== awayScore;
  const homeWin = decided && homeScore! > awayScore!;
  const awayWin = decided && awayScore! > homeScore!;

  const dt = live ? fmtDate(live.match_date) : { date: match.date, time: match.time };

  return (
    <div
      onMouseEnter={() => onHover(match.id)}
      onMouseLeave={() => onHover(null)}
      className={`block w-[185px] relative z-10 transition-all duration-300 ${
        hovered ? "scale-[1.04]" : "hover:scale-[1.02]"
      }`}
    >
      <div
        className={cn(
          "backdrop-blur-md border rounded-xl overflow-hidden shadow-lg transition-all duration-300",
          isLive
            ? "bg-red-500/5 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.18)]"
            : hovered
              ? "bg-card/95 border-brand-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.18)]"
              : "bg-card/75 border-border/50"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "px-2.5 py-1.5 text-[10px] flex justify-between items-center border-b font-medium",
            isLive
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-secondary/50 border-border/40 text-muted-foreground"
          )}
        >
          <span className="font-mono font-bold tracking-wider opacity-85">
            #{match.id}
          </span>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold tracking-widest text-[9px] uppercase animate-pulse">
                  LIVE
                </span>
              </>
            ) : (
              <span>
                {dt.date} {dt.time}
              </span>
            )}
          </div>
        </div>
        {/* Teams */}
        <div className="flex flex-col py-1">
          <TeamRow
            label={slotLabel(match.homeId, locale)}
            team={homeTeam}
            locale={locale}
            score={homeScore}
            showScore={showScore}
            win={homeWin}
            loss={awayWin}
          />
          <TeamRow
            label={slotLabel(match.awayId, locale)}
            team={awayTeam}
            locale={locale}
            score={awayScore}
            showScore={showScore}
            win={awayWin}
            loss={homeWin}
          />
        </div>
      </div>
    </div>
  );
}

function Column({
  matches,
  locale,
  hoveredId,
  onHover,
  liveById,
  extraClass,
}: {
  matches: KoMatch[];
  locale: string;
  hoveredId: number | null;
  onHover: (id: number | null) => void;
  liveById: Map<number, MatchWithDetails>;
  extraClass?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-around h-full shrink-0 ${extraClass ?? ""}`}
    >
      {matches.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          locale={locale}
          hovered={hoveredId === m.id}
          onHover={onHover}
          liveById={liveById}
        />
      ))}
    </div>
  );
}

export function BracketContent({
  initialMatches = [],
  groupsWithStandings = [],
}: {
  initialMatches?: MatchWithDetails[];
  groupsWithStandings?: GroupWithStandings[];
}) {
  const { locale } = useI18n();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { matches, updatedAt } = useLiveMatches(initialMatches);

  const liveById = useMemo(() => {
    const map = new Map<number, MatchWithDetails>();
    for (const m of matches) {
      const id = Number(m.id);
      if (Number.isFinite(id)) map.set(id, m);
    }
    return map;
  }, [matches]);

  const { leftCols, rightCols, centerCol } = useMemo(() => {
    const left = buildColumns(LEFT_ROOT);
    const right = buildColumns(RIGHT_ROOT);
    const center = [
      koMatchById.get(FINAL_ID),
      koMatchById.get(THIRD_PLACE_ID),
    ].filter(Boolean) as KoMatch[];
    return { leftCols: left, rightCols: right, centerCol: center };
  }, []);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-[1280px] px-4">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-brand-gold" />
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {locale === "zh" ? "淘汰赛对阵图" : "Knockout Bracket"}
          </h1>
          {updatedAt && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {locale === "zh" ? "实时" : "Live"} ·{" "}
              {updatedAt.toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          {locale === "zh"
            ? "32强单败淘汰制赛程，左右拖动查看完整的冠军晋级路线，悬停比赛可高亮晋级路径。比分实时更新。"
            : "32-team single elimination bracket. Scroll horizontally and hover a match to highlight its path. Scores update live."}
        </p>
      </div>

      {/* Group standings */}
      <GroupStandings groupsWithStandings={groupsWithStandings} />

      {/* Scrollable bracket */}
      <div className="border-t border-border bg-card/30">
        <div className="overflow-x-auto pb-8 pt-4">
        <div
          className="flex min-w-max px-8 items-center justify-center mx-auto"
          style={{ height: H }}
        >
          {/* Left half: columns each followed by their connector */}
          {leftCols.map((col, c) => (
            <div key={`left-${c}`} className="flex items-center h-full">
              <Column
                matches={col}
                locale={locale}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                liveById={liveById}
              />
              <Connector
                leftMatches={col}
                rightMatches={leftCols[c + 1] ?? centerCol}
                hoveredId={hoveredId}
              />
            </div>
          ))}

          {/* Center: Final + 3rd place */}
          <Column
            matches={centerCol}
            locale={locale}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            liveById={liveById}
            extraClass="z-10 px-2"
          />

          {/* Right half: connector then column, mirrored */}
          {rightCols
            .slice()
            .reverse()
            .map((col, n) => {
              const c = 3 - n;
              const inner = c === 3 ? centerCol : rightCols[c + 1];
              return (
                <div key={`right-${c}`} className="flex items-center h-full">
                  <Connector
                    leftMatches={inner}
                    rightMatches={col}
                    hoveredId={hoveredId}
                  />
                  <Column
                    matches={col}
                    locale={locale}
                    hoveredId={hoveredId}
                    onHover={setHoveredId}
                    liveById={liveById}
                  />
                </div>
              );
            })}
        </div>
      </div>
      </div>
    </div>
  );
}
