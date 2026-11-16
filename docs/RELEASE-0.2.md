# KnightUp 0.2 — private learning and coaching

Adds random and focused Lichess puzzles; 18 original lessons; phased curriculum and full opening/endgame lines; public Chess.com/PGN imports; real local Stockfish analysis and adaptive opponent; original mastery rewards and learning backup recovery.

Existing notation progress survives. Import schema validates before merging. Engine assets load only on demand; no server receives your reports. Standard board pieces, automatic progression and Explain remain available on desktop and mobile.

Known limits: no cross-device sync, no private background analysis with the app closed, no unlimited engine search or LLM chat, no unfinished-game resume. Learning backups exclude imported games/reports. Physical iOS keyboard verification remains a follow-up; desktop/phone Chromium journeys are automated in CI. Practice levels are not Elo.

Release publication follows successful Pages deployment and matching public commit/version identity and puzzle/engine asset smoke checks. If rollback is needed, use a forward fix or revert the affected merge on a new branch only after confirming the target can read the currently stored schemas. Pass the same checks and redeploy; do not clear IndexedDB. Keep personal records and stable learning IDs. A rollback must not strand newer-format data. Public hosting provides deployment history; private user reports are never sent to telemetry.
