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

it("explains shared opening moves in context rather than jumping to the end plan", () => {
  const caro = sequences.find((item) => item.id === "caro-exchange")!;
  expect(walkthroughFrame(caro, 2).text).toMatch(/prepares.*d5/i);
  const london = sequences.find((item) => item.id === "london-fianchetto")!;
  expect(walkthroughFrame(london, 1).text).toMatch(/central space/i);
  const vienna = sequences.find((item) => item.id === "vienna-gambit-d5")!;
  expect(walkthroughFrame(vienna, 2).text).toMatch(/center/i);
});

it("explains the sacrifice and the different Fried Liver defenses in their actual positions", () => {
  const fried = sequences.find((item) => item.id === "fried-liver")!;
  const traxler = sequences.find((item) => item.id === "two-knights-traxler")!;
  const na5 = sequences.find((item) => item.id === "two-knights-na5")!;
  expect(walkthroughFrame(fried, 11).text).toMatch(/sacrifices the knight/i);
  expect(walkthroughFrame(traxler, 9).text).toMatch(/bishop gives check/i);
  expect(walkthroughFrame(na5, 10).text).toMatch(/attacks the bishop/i);
});
