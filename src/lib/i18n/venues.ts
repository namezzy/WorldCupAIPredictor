export const venueNameZh: Record<string, string> = {
  "Estadio Azteca": "阿兹特克球场",
  "Estadio Akron": "阿克隆体育场",
  "Estadio BBVA": "BBVA体育场",
  "BMO Field": "BMO球场",
  "BC Place": "BC体育馆",
  "MetLife Stadium": "大都会人寿体育场",
  "Gillette Stadium": "吉列体育场",
  "Lincoln Financial Field": "林肯金融球场",
  "Mercedes-Benz Stadium": "梅赛德斯-奔驰体育场",
  "Hard Rock Stadium": "硬石体育场",
  "NRG Stadium": "NRG体育场",
  "GEHA Field at Arrowhead Stadium": "箭头体育场",
  "AT&T Stadium": "AT&T体育场",
  "Lumen Field": "流明球场",
  "SoFi Stadium": "SoFi体育场",
  "Levi's Stadium": "李维斯体育场",
};

export function getVenueName(name: string, locale: string): string {
  if (locale === "zh") {
    return venueNameZh[name] || name;
  }
  return name;
}
