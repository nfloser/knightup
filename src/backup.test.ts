import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { exportLearning, importLearning } from "./backup";
import { emptyProgress } from "./learning";
import { emptyTraining, updateTraining } from "./training";
it("restores mastery idempotently and rejects corruption before writing", async () => {
  const training = updateTraining(
    emptyTraining,
    "puzzle:test",
    "puzzle",
    true,
    false,
    Date.now(),
  );
  const backup = {
    format: "knightup-learning",
    version: 1,
    progress: emptyProgress,
    training,
  };
  await importLearning(backup);
  await importLearning(backup);
  const saved = await exportLearning();
  expect(saved.training.records["puzzle:test"].credits).toBe(1);
  await expect(
    importLearning({
      ...backup,
      training: { ...training, records: { broken: {} } },
    }),
  ).rejects.toThrow();
  expect(await exportLearning()).toEqual(saved);
});
it("keeps legacy notation-only backups compatible", async () => {
  await expect(importLearning(emptyProgress)).resolves.toHaveProperty(
    "version",
    2,
  );
});
it("never writes progress when stored training is corrupt", async () => {
  const { database } = await import("./local-db");
  const db = await database();
  const before = await db.get("settings", "progress");
  const training = await db.get("settings", "training");
  await db.put("settings", { version: 9 }, "training");
  await expect(importLearning(emptyProgress)).rejects.toThrow();
  expect(await db.get("settings", "progress")).toEqual(before);
  await db.put("settings", training, "training");
});
