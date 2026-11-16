import { test, expect } from "@playwright/test";
test("plays a legal Stockfish reply and explains without making the user move", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByRole("button", { name: "Play against coach →" }).click();
  await page.getByLabel("Starting challenge").selectOption("5");
  await page.getByRole("button", { name: "Start coach game" }).click();
  await page.getByLabel("Your move in English SAN").fill("e4");
  await page.getByRole("button", { name: "Play move", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your move", exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(page.locator(".play-screen .feedback")).toContainText(
    "Stockfish suggests",
    {
      timeout: 45000,
    },
  );
  await expect(page.getByLabel("Your move in English SAN")).toBeEnabled();
});
