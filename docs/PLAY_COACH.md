# Adaptive coach opponent

Practice → Play against coach runs the shipped Stockfish 19 lite engine locally. All replies are replayed through chess.js before publication. Level 0–4 mixes legal random moves with Skill Level 0 to offer an approachable beginner mode; levels 5–20 map to Stockfish Skill Level 1–20. These are product practice levels, not measured Elo. Stockfish itself exposes Skill Level 0–20: https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html

After three unassisted completed games, the last eight results guide a maximum half-level adjustment per game. Above 65% score increases the challenge, below 35% lowers it. Strength stays stable within a game. Explain marks the game assisted and excludes it from this calibration. Leaving unfinished games does not change the level. Games award no farmable XP.

No clocks or server are required. Completed games are saved as local PGNs for analysis in Insights. Unfinished games are not saved; Leave game discards the active board. Worker failure leaves the board intact and offers Retry coach turn. Leaving cancels the worker. Explain uses full-strength bounded analysis independently of opponent skill.
