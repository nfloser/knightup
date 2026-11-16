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
test("phone coach controls fit short and keyboard-sized viewports", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== "mobile") return;
  await page.goto("./");
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByRole("button", { name: "Play against coach →" }).click();
  await page.getByRole("button", { name: "Start coach game" }).click();
  for (const size of [
    { width: 320, height: 568 },
    { width: 667, height: 375 },
    { width: 390, height: 360 },
  ]) {
    await page.setViewportSize(size);
    await page.getByLabel("Your move in English SAN").focus();
    for (const locator of [
      page.locator(".play-screen .board"),
      page.getByLabel("Your move in English SAN"),
      page.getByRole("button", { name: "Play move", exact: true }),
      page.getByRole("button", { name: "Explain", exact: true }),
    ]) {
      await expect(locator).toBeVisible();
      await expect
        .poll(async () => {
          const box = await locator.boundingBox();
          return (
            !!box &&
            box.y >= 0 &&
            box.x >= 0 &&
            box.y + box.height <= size.height + 1 &&
            box.x + box.width <= size.width + 1
          );
        })
        .toBe(true);
    }
  }
  await page.screenshot({ path: testInfo.outputPath("coach-short-phone.png") });
});
