# Architecture and decisions

## Decisions

- Static React + TypeScript + Vite app at `/knightup/`; no server, API keys or trackers. Local privacy takes precedence over an automatic public coaching report.
- `chess.js` owns move legality and SAN generation. Our boundary also compares submitted SAN with canonical SAN, ensuring omitted check/mate suffixes cannot pass. Exercise objectives are authored moves, not engine best-move recommendations.
- Stable content IDs include notation version. Schema-1 and schema-2 backups are validated before writes and merged rather than replacing existing completions. Saves merge the stored and incoming sets within a single read/write transaction, preventing stale tabs or overlapping restores from erasing completions. Unknown/future versions fail explicitly; no deployment resets IndexedDB.
- One IDB settings store contains notation progress, training ledger, reward settings, imported games, versioned Stockfish reports and opt-in import preferences. Storage failures remain visible; learning backups exclude private games/reports. See REWARDS.md.
- PWA uses Workbox precache of static assets and prompt-based updates. Generated single-thread Stockfish assets are cached on demand separately; private reports stay in IndexedDB. Daily import/analysis is possible only while the app is open and visible.
- Design reference resolved as https://github.com/meta/astryx (MIT). Semantic tokens, theme separation and consistent states inform original CSS; no Astryx source copied. Apple HIG https://developer.apple.com/design/human-interface-guidelines informs hierarchy and mobile clarity; no Apple assets used.
- Standard green/cream board, classical black/white Cburnett SVG figures, tap piece then legal destination, explicit promotion choices. No mascot art used as playing pieces. Board supports both orientations, tap/click legal destinations and a promotion picker. Drag/drop remains optional.

## Sources checked

- https://jhlywa.github.io/chess.js/ — strict SAN and legal move APIs; installed LICENSE shipped in third-party bundle.
- https://vite-pwa-org.netlify.app/guide/prompt-for-update — explicit updates.
- https://github.com/lichess-org/lila/blob/master/COPYING.md — distinct artwork licenses, Cburnett GPL-2.0-or-later. Figures vendored unchanged; see notices.
- No tap2-coach code, Lichess application code, proprietary Chess.com images or GothamChess course content has been copied. Further reuse requires scoped inspection and license review.

## Learning modules

- Versioned notation and original 18-course curriculum; stable authored IDs preserve progress.
- CC0 Lichess puzzle pack and full-line repertoire/endgame sequences with legal replay and assisted grading.
- Opt-in Chess.com/PGN import with bounded responses and deduplication.
- Pinned Stockfish 19 lite Worker, bounded analysis, resumable private reports and evidence-based recommendations.
- Adaptive playable opponent with reduced skill, beginner move mixture and smoothed completed-game results.
- Transactional mastery credits, derived XP/levels, local calendar streaks and original collectibles.

Optional future work: physical-device certification, private cross-device sync, closed-device background jobs, expanded repertoire branches and drag/drop. These are not represented as shipped.

## Review and limitations

Unit tests cover every lesson solution, malformed backups, duplicate completions and notation regression cases. Browser suite exercises full lesson, persistent progress, invalid import, export, offline reload, responsive overflow and axe checks in both themes. Physical iOS/Android validation is not equivalent to a Chromium viewport simulation.
Dependency audit currently reports moderate/low issues in build-only Workbox/lint transitive dependencies; no high/critical findings at initial inspection. Runtime deps are checked separately. CI blocks high and critical findings. No automatic force/downgrade was applied to silence audit.

Independent review found a stale-tab overwrite race, reproduced with a failing concurrent-save regression and fixed by transactional merging. A mutation removing canonical SAN enforcement caused the suffix regression to fail, confirming that guard is covered.

## Interaction feedback (#14)

Standard chess interaction uses short pressed/hover/focus states, last-move source/destination highlights and a 180 ms piece translation (both pieces for castling). Correct and retry states have explicit text; feedback never depends on color alone. No animation is awaited to enable controls. Reduced-motion preferences disable decorative transitions and piece animations.

Correct exercises advance automatically after 1.6 seconds in Learn and Practice, including returning to the learning path after the last item. Auto-next is on by default per session. The always-visible Explain action shows the intended move and its original explanation, cancelling auto-next while open; manual Next remains available. Revealing an unsolved exercise counts as assisted review, never a completion. Timers cancel on navigation, exercise change or opening Explain. The next heading receives focus for keyboard/screen-reader continuity. This short pause is feedback timing, not a claim that the explanation can be fully read in that time.

Browser regressions verify selection/last-move feedback, reduced motion, automatic progression and Explain without false completion. Original adaptive, offline, backup and axe journeys remain required.

## Phone training viewport (#16)

The exercise route uses an immersive fixed available viewport on phones. Global navigation/header/footer give way to a compact learning-path exit, objective, board, input and feedback. Learn/Practice entry pages and data/settings pages retain normal document scrolling. Board size uses the remaining space, not a hard-coded pixel height. Explain replaces the input/feedback area while the intended move stays visible. Compact/landscape views place the board beside the controls. The visualViewport resize event updates available height when a mobile keyboard changes it; focused compact input hides the repeated title/objective to keep actions reachable.

Browser geometry checks cover 320×568, 375×667, 390×844, 667×375 and a 390×360 reduced viewport. They check full visibility of the board, SAN/Check/Explain and explanatory actions, not merely hidden document overflow. Native iOS/Android keyboards still require physical device verification; a resized Chromium viewport is a simulation.
