import { Chess } from "chess.js";
import type { Lesson } from "./learning";
import { additionalAcademyExercises } from "./academy-topic-exercises";
export type Course = {
  id: string;
  title: string;
  band: string;
  theme: string;
  sections: { heading: string; text: string }[];
  exercises: Lesson[];
};
function position(...moves: string[]) {
  const g = new Chess();
  moves.forEach((m) => g.move(m));
  return g.fen();
}
function exercise(
  id: string,
  title: string,
  fen: string,
  san: string,
  instruction: string,
  explanation: string,
): Lesson {
  return {
    id,
    title,
    fen,
    san,
    instruction,
    explanation,
    hint: `The target move uses ${san[0] === san[0].toUpperCase() ? san[0] : "a pawn"}. Read the destination in the objective and check its legal path.`,
  };
}
function course(
  id: string,
  title: string,
  band: string,
  theme: string,
  idea: string,
  habit: string,
  items: [string, string, string, string][],
): Course {
  return {
    id,
    title,
    band,
    theme,
    sections: [
      { heading: "The idea", text: idea },
      { heading: "Your thinking habit", text: habit },
    ],
    exercises: items.map(([fen, san, instruction, explanation], i) =>
      exercise(`${id}-v1-${i + 1}`, title, fen, san, instruction, explanation),
    ),
  };
}
const start = new Chess().fen();
export const courses: Course[] = [
  course(
    "pieces",
    "Know your pieces",
    "0–200",
    "basics",
    "Each piece has a different route. Bishops travel diagonally, rooks along files and ranks, and knights jump in an L. A piece may not move through another piece, except the knight. Your king must always remain safe.",
    "Before moving, trace the route and name the destination. In English notation, N means knight and K means king.",
    [
      [
        start,
        "Nf3",
        "Move the g1 knight to f3.",
        "The knight jumps over the starting pawns. Nf3 develops it toward the center.",
      ],
      [
        position("e4", "e5"),
        "Bc4",
        "Move the f1 bishop diagonally to c4.",
        "The pawn move opened the diagonal. Bishops cannot jump through a pawn.",
      ],
    ],
  ),
  course(
    "checks",
    "Check, mate and stalemate",
    "0–200",
    "mateIn1",
    "Check means your king is attacked. You must move the king, capture the checking piece or block the line. Checkmate means none of these defenses works. Stalemate means there is no legal move but the king is not attacked: that is a draw.",
    "When you think you have mate, test every king escape, every capture and every possible block. Never infer mate from a check alone.",
    [
      [
        "4k3/8/8/8/8/8/8/R5K1 w - - 0 1",
        "Re1+",
        "Check the black king by moving the a1 rook to e1.",
        "The rook attacks along the e-file. The + symbol means check; Black still has legal escapes.",
      ],
      [
        "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
        "Qg7#",
        "Move the queen from g6 to g7 to deliver mate.",
        "The queen covers the escape squares and is protected by your king. The # symbol means checkmate.",
      ],
    ],
  ),
  course(
    "loose-pieces",
    "Stop hanging pieces",
    "200–400",
    "hangingPiece",
    "An undefended piece can often be taken for free. Before you make your own threat, inspect what the opponent is attacking. A defender changes an exchange: an opponent who captures may lose a more valuable piece in return.",
    "After choosing a move, imagine it on the board. Ask: what can my opponent capture, and what would I recapture with?",
    [
      [
        "3q2k1/8/8/8/3N4/8/2P5/5RK1 w - - 0 1",
        "c3",
        "Advance the c2 pawn to c3 so it defends the knight on d4.",
        "A pawn on c3 attacks d4. If the queen takes your knight, the pawn can recapture the queen.",
      ],
      [
        "6k1/8/8/8/4q3/8/4R3/6K1 w - - 0 1",
        "Rxe4",
        "Capture the undefended queen on e4 with the e2 rook.",
        "The rook has a clear path. Always inspect captures, but verify that moving the piece does not expose your king.",
      ],
    ],
  ),
  course(
    "forks",
    "One move, two targets",
    "400–600",
    "fork",
    "A fork attacks two targets with one piece. A checking fork is especially forcing because the king must be made safe first. The second target can then be captured. Knights can fork pieces on squares that look far apart.",
    "Find the two targets first, then look for a square that attacks both. Check whether your forking piece can be captured.",
    [
      [
        "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1",
        "Nc7+",
        "Jump the b5 knight to c7, checking the king and attacking a8.",
        "From c7, the knight attacks e8 and a8. The checking king must respond before the rook can be saved.",
      ],
      [
        "3r3k/8/3N4/8/8/8/8/4K3 w - - 0 1",
        "Nf7+",
        "Jump the d6 knight to f7 to fork the h8 king and d8 rook.",
        "The knight attacks both targets. Notice the different starting square: learn the geometry, not just one diagram.",
      ],
    ],
  ),
  course(
    "pins",
    "Recognize a pin",
    "400–600",
    "pin",
    "A pin lines up an attacking piece, a blocking piece and a valuable target behind it. If the rear target is a king, the pinned piece cannot move away and expose check. If it is a queen or rook, moving may be legal but expensive.",
    "Look along files, ranks and diagonals. Name all three pieces in the line before claiming a pin.",
    [
      [
        "4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1",
        "Bb5",
        "Move the f1 bishop to b5 to pin the c6 knight to the king.",
        "The diagonal is b5–c6–d7–e8. The knight blocks the attack on its king.",
      ],
      [
        "4k3/8/4n3/8/8/8/8/R5K1 w - - 0 1",
        "Re1",
        "Move the a1 rook to e1 to pin the e6 knight along the file.",
        "Pins are not only diagonal. The rook, knight and king now share the e-file.",
      ],
    ],
  ),
  course(
    "skewers",
    "Attack the front piece",
    "400–600",
    "skewer",
    "A skewer is the reverse arrangement of a pin: the valuable piece is in front. Attack it, and when it moves, the piece behind becomes exposed. Checks are useful because they force a response.",
    "Trace the entire line beyond the first target. Do not stop calculating as soon as you see check.",
    [
      [
        "4r3/3k4/8/8/8/8/8/5BK1 w - - 0 1",
        "Bb5+",
        "Move the bishop from f1 to b5 to check the king in front of the rook.",
        "The diagonal passes through d7 to e8. The king stands in front of its rook.",
      ],
      [
        "4k3/8/8/8/8/8/6K1/R6q w - - 0 1",
        "Rxh1",
        "Capture the queen on h1 with the a1 rook.",
        "This second diagram is a safety check: there is a free queen, not a skewer. Name the actual opportunity instead of forcing a motif.",
      ],
    ],
  ),
  course(
    "discovery",
    "Uncover an attack",
    "400–600",
    "discoveredAttack",
    "A discovered attack appears when you move a blocking piece out of a line. The piece that moves may create a second threat. A discovered check is forcing, but even a discovered attack on a queen can win material.",
    "Look behind your own pieces. Which bishop or rook would become active if the front piece moved?",
    [
      [
        "q3k3/8/8/8/B7/8/8/R5K1 w - - 0 1",
        "Bb5+",
        "Move the a4 bishop to b5, checking the king and uncovering the a-file.",
        "The bishop checks along the diagonal while the a1 rook attacks the queen on a8.",
      ],
      [
        "q3k3/8/8/8/B7/8/8/R5K1 w - - 0 1",
        "Bc6+",
        "From the same position, move the bishop to c6 with check.",
        "The same rook attack is uncovered. A tactical idea may have more than one legal implementation. This exercise names the intended destination.",
      ],
    ],
  ),
  course(
    "development",
    "An opening plan",
    "200–400",
    "opening",
    "Opening moves should help you control the center, develop minor pieces and make the king safe. Bringing a knight or bishop out often achieves more than moving the same piece repeatedly. Opening principles are guides, not excuses to ignore a concrete threat.",
    "Before memorizing a line, explain what each move does. Ask which piece needs development and what your opponent threatens.",
    [
      [
        position("e4", "e5"),
        "Nf3",
        "Develop the g1 knight to f3 and attack e5.",
        "Nf3 adds a piece to the game and attacks a central pawn. It does not force a particular opening.",
      ],
      [
        position("e4", "e5", "Nf3", "Nc6"),
        "Bc4",
        "Develop the f1 bishop to c4.",
        "The bishop becomes active and clears f1 for castling. You must still inspect Black’s next move.",
      ],
    ],
  ),
  course(
    "castle",
    "Keep the king safe",
    "200–400",
    "kingSafety",
    "Castling moves the king two squares toward a rook, then brings the rook beside it. The king and chosen rook must not have moved, the path must be empty, and the king may not start in check or cross an attacked square.",
    "Before castling, inspect the starting square, crossing square and destination. A rook being attacked does not by itself prevent castling.",
    [
      [
        position("e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"),
        "O-O",
        "Castle White kingside: e1 to g1.",
        "The king moves to g1 and rook to f1. The move is written O-O, using letters O.",
      ],
      [
        "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
        "O-O-O",
        "Castle White queenside: e1 to c1.",
        "Queenside castling is O-O-O. The rook moves to d1; the king does not move all the way to b1.",
      ],
    ],
  ),
  course(
    "caro-kann",
    "Caro–Kann: challenge the center",
    "600–800",
    "opening",
    "Against 1.e4, the Caro–Kann begins with ...c6 to prepare ...d5. Black challenges the center with pawn support. The goal is a sound position and sensible development, not winning by a memorized trap.",
    "When White deviates, return to the purpose of ...d5. Inspect central captures and develop the light-squared bishop before locking it behind ...e6 when appropriate.",
    [
      [
        position("e4"),
        "c6",
        "As Black, prepare ...d5 by playing c7 to c6.",
        "The c-pawn supports a central pawn on d5. This is an opening choice, not a forced best move.",
      ],
      [
        position("e4", "c6", "d4"),
        "d5",
        "Challenge the center with d7 to d5.",
        "Black now asks White to decide the central tension. Different White replies lead to different plans.",
      ],
    ],
  ),
  course(
    "vienna",
    "Vienna: develop with a purpose",
    "600–800",
    "opening",
    "The Vienna begins 1.e4 e5 2.Nc3. White develops a knight and supports the center while keeping the f-pawn flexible. Gambit lines are optional and require concrete calculation: an aggressive move is not automatically a good move.",
    "Learn a stable setup before a sharp branch. At each turn, check the opponent’s central breaks instead of replaying your line blindly.",
    [
      [
        position("e4", "e5"),
        "Nc3",
        "Develop the b1 knight to c3.",
        "Nc3 supports e4 and develops a piece. Nf3 is also a normal opening move; this lesson chooses the Vienna.",
      ],
      [
        position("e4", "e5", "Nc3", "Nc6"),
        "Nf3",
        "Develop the remaining knight from g1 to f3.",
        "This modest development is a sound learning plan. You do not have to play a gambit to use the Vienna.",
      ],
    ],
  ),
  course(
    "endgame-king",
    "Activate the king",
    "600–800",
    "endgame",
    "With fewer pieces, the king becomes an active fighting piece. It can protect pawns, escort a passer and restrict the opposing king. King moves must still respect enemy control; the kings can never stand next to each other.",
    "Count the opponent’s legal king squares. Check pawn races concretely rather than assuming every passed pawn wins.",
    [
      [
        "8/8/4k3/8/8/4K3/4P3/8 w - - 0 1",
        "Kd4",
        "Activate the white king from e3 to d4.",
        "The king moves toward the center while staying outside the black king’s control.",
      ],
      [
        "7k/8/8/8/8/3K4/4P3/8 w - - 0 1",
        "e4",
        "Advance the e2 pawn to e4 while its king supports the advance.",
        "A pawn may advance two squares from its starting rank if both squares are empty. The king protects the advanced pawn.",
      ],
    ],
  ),
  course(
    "back-rank",
    "Use the back rank",
    "400–600",
    "backRankMate",
    "A king behind its own pawns can run out of escape squares. A rook or queen may then deliver mate on the back rank. The defender should notice this pattern before it appears and consider giving the king an escape square when safe.",
    "For an attacking move, check the enemy king’s escapes. For defense, ask whether your own king has a safe flight square.",
    [
      [
        "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
        "Re8#",
        "Move the rook from e1 to e8 to deliver back-rank mate.",
        "The rook controls the eighth rank and Black’s pawns block the seventh-rank escapes.",
      ],
      [
        "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
        "Ra8#",
        "Move the a1 rook to a8 for the same mating pattern.",
        "The important feature is the trapped king and open back rank, not the particular file of your rook.",
      ],
    ],
  ),
  course(
    "promotion",
    "Promote with precision",
    "400–600",
    "promotion",
    "A pawn reaching its last rank must become a queen, rook, bishop or knight. A queen is usually strongest, but a knight may give a useful check and avoid a stalemate in special positions. Decide the promotion piece before you move.",
    "After promotion, check whether the opponent is in check or stalemate. Do not assume a new queen automatically wins.",
    [
      [
        "7k/4P3/8/8/8/8/8/K7 w - - 0 1",
        "e8=Q+",
        "Promote the e7 pawn to a queen on e8, giving check.",
        "The new queen checks along the eighth rank. SAN uses =Q and the check suffix.",
      ],
      [
        "7k/4P3/8/8/8/8/8/K7 w - - 0 1",
        "e8=N",
        "Promote to a knight on e8 to practise underpromotion notation.",
        "This is a notation exercise, not a claim that the knight is the strongest promotion here. =N names the selected piece.",
      ],
    ],
  ),
  course(
    "notation-plus",
    "Read special notation",
    "400–600",
    "notation",
    "Standard algebraic notation identifies a legal move in its position. If two identical pieces can reach the same destination, include the starting file or rank needed to distinguish them. Pawn captures include their starting file.",
    "Reconstruct the position before reading SAN. A notation string without its legal context may be ambiguous.",
    [
      [
        "4k3/8/8/8/8/5N2/8/1N2K3 w - - 0 1",
        "Nbd2",
        "Move the b1 knight to d2 and distinguish it from the f3 knight.",
        "Both knights can reach d2, so Nbd2 includes the b-file.",
      ],
      [
        position("e4", "d5"),
        "exd5",
        "Capture the d5 pawn with the pawn from e4.",
        "The starting file e, capture marker x and destination d5 form exd5.",
      ],
    ],
  ),
  course(
    "routine",
    "A routine before every move",
    "800–1000",
    "calculation",
    "Build a repeatable routine: inspect the opponent’s last move, identify checks/captures/threats for both sides, choose candidate moves, calculate the strongest reply, then do a final blunder check. The routine matters more than playing quickly in an untimed exercise.",
    "Before committing, ask: if I were the opponent, what forcing move would I try? During game review, distinguish a missed tactical fact from an opening preference.",
    [
      [
        "6k1/8/8/8/4q3/8/4R3/6K1 w - - 0 1",
        "Rxe4",
        "Start with forcing captures: take the queen on e4.",
        "A forcing opportunity should not be overlooked while searching for a quiet positional plan.",
      ],
      [
        "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
        "Qg7#",
        "Inspect checks first and finish with Qg7#.",
        "The final blunder check confirms that the queen is protected and all king escapes are covered.",
      ],
    ],
  ),
  course(
    "notation-rank",
    "Disambiguation and en passant",
    "600–800",
    "notation",
    "If two same-color rooks on one file can reach the same square, SAN may need the starting rank. En passant is a different special case: a pawn captures a pawn that just advanced two squares, landing on the square it passed over. The opportunity lasts one reply only.",
    "Use legal moves to resolve ambiguity. For en passant, inspect the immediately preceding pawn move and whether moving your pawn exposes your king.",
    [
      [
        "k7/8/8/8/8/4R3/8/4R1K1 w - - 0 1",
        "R1e2",
        "Move the rook from e1 to e2, distinguishing it from the rook on e3.",
        "The starting rank 1 identifies the rook. Both rooks share a file, so a file letter would not resolve the ambiguity.",
      ],
      [
        position("e4", "a6", "e5", "d5"),
        "exd6",
        "Capture the d5 pawn en passant: move the e5 pawn to d6.",
        "The pawn lands on d6 and the pawn on d5 is removed. SAN still uses an ordinary pawn-capture form.",
      ],
    ],
  ),
  course(
    "game-records",
    "Read a game record",
    "600–800",
    "notation",
    "PGN stores games with headers and a move list such as 1. e4 e5 2. Nf3 Nc6. FEN stores one position: piece placement, side to move, castling rights, en-passant target and two counters. Uppercase pieces in FEN are White; lowercase are Black. A number counts consecutive empty squares.",
    "Replay PGN from its initial position and validate every move. A FEN does not include the game history; never infer previous plans from a single diagram.",
    [
      [
        position("e4", "e5"),
        "Nf3",
        "Continue the PGN 1. e4 e5 with 2. Nf3.",
        "The move number marks White’s turn; Black’s reply follows it. N is the English letter for knight.",
      ],
      [
        position("e4", "e5", "Nf3", "Nc6"),
        "Bb5",
        "Continue the sample record with 3. Bb5.",
        "This is the Ruy Lopez move order. It is a sample opening choice, not a forced continuation.",
      ],
    ],
  ),
];

// Keep the original first two teaching exercises and their saved IDs unchanged.
// Expand each topic with eighteen separately sourced application positions.
for (const item of courses) {
  const additions = additionalAcademyExercises[item.id];
  if (additions) item.exercises.push(...additions);
}
