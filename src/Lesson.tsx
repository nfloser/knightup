import { useState } from "react";
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
  const [index, setIndex] = useState(initialIndex);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const [hint, setHint] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const [busy, setBusy] = useState(false);
  const lesson = lessons[index];
  const game = new Chess(lesson.fen);
  if (correct) game.move(lesson.san);
  async function submit(san: string) {
    if (busy || correct) return;
    setBusy(true);
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
  function next() {
    setIndex(index + 1);
    setInput("");
    setFeedback("");
    setCorrect(false);
    setHint(false);
    setAssisted(false);
  }
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
      <div className="lesson-layout">
        <Board
          key={`${lesson.id}-${correct}`}
          fen={game.fen()}
          onMove={(san) => {
            setInput(san);
            void submit(san);
          }}
          disabled={correct || busy}
        />
        <section className="lesson-copy">
          <p className="eyebrow">READ IT. PLAY IT. UNDERSTAND IT.</p>
          <h1>{lesson.title}</h1>
          <p className="lead">{lesson.instruction}</p>
          <form
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
                Check
              </button>
            </div>
          </form>
          <p className={`feedback ${correct ? "success" : ""}`} role="status">
            {feedback || "Take your time. Accuracy comes before speed."}
          </p>
          {correct ? (
            <button
              className="primary wide"
              onClick={index < lessons.length - 1 ? next : onExit}
            >
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
