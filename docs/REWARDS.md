# Learning rewards and recovery

Original implementation and knight artwork. Generic XP/streak ideas informed by tap2-coach; no source or assets copied (no root license found).

First clean, due solves award 25 XP for puzzles, 10 for lesson exercises and 20 for coach recall drills. Each later due review awards 3 XP. Immediate repeats and assisted reveals earn nothing. After a hint, the learner must wait for the scheduled review to earn credit. Credits are written atomically with activity; notation uses the same IndexedDB transaction as its progress.

Level is floor(sqrt(XP / 100)) + 1. Streak counts consecutive local calendar days with eligible activity (today or yesterday as its end). Each distinct activity contributes at most once per day. Daily goals are personal settings, not gates on learning. Credit-day history retains the most recent 365 days per activity; lifetime XP uses retained credit totals.

Profile has four original knight collectibles, unlocked by lesson mastery, puzzle solves and level. Equipped collectibles decorate the reward collection; standard chessboard pieces stay consistent.

Export includes notation progress plus course/puzzle/coach-drill mastery, reward totals and settings. Import validates the complete document before a transaction merges it. Reimporting the same backup cannot duplicate XP. Legacy notation-only backups remain supported. Imported game PGNs, Stockfish reports, network consent and automatic-import settings are deliberately excluded and clearly disclosed in Profile. Backups do not enable network requests.
