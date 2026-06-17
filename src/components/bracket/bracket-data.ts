export type KoStage =
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

export interface KoMatch {
  /** Match number, e.g. 73..104 */
  id: number;
  date: string; // "MM/DD"
  time: string; // "HH:mm"
  stage: KoStage;
  /** Slot token, e.g. "W73" (winner of 73), "L101" (loser of 101) or "2A" (group A runner-up). */
  homeId: string;
  awayId: string;
}

// Flat list of every knockout match. The bracket tree is reconstructed by
// following the "W"/"L" tokens (e.g. match 101 feeds the final via "W101").
export const koMatches: KoMatch[] = [
  // Round of 32 (73-88)
  { id: 73, date: "06/28", time: "19:00", stage: "round_of_32", homeId: "2A", awayId: "2B" },
  { id: 74, date: "06/29", time: "20:30", stage: "round_of_32", homeId: "1E", awayId: "3ABCDF" },
  { id: 75, date: "06/30", time: "01:00", stage: "round_of_32", homeId: "1F", awayId: "2C" },
  { id: 76, date: "06/29", time: "17:00", stage: "round_of_32", homeId: "1C", awayId: "2F" },
  { id: 77, date: "06/30", time: "21:00", stage: "round_of_32", homeId: "1I", awayId: "3CDFGH" },
  { id: 78, date: "06/30", time: "17:00", stage: "round_of_32", homeId: "2E", awayId: "2I" },
  { id: 79, date: "07/01", time: "01:00", stage: "round_of_32", homeId: "1A", awayId: "3CEFHI" },
  { id: 80, date: "07/01", time: "16:00", stage: "round_of_32", homeId: "1L", awayId: "3EHIJK" },
  { id: 81, date: "07/02", time: "00:00", stage: "round_of_32", homeId: "1D", awayId: "3BEFIJ" },
  { id: 82, date: "07/01", time: "20:00", stage: "round_of_32", homeId: "1G", awayId: "3AEHIJ" },
  { id: 83, date: "07/02", time: "23:00", stage: "round_of_32", homeId: "2K", awayId: "2L" },
  { id: 84, date: "07/02", time: "19:00", stage: "round_of_32", homeId: "1H", awayId: "2J" },
  { id: 85, date: "07/03", time: "03:00", stage: "round_of_32", homeId: "1B", awayId: "3EFGIJ" },
  { id: 86, date: "07/03", time: "22:00", stage: "round_of_32", homeId: "1J", awayId: "2H" },
  { id: 87, date: "07/04", time: "01:30", stage: "round_of_32", homeId: "1K", awayId: "3DEIJL" },
  { id: 88, date: "07/03", time: "18:00", stage: "round_of_32", homeId: "2D", awayId: "2G" },

  // Round of 16 (89-96)
  { id: 89, date: "07/04", time: "21:00", stage: "round_of_16", homeId: "W74", awayId: "W77" },
  { id: 90, date: "07/04", time: "17:00", stage: "round_of_16", homeId: "W73", awayId: "W75" },
  { id: 91, date: "07/05", time: "20:00", stage: "round_of_16", homeId: "W76", awayId: "W78" },
  { id: 92, date: "07/06", time: "00:00", stage: "round_of_16", homeId: "W79", awayId: "W80" },
  { id: 93, date: "07/06", time: "19:00", stage: "round_of_16", homeId: "W83", awayId: "W84" },
  { id: 94, date: "07/07", time: "00:00", stage: "round_of_16", homeId: "W81", awayId: "W82" },
  { id: 95, date: "07/07", time: "16:00", stage: "round_of_16", homeId: "W86", awayId: "W88" },
  { id: 96, date: "07/07", time: "20:00", stage: "round_of_16", homeId: "W85", awayId: "W87" },

  // Quarter-finals (97-100)
  { id: 97, date: "07/09", time: "20:00", stage: "quarterfinal", homeId: "W89", awayId: "W90" },
  { id: 98, date: "07/10", time: "19:00", stage: "quarterfinal", homeId: "W93", awayId: "W94" },
  { id: 99, date: "07/11", time: "21:00", stage: "quarterfinal", homeId: "W91", awayId: "W92" },
  { id: 100, date: "07/12", time: "01:00", stage: "quarterfinal", homeId: "W95", awayId: "W96" },

  // Semi-finals (101-102)
  { id: 101, date: "07/14", time: "19:00", stage: "semifinal", homeId: "W97", awayId: "W98" },
  { id: 102, date: "07/15", time: "19:00", stage: "semifinal", homeId: "W99", awayId: "W100" },

  // Third place (103) & Final (104)
  { id: 103, date: "07/18", time: "21:00", stage: "third_place", homeId: "L101", awayId: "L102" },
  { id: 104, date: "07/19", time: "19:00", stage: "final", homeId: "W101", awayId: "W102" },
];

export const koMatchById: Map<number, KoMatch> = new Map(
  koMatches.map((m) => [m.id, m])
);

/** Roots that feed the final: left semi-final (101) and right semi-final (102). */
export const LEFT_ROOT = 101;
export const RIGHT_ROOT = 102;
export const FINAL_ID = 104;
export const THIRD_PLACE_ID = 103;

/**
 * Turn a slot token into a localized placeholder label.
 *  - "W73"      -> "胜者 73" / "Winner 73"
 *  - "L101"     -> "负者 101" / "Loser 101"
 *  - "2A"       -> "A组第2" / "2nd Group A"
 *  - "3ABCDF"   -> "ABCDF组第3" / "3rd Group ABCDF"
 */
export function slotLabel(token: string, locale: string): string {
  const isZh = locale === "zh";
  if (/^W\d+$/.test(token)) {
    const n = token.slice(1);
    return isZh ? `胜者 ${n}` : `Winner ${n}`;
  }
  if (/^L\d+$/.test(token)) {
    const n = token.slice(1);
    return isZh ? `负者 ${n}` : `Loser ${n}`;
  }
  const m = token.match(/^(\d)([A-Z]+)$/);
  if (m) {
    const pos = m[1];
    const groups = m[2];
    if (isZh) return `${groups}组第${pos}`;
    const ord = pos === "1" ? "1st" : pos === "2" ? "2nd" : "3rd";
    return `${ord} Group ${groups}`;
  }
  return token;
}

export const roundLabels = {
  round_of_32: { en: "Round of 32", zh: "1/16决赛" },
  round_of_16: { en: "Round of 16", zh: "1/8决赛" },
  quarterfinal: { en: "Quarter Finals", zh: "1/4决赛" },
  semifinal: { en: "Semi Finals", zh: "半决赛" },
  final: { en: "Final", zh: "决赛" },
  third_place: { en: "3rd Place", zh: "三四名决赛" },
} as const;
