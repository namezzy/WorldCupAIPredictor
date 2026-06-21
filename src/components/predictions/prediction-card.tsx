"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, MapPin, Target, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  cn,
  formatShortDate,
  getConfidenceColor,
  getConfidenceLabel,
  getFlagUrl,
  getStageLabel,
} from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { MatchWithDetails, Prediction } from "@/types";

interface PredictionCardProps {
  match: MatchWithDetails;
}

type MatchOutcome = "home" | "draw" | "away";

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

function getPredictedOutcome(prediction: Prediction): MatchOutcome {
  const highestProbability = Math.max(
    prediction.home_win_prob,
    prediction.draw_prob,
    prediction.away_win_prob
  );

  if (highestProbability === prediction.home_win_prob) {
    return "home";
  }

  if (highestProbability === prediction.away_win_prob) {
    return "away";
  }

  return "draw";
}

function getActualOutcome(match: MatchWithDetails): MatchOutcome | null {
  if (
    match.status !== "finished" ||
    match.home_score === null ||
    match.away_score === null
  ) {
    return null;
  }

  if (match.home_score > match.away_score) {
    return "home";
  }

  if (match.home_score < match.away_score) {
    return "away";
  }

  return "draw";
}

function getProbabilityLabel(outcome: MatchOutcome, match: MatchWithDetails) {
  if (!match.prediction) {
    return "0%";
  }

  if (outcome === "home") {
    return `${match.prediction.home_win_prob}% home`;
  }

  if (outcome === "away") {
    return `${match.prediction.away_win_prob}% away`;
  }

  return `${match.prediction.draw_prob}% draw`;
}

export function PredictionCard({ match }: PredictionCardProps) {
  const { locale } = useI18n();

  if (!match.prediction) {
    return null;
  }

  const predictedOutcome = getPredictedOutcome(match.prediction);
  const actualOutcome = getActualOutcome(match);
  const outcomeCorrect = actualOutcome ? predictedOutcome === actualOutcome : false;
  const exactScoreCorrect =
    actualOutcome !== null &&
    match.home_score === match.prediction.predicted_home_score &&
    match.away_score === match.prediction.predicted_away_score;
  const mostLikelyLabel =
    predictedOutcome === "home"
      ? getTeamName(match.home_team.name, locale)
      : predictedOutcome === "away"
        ? getTeamName(match.away_team.name, locale)
        : "Draw";

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/match/${match.id}`}>
        <Card className="hover-glow h-full border-border bg-card/90 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getStageLabel(match.stage)}
              </Badge>
              {match.group && (
                <Badge variant="outline" className="text-xs">
                  Group {match.group.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                Match #{match.match_number}
              </Badge>
            </div>

            <Badge
              className={cn(
                "border bg-transparent text-xs font-semibold",
                getConfidenceColor(match.prediction.confidence)
              )}
            >
              {match.prediction.confidence}% {getConfidenceLabel(match.prediction.confidence)}
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="min-w-0 text-left">
              <div className="mb-3 flex items-center gap-3">
                <Image
                  src={getFlagUrl(match.home_team.code)}
                  alt={getTeamName(match.home_team.name, locale)}
                  width={40}
                  height={28}
                  className="rounded-sm object-cover"
                  unoptimized
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{getTeamName(match.home_team.name, locale)}</p>
                  <p className="text-xs text-muted-foreground">
                    FIFA #{match.home_team.fifa_ranking ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                AI call
              </p>
              <p className="font-display text-4xl font-bold text-brand-gold">
                {match.prediction.predicted_home_score}-{match.prediction.predicted_away_score}
              </p>
              <p className="text-xs text-muted-foreground">
                {mostLikelyLabel} • {getProbabilityLabel(predictedOutcome, match)}
              </p>
            </div>

            <div className="min-w-0 text-right">
              <div className="mb-3 flex items-center justify-end gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{getTeamName(match.away_team.name, locale)}</p>
                  <p className="text-xs text-muted-foreground">
                    FIFA #{match.away_team.fifa_ranking ?? "N/A"}
                  </p>
                </div>
                <Image
                  src={getFlagUrl(match.away_team.code)}
                  alt={getTeamName(match.away_team.name, locale)}
                  width={40}
                  height={28}
                  className="rounded-sm object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatShortDate(match.match_date)}</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{match.venue.name}</span>
            </div>
          </div>

          {match.status === "finished" && actualOutcome !== null && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 p-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Final score
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {match.home_score}-{match.away_score}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      "border text-xs",
                      outcomeCorrect
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : "border-red-500/30 bg-red-500/10 text-red-400"
                    )}
                  >
                    {outcomeCorrect ? (
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                    )}
                    {outcomeCorrect ? "✓ Correct" : "✗ Wrong"}
                  </Badge>
                  <Badge
                    className={cn(
                      "border text-xs",
                      exactScoreCorrect
                        ? "border-brand-gold/30 bg-brand-gold/10 text-brand-gold"
                        : "border-border bg-transparent text-muted-foreground"
                    )}
                  >
                    <Target className="mr-1 h-3.5 w-3.5" />
                    {exactScoreCorrect ? "Exact score hit" : "Exact score miss"}
                  </Badge>
                </div>
              </div>
            </>
          )}

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Win probability bars</span>
              <span>{match.status === "finished" ? "Result locked" : "Pre-match model"}</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="bg-green-500"
                style={{ width: `${match.prediction.home_win_prob}%` }}
              />
              <div
                className="bg-yellow-500"
                style={{ width: `${match.prediction.draw_prob}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${match.prediction.away_win_prob}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-left">
                <p className="text-muted-foreground">Home</p>
                <p className="font-semibold text-green-400">
                  {match.prediction.home_win_prob}%
                </p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2 text-center">
                <p className="text-muted-foreground">Draw</p>
                <p className="font-semibold text-yellow-400">
                  {match.prediction.draw_prob}%
                </p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-right">
                <p className="text-muted-foreground">Away</p>
                <p className="font-semibold text-red-400">
                  {match.prediction.away_win_prob}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
