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
