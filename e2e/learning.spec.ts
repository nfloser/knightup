import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("lesson, backup, persistence and offline delivery", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.getByLabel("Your move in English SAN").fill("e2e4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/not unambiguous legal SAN/)).toBeVisible();
  await page
    .getByRole("button", { name: "e2 White pawn", exact: true })
    .click();
  await page
    .getByRole("button", { name: "e4 legal destination", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Next exercise" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next exercise" }).click();
  for (const san of ["Nf3", "exd5", "O-O", "Re1+", "Nbd2", "e8=Q+", "Qg7#"]) {
    await page.getByLabel("Your move in English SAN").fill(san);
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await page
      .getByRole("button", {
        name: san === "Qg7#" ? "Finish lesson" : "Next exercise",
      })
      .click();
  }
  await expect(page.getByText("8 OF 8 COMPLETED")).toBeVisible();
  await page.reload();
  await expect(page.getByText("8 OF 8 COMPLETED")).toBeVisible();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "knightup-progress.json",
  );
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2}'),
  });
  await expect(page.getByRole("status")).toContainText("not a supported");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your next good move." }),
  ).toBeVisible();
  await expect(page.getByText("8 OF 8 COMPLETED")).toBeVisible();
  expect(errors).toEqual([]);
});
test("responsive accessible navigation in both themes", async ({ page }) => {
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "Start learning" }),
  ).toBeEnabled();
  for (const mode of ["light", "dark"]) {
    for (const tab of ["Learn", "Practice", "Insights", "Profile"]) {
      await page.getByRole("button", { name: tab, exact: true }).click();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    if (mode === "light")
      await page.getByRole("button", { name: "Switch to dark mode" }).click();
  }
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `test-results/knightup-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("attempts and hints change persisted adaptive recommendations", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-16T12:00:00Z") });
  await page.goto("./");
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.getByRole("button", { name: "Need a hint?" }).click();
  await page.getByLabel("Your move in English SAN").fill("e4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next exercise" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Learning path" }).click();
  await expect(page.getByText("Recommended: N is for knight.")).toBeVisible();
  await page.clock.fastForward(600_001);
  await page.reload();
  await expect(
    page.getByText("Recommended: A square is a destination."),
  ).toBeVisible();
  await expect(page.getByText(/needed help or retries/)).toBeVisible();
});
