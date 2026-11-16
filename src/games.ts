import { Chess } from "chess.js";
import { database } from "./local-db";
export type SavedGame = {
  id: string;
  pgn: string;
  initialFen: string;
  moves: string[];
  white: string;
  black: string;
  result: string;
  date: string;
  url?: string;
};
export function safeGameUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["www.chess.com", "chess.com", "lichess.org"].includes(url.hostname)
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export async function parseGames(
  text: string,
  signal?: AbortSignal,
): Promise<SavedGame[]> {
  if (text.length > 2_000_000)
    throw Error("PGN is too large. Import at most 2 MB per batch.");
  const chunks = text.split(/(?=^\[Event\s)/m).filter((s) => s.trim());
  if (chunks.length > 100) throw Error("Import at most 100 games per batch.");
  const result: SavedGame[] = [];
  for (const pgn of chunks) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const game = new Chess();
    try {
      game.loadPgn(pgn, { strict: true });
    } catch {
      throw Error(
        "PGN contains an invalid game or illegal move. No games were imported.",
      );
    }
    const headers = game.getHeaders();
    if (headers.Variant && !["Standard", "Chess"].includes(headers.Variant))
      throw Error("Only standard chess games are supported.");
    const moves = game.history();
    if (!moves.length || moves.length > 600)
      throw Error("Each game must have between 1 and 600 legal plies.");
    const initialFen = headers.FEN ?? new Chess().fen();
    const identity = [
      headers.White?.toLowerCase(),
      headers.Black?.toLowerCase(),
      headers.Date,
      headers.UTCTime,
      initialFen,
      moves.join(" "),
    ].join("|");
    const bytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(identity),
    );
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const id = Array.from(new Uint8Array(bytes))
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
    result.push({
      id,
      pgn: game.pgn(),
      initialFen,
      moves,
      white: (headers.White ?? "White").slice(0, 80),
      black: (headers.Black ?? "Black").slice(0, 80),
      result: headers.Result ?? "*",
      date: (headers.Date ?? "Unknown").slice(0, 30),
      url: safeGameUrl(headers.Site ?? ""),
    });
  }
  if (!result.length) throw Error("No games found in the PGN.");
  return result;
}
export async function loadGames(): Promise<SavedGame[]> {
  return (await (await database()).get("settings", "games")) ?? [];
}
export async function saveGames(incoming: SavedGame[]) {
  const tx = (await database()).transaction("settings", "readwrite");
  const games: SavedGame[] = (await tx.store.get("games")) ?? [];
  const merged = new Map(games.map((g) => [g.id, g]));
  for (const game of incoming) merged.set(game.id, game);
  if (merged.size > 2000)
    throw Error(
      "Local library limit reached (2,000 games). Export and remove old games before importing more.",
    );
  const result = [...merged.values()];
  await tx.store.put(result, "games");
  await tx.done;
  return result;
}
let nextRequestAt = 0;
export async function importChessCom(
  username: string,
  months: number,
  signal?: AbortSignal,
  request: typeof fetch = fetch,
) {
  if (!/^[a-zA-Z0-9_-]{2,40}$/.test(username))
    throw Error("Enter a valid Chess.com username.");
  if (Date.now() < nextRequestAt)
    throw Error(
      "Rate limit cooldown is active. Please wait at least one minute.",
    );
  const base = `https://api.chess.com/pub/player/${username.toLowerCase()}/games`;
  async function get(url: string) {
    const response = await request(url, { signal });
    if (response.status === 429) {
      nextRequestAt = Date.now() + 60000;
      throw Error(
        "Chess.com rate limit reached. Wait one minute before retrying.",
      );
    }
    if (response.status === 404)
      throw Error("Player or game archive not found. Check the username.");
    if (!response.ok)
      throw Error(`Chess.com request failed (${response.status}).`);
    const text = await response.text();
    if (text.length > 12_000_000)
      throw Error("Archive is too large for this batch. Use PGN import.");
    return JSON.parse(text) as unknown;
  }
  const index = await get(`${base}/archives`);
  if (
    !index ||
    typeof index !== "object" ||
    !("archives" in index) ||
    !Array.isArray(index.archives) ||
    index.archives.length > 2000
  )
    throw Error("Invalid archive response.");
  const archives = index.archives
    .filter(
      (url): url is string =>
        typeof url === "string" &&
        url.startsWith(base + "/") &&
        /^\d{4}\/\d{2}$/.test(url.slice(base.length + 1)),
    )
    .slice(-Math.min(24, Math.max(1, months)));
  const imported: SavedGame[] = [];
  for (const archive of archives) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const month = await get(archive);
    if (
      !month ||
      typeof month !== "object" ||
      !("games" in month) ||
      !Array.isArray(month.games) ||
      month.games.length > 3000
    )
      throw Error("Invalid monthly game response.");
    for (const raw of month.games) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      if (
        !raw ||
        typeof raw !== "object" ||
        typeof raw.pgn !== "string" ||
        (raw.rules && raw.rules !== "chess")
      )
        continue;
      const games = await parseGames(raw.pgn, signal);
      imported.push(...games);
      if (imported.length > 2000)
        throw Error("This batch exceeds 2,000 games. Select fewer months.");
    }
  }
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  if (!imported.length)
    throw Error(
      "No standard games were found in these archives. Bot games may require manual PGN export.",
    );
  return imported;
}
