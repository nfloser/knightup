import { mergeProgress, recordAttempt } from "./adaptive";
import { openDB } from "idb";
import { emptyProgress, parseProgress, type Progress } from "./learning";
const db = () =>
  openDB("knightup", 1, {
    upgrade(database) {
      database.createObjectStore("settings");
    },
  });
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
  const next = recordAttempt(
    current,
    id,
    correct,
    assisted,
    Date.now(),
    crypto.randomUUID(),
  );
  await tx.store.put(next, "progress");
  await tx.done;
  return next;
}
