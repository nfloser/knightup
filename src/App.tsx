import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  lessons,
  emptyProgress,
  complete,
  parseProgress,
  type Progress,
} from "./learning";
import { loadProgress, saveProgress, loadTheme, saveTheme } from "./storage";
import { Lesson } from "./Lesson";
const tabs = ["Learn", "Practice", "Insights", "Profile"] as const;
type Tab = (typeof tabs)[number];
function Knight({ white = false }: { white?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`knight ${white ? "white-knight" : ""}`}
    >
      <path d="M22 85h57v-9H65c0-18 11-25 9-42L57 13l-2 15-18 10-15 20 15 7 14-15c3 11-12 16-11 26H22z" />
      <circle cx="55" cy="38" r="2.5" />
    </svg>
  );
}
export default function App() {
  const [tab, setTab] = useState<Tab>("Learn");
  const [active, setActive] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [message, setMessage] = useState("");
  const main = useRef<HTMLElement>(null);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadProgress(), loadTheme()])
      .then(([p, t]) => {
        if (!cancelled) {
          setProgress(p);
          setTheme(t);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage(
            "Local storage is unavailable or unreadable. Enable browser storage, then reload to save learning progress.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  function navigate(next: Tab) {
    setTab(next);
    setActive(false);
    requestAnimationFrame(() => main.current?.focus());
  }
  function start(index = 0) {
    setInitialIndex(index);
    setActive(true);
    requestAnimationFrame(() => main.current?.focus());
  }
  async function record(id: string) {
    try {
      const next = complete(progress, id);
      await saveProgress(next);
      setProgress(next);
      return true;
    } catch {
      return false;
    }
  }
  function backup() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "knightup-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function restore(file?: File) {
    if (!file) return;
    try {
      if (file.size > 100000) throw Error("Backup is too large.");
      const parsed = parseProgress(JSON.parse(await file.text()));
      const merged = parseProgress({
        version: 1,
        completed: [...new Set([...progress.completed, ...parsed.completed])],
      });
      await saveProgress(merged);
      setProgress(merged);
      setMessage("Backup restored. Your existing completions were kept.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not restore backup.",
      );
    }
  }
  const count = progress.completed.length;
  const next = Math.max(
    0,
    lessons.findIndex((l) => !progress.completed.includes(l.id)),
  );
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Learn");
          }}
        >
          <Knight />
          <span>
            KnightUp<span className="brand-dot">.</span>
          </span>
        </a>
        <p className="sidebar-label">YOUR CHESS, ONE MOVE BETTER</p>
        <nav aria-label="Main navigation">
          {tabs.map((name, i) => (
            <button
              key={name}
              onClick={() => navigate(name)}
              aria-current={tab === name ? "page" : undefined}
            >
              <span aria-hidden="true">{["◫", "◇", "▥", "○"][i]}</span>
              {name}
            </button>
          ))}
        </nav>
        <div className="rail-bottom">
          <div className="rail-piece">
            <Knight />
            <Knight white />
          </div>
          <p>
            Learn smarter.
            <br />
            <strong>Play stronger.</strong>
          </p>
          <span className="small">FOUNDATION · v0.1</span>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <span>YOUR PERSONAL CHESS SPACE</span>
          <button
            className="theme-button"
            onClick={async () => {
              const value = theme === "light" ? "dark" : "light";
              try {
                await saveTheme(value);
                setTheme(value);
              } catch {
                setMessage("Could not save theme preference.");
              }
            }}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "◐" : "◑"}{" "}
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </button>
        </header>
        <main id="main" ref={main} tabIndex={-1}>
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          {needRefresh && (
            <div className="notice">
              An update is ready. Your saved progress stays on this device.{" "}
              <button onClick={() => void updateServiceWorker(true)}>
                Update now
              </button>
            </div>
          )}
          {active ? (
            <Lesson
              initialIndex={initialIndex}
              onComplete={record}
              onExit={() => {
                setActive(false);
                main.current?.focus();
              }}
            />
          ) : (
            <>
              {tab === "Learn" && (
                <>
                  <div className="page-title">
                    <p className="eyebrow">
                      A LITTLE PRACTICE. A STRONGER PLAYER.
                    </p>
                    <h1>Your next good move.</h1>
                    <p className="lead">
                      Build understanding, one small lesson at a time.
                    </p>
                  </div>
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
                        <br className="desktop-break" /> Read the move. Find it.
                        Make it yours.
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
                      <span className="session-length">
                        8 exercises · at your own pace
                      </span>
                    </div>
                    <div className="hero-art">
                      <span className="orbit" />
                      <Knight />
                      <Knight white />
                      <span className="art-label">
                        EVERY MASTER STARTED HERE.
                      </span>
                    </div>
                  </section>
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
              )}
              {tab === "Practice" && (
                <>
                  <div className="page-title">
                    <p className="eyebrow">UNDERSTANDING THROUGH REPETITION</p>
                    <h1>Make it second nature.</h1>
                    <p className="lead">
                      Revisit any notation skill. No timer, no pressure.
                    </p>
                  </div>
                  <div className="practice-list">
                    {lessons.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => start(i)}
                        disabled={!ready}
                      >
                        <span className="eyebrow">
                          DRILL {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2>{l.title}</h2>
                        <p>{l.instruction}</p>
                        <span>Practice →</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {tab === "Insights" && (
                <>
                  <div className="page-title">
                    <p className="eyebrow">PROGRESS YOU CAN TRUST</p>
                    <h1>Small steps add up.</h1>
                    <p className="lead">
                      Your learning record, saved on this device.
                    </p>
                  </div>
                  <section className="surface">
                    <span className="metric">
                      {count}
                      <small> / {lessons.length}</small>
                    </span>
                    <h2>Notation exercises completed</h2>
                    <progress
                      value={count}
                      max={lessons.length}
                      aria-label="Notation completion"
                    />
                    <p>
                      Completion records practice, not a Chess.com rating or
                      verified mastery.
                    </p>
                  </section>
                  <section className="surface empty">
                    <Knight />
                    <div>
                      <h2>Your games will tell a deeper story.</h2>
                      <p>
                        Chess.com import and Stockfish coaching are planned. No
                        games have been fetched or analysed. GMNille is the
                        intended default account; collection will require your
                        opt-in.
                      </p>
                    </div>
                  </section>
                </>
              )}
              {tab === "Profile" && (
                <>
                  <div className="page-title">
                    <p className="eyebrow">YOUR SPACE, YOUR DATA</p>
                    <h1>Keep your progress.</h1>
                    <p className="lead">
                      Private by default. No account required.
                    </p>
                  </div>
                  <section className="surface">
                    <h2>Progress backup</h2>
                    <p>
                      Learning progress lives in this browser. Export a backup
                      before switching devices or clearing browser data. Import
                      merges completed exercises.
                    </p>
                    <div className="actions">
                      <button
                        className="primary"
                        disabled={!ready}
                        onClick={backup}
                      >
                        Export progress
                      </button>
                      <label
                        className={`file-button ${!ready ? "disabled" : ""}`}
                      >
                        Import backup
                        <input
                          type="file"
                          accept="application/json,.json"
                          disabled={!ready}
                          onChange={(e) => {
                            void restore(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </section>
                  <section className="surface">
                    <h2>Install KnightUp</h2>
                    <p>
                      On iPhone: Safari → Share → Add to Home Screen. On Android
                      or desktop: use your browser’s install option. Open once
                      online to prepare offline practice.
                    </p>
                    <p>
                      Updates are offered when available. Local progress is kept
                      across deployments. Cross-device sync is not yet
                      available.
                    </p>
                  </section>
                  <section className="surface">
                    <h2>Privacy</h2>
                    <p>
                      No trackers, credentials or remote coaching uploads.
                      Static hosting may retain standard access logs. Exported
                      backups contain your lesson completions. Store them
                      somewhere you trust.
                    </p>
                  </section>
                </>
              )}
            </>
          )}
        </main>
        <footer>
          KNIGHTUP <span>Better habits. Better chess.</span>
        </footer>
      </div>
    </div>
  );
}
