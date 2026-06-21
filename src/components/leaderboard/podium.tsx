"use client";

import { Crown, Medal, Star, Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, getConfidenceColor } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface PodiumProps {
  entries: LeaderboardEntry[];
  locale?: string;
}

const podiumStyles = {
  1: {
    container: "order-1 md:order-2 md:-translate-y-4 border-brand-gold/60 bg-brand-gold/10 shadow-[0_0_40px_rgba(212,175,55,0.18)]",
    badge: "bg-brand-gold text-background",
    icon: <Crown className="h-5 w-5 text-brand-gold" />,
    medal: "🥇",
  },
  2: {
    container: "order-2 md:order-1 border-slate-300/35 bg-slate-300/5",
    badge: "bg-slate-200 text-slate-950",
    icon: <Medal className="h-5 w-5 text-slate-200" />,
    medal: "🥈",
  },
  3: {
    container: "order-3 md:order-3 border-amber-700/55 bg-amber-700/10",
    badge: "bg-amber-700 text-white",
    icon: <Star className="h-5 w-5 text-amber-500" />,
    medal: "🥉",
  },
} as const;

function getInitials(entry: LeaderboardEntry) {
  const label = entry.user?.display_name || entry.user?.username || "Fan";

  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();
}

export function Podium({ entries, locale = "en" }: PodiumProps) {
  const isZh = locale === "zh";
  const [first, second, third] = entries;
  const orderedEntries = [second, first, third].filter(Boolean) as LeaderboardEntry[];

  return (
    <div className="grid gap-4 md:grid-cols-3 md:items-end">
      {orderedEntries.map((entry) => {
        const style = podiumStyles[entry.rank as 1 | 2 | 3];

        return (
          <Card
            key={entry.id}
            className={cn(
              "glass-card hover-glow gap-0 border p-6 text-center transition-transform duration-300",
              style.container
            )}
          >
            <div className="mb-5 flex items-center justify-between">
              <Badge className={style.badge}>{isZh ? `第 ${entry.rank} 名` : `Rank #${entry.rank}`}</Badge>
              {style.icon}
            </div>

            <div className="mb-4 flex justify-center">
              <Avatar size={entry.rank === 1 ? "lg" : "default"}>
                <AvatarImage src={entry.user?.avatar_url ?? undefined} alt={entry.user?.display_name ?? entry.user?.username ?? "User avatar"} />
                <AvatarFallback className="bg-brand-navy text-brand-gold">
                  {getInitials(entry)}
                </AvatarFallback>
              </Avatar>
            </div>

            <p className="mb-1 text-3xl">{style.medal}</p>
            <h3 className="font-display text-2xl font-bold">
              {entry.user?.display_name || entry.user?.username}
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">
              @{entry.user?.username || `fan-${entry.rank}`}
            </p>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-background/50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {isZh ? "得分" : "Points"}
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-brand-gold">
                  {entry.total_points}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {isZh ? "精准" : "Exact"}
                </p>
                <p className="mt-1 text-lg font-semibold">{entry.exact_scores}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {isZh ? "准确率" : "Accuracy"}
                </p>
                <p className={cn("mt-1 text-lg font-semibold", getConfidenceColor(entry.accuracy))}>
                  {entry.accuracy}%
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-brand-gold" />
              <span>
                {isZh
                  ? `${entry.total_predictions} 次预测中命中 ${entry.correct_outcomes} 次`
                  : `${entry.correct_outcomes} correct outcomes from ${entry.total_predictions} picks`}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
