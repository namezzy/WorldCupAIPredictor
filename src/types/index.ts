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
  group?: Group | null;
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

export type MatchStage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export interface MatchWithDetails extends Match {
  home_team: Team;
  away_team: Team;
  venue: Venue;
  group: Group | null;
  prediction: Prediction | null;
}

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  total_predictions: number;
  exact_scores: number;
  correct_outcomes: number;
}

export interface UserPrediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
  is_exact: boolean;
  is_correct_outcome: boolean;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user?: UserProfile;
  rank: number;
  total_points: number;
  total_predictions: number;
  exact_scores: number;
  correct_outcomes: number;
  accuracy: number;
}
