import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { emptyProgress, complete, lessons } from "./learning";
import { loadProgress, saveProgress, saveAttempt } from "./storage";
it("merges stale concurrent tab completions without losing progress", async () => {
  await Promise.all([
    saveProgress(complete(emptyProgress, lessons[0].id)),
    saveProgress(complete(emptyProgress, lessons[1].id)),
  ]);
  expect((await loadProgress()).completed).toEqual(
    expect.arrayContaining([lessons[0].id, lessons[1].id]),
  );
});

it("retains both concurrent attempts on the same skill", async () => {
  const before = (await loadProgress()).reviews[lessons[0].id]?.attempts ?? 0;
  await Promise.all([
    saveAttempt(lessons[0].id, false, false),
    saveAttempt(lessons[0].id, true, true),
  ]);
  expect((await loadProgress()).reviews[lessons[0].id].attempts).toBe(
    before + 2,
  );
});
