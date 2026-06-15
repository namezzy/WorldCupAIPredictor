"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, Target, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getConfidenceColor } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface RankingTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

type TabValue = "all" | "top-10" | "around-me";

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

function getDisplayName(entry: LeaderboardEntry) {
  return entry.user?.display_name || entry.user?.username || "Anonymous Fan";
}

export function RankingTable({ entries, currentUserId }: RankingTableProps) {
  const [search, setSearch] = useState("");
  const currentUserIndex = entries.findIndex((entry) => entry.user_id === currentUserId);

  const tabbedEntries = useMemo<Record<TabValue, LeaderboardEntry[]>>(() => {
    const aroundMeStart = Math.max(0, currentUserIndex - 2);
    const aroundMeEnd = currentUserIndex >= 0 ? currentUserIndex + 3 : 5;

    return {
      all: entries,
      "top-10": entries.slice(0, 10),
      "around-me": entries.slice(aroundMeStart, aroundMeEnd),
    };
  }, [currentUserIndex, entries]);

  const filterEntries = (value: TabValue) => {
    const term = search.trim().toLowerCase();
    const scopedEntries = tabbedEntries[value];

    if (!term) {
      return scopedEntries;
    }

    return scopedEntries.filter((entry) => {
      const username = entry.user?.username?.toLowerCase() ?? "";
      const displayName = entry.user?.display_name?.toLowerCase() ?? "";

      return username.includes(term) || displayName.includes(term);
    });
  };

  const tabConfig: { value: TabValue; label: string }[] = [
    { value: "all", label: "All Players" },
    { value: "top-10", label: "Top 10" },
    { value: "around-me", label: "Around Me" },
  ];

  return (
    <Card className="glass-card border-border/60 p-0">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Full Rankings</h2>
          <p className="text-sm text-muted-foreground">
            Search simulated players, compare exact hits, and chase the top spot.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search username or display name"
            className="h-11 rounded-xl border-white/10 bg-background/70 pl-9"
          />
        </div>
      </div>

      <Separator className="bg-white/5" />

      <Tabs defaultValue="all" className="gap-4 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="h-auto flex-wrap gap-2 rounded-2xl bg-background/60 p-1">
            {tabConfig.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-2">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1 border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
              <Sparkles className="h-3 w-3" />
              Mock current user: {entries[currentUserIndex]?.user?.username ?? currentUserId}
            </Badge>
            <Badge variant="outline" className="gap-1 border-white/10 bg-background/60">
              <Target className="h-3 w-3" />
              12 predictions per player
            </Badge>
          </div>
        </div>

        {tabConfig.map((tab) => {
          const filteredEntries = filterEntries(tab.value);

          return (
            <TabsContent key={tab.value} value={tab.value}>
              <Table className="min-w-[760px]">
                <TableCaption>
                  Showing {filteredEntries.length} of {tabbedEntries[tab.value].length} players
                </TableCaption>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Exact Scores</TableHead>
                    <TableHead className="text-right">Correct Outcomes</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No players matched “{search}”.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry, index) => {
                      const isCurrentUser = entry.user_id === currentUserId;

                      return (
                        <motion.tr
                          key={`${tab.value}-${entry.id}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.03 }}
                          className={cn(
                            "border-b border-white/5 align-middle transition-colors hover:bg-white/5",
                            index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                            isCurrentUser && "bg-brand-gold/10 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]"
                          )}
                        >
                          <TableCell className="font-semibold">#{entry.rank}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={entry.user?.avatar_url ?? undefined}
                                  alt={getDisplayName(entry)}
                                />
                                <AvatarFallback className="bg-brand-navy text-brand-gold">
                                  {getInitials(entry)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-medium text-foreground">
                                    {getDisplayName(entry)}
                                  </p>
                                  {isCurrentUser && (
                                    <Badge className="bg-brand-gold text-background">You</Badge>
                                  )}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  @{entry.user?.username || `fan-${entry.rank}`}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-display text-lg font-bold text-brand-gold">
                            {entry.total_points}
                          </TableCell>
                          <TableCell className="text-right">{entry.exact_scores}</TableCell>
                          <TableCell className="text-right">{entry.correct_outcomes}</TableCell>
                          <TableCell className={cn("text-right font-semibold", getConfidenceColor(entry.accuracy))}>
                            <span className="inline-flex items-center justify-end gap-1">
                              {entry.rank <= 3 && <Trophy className="h-3.5 w-3.5 text-brand-gold" />}
                              {entry.accuracy}%
                            </span>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
