import { useEffect, useState } from "react";
import { Knight } from "./Knight";
import { database } from "./local-db";
import { emptyTraining, loadTraining, type Training } from "./training";
import { rewardsFor, unlocks } from "./rewards";
export function RewardsPanel() {
  const [training, setTraining] = useState<Training>(emptyTraining);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void loadTraining()
        .then((t) => {
          if (active) setTraining(t);
        })
        .catch(() => setError("Could not load rewards."));
    };
    refresh();
    window.addEventListener("knightup-training", refresh);
    return () => {
      active = false;
      window.removeEventListener("knightup-training", refresh);
    };
  }, []);
  async function change(key: "goal" | "cosmetic", value: number | string) {
    try {
      const tx = (await database()).transaction("settings", "readwrite");
      const current: Training =
        (await tx.store.get("training")) ?? emptyTraining;
      if (
        key === "cosmetic" &&
        !unlocks(rewardsFor(current)).some((x) => x.id === value && x.unlocked)
      )
        throw new Error("This knight is still locked.");
      const next = { ...current, [key]: value };
      await tx.store.put(next, "training");
      await tx.done;
      setTraining(next);
      setError("");
    } catch {
      setError("Could not save your reward settings.");
    }
  }
  const r = rewardsFor(training),
    goal = training.goal ?? 3;
  return (
    <section className="surface rewards-panel">
      <p className="eyebrow">YOUR KNIGHT JOURNEY</p>
      <h2>
        Level {r.level} · {r.xp} XP
      </h2>
      <progress
        aria-label="Experience to next level"
        max={r.next - r.floor}
        value={r.xp - r.floor}
      />
      <p>
        {r.next - r.xp} XP to level {r.level + 1} · {r.streak} day streak
      </p>
      <label>
        Daily goal{" "}
        <select
          value={goal}
          onChange={(e) => void change("goal", Number(e.target.value))}
        >
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>
              {n} activities
            </option>
          ))}
        </select>
      </label>
      <p>
        {Math.min(r.today, goal)} / {goal} today{" "}
        {r.today >= goal ? "✓ Goal reached" : ""}
      </p>
      <p>
        Clean first solves earn 25 XP per puzzle and 10 XP per lesson exercise.
        Due reviews earn 3 XP. Reveals and immediate repeats earn none.
      </p>
      <div className="reward-grid">
        {unlocks(r).map((item) => (
          <button
            key={item.id}
            className="reward-card"
            disabled={!item.unlocked}
            aria-pressed={training.cosmetic === item.id}
            onClick={() => void change("cosmetic", item.id)}
          >
            <span style={{ color: item.color }}>
              <Knight />
            </span>
            <strong>{item.name}</strong>
            <small>
              {item.unlocked
                ? training.cosmetic === item.id
                  ? "Equipped"
                  : "Equip"
                : item.rule}
            </small>
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
