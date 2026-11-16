export function moveFeedback(played: string, line: { san: string }[]): string {
  if (!line.length)
    return `Move review for ${played} is unavailable. Continue your game.`;
  const first = line[0].san;
  const continuation = line
    .slice(0, 5)
    .map((move) => move.san)
    .join(" ");
  const comparison =
    first === played
      ? `${played} matches Stockfish's suggestion.`
      : `You played ${played}; Stockfish suggests ${first} in this position.`;
  return `${comparison} Explore the suggested continuation: ${continuation}. Limited analysis does not prove your move is bad or explain every alternative.`;
}

export function compareMoveScores(
  before: { cp: number | null; mate: number | null },
  after: { cp: number | null; mate: number | null },
): string {
  if (before.mate !== null || after.mate !== null)
    return "A mate evaluation is involved; inspect the forcing line rather than comparing pawn values.";
  if (before.cp === null || after.cp === null)
    return "A numerical comparison is unavailable.";
  const change = Math.max(0, before.cp + after.cp) / 100;
  return `Estimated change: ${change.toFixed(1)} pawns relative to the engine's preferred line. Short searches can disagree.`;
}
