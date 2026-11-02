import { expect, test, type Page } from "@playwright/test";

const held = (page: Page) => page.evaluate(() => (window as any).cowboy.hold.held as boolean);
const ready = (page: Page) => page.waitForFunction(() => (window as any).cowboy);

test.beforeEach(async ({ page }) => {
    await page.goto("views/game/");
    await ready(page);
});

test("the mouse holds, and a release outside the canvas still counts", async ({ page }) => {
    await page.mouse.move(400, 300);
    await page.mouse.down();
    expect(await held(page)).toBe(true);

    await page.mouse.move(-50, -50);
    await page.mouse.up();
    expect(await held(page)).toBe(false);
});

test("space holds, and losing focus lets go", async ({ page }) => {
    await page.keyboard.down(" ");
    expect(await held(page)).toBe(true);

    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    expect(await held(page)).toBe(false);
    await page.keyboard.up(" ");
});

test("a held cowboy rises and ducks again on release", async ({ page }) => {
    const stand = () => page.evaluate(() => (window as any).cowboy.left.state.stand as number);

    await page.keyboard.down(" ");
    await expect.poll(stand).toBeGreaterThan(.2);
    await page.keyboard.up(" ");
    await expect.poll(stand).toBe(0);
});
