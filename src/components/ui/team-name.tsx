"use client";

import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";

interface TeamNameProps {
  name: string;
}

export function TeamName({ name }: TeamNameProps) {
  const { locale } = useI18n();
  return <>{getTeamName(name, locale)}</>;
}
