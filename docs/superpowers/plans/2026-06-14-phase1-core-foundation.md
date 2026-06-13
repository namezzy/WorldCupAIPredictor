# Phase 1: Core Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working WorldCup AI Predictor with project scaffolding, database schema, seed data, dark-themed UI shell, and core pages (Home, Teams, Matches, Groups).

**Architecture:** Next.js 15 App Router with TypeScript, TailwindCSS + shadcn/ui for styling, Supabase PostgreSQL for data. Static/ISR pages consuming Supabase client. All pages server-rendered by default.

**Tech Stack:** Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Lucide Icons, Supabase (PostgreSQL), next-intl (setup only)

---

## File Structure

```
worldcup-ai-predictor/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with dark theme, fonts
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Tailwind + custom CSS variables
│   │   ├── matches/
│   │   │   └── page.tsx               # Matches listing page
│   │   ├── match/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Match detail page
│   │   ├── teams/
│   │   │   └── page.tsx               # Teams listing page
│   │   ├── team/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Team detail page
│   │   └── groups/
│   │       └── page.tsx               # Groups page
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── header.tsx             # Site header with navigation
│   │   │   ├── footer.tsx             # Site footer
│   │   │   └── mobile-nav.tsx         # Mobile navigation drawer
│   │   ├── home/
│   │   │   ├── hero-section.tsx       # Hero with stats
│   │   │   └── hot-matches.tsx        # Featured matches cards
│   │   ├── matches/
│   │   │   ├── match-card.tsx         # Single match card
│   │   │   ├── match-filters.tsx      # Filter controls
│   │   │   └── match-list.tsx         # Match list container
│   │   ├── teams/
│   │   │   ├── team-card.tsx          # Team card component
│   │   │   └── team-grid.tsx          # Team grid layout
│   │   └── groups/
│   │       ├── group-table.tsx        # Group standings table
│   │       └── group-grid.tsx         # All groups grid
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase browser client
│   │   │   ├── server.ts             # Supabase server client
│   │   │   └── types.ts              # Database types
│   │   ├── data/
│   │   │   ├── teams.ts              # Team data queries
│   │   │   ├── matches.ts            # Match data queries
│   │   │   └── groups.ts             # Group data queries
│   │   └── utils.ts                  # Shared utilities
│   └── types/
│       └── index.ts                   # Shared TypeScript types
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # Full database schema
│   └── seed.sql                       # Seed data (teams, groups, matches)
├── public/
│   ├── flags/                         # Country flag SVGs (placeholder)
│   └── images/                        # Static images
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.local.example`, `.gitignore`

- [ ] **Step 1: Initialize Next.js 15 project**

```bash
cd "/Users/withlevi/Desktop/Project/World Cup AI Score Predictor"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Expected: Project initialized with Next.js 15 + App Router structure.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react class-variance-authority clsx tailwind-merge next-intl date-fns
npm install -D @types/node
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select: New York style, Zinc base color, CSS variables: yes.

- [ ] **Step 4: Install shadcn/ui components**

```bash
npx shadcn@latest add button card badge input select tabs table separator dropdown-menu sheet scroll-area avatar
```

- [ ] **Step 5: Create `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
REDIS_URL=your_redis_url
```

- [ ] **Step 6: Update `tailwind.config.ts` for dark theme and custom colors**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#D4AF37",
          maroon: "#8B0000",
          navy: "#1B1464",
        },
        pitch: {
          green: "#1A472A",
          light: "#2D5A3F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **Step 7: Update `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 15 project with dependencies"
```

---

## Task 2: Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write the complete database schema**

```sql
-- WorldCup AI Predictor Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TEAMS
-- ===========================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    flag_url VARCHAR(500),
    confederation VARCHAR(20) NOT NULL,
    fifa_ranking INTEGER,
    world_cup_appearances INTEGER DEFAULT 0,
    best_result VARCHAR(50),
    group_id UUID,
    elo_rating DECIMAL(7,2) DEFAULT 1500.00,
    avg_goals_scored DECIMAL(4,2) DEFAULT 0.00,
    avg_goals_conceded DECIMAL(4,2) DEFAULT 0.00,
    recent_form VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GROUPS
-- ===========================================
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(2) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for teams.group_id
ALTER TABLE teams ADD CONSTRAINT fk_teams_group
    FOREIGN KEY (group_id) REFERENCES groups(id);

-- ===========================================
-- GROUP STANDINGS
-- ===========================================
CREATE TABLE group_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    UNIQUE(group_id, team_id)
);

-- ===========================================
-- VENUES
-- ===========================================
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    capacity INTEGER,
    image_url VARCHAR(500)
);

-- ===========================================
-- MATCHES
-- ===========================================
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_number INTEGER NOT NULL UNIQUE,
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    group_id UUID REFERENCES groups(id),
    venue_id UUID REFERENCES venues(id),
    match_date TIMESTAMPTZ NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'group',
    status VARCHAR(20) DEFAULT 'scheduled',
    home_score INTEGER,
    away_score INTEGER,
    referee VARCHAR(100),
    weather VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- stage: 'group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'
-- status: 'scheduled', 'live', 'finished', 'postponed'

-- ===========================================
-- AI PREDICTIONS
-- ===========================================
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) UNIQUE,
    home_win_prob DECIMAL(5,2) NOT NULL,
    draw_prob DECIMAL(5,2) NOT NULL,
    away_win_prob DECIMAL(5,2) NOT NULL,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    analysis TEXT,
    model_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- USERS (extends Supabase auth.users)
-- ===========================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    total_points INTEGER DEFAULT 0,
    total_predictions INTEGER DEFAULT 0,
    exact_scores INTEGER DEFAULT 0,
    correct_outcomes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- USER PREDICTIONS
-- ===========================================
CREATE TABLE user_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id),
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    is_exact BOOLEAN DEFAULT FALSE,
    is_correct_outcome BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- ===========================================
-- LEADERBOARD (materialized view)
-- ===========================================
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    rank INTEGER,
    total_points INTEGER DEFAULT 0,
    total_predictions INTEGER DEFAULT 0,
    exact_scores INTEGER DEFAULT 0,
    correct_outcomes INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- POSTS (Community)
-- ===========================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    match_id UUID REFERENCES matches(id),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- COMMENTS
-- ===========================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LIKES
-- ===========================================
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_group ON matches(group_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_user_predictions_user ON user_predictions(user_id);
CREATE INDEX idx_user_predictions_match ON user_predictions(match_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_match ON posts(match_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_group_standings_group ON group_standings(group_id);
CREATE INDEX idx_teams_group ON teams(group_id);
CREATE INDEX idx_teams_slug ON teams(slug);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Public read access for core data
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public read standings" ON group_standings FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert predictions" ON user_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own predictions" ON user_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with RLS policies"
```

---

## Task 3: Seed Data

**Files:**
- Create: `supabase/seed.sql`
- Create: `src/lib/data/seed-data.ts` (TypeScript version for local dev)

- [ ] **Step 1: Create seed data with all 48 teams, 12 groups, venues, and sample matches**

The seed data file is large. It includes:
- 12 groups (A-L)
- 48 teams with FIFA rankings, confederations, Elo ratings
- 16 venues across USA/Canada/Mexico (2026 World Cup hosts)
- 104 group stage matches
- AI predictions for first 10 matches (sample)

See `supabase/seed.sql` — full content provided in implementation.

- [ ] **Step 2: Create TypeScript seed data for local development (no Supabase needed)**

Create `src/lib/data/seed-data.ts` with typed arrays that mirror the SQL seed data. This allows the app to run with mock data before Supabase is configured.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql src/lib/data/
git commit -m "feat: add seed data for 48 teams, 12 groups, venues, matches"
```

---

## Task 4: Supabase Client & Types

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/types.ts`
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create shared TypeScript types**

```typescript
// src/types/index.ts
export interface Team {
  id: string;
  name: string;
  slug: string;
  code: string;
  flag_url: string | null;
  confederation: string;
  fifa_ranking: number | null;
  world_cup_appearances: number;
  best_result: string | null;
  group_id: string | null;
  elo_rating: number;
  avg_goals_scored: number;
  avg_goals_conceded: number;
  recent_form: string | null;
}

export interface Group {
  id: string;
  name: string;
}

export interface GroupStanding {
  id: string;
  group_id: string;
  team_id: string;
  team?: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
  image_url: string | null;
}

export interface Match {
  id: string;
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_team?: Team;
  away_team?: Team;
  group_id: string | null;
  group?: Group;
  venue_id: string | null;
  venue?: Venue;
  match_date: string;
  stage: MatchStage;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  referee: string | null;
  weather: string | null;
}

export interface Prediction {
  id: string;
  match_id: string;
  home_win_prob: number;
  draw_prob: number;
  away_win_prob: number;
  predicted_home_score: number;
  predicted_away_score: number;
  confidence: number;
  analysis: string | null;
}

export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export interface MatchWithDetails extends Match {
  home_team: Team;
  away_team: Team;
  venue: Venue;
  group: Group | null;
  prediction: Prediction | null;
}
```

- [ ] **Step 2: Create Supabase clients**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create utility functions**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    group: "Group Stage",
    round_of_32: "Round of 32",
    round_of_16: "Round of 16",
    quarter_final: "Quarter Final",
    semi_final: "Semi Final",
    third_place: "3rd Place",
    final: "Final",
  };
  return labels[stage] || stage;
}

export function getFlagUrl(code: string): string {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/ src/types/
git commit -m "feat: add Supabase clients, types, and utilities"
```

---

## Task 5: Data Access Layer

**Files:**
- Create: `src/lib/data/teams.ts`
- Create: `src/lib/data/matches.ts`
- Create: `src/lib/data/groups.ts`
- Create: `src/lib/data/mock-data.ts`

- [ ] **Step 1: Create mock data for development without Supabase**

Create `src/lib/data/mock-data.ts` containing arrays of typed mock data for all 48 teams, 12 groups, 16 venues, sample matches with predictions. This file enables the app to run without a database connection.

- [ ] **Step 2: Create data access functions**

```typescript
// src/lib/data/teams.ts
import { Team } from "@/types";
import { mockTeams } from "./mock-data";

export async function getAllTeams(): Promise<Team[]> {
  // TODO: Replace with Supabase query when configured
  return mockTeams.sort((a, b) => (a.fifa_ranking || 999) - (b.fifa_ranking || 999));
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  return mockTeams.find((t) => t.slug === slug) || null;
}

export async function getTeamsByGroup(groupId: string): Promise<Team[]> {
  return mockTeams.filter((t) => t.group_id === groupId);
}
```

```typescript
// src/lib/data/matches.ts
import { MatchWithDetails } from "@/types";
import { mockMatches } from "./mock-data";

export async function getAllMatches(filters?: {
  stage?: string;
  groupId?: string;
  date?: string;
}): Promise<MatchWithDetails[]> {
  let matches = mockMatches;
  if (filters?.stage) matches = matches.filter((m) => m.stage === filters.stage);
  if (filters?.groupId) matches = matches.filter((m) => m.group_id === filters.groupId);
  if (filters?.date) {
    matches = matches.filter((m) => m.match_date.startsWith(filters.date!));
  }
  return matches.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
}

export async function getMatchById(id: string): Promise<MatchWithDetails | null> {
  return mockMatches.find((m) => m.id === id) || null;
}

export async function getHotMatches(): Promise<MatchWithDetails[]> {
  return mockMatches
    .filter((m) => m.prediction && m.prediction.confidence > 70)
    .slice(0, 6);
}
```

```typescript
// src/lib/data/groups.ts
import { Group, GroupStanding } from "@/types";
import { mockGroups, mockStandings } from "./mock-data";

export async function getAllGroups(): Promise<Group[]> {
  return mockGroups;
}

export async function getGroupStandings(groupId: string): Promise<GroupStanding[]> {
  return mockStandings
    .filter((s) => s.group_id === groupId)
    .sort((a, b) => a.position - b.position);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/
git commit -m "feat: add data access layer with mock data"
```

---

## Task 6: Root Layout & Global Styles

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css with dark theme variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 6%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 98%;
    --primary: 43 74% 49%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 43 74% 49%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-yellow-400;
  }
  .glass-card {
    @apply bg-card/80 backdrop-blur-md border border-border/50 rounded-xl;
  }
}
```

- [ ] **Step 2: Update root layout with fonts and dark mode**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "WorldCup AI Predictor | AI-Powered Match Predictions",
  description: "AI-powered World Cup 2026 match predictions, live scores, team analysis, and user predictions with leaderboards.",
  keywords: ["World Cup 2026", "AI predictions", "football", "soccer", "match predictions"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add dark theme layout with custom fonts"
```

---

## Task 7: Header & Navigation Components

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/mobile-nav.tsx`

- [ ] **Step 1: Create Header component**

Modern sticky header with logo, navigation links (Matches, Teams, Groups, Predictions, Leaderboard), and mobile hamburger menu. Uses Framer Motion for animations. Glass-morphism style background.

- [ ] **Step 2: Create Footer component**

Minimal footer with links, copyright, and social icons.

- [ ] **Step 3: Create Mobile Navigation**

Sheet-based mobile nav drawer using shadcn/ui Sheet component.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add header, footer, and mobile navigation"
```

---

## Task 8: Homepage

**Files:**
- Create: `src/components/home/hero-section.tsx`
- Create: `src/components/home/hot-matches.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Hero Section**

Full-width hero with:
- Animated heading "AI Predicts World Cup 2026"
- Stats cards (48 Teams, 104 Matches, 12 Groups)
- Gradient background with subtle football pattern
- CTA button to /predictions

- [ ] **Step 2: Create Hot Matches component**

Grid of match cards showing:
- Team flags and names
- AI predicted score
- Win probability bars
- Match time
- Confidence badge

- [ ] **Step 3: Wire up Homepage**

```typescript
// src/app/page.tsx
import { HeroSection } from "@/components/home/hero-section";
import { HotMatches } from "@/components/home/hot-matches";
import { getHotMatches } from "@/lib/data/matches";

export default async function HomePage() {
  const hotMatches = await getHotMatches();

  return (
    <div className="space-y-16 pb-16">
      <HeroSection />
      <section className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold mb-8">
          🔥 Hot Matches
        </h2>
        <HotMatches matches={hotMatches} />
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/home/
git commit -m "feat: add homepage with hero and hot matches"
```

---

## Task 9: Matches Page

**Files:**
- Create: `src/components/matches/match-card.tsx`
- Create: `src/components/matches/match-filters.tsx`
- Create: `src/components/matches/match-list.tsx`
- Create: `src/app/matches/page.tsx`

- [ ] **Step 1: Create MatchCard component**

Card showing two teams with flags, predicted score, time, venue, stage badge, and confidence indicator.

- [ ] **Step 2: Create MatchFilters component**

Filter bar with: date picker, stage select, group select. Client component with URL search params.

- [ ] **Step 3: Create MatchList component**

Responsive grid of MatchCards grouped by date.

- [ ] **Step 4: Create Matches page**

```typescript
// src/app/matches/page.tsx
import { getAllMatches } from "@/lib/data/matches";
import { MatchList } from "@/components/matches/match-list";
import { MatchFilters } from "@/components/matches/match-filters";

export const metadata = { title: "Matches | WorldCup AI Predictor" };

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; group?: string; date?: string }>;
}) {
  const params = await searchParams;
  const matches = await getAllMatches(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold mb-8">Match Schedule</h1>
      <MatchFilters />
      <MatchList matches={matches} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/matches/ src/components/matches/
git commit -m "feat: add matches page with filters and match cards"
```

---

## Task 10: Match Detail Page

**Files:**
- Create: `src/app/match/[id]/page.tsx`

- [ ] **Step 1: Create Match Detail page**

Shows:
- Match header (teams, flags, predicted score)
- Match info (venue, time, referee, weather)
- Team comparison stats (FIFA ranking, form, goals)
- AI prediction breakdown (probability bars)
- AI analysis text (placeholder for Phase 2)

- [ ] **Step 2: Commit**

```bash
git add src/app/match/
git commit -m "feat: add match detail page with AI prediction display"
```

---

## Task 11: Teams Page & Detail

**Files:**
- Create: `src/components/teams/team-card.tsx`
- Create: `src/components/teams/team-grid.tsx`
- Create: `src/app/teams/page.tsx`
- Create: `src/app/team/[slug]/page.tsx`

- [ ] **Step 1: Create TeamCard**

Card with flag, name, FIFA ranking, confederation badge, group letter.

- [ ] **Step 2: Create Teams page**

Grid of all 48 teams with search and confederation filter.

- [ ] **Step 3: Create Team Detail page**

Full team profile: flag, stats, group, matches, recent form.

- [ ] **Step 4: Commit**

```bash
git add src/app/teams/ src/app/team/ src/components/teams/
git commit -m "feat: add teams page and team detail page"
```

---

## Task 12: Groups Page

**Files:**
- Create: `src/components/groups/group-table.tsx`
- Create: `src/components/groups/group-grid.tsx`
- Create: `src/app/groups/page.tsx`

- [ ] **Step 1: Create GroupTable component**

Table showing: position, team (with flag), P, W, D, L, GF, GA, GD, Pts. Highlighted rows for qualified teams.

- [ ] **Step 2: Create Groups page**

```typescript
// src/app/groups/page.tsx
import { getAllGroups } from "@/lib/data/groups";
import { GroupGrid } from "@/components/groups/group-grid";

export const metadata = { title: "Groups | WorldCup AI Predictor" };

export default async function GroupsPage() {
  const groups = await getAllGroups();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold mb-8">Group Stage</h1>
      <GroupGrid groups={groups} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/groups/ src/components/groups/
git commit -m "feat: add groups page with standings tables"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run dev server and verify all pages load**

```bash
npm run dev
```

Visit: `/`, `/matches`, `/match/1`, `/teams`, `/team/brazil`, `/groups`

- [ ] **Step 2: Run build to check for TypeScript errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: Phase 1 complete - core foundation with all pages"
```
