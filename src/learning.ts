import type { ReviewState } from "./adaptive";
import { Chess } from "chess.js";
export type Lesson = {
  id: string;
  title: string;
  fen: string;
  san: string;
  instruction: string;
  explanation: string;
  hint: string;
};
const start = new Chess().fen();
function after(...moves: string[]) {
  const game = new Chess();
  moves.forEach((m) => game.move(m));
  return game.fen();
}
export const lessons: Lesson[] = [
  {
    id: "notation-v1-pawn",
    title: "A square is a destination",
    fen: start,
    san: "e4",
    instruction: "Move the white pawn from e2 to e4. Or write its notation.",
    explanation:
      "Pawn moves use only the destination square: e4. Files run a–h; ranks run 1–8. White starts on ranks 1 and 2.",
    hint: "Find the e-file, then rank 4. Pawns have no piece letter.",
  },
  {
    id: "notation-v1-knight",
    title: "N is for knight",
    fen: after("e4", "e5"),
    san: "Nf3",
    instruction: "Develop the knight from g1 to f3.",
    explanation:
      "N means knight (K is reserved for the king). Nf3 names the piece and its destination. This develops a piece and attacks e5.",
    hint: "The knight jumps in an L shape. Use N followed by the target square.",
  },
  {
    id: "notation-v1-capture",
    title: "Read a capture",
    fen: after("e4", "d5"),
    san: "exd5",
    instruction: "Capture the black pawn on d5 with your e-pawn.",
    explanation:
      "For a pawn capture, write the starting file, x, and destination: exd5. The x means captures.",
    hint: "A pawn captures one square diagonally. Start the notation with e.",
  },
  {
    id: "notation-v1-castle",
    title: "Two pieces, one move",
    fen: after("e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"),
    san: "O-O",
    instruction: "Castle White kingside. On the board select e1, then g1.",
    explanation:
      "O-O is kingside castling; O-O-O is queenside castling. Use capital letter O. The king cannot castle out of, through, or into check.",
    hint: "Move the king two squares toward the rook. The rook moves automatically.",
  },
  {
    id: "notation-v1-check",
    title: "Announce a check",
    fen: "4k3/8/8/8/8/8/8/R5K1 w - - 0 1",
    san: "Re1+",
    instruction: "Move the rook from a1 to e1 and include the check symbol.",
    explanation:
      "Re1+ puts the black king in check along the e-file. The + is part of complete notation. Check does not necessarily mean checkmate.",
    hint: "R is rook. Append + when the king is attacked.",
  },
  {
    id: "notation-v1-ambiguity",
    title: "Which knight?",
    fen: "4k3/8/8/8/8/5N2/8/1N2K3 w - - 0 1",
    san: "Nbd2",
    instruction: "Move the knight on b1 to d2. Both knights can reach d2.",
    explanation:
      "Nbd2 includes the starting file b because either knight could legally move to d2. Nd2 would be ambiguous.",
    hint: "Add the starting file between N and d2.",
  },
  {
    id: "notation-v1-promotion",
    title: "A pawn becomes a queen",
    fen: "7k/4P3/8/8/8/8/8/K7 w - - 0 1",
    san: "e8=Q+",
    instruction: "Promote the e7 pawn to a queen on e8, giving check.",
    explanation:
      "e8=Q+ means move to e8, promote to a queen, and give check. Promotion can also choose a rook, bishop, or knight.",
    hint: "Write the destination, =Q, then the check symbol.",
  },
  {
    id: "notation-v1-mate",
    title: "The final symbol",
    fen: "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
    san: "Qg7#",
    instruction: "Move the queen from g6 to g7 to deliver checkmate.",
    explanation:
      "Qg7# is checkmate: the queen attacks h8, the king has no safe escape, and the queen is protected by the white king. # means mate.",
    hint: "Use Q, the destination g7, and #.",
  },
];
export function assess(lesson: Lesson, input: string) {
  try {
    const move = new Chess(lesson.fen).move(input.trim(), { strict: true });
    if (move.san !== input.trim())
      return {
        correct: false,
        message: `Use complete standard notation, including any check or mate symbol.`,
      };
    if (move.san !== lesson.san)
      return {
        correct: false,
        message:
          "That move is legal, but does not match this exercise. Read the objective and try again.",
      };
    return { correct: true, message: lesson.explanation };
  } catch {
    return {
      correct: false,
      message:
        "That is not unambiguous legal SAN in this position. Check the piece letter, destination, captures and check symbols.",
    };
  }
}
export type Progress = {
  version: 2;
  completed: string[];
  reviews: Record<string, ReviewState>;
};
export const emptyProgress: Progress = {
  version: 2,
  completed: [],
  reviews: {},
};
export function complete(progress: Progress, id: string): Progress {
  if (!lessons.some((l) => l.id === id)) throw Error("Unknown lesson");
  return { ...progress, completed: [...new Set([...progress.completed, id])] };
}
export function parseProgress(value: unknown): Progress {
  if (
    !value ||
    typeof value !== "object" ||
    !("version" in value) ||
    (value.version !== 1 && value.version !== 2) ||
    !("completed" in value) ||
    !Array.isArray(value.completed) ||
    value.completed.length > lessons.length ||
    !value.completed.every(
      (id) => typeof id === "string" && lessons.some((l) => l.id === id),
    )
  )
    throw Error(
      "This is not a supported KnightUp progress backup. Your existing progress has not changed.",
    );
  const reviews: Record<string, ReviewState> = {};
  if (value.version === 2) {
    if (
      !("reviews" in value) ||
      !value.reviews ||
      typeof value.reviews !== "object" ||
      Array.isArray(value.reviews)
    )
      throw Error("Invalid review history.");
    for (const [id, raw] of Object.entries(value.reviews)) {
      if (!lessons.some((l) => l.id === id) || !raw || typeof raw !== "object")
        throw Error("Invalid review history.");
      const r = raw as Record<string, unknown>;
      if (
        typeof r.id !== "string" ||
        !r.id.length ||
        r.id.length > 100 ||
        typeof r.correct !== "boolean" ||
        typeof r.assisted !== "boolean" ||
        ![r.at, r.due, r.box, r.attempts, r.failures].every(
          (n) => typeof n === "number" && Number.isSafeInteger(n) && n >= 0,
        ) ||
        Number(r.box) > 5 ||
        Number(r.attempts) < 1 ||
        Number(r.attempts) > 1_000_000 ||
        Number(r.failures) > Number(r.attempts) ||
        Number(r.at) > Date.now() + 300_000 ||
        Number(r.due) < Number(r.at) ||
        Number(r.due) > Number(r.at) + 31 * 86_400_000
      )
        throw Error("Invalid review history.");
      reviews[id] = {
        id: r.id,
        at: Number(r.at),
        due: Number(r.due),
        box: Number(r.box),
        attempts: Number(r.attempts),
        failures: Number(r.failures),
        correct: r.correct,
        assisted: r.assisted,
      };
    }
  }
  return { version: 2, completed: [...new Set(value.completed)], reviews };
}
