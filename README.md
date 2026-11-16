# KnightUp

Learn smarter. Play stronger.

A private, English chess-learning PWA with a local Stockfish coach. [Open KnightUp](https://nfloser.github.io/knightup/).

## What you can do

- **Learn:** 18 Academy topics with **20 legal board exercises each** (360 total), plus three guided foundations/middlegame/endgame paths of **20 positions each** (60 further lessons). Four ordered opening repertoires — **Caro–Kann, Vienna, London and Slav** — offer **20 playable training lines each** (80 total). Start with explanations and board walkthroughs, then practise, resume or review; progress is saved locally. The 20 exercises in an Academy topic are individual positions, not 20 full video lectures. The four opening repertoires are bounded response examples, not exhaustive coverage of every opponent move.
- **Practice:** replay notation skills or play complete games against an adaptive Stockfish opponent. Recent unassisted results gradually adjust the next game's challenge. Practice levels are not Elo estimates.
- **Puzzles:** 4,000 attributed CC0 Lichess positions, random or filtered by theme/difficulty, with full legal continuations and focused due review.
- **Insights:** import PGN or explicitly opt into public Chess.com archives; analyze privately with Stockfish 19, inspect legal better lines and practise mistakes. Recommendations reflect your own analyzed games.
- **Profile:** mastery XP, levels, local calendar streaks, daily goals, original knight collectibles and learning backup/restore.

Correct answers and opponent replies advance automatically. Explain reveals the intended move and its teaching context; assisted answers do not earn clean mastery. Standard classical pieces, light/dark themes, desktop/mobile motion feedback and reduced-motion support. Phone training uses the available viewport and readable move input.

## Learning content and quality limits

Academy topic cards combine two introductory authored positions with 18 additional context-specific single-move applications. The guided phase paths and opening repertoires instead walk through complete move sequences before asking you to play them. The CC0 examples retain source attribution; an authored repertoire continuation is not the only acceptable chess move.

The CI suite checks canonical legal moves and browser learning flows. A bounded Stockfish 19 screening samples one learner decision per opening line; it is not a deep independent verification of every move or a substitute for instructional review. Physical-device behavior and coaching quality need additional testing.

## Run and verify

Node 22 or newer: `npm ci`, `npm run dev`. Open the printed `/knightup/` URL.

`npm test`, `npm run lint`, `npm run build`, `npx playwright install chromium`, `npm run test:e2e`.

CI checks types, lint, unit tests, production build, high/critical dependency audit and real Chromium journeys at desktop/phone sizes, including the actual shipped Stockfish WASM. Viewport simulation does not establish physical Safari/iOS keyboard compatibility.

## Privacy, recovery and offline use

Personal data stays in this browser's IndexedDB. No account, trackers, API key or external LLM. Public Chess.com collection requires explicit consent. Daily import/analysis starts only when Insights is open, visible and idle. An already-started bounded job may finish after the tab is hidden; leaving Insights stops it. Nothing runs on a closed device. No live-game assistance workflow is provided.

Export a learning backup before switching devices or clearing browser data. It includes lesson/puzzle mastery and rewards; imported games and Stockfish reports remain on this device and are excluded. Existing and legacy notation backups merge rather than erase progress. There is no automatic cross-device sync. Browser storage eviction can remove local data.

Open online once to prepare offline use. The bounded single-thread Stockfish assets download on first analysis and are cached separately; they are not eagerly downloaded with the app. Service-worker updates require user action.

## Deployment and limits

GitHub Pages deploys only after passing quality checks. The coach uses bounded search and original factual explanations, not unlimited analysis or a conversational LLM. Repertoire exercises teach specific playable lines, not the only correct response to every position. Leaving an unfinished coach game discards that board. Full unattended scheduling and optional cross-device storage would require a private backend.

## Sources and design

Original identity, collectibles and teaching text; no copied tap2-coach implementation or paid course material. Classical Cburnett pieces retain GPL-2.0-or-later; Stockfish 19 retains GPL-3.0-or-later; Lichess puzzle data is CC0. App source is GPL-3.0-or-later. [Third-party notices](docs/THIRD_PARTY.md).

Details: [curriculum](docs/CURRICULUM.md), [sequences](docs/SEQUENCES.md), [puzzles](docs/PUZZLES.md), [coaching](docs/COACHING.md), [adaptive opponent](docs/PLAY_COACH.md), [rewards and recovery](docs/REWARDS.md), [architecture](docs/ARCHITECTURE.md), [security](SECURITY.md).
