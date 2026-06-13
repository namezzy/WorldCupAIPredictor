import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMatchesByTeam } from "@/lib/data/matches";
import { getTeamBySlug } from "@/lib/data/teams";
import { formatShortDate, getFlagUrl, getStageLabel } from "@/lib/utils";

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

function getGroupLabel(groupId: string | null): string {
  if (!groupId) {
    return "To be confirmed";
  }

  return `Group ${groupId.replace("group-", "").toUpperCase()}`;
}

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    return { title: "Team Not Found" };
  }

  return {
    title: team.name,
    description: `${team.name} - FIFA World Cup 2026 profile and predictions`,
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  const matches = await getMatchesByTeam(team.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative h-24 w-32">
          <Image
            src={getFlagUrl(team.code)}
            alt={team.name}
            fill
            className="rounded-lg object-cover shadow-lg"
            unoptimized
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="mb-2 font-display text-4xl font-bold">{team.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Badge>{team.code}</Badge>
            <Badge variant="secondary">{team.confederation}</Badge>
            <Badge variant="outline">{getGroupLabel(team.group_id)}</Badge>
            {team.fifa_ranking && (
              <Badge variant="outline">FIFA #{team.fifa_ranking}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Team Stats</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Elo Rating</p>
              <p className="text-xl font-bold">{team.elo_rating}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Group</p>
              <p className="text-xl font-bold">{getGroupLabel(team.group_id)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">WC Appearances</p>
              <p className="text-xl font-bold">{team.world_cup_appearances}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Result</p>
              <p className="text-xl font-bold">{team.best_result || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Goals</p>
              <p className="text-xl font-bold">
                {team.avg_goals_scored}/game
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Conceded</p>
              <p className="text-xl font-bold">
                {team.avg_goals_conceded}/game
              </p>
            </div>
            <div className="sm:col-span-3">
              <p className="text-sm text-muted-foreground">Recent Form</p>
              {team.recent_form ? (
                <div className="mt-1 flex gap-1">
                  {team.recent_form.split("").map((result, index) => (
                    <span
                      key={`${result}-${index}`}
                      className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                        result === "W"
                          ? "bg-green-500/20 text-green-400"
                          : result === "D"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  No recent results available.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Matches</h2>
          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <Link key={match.id} href={`/match/${match.id}`} className="block">
                  <div className="rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {match.home_team.code}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            vs
                          </span>
                          <span className="text-sm font-medium">
                            {match.away_team.code}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getStageLabel(match.stage)} •{" "}
                          {formatShortDate(match.match_date)}
                        </p>
                      </div>
                      {match.prediction ? (
                        <span className="text-sm font-bold text-brand-gold">
                          {match.prediction.predicted_home_score}-
                          {match.prediction.predicted_away_score}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No prediction
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No matches scheduled yet.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
