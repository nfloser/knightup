# Architecture and decisions

## Decisions

- Static React + TypeScript + Vite app at `/knightup/`; no server, API keys or trackers. Local privacy takes precedence over an automatic public coaching report.
- `chess.js` owns move legality and SAN generation. Our boundary also compares submitted SAN with canonical SAN, ensuring omitted check/mate suffixes cannot pass. Exercise objectives are authored moves, not engine best-move recommendations.
- Stable content IDs include notation version. Schema-1 backups are validated before writes and merged rather than replacing existing completions. Saves merge the stored and incoming sets within a single read/write transaction, preventing stale tabs or overlapping restores from erasing completions. Unknown/future versions fail explicitly; no deployment resets IndexedDB.
- One IDB store contains progress and theme. Storage failures remain visible. XP/streaks omitted until a mastery policy exists.
- PWA uses Workbox precache of static assets, prompt-based update, and no runtime remote-data cache. Single-thread analysis and private scheduled storage are future design decisions.
- Design reference resolved as https://github.com/meta/astryx (MIT). Semantic tokens, theme separation and consistent states inform original CSS; no Astryx source copied. Apple HIG https://developer.apple.com/design/human-interface-guidelines informs hierarchy and mobile clarity; no Apple assets used.
- Standard green/cream board, classical black/white Cburnett SVG figures, tap piece then legal destination, explicit promotion choices. No mascot art used as playing pieces. Board does not yet support drag/drop or black orientation; current lessons all use White to move.

## Sources checked

- https://jhlywa.github.io/chess.js/ — strict SAN and legal move APIs; installed LICENSE shipped in third-party bundle.
- https://vite-pwa-org.netlify.app/guide/prompt-for-update — explicit updates.
- https://github.com/lichess-org/lila/blob/master/COPYING.md — distinct artwork licenses, Cburnett GPL-2.0-or-later. Figures vendored unchanged; see notices.
- No tap2-coach code, Lichess application code, proprietary Chess.com images or GothamChess course content has been copied. Further reuse requires scoped inspection and license review.

## Roadmap (not shipped)

1. Notation variants, black orientation, move sequence replay and keyboard roving grid.
2. Curriculum and spaced repetition with validated mastery scheduling.
3. Public Chess.com incremental import with explicit consent, PGN import and deduplication.
4. Stockfish bounded analysis, engine/version provenance, legal variations and uncertainty-aware teaching.
5. Private recommendations, daily refresh only after private storage design is established; optional secure sync.

## Review and limitations

Unit tests cover every lesson solution, malformed backups, duplicate completions and notation regression cases. Browser suite exercises full lesson, persistent progress, invalid import, export, offline reload, responsive overflow and axe checks in both themes. Physical iOS/Android validation is not equivalent to a Chromium viewport simulation.
Dependency audit currently reports moderate/low issues in build-only Workbox/lint transitive dependencies; no high/critical findings at initial inspection. Runtime deps are checked separately. CI blocks high and critical findings. No automatic force/downgrade was applied to silence audit.

Independent review found a stale-tab overwrite race, reproduced with a failing concurrent-save regression and fixed by transactional merging. A mutation removing canonical SAN enforcement caused the suffix regression to fail, confirming that guard is covered.
