import { describe, expect, it } from "vitest";
import { moveFeedback } from "./moveFeedback";

describe("post-move coach feedback", () => {
  it("shows a legal engine continuation without declaring alternatives bad", () => {
    const text = moveFeedback("e4", [
      { san: "d4" },
      { san: "d5" },
      { san: "c4" },
    ]);
    expect(text).toContain("e4");
    expect(text).toContain("d4 d5 c4");
    expect(text).toContain("does not prove");
  });
  it("handles missing analysis without inventing a move", () => {
    expect(moveFeedback("e4", [])).toContain("unavailable");
  });
  it("recognizes the played move as the suggested choice", () => {
    expect(moveFeedback("e4", [{ san: "e4" }, { san: "e5" }])).toContain(
      "matches",
    );
  });
});

it("compares both scores from the mover's perspective", async () => {
  const { compareMoveScores } = await import("./moveFeedback");
  expect(
    compareMoveScores({ cp: 100, mate: null }, { cp: -40, mate: null }),
  ).toContain("0.6");
  expect(
    compareMoveScores({ cp: -20, mate: null }, { cp: -10, mate: null }),
  ).toContain("0.0");
});
it("avoids a pawn-loss estimate when mate scores are involved", async () => {
  const { compareMoveScores } = await import("./moveFeedback");
  expect(
    compareMoveScores({ cp: null, mate: 2 }, { cp: 40, mate: null }),
  ).toContain("mate");
});
