import { Chess } from "chess.js";
import puzzles from "./academy-path-puzzles.json";
import type { Sequence } from "./sequences";

export type AcademyPhase = "foundations" | "middlegame" | "endgame";
type Curated = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  url: string;
  phase: AcademyPhase;
  focus: string;
};

export const academyPathInfo: Record<AcademyPhase, { title: string; description: string }> = {
  foundations: {
    title: "Chess foundations",
    description: "Twenty graduated examples: spotting mate, simple forks, undefended pieces, and back-rank threats.",
  },
  middlegame: {
    title: "Middlegame tactics",
    description: "Twenty practical positions across forks, pins, skewers and discovered attacks.",
  },
  endgame: {
    title: "Endgame decisions",
    description: "Twenty positions on pawn play, active rooks, promotion and passed pawns.",
  },
};

const concept: Record<string, { title: string; intro: string; plan: string }> = {
  mateIn1: {
    title: "Mate in one",
    intro: "Start with candidate checks. A mating move leaves no legal king escape, capture or block.",
    plan: "Check every defensive resource. A check is only checkmate if none remains.",
  },
  fork: {
    title: "Fork two targets",
    intro: "Look for one piece that attacks two targets at the same time; checks can make the fork forcing.",
    plan: "Before committing, verify the forking piece is not immediately capturable.",
  },
  hangingPiece: {
    title: "Find an undefended piece",
    intro: "Scan for attacked pieces without defenders and compare forcing captures.",
    plan: "Count attackers and defenders, then consider the opponent's strongest recapture.",
  },
  backRankMate: {
    title: "Back-rank geometry",
    intro: "A king blocked by its own pawns may have no flight square behind it.",
    plan: "Look for a rook or queen entry, then verify no capture or interposition saves the king.",
  },
  pin: {
    title: "Pin the defender",
    intro: "Look for a piece in front of a more valuable target, especially a king.",
    plan: "Trace the complete file, rank or diagonal and check whether moving the pinned piece is legal.",
  },
  skewer: {
    title: "Skewer the valuable piece",
    intro: "Force the more valuable piece to move so you can win the piece behind it.",
    plan: "Calculate the forced response and identify the second target before playing a check.",
  },
  discoveredAttack: {
    title: "Uncover an attack",
    intro: "Moving one piece can expose the line of a bishop, rook or queen behind it.",
    plan: "Inspect discovered checks and double threats, then test the opponent's forcing response.",
  },
  pawnEndgame: {
    title: "King and pawn race",
    intro: "In pawn endings, every tempo matters. Count pawn moves and king access to the promotion square.",
    plan: "Calculate both sides' forcing pawn pushes before deciding to exchange or activate the king.",
  },
  rookEndgame: {
    title: "Active rook technique",
    intro: "Rook activity, checks and the position of the kings often matter more than a single pawn.",
    plan: "Look for active checking squares and keep the rook from becoming trapped behind your own pawns.",
  },
  promotion: {
    title: "Promote with precision",
    intro: "Check promotion threats and forcing checks. A queen is not always the only legal promotion.",
    plan: "Calculate the opponent's checking and capturing responses after each pawn advance.",
  },
  advancedPawn: {
    title: "Support a passed pawn",
    intro: "A passed pawn can be a powerful asset but only if its promotion square can be reached safely.",
    plan: "Count the moves to promotion and look for checks that change the race.",
  },
};

/** Curated from the shipped CC0 puzzle pack: legal UCI input becomes canonical SAN.
 * The original puzzle's first move is the opponent's setup, not an answer to guess. */
function toSequence(p: Curated, index: number): Sequence {
  const game = new Chess(p.fen);
  const moves = p.moves.map((uci) => {
    const move = game.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length === 5 ? uci[4] : undefined,
    });
    if (!move) throw Error("Invalid source move in " + p.id);
    return move.san;
  });
  const setup = new Chess(p.fen);
  setup.move({
    from: p.moves[0].slice(0, 2),
    to: p.moves[0].slice(2, 4),
    promotion: p.moves[0].length === 5 ? p.moves[0][4] : undefined,
  });
  const focus = concept[p.focus];
  if (!focus) throw Error("Missing authored explanation for " + p.focus);
  return {
    id: "academy-" + p.phase + "-" + p.id,
    title: String(index + 1).padStart(2, "0") + " · " + focus.title,
    category: p.phase === "endgame" ? "Endgames" : p.phase === "middlegame" ? "Middlegame" : "Foundations",
    color: setup.turn(),
    fen: p.fen,
    moves,
    idea: focus.intro,
    plan: focus.plan,
    source: p.url,
  };
}

export const academyPaths: Record<AcademyPhase, Sequence[]> = {
  foundations: [],
  middlegame: [],
  endgame: [],
};
// Arrange the twenty positions in each phase by the source difficulty estimate,
// rather than resetting to easy examples at every motif boundary. The puzzle
// IDs (and therefore local saved progress) remain unchanged.
for (const phase of ["foundations", "middlegame", "endgame"] as const) {
  const graded = (puzzles as Curated[])
    .filter((p) => p.phase === phase)
    .sort((a, b) => a.rating - b.rating || a.id.localeCompare(b.id));
  academyPaths[phase] = graded.map((p, index) => toSequence(p, index));
}
export const academySequences: Sequence[] = Object.values(academyPaths).flat();
