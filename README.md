# KnightUp

Learn smarter. Play stronger.

English, mobile-first chess learning PWA. Current foundation: eight original notation exercises, adaptive due-review recommendations from your mistakes and hints, legal board interaction, canonical SAN checking, explanation and hint feedback, local IndexedDB progress, backup/restore, light/dark themes, offline application caching and explicit updates.

## Run

Node 22 or newer; `npm ci`, `npm run dev`. Open the printed `/knightup/` URL.

Checks: `npm test`, `npm run lint`, `npm run build`, `npx playwright install chromium`, `npm run test:e2e`. Browser tests run against the production build on desktop and phone-sized Chromium. They do not establish physical iOS compatibility; Safari/device testing remains required before a stable release.

## Status

This is a foundation, not the completed coaching platform. Chess.com collection, Stockfish analysis, custom puzzles, mastery estimates, game-derived adaptive sessions and sync are not yet implemented. The Insights screen explicitly reports this. There are no fabricated personal statistics. No engine evaluation or best-move claim is made by notation lessons.

## Deployment

Set repository Settings → Pages → Source to GitHub Actions. Merge a passing PR into main; Deploy Pages runs the full checks before publishing static assets. Expected URL: https://nfloser.github.io/knightup/ . Do not consider it live until its workflow and route have been verified.

## Privacy and storage

Learning state is stored only in this browser's IndexedDB; it does not automatically sync. Export a JSON backup in Profile. Restore validates schema and known content IDs before merging completions and preserving newer review records. Version-1 backups migrate safely. See [adaptive learning](docs/ADAPTIVE.md). No private profile or coaching results belong in this public repository. Browser/OS clearing or eviction can remove local data. Hosting retains its normal access logs.

Offline availability starts after a successful online load and service worker installation. Update prompts activate a new app version only when requested. The service worker caches static app assets, not IndexedDB data or remote reports.

## Design and reuse

Original KnightUp identity and lesson content; classic Cburnett pieces by Colin M. L. Burnett, distributed by Lichess under GPL-2.0-or-later. These are not Chess.com proprietary images. See [third-party notices](docs/THIRD_PARTY.md). App source is released under GPL-3.0-or-later; figures retain their own license.

See [specification](docs/SPEC.md), [architecture and roadmap](docs/ARCHITECTURE.md), [security](SECURITY.md).
