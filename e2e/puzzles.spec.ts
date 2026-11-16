import { test, expect } from "@playwright/test";
import { Chess } from "chess.js";
import puzzle from "./fixtures/puzzle.json";
test("random puzzles play the whole variation with black orientation and Explain", async ({
  page,
}) => {
  await page.route("**/puzzles.json", (r) => r.fulfill({ json: [puzzle] }));
  await page.goto("./");
  await page.getByRole("button", { name: "Puzzles", exact: true }).click();
  await page.getByRole("button", { name: "Play random puzzle" }).click();
  await expect(
    page.getByRole("group", { name: "Chessboard, Black at bottom" }),
  ).toBeVisible();
  const game = new Chess(puzzle.fen);
  const first = puzzle.moves[0];
  game.move({ from: first.slice(0, 2), to: first.slice(2, 4) });
  for (let i = 1; i < puzzle.moves.length; i += 2) {
    const move = puzzle.moves[i];
    await expect(
      page.locator(`[data-square="${move.slice(0, 2)}"] button`),
    ).toBeEnabled();
    await page.locator(`[data-square="${move.slice(0, 2)}"] button`).click();
    await page.locator(`[data-square="${move.slice(2, 4)}"] button`).click();
    game.move({ from: move.slice(0, 2), to: move.slice(2, 4) });
    if (i + 1 < puzzle.moves.length) {
      const reply = puzzle.moves[i + 1];
      game.move({ from: reply.slice(0, 2), to: reply.slice(2, 4) });
    }
  }
  await expect(
    page.getByText("✓ Puzzle solved. Well calculated!"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Why this line?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next puzzle", exact: false }),
  ).toBeVisible();
});
test("puzzle filters and revealed solutions never count as solved", async ({
  page,
}) => {
  await page.route("**/puzzles.json", (r) => r.fulfill({ json: [puzzle] }));
  await page.goto("./");
  await page.getByRole("button", { name: "Puzzles", exact: true }).click();
  await page.getByRole("button", { name: "Play random puzzle" }).click();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Why this line?" }),
  ).toBeVisible();
  await expect(page.getByText("✓ Puzzle solved. Well calculated!")).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Try it yourself", exact: true })
    .click();
  await page.getByRole("button", { name: "← Puzzles", exact: true }).click();
  await page.getByLabel("Theme", { exact: true }).selectOption("promotion");
  await page.getByRole("button", { name: "Play random puzzle" }).click();
  await expect(page.getByRole("alert")).toContainText("No puzzles match");
});
