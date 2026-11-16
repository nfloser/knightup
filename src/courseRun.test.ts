import { expect, it } from "vitest";
import { remainingCourseSteps } from "./courseRun";

it("continues unfinished lessons in course order", () => {
  expect(remainingCourseSteps(["a", "b", "c"], new Set(["a", "c"]))).toEqual([
    "b",
  ]);
});
it("offers the complete course for review only once every lesson is clean", () => {
  const steps = ["a", "b"];
  expect(remainingCourseSteps(steps, new Set(steps))).toEqual(steps);
  expect(remainingCourseSteps([], new Set())).toEqual([]);
});
