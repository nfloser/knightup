import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
await mkdir("public/engine", { recursive: true });
const names = ["stockfish-19-lite-single.js", "stockfish-19-lite-single.wasm"];
const hashes = {};
for (const name of names) {
  await copyFile(`node_modules/stockfish/bin/${name}`, `public/engine/${name}`);
  hashes[name] = createHash("sha256")
    .update(await readFile(`public/engine/${name}`))
    .digest("hex");
}
await copyFile(
  "node_modules/stockfish/Copying.txt",
  "public/engine/COPYING.txt",
);
await writeFile(
  "public/engine/SOURCE.txt",
  "Stockfish.js 19.0.0, lite single-thread build, GPL-3.0.\nCorresponding source: https://github.com/nmrugg/stockfish.js/tree/54fde71d90c7c403964f6cacef48f7bbec495df1\nBuild instructions and source archive are available at that revision. The pinned npm package and lockfile integrity select the unmodified binaries.\n" +
    JSON.stringify(hashes, null, 2),
);
console.log("Prepared Stockfish 19 lite single-thread assets.");
