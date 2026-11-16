import { SequenceLibrary } from "./SequenceSession";
import { AcademyPaths } from "./AcademyPaths";
import type { Sequence } from "./sequences";
import type { Course } from "./curriculum";
import { CourseLibrary } from "./CourseLibrary";
import { lessons, type Progress } from "./learning";
import { Knight } from "./Knight";
export function LearnPage({
  ready,
  progress,
  start,
  next,
  reason,
  onCourseStart,
  onSequenceStart,
  now,
}: {
  onSequenceStart: (
    s: Sequence,
    remaining?: Sequence[],
    course?: { total: number; completed: number },
  ) => void;
  ready: boolean;
  now: number;
  onCourseStart: (course: Course) => void;
  progress: Progress;
  start: (index: number) => void;
  next: number;
  reason: string;
}) {
  const count = progress.completed.length;
  return (
    <>
      <div className="page-title">
        <p className="eyebrow">A LITTLE PRACTICE. A STRONGER PLAYER.</p>
        <h1>Your next good move.</h1>
        <p className="lead">Build understanding, one small lesson at a time.</p>
      </div>
      <CourseLibrary now={now} onStart={onCourseStart} recommendationsOnly />
      <SequenceLibrary onStart={onSequenceStart} />
      <AcademyPaths onStart={onSequenceStart} />
      <CourseLibrary now={now} onStart={onCourseStart} />
      <section className="featured">
        <div>
          <span className="pill">FOUNDATIONS · NOTATION</span>
          <h2>
            Speak the language
            <br />
            of chess.
          </h2>
          <p>
            From your first square to your first checkmate.
            <br className="desktop-break" /> Read the move. Find it. Make it
            yours.
          </p>
          <button
            className="primary"
            disabled={!ready}
            onClick={() => start(next)}
          >
            {count === lessons.length
              ? "Review notation"
              : count
                ? "Continue learning"
                : "Start learning"}{" "}
            <span>↗</span>
          </button>
          <span className="session-length">8 exercises · at your own pace</span>
        </div>
        <div className="hero-art">
          <span className="orbit" />
          <Knight />
          <Knight white />
          <span className="art-label">EVERY MASTER STARTED HERE.</span>
        </div>
      </section>
      <p className="recommendation" role="status">
        <strong>Recommended: {lessons[next].title}.</strong> {reason}
      </p>
      <section className="path-section">
        <div className="section-heading">
          <h2>Your learning path</h2>
          <span>
            {count} OF {lessons.length} COMPLETED
          </span>
        </div>
        <div className="path-list">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              disabled={!ready}
              className="path-item"
              onClick={() => start(i)}
            >
              <span
                className={`step ${progress.completed.includes(lesson.id) ? "done" : ""}`}
              >
                {progress.completed.includes(lesson.id)
                  ? "✓"
                  : String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{lesson.title}</strong>
                <small>
                  {
                    [
                      "Files, ranks & pawn moves",
                      "Piece letters & development",
                      "Captures & pawn notation",
                      "Kingside & queenside",
                      "The check symbol",
                      "Disambiguation",
                      "Promotion notation",
                      "The checkmate symbol",
                    ][i]
                  }
                </small>
              </span>
              <span className="path-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
