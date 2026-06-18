import type {
  Group,
  GroupStanding,
  MatchStage,
  MatchStatus,
  MatchWithDetails,
  Prediction,
  Team,
  Venue,
} from "@/types";

import {
  mockGroups,
  mockMatches,
  mockStandings,
  mockTeams,
} from "./mock-data";

/**
 * Live data source: free & open FIFA World Cup 2026 REST API.
 * https://github.com/rezarahiminia/worldcup2026 (host: worldcup26.ir)
 * No API key required.
 */
const API_BASE =
  process.env.WORLDCUP_API_URL?.replace(/\/$/, "") || "https://worldcup26.ir";

// ---------------------------------------------------------------------------
// Raw API response shapes
// ---------------------------------------------------------------------------
interface ApiTeam {
  id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
}

interface ApiStadium {
  id: string;
  name_en: string;
  fifa_name?: string;
  city_en: string;
  country_en: string;
  capacity: number | string;
}

interface ApiGame {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
}

interface ApiGroupTeam {
  team_id: string;
  mp: string;
  w: string;
  l: string;
  d: string;
  pts: string;
  gf: string;
  ga: string;
  gd: string;
}

interface ApiGroup {
  name: string;
  teams: ApiGroupTeam[];
}

export interface LiveData {
  matches: MatchWithDetails[];
  teams: Team[];
  groupsWithStandings: Array<{ group: Group; standings: GroupStanding[] }>;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
// How long Next.js caches an upstream response before refetching (seconds).
const REVALIDATE_SECONDS = 60;
// Abort a slow upstream request so navigation never blocks on a hung API.
const FETCH_TIMEOUT_MS = 3_000;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Cache upstream responses in Next's Data Cache so navigation between
    // pages doesn't trigger a fresh blocking round-trip on every click.
    next: { revalidate: REVALIDATE_SECONDS, tags: ["worldcup"] },
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`worldcup api ${path} -> ${res.status}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
const mockTeamByCode = new Map(mockTeams.map((t) => [t.code.toUpperCase(), t]));

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function groupId(letter: string): string {
  return `group-${letter.trim().toLowerCase()}`;
}

function mapStage(type: string): MatchStage {
  switch (type) {
    case "r32":
      return "round_of_32";
    case "r16":
      return "round_of_16";
    case "qf":
      return "quarter_final";
    case "sf":
      return "semi_final";
    case "final":
      return "final";
    case "third":
      return "third_place";
    default:
      return "group";
  }
}

function mapStatus(game: ApiGame): MatchStatus {
  if (game.finished === "TRUE") return "finished";
  if (game.time_elapsed && game.time_elapsed !== "notstarted") return "live";
  return "scheduled";
}

/** Convert "MM/DD/YYYY HH:mm" into an ISO-like local datetime string. */
function parseLocalDate(local: string): string {
  const m = local.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return new Date().toISOString();
  const [, mm, dd, yyyy, hh, min] = m;
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : 0;
}

function mapTeam(api: ApiTeam): Team {
  const base = mockTeamByCode.get(api.fifa_code.toUpperCase());
  return {
    id: api.id,
    name: api.name_en,
    slug: base?.slug ?? slugify(api.name_en),
    code: api.fifa_code,
    flag_url: api.flag || base?.flag_url || null,
    confederation: base?.confederation ?? "",
    fifa_ranking: base?.fifa_ranking ?? null,
    world_cup_appearances: base?.world_cup_appearances ?? 0,
    best_result: base?.best_result ?? null,
    group_id: groupId(api.groups),
    elo_rating: base?.elo_rating ?? 1500,
    avg_goals_scored: base?.avg_goals_scored ?? 1.3,
    avg_goals_conceded: base?.avg_goals_conceded ?? 1.3,
    recent_form: base?.recent_form ?? null,
  };
}

function mapVenue(api: ApiStadium): Venue {
  return {
    id: `venue-${api.id}`,
    name: api.name_en || api.fifa_name || "TBD",
    city: api.city_en,
    country: api.country_en,
    capacity: toNumber(api.capacity) || null,
    image_url: null,
  };
}

function placeholderTeam(label: string, key: string): Team {
  return {
    id: `tbd-${key}`,
    name: label,
    slug: "",
    code: "",
    flag_url: null,
    confederation: "",
    fifa_ranking: null,
    world_cup_appearances: 0,
    best_result: null,
    group_id: null,
    elo_rating: 1500,
    avg_goals_scored: 0,
    avg_goals_conceded: 0,
    recent_form: null,
  };
}

/** Lightweight ELO-based prediction so prediction-driven UI keeps working. */
function buildPrediction(
  matchId: string,
  home: Team,
  away: Team
): Prediction | null {
  if (home.id.startsWith("tbd-") || away.id.startsWith("tbd-")) return null;

  const expHome = 1 / (1 + Math.pow(10, (away.elo_rating - home.elo_rating) / 400));
  const drawProb = Math.max(0.16, 0.3 - Math.abs(expHome - 0.5) * 0.4);
  let homeWin = expHome - drawProb / 2;
  let awayWin = 1 - homeWin - drawProb;
  homeWin = Math.min(0.96, Math.max(0.02, homeWin));
  awayWin = Math.min(0.96, Math.max(0.02, awayWin));
  const total = homeWin + awayWin + drawProb;
  const hp = Math.round((homeWin / total) * 100);
  const dp = Math.round((drawProb / total) * 100);
  const ap = 100 - hp - dp;

  return {
    id: `prediction-${matchId}`,
    match_id: matchId,
    home_win_prob: hp,
    draw_prob: dp,
    away_win_prob: ap,
    predicted_home_score: Math.round(home.avg_goals_scored),
    predicted_away_score: Math.round(away.avg_goals_scored),
    confidence: Math.max(hp, dp, ap),
    analysis: null,
  };
}

function mapMatch(
  game: ApiGame,
  teamById: Map<string, Team>,
  venueById: Map<string, Venue>,
  groupById: Map<string, Group>
): MatchWithDetails {
  const status = mapStatus(game);
  const stage = mapStage(game.type);

  const homeTeam =
    teamById.get(game.home_team_id) ??
    placeholderTeam(
      game.home_team_label || game.home_team_name_en || "TBD",
      `${game.id}-h`
    );
  const awayTeam =
    teamById.get(game.away_team_id) ??
    placeholderTeam(
      game.away_team_label || game.away_team_name_en || "TBD",
      `${game.id}-a`
    );

  const venue = venueById.get(`venue-${game.stadium_id}`) ?? {
    id: `venue-${game.stadium_id}`,
    name: "TBD",
    city: "",
    country: "",
    capacity: null,
    image_url: null,
  };

  const gid = stage === "group" ? groupId(game.group) : null;
  const group = gid ? groupById.get(gid) ?? null : null;

  const homeScore = status === "scheduled" ? null : toNumber(game.home_score);
  const awayScore = status === "scheduled" ? null : toNumber(game.away_score);

  return {
    id: game.id,
    match_number: toNumber(game.id),
    home_team_id: homeTeam.id.startsWith("tbd-") ? null : homeTeam.id,
    away_team_id: awayTeam.id.startsWith("tbd-") ? null : awayTeam.id,
    home_team: homeTeam,
    away_team: awayTeam,
    group_id: gid,
    group,
    venue_id: venue.id,
    venue,
    match_date: parseLocalDate(game.local_date),
    stage,
    status,
    home_score: homeScore,
    away_score: awayScore,
    referee: null,
    weather: null,
    prediction: buildPrediction(game.id, homeTeam, awayTeam),
  };
}

function mapStandings(
  apiGroups: ApiGroup[],
  teamById: Map<string, Team>
): Array<{ group: Group; standings: GroupStanding[] }> {
  return apiGroups
    .map((g) => {
      const gid = groupId(g.name);
      const group: Group = { id: gid, name: g.name };
      const rows = [...g.teams]
        .map((t) => ({
          team: t,
          points: toNumber(t.pts),
          gd: toNumber(t.gd),
          gf: toNumber(t.gf),
        }))
        .sort(
          (a, b) =>
            b.points - a.points || b.gd - a.gd || b.gf - a.gf
        )
        .map((entry, idx): GroupStanding => {
          const t = entry.team;
          const team = teamById.get(t.team_id);
          return {
            id: `${gid}-${t.team_id}`,
            group_id: gid,
            team_id: t.team_id,
            team,
            played: toNumber(t.mp),
            won: toNumber(t.w),
            drawn: toNumber(t.d),
            lost: toNumber(t.l),
            goals_for: toNumber(t.gf),
            goals_against: toNumber(t.ga),
            goal_difference: toNumber(t.gd),
            points: toNumber(t.pts),
            position: idx + 1,
          };
        });
      return { group, standings: rows };
    })
    .sort((a, b) => a.group.name.localeCompare(b.group.name));
}

// ---------------------------------------------------------------------------
// Aggregation + in-memory throttle cache
// ---------------------------------------------------------------------------
// Serve a successful upstream payload for this long before refetching.
const CACHE_TTL_MS = 60_000;
// When upstream is unreachable, serve the mock fallback for this long before
// retrying. This prevents every navigation from paying the full fetch timeout.
const FAILURE_TTL_MS = 30_000;

type CacheEntry = { at: number; data: LiveData; stale: boolean };
// Persist the cache on globalThis so it survives Next.js dev module reloads
// (which otherwise reset module-level state on every request/navigation).
const globalCache = globalThis as typeof globalThis & {
  __worldcupCache?: CacheEntry | null;
  __worldcupInflight?: Promise<LiveData> | null;
};
globalCache.__worldcupCache ??= null;
globalCache.__worldcupInflight ??= null;

function mockLiveData(): LiveData {
  const groupsWithStandings = mockGroups
    .map((group) => ({
      group,
      standings: mockStandings
        .filter((s) => s.group_id === group.id)
        .sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.group.name.localeCompare(b.group.name));
  return { matches: mockMatches, teams: mockTeams, groupsWithStandings };
}

async function loadLiveData(): Promise<LiveData> {
  const [teamsRes, stadiumsRes, gamesRes, groupsRes] = await Promise.all([
    fetchJson<{ teams: ApiTeam[] }>("/get/teams"),
    fetchJson<{ stadiums: ApiStadium[] }>("/get/stadiums"),
    fetchJson<{ games: ApiGame[] }>("/get/games"),
    fetchJson<{ groups: ApiGroup[] }>("/get/groups"),
  ]);

  const teams = teamsRes.teams.map(mapTeam);
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const venueById = new Map(
    stadiumsRes.stadiums.map((s) => {
      const v = mapVenue(s);
      return [v.id, v] as const;
    })
  );
  const groupsWithStandings = mapStandings(groupsRes.groups, teamById);
  const groupById = new Map(
    groupsWithStandings.map((g) => [g.group.id, g.group])
  );

  const matches = gamesRes.games
    .map((g) => mapMatch(g, teamById, venueById, groupById))
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );

  return { matches, teams, groupsWithStandings };
}

/**
 * Returns live tournament data, throttled to one upstream fetch per
 * {@link CACHE_TTL_MS}. Falls back to bundled mock data on any failure so the
 * app always renders.
 */
export async function getLiveData(): Promise<LiveData> {
  const now = Date.now();
  const cache = globalCache.__worldcupCache;
  if (cache) {
    const ttl = cache.stale ? FAILURE_TTL_MS : CACHE_TTL_MS;
    if (now - cache.at < ttl) return cache.data;
  }
  if (globalCache.__worldcupInflight) return globalCache.__worldcupInflight;

  globalCache.__worldcupInflight = loadLiveData()
    .then((data) => {
      globalCache.__worldcupCache = { at: Date.now(), data, stale: false };
      return data;
    })
    .catch((err) => {
      console.error("[worldcup-api] live fetch failed, using mock data:", err);
      const fallback = globalCache.__worldcupCache?.data ?? mockLiveData();
      // Cache the fallback so subsequent navigations don't each wait out the
      // upstream timeout; retry again after FAILURE_TTL_MS.
      globalCache.__worldcupCache = { at: Date.now(), data: fallback, stale: true };
      return fallback;
    })
    .finally(() => {
      globalCache.__worldcupInflight = null;
    });

  return globalCache.__worldcupInflight;
}
