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
