import type { Metadata } from "next";
import { Brain, Gauge, Sparkles, Target } from "lucide-react";

import { PredictionList } from "@/components/predictions/prediction-list";
import { Card } from "@/components/ui/card";
import { getAllMatches } from "@/lib/data/matches";

export const metadata: Metadata = {
  title: "AI Prediction Center",
  description:
    "Explore every AI-generated World Cup prediction with confidence, upset signals, and match outcomes.",
};

export default async function PredictionsPage() {
  const matches = await getAllMatches();
  const predictedMatches = matches.filter((match) => match.prediction);

  const totalPredictions = predictedMatches.length;
  const averageConfidence =
    totalPredictions > 0
      ? Math.round(
          predictedMatches.reduce(
            (sum, match) => sum + (match.prediction?.confidence ?? 0),
            0
          ) / totalPredictions
        )
      : 0;
  const highestConfidenceMatch = [...predictedMatches].sort(
    (a, b) => (b.prediction?.confidence ?? 0) - (a.prediction?.confidence ?? 0)
  )[0];

  const stats = [
    {
      label: "Total Predictions",
      value: totalPredictions.toLocaleString(),
      hint: "AI scorelines generated",
      icon: Brain,
    },
    {
      label: "Avg Confidence",
      value: `${averageConfidence}%`,
      hint: "Across all predicted matches",
      icon: Gauge,
    },
    {
      label: "Highest Confidence",
      value: highestConfidenceMatch
        ? `${highestConfidenceMatch.home_team.name} vs ${highestConfidenceMatch.away_team.name}`
        : "No predictions",
      hint: highestConfidenceMatch
        ? `${highestConfidenceMatch.prediction?.confidence ?? 0}% confidence`
        : "Waiting for data",
      icon: Sparkles,
    },
    {
      label: "Matches Predicted",
      value: `${predictedMatches.length} / ${matches.length}`,
      hint: "Prediction coverage",
      icon: Target,
    },
  ];

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="max-w-3xl space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
          Prediction Intelligence
        </span>
        <div>
          <h1 className="mb-2 font-display text-4xl font-bold">
            AI Prediction Center
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Track every AI forecast in one place, compare confidence levels,
            surface upset calls, and review how the model performed once the
            final whistle blows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border bg-card/80 p-5 backdrop-blur"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="rounded-full border border-brand-gold/20 bg-brand-gold/10 p-2 text-brand-gold">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold leading-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <PredictionList matches={predictedMatches} />
    </div>
  );
}
