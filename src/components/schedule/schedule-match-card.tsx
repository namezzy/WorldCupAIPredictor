"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, getConfidenceColor, getFlagUrl, getStageLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import type { MatchWithDetails } from "@/types";

interface ScheduleMatchCardProps {
  match: MatchWithDetails;
  index?: number;
}

function getPredictionText(match: MatchWithDetails) {
  if (!match.prediction) {
    return "AI prediction unavailable";
  }

  const scoreline = `${match.prediction.predicted_home_score}-${match.prediction.predicted_away_score}`;
  const confidence = `${match.prediction.confidence}% confidence`;

  if (match.status === "finished") {
    return `AI predicted: ${scoreline} (${confidence})`;
  }

  return `AI: ${scoreline} (${confidence})`;
}

export function ScheduleMatchCard({
  match,
  index = 0,
}: ScheduleMatchCardProps) {
  const { locale } = useI18n();
  const isFinished = match.status === "finished";
  const stageLabel = match.group
    ? `Group ${match.group.name}`
    : getStageLabel(match.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link href={`/match/${match.id}`} className="block">
        <article className="glass-card hover-glow space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="border-brand-gold/20 bg-brand-gold/5">
              {stageLabel}
            </Badge>
            <div
              className={cn(
                "flex items-center gap-2 text-xs font-semibold",
                isFinished ? "text-green-400" : "text-sky-400"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isFinished ? "bg-green-400" : "bg-sky-400"
                )}
              />
              {isFinished ? "Finished" : "Scheduled"}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/60">
                <Image
                  src={getFlagUrl(match.home_team.code)}
                  alt={getTeamName(match.home_team.name, locale)}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="truncate text-sm font-semibold md:text-base">
                {getTeamName(match.home_team.name, locale)}
              </span>
            </div>

            <div className="min-w-[68px] text-center">
              {isFinished && match.home_score !== null && match.away_score !== null ? (
                <div className="font-display text-2xl font-bold text-foreground">
                  {match.home_score} - {match.away_score}
                </div>
              ) : (
                <div className="font-display text-xl font-bold text-brand-gold">
                  vs
                </div>
              )}
            </div>

            <div className="flex min-w-0 items-center justify-end gap-3">
              <span className="truncate text-right text-sm font-semibold md:text-base">
                {getTeamName(match.away_team.name, locale)}
              </span>
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/60">
                <Image
                  src={getFlagUrl(match.away_team.code)}
                  alt={getTeamName(match.away_team.name, locale)}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {match.venue.name}, {match.venue.city}
            </span>
          </div>

          <p
            className={cn(
              "text-center text-xs font-medium",
              match.prediction
                ? getConfidenceColor(match.prediction.confidence)
                : "text-muted-foreground"
            )}
          >
            {getPredictionText(match)}
          </p>
        </article>
      </Link>
    </motion.div>
  );
}
