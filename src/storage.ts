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
  await (await db()).put("settings", parseProgress(value), "progress");
}
export async function loadTheme(): Promise<"light" | "dark"> {
  return (await (await db()).get("settings", "theme")) === "dark"
    ? "dark"
    : "light";
}
export async function saveTheme(value: "light" | "dark") {
  await (await db()).put("settings", value, "theme");
}
