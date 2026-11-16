import { describe, expect, it } from "vitest";
import {
  lessons,
  assess,
  complete,
  parseProgress,
  emptyProgress,
} from "./learning";
describe("notation lesson", () => {
  it("contains legal, canonical solutions", () => {
    for (const lesson of lessons)
      expect(assess(lesson, lesson.san).correct).toBe(true);
  });
  it("rejects coordinate notation and wrong legal moves", () => {
    expect(assess(lessons[0], "e2e4").correct).toBe(false);
    expect(assess(lessons[0], "d4").correct).toBe(false);
  });
  it("requires check, mate and disambiguation suffixes", () => {
    for (const san of ["Re1+", "Qg7#", "Nbd2"]) {
      const lesson = lessons.find((l) => l.san === san)!;
      expect(
        assess(lesson, san.replace(/[+#]/g, "").replace("Nbd", "Nd")).correct,
      ).toBe(false);
    }
  });
  it("awards completion only once", () => {
    const one = complete(emptyProgress, lessons[0].id);
    expect(complete(one, lessons[0].id)).toEqual(one);
  });
  it("rejects unsupported or malformed backups", () => {
    for (const value of [
      { version: 2 },
      { version: 1, completed: ["bogus"] },
      { version: 1, completed: [3] },
      null,
    ])
      expect(() => parseProgress(value)).toThrow();
  });
  it("round trips validated progress without extra properties", () => {
    const p = complete(emptyProgress, lessons[0].id);
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
});
