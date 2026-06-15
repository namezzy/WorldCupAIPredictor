import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTsModule(relativePath) {
  const filePath = path.join(__dirname, relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  });

  const loadedModule = { exports: {} };
  const requireFromFile = createRequire(filePath);
  const evaluate = new Function(
    "require",
    "module",
    "exports",
    "__filename",
    "__dirname",
    outputText
  );

  evaluate(
    requireFromFile,
    loadedModule,
    loadedModule.exports,
    filePath,
    path.dirname(filePath)
  );

  return loadedModule.exports;
}

function createMatch(id, matchDate) {
  return {
    id,
    match_number: 1,
    home_team_id: "home",
    away_team_id: "away",
    home_team: { id: "home", name: "Home", slug: "home", code: "USA" },
    away_team: { id: "away", name: "Away", slug: "away", code: "MEX" },
    group_id: "group-a",
    group: { id: "group-a", name: "A" },
    venue_id: "venue-1",
    venue: { id: "venue-1", name: "Stadium", city: "City", country: "USA" },
    match_date: matchDate,
    stage: "group",
    status: "scheduled",
    home_score: null,
    away_score: null,
    referee: null,
    weather: null,
    prediction: null,
  };
}

test("buildScheduleDates groups matches by UTC date with counts", () => {
  const {
    buildScheduleDates,
    getScheduleDateHeading,
  } = loadTsModule("./schedule-utils.ts");

  const dates = buildScheduleDates(
    [
      createMatch("1", "2026-06-12T18:00:00Z"),
      createMatch("2", "2026-06-11T21:00:00Z"),
      createMatch("3", "2026-06-12T22:00:00Z"),
    ],
    "2026-06-12"
  );

  assert.deepEqual(
    dates.map(({ key, matchCount, isToday }) => ({ key, matchCount, isToday })),
    [
      { key: "2026-06-11", matchCount: 1, isToday: false },
      { key: "2026-06-12", matchCount: 2, isToday: true },
    ]
  );
  assert.equal(getScheduleDateHeading("2026-06-12"), "June 12");
});

test("getDefaultScheduleDate prefers today then nearest future date", () => {
  const { getDefaultScheduleDate } = loadTsModule("./schedule-utils.ts");

  assert.equal(
    getDefaultScheduleDate(
      ["2026-06-11", "2026-06-12", "2026-06-14"],
      "2026-06-12"
    ),
    "2026-06-12"
  );

  assert.equal(
    getDefaultScheduleDate(
      ["2026-06-11", "2026-06-14", "2026-06-18"],
      "2026-06-12"
    ),
    "2026-06-14"
  );

  assert.equal(
    getDefaultScheduleDate(["2026-06-11", "2026-06-12"], "2026-06-20"),
    "2026-06-12"
  );
});

test("groupMatchesByTime sorts matches into UTC time slots", () => {
  const { groupMatchesByTime } = loadTsModule("./schedule-utils.ts");

  const slots = groupMatchesByTime([
    createMatch("1", "2026-06-15T21:00:00Z"),
    createMatch("2", "2026-06-15T18:00:00Z"),
    createMatch("3", "2026-06-15T21:00:00Z"),
  ]);

  assert.deepEqual(
    slots.map((slot) => ({
      key: slot.key,
      label: slot.label,
      matchIds: slot.matches.map((match) => match.id),
    })),
    [
      { key: "18:00", label: "18:00 UTC", matchIds: ["2"] },
      { key: "21:00", label: "21:00 UTC", matchIds: ["1", "3"] },
    ]
  );
});
