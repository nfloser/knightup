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
    "fried-liver",
    "Two Knights · the Fried Liver",
    "w",
    "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3",
    "After ...Nxd5, White can sacrifice the knight on f7. The follow-up check attacks the exposed king and puts pressure on d5.",
    "The sacrifice depends on the exact move order. After ...Na5 instead of ...Nxd5, this line does not apply: study that response separately.",
  ),
  opening(
    "two-knights-na5",
    "Two Knights · against ...Na5",
    "w",
    "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2",
    "Black attacks the bishop with ...Na5 rather than recapturing the d-pawn. Check with Bb5+, then follow the resulting exchange.",
    "After the exchanges, retreat the bishop and continue development. Black has active compensation, so check concrete threats rather than assuming a win.",
  ),
  opening(
    "fried-liver-ne7",
    "Fried Liver · knight retreats to e7",
    "w",
    "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Ne7 d4",
    "After the sacrifice and Nc3, Black can reinforce the knight on d5 with ...Ne7. Challenge the center with d4.",
    "Both knights can protect d5. Open lines carefully while the black king is exposed; calculate forcing replies before capturing.",
  ),
  opening(
    "fried-liver-nb4",
    "Fried Liver · knight jumps to b4",
    "w",
    "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Nb4 O-O c6 d4",
    "After Nc3, Black can move the c6-knight to b4. Castle and challenge the center after ...c6 in this example.",
    "Do not assume a mating attack plays itself. The b4-knight can create counterplay; keep the king safe and calculate the opponent's checks.",
  ),
  opening(
    "two-knights-traxler",
    "Two Knights · the Traxler counterattack",
    "w",
    "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5 Bxf7+ Ke7 Bc4 Rf8 O-O h6 Nf3",
    "Black answers Ng5 with ...Bc5, creating threats of its own. The bishop check on f7 is one way to meet this sharp counterattack.",
    "After the king steps away, the bishop retreats and White completes development. The position is tactical: check every forcing move rather than applying the Fried Liver sacrifice automatically.",
  ),
  opening(
    "london-classical",
    "London · against ...d5 and ...e6",
    "w",
    "d4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O O-O",
    "Develop the dark-squared bishop before placing the e-pawn on e3. Black builds a solid center and prepares to castle.",
    "Support d4, develop the kingside and castle. The same setup is not automatic: watch for changes in Black's center and concrete threats.",
  ),
  opening(
    "london-fianchetto",
    "London · against a kingside fianchetto",
    "w",
    "d4 Nf6 Bf4 g6 e3 Bg7 Nf3 d6 Be2 O-O O-O",
    "Black prepares to place a bishop on g7. White builds a flexible center and completes development before making a commitment.",
    "The g7 bishop can pressure d4. Keep the center supported and watch for ...c5 or ...e5 before choosing your next plan.",
  ),
  opening(
    "london-c5",
    "London · against an early ...c5",
    "w",
    "d4 d5 Bf4 c5 e3 Nc6 Nf3 Nf6 c3 e6 Nbd2",
    "Black challenges d4 early with ...c5. Support the center and develop while keeping an eye on the b2 pawn.",
    "A solid c3–d4–e3 structure supports the center, but do not play it without checking captures and threats in the actual position.",
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
    "vienna-gambit-d5",
    "Vienna Gambit · against ...d5",
    "w",
    "e4 e5 Nc3 Nf6 f4 d5 fxe5 Nxe4 Qf3 Nxc3 dxc3 Be7 Bd3 O-O Bf4",
    "After 3.f4, Black challenges the center with ...d5 rather than taking the pawn. Capture on e5, then respond to the knight's entry.",
    "The queen move attacks the knight on e4. If Black exchanges on c3, recapture toward the center and finish development; watch for concrete threats.",
  ),
  opening(
    "vienna-gambit-accepted",
    "Vienna Gambit · if Black takes on f4",
    "w",
    "e4 e5 Nc3 Nf6 f4 exf4 e5 Qe7 Qe2 Ng8 d4 d6 Bxf4",
    "Black accepts the gambit pawn. The e5 advance attacks the knight and gains space; stay alert to checks and queen threats.",
    "In this example Qe2 meets ...Qe7 and supports the center. Develop and recover the pawn only when the position allows it.",
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
