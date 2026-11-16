import { Chess } from "chess.js";
export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  url: string;
};
export function uci(move: { from: string; to: string; promotion?: string }) {
  return move.from + move.to + (move.promotion ?? "");
}
export function playUci(game: Chess, text: string) {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(text))
    throw Error("Invalid UCI move");
  return game.move({
    from: text.slice(0, 2),
    to: text.slice(2, 4),
    promotion: text[4],
  });
}
export function validatePuzzle(raw: unknown): Puzzle {
  if (!raw || typeof raw !== "object") throw Error("Invalid puzzle");
  const p = raw as Record<string, unknown>;
  if (
    typeof p.id !== "string" ||
    !/^[a-zA-Z0-9-]{1,80}$/.test(p.id) ||
    typeof p.fen !== "string" ||
    !Array.isArray(p.moves) ||
    p.moves.length < 2 ||
    p.moves.length > 30 ||
    !p.moves.every((m) => typeof m === "string") ||
    typeof p.rating !== "number" ||
    !Number.isFinite(p.rating) ||
    p.rating < 0 ||
    p.rating > 4000 ||
    !Array.isArray(p.themes) ||
    p.themes.length > 30 ||
    !p.themes.every(
      (t) => typeof t === "string" && /^[a-zA-Z0-9]{1,40}$/.test(t),
    ) ||
    typeof p.url !== "string" ||
    !/^https:\/\/lichess\.org\/[a-zA-Z0-9/#-]+$/.test(p.url)
  )
    throw Error("Invalid puzzle");
  const game = new Chess(p.fen);
  for (const move of p.moves) playUci(game, move);
  return {
    id: p.id,
    fen: p.fen,
    moves: [...p.moves],
    rating: p.rating,
    themes: [...p.themes],
    url: p.url,
  };
}
export function preparePuzzle(p: Puzzle) {
  const game = new Chess(p.fen);
  const setup = playUci(game, p.moves[0]);
  return { game, ply: 1, orientation: game.turn(), setup };
}
export function gradePuzzleMove(fen: string, expected: string, san: string) {
  try {
    const game = new Chess(fen);
    const move = game.move(san, { strict: true });
    return { correct: uci(move) === expected, move, fen: game.fen() };
  } catch {
    return { correct: false };
  }
}
export function choosePuzzle(
  pool: Puzzle[],
  filter: { theme: string; min: number; max: number },
  seen: string[],
  random = Math.random,
  priority: string[] = [],
) {
  const eligible = pool.filter(
    (p) =>
      p.rating >= filter.min &&
      p.rating <= filter.max &&
      (filter.theme === "all" || p.themes.includes(filter.theme)),
  );
  const due = priority
    .map((id) => eligible.find((p) => p.id === id))
    .filter((p): p is Puzzle => !!p);
  if (due.length) return due[0];
  const fresh = eligible.filter((p) => !seen.includes(p.id));
  const list = fresh.length ? fresh : eligible;
  return list.length
    ? list[Math.min(list.length - 1, Math.floor(random() * list.length))]
    : undefined;
}
export function solution(p: Puzzle) {
  const { game } = preparePuzzle(p);
  return p.moves.slice(1).map((move) => {
    const result = playUci(game, move);
    return { san: result.san, fen: game.fen(), move: result };
  });
}
export const themeLessons: Record<string, string> = {
  mateIn1:
    "Look for checks. A mating move must leave the king no legal escape, block or capture.",
  mateIn2:
    "Start with forcing checks, then calculate the reply and your final mating move.",
  fork: "Look for a move that attacks two valuable targets at once. Knights are particularly good at forks.",
  pin: "A pinned piece cannot safely move because a more valuable piece or its king is behind it.",
  skewer: "Attack the valuable piece in front to expose the target behind it.",
  hangingPiece:
    "Check which enemy pieces are undefended. Verify that your capture cannot be met by a stronger threat.",
  backRankMate:
    "Look at the king on its back rank and the pawns blocking its escape squares.",
  promotion:
    "Calculate pawn pushes all the way to promotion. Consider checks and underpromotions.",
  endgame:
    "King activity and exact move order matter. Calculate the forcing line before moving.",
  short:
    "Look for checks, captures and immediate threats. Calculate the opponent’s strongest reply.",
};
export function puzzleExplanation(p: Puzzle) {
  return (
    p.themes
      .map((t) => themeLessons[t])
      .filter(Boolean)
      .slice(0, 2)
      .join(" ") ||
    "Calculate checks, captures and threats. Follow the full line, including the opponent’s strongest reply."
  );
}

export async function parsePuzzlePack(data: unknown, signal?: AbortSignal) {
  if (!Array.isArray(data) || data.length > 10000)
    throw Error("Invalid puzzle library");
  const result: Puzzle[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < data.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const puzzle = validatePuzzle(data[i]);
    if (!ids.has(puzzle.id)) {
      result.push(puzzle);
      ids.add(puzzle.id);
    }
    if (i % 100 === 99) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return result;
}
