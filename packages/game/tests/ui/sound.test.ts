import { expect, test } from "@playwright/test";

test("sound starts on the first tap, and a shot plays without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));

    await page.goto("views/game/");
    await page.waitForFunction(() => (window as any).cowboy);
    expect(await page.evaluate(() => (window as any).cowboy.sound.running)).toBe(false);

    await page.mouse.move(300, 300);
    await page.mouse.down();
    await expect.poll(() => page.evaluate(() => (window as any).cowboy.sound.running)).toBe(true);
    await page.waitForFunction(() => (window as any).cowboy.left.state.ammo === 5);
    await page.mouse.up();

    await expect.poll(() => page.evaluate(() => (window as any).cowboy.sound.buffers.get("fly")?.length)).toBe(5);
    expect(errors).toEqual([]);
});

test("the volumes save their values and mute keeps them", async ({ page }) => {
    await page.goto("views/game/");
    await page.waitForFunction(() => (window as any).cowboy);

    const result = await page.evaluate(() => {
        const { sound } = (window as any).cowboy;
        sound.unlock();
        sound.setVolume("sounds", .4);
        sound.mute = true;
        return { volume: sound.volumes.sounds, mute: sound.mute };
    });

    expect(result).toEqual({ volume: .4, mute: true });
});
