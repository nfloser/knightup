import { Chess, type Move } from "chess.js";
import { sequenceGame, type Sequence } from "./sequences";
import { extendedWalkthroughNotes } from "./extended-walkthrough-notes";

// Notes are keyed by the move just shown (zero-based ply). Missing notes use
// the lesson's authored plan rather than inventing a reason for a move.
const notes: Record<string, Record<number, string>> = {
  "caro-advance": {
    0: "White occupies the center with the e-pawn.",
    1: "Black prepares ...d5 to challenge White's center.",
    2: "White builds a two-pawn center with d4 and e4.",
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
    7: "Develop the knight and control the d4 and e5 squares.",
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
  "caro-two-knights": {
    0: "White starts by occupying the center with e4.",
    1: "Black prepares a central challenge with ...d5.",
    2: "White develops a knight before committing the d-pawn.",
    3: "Black challenges e4 and establishes a pawn on d5.",
    4: "The second knight supports e4; White has not played d4 yet.",
    5: "The bishop pins the f3-knight along the diagonal toward the queen on d1.",
    6: "The h-pawn attacks the bishop and asks it to decide.",
    7: "Black exchanges the bishop for the pinned knight.",
    8: "White's queen recaptures the bishop on f3.",
    9: "The e-pawn supports d5 and opens the dark-squared bishop's diagonal.",
  },
  "caro-fantasy": {
    0: "White claims central space with e4.",
    1: "Black prepares to challenge the center with ...d5.",
    2: "White supports e4 and takes more central space.",
    3: "Black challenges the e4-pawn immediately.",
    4: "The f-pawn supports e4, but its advance also changes White's king safety.",
    5: "Black captures the e4-pawn; White must decide how to recapture.",
    6: "The f-pawn recaptures on e4 and keeps a pawn in the center.",
    7: "Black challenges that pawn and opens the center with ...e5.",
    8: "White develops a knight and attacks the e5-pawn.",
    9: "Black's e-pawn captures on d4; reassess the open center and both kings.",
  },
  "vienna-natural": {
    0: "White opens a path for the queen and bishop while claiming central space.",
    1: "Black meets e4 with a pawn in the center.",
    2: "Nc3 develops a knight, supports e4 and keeps the f-pawn free.",
    3: "Black develops a knight and supports e5.",
    4: "The bishop develops to an active diagonal toward f7.",
    5: "Black's knight develops and attacks e4.",
    6: "d3 supports e4 and opens the dark-squared bishop's diagonal.",
    7: "Black develops the bishop toward White's kingside.",
    8: "White develops the second knight and prepares to castle.",
    9: "Black supports e5 and opens the light-squared bishop's diagonal.",
    10: "White castles to safeguard the king and bring the rook into play.",
  },
  "vienna-falkbeer": {
    0: "White claims central space with e4.",
    1: "Black replies by occupying the center with ...e5.",
    2: "Nc3 supports e4 and leaves the f-pawn available for a later decision.",
    3: "The black knight attacks e4: check the threat before choosing a plan.",
    4: "This quiet repertoire develops the bishop toward f7.",
    5: "Black develops the queenside knight and supports e5.",
    6: "d3 strengthens the e4-pawn and opens a bishop diagonal.",
    7: "Black develops the bishop to an active diagonal.",
    8: "The knight develops toward the center and prepares castling.",
    9: "Black supports e5 with the d-pawn.",
    10: "White castles and connects the kingside rook to the game.",
  },
  "slav-exchange": {
    0: "White claims the center with d4.",
    1: "Black meets the central pawn with ...d5.",
    2: "White challenges d5 with the c-pawn.",
    3: "Black supports d5 with ...c6, the defining Slav structure.",
    4: "White exchanges on d5, opening the c-file.",
    5: "Black recaptures toward the center with the c-pawn.",
    6: "White develops the knight and attacks the pawn on d5.",
    7: "Black develops a knight that also supports d5.",
    8: "White develops the other knight and prepares castling.",
    9: "Black develops the queenside knight and contests central squares.",
    10: "White develops the bishop outside the pawn chain.",
    11: "Black develops the bishop actively before choosing an e-pawn move.",
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
    7: "The queen pressures White's e5-pawn along the e-file.",
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

const openingPrefixes: Record<string, string> = {
  e4: "White claims central space with the e-pawn, opening lines for the bishop and queen.",
  "e4 c6": "Black prepares ...d5 to challenge White's central pawn.",
  "e4 c6 d4": "White builds a two-pawn center, occupying d4 and e4.",
  "e4 c6 d4 d5":
    "Black challenges the e4-pawn. White's next move determines the structure.",
  "e4 e5": "Black answers in the center and opens lines for development.",
  "e4 e5 Nc3":
    "White develops the queenside knight, supports e4 and keeps the f-pawn free.",
  d4: "White claims central space and opens a diagonal for the dark-squared bishop.",
  "d4 d5": "Black meets White's central pawn with a pawn of its own.",
  "d4 Nf6":
    "Black develops a knight while keeping the pawn structure flexible.",
};

/** Explain only facts that can be checked from the resulting chess.js position.
 * Authored per-move notes take priority over this safety-net explanation. */
function explainDisplayedMove(move: Move, after: Chess, plan: string): string {
  const side = move.color === "w" ? "White" : "Black";
  const pieces: Record<string, string> = {
    p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king",
  };
  const piece = pieces[move.piece] ?? "piece";
  const captured = move.captured ? pieces[move.captured] ?? "piece" : null;

  let action: string;
  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    action = side + " castles " + (move.isKingsideCastle() ? "kingside" : "queenside") +
      ". The king and rook change squares together.";
  } else if (move.promotion) {
    action = side + " promotes the pawn to a " + (pieces[move.promotion] ?? "piece") +
      " on " + move.to + ". Promotion changes which piece can move next.";
  } else if (captured) {
    action = side + " captures the opponent's " + captured + " on " + move.to +
      " with a " + piece + ". Recheck possible recaptures and open lines.";
  } else if (move.piece === "p") {
    action = side + " advances a pawn from " + move.from + " to " + move.to +
      ". Check which squares and pawn breaks have changed.";
  } else {
    action = side + " moves the " + piece + " from " + move.from + " to " + move.to +
      ". Identify its new attacks and whether it is defended.";
  }

  if (after.isCheckmate())
    return action + " This is checkmate: the opposing king has no legal reply.";
  if (after.isCheck())
    return action + " This delivers check. Check what legal defensive replies remain.";
  if (after.isStalemate())
    return action + " The opponent has no legal move but is not in check: stalemate.";

  return action + " Study goal: " + plan;
}

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
        : (notes[sequence.id]?.[step - 1] ??
          extendedWalkthroughNotes[sequence.id]?.[step - 1] ??
          (sequence.category === "Openings"
            ? openingPrefixes[sequence.moves.slice(0, step).join(" ")]
            : undefined) ??
          (lastMove ? explainDisplayedMove(lastMove, game, sequence.plan) : sequence.plan)),
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
