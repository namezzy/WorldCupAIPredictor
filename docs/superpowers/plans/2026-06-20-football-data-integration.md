# Football-Data.org Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the worldcup26.ir data source with football-data.org v4 API, remove mock fallback, and enhance predictions with real match statistics.

**Architecture:** Rewrite `worldcup-api.ts` to call football-data.org v4 endpoints (`/competitions/WC/teams`, `/matches`, `/standings`), map responses to existing `Team`/`Match`/`GroupStanding` types, and compute prediction stats from real match data. The exported `getLiveData()` signature stays the same so consumers (`teams.ts`, `groups.ts`, `matches.ts`) need zero changes.

**Tech Stack:** Next.js 15, TypeScript, football-data.org REST API v4

---

### Task 1: Update environment variables

**Files:**
- Modify: `.env.local.example`
- Modify: `.env.local` (local only, not committed)

- [ ] **Step 1: Update `.env.local.example`**

Replace the file contents with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
REDIS_URL=your_redis_url

# football-data.org API key (required — get one at https://www.football-data.org/client/home)
FOOTBALL_DATA_API_KEY=your_football_data_api_key
```

- [ ] **Step 2: Create/update local `.env.local`**

Add the real API key to `.env.local`:

```env
FOOTBALL_DATA_API_KEY=0d4b1cc8b773476fa0ecacff5e8d14ea
```

- [ ] **Step 3: Commit**

```bash
git add .env.local.example
git commit -m "chore: update env example for football-data.org API"
```

---

### Task 2: Rewrite `worldcup-api.ts` — API types and fetch helper

**Files:**
- Modify: `src/lib/data/worldcup-api.ts` (complete rewrite)

This task replaces the entire file. We split the write into two tasks for clarity: this one covers types/fetch/helpers, and Task 3 covers mappers and the main `getLiveData()` function.

- [ ] **Step 1: Replace file with API types and fetch infrastructure**

Replace the entire content of `src/lib/data/worldcup-api.ts` with:

```typescript
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

// API responses
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
  // football-data.org uses "GROUP_A", "GROUP_B", etc.
  const letter = group.replace("GROUP_", "").toLowerCase();
  return `group-${letter}`;
}

function mapStage(stage: string): MatchStage {
  switch (stage) {
    case "GROUP_STAGE":
      return "group";
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
  recentResults: string[]; // last 5: "W", "D", "L"
}

function computeTeamStats(
  teamId: number,
  matches: FdMatch[]
): TeamStats {
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

function mapTeam(
  api: FdTeam,
  groupId: string | null,
  stats: TeamStats
): Team {
  const avgScored =
    stats.matchesPlayed > 0 ? stats.goalsScored / stats.matchesPlayed : 1.3;
  const avgConceded =
    stats.matchesPlayed > 0 ? stats.goalsConceded / stats.matchesPlayed : 1.3;

  // Simple ELO estimate: start at 1500, +30 per win, -30 per loss, +0 draw
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
      stats.recentResults.length > 0
        ? stats.recentResults.join("")
        : null,
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

  // Factor in recent form
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
  const formAdj = (homeForm - awayForm) * 0.1; // slight boost/penalty

  const adjustedHome = Math.max(0.05, Math.min(0.95, expHome + formAdj));

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
    predicted_home_score: Math.round(home.avg_goals_scored),
    predicted_away_score: Math.round(away.avg_goals_scored),
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
      const letter = s.group.replace("GROUP_", "");
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

  // Build group lookup from standings
  const teamGroupMap = new Map<number, string>();
  for (const sg of standingsRes.standings) {
    if (sg.type === "TOTAL" && sg.group) {
      const gid = parseGroupId(sg.group);
      for (const row of sg.table) {
        if (gid) teamGroupMap.set(row.team.id, gid);
      }
    }
  }

  // Build teams with stats from match data
  const teams = teamsRes.teams.map((t) => {
    const stats = computeTeamStats(t.id, matchesRes.matches);
    const gid = teamGroupMap.get(t.id) ?? null;
    return mapTeam(t, gid, stats);
  });
  const teamById = new Map(teams.map((t) => [t.id, t]));

  // Build standings (enriched with team objects)
  const groupsWithStandings = mapStandings(
    standingsRes.standings,
    teamById
  );
  const groupById = new Map(
    groupsWithStandings.map((g) => [g.group.id, g.group])
  );

  // Build matches
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
```

- [ ] **Step 2: Verify the file has no TypeScript errors**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: No errors related to `worldcup-api.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/worldcup-api.ts
git commit -m "feat: replace worldcup26.ir with football-data.org v4 API

Rewrites worldcup-api.ts to use football-data.org v4 endpoints.
Maps API responses to existing Team/Match/GroupStanding types.
Enhances predictions with real match statistics (form, goals).
Removes mock data fallback — API errors propagate directly."
```

---

### Task 3: Remove mock-data dependency

**Files:**
- Delete: `src/lib/data/mock-data.ts`

- [ ] **Step 1: Delete mock-data.ts**

```bash
rm src/lib/data/mock-data.ts
```

- [ ] **Step 2: Verify no remaining imports of mock-data**

```bash
grep -r "mock-data" src/
```
Expected: No results.

- [ ] **Step 3: Verify TypeScript compilation**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove mock-data.ts (no longer used)"
```

---

### Task 4: Verify build and runtime

**Files:** None (verification only)

- [ ] **Step 1: Run the build**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1 | tail -20
```
Expected: No errors.

- [ ] **Step 3: Smoke test — start dev server and verify API call works**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/api/live-matches | head -c 500
```
Expected: JSON response with `matches` array containing real World Cup data. Kill the dev server after.

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address build/lint issues from API migration"
```
