import { expect, it } from "vitest";
import { emptyProgress, lessons, parseProgress } from "./learning";
import { recordAttempt, recommend, mergeProgress, DAY } from "./adaptive";
const now = Date.UTC(2026, 10, 16);
const id = lessons[0].id;
it("migrates v1 completions without inventing mastery", () => {
  const p = parseProgress({ version: 1, completed: [id] });
  expect(p.version).toBe(2);
  expect(p.completed).toEqual([id]);
  expect(p.reviews).toEqual({});
});
it("prioritizes due failed skills and explains why", () => {
  const p = recordAttempt(emptyProgress, id, false, false, now, "a");
  expect(recommend(p, now + 10 * 60_000).index).toBe(0);
  expect(recommend(p, now + 10 * 60_000).reason).toContain("needed help");
});
it("extends clean due reviews, never immediate grinding", () => {
  let p = recordAttempt(emptyProgress, id, true, false, now, "a");
  expect(p.reviews[id].box).toBe(1);
  p = recordAttempt(p, id, true, false, now + 100, "b");
  expect(p.reviews[id].box).toBe(1);
  expect(p.reviews[id].due).toBe(now + DAY);
  p = recordAttempt(p, id, true, false, now + DAY, "c");
  expect(p.reviews[id].box).toBe(2);
});
it("hints or retries bring a skill back soon", () => {
  const p = recordAttempt(emptyProgress, id, true, true, now, "a");
  expect(p.reviews[id].box).toBe(0);
  expect(p.reviews[id].due).toBe(now + 600_000);
});
it("starts with foundational unseen skills when nothing is due", () =>
  expect(recommend(emptyProgress, now).index).toBe(0));
it("rejects malformed or future review records before restoring", () => {
  expect(() =>
    parseProgress({
      version: 2,
      completed: [],
      reviews: { [id]: { box: 99 } },
    }),
  ).toThrow();
});

it("ignores an older backup review while keeping its completion", () => {
  const old = recordAttempt(emptyProgress, id, true, false, now, "a");
  const recent = recordAttempt(old, id, false, false, now + 100, "b");
  expect(mergeProgress(recent, old).reviews[id]).toEqual(recent.reviews[id]);
  expect(mergeProgress(recent, old).completed).toContain(id);
});
