import { additionalRepertoireLessons } from "./additional-repertoire-lessons";
import { extendedWalkthroughNotes } from "./extended-walkthrough-notes";
import { expect, it } from "vitest";
import { sequences, sequenceGame, expectedMove } from "./sequences";
it("replays every branch legally and finishes mate drills with mate", () => {
  expect(new Set(sequences.map((s) => s.id)).size).toBe(sequences.length);
  for (const s of sequences) {
    expect(() => sequenceGame(s, s.moves.length), `Invalid line: ${s.id}`).not.toThrow();
    expect(sequenceGame(s, s.moves.length - 1).turn(), s.id).toBe(s.color);
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

it("replays every extended opening line with legal canonical moves and expected player turns", () => {
  const newIds = [
    "caro-advance-c5", "caro-classical-nd7", "caro-two-knights-order",
    "caro-quiet-d3", "caro-c4",
    "vienna-f4-nc6", "vienna-gambit-nf3",
    "vienna-quiet-f4", "vienna-fianchetto",
    "london-nc6", "london-queenside-fianchetto",
    "london-nf6-c5", "london-mirror-bishop",
    "slav-accepted", "slav-solid",
    "slav-exchange-bf4", "slav-bf5",
  ];
  expect(new Set(newIds).size).toBe(17);
  for (const id of newIds) {
    const sequence = sequences.find((s) => s.id === id);
    expect(sequence, id).toBeDefined();
    expect(sequence!.category).toBe("Openings");
    expect(sequence!.idea.length).toBeGreaterThan(50);
    expect(sequence!.plan.length).toBeGreaterThan(45);
    expect(sequence!.moves.length).toBeGreaterThanOrEqual(8);
    const game = sequenceGame(sequence!, sequence!.moves.length);
    expect(game.history(), id).toEqual(sequence!.moves);
    expect(sequenceGame(sequence!, sequence!.moves.length - 1).turn()).toBe(sequence!.color);
  }
});

it("gives every new repertoire lesson multiple position-specific teaching steps", () => {
  expect(Object.keys(extendedWalkthroughNotes)).toHaveLength(17);
  for (const [id, notes] of Object.entries(extendedWalkthroughNotes)) {
    const sequence = sequences.find((s) => s.id === id);
    expect(sequence, id).toBeDefined();
    expect(Object.keys(notes).length, id).toBeGreaterThanOrEqual(3);
    for (const [step, explanation] of Object.entries(notes)) {
      expect(Number(step), id).toBeLessThan(sequence!.moves.length);
      expect(explanation.length, id).toBeGreaterThan(40);
    }
  }
});

it("offers exactly twenty distinct guided positions in each expanded opening course", () => {
  const initialCounts: Record<string, number> = { caro: 11, vienna: 8, london: 7, slav: 5 };
  const expectedAdditions: Record<string, number> = { caro: 9, vienna: 12, london: 13, slav: 15 };
  for (const [prefix, count] of Object.entries(expectedAdditions)) {
    const added = additionalRepertoireLessons.filter((s) => s.id.startsWith(prefix + "-"));
    const total = sequences.filter((s) => s.id.startsWith(prefix + "-"));
    expect(added, prefix).toHaveLength(count);
    expect(total, prefix).toHaveLength(20);
    expect(total.length, prefix).toBe(initialCounts[prefix] + count);
    expect(new Set(total.map((s) => s.id)).size, prefix).toBe(20);
    for (const lesson of added) {
      expect(lesson.idea.length, lesson.id).toBeGreaterThan(50);
      expect(lesson.plan.length, lesson.id).toBeGreaterThan(50);
      expect(lesson.moves.length, lesson.id).toBeGreaterThanOrEqual(7);
      expect(sequenceGame(lesson, lesson.moves.length - 1).turn(), lesson.id).toBe(lesson.color);
      expect(sequenceGame(lesson, lesson.moves.length).history(), lesson.id).toEqual(lesson.moves);
    }
  }
});
