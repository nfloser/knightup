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
  goal?: number;
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
    firstSolvedAt: old?.firstSolvedAt ?? (clean && due ? at : undefined),
    credits: Math.min(1e6, (old?.credits ?? 0) + (canCredit ? 1 : 0)),
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

export function parseTraining(raw: unknown): Training {
  if (!raw || typeof raw !== "object") throw Error("Invalid training backup.");
  const value = raw as Training;
  if (
    value.version !== 1 ||
    !value.records ||
    typeof value.records !== "object" ||
    Array.isArray(value.records) ||
    Object.keys(value.records).length > 100000
  )
    throw Error("Invalid training records.");
  const records: Record<string, TrainingRecord> = {};
  for (const [id, r] of Object.entries(value.records)) {
    if (
      !r ||
      r.id !== id ||
      !/^(puzzle|course):[a-zA-Z0-9:_-]{1,150}$/.test(id) ||
      !["puzzle", "course"].includes(r.kind) ||
      typeof r.assisted !== "boolean"
    )
      throw Error("Invalid training record.");
    for (const n of [r.at, r.attempts, r.solves, r.box, r.due, r.credits])
      if (!Number.isSafeInteger(n) || n < 0)
        throw Error("Invalid training numbers.");
    if (
      r.box > 5 ||
      r.credits > 1000000 ||
      r.attempts > 1000000 ||
      r.solves > r.attempts ||
      r.credits > r.solves ||
      (r.firstSolvedAt !== undefined &&
        (!Number.isSafeInteger(r.firstSolvedAt) || r.firstSolvedAt < 0))
    )
      throw Error("Invalid mastery record.");
    if (
      !Array.isArray(r.creditDays) ||
      r.creditDays.length > 365 ||
      r.creditDays.some(
        (d) => typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d),
      )
    )
      throw Error("Invalid training dates.");
    records[id] = { ...r, creditDays: [...new Set(r.creditDays)] };
  }
  return {
    version: 1,
    records,
    cosmetic: ["classic", "ivory", "copper", "gold"].includes(value.cosmetic)
      ? value.cosmetic
      : "classic",
    goal: [1, 2, 3, 5, 10].includes(value.goal ?? 3) ? (value.goal ?? 3) : 3,
  };
}
export function mergeTraining(a: Training, b: Training): Training {
  const records = { ...a.records };
  for (const [id, incoming] of Object.entries(b.records)) {
    const old = records[id];
    if (!old) {
      records[id] = incoming;
      continue;
    }
    const first = [old.firstSolvedAt, incoming.firstSolvedAt].filter(
      (x): x is number => x !== undefined,
    );
    records[id] = {
      ...(old.at >= incoming.at ? old : incoming),
      attempts: Math.max(old.attempts, incoming.attempts),
      solves: Math.max(old.solves, incoming.solves),
      credits: Math.max(old.credits, incoming.credits),
      creditDays: [...new Set([...old.creditDays, ...incoming.creditDays])]
        .sort()
        .slice(-365),
      firstSolvedAt: first.length ? Math.min(...first) : undefined,
    };
  }
  return { ...a, records };
}
