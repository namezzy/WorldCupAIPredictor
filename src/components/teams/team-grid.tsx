"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { Team } from "@/types";

import { TeamCard } from "./team-card";

interface TeamGridProps {
  teams: Team[];
}

const confederations = [
  { value: "all", label: "All Confederations" },
  { value: "UEFA", label: "UEFA (Europe)" },
  { value: "CONMEBOL", label: "CONMEBOL (South America)" },
  { value: "CONCACAF", label: "CONCACAF (North America)" },
  { value: "AFC", label: "AFC (Asia)" },
  { value: "CAF", label: "CAF (Africa)" },
  { value: "OFC", label: "OFC (Oceania)" },
];

export function TeamGrid({ teams }: TeamGridProps) {
  const [search, setSearch] = useState("");
  const [confederation, setConfederation] = useState("all");
  const { locale } = useI18n();

  const filtered = useMemo(
    () =>
      teams.filter((team) => {
        const query = search.toLowerCase();
        const localizedName = getTeamName(team.name, locale);
        const matchesSearch =
          team.name.toLowerCase().includes(query) ||
          localizedName.toLowerCase().includes(query) ||
          team.code.toLowerCase().includes(query);
        const matchesConfed =
          confederation === "all" || team.confederation === confederation;

        return matchesSearch && matchesConfed;
      }),
    [confederation, locale, search, teams]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
        <Select
          value={confederation}
          onValueChange={(value) => setConfederation(value ?? "all")}
        >
          <SelectTrigger className="w-full bg-card sm:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {confederations.map((confed) => (
              <SelectItem key={confed.value} value={confed.value}>
                {confed.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {teams.length} teams
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((team, index) => (
            <TeamCard key={team.id} team={team} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No teams match your current filters.
        </div>
      )}
    </div>
  );
}
