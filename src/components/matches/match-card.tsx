"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  formatDate,
  getConfidenceColor,
  getFlagUrl,
  getStageLabel,
} from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { MatchWithDetails } from "@/types";

interface MatchCardProps {
  match: MatchWithDetails;
  index?: number;
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const { locale } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/match/${match.id}`}>
        <Card className="hover-glow cursor-pointer border-border bg-card p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getStageLabel(match.stage)}
              </Badge>
              {match.group && (
                <Badge variant="outline" className="text-xs">
                  Group {match.group.name}
                </Badge>
              )}
            </div>
            {match.prediction && (
              <span
                className={`text-xs font-semibold ${getConfidenceColor(match.prediction.confidence)}`}
              >
                {match.prediction.confidence}%
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src={getFlagUrl(match.home_team.code)}
                  alt={getTeamName(match.home_team.name, locale)}
                  fill
                  className="rounded-sm object-cover"
                  unoptimized
                />
              </div>
              <span className="truncate text-sm font-medium">
                {getTeamName(match.home_team.name, locale)}
              </span>
            </div>

            <div className="shrink-0 px-3 text-center">
              {match.status === "finished" && match.home_score !== null ? (
                <div>
                  <span className="font-display text-xl font-bold text-foreground">
                    {match.home_score} - {match.away_score}
                  </span>
                  <p className="text-xs text-green-400">Final</p>
                </div>
              ) : match.prediction ? (
                <div>
                  <span className="font-display text-xl font-bold text-brand-gold">
                    {match.prediction.predicted_home_score} -{" "}
                    {match.prediction.predicted_away_score}
                  </span>
                  <p className="text-xs text-muted-foreground">Prediction</p>
                </div>
              ) : (
                <span className="text-muted-foreground">vs</span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <span className="truncate text-right text-sm font-medium">
                {getTeamName(match.away_team.name, locale)}
              </span>
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src={getFlagUrl(match.away_team.code)}
                  alt={getTeamName(match.away_team.name, locale)}
                  fill
                  className="rounded-sm object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(match.match_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[150px] truncate">{match.venue.name}</span>
            </div>
          </div>

          {match.prediction && (
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-secondary">
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
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
