import { expect, test, type Page } from "@playwright/test";

const saved = () => (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("cowboy.settings")!));

test.beforeEach(async ({ page }) => {
    await page.goto("views/game/?stage");
    await page.waitForFunction(() => (window as any).cowboy);
});

test("pressing the corner buttons never counts as holding", async ({ page }) => {
    await page.locator("#gear").hover();
    await page.mouse.down();
    expect(await page.evaluate(() => (window as any).cowboy.hold.held)).toBe(false);
    await page.mouse.up();
    await expect(page.locator("#name")).toBeVisible();
});

test("space still holds after a click on a corner button", async ({ page }) => {
    await page.evaluate(() => (window as any).cowboy.sound.unlock());
    await page.evaluate(() => localStorage.clear());
    await page.locator("#mute").click();
    await page.locator("#sound-no").click();
    await page.locator("#mute").click();
    await page.keyboard.down(" ");
    expect(await page.evaluate(() => (window as any).cowboy.hold.held)).toBe(true);
    await page.keyboard.up(" ");
});

test("the first press on sound asks, then it mutes and the choice is saved", async ({ page }) => {
    await page.locator("#mute").click();
    await page.locator("#sound-yes").click();
    expect(await page.evaluate(() => (window as any).cowboy.sound.mute)).toBe(false);

    await page.locator("#mute").click();
    expect(await page.evaluate(() => (window as any).cowboy.sound.mute)).toBe(true);
    expect((await saved()(page)).mute).toBe(true);
});

test("settings save the name and the volumes, and the name reaches the sign", async ({ page }) => {
    await page.locator("#gear").click();
    await page.locator("#name input").fill("Billy");
    await page.locator("input[name=music]").fill("0.2");
    await expect.poll(async () => (await saved()(page)).volumes.music).toBe(.2);
    expect(await page.evaluate(() => (window as any).cowboy.map.pole.names[0])).toBe("Billy");
    expect(await page.evaluate(() => (window as any).cowboy.sound.volumes.music)).toBe(.2);

    await page.reload();
    await page.waitForFunction(() => (window as any).cowboy);
    expect((await saved()(page)).name).toBe("Billy");
});

test("a dialog stops the duel from hearing the keyboard", async ({ page }) => {
    await page.locator("#gear").click();
    await page.keyboard.down(" ");
    expect(await page.evaluate(() => (window as any).cowboy.hold.held)).toBe(false);
    await page.keyboard.up(" ");
});
