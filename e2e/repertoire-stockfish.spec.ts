import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { sequences, sequenceGame } from "../src/sequences";

test("Stockfish 19 screens a learner decision in every opening lesson", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One full WASM review is enough per CI run.");
  test.setTimeout(240_000);

  const samples = sequences
    .filter((s) => s.category === "Openings")
    .map((s) => {
      const before = sequenceGame(s, s.moves.length - 1);
      const selected = before.move(s.moves.at(-1)!);
      if (!selected) throw Error("Illegal repertoire move in " + s.id);
      return { id: s.id, before: sequenceGame(s, s.moves.length - 1).fen(),
        after: before.fen(), san: selected.san, terminal: before.isGameOver() };
    });
  expect(samples).toHaveLength(80);
  await page.goto("./");

  const scores = await page.evaluate(async (rows) => {
    const worker = new Worker(new URL("./engine/stockfish-19-lite-single.js", location.href));
    const callbacks = new Set<(line: string) => void>();
    worker.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      for (const line of event.data.split("\n"))
        callbacks.forEach((listener) => listener(line.trim()));
    };
    let workerFailure: Error | null = null;
    worker.onerror = () => {
      workerFailure = Error("Stockfish WASM worker crashed.");
    };
    const wait = (command: string, predicate: (line: string) => boolean, ms = 15000) =>
      new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          callbacks.delete(listener);
          reject(workerFailure ?? Error("Stockfish timed out during " + command));
        }, ms);
        const listener = (line: string) => {
          if (!predicate(line)) return;
          callbacks.delete(listener);
          clearTimeout(timer);
          resolve(line);
        };
        callbacks.add(listener);
        worker.postMessage(command);
      });
    try {
      await wait("uci", (line) => line === "uciok", 30000);
      worker.postMessage("setoption name Hash value 16");
      await wait("isready", (line) => line === "readyok");

      async function evaluate(fen: string) {
        await wait("isready", (line) => line === "readyok");
        worker.postMessage("setoption name Clear Hash");
        worker.postMessage("position fen " + fen);
        let cp: number | null = null;
        let mate: number | null = null;
        let depth = 0;
        const observe = (line: string) => {
          if (!line.startsWith("info ") || line.includes(" lowerbound") || line.includes(" upperbound")) return;
          const score = line.match(/\bscore (cp|mate) (-?\d+)/);
          if (!score) return;
          const lineDepth = Number(line.match(/\bdepth (\d+)/)?.[1] ?? 0);
          if (lineDepth < depth) return;
          depth = lineDepth;
          cp = score[1] === "cp" ? Number(score[2]) : null;
          mate = score[1] === "mate" ? Number(score[2]) : null;
        };
        callbacks.add(observe);
        try {
          await wait("go movetime 180 nodes 16000", (line) => line.startsWith("bestmove "), 15000);
        } finally {
          callbacks.delete(observe);
        }
        if (cp === null && mate === null) throw Error("No engine score for " + fen);
        return { cp, mate, depth };
      }

      const result: Array<{ id: string; san: string; lossCp: number | null;
        before: { cp: number | null; mate: number | null; depth: number };
        after: { cp: number | null; mate: number | null; depth: number } | null }> = [];
      for (const row of rows) {
        const before = await evaluate(row.before);
        const after = row.terminal ? null : await evaluate(row.after);
        // UCI scores are from the side to move. After our move, that side flips.
        const lossCp = before.cp !== null && after?.cp !== null
          ? before.cp + after.cp : null;
        result.push({ id: row.id, san: row.san, before, after, lossCp });
      }
      return result;
    } finally {
      worker.terminate();
    }
  }, samples);

  const summary = scores.filter((r) => r.lossCp !== null)
    .sort((a, b) => (b.lossCp ?? 0) - (a.lossCp ?? 0));
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/stockfish-opening-review.json",
    JSON.stringify({ engine: "Stockfish 19 lite", sample: "one last learner move per opening line",
      limitations: "Shallow 180ms/16000-node tactical screen, not a proof of best play", results: scores }, null, 2));
  console.log("Stockfish opening screen:", scores.length, "lessons, worst candidates:",
    summary.slice(0, 12).map((r) => r.id + ":" + r.lossCp + "cp").join(", "));
  const gross = summary.filter((r) => (r.lossCp ?? 0) > 750);
  expect(gross.map((r) => r.id + ": " + r.lossCp + " cp"))
    .toEqual([]);
});
