import { test, expect } from "@playwright/test";
test("trains a complete Caro-Kann branch against automatic replies", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Caro–Kann Build/ }).click();
  await expect(
    page.getByRole("region", { name: "Caro–Kann course guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Caro–Kann · against the Panov/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Caro–Kann · against the Two Knights/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Caro–Kann · against the Fantasy/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Caro–Kann · against the Advance/ })
    .click();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  for (const san of ["c6", "d5", "Bf5", "e6", "c5", "Nc6"]) {
    await expect(
      page.getByRole("heading", { name: "Your repertoire move" }),
    ).toBeVisible();
    await page.getByLabel("Your move in English SAN").fill(san);
    await page.getByRole("button", { name: "Check", exact: true }).click();
  }
  await expect(page.locator(".sequence-screen .feedback")).toContainText(
    "Whole line complete",
  );
  await expect(
    page.getByRole("heading", { name: "Study a system" }),
  ).toBeVisible();
  await expect(
    page.getByText("1 / 6 lines recalled without help."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Caro–Kann · against the Exchange/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Level 1 · 10 XP" }),
  ).toBeVisible();
});
test("lesson categories include all three phases and phone training stays readable", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  const categories = page.getByRole("group", { name: "Lesson categories" });
  for (const name of ["Openings", "Middlegame", "Endgames"]) {
    await categories.getByRole("button", { name, exact: true }).click();
    await expect(
      page.locator(".academy .course-grid").last().getByRole("button").first(),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: /Activate the king/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Caro–Kann Build/ }).click();
  await page
    .getByRole("button", { name: /Caro–Kann · against the Advance/ })
    .click();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  await expect(
    page.getByRole("heading", { name: "Your repertoire move" }),
  ).toBeVisible();
  if (testInfo.project.name === "mobile") {
    const metrics = await page.locator(".sequence-screen").evaluate((el) => ({
      font: parseFloat(
        getComputedStyle(el.querySelector(".feedback")!).fontSize,
      ),
      scroll: document.documentElement.scrollHeight,
      height: innerHeight,
    }));
    expect(metrics.font).toBeGreaterThanOrEqual(14);
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.height + 1);
    await page.screenshot({ path: testInfo.outputPath("sequence-phone.png") });
  }
});
test("a revealed endgame continuation stays assisted and earns no XP", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("group", { name: "Study categories" })
    .getByRole("button", { name: "Endgames", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Random response →" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Train a recommended branch →" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Endgames · Black Finish with checkmate/i })
    .click();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toContainText(
    "Train Rb8#",
  );
  await page.getByLabel("Your move in English SAN").fill("Rb8#");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toContainText(
    "with assistance",
  );
  await expect(
    page.getByRole("heading", { name: "Study a system" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Level 1 · 0 XP" }),
  ).toBeVisible();
});

test("London offers a guided path for White", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("group", { name: "Opening color" })
    .getByRole("button", { name: "White" })
    .click();
  await page.getByRole("button", { name: /London System Develop/ }).click();
  await expect(
    page.getByRole("region", { name: "London System course guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /London · against an early/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue course" }).click();
  await expect(
    page.getByRole("heading", { name: /London · against/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  await expect(
    page.getByRole("group", { name: "Chessboard, White at bottom" }),
  ).toBeVisible();
  await page.getByLabel("Your move in English SAN").fill("d4");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toContainText("d4");
});

test("Vienna explains quiet plans and gambit responses", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("group", { name: "Opening color" })
    .getByRole("button", { name: "White" })
    .click();
  await page.getByRole("button", { name: /Vienna Game Learn/ }).click();
  await expect(
    page.getByRole("region", { name: "Vienna Game course guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Vienna Gambit · against/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Vienna Gambit · if Black takes/ }),
  ).toBeVisible();
});

test("continuing a course advances through lessons and resumes unfinished work", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("group", { name: "Opening color" })
    .getByRole("button", { name: "White" })
    .click();
  await page.getByRole("button", { name: /London System Develop/ }).click();
  await page.getByRole("button", { name: "Continue course" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Course progress" }),
  ).toHaveAttribute("value", "0");
  await expect(page.getByText("Course progress · lesson 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Next move" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Course progress" }),
  ).toHaveAttribute("value", "0");
  await page.getByRole("button", { name: "Practise whole line" }).click();
  for (const san of ["d4", "Bf4", "e3", "Nf3", "Bd3", "O-O"]) {
    await expect(
      page.getByRole("heading", { name: "Your repertoire move" }),
    ).toBeVisible();
    await page.getByLabel("Your move in English SAN").fill(san);
    await page.getByRole("button", { name: "Check", exact: true }).click();
  }
  await expect(
    page.getByRole("heading", {
      name: /London · against a kingside fianchetto/,
    }),
  ).toBeVisible();
  await expect(page.getByText("Course progress · lesson 2 of 3")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Course progress" }),
  ).toHaveAttribute("value", "1");
  await page.getByRole("button", { name: "Back to lessons" }).click();
  await expect(
    page.getByText("1 / 3 lines recalled without help."),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Continue course" }).click();
  await expect(
    page.getByRole("heading", {
      name: /London · against a kingside fianchetto/,
    }),
  ).toBeVisible();
  await expect(page.getByText("Course progress · lesson 2 of 3")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Course progress" }),
  ).toHaveAttribute("value", "1");
});

test("learners see a board demonstration before practising without earning credit", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Caro–Kann Build/ }).click();
  await page
    .getByRole("button", { name: /Caro–Kann · against the Advance/ })
    .click();
  const intro = page.locator(".sequence-intro");
  await expect(intro.getByRole("heading", { name: "The idea" })).toBeVisible();
  await expect(
    intro.getByRole("button", { name: "Previous move" }),
  ).toBeDisabled();
  await intro.getByRole("button", { name: "Next move" }).click();
  await expect(
    intro.getByRole("heading", { name: "White plays e4" }),
  ).toBeVisible();
  await intro.getByRole("button", { name: "Next move" }).click();
  await expect(
    intro.getByRole("heading", { name: "Black plays c6" }),
  ).toBeVisible();
  await expect(
    intro.locator(".walkthrough-copy").getByRole("status"),
  ).toContainText("d5");
  await intro.getByRole("button", { name: "Previous move" }).click();
  await expect(
    intro.getByRole("heading", { name: "White plays e4" }),
  ).toBeVisible();
  await intro
    .getByRole("button", { name: "Back to lessons", exact: true })
    .click();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Level 1 · 0 XP" }),
  ).toBeVisible();
});

test("a hint gives a plan without revealing the next move", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Caro–Kann Build/ }).click();
  await page
    .getByRole("button", { name: /Caro–Kann · against the Advance/ })
    .click();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  await expect(
    page.getByRole("heading", { name: "Your repertoire move" }),
  ).toBeVisible();
  await page.getByLabel("Your move in English SAN").fill("e5");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toHaveClass(/retry/);
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toContainText(
    "Plan hint:",
  );
  await expect(page.locator(".sequence-screen .feedback")).not.toContainText(
    "Train c6",
  );
  await page.getByLabel("Your move in English SAN").fill("c6");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toHaveClass(
    /success/,
  );
});

test("reviewing the explanation during practice returns to the same position", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Caro–Kann Build/ }).click();
  await page
    .getByRole("button", { name: /Caro–Kann · against the Advance/ })
    .click();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  await expect(
    page.getByRole("heading", { name: "Your repertoire move" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review lesson" }).click();
  await expect(
    page
      .locator(".sequence-intro")
      .getByRole("heading", { name: "White plays e4" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Your repertoire move" }),
  ).toBeVisible();
  await page.getByLabel("Your move in English SAN").fill("c6");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".sequence-screen .feedback")).toContainText(
    "Assisted recall",
  );
});

test("course controls and progress fit compact phone views", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== "mobile") return;
  await page.goto("./");
  await page
    .getByRole("group", { name: "Opening color" })
    .getByRole("button", { name: "White" })
    .click();
  await page.getByRole("button", { name: /London System Develop/ }).click();
  await page.getByRole("button", { name: "Continue course" }).click();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  for (const size of [
    { width: 320, height: 568 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(size);
    for (const locator of [
      page.locator(".sequence-screen .board"),
      page.getByRole("button", { name: "Hint", exact: true }),
      page.getByRole("button", { name: "Review lesson" }),
      page.getByRole("progressbar", { name: "Course progress" }),
      page.getByLabel("Your move in English SAN"),
    ]) {
      await expect(locator).toBeVisible();
      await expect
        .poll(async () => {
          const box = await locator.boundingBox();
          return (
            !!box &&
            box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= size.width + 1 &&
            box.y + box.height <= size.height + 1
          );
        })
        .toBe(true);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(size.height + 1);
  }
});

test("guided explanation remains readable in dark mode", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Switch to dark mode/ }).click();
  await page.getByRole("button", { name: /Caro–Kann Build/ }).click();
  await page
    .getByRole("button", { name: /Caro–Kann · against the Advance/ })
    .click();
  await expect(page.locator(".sequence-intro")).toHaveCSS(
    "background-color",
    "rgb(32, 36, 41)",
  );
  await expect(page.getByRole("button", { name: "Next move" })).toBeVisible();
  await page.getByRole("button", { name: "Next move" }).click();
  await expect(
    page.getByRole("heading", { name: "White plays e4" }),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("guided-dark.png") });
});

test("Fried Liver training distinguishes the Na5 alternative", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("group", { name: "Opening color" })
    .getByRole("button", { name: "White" })
    .click();
  await page
    .getByRole("button", { name: /Fried Liver & Two Knights Understand/ })
    .click();
  await expect(
    page.getByRole("region", { name: "Fried Liver course guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Two Knights · the Fried Liver/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Two Knights · against ...Na5/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Two Knights · the Traxler/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Fried Liver · knight retreats/ }),
  ).toBeVisible();
});
