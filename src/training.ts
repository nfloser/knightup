import { database } from "./local-db";
export type TrainingRecord = {
  id: string;
  kind: "puzzle" | "course";
  at: number;
  attempts: number;
  solves: number;
  assisted: boolean;
  box: number;
  due: number;
  firstSolvedAt?: number;
  credits: number;
  creditDays: string[];
};
export type Training = {
  version: 1;
  records: Record<string, TrainingRecord>;
  cosmetic: string;
};
export const emptyTraining: Training = {
  version: 1,
  records: {},
  cosmetic: "classic",
};
export function dayKey(at: number) {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function updateTraining(
  state: Training,
  id: string,
  kind: "puzzle" | "course",
  success: boolean,
  assisted: boolean,
  at: number,
): Training {
  const old = state.records[id];
  const clean = success && !assisted;
  const due = !old || old.due <= at;
  const box = clean ? (due ? Math.min(5, (old?.box ?? 0) + 1) : old.box) : 0;
  const day = dayKey(at);
  const canCredit = clean && due && !old?.creditDays.includes(day);
  const record: TrainingRecord = {
    id,
    kind,
    at,
    attempts: Math.min(1e6, (old?.attempts ?? 0) + 1),
    solves: Math.min(1e6, (old?.solves ?? 0) + (clean ? 1 : 0)),
    assisted,
    box,
    due: clean
      ? due
        ? at + [0, 1, 3, 7, 14, 30][box] * 86400000
        : old.due
      : at + 600000,
    firstSolvedAt: old?.firstSolvedAt ?? (clean ? at : undefined),
    credits: (old?.credits ?? 0) + (canCredit ? 1 : 0),
    creditDays: canCredit
      ? [...(old?.creditDays ?? []), day].slice(-365)
      : (old?.creditDays ?? []),
  };
  return { ...state, records: { ...state.records, [id]: record } };
}
export async function loadTraining(): Promise<Training> {
  return (
    (await (await database()).get("settings", "training")) ?? emptyTraining
  );
}
export async function recordTraining(
  id: string,
  kind: "puzzle" | "course",
  success: boolean,
  assisted: boolean,
) {
  const tx = (await database()).transaction("settings", "readwrite");
  const current = (await tx.store.get("training")) ?? emptyTraining;
  const next = updateTraining(current, id, kind, success, assisted, Date.now());
  await tx.store.put(next, "training");
  await tx.done;
  window.dispatchEvent(new Event("knightup-training"));
  return next;
}
