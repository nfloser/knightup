import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Board } from "./Board";
import {
  choosePuzzle,
  gradePuzzleMove,
  playUci,
  preparePuzzle,
  puzzleExplanation,
  solution,
  validatePuzzle,
  type Puzzle,
} from "./puzzles";
import { recordTraining } from "./training";
const filters = [
  ["all", "All themes"],
  ["mateIn1", "Mate in one"],
  ["mateIn2", "Mate in two"],
  ["fork", "Forks"],
  ["pin", "Pins"],
  ["skewer", "Skewers"],
  ["hangingPiece", "Hanging pieces"],
  ["endgame", "Endgames"],
  ["promotion", "Promotion"],
];
export function PuzzlesPage({
  onSessionChange,
}: {
  onSessionChange: (active: boolean) => void;
}) {
  const [pool, setPool] = useState<Puzzle[]>([]);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("all");
  const [difficulty, setDifficulty] = useState("easy");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [fen, setFen] = useState("");
  const [ply, setPly] = useState(1);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("Find the strongest continuation.");
  const [assisted, setAssisted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [replay, setReplay] = useState(0);
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );
  const [focused, setFocused] = useState(false);
  const seen = useRef<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}puzzles.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error("Puzzle library could not be loaded.");
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length > 10000)
          throw Error("Invalid puzzle library");
        setPool(data);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!puzzle) return;
    const resize = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      setHeight(h);
      document.documentElement.style.setProperty("--training-height", `${h}px`);
    };
    document.documentElement.style.setProperty(
      "--training-height",
      `${window.visualViewport?.height ?? window.innerHeight}px`,
    );
    window.visualViewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => {
      window.visualViewport?.removeEventListener("resize", resize);
      window.removeEventListener("resize", resize);
      document.documentElement.style.removeProperty("--training-height");
    };
  }, [puzzle]);
  const next = useCallback(() => {
    const [min, max] =
      difficulty === "easy"
        ? [400, 1000]
        : difficulty === "medium"
          ? [1000, 1400]
          : difficulty === "hard"
            ? [1400, 2000]
            : [0, 4000];
    const candidate = choosePuzzle(pool, { theme, min, max }, seen.current);
    if (!candidate) {
      setError(
        "No puzzles match these filters. Try All themes or another difficulty.",
      );
      return;
    }
    try {
      const p = validatePuzzle(candidate);
      const start = preparePuzzle(p);
      seen.current.push(p.id);
      setPuzzle(p);
      setFen(start.game.fen());
      setPly(1);
      setInput("");
      setFeedback("Find the strongest continuation.");
      setAssisted(false);
      setSolved(false);
      setExplaining(false);
      setBusy(false);
      setError("");
      onSessionChange(true);
    } catch {
      setError("This puzzle was invalid. Please choose another.");
    }
  }, [pool, theme, difficulty, onSessionChange]);
  useEffect(() => {
    if (!puzzle || ply >= puzzle.moves.length || ply % 2 !== 0 || explaining)
      return;
    const timer = window.setTimeout(() => {
      const game = new Chess(fen);
      playUci(game, puzzle.moves[ply]);
      setFen(game.fen());
      setPly(ply + 1);
      setFeedback("Your turn. Continue the line.");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [puzzle, ply, fen, explaining]);
  useEffect(() => {
    if (!solved || explaining) return;
    const timer = window.setTimeout(next, 1600);
    return () => window.clearTimeout(timer);
  }, [solved, explaining, next]);
  function exit() {
    setPuzzle(null);
    onSessionChange(false);
  }
  async function submit(san: string) {
    if (!puzzle || busy || solved || explaining || ply % 2 === 0) return;
    setBusy(true);
    const result = gradePuzzleMove(fen, puzzle.moves[ply], san);
    try {
      if (!result.correct) {
        setAssisted(true);
        await recordTraining(`puzzle:${puzzle.id}`, "puzzle", false, true);
        setFeedback("Try again. Check forcing moves and the opponent’s reply.");
      } else {
        const game = new Chess(fen);
        game.move(san, { strict: true });
        const done = ply + 1 === puzzle.moves.length;
        if (done)
          await recordTraining(`puzzle:${puzzle.id}`, "puzzle", true, assisted);
        setFen(game.fen());
        setPly(ply + 1);
        setInput("");
        setSolved(done);
        setFeedback(
          done
            ? assisted
              ? "Line completed with help. This position will return for review."
              : "✓ Puzzle solved. Well calculated!"
            : "Good move. Watch the reply.",
        );
      }
    } catch {
      setFeedback("Progress could not be saved. Please retry.");
    }
    setBusy(false);
  }
  async function explain() {
    if (!puzzle || busy) return;
    if (explaining) {
      setExplaining(false);
      return;
    }
    setExplaining(true);
    setReplay(0);
    setAssisted(true);
    if (!solved)
      try {
        await recordTraining(`puzzle:${puzzle.id}`, "puzzle", false, true);
      } catch {
        setFeedback("Could not save assisted review.");
      }
  }
  if (!puzzle)
    return (
      <>
        <div className="page-title">
          <p className="eyebrow">TACTICS · REAL POSITIONS</p>
          <h1>Puzzles, your way.</h1>
          <p className="lead">
            Random challenges or one pattern at a time. Complete the whole line.
          </p>
        </div>
        <section className="surface puzzle-launch">
          <div className="filter-row">
            <label>
              Theme
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                {filters.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Puzzle difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy · 400–1000</option>
                <option value="medium">Developing · 1000–1400</option>
                <option value="hard">Challenging · 1400–2000</option>
                <option value="all">All difficulties</option>
              </select>
            </label>
          </div>
          <button className="primary" disabled={!pool.length} onClick={next}>
            {pool.length ? "Play random puzzle →" : "Loading puzzles…"}
          </button>
          <p>
            {pool.length.toLocaleString()} legally validated Lichess positions.
            Puzzle ratings describe the task, not your playing rating.
          </p>
          {error && <p role="alert">{error}</p>}
        </section>
        <div className="practice-list">
          {filters.slice(1).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              aria-pressed={theme === id}
            >
              <h2>{label}</h2>
              <p>
                {pool.filter((p) => p.themes.includes(id)).length} positions ·
                choose this theme
              </p>
            </button>
          ))}
        </div>
        <p className="small">
          Source:{" "}
          <a
            href="https://database.lichess.org/#puzzles"
            target="_blank"
            rel="noreferrer"
          >
            Lichess open puzzle database
          </a>
          , CC0. This offline selection is a subset of the full database.
        </p>
      </>
    );
  const start = preparePuzzle(puzzle);
  const line = solution(puzzle);
  const visibleFen = explaining ? line[replay].fen : fen;
  const game = new Chess(visibleFen);
  const last = explaining
    ? line[replay].move
    : (() => {
        const g = new Chess(puzzle.fen);
        for (const m of puzzle.moves.slice(0, ply)) playUci(g, m);
        return g.history({ verbose: true }).at(-1);
      })();
  return (
    <div
      className="lesson-screen puzzle-screen"
      data-explaining={explaining}
      data-compact={height < 500}
      data-input-focused={focused}
    >
      <div className="section-heading">
        <button className="text-button" onClick={exit}>
          ← Puzzles
        </button>
        <span>
          LICHESS · {puzzle.id} · {puzzle.rating}
        </span>
      </div>
      <div className="lesson-tools">
        <button className="text-button" onClick={next}>
          Skip puzzle →
        </button>
        <button
          className="explain-button"
          disabled={busy}
          onClick={() => void explain()}
          aria-expanded={explaining}
        >
          {explaining ? "Hide explanation" : "Explain"}
        </button>
      </div>
      <div className="lesson-layout">
        <Board
          key={puzzle.id}
          fen={visibleFen}
          orientation={start.orientation}
          lastMove={last}
          disabled={busy || solved || explaining || ply % 2 === 0}
          onMove={(san) => void submit(san)}
        />
        <section className="lesson-copy">
          <p className="eyebrow">CALCULATE BEFORE YOU MOVE</p>
          <h1>{start.orientation === "w" ? "White" : "Black"} to play</h1>
          <p className="lead">
            Find the best continuation.{" "}
            {Math.ceil((puzzle.moves.length - 1) / 2)} move
            {puzzle.moves.length > 2 ? "s" : ""} to calculate.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit(input);
            }}
          >
            <label htmlFor="puzzle-san">Your move in English SAN</label>
            <div className="input-row">
              <input
                id="puzzle-san"
                value={input}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setInput(e.target.value)}
                disabled={solved || explaining || busy || ply % 2 === 0}
              />
              <button
                className="primary"
                disabled={!input.trim() || busy || solved || ply % 2 === 0}
              >
                {busy ? "Checking…" : "Check"}
              </button>
            </div>
          </form>
          <p className={`feedback ${solved ? "success" : ""}`} role="status">
            {feedback}
          </p>
          {explaining && (
            <section className="move-explanation">
              <h2>Why this line?</h2>
              <p>{puzzleExplanation(puzzle)}</p>
              <div className="move-sequence" aria-label="Solution variation">
                {line.map((step, i) => (
                  <button
                    key={i}
                    aria-pressed={i === replay}
                    onClick={() => setReplay(i)}
                  >
                    {step.san}
                  </button>
                ))}
              </div>
              <small>
                Official puzzle solution. Select a move to replay the
                continuation.{" "}
                <a
                  href={`https://lichess.org/training/${puzzle.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source
                </a>
              </small>
              {!solved && (
                <button
                  className="text-button"
                  onClick={() => setExplaining(false)}
                >
                  Try it yourself
                </button>
              )}
            </section>
          )}
          {solved ? (
            <>
              <div className="auto-next-notice">
                <span>
                  {explaining
                    ? "Inspect the solution, then continue."
                    : "Next puzzle follows automatically…"}
                </span>
              </div>
              <button className="primary wide" onClick={next}>
                Next puzzle →
              </button>
            </>
          ) : (
            <button
              className="text-button"
              disabled={busy || explaining || ply % 2 === 0}
              onClick={() => {
                setAssisted(true);
                setFeedback(
                  `Hint: examine the piece on ${puzzle.moves[ply].slice(0, 2)}. ${puzzleExplanation(puzzle)}`,
                );
                void recordTraining(
                  `puzzle:${puzzle.id}`,
                  "puzzle",
                  false,
                  true,
                ).catch(() => setFeedback("Could not save this hint."));
              }}
            >
              Hint
            </button>
          )}
          <div className="note">
            <p>
              Solution moves:{" "}
              {game.history().join(" ") || "Play the line on the board."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
