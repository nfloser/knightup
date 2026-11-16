import { activeCourseExerciseIndex } from "./course-resume";
import { database } from "./local-db";
import { loadReports, learningNeeds } from "./coaching";
import { useEffect, useState } from "react";
import { courses, type Course } from "./curriculum";
import { Lesson } from "./Lesson";
import { emptyTraining, loadTraining, recordTraining } from "./training";
export function CourseSession({
  course: active,
  onExit: exit,
}: {
  course: Course;
  onExit: () => void;
}) {
  const [practising, setPractising] = useState(false);
  const [resumeIndex, setResumeIndex] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const [progressError, setProgressError] = useState("");
  useEffect(() => {
    let active = true;
    loadTraining()
      .then((ledger) => {
        if (!active) return;
        const next = activeCourseExerciseIndex(active.exercises, ledger.records);
        setResumeIndex(next);
        setProgressReady(true);
      })
      .catch(() => {
        if (active) setProgressError("Could not load saved Academy progress.");
      });
    return () => { active = false; };
  }, [active]);
  if (practising)
    return (
      <Lesson
        content={active.exercises}
        label="CHESS ACADEMY"
        initialIndex={resumeIndex}
        onExit={exit}
        onAttempt={async (id, success, assisted) => {
          try {
            await recordTraining(`course:${id}`, "course", success, assisted);
            return true;
          } catch {
            return false;
          }
        }}
      />
    );
  return (
    <div className="lesson-screen course-intro">
      <div className="section-heading">
        <button className="text-button" onClick={exit}>
          ← Learning path
        </button>
        <span>{active.band} · CURRICULUM BAND</span>
      </div>
      <section className="surface course-reading">
        <p className="eyebrow">CHESS ACADEMY · {active.band}</p>
        <h1>{active.title}</h1>
        {active.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.text}</p>
          </div>
        ))}
        <p className="small">
          Curriculum bands are guides, not guaranteed playing ratings. Read the
          objective before choosing a move.
        </p>
        {progressError && <p role="alert">{progressError}</p>}
        <button className="primary wide" disabled={!progressReady} onClick={() => setPractising(true)}>
          {resumeIndex > 0 ? "Continue your practice" : "Practise this idea"} →
        </button>
      </section>
    </div>
  );
}
export function CourseLibrary({
  onStart,
  now,
  recommendationsOnly = false,
}: {
  onStart: (course: Course) => void;
  now: number;
  recommendationsOnly?: boolean;
}) {
  const [needs, setNeeds] = useState<Record<string, number>>({});
  const [training, setTraining] = useState(emptyTraining);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    Promise.all([
      loadTraining(),
      loadReports(),
      database().then((db) => db.get("settings", "coachPrefs")),
    ])
      .then(([t, reports, prefs]) => {
        if (alive)
          setNeeds(
            learningNeeds(
              reports,
              typeof prefs?.username === "string" ? prefs.username : "GMNille",
            ),
          );
        if (alive) setTraining(t);
      })
      .catch(() => {
        if (alive) setError("Course progress could not be loaded.");
      });
    return () => {
      alive = false;
    };
  }, []);
  const [category, setCategory] = useState("All");
  const categoryOf = (c: Course) =>
    ["development", "castle", "caro-kann", "vienna"].includes(c.id)
      ? "Openings"
      : ["endgame-king", "back-rank", "promotion"].includes(c.id)
        ? "Endgames"
        : ["loose-pieces", "forks", "pins", "skewers", "discovery"].includes(
              c.id,
            )
          ? "Middlegame"
          : "Foundations";
  const completed = (course: Course) =>
    course.exercises.filter(
      (e) => training.records[`course:${e.id}`]?.firstSolvedAt !== undefined,
    ).length;
  const due = courses.find((c) =>
    c.exercises.some((e) => {
      const r = training.records[`course:${e.id}`];
      return r && r.due <= now;
    }),
  );
  const personal = [...courses]
    .filter((c) => needs[c.theme])
    .sort((a, b) => needs[b.theme] - needs[a.theme])[0];
  const recommended =
    due ??
    personal ??
    courses.find((c) => completed(c) < c.exercises.length) ??
    courses[0];
  if (recommendationsOnly)
    return (
      <section className="academy study-recommendation">
        <div className="section-heading">
          <h2>Recommended for you</h2>
          <span>YOUR NEXT STEP</span>
        </div>
        <p>
          {due
            ? "A lesson is ready for review."
            : personal
              ? "Based on themes in your analysed games."
              : "Start with a foundation and build from there."}
        </p>
        {error && <p role="alert">{error}</p>}
        <button
          className="course-card study-next"
          onClick={() => onStart(recommended)}
        >
          <span className="eyebrow">
            {due
              ? "DUE FOR REVIEW"
              : personal
                ? "FROM YOUR GAMES"
                : "SUGGESTED LESSON"}
          </span>
          <h3>{recommended.title}</h3>
          <span>Continue learning →</span>
        </button>
      </section>
    );
  return (
    <section className="academy">
      <div className="section-heading">
        <h2>Chess academy</h2>
        <span>{courses.length} LESSONS · ORIGINAL INSTRUCTION</span>
      </div>
      <p>
        Learn the idea first, then apply it on the board. Completed exercises
        return for spaced review.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="actions" role="group" aria-label="Lesson categories">
        {["All", "Foundations", "Openings", "Middlegame", "Endgames"].map(
          (c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ),
        )}
      </div>
      <div className="course-grid">
        {courses
          .filter((c) => category === "All" || categoryOf(c) === category)
          .map((course) => (
            <button
              key={course.id}
              onClick={() => onStart(course)}
              className="course-card"
            >
              <span className="eyebrow">
                {String(courses.indexOf(course) + 1).padStart(2, "0")} ·{" "}
                {course.band}
              </span>
              <h3>{course.title}</h3>
              <p>
                {completed(course)} / {course.exercises.length} recalled without
                help
              </p>
              <span>
                {completed(course) === course.exercises.length
                  ? "Review lesson"
                  : "Open lesson"}{" "}
                →
              </span>
            </button>
          ))}
      </div>
    </section>
  );
}
