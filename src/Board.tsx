import { useState } from "react";
import { Chess, type Square } from "chess.js";
const names = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};
export function Board({
  fen,
  onMove,
  disabled,
}: {
  fen: string;
  onMove: (san: string) => void;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<Square | null>(null);
  const [notice, setNotice] = useState("");
  const game = new Chess(fen);
  const targets = selected
    ? game.moves({ square: selected, verbose: true })
    : [];
  function choose(square: Square) {
    if (disabled) return;
    if (selected) {
      const moves = targets.filter((m) => m.to === square);
      if (moves.length) {
        if (moves[0].promotion) {
          setPromotion(square);
          return;
        }
        onMove(moves[0].san);
        setSelected(null);
        setNotice("");
        return;
      }
    }
    const piece = game.get(square);
    setSelected(piece?.color === game.turn() ? square : null);
    setPromotion(null);
    setNotice(
      piece?.color === game.turn()
        ? `${names[piece.type]} on ${square} selected. Choose a destination.`
        : "Select a piece belonging to the side to move.",
    );
  }
  return (
    <div className="board-wrap">
      <div
        className="board"
        role="group"
        aria-label="Chessboard, White at bottom"
      >
        {game
          .board()
          .flat()
          .map((piece, i) => {
            const square = ("abcdefgh"[i % 8] +
              (8 - Math.floor(i / 8))) as Square;
            const target = targets.some((m) => m.to === square);
            return (
              <div key={square} className="square-cell">
                <button
                  disabled={disabled}
                  className={`square ${(Math.floor(i / 8) + (i % 8)) % 2 ? "dark-square" : "light-square"} ${selected === square ? "selected" : ""}`}
                  aria-label={`${square}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${names[piece.type]}` : ""}${target ? " legal destination" : ""}`}
                  aria-pressed={selected === square}
                  onClick={() => choose(square)}
                >
                  {piece ? (
                    <img
                      className="chess-piece"
                      draggable={false}
                      alt=""
                      src={`${import.meta.env.BASE_URL}pieces/${piece.color}${piece.type.toUpperCase()}.svg`}
                    />
                  ) : target ? (
                    <span aria-hidden="true" className="legal-dot" />
                  ) : null}
                </button>
                {i % 8 === 0 && (
                  <small className="rank" aria-hidden="true">
                    {8 - Math.floor(i / 8)}
                  </small>
                )}
                {i >= 56 && (
                  <small className="file" aria-hidden="true">
                    {"abcdefgh"[i % 8]}
                  </small>
                )}
              </div>
            );
          })}
      </div>
      {promotion && (
        <div className="promotion" role="group" aria-label="Promotion piece">
          {(["q", "r", "b", "n"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                const move = game.move({
                  from: selected!,
                  to: promotion,
                  promotion: p,
                });
                onMove(move.san);
                setPromotion(null);
                setSelected(null);
              }}
            >
              Promote to {names[p]}
            </button>
          ))}
        </div>
      )}
      <span className="sr-only" role="status">
        {notice}
      </span>
      <div className="board-caption">
        <span>● {game.turn() === "w" ? "White" : "Black"} to move</span>
        <span>Tap piece → destination</span>
      </div>
    </div>
  );
}
