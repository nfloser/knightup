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
    7: "Support the center. The bishop is already outside the pawn chain.",
    9: "Challenge d4, the base of White's advanced pawn chain.",
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
