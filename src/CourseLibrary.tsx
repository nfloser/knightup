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
  if (practising)
    return (
      <Lesson
        content={active.exercises}
        label="CHESS ACADEMY"
        initialIndex={0}
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
        <button className="primary wide" onClick={() => setPractising(true)}>
          Practise this idea →
        </button>
      </section>
    </div>
  );
}
export function CourseLibrary({
  onStart,
  now,
}: {
  onStart: (course: Course) => void;
  now: number;
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
      <button className="primary" onClick={() => onStart(recommended)}>
        {due
          ? "Review due lesson"
          : personal
            ? "From your games"
            : "Recommended lesson"}
        : {recommended.title} →
      </button>
      {error && <p role="alert">{error}</p>}
      <div className="course-grid">
        {courses.map((course, i) => (
          <button
            key={course.id}
            onClick={() => onStart(course)}
            className="course-card"
          >
            <span className="eyebrow">
              {String(i + 1).padStart(2, "0")} · {course.band}
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
