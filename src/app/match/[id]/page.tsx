import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMatchById } from "@/lib/data/matches";
import {
  formatDate,
  getConfidenceColor,
  getFlagUrl,
  getStageLabel,
} from "@/lib/utils";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    return { title: "Match Not Found" };
  }

  return {
    title: `${match.home_team.name} vs ${match.away_team.name}`,
    description: `AI prediction and match details for ${match.home_team.name} vs ${match.away_team.name}.`,
  };
}

function TeamPanel({
  name,
  code,
  align,
}: {
  name: string;
  code: string;
  align: "left" | "right";
}) {
  return (
    <div className={`flex flex-1 flex-col gap-3 ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <div className="relative h-16 w-16 overflow-hidden rounded-md">
        <Image
          src={getFlagUrl(code)}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{code}</p>
        <h2 className="font-display text-2xl font-bold">{name}</h2>
      </div>
    </div>
  );
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{getStageLabel(match.stage)}</Badge>
        {match.group && <Badge variant="outline">Group {match.group.name}</Badge>}
        {match.prediction && (
          <Badge variant="outline" className={getConfidenceColor(match.prediction.confidence)}>
            {match.prediction.confidence}% confidence
          </Badge>
        )}
      </div>

      <Card className="border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <TeamPanel
            name={match.home_team.name}
            code={match.home_team.code}
            align="left"
          />

          <div className="shrink-0 text-center">
            {match.prediction ? (
              <>
                <p className="mb-2 text-sm text-muted-foreground">AI Prediction</p>
                <div className="font-display text-4xl font-bold text-brand-gold">
                  {match.prediction.predicted_home_score} -{" "}
                  {match.prediction.predicted_away_score}
                </div>
              </>
            ) : (
              <div className="font-display text-4xl font-bold text-muted-foreground">
                vs
              </div>
            )}
          </div>

          <TeamPanel
            name={match.away_team.name}
            code={match.away_team.code}
            align="right"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Match Time
            </div>
            <p className="text-lg font-semibold">{formatDate(match.match_date)}</p>
          </div>

          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Venue
            </div>
            <p className="text-lg font-semibold">{match.venue.name}</p>
            <p className="text-sm text-muted-foreground">
              {match.venue.city}, {match.venue.country}
            </p>
          </div>
        </div>

        {match.prediction && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>{match.home_team.code} win {match.prediction.home_win_prob}%</span>
              <span>Draw {match.prediction.draw_prob}%</span>
              <span>{match.away_team.code} win {match.prediction.away_win_prob}%</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
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
          </div>
        )}
      </Card>
    </div>
  );
}
