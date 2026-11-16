import { emptyTraining, parseTraining, updateTraining } from "./training";
import { mergeProgress, recordAttempt } from "./adaptive";
import { database as db } from "./local-db";
import { emptyProgress, parseProgress, type Progress } from "./learning";
export async function loadProgress() {
  const stored = await (await db()).get("settings", "progress");
  return stored === undefined ? emptyProgress : parseProgress(stored);
}
export async function saveProgress(value: Progress) {
  const incoming = parseProgress(value);
  const tx = (await db()).transaction("settings", "readwrite");
  const stored = await tx.store.get("progress");
  const current = stored === undefined ? emptyProgress : parseProgress(stored);
  const merged = mergeProgress(current, incoming);
  await tx.store.put(merged, "progress");
  await tx.done;
  return merged;
}
export async function loadTheme(): Promise<"light" | "dark"> {
  return (await (await db()).get("settings", "theme")) === "dark"
    ? "dark"
    : "light";
}
export async function saveTheme(value: "light" | "dark") {
  await (await db()).put("settings", value, "theme");
}

export async function saveAttempt(
  id: string,
  correct: boolean,
  assisted: boolean,
) {
  const tx = (await db()).transaction("settings", "readwrite");
  const raw = await tx.store.get("progress");
  const current = raw === undefined ? emptyProgress : parseProgress(raw);
  const next = parseProgress(
    recordAttempt(
      current,
      id,
      correct,
      assisted,
      Date.now(),
      crypto.randomUUID(),
    ),
  );
  const rawTraining = await tx.store.get("training");
  const training =
    rawTraining === undefined ? emptyTraining : parseTraining(rawTraining);
  const nextTraining = updateTraining(
    training,
    `course:${id}`,
    "course",
    correct,
    assisted,
    Date.now(),
  );
  await tx.store.put(next, "progress");
  await tx.store.put(nextTraining, "training");
  await tx.done;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("knightup-training"));
  return next;
}
