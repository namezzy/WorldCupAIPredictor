import type { LeaderboardEntry } from "@/types";

const TOTAL_PREDICTIONS = 12;
const MAX_POINTS_PER_MATCH = 3;
const MAX_TOTAL_POINTS = TOTAL_PREDICTIONS * MAX_POINTS_PER_MATCH;
const mockPoints = [
  36, 34, 33, 32, 31, 30, 29, 28, 27, 27,
  26, 25, 24, 24, 23, 22, 21, 21, 20, 20,
  19, 18, 18, 17, 17, 16, 15, 15, 14, 14,
  13, 13, 12, 12, 11, 11, 10, 10, 9, 9,
  8, 8, 7, 7, 6, 6, 5, 4, 3, 2,
] as const;

const mockUsers = [
  { id: "user-1", username: "GoalMachine99", display_name: "Goal Machine", avatar_url: null },
  { id: "user-2", username: "FutbolPredictor", display_name: "Futbol Predictor", avatar_url: null },
  { id: "user-3", username: "TacticalGenius", display_name: "Tactical Genius", avatar_url: null },
  { id: "user-4", username: "WorldCupWhiz", display_name: "World Cup Whiz", avatar_url: null },
  { id: "user-5", username: "PredictorPro", display_name: "Predictor Pro", avatar_url: null },
  { id: "user-6", username: "足球大师", display_name: "Football Master", avatar_url: null },
  { id: "user-7", username: "FutbolGuru", display_name: "Fútbol Guru", avatar_url: null },
  { id: "user-8", username: "GoldenBoot2026", display_name: "Golden Boot", avatar_url: null },
  { id: "user-9", username: "PenaltyKing", display_name: "Penalty King", avatar_url: null },
  { id: "user-10", username: "HatTrickHero", display_name: "Hat-Trick Hero", avatar_url: null },
  { id: "user-11", username: "MidfieldMaestro", display_name: "Midfield Maestro", avatar_url: null },
  { id: "user-12", username: "VARVisionary", display_name: "VAR Visionary", avatar_url: null },
  { id: "user-13", username: "SambaSeer", display_name: "Samba Seer", avatar_url: null },
  { id: "user-14", username: "TotalFootball", display_name: "Total Football", avatar_url: null },
  { id: "user-15", username: "ElPulpoAI", display_name: "El Pulpo AI", avatar_url: null },
  { id: "user-16", username: "MessiMatrix", display_name: "Messi Matrix", avatar_url: null },
  { id: "user-17", username: "CornerKickQueen", display_name: "Corner Kick Queen", avatar_url: null },
  { id: "user-18", username: "OffsideOracle", display_name: "Offside Oracle", avatar_url: null },
  { id: "user-19", username: "NetBreaker🔥", display_name: "Net Breaker", avatar_url: null },
  { id: "user-20", username: "CleanSheet🧤", display_name: "Clean Sheet", avatar_url: null },
  { id: "user-21", username: "CopaCompass", display_name: "Copa Compass", avatar_url: null },
  { id: "user-22", username: "DerbyDreamer", display_name: "Derby Dreamer", avatar_url: null },
  { id: "user-23", username: "VolleyVision", display_name: "Volley Vision", avatar_url: null },
  { id: "user-24", username: "UltrasIntel", display_name: "Ultras Intel", avatar_url: null },
  { id: "user-25", username: "PressingProphet", display_name: "Pressing Prophet", avatar_url: null },
  { id: "user-26", username: "BarcaBrains", display_name: "Barca Brains", avatar_url: null },
  { id: "user-27", username: "KeeperInstinct", display_name: "Keeper Instinct", avatar_url: null },
  { id: "user-28", username: "ExtraTimeAce", display_name: "Extra Time Ace", avatar_url: null },
  { id: "user-29", username: "CleatsAndCode", display_name: "Cleats & Code", avatar_url: null },
  { id: "user-30", username: "NutmegNinja", display_name: "Nutmeg Ninja", avatar_url: null },
  { id: "user-31", username: "ZizouZen", display_name: "Zizou Zen", avatar_url: null },
  { id: "user-32", username: "GoalRush⚽", display_name: "Goal Rush", avatar_url: null },
  { id: "user-33", username: "SetPieceSensei", display_name: "Set Piece Sensei", avatar_url: null },
  { id: "user-34", username: "BallonData", display_name: "Ballon Data", avatar_url: null },
  { id: "user-35", username: "StrikerSignal", display_name: "Striker Signal", avatar_url: null },
  { id: "user-36", username: "DribbleWizard", display_name: "Dribble Wizard", avatar_url: null },
  { id: "user-37", username: "SouthStandSage", display_name: "South Stand Sage", avatar_url: null },
  { id: "user-38", username: "FinalThirdFox", display_name: "Final Third Fox", avatar_url: null },
  { id: "user-39", username: "PitchPerfectAI", display_name: "Pitch Perfect AI", avatar_url: null },
  { id: "user-40", username: "CalcioCaptain", display_name: "Calcio Captain", avatar_url: null },
  { id: "user-41", username: "SoccerSavant", display_name: "Soccer Savant", avatar_url: null },
  { id: "user-42", username: "xGenius", display_name: "xGenius", avatar_url: null },
  { id: "user-43", username: "CampeonClicks", display_name: "Campeón Clicks", avatar_url: null },
  { id: "user-44", username: "TiempoExtra", display_name: "Tiempo Extra", avatar_url: null },
  { id: "user-45", username: "CrossbarClairvoyant", display_name: "Crossbar Clairvoyant", avatar_url: null },
  { id: "user-46", username: "ShinGuardShaman", display_name: "Shin Guard Shaman", avatar_url: null },
  { id: "user-47", username: "VivaLaPrediccion", display_name: "Viva la Predicción", avatar_url: null },
  { id: "user-48", username: "OranjeOracle", display_name: "Oranje Oracle", avatar_url: null },
  { id: "user-49", username: "LionsDenLogic", display_name: "Lions Den Logic", avatar_url: null },
  { id: "user-50", username: "AtlasOfGoals", display_name: "Atlas of Goals", avatar_url: null },
] as const;

function getScoreBreakdown(totalPoints: number) {
  let exactScores = Math.min(TOTAL_PREDICTIONS, Math.floor(totalPoints / MAX_POINTS_PER_MATCH));
  let correctOutcomes = totalPoints - exactScores * MAX_POINTS_PER_MATCH;

  while (exactScores + correctOutcomes > TOTAL_PREDICTIONS) {
    exactScores -= 1;
    correctOutcomes = totalPoints - exactScores * MAX_POINTS_PER_MATCH;
  }

  return { exactScores, correctOutcomes };
}

export const mockCurrentUserId = "user-5";

const leaderboardBase = mockUsers.map((user, index) => {
  const totalPoints = mockPoints[index] ?? 0;
  const { exactScores, correctOutcomes } = getScoreBreakdown(totalPoints);
  const accuracy = Number(
    (((exactScores * MAX_POINTS_PER_MATCH + correctOutcomes) / MAX_TOTAL_POINTS) * 100).toFixed(1)
  );

  return {
    id: `lb-${index + 1}`,
    user_id: user.id,
    user: {
      ...user,
      total_points: totalPoints,
      total_predictions: TOTAL_PREDICTIONS,
      exact_scores: exactScores,
      correct_outcomes: correctOutcomes,
    },
    rank: 0,
    total_points: totalPoints,
    total_predictions: TOTAL_PREDICTIONS,
    exact_scores: exactScores,
    correct_outcomes: correctOutcomes,
    accuracy,
  };
});

export const mockLeaderboard: LeaderboardEntry[] = leaderboardBase.map((entry, index, entries) => ({
  ...entry,
  rank:
    index > 0 && entry.total_points === entries[index - 1].total_points
      ? entries[index - 1].rank
      : index + 1,
}));
