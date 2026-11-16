/** Resume unfinished lines; once all are clean, review them in their original order. */
export function remainingCourseSteps(
  ids: string[],
  clean: ReadonlySet<string>,
): string[] {
  const pending = ids.filter((id) => !clean.has(id));
  return pending.length ? pending : [...ids];
}
