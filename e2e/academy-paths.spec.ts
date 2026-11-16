import { test, expect } from "@playwright/test";

test("three academy paths each expose twenty lessons and a guided board", async ({ page }) => {
  await page.goto("./");
  const section = page.getByRole("region", { name: "Guided academy paths" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", { name: "Chess foundations" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Middlegame tactics" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Endgame decisions" })).toBeVisible();
  for (const title of ["Chess foundations", "Middlegame tactics", "Endgame decisions"]) {
    await expect(section.getByRole("heading", { name: title })).toBeVisible();
    await section.getByRole("button", { name: "Explore lessons" }).first().click();
    await expect(section.getByRole("listitem")).toHaveCount(20);
    await section.getByRole("button", { name: "← All academy paths" }).click();
  }
  await section.getByRole("button", { name: "Continue path" }).first().click();
  await expect(page.locator(".sequence-intro")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next move" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Course progress" })).toBeVisible();
  await page.getByRole("button", { name: "Practise whole line" }).click();
  await expect(page.getByRole("heading", { name: "Your repertoire move" })).toBeVisible();
});
