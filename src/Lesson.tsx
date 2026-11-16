import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Board } from "./Board";
import { assess, lessons } from "./learning";
export function Lesson({
  initialIndex,
  onAttempt,
  onExit,
}: {
  initialIndex: number;
  onAttempt: (
    id: string,
    correct: boolean,
    assisted: boolean,
  ) => Promise<boolean>;
  onExit: () => void;
}) {
  const [explaining, setExplaining] = useState(false);
  const explanationHeading = useRef<HTMLHeadingElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const [hint, setHint] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [busy, setBusy] = useState(false);
  const lesson = lessons[index];
  const game = new Chess(lesson.fen);
  if (correct || explaining) game.move(lesson.san);
  async function submit(san: string) {
    if (busy || correct || explaining) return;
    setBusy(true);
    setAttemptNumber((n) => n + 1);
    const result = assess(lesson, san);
    setFeedback(
      result.correct ? "You found the intended move." : result.message,
    );
    const saved = await onAttempt(lesson.id, result.correct, assisted);
    if (result.correct && saved) setCorrect(true);
    if (!result.correct) setAssisted(true);
    if (!saved)
      setFeedback(
        "Progress could not be saved. Please retry, or check storage permissions.",
      );
    setBusy(false);
  }
  async function showExplanation() {
    if (busy || explaining) return;
    setExplaining(true);
    setAssisted(true);
    requestAnimationFrame(() => explanationHeading.current?.focus());
    if (!correct) {
      setBusy(true);
      const saved = await onAttempt(lesson.id, false, true);
      if (!saved)
        setFeedback(
          "Could not save this assisted review. Please check browser storage.",
        );
      setBusy(false);
    }
  }
  const next = useCallback(() => {
    if (index === lessons.length - 1) {
      onExit();
      return;
    }
    setIndex(index + 1);
    setInput("");
    setFeedback("");
    setCorrect(false);
    setHint(false);
    setAssisted(false);
    setAttemptNumber(0);
    setExplaining(false);
    requestAnimationFrame(() => heading.current?.focus());
  }, [index, onExit]);
  useEffect(() => {
    if (!correct || explaining) return;
    const timer = window.setTimeout(next, 1600);
    return () => window.clearTimeout(timer);
  }, [correct, explaining, next]);
  return (
    <>
      <div className="section-heading">
        <button className="text-button" onClick={onExit}>
          ← Learning path
        </button>
        <span>
          NOTATION LAB · {index + 1} / {lessons.length}
        </span>
      </div>
      <div className="lesson-tools">
        <span>
          {explaining
            ? "Suggested move shown on the board."
            : "Correct moves continue automatically."}
        </span>
        <button
          className="explain-button"
          disabled={busy}
          aria-expanded={explaining}
          aria-controls={explaining ? "move-explanation" : undefined}
          onClick={() => {
            if (explaining) {
              setExplaining(false);
              heading.current?.focus();
            } else void showExplanation();
          }}
        >
          {explaining ? "Hide explanation" : "Explain"}
        </button>
      </div>
      <div className="lesson-layout">
        <Board
          key={lesson.id}
          fen={game.fen()}
          lastMove={game.history({ verbose: true }).at(-1)}
          onMove={(san) => {
            setInput(san);
            void submit(san);
          }}
          disabled={correct || explaining || busy}
        />
        <section className="lesson-copy">
          <p className="eyebrow">READ IT. PLAY IT. UNDERSTAND IT.</p>
          <h1 ref={heading} tabIndex={-1}>
            {lesson.title}
          </h1>
          <p className="lead">{lesson.instruction}</p>
          <form
            aria-busy={busy}
            onSubmit={(event) => {
              event.preventDefault();
              void submit(input);
            }}
          >
            <label htmlFor="san">Your move in English SAN</label>
            <div className="input-row">
              <input
                id="san"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={correct || explaining || busy}
              />
              <button
                className="primary"
                disabled={!input.trim() || correct || explaining || busy}
              >
                {busy ? "Checking…" : correct ? "Checked ✓" : "Check"}
              </button>
            </div>
          </form>
          <p
            key={`${lesson.id}-${attemptNumber}-${busy}`}
            className={`feedback ${feedback ? "feedback-entry" : ""} ${correct ? "success" : feedback && !busy ? "retry" : ""}`}
            role="status"
          >
            {feedback && !busy && (
              <strong className="feedback-label">
                {correct ? "✓ Correct move" : "↺ Try again"}
              </strong>
            )}
            {feedback || "Take your time. Accuracy comes before speed."}
          </p>
          {correct && !explaining && (
            <div className="auto-next-notice">
              <span role="status">
                {index < lessons.length - 1
                  ? "Moving to the next exercise…"
                  : "Returning to your learning path…"}
              </span>
              <span className="auto-next-progress" aria-hidden="true" />
            </div>
          )}
          {explaining && (
            <section
              className="move-explanation"
              id="move-explanation"
              aria-labelledby="explanation-title"
            >
              <p className="eyebrow">SUGGESTED MOVE · {lesson.san}</p>
              <h2 id="explanation-title" tabIndex={-1} ref={explanationHeading}>
                Why {lesson.san}?
              </h2>
              <p>{lesson.explanation}</p>
              <small>
                This is the intended move for this lesson, not a Stockfish
                best-move evaluation.
              </small>
              {!correct && (
                <button
                  className="text-button"
                  onClick={() => {
                    setExplaining(false);
                    heading.current?.focus();
                  }}
                >
                  Try it yourself
                </button>
              )}
            </section>
          )}
          {correct ? (
            <button className="primary wide" onClick={next}>
              {index < lessons.length - 1
                ? "Next exercise →"
                : "Finish lesson ✓"}
            </button>
          ) : (
            <>
              <button
                className="text-button"
                disabled={busy || explaining}
                onClick={() => {
                  setHint(!hint);
                  setAssisted(true);
                }}
                aria-expanded={hint}
              >
                {hint ? "Hide hint" : "Need a hint?"}
              </button>
              {hint && <p className="hint">{lesson.hint}</p>}
            </>
          )}
          <div className="note">
            <strong>A small language, a whole game.</strong>
            <p>
              SAN names a legal move in its position. It is not a rating or an
              engine evaluation.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
