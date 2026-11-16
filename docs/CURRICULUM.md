# Original chess academy

18 short instructional lessons cover piece movement, check/mate/stalemate, loose pieces, forks/pins/skewers/discovered attacks, opening development, king safety/castling, Caro–Kann and Vienna ideas, king/pawn play, back-rank mate, promotion/underpromotion, SAN disambiguation/en passant, PGN/FEN and a candidate-move routine. Each lesson teaches an idea and thinking habit before two legal board exercises. Content is original, with no copied paid course material.

Curriculum bands guide ordering; they are not estimated personal ratings. Opening moves are choices, not forced engine best moves. Specified-destination teaching exercises may accept only their stated move even when other legal moves exist. Every authored FEN/SAN pair is checked against chess.js in tests. The separate random puzzle library handles complete source variations.

First unassisted completions persist under stable course exercise IDs in IndexedDB. Due reviews and the next incomplete course drive the recommendation. Assistance schedules a shorter review and earns no first-solve reward. Deployments retain existing notation IDs and progress. End-to-end checks cover teach→practice→persisted recall.

## Connected academy study paths

Three additional connected paths use **20 curated distinct positions each**
(60 total) from the already-shipped CC0 Lichess puzzle source:

- Chess foundations: mate in one, forks, undefended pieces and back-rank patterns.
- Middlegame tactics: forks, pins, skewers and discovered attacks.
- Endgame decisions: pawn endings, rook endings, promotions and passed pawns.

Puzzles are selected deterministically with multiple difficulty levels and
retained source URLs. Their original UCI continuations are replayed through
chess.js into canonical SAN, with the first move shown as the opponent setup.
Learners are shown a move-by-move board demonstration and concept explanation
before they practise the whole supplied continuation. Guided course progression
reuses the existing persisted mastery, assistance grading, completion bar and
review queue. No saved record IDs from earlier versions change.

**Important scope distinction:** these are three *phase-level* courses of 20
positions each; they do not make each individual short Academy topic a
20-lesson course. Some individual Academy subjects still contain two authored
intro exercises. Tactical themes are broad teaching categories, not claims
that the engine's choice is forced in all similar positions. The original
puzzle solutions are source continuations, not independently Stockfish-reviewed
teaching lines. Finer-grained pedagogy and engine screening remain distinct
quality tasks.

## Expanded individual Academy topic practice

All 18 existing Academy topic cards now offer **20 board exercises each**
(360 total): the original two introduction exercises, with unchanged stable
progress IDs, plus 18 new applications per topic. Sixteen topics draw on 288
distinct, attributed CC0 Lichess source positions; Caro–Kann and Vienna reuse
18 unique repertoire-decision positions each from their original guided
opening course. The added examples are legal single-position recall exercises,
not 18 additional full-length lecture videos. The original topic introduction
teaches the idea before the exercise stream.

For motifs where a CC0 dataset does not exactly cover the name of an existing
topic, exercises deliberately broaden the associated thinking habit:
king safety includes defensive moves besides castling, and notation includes
accurate SAN in real positions rather than exclusively disambiguation or en
passant. These topics still need deeper dedicated instruction and specifically
authored demonstrations. Completing a puzzle means reproducing a documented
source continuation, **not** proving that other legal moves are mistakes.

The three phase-level 20-unit guided courses remain separate from these
individual topic exercises; they offer walkthrough-first complete puzzle
continuations, whereas a topic exercise asks for the first response after the
source setup move. Content remains subject to engine quality review, especially
for opening choices and broader abstract teaching themes.

## Course resumption and tactical screening

For the expanded single-board Academy drills, opening a topic now selects its
first exercise not yet recalled cleanly. A topic with all twenty clean records
starts again at its first example for review. The persisted ledger is read
before the practice button becomes available. This preserves earlier mastery
rather than forcing learners to repeat the first two examples every time.

Browser CI additionally runs the shipped Stockfish 19 WASM engine over one
late-lesson learner decision from each of the eighty opening examples, comparing
a bounded before/after centipawn estimate. The JSON audit report is saved in
test-results. The check is a deliberately shallow **gross-blunder screen**:
other legal moves may be equally good, sacrifice evaluations can be unstable,
and it is not a complete move-by-move engine endorsement of 80 variations.

## Graduated ordering of phase-level study paths

The foundations, middlegame and endgame **guided phase paths** now sort their
existing twenty attributed Lichess positions by increasing source puzzle
rating, using the puzzle ID for deterministic ties. This avoids the previous
difficulty resets between successive five-position motif blocks; concepts
recur at different challenge levels. Ratings are third-party approximate
puzzle difficulty indicators, not estimated user Elo, and a higher number
does not guarantee that an individual learner will find a particular task
harder.

All source puzzles, SAN continuations, stable IDs, and local clean/due progress
records remain unchanged. Only presentation and course-run order change.
Learners can still choose any individual position from the Explore list.
