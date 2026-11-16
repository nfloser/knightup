import { database } from "./local-db";
import { emptyProgress, parseProgress } from "./learning";
import { mergeProgress } from "./adaptive";
import { emptyTraining, parseTraining, mergeTraining } from "./training";
export async function exportLearning() {
  const tx = (await database()).transaction("settings");
  const [progress, training] = await Promise.all([
    tx.store.get("progress"),
    tx.store.get("training"),
  ]);
  await tx.done;
  return {
    format: "knightup-learning",
    version: 1,
    progress: progress ?? emptyProgress,
    training: training ?? emptyTraining,
  };
}
export async function importLearning(raw: unknown) {
  const envelope = raw as {
    format?: string;
    version?: number;
    progress?: unknown;
    training?: unknown;
  };
  const full = envelope?.format === "knightup-learning";
  if (full && envelope.version !== 1)
    throw Error("Unsupported backup version.");
  const progress = parseProgress(full ? envelope.progress : raw);
  const training = full ? parseTraining(envelope.training) : emptyTraining;
  const tx = (await database()).transaction("settings", "readwrite");
  const current = await tx.store.get("progress");
  const currentTraining = await tx.store.get("training");
  const merged = mergeProgress(
    current === undefined ? emptyProgress : parseProgress(current),
    progress,
  );
  let mergedTraining = mergeTraining(
    currentTraining === undefined
      ? emptyTraining
      : parseTraining(currentTraining),
    training,
  );
  if (currentTraining === undefined && full)
    mergedTraining = {
      ...mergedTraining,
      goal: training.goal,
      cosmetic: training.cosmetic,
    };
  await tx.store.put(merged, "progress");
  await tx.store.put(mergedTraining, "training");
  await tx.done;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("knightup-training"));
  return merged;
}
