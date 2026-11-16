import { useEffect, useRef, useState } from "react";
import { Chess, type Color } from "chess.js";
import { database } from "./local-db";
import {
  parseGames,
  loadGames,
  saveGames,
  importChessCom,
  type SavedGame,
} from "./games";
import {
  analyseGame,
  resetReport,
  reportFor,
  loadReports,
  type CoachingReport,
  type CoachingPoint,
} from "./coaching";
import { ENGINE_PROFILE } from "./engine";
import { Board } from "./Board";
import { Lesson } from "./Lesson";
import { recordTraining } from "./training";
export function CoachPage({
  count,
  onSessionChange,
}: {
  count: number;
  onSessionChange: (active: boolean) => void;
}) {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [reports, setReports] = useState<CoachingReport[]>([]);
  const [username, setUsername] = useState("GMNille");
  const [consent, setConsent] = useState(false);
  const [months, setMonths] = useState(2);
  const [pgn, setPgn] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<Color>("w");
  const [selected, setSelected] = useState<CoachingReport | null>(null);
  const [pointGameId, setPointGameId] = useState("");
  const [point, setPoint] = useState<CoachingPoint | null>(null);
  const [drilling, setDrilling] = useState(false);
  const [lineStep, setLineStep] = useState(-1);
  const controller = useRef<AbortController | null>(null);
  const [daily, setDaily] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );
  useEffect(() => {
    let alive = true;
    Promise.all([
      loadGames(),
      loadReports(),
      database().then((db) => db.get("settings", "coachPrefs")),
    ])
      .then(([g, r, prefs]) => {
        if (alive) {
          setGames(g);
          setReports(r);
          if (prefs) {
            setUsername(
              typeof prefs.username === "string" ? prefs.username : "GMNille",
            );
            setConsent(prefs.consent === true);
            setDaily(prefs.daily === true);
          }
          setLoaded(true);
        }
      })
      .catch(() => {
        if (alive) setMessage("Your local game library could not be read.");
      });
    return () => {
      alive = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!point) return;
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
    return () => {
      window.visualViewport?.removeEventListener("resize", resize);
      document.documentElement.style.removeProperty("--training-height");
    };
  }, [point]);
  async function preferences(nextDaily = daily, nextConsent = consent) {
    await (
      await database()
    ).put(
      "settings",
      { username, consent: nextConsent, daily: nextDaily },
      "coachPrefs",
    );
  }
  async function importPgn() {
    if (busy) return;
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const parsed = await parseGames(pgn, abort.signal);
      if (abort.signal.aborted)
        throw new DOMException("Cancelled", "AbortError");
      const saved = await saveGames(parsed);
      setGames(saved);
      setMessage(
        `${parsed.length} valid game(s) imported. Duplicates were merged.`,
      );
      setPgn("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not import PGN.",
      );
    }
    setBusy(false);
  }
  async function sync() {
    if (!consent || busy) return;
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      await preferences();
      const imported = await importChessCom(username, months, abort.signal);
      if (abort.signal.aborted)
        throw new DOMException("Cancelled", "AbortError");
      const saved = await saveGames(imported);
      setGames(saved);
      setMessage(
        `Library updated: ${saved.length} games. Derived coaching stays on this device.`,
      );
    } catch (error) {
      setMessage(
        abort.signal.aborted
          ? "Import cancelled."
          : error instanceof Error
            ? error.message
            : "Could not fetch games.",
      );
    }
    setBusy(false);
  }
  async function analyse(game: SavedGame, perspective?: Color, force = false) {
    if (busy) return;
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    const side =
      perspective ??
      (game.white.toLowerCase() === username.toLowerCase()
        ? "w"
        : game.black.toLowerCase() === username.toLowerCase()
          ? "b"
          : color);
    try {
      if (force) await resetReport(game.id, side);
      setMessage(
        "Loading Stockfish 19. The first analysis downloads its small engine.",
      );
      const report = await analyseGame(game, side, abort.signal, (r) => {
        setSelected(r);
        setMessage(
          `Analysing: ${r.completed.length} / ${r.total} player decisions. You can stop and resume.`,
        );
      });
      setReports(await loadReports());
      setSelected(report);
      setMessage(
        report.complete
          ? "Analysis complete. Review the positions below."
          : "Time budget reached. Continue analysis to process the remaining decisions.",
      );
    } catch (error) {
      setReports(await loadReports());
      setMessage(
        abort.signal.aborted
          ? "Analysis stopped. Completed decisions are saved."
          : error instanceof Error
            ? error.message
            : "Analysis failed; completed decisions are saved.",
      );
    }
    setBusy(false);
  }
  const dailyRun = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    dailyRun.current = async () => {
      if (
        !loaded ||
        !!point ||
        !daily ||
        !consent ||
        busy ||
        document.visibilityState !== "visible"
      )
        return;
      const db = await database();
      const last = await db.get(
        "settings",
        `coachDailyAt:${username.toLowerCase()}`,
      );
      if (typeof last === "number" && Date.now() - last < 86400000) return;
      setBusy(true);
      const abort = new AbortController();
      controller.current = abort;
      try {
        const incoming = await importChessCom(username, 1, abort.signal);
        if (abort.signal.aborted)
          throw new DOMException("Cancelled", "AbortError");
        const all = await saveGames(incoming);
        setGames(all);
        await db.put(
          "settings",
          Date.now(),
          `coachDailyAt:${username.toLowerCase()}`,
        );
        const previous = await loadReports();
        const latest = [...incoming]
          .reverse()
          .find(
            (g) =>
              !previous.some(
                (r) =>
                  r.gameId === g.id &&
                  r.profile === ENGINE_PROFILE &&
                  r.color ===
                    (g.white.toLowerCase() === username.toLowerCase()
                      ? "w"
                      : "b") &&
                  r.complete,
              ),
          );
        if (latest) {
          const side =
            latest.white.toLowerCase() === username.toLowerCase() ? "w" : "b";
          setMessage("Daily local analysis is running.");
          const report = await analyseGame(latest, side, abort.signal, (r) =>
            setSelected(r),
          );
          setSelected(report);
          setReports(await loadReports());
          setMessage(
            report.complete
              ? "Daily coaching updated."
              : "Daily batch saved. Continue manually for remaining decisions.",
          );
        } else setMessage("Your recent games are already analysed.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Daily refresh failed.",
        );
      }
      setBusy(false);
    };
  }, [loaded, daily, consent, busy, username, point]);
  useEffect(() => {
    const timer = window.setInterval(() => void dailyRun.current(), 60000);
    return () => window.clearInterval(timer);
  }, []);
  function open(p: CoachingPoint) {
    setPointGameId(selected?.gameId ?? "");
    setPoint(p);
    setLineStep(-1);
    setDrilling(false);
    onSessionChange(true);
  }
  function close() {
    setPoint(null);
    setDrilling(false);
    onSessionChange(false);
  }
  if (point && drilling)
    return (
      <Lesson
        content={[
          {
            id: `coach-${point.ply}`,
            title: "Find the stronger continuation",
            fen: point.fen,
            san: point.best,
            instruction:
              "Find the move preferred by Stockfish in your game position.",
            explanation:
              point.explanation +
              " Line: " +
              point.line.map((m) => m.san).join(" "),
            hint: `Look at ${point.line[0]?.uci.slice(0, 2)} and calculate forcing moves.`,
          },
        ]}
        label="YOUR GAME · COACH DRILL"
        initialIndex={0}
        onExit={close}
        onAttempt={async (_id, success, assisted) => {
          try {
            await recordTraining(
              `course:coach-${pointGameId.slice(0, 12)}-${point.ply}`,
              "course",
              success,
              assisted,
            );
            return true;
          } catch {
            return false;
          }
        }}
      />
    );
  if (point) {
    const fen = lineStep < 0 ? point.fen : point.line[lineStep].fen;
    return (
      <div
        className="lesson-screen coach-screen"
        data-explaining="true"
        data-compact={height < 500}
      >
        <div className="section-heading">
          <button className="text-button" onClick={close}>
            ← Coaching report
          </button>
          <span>STOCKFISH 19 · MOVE {Math.floor(point.ply / 2) + 1}</span>
        </div>
        <div className="lesson-tools">
          <span>
            You played {point.played} · suggested {point.best}
          </span>
          <button className="explain-button" onClick={() => setDrilling(true)}>
            Practise
          </button>
        </div>
        <div className="lesson-layout">
          <Board
            key={point.ply}
            fen={fen}
            orientation={new Chess(point.fen).turn()}
            disabled
            onMove={() => {}}
          />
          <section className="lesson-copy">
            <h1>Understand the difference.</h1>
            <p className="lead">
              {point.theme === "kingSafety"
                ? "King safety"
                : point.theme === "hangingPiece"
                  ? "Material opportunity"
                  : "Calculation and plans"}
            </p>
            <section className="move-explanation">
              <h2>Why {point.best}?</h2>
              <p>{point.explanation}</p>
              <div className="move-sequence">
                <button
                  onClick={() => setLineStep(-1)}
                  aria-pressed={lineStep < 0}
                >
                  Start
                </button>
                {point.line.map((step, i) => (
                  <button
                    key={i}
                    aria-pressed={lineStep === i}
                    onClick={() => setLineStep(i)}
                  >
                    {step.san}
                  </button>
                ))}
              </div>
              <small>
                Engine: {point.before.depth} ply depth ·{" "}
                {point.before.nodes.toLocaleString()} nodes. Scores are
                estimates; the shown continuation is legal.
              </small>
            </section>
            <button className="primary wide" onClick={() => setDrilling(true)}>
              Practise this position →
            </button>
          </section>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="page-title">
        <p className="eyebrow">YOUR GAMES · REAL EVIDENCE</p>
        <h1>Your chess, understood.</h1>
        <p className="lead">
          Stockfish coaching from completed games. Your private reports stay
          here.
        </p>
      </div>
      <p className="small">
        {count} notation exercises completed · independent of your playing
        rating.
      </p>
      <div className="coach-imports">
        <section className="surface">
          <h2>Bring your games</h2>
          <label htmlFor="pgn-input">Paste PGN</label>
          <textarea
            id="pgn-input"
            rows={5}
            maxLength={2000000}
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder="[Event …] or 1. e4 e5 …"
          />
          <div className="actions">
            <button
              className="primary"
              disabled={!pgn.trim() || busy}
              onClick={() => void importPgn()}
            >
              Import PGN
            </button>
            <label className="file-button">
              Open PGN file
              <input
                type="file"
                accept=".pgn,.txt"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2000000) {
                      setMessage("File exceeds 2 MB.");
                      return;
                    }
                    setPgn(await file.text());
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="small">
            Manual import also supports exported bot games. Only standard chess
            is analysed.
          </p>
        </section>
        <section className="surface">
          <h2>Chess.com public archives</h2>
          <label htmlFor="chess-user">Username</label>
          <input
            id="chess-user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={40}
            disabled={busy}
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(e) => {
                setConsent(e.target.checked);
                void preferences(daily, e.target.checked).catch(() =>
                  setMessage("Could not save consent."),
                );
              }}
            />
            Allow public archive requests for this username
          </label>
          <label>
            History
            <select
              aria-label="Archive history"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              <option value={2}>Latest two available months</option>
              <option value={6}>Latest six months</option>
              <option value={24}>Latest 24 months</option>
            </select>
          </label>
          <button
            className="primary"
            disabled={!consent || busy}
            onClick={() => void sync()}
          >
            Import public games
          </button>
          <label className="check-label">
            <input
              type="checkbox"
              checked={daily}
              disabled={!consent || busy}
              onChange={(e) => {
                setDaily(e.target.checked);
                void preferences(e.target.checked).catch(() =>
                  setMessage("Could not save daily preference."),
                );
              }}
            />
            Daily refresh and one analysis while this page is open
          </label>
          <p className="small">
            No password required. KnightUp is independent and not affiliated
            with Chess.com. This page must stay open for local daily analysis;
            nothing runs after you close it.
          </p>
        </section>
      </div>
      <p role="status" className="notice">
        {message ||
          "Import a game, then choose Analyse. No personal game data has been fetched automatically."}
      </p>
      {busy && (
        <button className="primary" onClick={() => controller.current?.abort()}>
          Stop
        </button>
      )}
      <section className="surface">
        <div className="section-heading">
          <h2>Game library · {games.length}</h2>
          <label>
            Default review side
            <select
              aria-label="Default review side"
              value={color}
              onChange={(e) => setColor(e.target.value as Color)}
            >
              <option value="w">White</option>
              <option value="b">Black</option>
            </select>
          </label>
        </div>
        {!games.length ? (
          <p>Your imported games will appear here.</p>
        ) : (
          <div className="game-list">
            {[...games]
              .reverse()
              .slice(0, 100)
              .map((g) => {
                const side =
                  g.white.toLowerCase() === username.toLowerCase()
                    ? "w"
                    : g.black.toLowerCase() === username.toLowerCase()
                      ? "b"
                      : color;
                const r = reportFor(reports, g.id, side);
                return (
                  <div className="game-row" key={g.id}>
                    <div>
                      <strong>
                        {g.white} vs {g.black}
                      </strong>
                      <small>
                        {g.date} · {g.result} · {g.moves.length} plies
                      </small>
                    </div>
                    <div className="actions">
                      <button disabled={busy} onClick={() => void analyse(g)}>
                        {r?.complete
                          ? "Reopen analysis"
                          : r
                            ? "Continue analysis"
                            : "Analyse game"}
                      </button>
                      {r && (
                        <button disabled={busy} onClick={() => setSelected(r)}>
                          View report
                        </button>
                      )}
                      {r && (
                        <button
                          disabled={busy}
                          onClick={() => void analyse(g, r.color, true)}
                        >
                          Reanalyse
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        <p className="small">
          Showing the latest 100 games. Import is deduplicated; analysis resumes
          saved decisions. Each run stops after two minutes and can be
          continued.
        </p>
      </section>
      {selected && (
        <section className="surface">
          <h2>Coaching report</h2>
          <p>
            {selected.engine} · {selected.color === "w" ? "White" : "Black"}{" "}
            perspective · {selected.completed.length} / {selected.total} player
            decisions · {selected.complete ? "Complete" : "Partial, resumable"}
          </p>
          {selected.points.length ? (
            <div className="report-list">
              {[...selected.points]
                .sort((a, b) => b.loss - a.loss)
                .map((p) => (
                  <button key={p.ply} disabled={busy} onClick={() => open(p)}>
                    <strong>
                      Move {Math.floor(p.ply / 2) + 1}: {p.played} → {p.best}
                    </strong>
                    <span>{p.theme} · inspect the position →</span>
                  </button>
                ))}
            </div>
          ) : (
            <p>
              No major loss was confirmed in the analysed decisions at this
              search budget. This does not establish perfect play.
            </p>
          )}
        </section>
      )}
    </>
  );
}
