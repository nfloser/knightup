import type { Lesson } from "./learning";
import type { TrainingRecord } from "./training";

/** Resume the first exercise without clean recall, preserving existing IDs. */
export function activeCourseExerciseIndex(
  exercises: Lesson[],
  records: Record<string, TrainingRecord>,
): number {
  const next = exercises.findIndex(
    (exercise) =>
      records[`course:${exercise.id}`]?.firstSolvedAt === undefined,
  );
  // An all-clean course starts a new review session from the beginning.
  return next < 0 ? 0 : next;
}
