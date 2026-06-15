"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PredictionCard } from "@/components/predictions/prediction-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchWithDetails } from "@/types";

interface PredictionListProps {
  matches: MatchWithDetails[];
}

type SortOption = "confidence" | "upset" | "goals";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "confidence", label: "Highest confidence" },
  { value: "upset", label: "Highest upset probability" },
  { value: "goals", label: "Most goals predicted" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

function getUpsetProbability(match: MatchWithDetails): number {
  if (!match.prediction) {
    return 0;
  }

  const homeRanking = match.home_team.fifa_ranking;
  const awayRanking = match.away_team.fifa_ranking;

  if (homeRanking === null || awayRanking === null || homeRanking === awayRanking) {
    return 0;
  }

  const lowerRankedIsHome = homeRanking > awayRanking;
  const lowerRankedWinProbability = lowerRankedIsHome
    ? match.prediction.home_win_prob
    : match.prediction.away_win_prob;
  const favoriteWinProbability = lowerRankedIsHome
    ? match.prediction.away_win_prob
    : match.prediction.home_win_prob;

  return lowerRankedWinProbability > favoriteWinProbability
    ? lowerRankedWinProbability
    : 0;
}

export function PredictionList({ matches }: PredictionListProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("confidence");

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = matches.filter((match) => {
      if (!query) {
        return true;
      }

      return (
        match.home_team.name.toLowerCase().includes(query) ||
        match.away_team.name.toLowerCase().includes(query) ||
        match.home_team.code.toLowerCase().includes(query) ||
        match.away_team.code.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      if (!a.prediction || !b.prediction) {
        return 0;
      }

      if (sortBy === "upset") {
        const upsetDifference = getUpsetProbability(b) - getUpsetProbability(a);

        if (upsetDifference !== 0) {
          return upsetDifference;
        }
      }

      if (sortBy === "goals") {
        const goalsDifference =
          b.prediction.predicted_home_score + b.prediction.predicted_away_score -
          (a.prediction.predicted_home_score + a.prediction.predicted_away_score);

        if (goalsDifference !== 0) {
          return goalsDifference;
        }
      }

      return b.prediction.confidence - a.prediction.confidence;
    });
  }, [matches, search, sortBy]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold">All predictions</h2>
          <p className="text-sm text-muted-foreground">
            Showing {filteredMatches.length} of {matches.length} predicted matches
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative w-full md:min-w-[280px]">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by team name..."
              className="bg-background pl-9"
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy((value as SortOption) || "confidence")}
          >
            <SelectTrigger className="w-full border-border bg-background md:w-[240px]">
              <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort predictions" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredMatches.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        >
          {filteredMatches.map((match) => (
            <PredictionCard key={match.id} match={match} />
          ))}
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-lg font-medium">No predictions match that search.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another team name or clear the search to view every AI forecast.
          </p>
        </div>
      )}
    </section>
  );
}
