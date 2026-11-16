import { expect, it } from "vitest";
import { describePoint, scoreValue } from "./coaching";
const score = { cp: 150, mate: null, depth: 10, nodes: 40000, pv: ["g6g7"] };
it("compares the post-move evaluation from the opponent perspective", () => {
  const p = describePoint(
    "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
    "Qg5",
    score,
    { ...score, cp: 100, pv: [] },
    0,
  );
  expect(p.loss).toBe(250);
  expect(p.best).toBe("Qg7#");
  expect(p.line[0].san).toBe("Qg7#");
});
it("treats mate zero as checkmate against the side to move", () =>
  expect(scoreValue({ ...score, cp: null, mate: 0 })).toBeLessThan(0));

import { mergeReports, reportFor, type CoachingReport } from "./coaching";
import { ENGINE_PROFILE } from "./engine";
function report(completed: number[], color: "w" | "b" = "w"): CoachingReport {
  return {
    version: 1,
    gameId: "g",
    color,
    player: "GMNille",
    profile: ENGINE_PROFILE,
    engine: "Stockfish 19",
    completed,
    points: [],
    total: 2,
    updatedAt: 20,
    complete: completed.length === 2,
    checkedAt: Object.fromEntries(completed.map((p) => [p, 20])),
  };
}
it("concurrent partial snapshots cannot replace completed report decisions", () => {
  const merged = mergeReports(report([0, 2]), {
    ...report([0]),
    updatedAt: 10,
    checkedAt: { 0: 10 },
  });
  expect(merged.completed).toEqual([0, 2]);
  expect(merged.complete).toBe(true);
});
it("same-game reports remain separate by player perspective", () => {
  const black = report([0, 2], "b");
  const white = report([0], "w");
  expect(reportFor([black, white], "g", "w")).toBe(white);
});
