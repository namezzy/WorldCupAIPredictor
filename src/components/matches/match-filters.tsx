"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stages = [
  { value: "group", label: "Group Stage" },
  { value: "round_of_32", label: "Round of 32" },
  { value: "round_of_16", label: "Round of 16" },
  { value: "quarter_final", label: "Quarter Final" },
  { value: "semi_final", label: "Semi Final" },
  { value: "final", label: "Final" },
];

const groups = Array.from({ length: 12 }, (_, i) => ({
  value: `group-${String.fromCharCode(65 + i).toLowerCase()}`,
  label: `Group ${String.fromCharCode(65 + i)}`,
}));

export function MatchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStage = searchParams.get("stage") || "";
  const currentGroup = searchParams.get("group") || "";

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/matches?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/matches");
  }

  const hasFilters = currentStage || currentGroup;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <Select
        value={currentStage || "all"}
        onValueChange={(value) => updateFilter("stage", value ?? "all")}
      >
        <SelectTrigger className="w-[160px] border-border bg-card">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentGroup || "all"}
        onValueChange={(value) => updateFilter("group", value ?? "all")}
      >
        <SelectTrigger className="w-[140px] border-border bg-card">
          <SelectValue placeholder="All Groups" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Groups</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.value} value={group.value}>
              {group.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
