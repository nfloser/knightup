import { useEffect, useRef, useState } from "react";
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
export function SequenceLibrary({
  onStart,
}: {
  onStart: (s: Sequence) => void;
}) {
  const [category, setCategory] = useState("Openings"),
    [training, setTraining] = useState(emptyTraining);
  useEffect(() => {
    void loadTraining()
      .then(setTraining)
      .catch(() => {});
  }, []);
  const pool = sequences.filter((s) => s.category === category);
  const adaptive = () => {
    const ordered = [...pool].sort((a, b) => {
      const ar = training.records[`course:sequence-${a.id}`],
        br = training.records[`course:sequence-${b.id}`];
      const priority = (r: typeof ar) => (!r ? 1 : r.due <= Date.now() ? 0 : 2);
      return priority(ar) - priority(br) || (ar?.box ?? 0) - (br?.box ?? 0);
    });
    if (ordered[0]) onStart(ordered[0]);
  };
  return (
    <section className="academy">
      <h2>Play the whole plan</h2>
      <p>
        React to the opponent, then carry the idea through a complete training
        line. These are repertoire choices, not the only good moves.
      </p>
      <div className="actions" role="group" aria-label="Sequence categories">
        {["Openings", "Endgames"].map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick) onStart(pick);
          }}
        >
          Random response →
        </button>
        <button className="primary" onClick={adaptive}>
          Train a recommended branch →
        </button>
      </div>
      <div className="course-grid">
        {pool.map((s) => (
          <button className="course-card" key={s.id} onClick={() => onStart(s)}>
            <span className="eyebrow">
              {s.category} · {s.color === "w" ? "White" : "Black"}
            </span>
            <h3>{s.title}</h3>
            <p>{s.idea}</p>
            <span>
              {training.records[`course:sequence-${s.id}`]?.firstSolvedAt !==
              undefined
                ? "Mastered · review"
                : "Learn this line"}{" "}
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
export function SequenceSession({
  sequence,
  onExit,
}: {
  sequence: Sequence;
  onExit: () => void;
}) {
  const [ply, setPly] = useState(0),
    [input, setInput] = useState(""),
    [intro, setIntro] = useState(true),
    [feedback, setFeedback] = useState(
      "Watch the opponent and choose your repertoire response.",
    ),
    [assisted, setAssisted] = useState(false),
    [done, setDone] = useState(false),
    [explaining, setExplaining] = useState(false),
    [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
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
    const timer = setTimeout(onExit, 1800);
    return () => clearTimeout(timer);
  }, [done, onExit]);
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
        setFeedback("That move is not legal. Check the route and king safety.");
        return;
      }
      if (normalized !== expectedMove(sequence, ply)) {
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
      setPly(next);
      setFeedback(
        `${normalized}: ${moveReason(normalized, sequence)}${assisted ? " Assisted recall." : ""}`,
      );
      if (next === sequence.moves.length) {
        setDone(true);
        setFeedback(
          assisted
            ? "Line complete with assistance. It will return for review."
            : "Whole line complete. Well played. Returning to lessons…",
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
      setFeedback(
        `Train ${target}. ${moveReason(target, sequence)} ${sequence.plan}`,
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
  if (intro)
    return (
      <section className="surface sequence-intro">
        <p className="eyebrow">{sequence.category} · FULL LINE</p>
        <h1>{sequence.title}</h1>
        <h2>Recognize the response</h2>
        <p>{sequence.idea}</p>
        <h2>Your plan</h2>
        <p>{sequence.plan}</p>
        <p>
          You play {sequence.color === "w" ? "White" : "Black"}. Opponent
          replies run automatically. Finish the entire line; Explain reveals the
          next repertoire move and marks the attempt assisted.
        </p>
        {sequence.source && (
          <p>
            <a href={sequence.source} target="_blank" rel="noreferrer">
              Original Lichess position · CC0
            </a>
          </p>
        )}
        <div className="actions">
          <button className="primary" onClick={() => setIntro(false)}>
            Practise whole line
          </button>
          <button onClick={onExit}>Back to lessons</button>
        </div>
      </section>
    );
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
          <p className="feedback" role="status">
            {feedback}
          </p>
        </section>
      </div>
    </div>
  );
}
function moveReason(san: string, s: Sequence) {
  if (san.includes("#")) return "Checkmate: the king has no legal defense.";
  if (san.includes("="))
    return "Promote the pawn and check the resulting threats.";
  if (san.includes("+"))
    return "Check forces the opponent to deal with the king attack.";
  if (san === "O-O" || san === "O-O-O")
    return "Castle to make the king safer and connect your rooks.";
  if (san.includes("x"))
    return "Complete the planned exchange and reassess the center.";
  if (san.startsWith("N") || san.startsWith("B"))
    return "Develop or reposition a minor piece with the plan in mind.";
  return s.category === "Openings"
    ? "Support or challenge the center before launching an attack."
    : s.plan;
}
