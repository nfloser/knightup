import { Chess } from "chess.js";
import { playUci } from "./puzzles";
export const ENGINE_PROFILE = "stockfish-19-lite-single-n40000-t600-v1";
export type EngineScore = {
  cp: number | null;
  mate: number | null;
  depth: number;
  nodes: number;
  pv: string[];
};
export function parseInfo(line: string): EngineScore | null {
  if (
    !line.startsWith("info ") ||
    !line.includes(" score ") ||
    line.includes(" lowerbound") ||
    line.includes(" upperbound")
  )
    return null;
  const score = line.match(/\bscore (cp|mate) (-?\d+)/);
  if (!score) return null;
  const pv = line.split(" pv ")[1]?.trim().split(/\s+/) ?? [];
  return {
    cp: score[1] === "cp" ? Number(score[2]) : null,
    mate: score[1] === "mate" ? Number(score[2]) : null,
    depth: Number(line.match(/\bdepth (\d+)/)?.[1] ?? 0),
    nodes: Number(line.match(/\bnodes (\d+)/)?.[1] ?? 0),
    pv,
  };
}
export function legalVariation(fen: string, pv: string[]) {
  const g = new Chess(fen);
  const result: { san: string; uci: string; fen: string }[] = [];
  for (const u of pv.slice(0, 12)) {
    try {
      const move = playUci(g, u);
      result.push({ san: move.san, uci: u, fen: g.fen() });
    } catch {
      break;
    }
  }
  return result;
}
export class StockfishClient {
  private worker: Worker;
  private listeners = new Set<(line: string) => void>();
  private ended = false;
  private ready: Promise<void>;
  private busy = false;
  private failures = new Set<(error: Error) => void>();
  constructor() {
    this.worker = new Worker(
      `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`,
    );
    this.worker.onmessage = (e) => {
      if (typeof e.data === "string")
        for (const line of e.data.split("\n"))
          this.listeners.forEach((listener) => listener(line));
    };
    this.worker.onerror = () =>
      this.close("Stockfish could not load. Open once online and retry.");
    this.ready = this.initialize();
  }
  private send(command: string) {
    if (this.ended) throw Error("Engine is stopped.");
    this.worker.postMessage(command);
  }
  private wait(
    predicate: (line: string) => boolean,
    command: string,
    timeout = 30000,
  ) {
    return new Promise<string>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        this.listeners.delete(listener);
        this.failures.delete(fail);
      };
      const fail = (error: Error) => {
        cleanup();
        reject(error);
      };
      const listener = (line: string) => {
        if (predicate(line)) {
          cleanup();
          resolve(line);
        }
      };
      const timer = setTimeout(() => {
        fail(Error("Stockfish response timed out."));
        this.close();
      }, timeout);
      this.listeners.add(listener);
      this.failures.add(fail);
      try {
        this.send(command);
      } catch (error) {
        fail(error as Error);
      }
    });
  }
  private async initialize() {
    await this.wait((l) => l === "uciok", "uci");
    this.send("setoption name Hash value 16");
    await this.wait((l) => l === "readyok", "isready");
  }
  async evaluate(
    fen: string,
    signal?: AbortSignal,
    confirm = false,
  ): Promise<EngineScore> {
    new Chess(fen);
    if (this.busy) throw Error("Engine is busy.");
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    this.busy = true;
    const abort = () => this.close("Analysis cancelled.");
    signal?.addEventListener("abort", abort, { once: true });
    let latest: EngineScore | null = null;
    const listen = (line: string) => {
      const info = parseInfo(line);
      if (info) latest = info;
    };
    try {
      await this.ready;
      this.send("setoption name Clear Hash");
      this.send(`position fen ${fen}`);
      this.listeners.add(listen);
      const best = await this.wait(
        (l) => l.startsWith("bestmove "),
        `go nodes ${confirm ? 120000 : 40000} movetime ${confirm ? 1000 : 600}`,
        15000,
      );
      if (!latest) {
        const game = new Chess(fen);
        if (game.isCheckmate())
          return { cp: null, mate: 0, depth: 0, nodes: 0, pv: [] };
        if (game.isDraw())
          return { cp: 0, mate: null, depth: 0, nodes: 0, pv: [] };
        throw Error("Engine returned no usable evaluation.");
      }
      const score: EngineScore = latest;
      const move = best.split(" ")[1];
      if (
        move &&
        /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move) &&
        !score.pv.length
      )
        score.pv = [move];
      const legal = legalVariation(fen, score.pv);
      if (score.pv.length && !legal.length)
        throw Error("Engine continuation was not legal.");
      return { ...score, pv: legal.map((m) => m.uci) };
    } finally {
      this.busy = false;
      this.listeners.delete(listen);
      signal?.removeEventListener("abort", abort);
    }
  }
  close(message = "Engine stopped.") {
    if (this.ended) return;
    this.ended = true;
    this.worker.terminate();
    for (const fail of [...this.failures]) fail(Error(message));
    this.listeners.clear();
  }
}
