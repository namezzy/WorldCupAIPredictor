# Design: Replace Data Source with football-data.org

**Date:** 2026-06-20
**Status:** Approved

## Overview

Replace the existing `worldcup26.ir` data source with the football-data.org v4 API for all match, team, and standings data. Remove mock data fallback — API failures surface as errors. Enhance prediction accuracy using API-provided statistics.

## API Details

- **Base URL:** `https://api.football-data.org/v4`
- **Auth:** Header `X-Auth-Token: <key>`
- **Competition code:** `WC` (FIFA World Cup 2026)
- **Rate limit (free tier):** 10 requests/minute

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v4/competitions/WC/teams` | All participating teams |
| `GET /v4/competitions/WC/matches` | All matches with scores and status |
| `GET /v4/competitions/WC/standings` | Group stage standings |

## File Changes

| File | Action |
|------|--------|
| `.env.local` | Add `FOOTBALL_DATA_API_KEY` |
| `.env.local.example` | Update with new env var, remove old ones |
| `src/lib/data/worldcup-api.ts` | Complete rewrite — call football-data.org, map to existing types |
| `src/lib/data/mock-data.ts` | Remove (no longer used) |

## Data Mapping

### Team Mapping

```
football-data.org         →  App Type (Team)
─────────────────────────────────────────────
team.id                   →  id (as string)
team.name                 →  name
team.shortName (slugified)→  slug
team.tla                  →  code
team.crest                →  flag_url
team.area.name            →  confederation (mapped)
team.group (from standings)→ group_id
```

Additional team stats derived from match history:
- `elo_rating`: Calculated from recent results
- `avg_goals_scored`: Average from competition matches
- `avg_goals_conceded`: Average from competition matches
- `recent_form`: Last 5 match results (W/D/L string)

### Match Mapping

```
football-data.org         →  App Type (MatchWithDetails)
─────────────────────────────────────────────
match.id                  →  id (as string)
match.matchday            →  match_number
match.homeTeam.id         →  home_team_id
match.awayTeam.id         →  away_team_id
match.group               →  group_id (parsed)
match.venue               →  venue (name only, limited data)
match.utcDate             →  match_date
match.stage               →  stage (mapped)
match.status              →  status (mapped)
match.score.fullTime.home →  home_score
match.score.fullTime.away →  away_score
match.referees[0]         →  referee
```

### Status Mapping

```
football-data.org  →  App MatchStatus
───────────────────────────────────────
SCHEDULED          →  scheduled
TIMED              →  scheduled
IN_PLAY            →  live
PAUSED             →  live
FINISHED           →  finished
POSTPONED          →  postponed
CANCELLED          →  postponed
```

### Stage Mapping

```
football-data.org  →  App MatchStage
───────────────────────────────────────
GROUP_STAGE        →  group
ROUND_OF_32        →  round_of_32 (new for 2026 format)
LAST_16            →  round_of_16
QUARTER_FINALS     →  quarter_final
SEMI_FINALS        →  semi_final
THIRD_PLACE        →  third_place
FINAL              →  final
```

### Standings Mapping

```
football-data.org         →  App Type (GroupStanding)
─────────────────────────────────────────────
standing.group            →  group_id
table[].team.id           →  team_id
table[].position          →  position
table[].playedGames       →  played
table[].won               →  won
table[].draw              →  drawn
table[].lost              →  lost
table[].goalsFor          →  goals_for
table[].goalsAgainst      →  goals_against
table[].goalDifference    →  goal_difference
table[].points            →  points
```

## Prediction Enhancement

Current ELO model is supplemented with real statistics from the API:

1. **Goals scored/conceded per match** — calculated from actual competition data
2. **Recent form** — derived from last 5 matches in the competition
3. **Win probability** — ELO adjusted by:
   - Home/away scoring differential
   - Recent form weight (W=1.0, D=0.5, L=0.0, averaged)
   - Goal difference trend

The `buildPrediction()` function remains ELO-based but now uses real `avg_goals_scored`, `avg_goals_conceded`, and `recent_form` instead of mock defaults.

## Caching Strategy

- `next: { revalidate: 120 }` on all fetch calls (2-minute ISR cache)
- In-memory request deduplication (same as current `__worldcupInflight` pattern)
- No in-memory TTL cache needed — Next.js Data Cache handles it
- 3 API calls per cache miss (teams + matches + standings) = well within 10/min limit

## Error Handling

| Scenario | Behavior |
|----------|----------|
| 429 Rate Limited | Throw error: "API rate limit exceeded. Please wait." |
| 401/403 Forbidden | Throw error: "Invalid API key." |
| Network timeout (5s) | Throw error: "Data source unavailable." |
| Invalid response | Throw error with details |

Errors propagate to Next.js error boundaries — no silent fallback to mock data.

## Environment Variables

```env
FOOTBALL_DATA_API_KEY=0d4b1cc8b773476fa0ecacff5e8d14ea
```

Remove from `.env.local.example`:
- `WORLDCUP_API_URL`

Add to `.env.local.example`:
- `FOOTBALL_DATA_API_KEY=your_football_data_api_key`
