import { test, expect } from "@playwright/test";
test("earned knight unlocks persist and backups contain mastery", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: /01 · 0–200 Know your pieces/ })
    .click();
  await page.getByRole("button", { name: "Practise this idea" }).click();
  await page.getByLabel("Your move in English SAN").fill("Nf3");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: "Next exercise" }).click();
  await page.getByLabel("Your move in English SAN").fill("Bc4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: "Finish lesson" }).click();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Level 1 · 20 XP" }),
  ).toBeVisible();
  const ivory = page.getByRole("button", { name: /Ivory knight Equip/ });
  await ivory.click();
  await page.reload();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Ivory knight Equipped/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: /Golden knight/ }),
  ).toBeDisabled();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  expect((await download).suggestedFilename()).toBe("knightup-progress.json");
});
