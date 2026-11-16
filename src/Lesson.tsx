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
  const [autoAdvance, setAutoAdvance] = useState(true);
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
  if (correct) game.move(lesson.san);
  async function submit(san: string) {
    if (busy || correct) return;
    setBusy(true);
    setAttemptNumber((n) => n + 1);
    const result = assess(lesson, san);
    setFeedback(result.message);
    const saved = await onAttempt(lesson.id, result.correct, assisted);
    if (result.correct && saved) setCorrect(true);
    if (!result.correct) setAssisted(true);
    if (!saved)
      setFeedback(
        "Progress could not be saved. Please retry, or check storage permissions.",
      );
    setBusy(false);
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
    requestAnimationFrame(() => heading.current?.focus());
  }, [index, onExit]);
  useEffect(() => {
    if (!correct || !autoAdvance) return;
    const timer = window.setTimeout(next, 1600);
    return () => window.clearTimeout(timer);
  }, [correct, autoAdvance, next]);
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
      <div className="auto-next-setting">
        <button
          className="text-button"
          aria-pressed={autoAdvance}
          onClick={() => setAutoAdvance((value) => !value)}
        >
          Auto-next {autoAdvance ? "on" : "off"}
        </button>
        <span>
          {autoAdvance
            ? "Correct answers continue automatically."
            : "Paused. Read at your own pace."}
        </span>
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
          disabled={correct || busy}
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
                disabled={correct || busy}
              />
              <button
                className="primary"
                disabled={!input.trim() || correct || busy}
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
          {correct && autoAdvance && (
            <div className="auto-next-notice">
              <span role="status">
                {index < lessons.length - 1
                  ? "Moving to the next exercise…"
                  : "Returning to your learning path…"}
              </span>
              <button
                className="text-button"
                onClick={() => setAutoAdvance(false)}
              >
                Pause
              </button>
              <span className="auto-next-progress" aria-hidden="true" />
            </div>
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
