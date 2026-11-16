# Repertoire branches and endgame lines

Learn now separates Foundations, Openings, Middlegame and Endgames. The existing 18 lessons remain accessible, with original instruction and 36 exercises. Full-line training adds six original opening branches: Caro–Kann Advance, Exchange and Classical; Vienna against ...Nc6 and ...Nf6; Slav Exchange. Each rehearses both the opponent's actions and the learner's repertoire responses, then explains the next plan. These are bounded opening lines, not a claim that a named opening is a unique best response to every position.

Eight endgame sequences use attributed CC0 Lichess puzzle continuations (source URLs stored with each sequence): mate in one, mate in two, promotion and rook endings. Every supplied move is replayed legally in unit tests; mate-labelled lines must end in checkmate. The game engine validates all player moves, and only the supplied repertoire continuation advances the drill. Other legal moves are explicitly described as potentially playable, not automatically bad chess.

Opponent moves animate automatically, and finishing a line returns to lessons automatically. Explain reveals the next move plus its tactical role and plan, marks the whole line assisted, and schedules review. Wrong repertoire choices also count as assisted recall. First clean due completion earns one course credit. Recommended branches prioritize due review, then unseen branches, then weaker mastered branches.

Mobile training uses visualViewport sizing, compact landscape support and 16px move input. Core training copy is at least 14px; board size absorbs the space change. Detailed explanations can scroll inside their own bounded panel while active controls remain on screen.

## Repertoire navigation

Opening practice is grouped by color and repertoire. Caro–Kann currently contains three ordered training lines (Advance, Exchange, and Nc3); Vienna contains two and the Slav one. These are bounded starting courses, not complete coverage of every opponent response. Course progress reuses the existing clean sequence records and survives reloads and learning backups. Continue selects the first line without clean recall; random and due-first branch practice remain available. The current course selection is retained for the browser session. Endgame exercises and the separate academy lessons remain available.

Caro–Kann now includes beginner guidance and six bounded lines: Advance, Exchange, Classical, Panov, Two Knights and Fantasy. The three additional lines were replayed using chess.js and checked with Stockfish 19 lite at depth 10, comparing each Black move with the engine's preferred evaluation from the position. This shallow check supports basic error detection; it does not certify the moves as best or substitute for deep analysis. Not all sidelines are covered.

The London System starter contains three White setups against ...d5/...e6, a kingside fianchetto and an early ...c5. Its original guide explains development and central plans. The chosen White moves were checked at depth 10 with Stockfish 19 lite as a shallow blunder screen, in addition to legal replay; it is not an exhaustive repertoire.

The Vienna starter now distinguishes two quiet setups from two Vienna Gambit continuations following 3.f4, with original guidance on central responses. All lines are limited training choices, not a complete repertoire. New White moves were checked by Stockfish 19 lite at depth 10 as a shallow blunder screen and replayed for legality.

Continue course starts the unfinished lines in their authored order and advances to the next introduction after each completed line. Clean completion is recorded by the existing training store. Assisted work may continue during that session but does not become clean recall; leaving and resuming reconstructs the queue from saved clean records. If every line has clean recall, Continue switches to a full ordered review. Direct line and recommended/random practice still return to the library. Progress must load before a course session can start.

Before a line is practised, the learner can step forwards and backwards through its legal positions on a board. The walkthrough presents the course's original idea and plan, with move-specific teaching notes where authored. Viewing a demonstration does not award mastery. During practice, Hint gives a clue about the type of move without naming its destination; Explain reveals the move. Review lesson opens the walkthrough at the current position and resumes practice there. All three mark the attempt assisted using the existing training record rules. The learner can start practice at any point.

A course displays progress at the bottom, using previously clean units, completed units in this session and the current line's played moves. The denominator is the full course; an all-clean course instead starts a new review progress bar. Walkthrough viewing does not advance practice progress. The indicator includes assisted steps, not just clean mastery; assisted work remains marked separately in the training records.

## Expanded repertoire practice (November 2026)

Seventeen additional original, bounded lines extend the four connected opening courses.
All additions keep stable sequence IDs, local saved progress and the existing
walkthrough → assisted or clean practice → review workflow:

- Caro–Kann: five new responses (immediate ...c5 Advance plan, Classical
  ...Nd7, reversed Two Knights move order, 2.d3, and early c4), eleven total.
- Vienna: four new examples (f4 versus ...Nc6, ...d5 central counter with
  Nf3 development, a delayed f4, and a g3 fianchetto), eight total.
- London: four new setups (...c5/...Nc6, ...b6/...Bb7, ...Nf6/...c5,
  and mirrored bishop development), seven total.
- Slav: four new responses (accepted c4, solid ...e6, Exchange with Bf4,
  and early ...Bf5), five total.

The new sequences provide move-indexed notes for key decisions so the
walkthrough explains the position instead of repeating a generic plan on
every step. The other plies still fall back to the course-level plan.
These short examples broaden practical repertoire coverage but do **not**
constitute complete treatments of all sidelines, tactics, middlegames or
endgames. A single demonstrated line is not necessarily the only good move.

The extended line tests assert canonical legal replay via chess.js,
opponent/learner turn alignment, unique sequence IDs, and authored
position-specific explanations. Engine and browser verification still
depend on passing CI and follow-up review.

## Twenty-lesson minimum for each opening course

The four currently connected opening repertoires each provide **20 distinct,
individually identified practice lessons**, totaling 80 lines:

| Track | Existing before expansion | New in this PR | Total |
| --- | ---: | ---: | ---: |
| Caro–Kann | 6 | 14 | 20 |
| Vienna | 4 | 16 | 20 |
| London | 3 | 17 | 20 |
| Slav | 1 | 19 | 20 |

The new lessons include opponent deviations, move-order recognition, positional
setups and concrete pawn challenges. Each includes a specific original introduction,
a continuation to play against the automatic opponent, and a stated strategic
follow-up. Introductions can be stepped through on the actual board before
practice; the existing learning ledger retains achievements under stable IDs.

A 20-lesson count is a minimum breadth target, **not** a guarantee that every
possible reply is covered, that every move is engine-best or that every lesson
lasts a fixed number of minutes. The separate Academy, middlegame and endgame
paths are not yet 20-unit courses. Broader curriculum expansion and professional
chess-content review remain tracked separately.

## Readable final feedback

After the final repertoire or academy-path move, the learner sees the exact
move and its corresponding explanation until they choose **Continue**.
The completed line is persisted before the next lesson can be opened. Assisted
work remains assisted and does not gain clean-recall mastery. This replaces the
former 1.8-second automatic redirect and applies at desktop and phone sizes.
