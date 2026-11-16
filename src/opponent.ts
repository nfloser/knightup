export type OpponentProgress = {
  version: 1;
  level: number;
  games: number;
  recent: number[];
};
export const initialOpponent: OpponentProgress = {
  version: 1,
  level: 2,
  games: 0,
  recent: [],
};
export function parseOpponent(raw: unknown): OpponentProgress {
  const r = raw as OpponentProgress;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isFinite(r.level) ||
    r.level < 0 ||
    r.level > 20 ||
    !Number.isSafeInteger(r.games) ||
    r.games < 0 ||
    !Array.isArray(r.recent) ||
    r.recent.length > 8 ||
    r.recent.some((n) => ![0, 0.5, 1].includes(n))
  )
    return initialOpponent;
  return r;
}
export function adaptOpponent(
  p: OpponentProgress,
  result: number,
  assisted: boolean,
): OpponentProgress {
  if (assisted) return p;
  const recent = [...p.recent, result].slice(-8);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const change =
    recent.length < 3 ? 0 : mean > 0.65 ? 0.5 : mean < 0.35 ? -0.5 : 0;
  return {
    ...p,
    games: p.games + 1,
    recent,
    level: Math.max(0, Math.min(20, p.level + change)),
  };
}
export function randomMoveChance(level: number) {
  return Math.max(0, 0.5 * (1 - level / 5));
}
