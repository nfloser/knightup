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

test("learning tiles align cleanly at desktop and phone widths in both themes", async ({ page }) => {
  for (const width of [1280, 900, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./");
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      const courseGrid = page.locator(".academy").filter({ has: page.getByRole("heading", { name: "Chess academy" }) }).locator(".course-grid");
      await expect(courseGrid).toBeVisible();
      const cards = courseGrid.locator(":scope > .course-card");
      expect(await cards.count()).toBeGreaterThanOrEqual(3);
      const rectangles = await cards.evaluateAll((elements) =>
        elements.slice(0, 3).map((element) => {
          const card = element.getBoundingClientRect();
          const action = element.lastElementChild!.getBoundingClientRect();
          return { left: card.left, right: card.right, top: card.top, bottom: card.bottom,
            actionBottom: action.bottom, actionTop: action.top };
        }));
      for (const rect of rectangles) {
        expect(rect.left).toBeGreaterThanOrEqual(-1);
        expect(rect.right).toBeLessThanOrEqual(width + 1);
        expect(rect.actionBottom).toBeLessThanOrEqual(rect.bottom - 8);
      }
      if (width >= 761) {
        const sameRow = rectangles.slice(1, width > 1050 ? 3 : 2);
        for (const rect of sameRow) {
          expect(Math.abs(rect.top - rectangles[0].top)).toBeLessThanOrEqual(1);
          expect(Math.abs(rect.bottom - rectangles[0].bottom)).toBeLessThanOrEqual(1);
          expect(Math.abs(rect.actionBottom - rectangles[0].actionBottom)).toBeLessThanOrEqual(2);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width + 1);
    }
  }
});

test("guided academy path tiles share a baseline and remain usable on narrow screens", async ({ page }) => {
  await page.goto("./");
  const pathGrid = page.locator(".academy-guided-paths .course-grid");
  await expect(pathGrid).toBeVisible();
  const cards = pathGrid.locator(":scope > .course-card");
  await expect(cards).toHaveCount(3);
  const geometry = await cards.evaluateAll((elements) => elements.map((element) => {
    const card = element.getBoundingClientRect();
    const buttons = element.querySelector(".actions")!.getBoundingClientRect();
    return { top: card.top, bottom: card.bottom, buttonsTop: buttons.top, buttonsBottom: buttons.bottom };
  }));
  expect(Math.max(...geometry.map((x) => x.top)) - Math.min(...geometry.map((x) => x.top)))
    .toBeLessThanOrEqual(1);
  expect(Math.max(...geometry.map((x) => x.buttonsTop)) - Math.min(...geometry.map((x) => x.buttonsTop)))
    .toBeLessThanOrEqual(2);
  for (const card of geometry) expect(card.buttonsBottom).toBeLessThanOrEqual(card.bottom - 8);
  await page.setViewportSize({ width: 320, height: 680 });
  await expect(pathGrid.getByRole("button", { name: "Continue path" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
});
