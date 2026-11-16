import { expect, it } from "vitest";
import { Chess } from "chess.js";
import { courses } from "./curriculum";
it("ships original instruction and legal canonical exercises for every course", () => {
  expect(courses.length).toBeGreaterThanOrEqual(15);
  const ids = new Set<string>();
  for (const c of courses) {
    expect(c).toBeDefined();
    expect(c.sections.length).toBeGreaterThanOrEqual(2);
    expect(c.exercises.length).toBeGreaterThanOrEqual(2);
    for (const e of c.exercises) {
      expect(ids.has(e.id)).toBe(false);
      ids.add(e.id);
      expect(new Chess(e.fen).move(e.san, { strict: true }).san).toBe(e.san);
    }
  }
});
