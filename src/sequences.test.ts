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

it("teaches both the Fried Liver and Black's Na5 alternative", () => {
  for (const id of ["fried-liver", "two-knights-na5"]) {
    const line = sequences.find((s) => s.id === id);
    expect(line).toBeDefined();
    expect(line?.color).toBe("w");
    expect(line?.moves.slice(0, 6)).toEqual([
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
    ]);
    expect(sequenceGame(line!, line!.moves.length).history()).toEqual(
      line!.moves,
    );
  }
});

it("includes additional branches after the sacrifice and the Traxler counterattack", () => {
  for (const id of [
    "fried-liver-ne7",
    "fried-liver-nb4",
    "two-knights-traxler",
  ]) {
    const line = sequences.find((s) => s.id === id);
    expect(line).toBeDefined();
    expect(line?.color).toBe("w");
    expect(sequenceGame(line!, line!.moves.length).history()).toEqual(
      line!.moves,
    );
  }
});

it("covers two different alternatives to the Fried Liver sacrifice", () => {
  const na5 = sequences.find((s) => s.id === "two-knights-na5-quiet")!;
  const nd4 = sequences.find((s) => s.id === "two-knights-nd4")!;
  expect(na5.moves.slice(9, 13)).toEqual(["Na5", "d3", "h6", "Nf3"]);
  expect(nd4.moves.slice(9, 13)).toEqual(["Nd4", "c3", "b5", "Bf1"]);
  for (const line of [na5, nd4]) {
    const game = sequenceGame(line, line.moves.length);
    expect(game.history()).toHaveLength(line.moves.length);
  }
});
