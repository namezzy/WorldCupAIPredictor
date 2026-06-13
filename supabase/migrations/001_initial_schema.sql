-- World Cup AI Score Predictor
-- Initial Supabase schema

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(1) NOT NULL UNIQUE CHECK (name ~ '^[A-L]$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    code CHAR(3) NOT NULL UNIQUE,
    flag_url TEXT,
    confederation VARCHAR(50) NOT NULL,
    fifa_ranking INTEGER,
    world_cup_appearances INTEGER NOT NULL DEFAULT 0,
    best_result VARCHAR(50),
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    elo_rating NUMERIC(7,2) NOT NULL DEFAULT 1500.00,
    avg_goals_scored NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    avg_goals_conceded NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    recent_form VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT teams_fifa_ranking_check CHECK (fifa_ranking IS NULL OR fifa_ranking > 0),
    CONSTRAINT teams_world_cup_appearances_check CHECK (world_cup_appearances >= 0)
);

CREATE TABLE public.group_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    played INTEGER NOT NULL DEFAULT 0,
    won INTEGER NOT NULL DEFAULT 0,
    drawn INTEGER NOT NULL DEFAULT 0,
    lost INTEGER NOT NULL DEFAULT 0,
    goals_for INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    goal_difference INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT group_standings_group_team_unique UNIQUE (group_id, team_id),
    CONSTRAINT group_standings_position_check CHECK (position >= 0)
);

CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    capacity INTEGER,
    image_url TEXT,
    CONSTRAINT venues_capacity_check CHECK (capacity IS NULL OR capacity >= 0)
);

CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_number INTEGER NOT NULL UNIQUE,
    home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    match_date TIMESTAMPTZ NOT NULL,
    stage VARCHAR(20) NOT NULL DEFAULT 'group',
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    home_score INTEGER,
    away_score INTEGER,
    referee VARCHAR(100),
    weather VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT matches_stage_check CHECK (
        stage IN ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final')
    ),
    CONSTRAINT matches_status_check CHECK (
        status IN ('scheduled', 'live', 'finished', 'postponed')
    ),
    CONSTRAINT matches_score_check CHECK (
        (home_score IS NULL AND away_score IS NULL)
        OR (home_score IS NOT NULL AND away_score IS NOT NULL AND home_score >= 0 AND away_score >= 0)
    ),
    CONSTRAINT matches_distinct_teams_check CHECK (home_team_id <> away_team_id)
);

CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
    home_win_prob NUMERIC(5,2) NOT NULL,
    draw_prob NUMERIC(5,2) NOT NULL,
    away_win_prob NUMERIC(5,2) NOT NULL,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    confidence NUMERIC(5,2) NOT NULL,
    analysis TEXT,
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT predictions_home_win_prob_check CHECK (home_win_prob BETWEEN 0 AND 100),
    CONSTRAINT predictions_draw_prob_check CHECK (draw_prob BETWEEN 0 AND 100),
    CONSTRAINT predictions_away_win_prob_check CHECK (away_win_prob BETWEEN 0 AND 100),
    CONSTRAINT predictions_confidence_check CHECK (confidence BETWEEN 0 AND 100),
    CONSTRAINT predictions_score_check CHECK (predicted_home_score >= 0 AND predicted_away_score >= 0)
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    total_points INTEGER NOT NULL DEFAULT 0,
    total_predictions INTEGER NOT NULL DEFAULT 0,
    exact_scores INTEGER NOT NULL DEFAULT 0,
    correct_outcomes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_total_points_check CHECK (total_points >= 0),
    CONSTRAINT users_total_predictions_check CHECK (total_predictions >= 0),
    CONSTRAINT users_exact_scores_check CHECK (exact_scores >= 0),
    CONSTRAINT users_correct_outcomes_check CHECK (correct_outcomes >= 0)
);

CREATE TABLE public.user_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    is_exact BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct_outcome BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_predictions_user_match_unique UNIQUE (user_id, match_id),
    CONSTRAINT user_predictions_score_check CHECK (predicted_home_score >= 0 AND predicted_away_score >= 0),
    CONSTRAINT user_predictions_points_check CHECK (points_earned >= 0)
);

CREATE TABLE public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    rank INTEGER,
    total_points INTEGER NOT NULL DEFAULT 0,
    total_predictions INTEGER NOT NULL DEFAULT 0,
    exact_scores INTEGER NOT NULL DEFAULT 0,
    correct_outcomes INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT leaderboard_rank_check CHECK (rank IS NULL OR rank > 0),
    CONSTRAINT leaderboard_accuracy_check CHECK (accuracy BETWEEN 0 AND 100)
);

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT posts_likes_count_check CHECK (likes_count >= 0),
    CONSTRAINT posts_comments_count_check CHECK (comments_count >= 0)
);

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT likes_user_post_unique UNIQUE (user_id, post_id)
);

CREATE INDEX idx_matches_date_stage_group_status
    ON public.matches (match_date, stage, group_id, status);
CREATE INDEX idx_predictions_match_id
    ON public.predictions (match_id);
CREATE INDEX idx_user_predictions_user_match
    ON public.user_predictions (user_id, match_id);
CREATE INDEX idx_posts_user_match
    ON public.posts (user_id, match_id);
CREATE INDEX idx_comments_post_id
    ON public.comments (post_id);
CREATE INDEX idx_leaderboard_rank
    ON public.leaderboard (rank);
CREATE INDEX idx_group_standings_group_id
    ON public.group_standings (group_id);
CREATE INDEX idx_teams_group_slug
    ON public.teams (group_id, slug);

CREATE TRIGGER set_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_predictions_updated_at
    BEFORE UPDATE ON public.predictions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read teams"
    ON public.teams FOR SELECT
    USING (true);

CREATE POLICY "Public read groups"
    ON public.groups FOR SELECT
    USING (true);

CREATE POLICY "Public read group standings"
    ON public.group_standings FOR SELECT
    USING (true);

CREATE POLICY "Public read venues"
    ON public.venues FOR SELECT
    USING (true);

CREATE POLICY "Public read matches"
    ON public.matches FOR SELECT
    USING (true);

CREATE POLICY "Public read predictions"
    ON public.predictions FOR SELECT
    USING (true);

CREATE POLICY "Public read leaderboard"
    ON public.leaderboard FOR SELECT
    USING (true);

CREATE POLICY "Public read posts"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Public read comments"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own predictions"
    ON public.user_predictions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
    ON public.user_predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
    ON public.user_predictions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions"
    ON public.user_predictions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can read own likes"
    ON public.likes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create likes"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

COMMIT;
