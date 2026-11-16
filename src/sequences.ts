import { Chess } from "chess.js";
export type Sequence = {
  id: string;
  title: string;
  category: "Openings" | "Endgames" | "Middlegame" | "Foundations";
  color: "w" | "b";
  fen: string;
  moves: string[];
  idea: string;
  plan: string;
  source?: string;
};
import { openingSequences } from "./opening-sequences";
export { openingSequences };
export function sequenceGame(s: Sequence, ply: number) {
  const g = new Chess(s.fen);
  for (const san of s.moves.slice(0, ply)) g.move(san);
  return g;
}
export function expectedMove(s: Sequence, ply: number) {
  const g = sequenceGame(s, ply);
  return g.move(s.moves[ply]).san;
}
import endgames from "./endgame-sequences.json";
import { extendedOpenings } from "./extended-openings";
import { additionalRepertoireLessons } from "./additional-repertoire-lessons";
import { academySequences } from "./academy-paths";
export const sequences: Sequence[] = [
  ...openingSequences,
  ...extendedOpenings,
  ...additionalRepertoireLessons,
  ...academySequences,
  ...(endgames as Sequence[]),
];
