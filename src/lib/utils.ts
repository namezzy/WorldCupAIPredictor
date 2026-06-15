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
  MEX: "mx", KOR: "kr", RSA: "za", CZE: "cz",
  CAN: "ca", SUI: "ch", QAT: "qa", BIH: "ba",
  BRA: "br", MAR: "ma", SCO: "gb-sct", HAI: "ht",
  USA: "us", AUS: "au", PAR: "py", TUR: "tr",
  GER: "de", ECU: "ec", CIV: "ci", CUW: "cw",
  NED: "nl", JPN: "jp", TUN: "tn", SWE: "se",
  BEL: "be", IRN: "ir", EGY: "eg", NZL: "nz",
  ESP: "es", URU: "uy", KSA: "sa", CPV: "cv",
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
  ARG: "ar", AUT: "at", ALG: "dz", JOR: "jo",
  POR: "pt", COL: "co", UZB: "uz", COD: "cd",
  ENG: "gb-eng", CRO: "hr", PAN: "pa", GHA: "gh",
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
