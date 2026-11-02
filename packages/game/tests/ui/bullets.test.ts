import { expect, test } from "@playwright/test";

test("holding to the top kills a standing cowboy and flies over a ducked one", async ({ page }) => {
    await page.goto("views/game/");
    await page.waitForFunction(() => (window as any).cowboy);

    const alive = () => page.evaluate(() => (window as any).cowboy.right.alive as boolean);

    await page.keyboard.down(" ");
    await page.waitForFunction(() => (window as any).cowboy.left.state.ammo === 5);
    await page.keyboard.up(" ");
    await page.waitForTimeout(500);
    expect(await alive()).toBe(true);

    // a long recoil keeps the other one standing
    await page.evaluate(() => Object.assign((window as any).cowboy.right.state, { stand: 1, recoil: 60 }));

    await page.keyboard.down(" ");
    await expect.poll(alive, { timeout: 3000 }).toBe(false);
    await page.keyboard.up(" ");
});
