import { expect, it } from "vitest";
import { activeCourseExerciseIndex } from "./course-resume";
import type { Lesson } from "./learning";
import type { TrainingRecord } from "./training";

const sample = (id: string): Lesson => ({
  id, title: id, fen: "8/8/8/8/8/8/8/8 w - - 0 1",
  san: "e4", instruction: "", explanation: "", hint: "",
});
function solved(id: string): TrainingRecord {
  return {
    id: "course:" + id, kind: "course", at: 1, attempts: 1, solves: 1,
    assisted: false, box: 1, due: 100, firstSolvedAt: 1,
    credits: 1, creditDays: [],
  };
}
it("resumes at the earliest unfinished exercise and restarts fully clean courses for review", () => {
  const exercises = [sample("a"), sample("b"), sample("c")];
  expect(activeCourseExerciseIndex(exercises, {})).toBe(0);
  expect(activeCourseExerciseIndex(exercises, { "course:a": solved("a") })).toBe(1);
  expect(activeCourseExerciseIndex(exercises, {
    "course:a": solved("a"), "course:c": solved("c"),
  })).toBe(1);
  expect(activeCourseExerciseIndex(exercises, {
    "course:a": solved("a"), "course:b": solved("b"), "course:c": solved("c"),
  })).toBe(0);
});
