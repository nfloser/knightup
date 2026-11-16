import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chess, type Square, type Move } from "chess.js";
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
  lastMove,
  orientation = "w",
}: {
  fen: string;
  onMove: (san: string) => void;
  disabled: boolean;
  lastMove?: Move;
  orientation?: "w" | "b";
}) {
  const board = useRef<HTMLDivElement>(null);
  const motionKey = lastMove
    ? `${lastMove.from}:${lastMove.to}:${lastMove.flags}`
    : "";
  useLayoutEffect(() => {
    if (
      !motionKey ||
      !board.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const [from, to, flags] = motionKey.split(":");
    const moves = [[from, to]];
    if (flags.includes("k")) moves.push(["h" + from[1], "f" + from[1]]);
    if (flags.includes("q")) moves.push(["a" + from[1], "d" + from[1]]);
    const size = board.current.getBoundingClientRect().width / 8;
    const animations = moves.flatMap(([origin, destination]) => {
      const piece = board.current?.querySelector<HTMLElement>(
        `[data-square="${destination}"] .chess-piece`,
      );
      if (!piece) return [];
      const x =
        (origin.charCodeAt(0) - destination.charCodeAt(0)) *
        size *
        (orientation === "w" ? 1 : -1);
      const y =
        (Number(destination[1]) - Number(origin[1])) *
        size *
        (orientation === "w" ? 1 : -1);
      return [
        piece.animate(
          [
            { transform: `translate(${x}px,${y}px)`, zIndex: 2 },
            { transform: "translate(0,0)", zIndex: 2 },
          ],
          { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" },
        ),
      ];
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [motionKey, orientation]);
  const [selected, setSelected] = useState<Square | null>(null);
  const promotionPicker = useRef<HTMLDivElement>(null);
  const [promotion, setPromotion] = useState<Square | null>(null);
  useEffect(() => {
    if (promotion) promotionPicker.current?.querySelector("button")?.focus();
  }, [promotion]);
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
  const squares = game.board().flat();
  if (orientation === "b") squares.reverse();
  return (
    <div className="board-wrap">
      <div
        className="board"
        ref={board}
        role="group"
        aria-label={`Chessboard, ${orientation === "w" ? "White" : "Black"} at bottom`}
      >
        {squares.map((piece, i) => {
          const square = (
            orientation === "w"
              ? "abcdefgh"[i % 8] + (8 - Math.floor(i / 8))
              : "hgfedcba"[i % 8] + (1 + Math.floor(i / 8))
          ) as Square;
          const target = !disabled && targets.some((m) => m.to === square);
          return (
            <div key={square} className="square-cell" data-square={square}>
              <button
                disabled={disabled}
                data-last-move={
                  !!lastMove &&
                  (lastMove.from === square || lastMove.to === square)
                }
                className={`square ${(Math.floor(i / 8) + (i % 8)) % 2 ? "dark-square" : "light-square"} ${selected === square && !disabled ? "selected" : ""} ${lastMove && (lastMove.from === square || lastMove.to === square) ? "last-move" : ""}`}
                aria-label={`${square}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${names[piece.type]}` : ""}${target ? " legal destination" : ""}`}
                aria-pressed={selected === square && !disabled}
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
                  {orientation === "w"
                    ? 8 - Math.floor(i / 8)
                    : 1 + Math.floor(i / 8)}
                </small>
              )}
              {i >= 56 && (
                <small className="file" aria-hidden="true">
                  {(orientation === "w" ? "abcdefgh" : "hgfedcba")[i % 8]}
                </small>
              )}
            </div>
          );
        })}
      </div>
      {promotion && (
        <div
          ref={promotionPicker}
          className="promotion"
          role="group"
          aria-label="Promotion piece"
        >
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
