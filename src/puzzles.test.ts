import { expect, it } from "vitest";
import {
  preparePuzzle,
  gradePuzzleMove,
  choosePuzzle,
  validatePuzzle,
} from "./puzzles";
const raw = {
  id: "sample",
  fen: "6k1/8/5KQ1/8/8/8/8/8 b - - 0 1",
  moves: ["g8h8", "g6g7"],
  rating: 600,
  themes: ["mateIn1"],
  url: "https://lichess.org/example",
};
it("applies the opponent setup move before presenting the puzzle", () => {
  const p = preparePuzzle(raw);
  expect(p.game.turn()).toBe("w");
  expect(p.ply).toBe(1);
});
it("rejects malformed and illegal variations", () => {
  expect(() => validatePuzzle({ ...raw, moves: ["h8a1"] })).toThrow();
});
it("does not accept a merely legal move as the solution", () => {
  const p = preparePuzzle(raw);
  expect(gradePuzzleMove(p.game.fen(), raw.moves[1], "Qg5").correct).toBe(
    false,
  );
});
it("solves the full supplied legal line", () => {
  const p = preparePuzzle(raw);
  expect(gradePuzzleMove(p.game.fen(), raw.moves[1], "Qg7#").correct).toBe(
    true,
  );
});
it("selects within filters and avoids repeats while possible", () => {
  const other = { ...raw, id: "second", rating: 1800 };
  expect(
    choosePuzzle(
      [raw, other],
      { theme: "mateIn1", max: 1000, min: 0 },
      [],
      () => 0.5,
    )?.id,
  ).toBe("sample");
  expect(
    choosePuzzle(
      [raw, other],
      { theme: "all", max: 2500, min: 0 },
      ["sample"],
      () => 0,
    )?.id,
  ).toBe("second");
});

import shippedPuzzles from "../public/puzzles.json";
it("replays every shipped source variation and ends on a player move", () => {
  const pool = shippedPuzzles;
  expect(pool.length).toBeGreaterThanOrEqual(1000);
  for (const raw of pool) {
    const p = validatePuzzle(raw);
    expect(p.moves.length % 2).toBe(0);
  }
});
