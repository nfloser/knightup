# KnightUp foundation

Approved scope: supplied KnightUp master prompt, first-session milestone.

## Capabilities and order

Learning shell → legal notation exercises → local progress/backup → offline delivery.
Later independent modules: curriculum, spaced review, archive import, Stockfish analysis, private recommendations, optional sync.

## Acceptance

English responsive navigation, original knight artwork, substantial SAN lesson with board and text input, honest empty Insights, IndexedDB persistence, validated backup/restore, accessible themes and installable offline PWA. No invented ratings or analytics. No remote collection.

## Architecture

React/TypeScript/Vite; chess.js is the sole rules authority. Lesson definitions are versioned data. IndexedDB schema 1 stores versioned progress. Export is user initiated. Pages hosts only static application assets. Browser data is never committed. Service worker precaches application only; updates require user action. No backend or credentials.

## Commands and layout

`npm run dev`, `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`.
`src` implementation/unit tests, `e2e` browser tests, `public` original icons, `docs` decisions.
Use strict TypeScript, pure domain functions, semantic HTML and explicit errors. Always validate imported data; never remove tests to pass checks. No paid services or external analytics.

## Design contract

Learn has one primary next action; Practice puts the board first. Flat warm-neutral surfaces, restrained blue action color, visible focus, original knight silhouettes, desktop rail/mobile bottom tabs, real light/dark themes. Minimum 44px actions except board squares at narrow widths; board uses full available width. Reduced motion respected. No glass, gradients or decorative blocking animation.

## Verification

Unit tests for lesson solutions, canonical SAN special cases, backup validation and duplicate completion. Browser tests for full lesson, keyboard navigation, persistence, backup, responsive overflow, accessibility and offline reload. Build/type/lint/audit in CI.

## Expanded product scope (0.2)

The original foundation milestone is complete. Current accepted additions are random/themed full-line puzzles, original phased curriculum, public-game opt-in import, bounded private Stockfish coaching, playable adaptive opponent, repertoire response sequences, endgame continuations, mastery-based rewards and learning recovery. Module contracts and limits are in CURRICULUM.md, PUZZLES.md, COACHING.md, PLAY_COACH.md, SEQUENCES.md and REWARDS.md. Insights reports actual local evidence rather than an empty placeholder. No paid backend, unattended private service or fabricated Elo is included.
