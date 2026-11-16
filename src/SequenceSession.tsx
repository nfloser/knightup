import { additionalRepertoireLessons } from "./additional-repertoire-lessons";
import { useEffect, useRef, useState } from "react";
import { remainingCourseSteps } from "./courseRun";
import { Chess } from "chess.js";
import { Board } from "./Board";
import {
  sequences,
  sequenceGame,
  expectedMove,
  type Sequence,
} from "./sequences";
import { loadTraining, recordTraining, emptyTraining } from "./training";
import { useTrainingViewport } from "./useTrainingViewport";
import { hintForMove, walkthroughFrame } from "./walkthrough";
export function SequenceLibrary({
  onStart,
}: {
  onStart: (
    s: Sequence,
    remaining?: Sequence[],
    course?: { total: number; completed: number },
  ) => void;
}) {
  const [training, setTraining] = useState(emptyTraining);
  const [section, setSection] = useState<"Openings" | "Endgames">("Openings");
  const [color, setColor] = useState<"w" | "b">(() =>
    sessionStorage.getItem("knightup-course-color") === "w" ? "w" : "b",
  );
  const [course, setCourse] = useState<string | null>(() =>
    sessionStorage.getItem("knightup-course"),
  );
  const [error, setError] = useState("");
  const [progressReady, setProgressReady] = useState(false);
  useEffect(() => {
    let active = true;
    loadTraining()
      .then((value) => {
        if (active) {
          setTraining(value);
          setProgressReady(true);
        }
      })
      .catch(() => {
        if (active) setError("Could not load course progress.");
      });
    return () => {
      active = false;
    };
  }, []);
  const groups = [
    {
      id: "caro",
      title: "Caro–Kann",
      color: "b",
      ids: [
        "caro-advance",
        "caro-exchange",
        "caro-classical",
        "caro-panov",
        "caro-two-knights",
        "caro-fantasy",
        "caro-advance-c5",
        "caro-classical-nd7",
        "caro-two-knights-order",
        "caro-quiet-d3",
        "caro-c4",
        ...additionalRepertoireLessons.filter((s) => s.id.startsWith("caro-")).map((s) => s.id),
      ],
      description:
        "Build a reliable response to 1.e4: learn the central structure and practise 20 opponent setups, move orders and central responses.",
    },
    {
      id: "slav",
      title: "Slav Defence",
      color: "b",
      ids: ["slav-exchange", "slav-accepted", "slav-solid", "slav-exchange-bf4", "slav-bf5", ...additionalRepertoireLessons.filter((s) => s.id.startsWith("slav-")).map((s) => s.id)],
      description:
        "Study 20 Slav responses, exchanges, development schemes and central pawn decisions.",
    },
    {
      id: "london",
      title: "London System",
      color: "w",
      ids: ["london-classical", "london-fianchetto", "london-c5", "london-nc6", "london-queenside-fianchetto", "london-nf6-c5", "london-mirror-bishop", ...additionalRepertoireLessons.filter((s) => s.id.startsWith("london-")).map((s) => s.id)],
      description:
        "Develop the bishop early and practise a solid setup against 20 Black responses and development plans.",
    },
    {
      id: "vienna",
      title: "Vienna Game",
      color: "w",
      ids: [
        "vienna-natural",
        "vienna-falkbeer",
        "vienna-gambit-d5",
        "vienna-gambit-accepted",
        "vienna-f4-nc6",
        "vienna-gambit-nf3",
        "vienna-quiet-f4",
        "vienna-fianchetto",
        ...additionalRepertoireLessons.filter((s) => s.id.startsWith("vienna-")).map((s) => s.id),
      ],
      description:
        "Learn a developing setup and practise 20 quiet and gambit responses, including central breaks.",
    },
  ];
  const selected = groups.find((g) => g.id === course);
  const lessons = selected
    ? selected.ids
        .map((id) => sequences.find((s) => s.id === id))
        .filter((s): s is Sequence => !!s)
    : [];
  const solved = (s: Sequence) =>
    training.records[`course:sequence-${s.id}`]?.firstSolvedAt !== undefined;
  const courseSteps = remainingCourseSteps(
    lessons.map((s) => s.id),
    new Set(lessons.filter(solved).map((s) => s.id)),
  ).map((id) => lessons.find((s) => s.id === id)!);
  const next = courseSteps[0];
  return (
    <section className="academy">
      <div className="section-heading">
        <h2>Study a system</h2>
        <span>GUIDED REPERTOIRES</span>
      </div>
      <p>
        Learn the plan, then practise complete lines against different replies.
        Your clean progress is saved on this device.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="actions" role="group" aria-label="Study categories">
        {(["Openings", "Endgames"] as const).map((item) => (
          <button
            key={item}
            aria-pressed={section === item}
            onClick={() => {
              setSection(item);
              setCourse(null);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {section === "Openings" ? (
        <>
          <div className="actions" role="group" aria-label="Opening color">
            {(["w", "b"] as const).map((side) => (
              <button
                key={side}
                aria-pressed={color === side}
                onClick={() => {
                  setColor(side);
                  setCourse(null);
                  sessionStorage.setItem("knightup-course-color", side);
                  sessionStorage.removeItem("knightup-course");
                }}
              >
                {side === "w" ? "White" : "Black"}
              </button>
            ))}
          </div>
          <p className="eyebrow">
            OPENINGS / {color === "w" ? "WHITE" : "BLACK"}
            {selected ? ` / ${selected.title.toUpperCase()}` : ""}
          </p>
          {!selected ? (
            <div className="course-grid">
              {groups
                .filter((g) => g.color === color)
                .map((g) => (
                  <button
                    className="course-card"
                    key={g.id}
                    onClick={() => {
                      setCourse(g.id);
                      sessionStorage.setItem("knightup-course", g.id);
                    }}
                  >
                    <h3>{g.title}</h3>
                    <p>{g.description}</p>
                    <span>
                      {g.ids.length} training{" "}
                      {g.ids.length === 1 ? "line" : "lines"} →
                    </span>
                  </button>
                ))}
            </div>
          ) : (
            <div className="surface course-reading">
              <button
                className="text-button"
                onClick={() => {
                  setCourse(null);
                  sessionStorage.removeItem("knightup-course");
                }}
              >
                ← All {color === "w" ? "White" : "Black"} openings
              </button>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              {selected.id === "vienna" && (
                <section aria-label="Vienna Game course guide">
                  <h4>1. Develop the queen's knight</h4>
                  <p>
                    After 1.e4 e5 2.Nc3, White supports e4 while keeping the
                    f-pawn free. First identify Black's reply: ...Nc6 and ...Nf6
                    are both common.
                  </p>
                  <h4>2. Choose a plan</h4>
                  <p>
                    The quiet examples develop the bishop, support the center
                    and castle. The gambit examples play f4 against ...Nf6,
                    seeking activity and accepting additional risk to the king.
                  </p>
                  <h4>3. Read Black's response</h4>
                  <p>
                    Against ...d5, the center opens immediately. If Black takes
                    on f4, e5 can attack the knight. The specific continuations
                    are training choices, and Black can deviate earlier.
                  </p>
                  <h4>4. Apply and review</h4>
                  <p>
                    Practise the quiet setups first, then the gambit lines. Look
                    for checks and captures before repeating a memorized move,
                    and revisit lines when they are due.
                  </p>
                </section>
              )}
              {selected.id === "london" && (
                <section aria-label="London System course guide">
                  <h4>1. Develop the bishop</h4>
                  <p>
                    After 1.d4, an early Bf4 develops the dark-squared bishop
                    before e3 can restrict it. Black has several reasonable
                    setups, so observe the response.
                  </p>
                  <h4>2. Build a center</h4>
                  <p>
                    Moves such as e3, Nf3 and sometimes c3 support d4. Against
                    an early ...c5, check the pressure on d4 and b2 before
                    following the setup.
                  </p>
                  <h4>3. Adapt and practise</h4>
                  <p>
                    Finish development and make your king safe. Against a
                    fianchetto, the g7 bishop pressures the center; watch for
                    pawn breaks such as ...c5 or ...e5. Practise each response,
                    then review without assistance.
                  </p>
                </section>
              )}
              {selected.id === "caro" && (
                <section aria-label="Caro–Kann course guide">
                  <h4>1. The starting idea</h4>
                  <p>
                    After 1.e4 c6, Black prepares ...d5 to challenge White's
                    center. When White plays 2.d4, meet it with ...d5. Notice
                    how White responds before choosing a plan.
                  </p>
                  <h4>2. Read the pawn structure</h4>
                  <p>
                    Against the Advance, e5 gains space and Black can challenge
                    d4 with ...c5. In the Exchange, recapture toward the center.
                    In the Panov, c4 challenges d5 and an isolated pawn may
                    appear after exchanges.
                  </p>
                  <h4>3. Develop with a purpose</h4>
                  <p>
                    In the classical and Advance examples, consider developing
                    the light-squared bishop before ...e6 can block it. Against
                    the Two Knights and Fantasy, the position asks different
                    questions: watch the center, king safety and your opponent's
                    threats.
                  </p>
                  <h4>4. Practise, then recall</h4>
                  <p>
                    Work through each response in order. Explain is available
                    when you are stuck; try again without assistance to record a
                    clean recall. Use recommended practice when a line needs
                    review.
                  </p>
                </section>
              )}
              <p>
                {lessons.filter(solved).length} / {lessons.length} lines
                recalled without help. This course currently covers the lines
                shown below; it is not an exhaustive repertoire.
              </p>
              {next && (
                <button
                  className="primary"
                  disabled={!progressReady}
                  onClick={() =>
                    onStart(next, courseSteps.slice(1), {
                      total: lessons.length,
                      completed: lessons.filter(solved).length,
                    })
                  }
                >
                  {lessons.every(solved) ? "Review course" : "Continue course"}{" "}
                  →
                </button>
              )}
              <div className="actions">
                <button
                  onClick={() => {
                    const pick =
                      lessons[Math.floor(Math.random() * lessons.length)];
                    if (pick) onStart(pick);
                  }}
                >
                  Random response →
                </button>
                <button
                  onClick={() => {
                    const ordered = [...lessons].sort((a, b) => {
                      const rank = (item: Sequence) => {
                        const r =
                          training.records[`course:sequence-${item.id}`];
                        return !r ? 1 : r.due <= Date.now() ? 0 : 2;
                      };
                      return rank(a) - rank(b);
                    });
                    if (ordered[0]) onStart(ordered[0]);
                  }}
                >
                  Train a recommended branch →
                </button>
              </div>
              <ol className="path-list">
                {lessons.map((s, i) => (
                  <li key={s.id}>
                    <button className="path-item" onClick={() => onStart(s)}>
                      <span className={`step ${solved(s) ? "done" : ""}`}>
                        {solved(s) ? "✓" : i + 1}
                      </span>
                      <span>
                        <strong>{s.title}</strong>
                        <small>{s.idea}</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="actions">
            <button
              onClick={() => {
                const pool = sequences.filter((s) => s.category === "Endgames");
                const pick = pool[Math.floor(Math.random() * pool.length)];
                if (pick) onStart(pick);
              }}
            >
              Random response →
            </button>
            <button
              onClick={() => {
                const pool = sequences.filter((s) => s.category === "Endgames");
                const rank = (s: Sequence) => {
                  const r = training.records[`course:sequence-${s.id}`];
                  return !r ? 1 : r.due <= Date.now() ? 0 : 2;
                };
                pool.sort(
                  (a, b) =>
                    rank(a) - rank(b) ||
                    (training.records[`course:sequence-${a.id}`]?.box ?? 0) -
                      (training.records[`course:sequence-${b.id}`]?.box ?? 0),
                );
                if (pool[0]) onStart(pool[0]);
              }}
            >
              Train a recommended branch →
            </button>
          </div>
          <div className="course-grid">
            {sequences
              .filter((s) => s.category === "Endgames")
              .map((s) => (
                <button
                  className="course-card"
                  key={s.id}
                  onClick={() => onStart(s)}
                >
                  <span className="eyebrow">
                    ENDGAMES · {s.color === "w" ? "WHITE" : "BLACK"}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.idea}</p>
                  <span>{solved(s) ? "Review" : "Practise"} →</span>
                </button>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
export function SequenceSession({
  sequence,
  onExit,
  onComplete,
  sessionProgress,
}: {
  sequence: Sequence;
  onExit: () => void;
  onComplete?: () => void;
  sessionProgress?: { current: number; total: number; review: boolean };
}) {
  const [ply, setPly] = useState(0),
    [input, setInput] = useState(""),
    [intro, setIntro] = useState(true),
    [demoStep, setDemoStep] = useState(0),
    [feedback, setFeedback] = useState(
      "Watch the opponent and choose your repertoire response.",
    ),
    [assisted, setAssisted] = useState(false),
    [done, setDone] = useState(false),
    [explaining, setExplaining] = useState(false),
    [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState<
    "neutral" | "retry" | "success"
  >("neutral");
  const height = useTrainingViewport(),
    busy = useRef(false),
    token = useRef(0);
  useEffect(() => {
    const generation = ++token.current;
    return () => {
      token.current = generation + 1;
    };
  }, []);
  const game = sequenceGame(sequence, ply),
    turn = game.turn(),
    opponent = turn !== sequence.color && !done;
  useEffect(() => {
    if (intro || done || !opponent) return;
    const timer = setTimeout(() => setPly((p) => p + 1), 450);
    return () => clearTimeout(timer);
  }, [intro, done, opponent, ply]);
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onComplete ?? onExit, 1800);
    return () => clearTimeout(timer);
  }, [done, onComplete, onExit]);
  async function submit(san: string) {
    if (busy.current || intro || done || opponent) return;
    busy.current = true;
    setSaving(true);
    const current = token.current;
    try {
      let normalized: string;
      try {
        normalized = new Chess(game.fen()).move(san).san;
      } catch {
        setFeedbackKind("retry");
        setFeedback("That move is not legal. Check the route and king safety.");
        return;
      }
      if (normalized !== expectedMove(sequence, ply)) {
        setFeedbackKind("retry");
        setAssisted(true);
        await recordTraining(
          `course:sequence-${sequence.id}`,
          "course",
          false,
          true,
        );
        if (current === token.current)
          setFeedback(
            "A different move may be playable. For this repertoire, retry the plan or use Explain.",
          );
        return;
      }
      const next = ply + 1;
      if (next === sequence.moves.length)
        await recordTraining(
          `course:sequence-${sequence.id}`,
          "course",
          true,
          assisted,
        );
      if (current !== token.current) return;
      setInput("");
      setFeedbackKind("success");
      setPly(next);
      setFeedback(
        `${normalized}: ${walkthroughFrame(sequence, next).text}${assisted ? " Assisted recall." : ""}`,
      );
      if (next === sequence.moves.length) {
        setDone(true);
        setFeedback(
          assisted
            ? "Line complete with assistance. It will return for review."
            : "Whole line complete. Well played. Continuing…",
        );
      }
    } catch {
      if (current === token.current)
        setFeedback(
          "Could not save this attempt. Retry when storage is available.",
        );
    } finally {
      busy.current = false;
      if (current === token.current) setSaving(false);
    }
  }
  async function hint() {
    if (intro || done || opponent || busy.current) return;
    busy.current = true;
    setSaving(true);
    setAssisted(true);
    const current = token.current;
    try {
      await recordTraining(
        `course:sequence-${sequence.id}`,
        "course",
        false,
        true,
      );
      if (current === token.current) {
        setFeedbackKind("neutral");
        setFeedback(
          `Plan hint: ${hintForMove(game.fen(), expectedMove(sequence, ply))}`,
        );
      }
    } catch {
      if (current === token.current)
        setFeedback("Could not save this hint. Please check browser storage.");
    } finally {
      busy.current = false;
      if (current === token.current) setSaving(false);
    }
  }
  async function reviewExplanation() {
    if (intro || done || opponent || busy.current) return;
    busy.current = true;
    setSaving(true);
    setAssisted(true);
    const current = token.current;
    try {
      await recordTraining(
        `course:sequence-${sequence.id}`,
        "course",
        false,
        true,
      );
      if (current === token.current) {
        setDemoStep(ply);
        setIntro(true);
      }
    } catch {
      if (current === token.current)
        setFeedback(
          "Could not save this review. Please check browser storage.",
        );
    } finally {
      busy.current = false;
      if (current === token.current) setSaving(false);
    }
  }
  async function explain() {
    if (intro || done || opponent || busy.current) return;
    busy.current = true;
    setSaving(true);
    setAssisted(true);
    const current = token.current;
    const target = expectedMove(sequence, ply);
    try {
      await recordTraining(
        `course:sequence-${sequence.id}`,
        "course",
        false,
        true,
      );
      if (current !== token.current) return;
      setExplaining((v) => !v);
      setFeedbackKind("neutral");
      setFeedback(
        `Train ${target}. ${walkthroughFrame(sequence, ply + 1).text}`,
      );
    } catch {
      if (current === token.current)
        setFeedback(
          "Could not save this reveal. Retry when storage is available.",
        );
    } finally {
      busy.current = false;
      if (current === token.current) setSaving(false);
    }
  }
  if (intro) {
    const frame = walkthroughFrame(sequence, demoStep);
    return (
      <section className="sequence-intro surface">
        <div className="section-heading">
          <button className="text-button" onClick={onExit}>
            ← Learning library
          </button>
          <span>{sequence.category.toUpperCase()} · GUIDED EXPLANATION</span>
        </div>
        <h1>{sequence.title}</h1>
        <div className="walkthrough-layout">
          <Board
            fen={frame.fen}
            orientation={sequence.color}
            lastMove={frame.lastMove}
            disabled
            onMove={() => {}}
          />
          <div className="walkthrough-copy">
            <p className="eyebrow">
              LEARN FIRST · STEP {frame.step} / {sequence.moves.length}
            </p>
            <h2>
              {frame.lastMove
                ? `${frame.lastMove.color === "w" ? "White" : "Black"} plays ${frame.lastMove.san}`
                : "The idea"}
            </h2>
            <p role="status">{frame.text}</p>
            {frame.step === sequence.moves.length && (
              <p>
                <strong>Your plan:</strong> {sequence.plan}
              </p>
            )}
            <p className="small">
              Explore the moves at your own pace. Viewing the explanation does
              not count as solving the exercise. The progress bar includes
              assisted steps; clean recall is tracked separately.
            </p>
            <div className="actions walkthrough-actions">
              <button
                className="secondary-action"
                disabled={frame.step === 0}
                onClick={() => setDemoStep(frame.step - 1)}
              >
                Previous move
              </button>
              <button
                className="secondary-action"
                disabled={frame.step === sequence.moves.length}
                onClick={() => setDemoStep(frame.step + 1)}
              >
                Next move
              </button>
            </div>
            <button className="primary" onClick={() => setIntro(false)}>
              {ply > 0 ? "Resume practice" : "Practise whole line"}
            </button>
            <p className="small">
              You play {sequence.color === "w" ? "White" : "Black"}. In
              practice, the opponent replies automatically and Explain reveals
              the next move.
            </p>
            {sequence.source && (
              <p>
                <a href={sequence.source} target="_blank" rel="noreferrer">
                  Original Lichess position · CC0
                </a>
              </p>
            )}
            <button className="text-button" onClick={onExit}>
              Back to lessons
            </button>
          </div>
        </div>
        {sessionProgress && (
          <CourseSessionProgress {...sessionProgress} fraction={0} />
        )}
      </section>
    );
  }
  return (
    <div
      className="lesson-screen sequence-screen"
      data-compact={height < 500}
      data-input-focused={focused}
    >
      <div className="section-heading">
        <button className="text-button" onClick={onExit}>
          ← Lessons
        </button>
        <span>
          {ply}/{sequence.moves.length} PLIES
        </span>
      </div>
      <div className="lesson-tools">
        <button
          className="explain-button"
          disabled={opponent || done || saving}
          onClick={() => void reviewExplanation()}
        >
          Review lesson
        </button>
        <button
          className="explain-button"
          disabled={opponent || done || saving}
          onClick={() => void hint()}
        >
          Hint
        </button>
        <button
          className="explain-button"
          disabled={opponent || done || saving}
          aria-expanded={explaining}
          onClick={() => void explain()}
        >
          Explain
        </button>
        <span>{sequence.title}</span>
      </div>
      <div className="lesson-layout">
        <Board
          fen={game.fen()}
          orientation={sequence.color}
          lastMove={game.history({ verbose: true }).at(-1)}
          disabled={opponent || done || saving}
          onMove={(san) => void submit(san)}
        />
        <section className="lesson-copy">
          <h1>
            {done
              ? "Line complete"
              : opponent
                ? "Opponent replies…"
                : "Your repertoire move"}
          </h1>
          <p className="lead">
            {sequence.color === "w" ? "White" : "Black"} ·{" "}
            {Math.min(ply + 1, sequence.moves.length)} / {sequence.moves.length}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit(input);
            }}
          >
            <label htmlFor="sequence-san">Your move in English SAN</label>
            <div className="input-row">
              <input
                id="sequence-san"
                value={input}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setInput(e.target.value)}
                disabled={opponent || done || saving}
              />
              <button
                className="primary"
                disabled={opponent || done || saving || !input.trim()}
              >
                Check
              </button>
            </div>
          </form>
          <p className={`feedback ${feedbackKind}`} role="status">
            {feedback}
          </p>
        </section>
      </div>
      {sessionProgress && (
        <CourseSessionProgress
          {...sessionProgress}
          fraction={ply / sequence.moves.length}
        />
      )}
    </div>
  );
}

function CourseSessionProgress({
  current,
  total,
  fraction,
  review,
}: {
  current: number;
  total: number;
  fraction: number;
  review: boolean;
}) {
  return (
    <div className="course-session-progress">
      <span>
        {review ? "Course review" : "Course progress"} · lesson {current} of{" "}
        {total}
      </span>
      <progress
        aria-label="Course progress"
        value={current - 1 + fraction}
        max={total}
      />
    </div>
  );
}
