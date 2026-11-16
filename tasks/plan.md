# KnightUp learning product completion

Tasks are tracked in GitHub issues. Preserve the already shipped mobile, Explain and notation flows.

1. #17 — Dedicated puzzles: bounded CC0 Lichess pack, provenance, random/theme/rating selection, legal full variations, black orientation, explanations and persisted attempts. Unit + E2E + review + CI + merge.
2. #3 — Real curriculum: original instruction before exercises, multiple skill areas through beginner/intermediate, legal contextual exercises and spaced review. Preserve notation IDs. Unit + E2E + review + CI + merge.
3. #4/#5 — PGN and opt-in Chess.com import, bounded on-device Stockfish Worker, per-move review, source positions and verified better lines. No personal reports published. Real engine smoke tests and mocked network boundary tests. Review + CI + merge.
4. #18 — Derive XP, levels, streaks and original knight cosmetic unlocks from persisted meaningful learning evidence. Avoid grinding/revealed-answer credit, add complete backup/restore and profile controls. Review + CI + merge.

Architecture: public static PWA; local IndexedDB personal data. Engine binaries are copied reproducibly from a pinned npm package during build, not into git or eager app cache. Puzzle pack is versioned, licensed and legally replayed before shipping. No paid services or external LLM required. Daily private analysis can run when the app is open; closed-device unattended private analysis requires an optional private backend and is not represented as delivered.

Product completion means the explicit core routes are functional with no placeholder screens; it does not mean every conceivable chess feature or a guaranteed Elo outcome. Tests, source license notices, screenshots and deployment checks gate each slice.
