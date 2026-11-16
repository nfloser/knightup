import { test, expect } from "@playwright/test";
test("trains a complete Caro-Kann branch against automatic replies", async ({
  page,
}) => {
  await page.goto("./");
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
    page.getByRole("heading", { name: "Play the whole plan" }),
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
