export interface BracketMatch {
  id: number;
  date: string;
  time: string;
  homeLabel: { en: string; zh: string };
  awayLabel: { en: string; zh: string };
  round: "R32" | "R16" | "QF" | "SF" | "3rd" | "F";
}

// Left side of bracket: matches flow from R32 → R16 → QF → SF → Final
export const leftR32: BracketMatch[] = [
  { id: 73, date: "06/28", time: "19:00", round: "R32", homeLabel: { en: "2A", zh: "A组第2" }, awayLabel: { en: "2B", zh: "B组第2" } },
  { id: 74, date: "06/29", time: "20:30", round: "R32", homeLabel: { en: "1E", zh: "E组第1" }, awayLabel: { en: "3ABCDF", zh: "ABCDF组第3" } },
  { id: 75, date: "06/30", time: "01:00", round: "R32", homeLabel: { en: "1F", zh: "F组第1" }, awayLabel: { en: "2C", zh: "C组第2" } },
  { id: 77, date: "06/30", time: "21:00", round: "R32", homeLabel: { en: "1I", zh: "I组第1" }, awayLabel: { en: "3CDFGH", zh: "CDFGH组第3" } },
  { id: 81, date: "07/02", time: "00:00", round: "R32", homeLabel: { en: "1D", zh: "D组第1" }, awayLabel: { en: "3BEFIJ", zh: "BEFIJ组第3" } },
  { id: 82, date: "07/01", time: "20:00", round: "R32", homeLabel: { en: "1G", zh: "G组第1" }, awayLabel: { en: "3AEHIJ", zh: "AEHIJ组第3" } },
  { id: 83, date: "07/02", time: "23:00", round: "R32", homeLabel: { en: "2K", zh: "K组第2" }, awayLabel: { en: "2L", zh: "L组第2" } },
  { id: 84, date: "07/02", time: "19:00", round: "R32", homeLabel: { en: "1H", zh: "H组第1" }, awayLabel: { en: "2J", zh: "J组第2" } },
];

export const leftR16: BracketMatch[] = [
  { id: 90, date: "07/04", time: "17:00", round: "R16", homeLabel: { en: "W73", zh: "胜者 73" }, awayLabel: { en: "W75", zh: "胜者 75" } },
  { id: 89, date: "07/04", time: "21:00", round: "R16", homeLabel: { en: "W74", zh: "胜者 74" }, awayLabel: { en: "W77", zh: "胜者 77" } },
  { id: 94, date: "07/07", time: "00:00", round: "R16", homeLabel: { en: "W81", zh: "胜者 81" }, awayLabel: { en: "W82", zh: "胜者 82" } },
  { id: 93, date: "07/06", time: "19:00", round: "R16", homeLabel: { en: "W83", zh: "胜者 83" }, awayLabel: { en: "W84", zh: "胜者 84" } },
];

export const leftQF: BracketMatch[] = [
  { id: 97, date: "07/09", time: "20:00", round: "QF", homeLabel: { en: "W89", zh: "胜者 89" }, awayLabel: { en: "W90", zh: "胜者 90" } },
  { id: 98, date: "07/10", time: "19:00", round: "QF", homeLabel: { en: "W93", zh: "胜者 93" }, awayLabel: { en: "W94", zh: "胜者 94" } },
];

export const leftSF: BracketMatch[] = [
  { id: 101, date: "07/14", time: "19:00", round: "SF", homeLabel: { en: "W97", zh: "胜者 97" }, awayLabel: { en: "W98", zh: "胜者 98" } },
];

// Right side of bracket
export const rightR32: BracketMatch[] = [
  { id: 76, date: "06/29", time: "17:00", round: "R32", homeLabel: { en: "1C", zh: "C组第1" }, awayLabel: { en: "2F", zh: "F组第2" } },
  { id: 78, date: "06/30", time: "17:00", round: "R32", homeLabel: { en: "2E", zh: "E组第2" }, awayLabel: { en: "2I", zh: "I组第2" } },
  { id: 79, date: "07/01", time: "01:00", round: "R32", homeLabel: { en: "1A", zh: "A组第1" }, awayLabel: { en: "3CEFHI", zh: "CEFHI组第3" } },
  { id: 80, date: "07/01", time: "16:00", round: "R32", homeLabel: { en: "1L", zh: "L组第1" }, awayLabel: { en: "3EHIJK", zh: "EHIJK组第3" } },
  { id: 85, date: "07/03", time: "03:00", round: "R32", homeLabel: { en: "1B", zh: "B组第1" }, awayLabel: { en: "3EFGIJ", zh: "EFGIJ组第3" } },
  { id: 86, date: "07/03", time: "22:00", round: "R32", homeLabel: { en: "1J", zh: "J组第1" }, awayLabel: { en: "2H", zh: "H组第2" } },
  { id: 87, date: "07/04", time: "01:30", round: "R32", homeLabel: { en: "1K", zh: "K组第1" }, awayLabel: { en: "3DEIJL", zh: "DEIJL组第3" } },
  { id: 88, date: "07/03", time: "18:00", round: "R32", homeLabel: { en: "2D", zh: "D组第2" }, awayLabel: { en: "2G", zh: "G组第2" } },
];

export const rightR16: BracketMatch[] = [
  { id: 91, date: "07/05", time: "20:00", round: "R16", homeLabel: { en: "W76", zh: "胜者 76" }, awayLabel: { en: "W78", zh: "胜者 78" } },
  { id: 92, date: "07/06", time: "00:00", round: "R16", homeLabel: { en: "W79", zh: "胜者 79" }, awayLabel: { en: "W80", zh: "胜者 80" } },
  { id: 95, date: "07/07", time: "16:00", round: "R16", homeLabel: { en: "W86", zh: "胜者 86" }, awayLabel: { en: "W88", zh: "胜者 88" } },
  { id: 96, date: "07/07", time: "20:00", round: "R16", homeLabel: { en: "W85", zh: "胜者 85" }, awayLabel: { en: "W87", zh: "胜者 87" } },
];

export const rightQF: BracketMatch[] = [
  { id: 99, date: "07/11", time: "21:00", round: "QF", homeLabel: { en: "W91", zh: "胜者 91" }, awayLabel: { en: "W92", zh: "胜者 92" } },
  { id: 100, date: "07/12", time: "01:00", round: "QF", homeLabel: { en: "W95", zh: "胜者 95" }, awayLabel: { en: "W96", zh: "胜者 96" } },
];

export const rightSF: BracketMatch[] = [
  { id: 102, date: "07/15", time: "19:00", round: "SF", homeLabel: { en: "W99", zh: "胜者 99" }, awayLabel: { en: "W100", zh: "胜者 100" } },
];

export const finalMatch: BracketMatch = {
  id: 104, date: "07/19", time: "19:00", round: "F",
  homeLabel: { en: "W101", zh: "胜者 101" },
  awayLabel: { en: "W102", zh: "胜者 102" },
};

export const thirdPlace: BracketMatch = {
  id: 103, date: "07/18", time: "21:00", round: "3rd",
  homeLabel: { en: "L101", zh: "负者 101" },
  awayLabel: { en: "L102", zh: "负者 102" },
};

export const roundLabels = {
  R32: { en: "Round of 32", zh: "1/16决赛" },
  R16: { en: "Round of 16", zh: "1/8决赛" },
  QF: { en: "Quarter Finals", zh: "1/4决赛" },
  SF: { en: "Semi Finals", zh: "半决赛" },
  F: { en: "Final", zh: "决赛" },
  "3rd": { en: "3rd Place", zh: "三四名决赛" },
};
