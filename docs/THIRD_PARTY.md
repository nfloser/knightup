# Third-party notices

## Playing pieces
`public/pieces/*.svg`: unmodified Cburnett classical chess pieces, copyright Colin M. L. Burnett, GPL-2.0-or-later. Source: https://github.com/lichess-org/lila/tree/master/public/piece/cburnett . The SVG files are the editable preferred source. See licenses/GPL-2.0.txt and licenses/lichess-COPYING.md. These are not proprietary Chess.com figures.

## Runtime packages
- react 19.3.1: MIT; full notice in `licenses/react-LICENSE`.
- react-dom 19.3.1: MIT; full notice in `licenses/react-dom-LICENSE`.
- chess.js 1.4.0: BSD-2-Clause; full notice in `licenses/chess.js-LICENSE`.
- idb 8.0.4: ISC; full notice in `licenses/idb-LICENSE`.
- workbox-window 7.4.1: MIT; full notice in `licenses/workbox-window-LICENSE`.

Design references: Meta Astryx (MIT) and Apple HIG, concepts only. Original KnightUp mascots and teaching text. No copied tap2-coach implementation or paid educational content.

## Stockfish engine
Stockfish.js 19.0.0, GPL-3.0-or-later. Build copies the lite single-thread JavaScript/WASM from the pinned npm package; generated engine/COPYING and engine/SOURCE.txt identify license, exact upstream revision and SHA256. Preferred upstream source: https://github.com/nmrugg/stockfish.js/tree/54fde71d90c7c403964f6cacef48f7bbec495df1 . Source and build instructions are available there; no engine binary is modified.

## Puzzle data
Lichess open puzzle database, CC0: https://database.lichess.org/#puzzles . 4,000-record offline subset and attributed endgame continuations. Import procedure and prefix provenance: docs/PUZZLES.md and docs/puzzle-source.json in the repository. Each puzzle retains its source game URL.
