"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { MatchWithDetails } from "@/types";

interface LiveMatchesPayload {
  matches: MatchWithDetails[];
  updatedAt: string;
}

interface UseLiveMatchesResult {
  matches: MatchWithDetails[];
  updatedAt: Date | null;
  isRefreshing: boolean;
  hasLive: boolean;
  refresh: () => void;
}

/**
 * Polls /api/live-matches and keeps the match list fresh on the client.
 * Refreshes faster while any match is live.
 */
export function useLiveMatches(
  initialMatches: MatchWithDetails[]
): UseLiveMatchesResult {
  const [matches, setMatches] = useState<MatchWithDetails[]>(initialMatches);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const hasLive = matches.some((m) => m.status === "live");

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/live-matches", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) return;
      const data = (await res.json()) as LiveMatchesPayload;
      setMatches(data.matches);
      setUpdatedAt(new Date(data.updatedAt));
    } catch {
      // Network hiccup — keep showing the last known data.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const intervalMs = hasLive ? 15_000 : 45_000;
    const id = setInterval(refresh, intervalMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [refresh, hasLive]);

  return { matches, updatedAt, isRefreshing, hasLive, refresh };
}
