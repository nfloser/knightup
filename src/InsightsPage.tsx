import { lessons } from "./learning";
import { Knight } from "./Knight";
export function InsightsPage({ count }: { count: number }) {
  return (
    <>
      <div className="page-title">
        <p className="eyebrow">PROGRESS YOU CAN TRUST</p>
        <h1>Small steps add up.</h1>
        <p className="lead">Your learning record, saved on this device.</p>
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
          Completion records practice, not a Chess.com rating or verified
          mastery.
        </p>
      </section>
      <section className="surface empty">
        <Knight />
        <div>
          <h2>Your games will tell a deeper story.</h2>
          <p>
            Chess.com import and Stockfish coaching are planned. No games have
            been fetched or analysed. GMNille is the intended default account;
            collection will require your opt-in.
          </p>
        </div>
      </section>
    </>
  );
}
