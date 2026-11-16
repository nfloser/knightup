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

test("move feedback stays clear with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.getByLabel("Your move in English SAN").fill("d4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("↺ Try again", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "e2 White pawn", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "e2 White pawn", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "e4 legal destination", exact: true })
    .click();
  await expect(page.getByText("✓ Correct move", { exact: true })).toBeVisible();
  await expect(page.locator("[data-last-move=true]")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "e4 White pawn", exact: true }),
  ).toBeDisabled();
  expect(
    await page
      .locator(".chess-piece")
      .evaluateAll(
        (elements) => elements.flatMap((e) => e.getAnimations()).length,
      ),
  ).toBe(0);
  await page.getByRole("button", { name: "Next exercise" }).click();
  await expect(page.locator("[data-last-move=true]")).toHaveCount(0);
});

test("correct moves advance automatically unless Explain is opened", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("./");
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByText("Notation drills", { exact: true }).click();
  await page.getByRole("button", { name: /DRILL 01/ }).click();
  await page.getByLabel("Your move in English SAN").fill("e4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("✓ Correct move", { exact: true })).toBeVisible();
  await page.clock.fastForward(1601);
  await expect(
    page.getByRole("heading", { name: "N is for knight", exact: true }),
  ).toBeFocused();
  await page.getByLabel("Your move in English SAN").fill("Nf3");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await page.clock.fastForward(5000);
  await expect(
    page.getByRole("heading", { name: "N is for knight", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Why Nf3?", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next exercise" }).click();
  await expect(
    page.getByRole("heading", { name: "Read a capture", exact: true }),
  ).toBeVisible();
});

test("Explain reveals the intended move without awarding a solution", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Why e4?", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "e4 White pawn", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("✓ Correct move", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Next exercise" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Try it yourself", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "e2 White pawn", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Learning path" }).click();
  await expect(page.getByText("0 OF 8 COMPLETED")).toBeVisible();
});

test("phone exercise and Explain fit the viewport without clipped controls", async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [667, 375],
    [390, 360],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("./");
    await page.getByRole("button", { name: "Practice", exact: true }).click();
    await page.getByText("Notation drills", { exact: true }).click();
    await page.getByRole("button", { name: /DRILL 01/ }).click();
    for (const locator of [
      page.locator(".board"),
      page.getByLabel("Your move in English SAN"),
      page.getByRole("button", { name: "Explain", exact: true }),
      page.getByRole("button", { name: "Check", exact: true }),
    ])
      await expect(locator).toBeInViewport({ ratio: 1 });
    const dimensions = await page
      .locator(".lesson-screen")
      .evaluate((e) => ({ scroll: e.scrollHeight, client: e.clientHeight }));
    if (dimensions.scroll > dimensions.client + 1)
      await page.screenshot({
        path: `test-results/overflow-${width}-${height}-${test.info().project.name}.png`,
      });
    expect(
      dimensions.scroll,
      `${width}x${height} screen overflow`,
    ).toBeLessThanOrEqual(dimensions.client + 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Need a hint?" }).click();
    await expect(page.getByLabel("Your move in English SAN")).toBeInViewport({
      ratio: 1,
    });
    await page.getByRole("button", { name: "Explain", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Try it yourself", exact: true }),
    ).toBeInViewport({ ratio: 1 });
    await expect(page.locator(".move-explanation")).toBeInViewport({
      ratio: 1,
    });
    await expect(page.locator(".board")).toBeInViewport({ ratio: 1 });
    const explainedDimensions = await page
      .locator(".lesson-screen")
      .evaluate((e) => ({ scroll: e.scrollHeight, client: e.clientHeight }));
    if (explainedDimensions.scroll > explainedDimensions.client + 1)
      await page.screenshot({
        path: `test-results/overflow-explain-${width}-${height}-${test.info().project.name}.png`,
      });
    expect(
      explainedDimensions.scroll,
      `${width}x${height} Explain overflow`,
    ).toBeLessThanOrEqual(explainedDimensions.client + 1);
    if (width === 375)
      await page.screenshot({
        path: `test-results/training-explain-${test.info().project.name}.png`,
      });
  }
});

test("mobile restore notice and promotion picker never clip training actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("./");
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "restore.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"completed":[]}'),
  });
  await expect(page.getByRole("status")).toContainText("Backup restored");
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByText("Notation drills", { exact: true }).click();
  await page.getByRole("button", { name: /DRILL 07/ }).click();
  await expect(page.getByLabel("Your move in English SAN")).toBeInViewport({
    ratio: 1,
  });
  await page
    .getByRole("button", { name: "e7 White pawn", exact: true })
    .click();
  await page
    .getByRole("button", { name: "e8 legal destination", exact: true })
    .click();
  for (const piece of ["queen", "rook", "bishop", "knight"])
    await expect(
      page.getByRole("button", { name: `Promote to ${piece}`, exact: true }),
    ).toBeInViewport({ ratio: 1 });
  const picker = await page.locator(".promotion").boundingBox();
  const form = await page.locator("form").boundingBox();
  expect(picker!.y + picker!.height).toBeLessThanOrEqual(form!.y);
  await expect(
    page.getByRole("button", { name: "Check", exact: true }),
  ).toBeInViewport({ ratio: 1 });
  await page
    .getByRole("button", { name: "Promote to queen", exact: true })
    .click();
  await expect(page.getByText("✓ Correct move", { exact: true })).toBeVisible();
});
