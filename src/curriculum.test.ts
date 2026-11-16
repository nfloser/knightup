import { expect, it } from "vitest";
import { Chess } from "chess.js";
import { courses } from "./curriculum";
it("ships original instruction and legal canonical exercises for every course", () => {
  expect(courses.length).toBeGreaterThanOrEqual(15);
  const ids = new Set<string>();
  for (const c of courses) {
    expect(c).toBeDefined();
    expect(c.sections.length).toBeGreaterThanOrEqual(2);
    expect(c.exercises.length).toBe(20);
    for (const e of c.exercises) {
      expect(ids.has(e.id)).toBe(false);
      ids.add(e.id);
      expect(new Chess(e.fen).move(e.san, { strict: true }).san).toBe(e.san);
    }
  }
});

it("keeps all original two exercise IDs and adds eighteen independent topical applications", () => {
  for (const c of courses) {
    expect(c.exercises[0].id).toBe(`${c.id}-v1-1`);
    expect(c.exercises[1].id).toBe(`${c.id}-v1-2`);
    const source = c.exercises.slice(2);
    expect(source).toHaveLength(18);
    expect(new Set(source.map((e) => e.fen)).size, c.id).toBe(18);
    for (const e of source) {
      expect(e.instruction.length).toBeGreaterThan(40);
      expect(e.explanation.length).toBeGreaterThan(100);
    }
  }
});
