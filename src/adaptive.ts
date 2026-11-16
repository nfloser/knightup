import { lessons, type Progress, complete } from "./learning";
export const DAY = 86_400_000;
const intervals = [0, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
export type ReviewState = {
  id: string;
  at: number;
  due: number;
  box: number;
  attempts: number;
  failures: number;
  correct: boolean;
  assisted: boolean;
};
export function recordAttempt(
  progress: Progress,
  lessonId: string,
  correct: boolean,
  assisted: boolean,
  at: number,
  id: string,
): Progress {
  if (!lessons.some((l) => l.id === lessonId)) throw Error("Unknown lesson");
  const previous = progress.reviews[lessonId];
  const clean = correct && !assisted;
  const eligible = !previous || at >= previous.due;
  const box = clean
    ? eligible
      ? Math.min(5, (previous?.box ?? 0) + 1)
      : previous.box
    : 0;
  const review: ReviewState = {
    id,
    at,
    due: clean ? (eligible ? at + intervals[box] : previous.due) : at + 600_000,
    box,
    attempts: Math.min(1_000_000, (previous?.attempts ?? 0) + 1),
    failures: Math.min(1_000_000, (previous?.failures ?? 0) + (clean ? 0 : 1)),
    correct,
    assisted,
  };
  const next = {
    ...progress,
    reviews: { ...progress.reviews, [lessonId]: review },
  };
  return correct ? complete(next, lessonId) : next;
}
export function mergeProgress(a: Progress, b: Progress): Progress {
  const reviews = { ...a.reviews };
  for (const [id, r] of Object.entries(b.reviews)) {
    const old = reviews[id];
    if (!old || r.at > old.at || (r.at === old.at && r.id > old.id))
      reviews[id] = r;
  }
  return {
    version: 2,
    completed: [...new Set([...a.completed, ...b.completed])],
    reviews,
  };
}
export function recommend(progress: Progress, now: number) {
  const due = lessons
    .map((l, index) => ({ index, review: progress.reviews[l.id] }))
    .filter((x) => x.review && x.review.due <= now)
    .sort(
      (a, b) =>
        a.review.box - b.review.box ||
        a.review.due - b.review.due ||
        a.index - b.index,
    );
  if (due.length) {
    const item = due[0];
    return {
      index: item.index,
      reason:
        item.review.box === 0
          ? "This skill needed help or retries. A short review is due."
          : "This skill is due for a spaced review.",
      due: true,
    };
  }
  const next = lessons.findIndex((l) => !progress.completed.includes(l.id));
  if (next >= 0)
    return {
      index: next,
      reason: "Build the next foundation. No weak-skill reviews are due yet.",
      due: false,
    };
  const first = lessons
    .map((l, index) => ({ index, due: progress.reviews[l.id]?.due ?? 0 }))
    .sort((a, b) => a.due - b.due || a.index - b.index)[0];
  return {
    index: first.index,
    reason: first.due
      ? "Your reviews are up to date. Optional practice will not advance a review interval before it is due."
      : "Your previous completion has no review history. Try an unassisted review to schedule it.",
    due: false,
  };
}
