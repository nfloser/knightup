import { Chess } from "chess.js";
import { sequenceGame, type Sequence } from "./sequences";

// Notes are keyed by the move just shown (zero-based ply). Missing notes use
// the lesson's authored plan rather than inventing a reason for a move.
const notes: Record<string, Record<number, string>> = {
  "caro-advance": {
    0: "White occupies the center with the e-pawn.",
    1: "Black prepares ...d5 to challenge White's center.",
    2: "White supports e4 with another central pawn.",
    3: "Black challenges e4. Watch how White resolves the tension.",
    4: "White advances and gains space. The d4-pawn now supports e5.",
    5: "Develop the light-squared bishop before ...e6 can restrict it.",
    6: "White develops a knight and prepares to castle.",
    7: "Support the center. The bishop is already outside the pawn chain.",
    8: "White develops the bishop, clearing the way to castle.",
    9: "Challenge d4, the base of White's advanced pawn chain.",
    10: "White castles and brings the king to safety.",
    11: "Develop the queenside knight, adding pressure on the center.",
  },
  "caro-exchange": {
    4: "White exchanges on d5 and opens the center.",
    5: "Recapture with the c-pawn toward the center; Black retains a pawn on d5.",
    7: "Develop the knight and add support to d4's neighboring central squares.",
    9: "Develop the kingside knight and prepare castling.",
    11: "Develop the bishop to g4, where it puts pressure on the knight on f3.",
  },
  "caro-classical": {
    4: "The knight on c3 adds support to White's e4-pawn.",
    5: "Exchange in the center by capturing the e4-pawn.",
    6: "White recaptures with the knight, which now occupies e4.",
    7: "Develop the bishop to f5, attacking the knight on e4.",
    8: "The knight moves to g3 and attacks the bishop on f5.",
    9: "Retreat the bishop to g6 rather than leaving it under attack.",
    11: "Develop the knight to d7, preparing to bring the other knight into play.",
  },
  "caro-panov": {
    4: "White exchanges the central pawn on d5.",
    5: "Recapture toward the center with the c-pawn.",
    6: "White immediately challenges d5 with the c-pawn: this is the Panov setup.",
    7: "Develop a knight and continue contesting the center.",
    9: "Develop the queenside knight and support d4 and e5.",
    11: "The e-pawn supports d5 and opens a path for Black's dark-squared bishop.",
  },
  "london-c5": {
    2: "Develop the bishop outside the pawn chain before playing e3.",
    3: "Black challenges White's d4-pawn with ...c5.",
    4: "The e-pawn supports d4; still check Black's concrete threats.",
    8: "c3 adds another defender to d4 and creates a solid pawn structure.",
    10: "The b-knight develops to d2; the other knight is already on f3.",
  },
  "london-fianchetto": {
    1: "Black develops a knight and keeps the central pawn structure flexible.",
    2: "Develop the bishop before the e-pawn closes its diagonal.",
    3: "The g-pawn prepares a bishop fianchetto on g7.",
    5: "The bishop on g7 looks along the long diagonal toward White's center.",
    8: "Develop the bishop and prepare to castle.",
    10: "Castle; the king is safer and the rook enters the game.",
  },
  "vienna-gambit-accepted": {
    2: "Nc3 develops a knight while leaving the f-pawn free.",
    3: "Black's knight attacks the e4-pawn.",
    4: "f4 offers the f-pawn to challenge Black's center and seek activity.",
    5: "Black accepts the pawn; look for a forcing response before recapturing.",
    6: "Advance e5, gaining space and attacking the knight on f6.",
    7: "The queen checks White's central advance and attacks the e5-pawn.",
    8: "Qe2 supports the e5-pawn along the e-file.",
    10: "d4 claims space in the center and opens the bishop's diagonal.",
    12: "The bishop recaptures the pawn on f4 along the opened diagonal.",
  },
  "london-classical": {
    0: "White claims central space with d4.",
    2: "Develop the dark-squared bishop before e3 can block its diagonal.",
    4: "Support d4 and open the diagonal for the other bishop.",
    6: "Develop a knight and prepare to castle.",
    8: "Develop toward the kingside while keeping the center supported.",
    10: "Castle to bring the king to safety and connect the rook.",
  },
  "vienna-gambit-d5": {
    2: "Nc3 supports e4 and leaves the f-pawn free to advance.",
    4: "The gambit challenges e5 but also opens lines near White's king.",
    5: "Black meets the gambit by challenging the center immediately.",
    6: "Capture on e5 to resolve the central tension.",
    8: "The queen attacks the knight on e4; calculate Black's reply.",
    10: "Recapture toward the center after Black exchanges on c3.",
  },
};

export function walkthroughFrame(sequence: Sequence, requested: number) {
  const step = Math.max(
    0,
    Math.min(sequence.moves.length, Math.floor(requested)),
  );
  const game = sequenceGame(sequence, step);
  const lastMove = game.history({ verbose: true }).at(-1);
  return {
    step,
    fen: game.fen(),
    lastMove,
    text:
      step === 0
        ? sequence.idea
        : (notes[sequence.id]?.[step - 1] ?? sequence.plan),
  };
}

/** Give a useful clue without exposing the selected repertoire move or square. */
export function hintForMove(fen: string, san: string): string {
  const move = new Chess(fen).move(san);
  if (move.san.includes("+") || move.san.includes("#"))
    return "Look for a forcing check.";
  if (move.isCapture())
    return "A capture is part of this line. Which piece can be taken?";
  if (move.isKingsideCastle() || move.isQueensideCastle())
    return "Think about king safety and whether castling is available.";
  if (move.piece === "p")
    return "Consider a pawn move and how it changes the center or pawn structure.";
  const piece = { n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" }[
    move.piece
  ];
  return `Consider a move with your ${piece}.`;
}
