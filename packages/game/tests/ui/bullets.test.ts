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

test("?bot gives an opponent who moves", async ({ page }) => {
    await page.goto("views/game/?bot");
    await page.waitForFunction(() => (window as any).cowboy);
    await page.waitForFunction(() => (window as any).cowboy.right.state.stand > 0, undefined, { timeout: 8000 });
});

test("a hit cowboy falls down and stays on the ground, without bad numbers", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));

    await page.goto("views/game/");
    await page.waitForFunction(() => (window as any).cowboy);
    await page.evaluate(() => Object.assign((window as any).cowboy.right.state, { stand: 1, recoil: 60 }));

    await page.keyboard.down(" ");
    await page.waitForFunction(() => !(window as any).cowboy.right.alive);
    await page.keyboard.up(" ");
    await page.waitForTimeout(2500);

    const chest = await page.evaluate(() => (window as any).cowboy.right.body.chest);
    expect(Number.isFinite(chest.x)).toBe(true);
    expect(chest.y).toBeGreaterThan(-30);
    expect(errors).toEqual([]);
});

test("a shot from low down goes up the way the gun points", async ({ page }) => {
    await page.goto("views/game/");
    await page.waitForFunction(() => (window as any).cowboy);

    const aim = (stand: number) => page.evaluate(async stand => {
        const { left } = (window as any).cowboy;
        left.body.pose(stand, 0);
        return left.aim as number;
    }, stand);

    const low = await aim(.36), high = await aim(1);
    expect(low).toBeLessThan(high - .3);
    expect(Math.abs(high)).toBeLessThan(.3);
});
