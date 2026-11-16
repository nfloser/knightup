import { useEffect, useState } from "react";
import { academyPathInfo, academyPaths, type AcademyPhase } from "./academy-paths";
import type { Sequence } from "./sequences";
import { emptyTraining, loadTraining } from "./training";
import { remainingCourseSteps } from "./courseRun";

type Props = {
  onStart: (
    sequence: Sequence,
    remaining?: Sequence[],
    course?: { total: number; completed: number },
  ) => void;
};

const ordered: AcademyPhase[] = ["foundations", "middlegame", "endgame"];

export function AcademyPaths({ onStart }: Props) {
  const [active, setActive] = useState<AcademyPhase | null>(null);
  const [training, setTraining] = useState(emptyTraining);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    loadTraining()
      .then((value) => {
        if (!alive) return;
        setTraining(value);
        setReady(true);
      })
      .catch(() => {
        if (alive) setError("Academy progress could not be loaded.");
      });
    return () => {
      alive = false;
    };
  }, []);

  function completed(s: Sequence) {
    return training.records[`course:sequence-${s.id}`]?.firstSolvedAt !== undefined;
  }
  function launch(path: AcademyPhase) {
    if (!ready) return;
    const all = academyPaths[path];
    const clean = new Set(all.filter(completed).map((s) => s.id));
    const remaining = remainingCourseSteps(all.map((s) => s.id), clean)
      .map((id) => all.find((s) => s.id === id)!);
    const first = remaining[0];
    if (!first) return;
    onStart(first, remaining.slice(1), {
      total: all.length,
      completed: clean.size,
    });
  }
  return (
    <section className="academy academy-guided-paths" aria-label="Guided academy paths">
      <div className="section-heading">
        <h2>Guided academy paths</h2>
        <span>LEARN · RECALL · REVIEW</span>
      </div>
      <p>Twenty attributed positions per path. Read each board demonstration before you practise the continuation. Clean recall and due reviews are saved locally.</p>
      {error && <p role="alert">{error}</p>}
      {active && (
        <button className="text-button" onClick={() => setActive(null)}>
          ← All academy paths
        </button>
      )}
      <div className="course-grid">
        {ordered.filter((id) => !active || active === id).map((id) => {
          const lessons = academyPaths[id];
          const done = lessons.filter(completed).length;
          const info = academyPathInfo[id];
          return (
            <div className="course-card academy-path-card" key={id}>
              <span className="eyebrow">{lessons.length} GUIDED LESSONS</span>
              <h3>{info.title}</h3>
              <p>{info.description}</p>
              <p>{done} / {lessons.length} recalled without help</p>
              <progress aria-label={info.title + " mastery"} max={lessons.length} value={done} />
              <div className="actions">
                <button className="primary" disabled={!ready} onClick={() => launch(id)}>
                  {done === lessons.length ? "Review path" : "Continue path"} →
                </button>
                {!active && <button className="secondary-action" onClick={() => setActive(id)}>
                  Explore lessons
                </button>}
              </div>
              {active === id && (
                <ol className="academy-path-steps">
                  {lessons.map((lesson, index) => (
                    <li key={lesson.id}>
                      <button disabled={!ready} onClick={() => onStart(lesson)} className="path-item">
                        <span className={`step ${completed(lesson) ? "done" : ""}`}>
                          {completed(lesson) ? "✓" : index + 1}
                        </span>
                        <span>
                          <strong>{lesson.title}</strong>
                          <small>{lesson.idea}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
