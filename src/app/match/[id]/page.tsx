import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/data/matches";
import {
  formatDate,
  getFlagUrl,
  getStageLabel,
  getConfidenceColor,
  getConfidenceLabel,
} from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  User,
  Cloud,
  Brain,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) return { title: "Match Not Found" };
  return {
    title: `${match.home_team.name} vs ${match.away_team.name}`,
    description: `AI prediction for ${match.home_team.name} vs ${match.away_team.name} - FIFA World Cup 2026`,
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const { home_team, away_team, prediction, venue } = match;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 text-center">
        <Badge variant="secondary" className="text-sm">
          {getStageLabel(match.stage)}
          {match.group && ` • Group ${match.group.name}`}
        </Badge>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href={`/team/${home_team.slug}`} className="group flex-1 text-center">
          <div className="relative mx-auto mb-3 h-14 w-20 md:h-20 md:w-28">
            <Image
              src={getFlagUrl(home_team.code)}
              alt={home_team.name}
              fill
              className="rounded-lg object-cover shadow-md"
              unoptimized
            />
          </div>
          <h2 className="font-display text-lg font-bold transition-colors group-hover:text-brand-gold md:text-2xl">
            {home_team.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            FIFA #{home_team.fifa_ranking || "N/A"}
          </p>
        </Link>

        <div className="shrink-0 text-center">
          {prediction ? (
            <div>
              <div className="font-display text-4xl font-bold text-brand-gold md:text-5xl">
                {prediction.predicted_home_score} -{" "}
                {prediction.predicted_away_score}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">AI Prediction</p>
              <Badge
                className={`mt-1 border bg-transparent ${getConfidenceColor(prediction.confidence)}`}
              >
                {prediction.confidence}%{" "}
                {getConfidenceLabel(prediction.confidence)}
              </Badge>
            </div>
          ) : (
            <div className="font-display text-3xl text-muted-foreground">vs</div>
          )}
        </div>

        <Link href={`/team/${away_team.slug}`} className="group flex-1 text-center">
          <div className="relative mx-auto mb-3 h-14 w-20 md:h-20 md:w-28">
            <Image
              src={getFlagUrl(away_team.code)}
              alt={away_team.name}
              fill
              className="rounded-lg object-cover shadow-md"
              unoptimized
            />
          </div>
          <h2 className="font-display text-lg font-bold transition-colors group-hover:text-brand-gold md:text-2xl">
            {away_team.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            FIFA #{away_team.fifa_ranking || "N/A"}
          </p>
        </Link>
      </div>

      <Card className="mb-6 border-border bg-card p-4 md:p-6">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date &amp; Time</p>
              <p className="font-medium">{formatDate(match.match_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="font-medium">{venue.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Referee</p>
              <p className="font-medium">{match.referee || "TBD"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Weather</p>
              <p className="font-medium">{match.weather || "TBD"}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-brand-gold" />
            Team Comparison
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "FIFA Ranking",
                home: `#${home_team.fifa_ranking || "N/A"}`,
                away: `#${away_team.fifa_ranking || "N/A"}`,
              },
              {
                label: "Elo Rating",
                home: String(home_team.elo_rating),
                away: String(away_team.elo_rating),
              },
              {
                label: "Avg Goals",
                home: String(home_team.avg_goals_scored),
                away: String(away_team.avg_goals_scored),
              },
              {
                label: "Avg Conceded",
                home: String(home_team.avg_goals_conceded),
                away: String(away_team.avg_goals_conceded),
              },
              {
                label: "Form",
                home: home_team.recent_form || "N/A",
                away: away_team.recent_form || "N/A",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between"
              >
                <span className="w-20 text-right text-sm font-medium">
                  {stat.home}
                </span>
                <span className="flex-1 text-center text-xs text-muted-foreground">
                  {stat.label}
                </span>
                <span className="w-20 text-left text-sm font-medium">
                  {stat.away}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {prediction && (
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Brain className="h-5 w-5 text-brand-gold" />
              AI Prediction
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">{home_team.code} Win</span>
                  <span className="font-bold">{prediction.home_win_prob}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${prediction.home_win_prob}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Draw</span>
                  <span className="font-bold">{prediction.draw_prob}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all"
                    style={{ width: `${prediction.draw_prob}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">{away_team.code} Win</span>
                  <span className="font-bold">{prediction.away_win_prob}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: `${prediction.away_win_prob}%` }}
                  />
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <p className="mb-1 text-sm text-muted-foreground">
                  Model Confidence
                </p>
                <p
                  className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}
                >
                  {prediction.confidence}%
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="mt-6 border-border bg-card p-6">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <Brain className="h-5 w-5 text-brand-gold" />
          AI Match Analysis
        </h3>
        {prediction?.analysis ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {prediction.analysis}
          </p>
        ) : (
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Detailed AI analysis will be available soon.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Our AI model analyzes team form, historical data, and tactical
              matchups.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
