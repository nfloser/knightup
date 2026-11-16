import { lessons } from "./learning";
export function PracticePage({
  ready,
  start,
}: {
  ready: boolean;
  start: (index: number) => void;
}) {
  return (
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
