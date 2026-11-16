import { useState } from "react";
import { PlayCoach } from "./PlayCoach";
import { lessons } from "./learning";
export function PracticePage({
  ready,
  start,
  onSessionChange,
}: {
  onSessionChange: (active: boolean) => void;
  ready: boolean;
  start: (index: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  if (playing)
    return (
      <PlayCoach
        onExit={() => {
          setPlaying(false);
          onSessionChange(false);
        }}
      />
    );
  return (
    <>
      <div className="page-title">
        <p className="eyebrow">UNDERSTANDING THROUGH REPETITION</p>
        <h1>Make it second nature.</h1>
        <p className="lead">
          Revisit any notation skill. No timer, no pressure.
        </p>
      </div>
      <section className="surface">
        <h2>Your adaptive opponent</h2>
        <p>
          Play a full game against the Stockfish coach. Explain is available
          when you need help.
        </p>
        <button
          className="primary"
          onClick={() => {
            setPlaying(true);
            onSessionChange(true);
          }}
        >
          Play against coach →
        </button>
      </section>
      <div className="practice-list">
        {lessons.map((l, i) => (
          <button key={l.id} onClick={() => start(i)} disabled={!ready}>
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
  );
}
