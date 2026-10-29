import { expect, test } from "@playwright/test";

test("전국 지도에서 시·도를 고르면 그 지역 행사 영역이 나타난다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Kids Trip Finder");
  await expect(
    page.getByRole("navigation", { name: "대한민국 시·도 지도" }).getByRole("link"),
  ).toHaveCount(17);

  await page.getByRole("link", { name: "서울" }).click();

  await expect(page).toHaveURL(/region=seoul/);
  await expect(page.getByRole("heading", { level: 2, name: "서울 지역 행사" })).toBeVisible();
});
