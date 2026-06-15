import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    group: "Group Stage",
    round_of_32: "Round of 32",
    round_of_16: "Round of 16",
    quarter_final: "Quarter Final",
    semi_final: "Semi Final",
    third_place: "3rd Place",
    final: "Final",
  };

  return labels[stage] || stage;
}

const fifaToIso: Record<string, string> = {
  USA: "us", MEX: "mx", CAN: "ca", BRA: "br", ARG: "ar", URU: "uy",
  COL: "co", ECU: "ec", CHI: "cl", CRC: "cr", HON: "hn", JAM: "jm",
  PAN: "pa", SLV: "sv", FRA: "fr", GER: "de", ESP: "es", ENG: "gb-eng",
  ITA: "it", NED: "nl", POR: "pt", BEL: "be", CRO: "hr", DEN: "dk",
  SUI: "ch", AUT: "at", POL: "pl", UKR: "ua", SRB: "rs", TUR: "tr",
  JPN: "jp", KOR: "kr", AUS: "au", IRN: "ir", KSA: "sa", QAT: "qa",
  UZB: "uz", JOR: "jo", MAR: "ma", SEN: "sn", NGA: "ng", CMR: "cm",
  GHA: "gh", CIV: "ci", TUN: "tn", EGY: "eg", ALG: "dz", NZL: "nz",
};

export function getFlagUrl(code: string): string {
  const iso = fifaToIso[code.toUpperCase()] || code.toLowerCase();
  return `https://flagcdn.com/w80/${iso}.png`;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-green-400";
  if (confidence >= 60) return "text-yellow-400";
  return "text-orange-400";
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return "High";
  if (confidence >= 60) return "Medium";
  return "Low";
}
