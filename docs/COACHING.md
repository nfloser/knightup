# Private Stockfish coaching

## Engine and bounded analysis

Stockfish.js 19.0.0 lite single-thread (GPL-3.0) is pinned through npm and lockfile integrity. `scripts/prepare-engine.mjs` copies unmodified JS/WASM and COPYING into build assets and records SHA-256 hashes plus the corresponding source revision. Source: https://github.com/nmrugg/stockfish.js/tree/54fde71d90c7c403964f6cacef48f7bbec495df1 . Engine assets are excluded from installation precache and cached only after an explicit analysis request. Single-thread WASM needs no cross-origin isolation on Pages. Nothing is sent to an LLM or an engine server.

Profile `stockfish-19-lite-single-n40000-t600-v1` uses a 16 MB hash and at most 40,000 nodes/600 ms per position; candidate losses >=100 centipawns are searched again at 120,000 nodes/1,000 ms per position. Compare the player's pre-move evaluation against the negated post-move opponent evaluation. Mate scores are handled separately as decisive outcomes; no fabricated playing rating or accuracy percentage is shown. Legal PV replay is required before presenting a coaching line. Classifications and explanations disclose search uncertainty.

Each run stops after roughly two minutes plus the current bounded pair of searches. Every completed player decision and engine profile is saved, allowing stop/resume without reprocessing it. Worker errors, timeouts and cancellation terminate the worker. Reports are capped at 200 local reports; source games at 2,000. Import/export controls provide recovery. The smoke test runs the actual shipped WASM on a synthetic legal game, not a mock engine.

## Import and consent

Manual PGN import validates standard games and every move, with a 2 MB/100-game/600-ply-per-game batch limit. Stable SHA-256 identities deduplicate equivalent imports. External source links are restricted to HTTPS Chess.com or Lichess URLs.

Public archive import uses the documented Chess.com Published-Data API only after user consent. Requests are serial; 429 starts a one-minute cooldown. Username and archive responses are validated, unexpected domains ignored, variants skipped, failures visible. Batches select recent 2/6/24 available months, with explicit library limits. Public API bot coverage is not promised; manual PGN supports exports. Reference: https://support.chess.com/en/articles/9650547-what-is-the-pubapi-and-how-do-i-use-it . KnightUp is independent and not affiliated with Chess.com.

Optional daily refresh starts once per 24 hours only when the Insights page is open, visible and idle. A started bounded job may finish in a hidden tab. It imports the latest archive and analyses at most one not-yet-complete game, with the same time bound. Closing the page stops local work. Unattended private analysis while every device is closed needs a separately configured private backend; public Actions/Pages never publish personal reports.

## Personalized learning

Reports identify concrete engine-preferred moves, legal continuations and original teaching explanations. Opening/king-safety/material/calculation themes are evidence or bounded-search observations, not inferred thoughts. Each report position can become an assisted/unassisted coach recall drill. Recommendations map recurring themes to academy lessons and puzzle themes; official rating remains separate from practice progress.
