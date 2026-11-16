import { expect, it } from "vitest";
import { parseInfo, legalVariation } from "./engine";
it("parses cp and mate without confusing score perspective", () => {
  expect(
    parseInfo("info depth 12 nodes 44000 score cp -120 pv e2e4 e7e5")?.cp,
  ).toBe(-120);
  expect(parseInfo("info depth 9 score mate 2 pv g6g7")?.mate).toBe(2);
  expect(parseInfo("info depth 9 score cp 100 lowerbound pv e2e4")).toBeNull();
});
it("does not present illegal engine continuations", () => {
  const f = "7k/8/5KQ1/8/8/8/8/8 w - - 0 1";
  expect(legalVariation(f, ["g6g7", "h8a1"]).map((m) => m.san)).toEqual([
    "Qg7#",
  ]);
});
