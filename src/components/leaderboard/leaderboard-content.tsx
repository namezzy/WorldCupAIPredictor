"use client";

import { Crown, Medal, Star, Target, Trophy, Users } from "lucide-react";

import { Podium } from "@/components/leaderboard/podium";
import { RankingTable } from "@/components/leaderboard/ranking-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardContentProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardContent({ entries, currentUserId }: LeaderboardContentProps) {
  const { locale } = useI18n();
  const isZh = locale === "zh";

  const topThree = entries.slice(0, 3);
  const totalPlayers = entries.length;
  const totalPredictions = entries.reduce(
    (total, entry) => total + entry.total_predictions,
    0
  );
  const highestScore = entries[0]?.total_points ?? 0;

  const scoringRules = [
    {
      title: isZh ? "精准比分" : "Exact score match",
      points: isZh ? "+3 分" : "+3 points",
      description: isZh
        ? "完美预测最终比分，获得满分奖励。"
        : "Predict the final scoreline perfectly and bank the full reward.",
    },
    {
      title: isZh ? "正确胜负" : "Correct outcome",
      points: isZh ? "+1 分" : "+1 point",
      description: isZh
        ? "正确预测胜负或平局，即使比分不对也能得分。"
        : "Pick the right winner or draw even if the exact score is off.",
    },
    {
      title: isZh ? "预测错误" : "Wrong prediction",
      points: isZh ? "0 分" : "0 points",
      description: isZh
        ? "比分和胜负均未命中，本轮不得分。"
        : "Miss both the score and match outcome, and the round stays empty.",
    },
  ];

  const overviewStats = [
    {
      label: isZh ? "参与玩家" : "Total players",
      value: totalPlayers.toString(),
      icon: Users,
      accent: "text-brand-gold",
    },
    {
      label: isZh ? "预测总数" : "Predictions made",
      value: totalPredictions.toString(),
      icon: Target,
      accent: "text-emerald-400",
    },
    {
      label: isZh ? "最高得分" : "Highest score",
      value: `${highestScore} ${isZh ? "分" : "pts"}`,
      icon: Crown,
      accent: "text-brand-gold",
    },
  ];

  return (
    <div className="container mx-auto space-y-10 px-4 py-8">
      <section className="space-y-4">
        <Badge className="bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/15">
          <Trophy className="mr-1 h-3.5 w-3.5" />
          {isZh ? "社区排名" : "Community rankings"}
        </Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              <span className="text-gradient">
                {isZh ? "排行榜" : "Leaderboard"}
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isZh
                ? "查看谁的预测最准确，登上领奖台，追踪你的排名。"
                : "See who is reading the tournament best, celebrate the podium, and track where your mock profile stacks up before live accounts arrive."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="border-white/10 bg-background/60">
              {isZh ? "模拟赛季 · 12 场比赛" : "Mock season · 12 matches"}
            </Badge>
            <Badge variant="outline" className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
              {isZh ? "当前玩家已高亮" : "Current player highlighted"}
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="glass-card hover-glow border-border/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/60 p-3">
                <stat.icon className={`h-6 w-6 ${stat.accent}`} />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-brand-gold" />
          <h2 className="font-display text-2xl font-bold">
            {isZh ? "领奖台" : "Podium leaders"}
          </h2>
        </div>
        <Podium entries={topThree} locale={locale} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <RankingTable entries={entries} currentUserId={currentUserId} locale={locale} />

        <Card className="glass-card border-border/60 p-6 xl:sticky xl:top-24">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-brand-gold" />
            <h2 className="font-display text-2xl font-bold">
              {isZh ? "计分规则" : "Scoring rules"}
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh
              ? "排行榜中所有预测采用统一计分方式。"
              : "Every prediction is scored the same way across the leaderboard."}
          </p>
          <Separator className="my-5 bg-white/5" />
          <div className="space-y-4">
            {scoringRules.map((rule, index) => (
              <div key={rule.title}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{rule.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                  <Badge className="bg-brand-gold text-background">{rule.points}</Badge>
                </div>
                {index < scoringRules.length - 1 && (
                  <Separator className="mt-4 bg-white/5" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
