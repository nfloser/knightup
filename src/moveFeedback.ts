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
