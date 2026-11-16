import { expect, it } from "vitest";
import { parseGames, safeGameUrl, importChessCom } from "./games";
const pgn =
  '[Event "Test"]\n[White "GMNille"]\n[Black "Opponent"]\n[Result "0-1"]\n\n1. f3 e5 2. g4 Qh4# 0-1';
it("validates legal PGN and stable deduplication", async () => {
  const [a] = await parseGames(pgn);
  const [b] = await parseGames(pgn);
  expect(a.id).toBe(b.id);
  expect(a.moves).toEqual(["f3", "e5", "g4", "Qh4#"]);
  await expect(parseGames("1. e9")).rejects.toThrow();
});
it("does not render untrusted game links", () => {
  expect(safeGameUrl("javascript:alert(1)")).toBeUndefined();
  expect(safeGameUrl("https://evil.test/")).toBeUndefined();
});
it("imports documented archive shapes serially and filters URLs", async () => {
  const calls: string[] = [];
  const request = (async (url: RequestInfo | URL) => {
    calls.push(String(url));
    return new Response(
      JSON.stringify(
        calls.length === 1
          ? {
              archives: [
                "https://evil.test/x",
                "https://api.chess.com/pub/player/gmnille/games/2026/11",
              ],
            }
          : { games: [{ pgn, rules: "chess" }] },
      ),
    );
  }) as typeof fetch;
  expect((await importChessCom("GMNille", 2, undefined, request)).length).toBe(
    1,
  );
  expect(calls.length).toBe(2);
});
