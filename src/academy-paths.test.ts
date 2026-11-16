import { describe, expect, it } from "vitest";
import { academyPathInfo, academyPaths, academySequences } from "./academy-paths";
import { sequenceGame } from "./sequences";

describe("guided academy paths", () => {
  it("contains twenty different CC0 positions per phase without repeats", () => {
    const ids = new Set<string>();
    const urls = new Set<string>();
    for (const id of ["foundations", "middlegame", "endgame"] as const) {
      const path = academyPaths[id];
      expect(path, id).toHaveLength(20);
      expect(academyPathInfo[id].description.length).toBeGreaterThan(35);
      for (const lesson of path) {
        expect(ids.has(lesson.id)).toBe(false);
        ids.add(lesson.id);
        expect(lesson.source).toMatch(/^https:\/\/lichess\.org\//);
        expect(urls.has(lesson.source!)).toBe(false);
        urls.add(lesson.source!);
        expect(lesson.idea.length).toBeGreaterThan(50);
        expect(lesson.plan.length).toBeGreaterThan(50);
        expect(lesson.moves.length).toBeGreaterThanOrEqual(2);
        expect(sequenceGame(lesson, lesson.moves.length).history(), lesson.id)
          .toEqual(lesson.moves);
        expect(sequenceGame(lesson, lesson.moves.length - 1).turn(), lesson.id)
          .toBe(lesson.color);
      }
    }
    expect(academySequences).toHaveLength(60);
  });
  it("starts with an opponent setup move before the learner responds", () => {
    for (const s of academySequences) {
      expect(sequenceGame(s, 0).turn()).not.toBe(s.color);
      expect(sequenceGame(s, 1).turn()).toBe(s.color);
    }
  });
});
