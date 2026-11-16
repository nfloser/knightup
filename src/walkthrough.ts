import { Chess } from "chess.js";
import { sequenceGame, type Sequence } from "./sequences";

// Notes are keyed by the move just shown (zero-based ply). Missing notes use
// the lesson's authored plan rather than inventing a reason for a move.
const notes: Record<string, Record<number, string>> = {
  "fried-liver": {},
  "fried-liver-ne7": {
    15: "Black develops the c6-knight to e7, adding a defender to the knight on d5.",
    16: "d4 claims central space and opens a diagonal for the remaining bishop.",
  },
  "fried-liver-nb4": {
    15: "Black moves the c6-knight to b4, where it can pressure c2.",
    16: "Castle to bring your king to safety and activate the rook; keep an eye on c2.",
    17: "Black plays ...c6, supporting d5 and restricting the bishop on b5.",
    18: "d4 opens the center and a diagonal for the bishop on c1.",
  },
  "two-knights-na5": {
    7: "Black challenges the knight with ...d5; the central pawn can be captured.",
    8: "White captures on d5. Watch Black's next move before choosing a continuation.",
    9: "The knight attacks the bishop on c4. This is a different defense from ...Nxd5.",
    10: "Bb5+ checks the king and develops the bishop away from the threatened square.",
    11: "Black blocks the check with the c-pawn.",
    12: "The d-pawn captures on c6, changing the pawn structure.",
    13: "Black recaptures the pawn on c6 with the b-pawn and attacks the bishop on b5.",
    14: "The bishop retreats to e2, ready to help with development and king safety.",
  },
  "two-knights-traxler": {
    7: "Instead of defending f7, Black plays ...Bc5 and aims the bishop toward f2.",
    8: "The bishop gives check on f7. This is a different idea from sacrificing the knight.",
    9: "The king moves to e7. Check the threats and do not assume the attack wins by force.",
    10: "The bishop retreats to c4, remaining active on the diagonal.",
    11: "Black develops the rook to f8 on the open file.",
    12: "White castles, bringing the king to safety and a rook into play.",
    13: "Black attacks the knight on g5 with the h-pawn.",
    14: "The knight retreats to f3, continuing to develop and guarding central squares.",
  },
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

const friedCommon: Record<number, string> = {
  0: "White occupies the center and opens lines for the bishop and queen.",
  1: "Black answers in the center with ...e5.",
  2: "The knight develops and attacks the e5-pawn.",
  3: "Black develops a knight to defend e5.",
  4: "The bishop develops to c4, pointing toward f7.",
  5: "Black develops the other knight and attacks e4: this is the Two Knights Defense.",
  6: "Ng5 attacks f7 together with the bishop. Black has several ways to respond.",
  7: "Black challenges White in the center with ...d5.",
  8: "White captures the pawn on d5. Black's recapture choice changes the plan.",
  9: "Black recaptures with the knight. This allows the specific sacrifice shown next.",
  10: "White sacrifices the knight on f7, drawing the king out if Black captures it.",
  11: "Black captures the knight. The king is exposed and the knight on d5 can become a target.",
  12: "Qf3+ checks the king and also attacks the knight on d5 along the diagonal.",
  13: "Black moves the king to e6 while keeping the knight defended.",
  14: "Nc3 develops with an attack on the knight on d5. Black can choose different retreats.",
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
          (sequence.id.startsWith("fried-liver") || sequence.id.startsWith("two-knights-")
            ? friedCommon[step - 1]
            : undefined) ??
          (sequence.category === "Openings"
            ? openingPrefixes[sequence.moves.slice(0, step).join(" ")]
            : undefined) ??
          sequence.plan),
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
