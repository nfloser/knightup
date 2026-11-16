import { dayKey, type Training } from "./training";
export function rewardsFor(training: Training, at = Date.now()) {
  let xp = 0,
    puzzles = 0,
    courses = 0;
  const days = new Map<string, number>();
  for (const record of Object.values(training.records)) {
    if (record.firstSolvedAt !== undefined && record.credits > 0) {
      const puzzle = record.kind === "puzzle";
      xp +=
        (puzzle ? 25 : record.id.startsWith("course:coach-") ? 20 : 10) +
        Math.max(0, record.credits - 1) * 3;
      if (puzzle) puzzles++;
      else courses++;
    }
    for (const day of new Set(record.creditDays))
      days.set(day, (days.get(day) ?? 0) + 1);
  }
  const date = new Date(at);
  const today = dayKey(at);
  if (!days.has(today)) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(date.getTime()))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  return {
    xp,
    level,
    next: level * level * 100,
    floor: (level - 1) ** 2 * 100,
    puzzles,
    courses,
    streak,
    today: days.get(today) ?? 0,
  };
}
export function unlocks(r: ReturnType<typeof rewardsFor>) {
  return [
    {
      id: "classic",
      name: "Classic knight",
      rule: "Your first companion",
      unlocked: true,
      color: "#526078",
    },
    {
      id: "ivory",
      name: "Ivory knight",
      rule: "Master 2 lesson exercises",
      unlocked: r.courses >= 2,
      color: "#e4d4ac",
    },
    {
      id: "copper",
      name: "Copper knight",
      rule: "Solve 5 puzzles",
      unlocked: r.puzzles >= 5,
      color: "#c47c51",
    },
    {
      id: "gold",
      name: "Golden knight",
      rule: "Reach level 3",
      unlocked: r.level >= 3,
      color: "#d2ac48",
    },
  ];
}
