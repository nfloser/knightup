import { moveFeedback } from "./moveFeedback";
import { useTrainingViewport } from "./useTrainingViewport";
import { useEffect, useRef, useState } from "react";
import { Chess, type Move } from "chess.js";
import { Board } from "./Board";
import { StockfishClient, legalVariation } from "./engine";
import { playUci } from "./puzzles";
import { database } from "./local-db";
import { parseGames, saveGames } from "./games";
import {
  initialOpponent,
  parseOpponent,
  adaptOpponent,
  randomMoveChance,
} from "./opponent";
export function PlayCoach({ onExit }: { onExit: () => void }) {
  const [ready, setReady] = useState(false);
  const [learner, setLearner] = useState("GMNille");
  const height = useTrainingViewport();
  const [focused, setFocused] = useState(false);
  const game = useRef(new Chess()),
    engine = useRef<StockfishClient | null>(null),
    controller = useRef(new AbortController()),
    lock = useRef(false),
    finished = useRef(false);
  const [fen, setFen] = useState(() => new Chess().fen()),
    [last, setLast] = useState<Move>(),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [started, setStarted] = useState(false),
    [color, setColor] = useState<"w" | "b">("w"),
    [progress, setProgress] = useState(initialOpponent),
    [level, setLevel] = useState(2),
    [message, setMessage] = useState(
      "Choose your starting challenge. This is a practice level, not Elo.",
    ),
    [assisted, setAssisted] = useState(false),
    [over, setOver] = useState(false),
    [reviewMoves, setReviewMoves] = useState(true);
  const assist = useRef(false),
    playingColor = useRef<"w" | "b">("w"),
    gameLevel = useRef(2);
  useEffect(() => {
    controller.current = new AbortController();
    const abortController = controller.current;
    let alive = true;
    void database()
      .then(async (db) =>
        Promise.all([
          db.get("settings", "opponent"),
          db.get("settings", "coachPrefs"),
        ]),
      )
      .then(([raw, prefs]) => {
        if (alive) {
          const p = parseOpponent(raw);
          setProgress(p);
          setLevel(p.level);
          setLearner(
            typeof prefs?.username === "string" ? prefs.username : "GMNille",
          );
          setReady(true);
        }
      })
      .catch(() => setMessage("Could not load coach history."));
    return () => {
      alive = false;
      abortController.abort();
      engine.current?.close();
    };
  }, []);
  const client = () =>
    engine.current ?? (engine.current = new StockfishClient());
  async function publish(move?: Move) {
    setFen(game.current.fen());
    if (move) setLast(move);
    if (!game.current.isGameOver() || finished.current) return;
    finished.current = true;
    setOver(true);
    const win = game.current.isCheckmate()
      ? game.current.turn() !== playingColor.current
      : false;
    const result = game.current.isCheckmate() ? (win ? 1 : 0) : 0.5;
    const text = game.current.isCheckmate()
      ? win
        ? "You won by checkmate."
        : "Coach won by checkmate."
      : "Draw.";
    setMessage(
      `${text} ${assist.current ? "Assisted game: challenge stays unchanged." : "Challenge adapts from your recent completed games."}`,
    );
    const db = await database(),
      tx = db.transaction("settings", "readwrite");
    const current = parseOpponent(await tx.store.get("opponent"));
    const next = adaptOpponent(
      { ...current, level: gameLevel.current },
      result,
      assist.current,
    );
    await tx.store.put(next, "opponent");
    await tx.done;
    setProgress(next);
    game.current.header(
      "White",
      playingColor.current === "w" ? learner : "KnightUp Coach",
      "Black",
      playingColor.current === "b" ? learner : "KnightUp Coach",
      "Date",
      new Date().toISOString().slice(0, 10).replaceAll("-", "."),
      "Result",
      game.current.isCheckmate()
        ? game.current.turn() === "w"
          ? "0-1"
          : "1-0"
        : "1/2-1/2",
    );
    await saveGames(await parseGames(game.current.pgn()));
  }
  async function reply() {
    if (
      game.current.isGameOver() ||
      game.current.turn() === playingColor.current
    )
      return;
    const choices = game.current.moves({ verbose: true });
    let move: Move;
    if (Math.random() < randomMoveChance(gameLevel.current))
      move = game.current.move(
        choices[Math.floor(Math.random() * choices.length)].san,
      );
    else {
      const score = await client().evaluate(
        game.current.fen(),
        controller.current.signal,
        false,
        Math.max(0, (gameLevel.current - 4) * 1.25),
      );
      if (controller.current.signal.aborted) return;
      if (!score.pv[0])
        throw Error("Coach did not return a move. Retry the turn.");
      move = playUci(game.current, score.pv[0]);
    }
    if (controller.current.signal.aborted) return;
    await publish(move);
  }
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await action();
    } catch (e) {
      if (!controller.current.signal.aborted) {
        setMessage(e instanceof Error ? e.message : "Coach unavailable.");
        engine.current?.close();
        engine.current = null;
      }
    } finally {
      lock.current = false;
      if (!controller.current.signal.aborted) setBusy(false);
    }
  }
  function start() {
    playingColor.current = color;
    gameLevel.current = level;
    setStarted(true);
    setMessage("Your move. Select a piece or enter SAN.");
    if (color === "b") void run(reply);
  }
  async function move(san: string) {
    if (!started || over || game.current.turn() !== playingColor.current)
      return;
    await run(async () => {
      let m: Move;
      const before = game.current.fen();
      try {
        m = game.current.move(san);
      } catch {
        setMessage("That move is not legal. Try another square.");
        return;
      }
      setInput("");
      setMessage("Your move. Look for checks, captures and threats.");
      await publish(m);
      let review = "";
      if (reviewMoves && !game.current.isGameOver()) {
        try {
          const score = await client().evaluate(
            before,
            controller.current.signal,
          );
          if (controller.current.signal.aborted) return;
          review = moveFeedback(m.san, legalVariation(before, score.pv));
        } catch {
          if (controller.current.signal.aborted) return;
          engine.current?.close();
          engine.current = null;
          review = `Move review for ${m.san} is unavailable. Continue your game.`;
        }
      }
      await reply();
      if (
        review &&
        !controller.current.signal.aborted &&
        !game.current.isGameOver()
      )
        setMessage(review);
    });
  }
  async function explain() {
    if (!started || over || game.current.turn() !== playingColor.current)
      return;
    await run(async () => {
      assist.current = true;
      setAssisted(true);
      const score = await client().evaluate(
        game.current.fen(),
        controller.current.signal,
      );
      if (controller.current.signal.aborted) return;
      const line = legalVariation(game.current.fen(), score.pv);
      setMessage(
        line.length
          ? `Stockfish suggests ${line[0].san}. Check the forcing continuation: ${line
              .slice(0, 5)
              .map((m) => m.san)
              .join(
                " ",
              )}. ${score.mate !== null ? `Mate score ${score.mate}.` : `Position estimate ${(score.cp ?? 0) / 100} pawns for the side to move.`} This is bounded analysis, not a guarantee.`
          : "No legal continuation available.",
      );
    });
  }
  if (!started)
    return (
      <section className="surface">
        <h1>Play your coach</h1>
        <p>
          A local Stockfish opponent with a beginner move mix at levels 0–4.
          Strength adjusts gradually after at least three unassisted games; the
          most recent eight results guide it. Levels are not Elo ratings.
        </p>
        <p>Games have no clock. Take as long as you need.</p>
        <label>
          <input
            type="checkbox"
            checked={reviewMoves}
            onChange={(e) => setReviewMoves(e.target.checked)}
          />{" "}
          Review my moves with Stockfish
        </label>
        <p>
          {progress.games} completed unassisted games · recommended level{" "}
          {progress.level}
        </p>
        <label>
          Starting challenge{" "}
          <select
            aria-label="Starting challenge"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {Array.from({ length: 21 }, (_, i) => (
              <option key={i} value={i}>
                Level {i}
              </option>
            ))}
          </select>
        </label>
        <label>
          Your color{" "}
          <select
            aria-label="Your color"
            value={color}
            onChange={(e) => setColor(e.target.value as "w" | "b")}
          >
            <option value="w">White</option>
            <option value="b">Black</option>
          </select>
        </label>
        <div className="actions">
          <button className="primary" disabled={!ready} onClick={start}>
            Start coach game
          </button>
          <button onClick={onExit}>Back to practice</button>
        </div>
      </section>
    );
  return (
    <div
      className="lesson-screen play-screen"
      data-compact={height < 500}
      data-input-focused={focused}
    >
      <div className="section-heading">
        <button className="text-button" onClick={onExit}>
          ← Leave game
        </button>
        <span>
          COACH · LEVEL {level}
          {assisted ? " · ASSISTED" : ""}
        </span>
      </div>
      <div className="lesson-tools">
        <button
          className="explain-button"
          disabled={busy || over || new Chess(fen).turn() !== color}
          onClick={() => void explain()}
        >
          Explain
        </button>
        {!over && new Chess(fen).turn() !== color && (
          <button disabled={busy} onClick={() => void run(reply)}>
            Retry coach turn
          </button>
        )}
      </div>
      <div className="lesson-layout">
        <Board
          fen={fen}
          lastMove={last}
          orientation={color}
          disabled={busy || over || new Chess(fen).turn() !== color}
          onMove={(san) => void move(san)}
        />
        <section className="lesson-copy">
          <h1>
            {over
              ? "Game finished"
              : busy
                ? "Coach is thinking…"
                : new Chess(fen).turn() === color
                  ? "Your move"
                  : "Coach to move"}
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void move(input);
            }}
          >
            <label htmlFor="play-san">Your move in English SAN</label>
            <div className="input-row">
              <input
                id="play-san"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy || over || new Chess(fen).turn() !== color}
              />
              <button
                className="primary"
                disabled={
                  busy ||
                  over ||
                  new Chess(fen).turn() !== color ||
                  !input.trim()
                }
              >
                Play move
              </button>
            </div>
          </form>
          <p role="status" className="feedback">
            {message}
          </p>
          {over && <button onClick={onExit}>Finish game</button>}
        </section>
      </div>
    </div>
  );
}
