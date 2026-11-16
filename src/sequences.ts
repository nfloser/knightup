import { Chess } from "chess.js";
export type Sequence = {
  id: string;
  title: string;
  category: "Openings" | "Endgames";
  color: "w" | "b";
  fen: string;
  moves: string[];
  idea: string;
  plan: string;
  source?: string;
};
const opening = (
  id: string,
  title: string,
  color: "w" | "b",
  moves: string,
  idea: string,
  plan: string,
): Sequence => ({
  id,
  title,
  category: "Openings",
  color,
  fen: new Chess().fen(),
  moves: moves.split(" "),
  idea,
  plan,
});
export const openingSequences: Sequence[] = [
  opening(
    "caro-advance",
    "Caro–Kann · against the Advance",
    "b",
    "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 O-O Nc6",
    "White closes the center with e5. Develop the light bishop before ...e6, then challenge the pawn chain with ...c5.",
    "The c5 break attacks d4, the base supporting e5. Develop your knights and make your king safe; do not chase pawns.",
  ),
  opening(
    "caro-exchange",
    "Caro–Kann · against the Exchange",
    "b",
    "e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bd3 Nf6 O-O Bg4",
    "White exchanges on d5. Recapture toward the center, develop naturally and contest the open files.",
    "Black has a healthy center. ...Bg4 develops with pressure on the knight; complete development before attacking.",
  ),
  opening(
    "caro-classical",
    "Caro–Kann · against Nc3",
    "b",
    "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Nf3 Nd7",
    "White defends e4 with a knight. Exchange in the center, develop the bishop with tempo and retreat it safely when attacked.",
    "...Nd7 prepares ...Ngf6. This is one sound repertoire line; other legitimate Caro–Kann systems exist.",
  ),
  opening(
    "caro-panov",
    "Caro–Kann · against the Panov",
    "b",
    "e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 Nc6 Nf3 e6",
    "White challenges the center immediately with c4. Develop and support d5 rather than rushing to win a pawn.",
    "The exchange can leave White with an isolated d-pawn. Develop, castle and put pressure on it; White gains active pieces in return.",
  ),
  opening(
    "caro-two-knights",
    "Caro–Kann · against the Two Knights",
    "b",
    "e4 c6 Nf3 d5 Nc3 Bg4 h3 Bxf3 Qxf3 e6",
    "White develops both knights before playing d4. Challenge the center with ...d5 and develop the bishop outside the pawn chain.",
    "After the exchange, support d5 with ...e6. Complete development and pay attention to White's bishop pair and queen activity.",
  ),
  opening(
    "caro-fantasy",
    "Caro–Kann · against the Fantasy",
    "b",
    "e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 exd4",
    "White supports e4 with f3, accepting a less secure king. Challenge the center immediately instead of chasing an attack.",
    "After ...e5, look at the center and develop with care. White has open lines too; this is a repertoire choice, not a forced win.",
  ),
  opening(
    "vienna-natural",
    "Vienna · against natural development",
    "w",
    "e4 e5 Nc3 Nc6 Bc4 Nf6 d3 Bc5 Nf3 d6 O-O",
    "Against ...Nc6, develop the bishop, support e4 and castle. You are learning a sound setup rather than a forced win.",
    "The f-pawn can become a later attacking lever, but first finish development and inspect the center.",
  ),
  opening(
    "vienna-falkbeer",
    "Vienna · respond to ...Nf6",
    "w",
    "e4 e5 Nc3 Nf6 Bc4 Nc6 d3 Bc5 Nf3 d6 O-O",
    "Black attacks e4 with ...Nf6. Bc4 is a playable developing response; d3 supports the center.",
    "This repertoire chooses a quiet Vienna rather than the gambit. Learn the plan and react to actual threats.",
  ),
  opening(
    "slav-exchange",
    "Slav · against an early exchange",
    "b",
    "d4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Nf3 Nc6 Bf4 Bf5",
    "White exchanges on d5. Recapture with the c-pawn and develop symmetrically while watching for tactical changes.",
    "An equal structure is still a game: develop the bishops, castle and use open files. Do not copy moves blindly.",
  ),
];
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
export const sequences: Sequence[] = [
  ...openingSequences,
  ...(endgames as Sequence[]),
];
