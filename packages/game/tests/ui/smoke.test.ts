import { expect, test } from "@playwright/test";

test("the game page starts without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => response.status() >= 400 && errors.push(`${response.status()} ${response.url()}`));

    await page.goto("views/game/");

    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    await expect.poll(() => canvas.evaluate((el: HTMLCanvasElement) => el.width)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
});
