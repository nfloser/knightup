import { expect, it } from "vitest";
import { sequences, sequenceGame, expectedMove } from "./sequences";
it("replays every branch legally and finishes mate drills with mate", () => {
  expect(new Set(sequences.map((s) => s.id)).size).toBe(sequences.length);
  for (const s of sequences) {
    expect(sequenceGame(s, s.moves.length - 1).turn()).toBe(s.color);
    const g = sequenceGame(s, s.moves.length);
    expect(g.history().length).toBe(s.moves.length);
    for (let i = 0; i < s.moves.length; i++)
      expect(expectedMove(s, i)).toBeTruthy();
    if (s.title.includes("mate")) expect(g.isCheckmate()).toBe(true);
  }
});
