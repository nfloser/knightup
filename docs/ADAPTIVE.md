# Adaptive learning: evidence and first implementation

## Source inspection (2026-11-16)

| Repository                                                                  | Inspected revision and files                                                           | License                                                | Useful concept                                                                                                              | KnightUp decision                                                                                                                                       |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [chess-local-learning](https://github.com/RagnarPitla/chess-local-learning) | fe12ac591edfe3e96c4306c7f9848fad9c7d405c; LICENSE, README, public/js/profile.js        | MIT; engine/assets have separate terms                 | Rank recurring engine-observed weaknesses by severity, frequency and recency; separate game evidence from drill performance | Future game-derived priority requires Stockfish evidence, not guessed labels                                                                            |
| [Tabia](https://github.com/daxaur/tabia)                                    | 2eeb60572aa1a7d5f8f840775fa82aaa312ba59c; LICENSE, README, src/store.js                | MIT; piece licenses separate                           | Local repertoire, due/weak-first reviews and longer intervals after success                                                 | Use a small transparent due-review policy; retain our transactional IndexedDB safety                                                                    |
| [OpenChess](https://github.com/caydenchapple/openchess)                     | 04119ef8fb1d7385c651ffac35e6cc8054b74aa8; LICENSE, README, client/src/lessons-logic.js | GPL-3.0-or-later                                       | Unassisted first tries, per-topic results, game-theme-to-lesson mapping, original explanations                              | Record mistakes and hints; do not treat assisted correctness as unassisted recall. Avoid uncalibrated Elo estimates                                     |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)                | Main README, current at inspection                                                     | Review package license before incorporating            | Validated scheduling library and parameter optimization from real logs                                                      | Evaluate for richer curriculum later. Current v6 requires Node 24; do not add a runtime/toolchain dependency for eight items or call our heuristic FSRS |
| [chess-coach](https://github.com/pragmaplatform/chess-coach)                | Main README, current at inspection                                                     | README states MIT; inspect source license before reuse | Bounded candidate/confirmation/verification engine passes, policy fingerprints, legal alternative grading                   | Use as further research for #5; no Rust/backend dependency introduced                                                                                   |

These sources informed decisions only. No source code, exercises, commentary, or assets from these five projects were copied. Existing playing pieces retain their separate attribution.

## First adaptive slice: #8

Every submitted notation answer is stored, including incorrect answers. Using a hint, even if hidden again, or retrying makes a subsequent correct answer assisted. Wrong or assisted responses schedule a short review in ten minutes. Clean recall on a due item advances its interval through 1, 3, 7, 14, 30 elapsed days. Early repeated answers cannot advance the interval; wrong answers still lower it. These are transparent initial heuristics, not a calibrated retention model or chess rating.

The home recommendation prioritizes due low-box items, then the next uncompleted foundation, then earliest scheduled optional practice. Its reason is visible. It does not fetch games or claim game-derived adaptation. Manual drill choice and the guided sequential lesson remain available.

## Data contract and migration

Progress schema 2 preserves version-1 completions and adds a bounded per-content review record: latest event ID/time, due time, box, attempt/failure totals and assistance/correctness. No speculative mastery is inferred from old completions. The existing IndexedDB database/store remains intact; payload migration happens on read and next write, not by deleting data.

Each answer is folded into persisted state within a single read/write transaction. Parallel tabs cannot drop either attempt. Backup import unions completions and chooses the newer review snapshot by timestamp, then event ID for deterministic ties. This is recovery/merge, not general cross-device sync. Restoring an older review cannot move a newer one backwards. Timestamps are device-clock based; incorrectly set clocks affect due dates. Reject unknown versions, lesson IDs, malformed records, impossible fields and records more than five minutes in the future. Counters are bounded at one million; no unbounded event log or private source games are saved.

## Acceptance and tests

- Deterministic scheduler tests cover due failures, assisted success, unseen foundations, interval growth, early grinding and stale backup behavior.
- Storage regression covers concurrent same-skill attempts as well as distinct completion merges.
- Browser test uses a controlled clock: a hinted answer initially recommends the next foundation, then recommends the weak skill again after its review becomes due, including after reload.
- Existing legal SAN, offline, backup, responsive and axe tests must remain green.

Next: broader skills/content and error categories; then explicit archive opt-in (#4), engine-confirmed motifs (#5), provenance-aware game priorities and bounded daily sessions. Adapting position difficulty requires multiple validated exercises per skill; the current eight fixed teaching positions do not support a credible difficulty model.
