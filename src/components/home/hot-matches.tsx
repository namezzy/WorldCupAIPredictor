"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getConfidenceColor, getFlagUrl } from "@/lib/utils";
import { MatchWithDetails } from "@/types";

interface HotMatchesProps {
  matches: MatchWithDetails[];
}

export function HotMatches({ matches }: HotMatchesProps) {
  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No predictions available yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match, i) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Link href={`/match/${match.id}`}>
            <Card className="hover-glow cursor-pointer border-border bg-card p-5">
              {match.prediction && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {match.group ? `Group ${match.group.name}` : "Knockout"}
                  </Badge>
                  <span
                    className={`text-xs font-semibold ${getConfidenceColor(match.prediction.confidence)}`}
                  >
                    {match.prediction.confidence}% confidence
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 text-center">
                  <div className="relative mx-auto mb-2 h-12 w-12 overflow-hidden rounded-sm">
                    <Image
                      src={getFlagUrl(match.home_team.code)}
                      alt={match.home_team.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="truncate text-sm font-medium">
                    {match.home_team.name}
                  </p>
                </div>

                <div className="px-3 text-center">
                  {match.prediction ? (
                    <div className="font-display text-2xl font-bold text-brand-gold">
                      {match.prediction.predicted_home_score} -{" "}
                      {match.prediction.predicted_away_score}
                    </div>
                  ) : (
                    <div className="font-display text-lg text-muted-foreground">
                      vs
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    AI Prediction
                  </p>
                </div>

                <div className="flex-1 text-center">
                  <div className="relative mx-auto mb-2 h-12 w-12 overflow-hidden rounded-sm">
                    <Image
                      src={getFlagUrl(match.away_team.code)}
                      alt={match.away_team.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="truncate text-sm font-medium">
                    {match.away_team.name}
                  </p>
                </div>
              </div>

              {match.prediction && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{match.prediction.home_win_prob}%</span>
                    <span>{match.prediction.draw_prob}%</span>
                    <span>{match.prediction.away_win_prob}%</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${match.prediction.home_win_prob}%` }}
                    />
                    <div
                      className="bg-yellow-500 transition-all"
                      style={{ width: `${match.prediction.draw_prob}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${match.prediction.away_win_prob}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Home</span>
                    <span>Draw</span>
                    <span>Away</span>
                  </div>
                </div>
              )}
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
