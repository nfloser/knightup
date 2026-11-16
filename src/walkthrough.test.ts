import { expect, it } from "vitest";
import { hintForMove, walkthroughFrame } from "./walkthrough";
import { sequences, type Sequence } from "./sequences";

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

function illustration(fen: string, san: string): Sequence {
  return {
    id: "qa-consequence-" + san,
    title: "Tactical board feedback",
    category: "Foundations",
    color: "w",
    fen, moves: [san],
    idea: "Read the position first.",
    plan: "Review the concrete tactical consequence before memorising the move.",
  };
}

it("explains the difference between checkmate, check and quiet moves from legal positions", () => {
  const mate = illustration("7k/8/5KQ1/8/8/8/8/8 w - - 0 1", "Qg7#");
  expect(walkthroughFrame(mate, 1).text).toMatch(/checkmate/i);
  expect(walkthroughFrame(mate, 1).text).toMatch(/no legal reply/i);
  const check = illustration("7k/8/8/8/8/8/8/4R1K1 w - - 0 1", "Re8+");
  expect(walkthroughFrame(check, 1).text).toMatch(/check/i);
  expect(walkthroughFrame(check, 1).text).not.toMatch(/checkmate/i);
  const quiet = illustration("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1", "e4");
  expect(walkthroughFrame(quiet, 1).text).not.toMatch(/checkmate|delivers check/i);
});

it("describes verified captures, promotion and castling without invented evaluations", () => {
  const capture = illustration("4k3/8/8/8/8/8/4q3/4R1K1 w - - 0 1", "Rxe2");
  expect(walkthroughFrame(capture, 1).text).toMatch(/captures.*queen/i);
  const promote = illustration("7k/4P3/8/8/8/8/8/K7 w - - 0 1", "e8=Q+");
  expect(walkthroughFrame(promote, 1).text).toMatch(/promot.*queen/i);
  const castle = illustration("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", "O-O");
  expect(walkthroughFrame(castle, 1).text).toMatch(/castles.*kingside/i);
});

it("retains authored explanations before generated tactical fallback", () => {
  const s = sequences.find((item) => item.id === "caro-advance")!;
  expect(walkthroughFrame(s, 2).text).toBe("Black prepares ...d5 to challenge White's center.");
});
