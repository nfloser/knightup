import { ProfilePage } from "./ProfilePage";
import { InsightsPage } from "./InsightsPage";
import { PracticePage } from "./PracticePage";
import { LearnPage } from "./LearnPage";
import { Knight } from "./Knight";
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
                <LearnPage
                  ready={ready}
                  progress={progress}
                  start={start}
                  next={next}
                />
              )}
              {tab === "Practice" && (
                <PracticePage ready={ready} start={start} />
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
