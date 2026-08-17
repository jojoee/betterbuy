import { expect, test } from "@playwright/test";

test("compares, saves, and restores a local comparison", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("A Cost").fill("40");
  await page.getByLabel("A Size").fill("500");
  await page.getByLabel("B Cost").fill("70");
  await page.getByLabel("B Size").fill("1000");
  await expect(page.getByText("B is 12.5% cheaper")).toBeVisible();
  await page.getByRole("button", { name: "Save into history" }).click();
  await page.getByRole("button", { name: "Restore saved comparison" }).click();
  await expect(page.getByLabel("A Cost")).toHaveValue("40");
  await page.reload();
  await expect(page.getByText("1/50")).toBeVisible();
});
