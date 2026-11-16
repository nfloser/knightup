import { test, expect } from "@playwright/test";
const pgn =
  '[Event "Coach smoke"]\n[White "GMNille"]\n[Black "Opponent"]\n[Result "0-1"]\n\n1. f3 e5 2. g4 Qh4# 0-1';
test("real Stockfish analyses imported games and teaches a verified position", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Insights", exact: true }).click();
  await page.getByLabel("Paste PGN").fill(pgn);
  await page.getByRole("button", { name: "Import PGN", exact: true }).click();
  await expect(
    page.getByText("GMNille vs Opponent", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Analyse game", exact: true }).click();
  await expect(
    page.getByText("Analysis complete. Review the positions below.", {
      exact: true,
    }),
  ).toBeVisible({ timeout: 60000 });
  await expect(
    page.getByText(
      /Stockfish 19 lite single-thread · White perspective · 2 \/ 2/,
    ),
  ).toBeVisible();
  await page.locator(".report-list button").first().click();
  await expect(page.getByRole("heading", { name: /Why / })).toBeVisible();
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Find the stronger continuation",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(page.locator(".move-explanation")).toBeVisible();
  expect(errors).toEqual([]);
});
test("Chess.com imports only after consent and merges duplicates", async ({
  page,
}) => {
  const calls: string[] = [];
  await page.route("https://api.chess.com/**", (r) => {
    calls.push(r.request().url());
    return r.fulfill({
      json: r.request().url().endsWith("/archives")
        ? {
            archives: [
              "https://api.chess.com/pub/player/gmnille/games/2026/11",
            ],
          }
        : { games: [{ pgn, rules: "chess" }] },
    });
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Insights", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Import public games", exact: true }),
  ).toBeDisabled();
  expect(calls).toEqual([]);
  await page
    .getByRole("checkbox", {
      name: "Allow public archive requests for this username",
    })
    .check();
  await page
    .getByRole("button", { name: "Import public games", exact: true })
    .click();
  await expect(
    page.getByText("GMNille vs Opponent", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Import public games", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Library updated: 1 games",
  );
  await expect.poll(() => calls.length).toBe(4);
});
