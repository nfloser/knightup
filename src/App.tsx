import { CourseSession } from "./CourseLibrary";
import type { Course } from "./curriculum";
import { PuzzlesPage } from "./PuzzlesPage";
import { recommend, mergeProgress } from "./adaptive";
import { ProfilePage } from "./ProfilePage";
import { InsightsPage } from "./InsightsPage";
import { PracticePage } from "./PracticePage";
import { LearnPage } from "./LearnPage";
import { Knight } from "./Knight";
import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { emptyProgress, parseProgress, type Progress } from "./learning";
import {
  loadProgress,
  saveProgress,
  loadTheme,
  saveTheme,
  saveAttempt,
} from "./storage";
import { Lesson } from "./Lesson";
const tabs = ["Learn", "Practice", "Puzzles", "Insights", "Profile"] as const;
type Tab = (typeof tabs)[number];
export default function App() {
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<Tab>("Learn");
  const [course, setCourse] = useState<Course | null>(null);
  const [puzzling, setPuzzling] = useState(false);
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
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  function navigate(next: Tab) {
    setTab(next);
    setActive(false);
    setCourse(null);
    setPuzzling(false);
    requestAnimationFrame(() => main.current?.focus());
  }
  function start(index = 0) {
    setInitialIndex(index);
    setActive(true);
    requestAnimationFrame(() => main.current?.focus());
  }
  async function record(id: string, correct: boolean, assisted: boolean) {
    try {
      const saved = await saveAttempt(id, correct, assisted);
      setProgress(saved);
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
      const merged = mergeProgress(progress, parsed);
      const saved = await saveProgress(merged);
      setProgress(saved);
      setMessage("Backup restored. Your existing completions were kept.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not restore backup.",
      );
    }
  }
  const count = progress.completed.length;
  const recommendation = recommend(progress, now);
  const next = recommendation.index;
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
              <span aria-hidden="true">{["◫", "◇", "♟", "▥", "○"][i]}</span>
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
            <span aria-hidden="true">{theme === "light" ? "◐" : "◑"}</span>{" "}
            <span>Switch to {theme === "light" ? "dark" : "light"} mode</span>
          </button>
        </header>
        <main id="main" ref={main} tabIndex={-1}>
          {!active && !puzzling && message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          {!active && !puzzling && needRefresh && (
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
              onAttempt={record}
              onExit={() => {
                setActive(false);
                main.current?.focus();
              }}
            />
          ) : course ? (
            <CourseSession
              course={course}
              onExit={() => {
                setCourse(null);
                setPuzzling(false);
              }}
            />
          ) : (
            <>
              {tab === "Learn" && (
                <LearnPage
                  now={now}
                  onCourseStart={(c) => {
                    setCourse(c);
                    setPuzzling(true);
                  }}
                  ready={ready}
                  progress={progress}
                  start={start}
                  next={next}
                  reason={recommendation.reason}
                />
              )}
              {tab === "Practice" && (
                <PracticePage ready={ready} start={start} />
              )}
              {tab === "Puzzles" && (
                <PuzzlesPage onSessionChange={setPuzzling} />
              )}
              {tab === "Insights" && <InsightsPage count={count} />}
              {tab === "Profile" && (
                <ProfilePage ready={ready} backup={backup} restore={restore} />
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
