import { Chess } from "chess.js";
import type { Lesson } from "./learning";
import topicalPuzzles from "./academy-topic-puzzles.json";
import { sequences, sequenceGame, expectedMove } from "./sequences";

type SourcePuzzle = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  url: string;
  topic: string;
  focus: string;
};

const teaching: Record<string, { objective: string; reasoning: string }> = {
  pieces: {
    objective: "Scan which pieces can reach useful squares and find the forcing move in this position.",
    reasoning: "Every piece has a legal movement pattern. Before selecting a destination, check its route and who protects the target.",
  },
  checks: {
    objective: "Find a checkmate in one move. Make sure there is no king escape.",
    reasoning: "Checkmate requires a check with no legal defense. Verify the king cannot capture, block, or move away.",
  },
  "loose-pieces": {
    objective: "Inspect captures and identify a vulnerable piece or favorable trade.",
    reasoning: "A piece without adequate defenders is a tactical target. Check all countercaptures.",
  },
  forks: {
    objective: "Find the tactical move that attacks more than one target.",
    reasoning: "A fork works when a single piece attacks two targets. Check whether it is safe from immediate capture.",
  },
  pins: {
    objective: "Look along ranks, files and diagonals for a pinned piece or a move that exploits one.",
    reasoning: "A pinned piece cannot move freely without exposing a valuable piece behind it.",
  },
  skewers: {
    objective: "Find a forcing line attack where a valuable piece hides a second target.",
    reasoning: "In a skewer the front piece must move, exposing the piece behind it.",
  },
  discovery: {
    objective: "Look for a move that uncovers a line attack by a bishop, rook or queen.",
    reasoning: "A discovered attack can create two threats: from the moving piece and from the piece behind it.",
  },
  development: {
    objective: "Study the tactical opening position and find a useful continuation.",
    reasoning: "Opening plans should develop pieces, contest the center and keep the king safe, without ignoring concrete threats.",
  },
  castle: {
    objective: "Use king safety and forcing threats to find the defensive response.",
    reasoning: "Castling is one way to secure a king, but checks, escapes and threat prevention are also essential king-safety skills.",
  },
  "endgame-king": {
    objective: "Calculate a pawn endgame continuation with both kings and promotion races in mind.",
    reasoning: "The active king helps passed pawns. Count tempos and opposition, then verify the other side's pawn threats.",
  },
  "back-rank": {
    objective: "Look for a decisive back-rank attack against a king trapped by its own pieces.",
    reasoning: "A back-rank pattern is only mate if there is no flight square, capture or block.",
  },
  promotion: {
    objective: "Find the forcing continuation that uses a pawn's promotion potential.",
    reasoning: "Promotion timing is crucial. Consider checks, underpromotions and the enemy king's reach.",
  },
  "notation-plus": {
    objective: "Read the position and write the intended legal move in exact English algebraic notation.",
    reasoning: "SAN describes a move in its legal context. Include captures and check/mate suffixes when necessary.",
  },
  routine: {
    objective: "Apply checks, captures, threats and a final blunder check to choose the tactic.",
    reasoning: "A candidate is only justified after examining the opponent's most forcing defense.",
  },
  "notation-rank": {
    objective: "Find the intended legal move and write its complete SAN, including any disambiguation.",
    reasoning: "When several pieces of the same type can reach a target, SAN must distinguish them by file or rank.",
  },
  "game-records": {
    objective: "Reconstruct the position after the last move and find the next move in this real-game continuation.",
    reasoning: "Move records and FEN are position dependent. Replay every move legally; never infer history from a diagram alone.",
  },
};

function firstResponse(p: SourcePuzzle, number: number): Lesson {
  const g = new Chess(p.fen);
  const first = p.moves[0];
  g.move({ from: first.slice(0, 2), to: first.slice(2, 4),
    promotion: first.length === 5 ? first[4] : undefined });
  const fen = g.fen();
  const expected = p.moves[1];
  const response = g.move({
    from: expected.slice(0, 2),
    to: expected.slice(2, 4),
    promotion: expected.length === 5 ? expected[4] : undefined,
  });
  if (!response) throw Error("Invalid CC0 source line " + p.id);
  const copy = teaching[p.topic];
  if (!copy) throw Error("Missing topic guidance for " + p.topic);
  return {
    id: p.topic + "-cc0-v1-" + p.id,
    title: "Application " + String(number).padStart(2, "0") + " · " + p.focus,
    fen,
    san: response.san,
    instruction: copy.objective,
    explanation: copy.reasoning + " This source continuation plays " + response.san +
      ". Other legal moves may be playable; source: " + p.url,
    hint: "Use the idea from the introduction. Identify checks and captures before quiet moves; replay the last move carefully.",
  };
}

export const additionalAcademyExercises: Record<string, Lesson[]> = {};
for (const p of topicalPuzzles as SourcePuzzle[]) {
  const list = (additionalAcademyExercises[p.topic] ??= []);
  list.push(firstResponse(p, list.length + 3));
}

// Opening-specific exercises must train a repertoire decision, not an
// unrelated random opening puzzle. Use eighteen stable distinct positions
// from the corresponding guided repertoire.
for (const [topic, prefix] of [
  ["caro-kann", "caro-"],
  ["vienna", "vienna-"],
] as const) {
  const used = new Set<string>();
  const examples = sequences.filter((s) => s.id.startsWith(prefix))
    .filter((s) => {
      const fen = sequenceGame(s, s.moves.length - 1).fen();
      if (used.has(fen)) return false;
      used.add(fen);
      return true;
    }).slice(0, 18);
  if (examples.length !== 18) throw Error("Too few distinct opening decisions for " + topic);
  additionalAcademyExercises[topic] = examples.map((s, index) => {
    const ply = s.moves.length - 1;
    const fen = sequenceGame(s, ply).fen();
    const san = expectedMove(s, ply);
    return {
      id: topic + "-repertoire-v1-" + s.id,
      title: "Repertoire decision " + String(index + 3).padStart(2, "0"),
      fen,
      san,
      instruction: "Recognize the opponent's setup and play the studied repertoire response. " + s.idea,
      explanation: s.plan + " The example continues with " + san +
        ". This is a studied repertoire line, not the only legal move.",
      hint: "Revisit the course walkthrough and consider the center, development and king safety before moving.",
    };
  });
}
