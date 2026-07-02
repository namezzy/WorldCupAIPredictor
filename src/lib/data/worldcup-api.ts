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

// ---------------------------------------------------------------------------
// football-data.org v4 API
// Docs: https://www.football-data.org/documentation/api
// ---------------------------------------------------------------------------
const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? "";
const COMPETITION = "WC"; // FIFA World Cup 2026

export interface LiveData {
  matches: MatchWithDetails[];
  teams: Team[];
  groupsWithStandings: Array<{ group: Group; standings: GroupStanding[] }>;
}

// ---------------------------------------------------------------------------
// Raw API response shapes (football-data.org v4)
// ---------------------------------------------------------------------------
interface FdArea {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  area: FdArea;
}

interface FdScore {
  home: number | null;
  away: number | null;
}

interface FdFullScore {
  winner: string | null;
  duration: string;
  fullTime: FdScore;
  halfTime: FdScore;
}

interface FdReferee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: FdFullScore;
  referees: FdReferee[];
  venue: string | null;
}

interface FdStandingRow {
  position: number;
  team: FdTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface FdStandingGroup {
  stage: string;
  type: string;
  group: string;
  table: FdStandingRow[];
}

interface FdTeamsResponse {
  teams: FdTeam[];
}

interface FdMatchesResponse {
  matches: FdMatch[];
}

interface FdStandingsResponse {
  standings: FdStandingGroup[];
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------
const REVALIDATE_SECONDS = 120;
const FETCH_TIMEOUT_MS = 8_000;

async function fetchApi<T>(path: string): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      "FOOTBALL_DATA_API_KEY is not set. Get one at https://www.football-data.org/client/home"
    );
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["worldcup"] },
    headers: {
      "X-Auth-Token": API_KEY,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (res.status === 429) {
    throw new Error("football-data.org API rate limit exceeded. Please wait and try again.");
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("football-data.org API key is invalid or expired.");
  }
  if (!res.ok) {
    throw new Error(`football-data.org API error: ${path} → ${res.status}`);
  }

  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapConfederation(areaName: string): string {
  const map: Record<string, string> = {
    "South America": "CONMEBOL",
    Europe: "UEFA",
    Africa: "CAF",
    Asia: "AFC",
    "North America": "CONCACAF",
    "Central America": "CONCACAF",
    "North/Central America": "CONCACAF",
    Oceania: "OFC",
  };
  return map[areaName] ?? "";
}

function parseGroupId(group: string | null): string | null {
  if (!group) return null;
  const letter = group.replace(/^GROUP_/i, "").replace(/^Group\s*/i, "").toLowerCase();
  return `group-${letter}`;
}

function mapStage(stage: string): MatchStage {
  switch (stage) {
    case "GROUP_STAGE":
      return "group";
    case "LAST_32":
    case "ROUND_OF_32":
      return "round_of_32";
    case "LAST_16":
      return "round_of_16";
    case "QUARTER_FINALS":
      return "quarter_final";
    case "SEMI_FINALS":
      return "semi_final";
    case "THIRD_PLACE":
      return "third_place";
    case "FINAL":
      return "final";
    default:
      return "group";
  }
}

function mapStatus(status: string): MatchStatus {
  switch (status) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "POSTPONED":
    case "CANCELLED":
    case "SUSPENDED":
      return "postponed";
    default:
      return "scheduled";
  }
}

// ---------------------------------------------------------------------------
// Team builder with stats from match data
// ---------------------------------------------------------------------------
interface TeamStats {
  goalsScored: number;
  goalsConceded: number;
  matchesPlayed: number;
  recentResults: string[];
}

function computeTeamStats(teamId: number, matches: FdMatch[]): TeamStats {
  const finished = matches
    .filter(
      (m) =>
        m.status === "FINISHED" &&
        (m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    )
    .sort(
      (a, b) =>
        new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    );

  let goalsScored = 0;
  let goalsConceded = 0;
  const results: string[] = [];

  for (const m of finished) {
    const isHome = m.homeTeam.id === teamId;
    const homeGoals = m.score.fullTime.home ?? 0;
    const awayGoals = m.score.fullTime.away ?? 0;

    if (isHome) {
      goalsScored += homeGoals;
      goalsConceded += awayGoals;
      if (homeGoals > awayGoals) results.push("W");
      else if (homeGoals < awayGoals) results.push("L");
      else results.push("D");
    } else {
      goalsScored += awayGoals;
      goalsConceded += homeGoals;
      if (awayGoals > homeGoals) results.push("W");
      else if (awayGoals < homeGoals) results.push("L");
      else results.push("D");
    }
  }

  return {
    goalsScored,
    goalsConceded,
    matchesPlayed: finished.length,
    recentResults: results.slice(-5),
  };
}

function mapTeam(api: FdTeam, groupId: string | null, stats: TeamStats): Team {
  const avgScored =
    stats.matchesPlayed > 0 ? stats.goalsScored / stats.matchesPlayed : 1.3;
  const avgConceded =
    stats.matchesPlayed > 0 ? stats.goalsConceded / stats.matchesPlayed : 1.3;

  let elo = 1500;
  for (const r of stats.recentResults) {
    if (r === "W") elo += 30;
    else if (r === "L") elo -= 30;
  }

  return {
    id: String(api.id),
    name: api.name,
    slug: slugify(api.shortName || api.name),
    code: api.tla,
    flag_url: api.crest || api.area?.flag || null,
    confederation: mapConfederation(api.area?.name ?? ""),
    fifa_ranking: null,
    world_cup_appearances: 0,
    best_result: null,
    group_id: groupId,
    elo_rating: elo,
    avg_goals_scored: Math.round(avgScored * 100) / 100,
    avg_goals_conceded: Math.round(avgConceded * 100) / 100,
    recent_form:
      stats.recentResults.length > 0 ? stats.recentResults.join("") : null,
  };
}

// ---------------------------------------------------------------------------
// Match & venue mappers
// ---------------------------------------------------------------------------
function mapVenue(venueName: string | null): Venue {
  return {
    id: `venue-${slugify(venueName || "tbd")}`,
    name: venueName || "TBD",
    city: "",
    country: "",
    capacity: null,
    image_url: null,
  };
}

function placeholderTeam(name: string, key: string): Team {
  return {
    id: `tbd-${key}`,
    name: name || "TBD",
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

function buildPrediction(
  matchId: string,
  home: Team,
  away: Team
): Prediction | null {
  if (home.id.startsWith("tbd-") || away.id.startsWith("tbd-")) return null;

  const expHome =
    1 / (1 + Math.pow(10, (away.elo_rating - home.elo_rating) / 400));

  const formWeight = (form: string | null): number => {
    if (!form) return 0.5;
    let score = 0;
    for (const ch of form) {
      if (ch === "W") score += 1.0;
      else if (ch === "D") score += 0.5;
    }
    return score / form.length;
  };
  const homeForm = formWeight(home.recent_form);
  const awayForm = formWeight(away.recent_form);
  const formAdj = (homeForm - awayForm) * 0.1;

  // Defensive strength: lower avg_goals_conceded = stronger defense
  const defAdj =
    (away.avg_goals_conceded - home.avg_goals_conceded) * 0.05;

  const adjustedHome = Math.max(
    0.05,
    Math.min(0.95, expHome + formAdj + defAdj)
  );

  const drawProb = Math.max(0.16, 0.3 - Math.abs(adjustedHome - 0.5) * 0.4);
  let homeWin = adjustedHome - drawProb / 2;
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
    predicted_home_score: Math.round(
      (home.avg_goals_scored + away.avg_goals_conceded) / 2
    ),
    predicted_away_score: Math.round(
      (away.avg_goals_scored + home.avg_goals_conceded) / 2
    ),
    confidence: Math.max(hp, dp, ap),
    analysis: null,
  };
}

function mapMatch(
  m: FdMatch,
  teamById: Map<string, Team>,
  groupById: Map<string, Group>
): MatchWithDetails {
  const status = mapStatus(m.status);
  const stage = mapStage(m.stage);
  const gid = parseGroupId(m.group);

  const homeTeam =
    teamById.get(String(m.homeTeam.id)) ??
    placeholderTeam(m.homeTeam.name || "TBD", `${m.id}-h`);
  const awayTeam =
    teamById.get(String(m.awayTeam.id)) ??
    placeholderTeam(m.awayTeam.name || "TBD", `${m.id}-a`);

  const venue = mapVenue(m.venue);
  const group = gid ? groupById.get(gid) ?? null : null;

  const homeScore =
    status === "scheduled" ? null : (m.score.fullTime.home ?? null);
  const awayScore =
    status === "scheduled" ? null : (m.score.fullTime.away ?? null);

  return {
    id: String(m.id),
    match_number: m.matchday,
    home_team_id: homeTeam.id.startsWith("tbd-") ? null : homeTeam.id,
    away_team_id: awayTeam.id.startsWith("tbd-") ? null : awayTeam.id,
    home_team: homeTeam,
    away_team: awayTeam,
    group_id: gid,
    group,
    venue_id: venue.id,
    venue,
    match_date: m.utcDate,
    stage,
    status,
    home_score: homeScore,
    away_score: awayScore,
    referee: m.referees?.[0]?.name ?? null,
    weather: null,
    prediction: buildPrediction(String(m.id), homeTeam, awayTeam),
  };
}

// ---------------------------------------------------------------------------
// Standings mapper
// ---------------------------------------------------------------------------
function mapStandings(
  fdStandings: FdStandingGroup[],
  teamById: Map<string, Team>
): Array<{ group: Group; standings: GroupStanding[] }> {
  return fdStandings
    .filter((s) => s.type === "TOTAL" && s.group)
    .map((s) => {
      const gid = parseGroupId(s.group)!;
      const letter = s.group.replace(/^GROUP_/i, "").replace(/^Group\s*/i, "").trim();
      const group: Group = { id: gid, name: letter };

      const standings: GroupStanding[] = s.table.map(
        (row): GroupStanding => ({
          id: `${gid}-${row.team.id}`,
          group_id: gid,
          team_id: String(row.team.id),
          team: teamById.get(String(row.team.id)),
          played: row.playedGames,
          won: row.won,
          drawn: row.draw,
          lost: row.lost,
          goals_for: row.goalsFor,
          goals_against: row.goalsAgainst,
          goal_difference: row.goalDifference,
          points: row.points,
          position: row.position,
        })
      );

      return { group, standings };
    })
    .sort((a, b) => a.group.name.localeCompare(b.group.name));
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
async function loadLiveData(): Promise<LiveData> {
  const [teamsRes, matchesRes, standingsRes] = await Promise.all([
    fetchApi<FdTeamsResponse>(`/competitions/${COMPETITION}/teams`),
    fetchApi<FdMatchesResponse>(`/competitions/${COMPETITION}/matches`),
    fetchApi<FdStandingsResponse>(`/competitions/${COMPETITION}/standings`),
  ]);

  const teamGroupMap = new Map<number, string>();
  for (const sg of standingsRes.standings) {
    if (sg.type === "TOTAL" && sg.group) {
      const gid = parseGroupId(sg.group);
      for (const row of sg.table) {
        if (gid) teamGroupMap.set(row.team.id, gid);
      }
    }
  }

  const teams = teamsRes.teams.map((t) => {
    const stats = computeTeamStats(t.id, matchesRes.matches);
    const gid = teamGroupMap.get(t.id) ?? null;
    return mapTeam(t, gid, stats);
  });
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const groupsWithStandings = mapStandings(standingsRes.standings, teamById);
  const groupById = new Map(
    groupsWithStandings.map((g) => [g.group.id, g.group])
  );

  const matches = matchesRes.matches
    .map((m) => mapMatch(m, teamById, groupById))
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );

  return { matches, teams, groupsWithStandings };
}

/**
 * Returns live World Cup 2026 data from football-data.org.
 * Throws on any API failure — no silent fallback.
 */
export async function getLiveData(): Promise<LiveData> {
  return loadLiveData();
}
