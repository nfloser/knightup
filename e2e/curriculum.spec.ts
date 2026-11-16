import { test, expect } from "@playwright/test";
test("a real lesson teaches before testing and preserves completion", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: /01 · 0–200 Know your pieces/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "The idea", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your thinking habit", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Practise this idea" }).click();
  await page.getByLabel("Your move in English SAN").fill("Nf3");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: "Next exercise" }).click();
  await page.getByLabel("Your move in English SAN").fill("Bc4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: "Next exercise" }).click();
  await page.getByRole("button", { name: "← Learning path" }).click();
  await expect(
    page.getByRole("button", { name: /01 · 0–200 Know your pieces 2 \/ 2/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /01 · 0–200 Know your pieces 2 \/ 2/ }),
  ).toBeVisible();
});

test("Black opening lessons keep Black at the bottom", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: /Caro–Kann: challenge the center/ })
    .click();
  await page.getByRole("button", { name: "Practise this idea" }).click();
  await expect(
    page.getByRole("group", { name: "Chessboard, Black at bottom" }),
  ).toBeVisible();
  await page.getByLabel("Your move in English SAN").fill("c6");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "Chessboard, Black at bottom" }),
  ).toBeVisible();
});
