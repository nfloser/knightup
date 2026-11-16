import { expect, it } from "vitest";
import { emptyTraining, updateTraining } from "./training";
import { rewardsFor, unlocks } from "./rewards";
const at = new Date(2026, 10, 16, 12).getTime();
it("awards first clean solves and never immediate repeated grinding", () => {
  const one = updateTraining(
    emptyTraining,
    "puzzle:a",
    "puzzle",
    true,
    false,
    at,
  );
  const many = updateTraining(
    one,
    "puzzle:a",
    "puzzle",
    true,
    false,
    at + 1000,
  );
  expect(rewardsFor(one, at).xp).toBe(25);
  expect(rewardsFor(many, at).xp).toBe(25);
});
it("reveals and early recalls after hints earn no mastery reward", () => {
  const hint = updateTraining(
    emptyTraining,
    "puzzle:a",
    "puzzle",
    false,
    true,
    at,
  );
  expect(
    rewardsFor(
      updateTraining(hint, "puzzle:a", "puzzle", true, false, at + 1000),
      at,
    ).xp,
  ).toBe(0);
});
it("gates cosmetic unlocks by real progress", () => {
  expect(
    unlocks(rewardsFor(emptyTraining, at))
      .filter((x) => x.unlocked)
      .map((x) => x.id),
  ).toEqual(["classic"]);
});
it("counts a daily goal from distinct eligible activities", () => {
  let t = emptyTraining;
  for (let i = 0; i < 3; i++)
    t = updateTraining(t, `puzzle:${i}`, "puzzle", true, false, at);
  const r = rewardsFor(t, at);
  expect(r.today).toBe(3);
  expect(r.streak).toBe(1);
});
it("keeps bounded mastery counters valid at saturation", () => {
  const t = updateTraining(
    emptyTraining,
    "puzzle:limit",
    "puzzle",
    true,
    false,
    at,
  );
  const old = t.records["puzzle:limit"];
  old.attempts = old.solves = old.credits = 1e6;
  old.due = 0;
  const next = updateTraining(t, old.id, "puzzle", true, false, at + 86400000);
  expect(next.records[old.id].credits).toBe(1e6);
});
