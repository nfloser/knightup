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

it("covers common Caro–Kann alternatives from the initial position", () => {
  const expected = ["caro-panov", "caro-two-knights", "caro-fantasy"];
  for (const id of expected) {
    const line = sequences.find((s) => s.id === id);
    expect(line).toBeDefined();
    expect(line?.color).toBe("b");
    expect(line?.moves.slice(0, 2)).toEqual(["e4", "c6"]);
    expect(sequenceGame(line!, line!.moves.length).history()).toEqual(
      line!.moves,
    );
  }
});

it("provides legal London setups against common Black replies", () => {
  for (const id of ["london-classical", "london-fianchetto", "london-c5"]) {
    const line = sequences.find((s) => s.id === id);
    expect(line).toBeDefined();
    expect(line?.color).toBe("w");
    expect(line?.moves[0]).toBe("d4");
    expect(sequenceGame(line!, line!.moves.length).history()).toEqual(
      line!.moves,
    );
  }
});

it("covers both accepting and meeting the Vienna Gambit in the center", () => {
  for (const id of ["vienna-gambit-d5", "vienna-gambit-accepted"]) {
    const line = sequences.find((s) => s.id === id);
    expect(line).toBeDefined();
    expect(line?.color).toBe("w");
    expect(line?.moves.slice(0, 5)).toEqual(["e4", "e5", "Nc3", "Nf6", "f4"]);
    expect(sequenceGame(line!, line!.moves.length).history()).toEqual(
      line!.moves,
    );
  }
});
