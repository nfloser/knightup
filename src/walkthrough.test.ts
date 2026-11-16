import { expect, it } from "vitest";
import { hintForMove, walkthroughFrame } from "./walkthrough";
import { sequences } from "./sequences";

it("shows a legal sequence of positions with explanatory context", () => {
  const s = sequences.find((item) => item.id === "caro-advance")!;
  const start = walkthroughFrame(s, 0);
  const first = walkthroughFrame(s, 1);
  const second = walkthroughFrame(s, 2);
  expect(start.fen).toBe(s.fen);
  expect(first.lastMove?.san).toBe("e4");
  expect(second.lastMove?.san).toBe("c6");
  expect(second.text).toMatch(/d5/i);
});
it("clamps navigation to the available line", () => {
  const s = sequences[0];
  expect(walkthroughFrame(s, -1).step).toBe(0);
  expect(walkthroughFrame(s, 999).step).toBe(s.moves.length);
});

it("hints at the move's type without giving away the SAN or target", () => {
  const s = sequences.find((item) => item.id === "caro-advance")!;
  const position = walkthroughFrame(s, 1);
  expect(hintForMove(position.fen, "c6")).toMatch(/pawn/i);
  expect(hintForMove(position.fen, "c6")).not.toContain("c6");
});
