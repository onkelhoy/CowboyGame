import { expect, test, type Page } from "@playwright/test";

const ready = (page: Page) => page.waitForFunction(() => (window as any).cowboy);
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("cowboy.settings") ?? "{}"));

test("a new player names themselves, and the sound answer lets the game start", async ({ page }) => {
    await page.goto("views/game/");
    await ready(page);
    await expect(page.locator(".headline")).toHaveText("Cowboy");
    expect(await page.evaluate(() => (window as any).cowboy.hold.pauses.size)).toBe(1);

    // nameless is a no
    await page.locator("#with-sound").click();
    await expect(page.locator("#landing")).toBeVisible();

    await page.locator("#your-name input").fill("Billy");
    await page.locator("#with-sound").click();
    await expect(page.locator("#landing")).toHaveCount(0);

    expect(await saved(page)).toMatchObject({ name: "Billy", mute: false });
    expect(await page.evaluate(() => (window as any).cowboy.sound.running)).toBe(true);
    expect(await page.evaluate(() => (window as any).cowboy.hold.pauses.size)).toBe(0);
});

test("a saved name skips the name step, but sound is still asked", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("cowboy.settings", JSON.stringify({ name: "Billy" })));
    await page.goto("views/game/");
    await ready(page);
    await expect(page.locator(".poster .name")).toHaveText("Billy");
    await expect(page.locator("#your-name")).toHaveCount(0);
    await page.locator("#no-sound").click();
    expect((await saved(page)).mute).toBe(true);
});

test("a guest sees who challenged them, safely", async ({ page }) => {
    await page.goto(`views/game/?game=g&host=h&by=${encodeURIComponent("<b>Henry</b>")}`);
    await ready(page);
    await expect(page.locator(".headline")).toHaveText("<b>Henry</b> challenges you to a duel!");
});

test("a guest who's been here before skips the sign", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("cowboy.settings", JSON.stringify({ name: "Billy", mute: false })));
    await page.goto("views/game/?game=g&host=h&by=Henry");
    await ready(page);
    await expect(page.locator("#landing")).toHaveCount(0);
});

test("the sign works upright, where the map says to turn the phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("views/game/");
    await ready(page);
    await expect(page.locator("#with-sound")).toBeVisible();
    await expect(page.locator("#turn")).toBeHidden();
});
