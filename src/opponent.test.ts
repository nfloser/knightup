import { expect, it } from "vitest";
import {
  initialOpponent,
  adaptOpponent,
  parseOpponent,
  randomMoveChance,
} from "./opponent";
it("smooths outcomes and excludes assisted games", () => {
  const one = adaptOpponent(initialOpponent, 1, false);
  expect(one.level).toBe(2);
  const two = adaptOpponent(one, 1, false);
  expect(adaptOpponent(two, 1, false).level).toBe(2.5);
  expect(adaptOpponent(two, 0, true)).toEqual(two);
});
it("bounds strength and validates stored state", () => {
  let p = { ...initialOpponent, level: 20 };
  for (let i = 0; i < 20; i++) p = adaptOpponent(p, 1, false);
  expect(p.level).toBe(20);
  expect(parseOpponent({ level: NaN })).toEqual(initialOpponent);
  expect(randomMoveChance(20)).toBe(0);
  expect(randomMoveChance(0)).toBe(0.5);
});
