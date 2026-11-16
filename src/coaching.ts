import { Chess, type Color } from "chess.js";
import {
  ENGINE_PROFILE,
  legalVariation,
  type EngineScore,
  StockfishClient,
} from "./engine";
import { type SavedGame } from "./games";
import { database } from "./local-db";
export type CoachingPoint = {
  ply: number;
  fen: string;
  played: string;
  best: string;
  line: { san: string; uci: string; fen: string }[];
  loss: number;
  theme: string;
  explanation: string;
  before: EngineScore;
  after: EngineScore;
};
export type CoachingReport = {
  version: 1;
  gameId: string;
  color: Color;
  player: string;
  checkedAt: Record<string, number>;
  profile: string;
  engine: string;
  completed: number[];
  points: CoachingPoint[];
  total: number;
  updatedAt: number;
  complete: boolean;
};
export function scoreValue(score: EngineScore) {
  return score.mate !== null
    ? score.mate > 0
      ? 100000
      : -100000
    : (score.cp ?? 0);
}
export function describePoint(
  fen: string,
  played: string,
  before: EngineScore,
  after: EngineScore,
  ply: number,
): CoachingPoint {
  const game = new Chess(fen);
  const actual = game.move(played, { strict: true });
  const line = legalVariation(fen, before.pv);
  const best = line[0]?.san ?? played;
  const candidate = new Chess(fen);
  const bestMove = line.length ? candidate.move(line[0].san) : actual;
  const loss = Math.max(0, scoreValue(before) + scoreValue(after));
  let theme = "calculation";
  let explanation = `Stockfish prefers ${best}. `;
  if (after.mate !== null && after.mate > 0) {
    theme = "kingSafety";
    explanation +=
      "The opponent has a forced mating continuation in this bounded search. Check king escapes and forcing checks first. ";
  } else if (before.mate !== null && before.mate > 0 && after.mate === null) {
    theme =
      before.mate === 1
        ? "mateIn1"
        : before.mate === 2
          ? "mateIn2"
          : "calculation";
    explanation +=
      "A mating opportunity was found before your move but not after it at this search budget. Recheck the forcing line. ";
  } else if (bestMove.isCapture()) {
    theme = "hangingPiece";
    explanation += `The suggested move captures a ${({ p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" } as const)[bestMove.captured!]}. Verify the reply before assuming the material is free. `;
  } else if (bestMove.san.includes("+") || bestMove.san.includes("#")) {
    explanation +=
      "The stronger continuation begins with a forcing check. Calculate the opponent’s response. ";
  } else if (bestMove.isKingsideCastle() || bestMove.isQueensideCastle()) {
    theme = "kingSafety";
    explanation +=
      "Castling improves king safety and activates the rook in the engine line. ";
  } else if (ply < 20) {
    theme = "opening";
    explanation +=
      "Review development, central tension and the strongest opponent reply. This comparison is position-specific, not a rule against all other opening moves. ";
  } else {
    explanation +=
      "Compare the legal continuation below with your move and look for the next concrete threat. ";
  }
  explanation +=
    "This is a search-limited coaching suggestion, not an exhaustive proof.";
  return {
    ply,
    fen,
    played,
    best,
    line,
    loss,
    theme,
    explanation,
    before,
    after,
  };
}
export async function loadReports(): Promise<CoachingReport[]> {
  return (await (await database()).get("settings", "reports")) ?? [];
}
async function saveReport(report: CoachingReport) {
  const tx = (await database()).transaction("settings", "readwrite");
  const reports: CoachingReport[] = (await tx.store.get("reports")) ?? [];
  const existing = reports.find(
    (r) =>
      r.gameId === report.gameId &&
      r.color === report.color &&
      r.profile === report.profile,
  );
  const merged = existing ? mergeReports(existing, report) : report;
  const remaining = reports.filter(
    (r) =>
      !(
        r.gameId === report.gameId &&
        r.color === report.color &&
        r.profile === report.profile
      ),
  );
  await tx.store.put([...remaining, merged].slice(-200), "reports");
  await tx.done;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("knightup-coaching"));
  return merged;
}
export async function analyseGame(
  game: SavedGame,
  color: Color,
  signal: AbortSignal,
  onProgress: (report: CoachingReport) => void,
  evaluate?: (
    fen: string,
    signal: AbortSignal,
    confirm?: boolean,
  ) => Promise<EngineScore>,
) {
  const previous = (await loadReports()).find(
    (r) =>
      r.gameId === game.id && r.color === color && r.profile === ENGINE_PROFILE,
  );
  const total = game.moves.filter(
    (_, i) =>
      (new Chess(game.initialFen).turn() === "w"
        ? i % 2 === 0
        : i % 2 !== 0) ===
      (color === "w"),
  ).length;
  const report: CoachingReport = previous
    ? {
        ...previous,
        completed: [...previous.completed],
        points: [...previous.points],
        checkedAt: { ...previous.checkedAt },
      }
    : {
        version: 1,
        gameId: game.id,
        color,
        player: color === "w" ? game.white : game.black,
        checkedAt: {},
        profile: ENGINE_PROFILE,
        engine: "Stockfish 19 lite single-thread",
        completed: [],
        points: [],
        total,
        updatedAt: Date.now(),
        complete: false,
      };
  if (report.complete || total === 0) {
    report.complete = true;
    Object.assign(report, await saveReport(report));
    onProgress(report);
    return report;
  }
  const engine = evaluate ? null : new StockfishClient();
  const run =
    evaluate ??
    ((fen: string, s: AbortSignal, confirm = false) =>
      engine!.evaluate(fen, s, confirm));
  const board = new Chess(game.initialFen);
  const started = Date.now();
  try {
    for (let ply = 0; ply < game.moves.length; ply++) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const fen = board.fen();
      const side = board.turn();
      const played = game.moves[ply];
      board.move(played, { strict: true });
      if (side !== color || report.completed.includes(ply)) continue;
      if (Date.now() - started > 120000) break;
      let before = await run(fen, signal);
      let after = await run(board.fen(), signal);
      if (Math.max(0, scoreValue(before) + scoreValue(after)) >= 100) {
        before = await run(fen, signal, true);
        after = await run(board.fen(), signal, true);
      }
      const point = describePoint(fen, played, before, after, ply);
      report.completed.push(ply);
      report.checkedAt[ply] = Date.now();
      if (point.loss >= 100 && point.line.length && point.best !== played)
        report.points.push(point);
      report.complete = report.completed.length === report.total;
      report.updatedAt = Date.now();
      Object.assign(report, await saveReport(report));
      onProgress({
        ...report,
        completed: [...report.completed],
        points: [...report.points],
      });
    }
    return report;
  } finally {
    engine?.close();
  }
}

export function learningNeeds(reports: CoachingReport[], learner = "GMNille") {
  const weights: Record<string, number> = {};
  const seen = new Set<string>();
  for (const r of reports) {
    if (
      r.profile !== ENGINE_PROFILE ||
      r.player?.toLowerCase() !== learner.toLowerCase()
    )
      continue;
    for (const p of r.points) {
      const key = `${r.gameId}:${r.color}:${p.ply}`;
      if (seen.has(key)) continue;
      seen.add(key);
      weights[p.theme] = (weights[p.theme] ?? 0) + Math.min(1000, p.loss);
    }
  }
  return weights;
}
export async function resetReport(gameId: string, color: Color) {
  const tx = (await database()).transaction("settings", "readwrite");
  const reports: CoachingReport[] = (await tx.store.get("reports")) ?? [];
  await tx.store.put(
    reports.filter(
      (r) =>
        !(
          r.gameId === gameId &&
          r.color === color &&
          r.profile === ENGINE_PROFILE
        ),
    ),
    "reports",
  );
  await tx.done;
}

export function mergeReports(
  current: CoachingReport,
  incoming: CoachingReport,
): CoachingReport {
  const completed = [
    ...new Set([...current.completed, ...incoming.completed]),
  ].sort((a, b) => a - b);
  const checkedAt = { ...current.checkedAt };
  const points = new Map(current.points.map((p) => [p.ply, p]));
  for (const ply of incoming.completed) {
    if ((incoming.checkedAt?.[ply] ?? 0) > (current.checkedAt?.[ply] ?? -1)) {
      checkedAt[ply] = incoming.checkedAt?.[ply] ?? 0;
      const point = incoming.points.find((p) => p.ply === ply);
      if (point) points.set(ply, point);
      else points.delete(ply);
    }
  }
  return {
    ...incoming,
    completed,
    checkedAt,
    points: [...points.values()],
    updatedAt: Math.max(current.updatedAt, incoming.updatedAt),
    complete: completed.length === incoming.total,
  };
}
export function reportFor(
  reports: CoachingReport[],
  gameId: string,
  color: Color,
) {
  return reports.find(
    (r) =>
      r.gameId === gameId && r.color === color && r.profile === ENGINE_PROFILE,
  );
}
