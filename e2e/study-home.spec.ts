import { test, expect } from "@playwright/test";

test("learning recommendations precede the catalog and filters have themed controls", async ({
  page,
}) => {
  await page.goto("./");
  const recommendation = page.getByRole("heading", {
    name: "Recommended for you",
  });
  const catalog = page.getByRole("heading", { name: "Study a system" });
  await expect(recommendation).toBeVisible();
  expect((await recommendation.boundingBox())!.y).toBeLessThan(
    (await catalog.boundingBox())!.y,
  );
  const filter = page
    .getByRole("group", { name: "Study categories" })
    .getByRole("button", { name: "Openings" });
  await expect(filter).toHaveAttribute("aria-pressed", "true");
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (value) => (document.documentElement.dataset.theme = value),
      theme,
    );
    await expect(filter).toHaveCSS("border-radius", "8px");
    await expect(filter).toHaveCSS("min-height", "44px");
  }
});

test("practice offers clear destinations and keeps notation drills available", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play against coach →" }),
  ).toBeVisible();
  await page.getByText("Notation drills", { exact: true }).click();
  await expect(page.getByText("DRILL 01")).toBeVisible();
  await page.getByRole("button", { name: "Train puzzles →" }).click();
  await expect(
    page.getByRole("heading", { name: /puzzle/i }).first(),
  ).toBeVisible();
});

test("opening course cards and instructions stay readable on narrow phones in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("./");
  await page.getByRole("button", { name: "Black", exact: true }).click();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const card = page.getByRole("button", { name: /Caro.Kann.*training lines/i }).first();
    await expect(card).toBeVisible();
    const description = card.locator("p");
    expect(
      await description.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
    ).toBeGreaterThanOrEqual(14);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(375);
  }
});
