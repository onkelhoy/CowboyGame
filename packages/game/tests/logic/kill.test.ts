import { expect, test } from "@playwright/test";

import { bannerAt, killAt } from "../../src/duel/timeline";
import { LINGER_TIME, RAMP_TIME, SLOW_SCALE, SLOW_TIME, WORLD } from "../../src/tuning";

test("a hit starts at slow speed and holds there until the banner", () => {
    expect(killAt(0)).toEqual({ timeScale: SLOW_SCALE, banner: false, done: false });
    expect(killAt(SLOW_TIME - .01).timeScale).toBeCloseTo(SLOW_SCALE);
    expect(killAt(SLOW_TIME - .01).banner).toBe(false);
    expect(killAt(SLOW_TIME).banner).toBe(true);
});

test("speed ramps up without a jump, then stays at full", () => {
    let last = SLOW_SCALE;
    for (let t = SLOW_TIME; t <= SLOW_TIME + RAMP_TIME; t += .02)
    {
        const { timeScale } = killAt(t);
        expect(timeScale).toBeGreaterThanOrEqual(last);
        expect(timeScale - last).toBeLessThan(.1);
        last = timeScale;
    }
    expect(killAt(SLOW_TIME + RAMP_TIME).timeScale).toBeCloseTo(1);
    expect(killAt(SLOW_TIME + RAMP_TIME + 1).timeScale).toBe(1);
});

test("the kill ends after the linger", () => {
    const end = SLOW_TIME + RAMP_TIME + LINGER_TIME;
    expect(killAt(end - .01).done).toBe(false);
    expect(killAt(end).done).toBe(true);
});

test("the banner sits over the body and never leaves the screen", () => {
    const middle = bannerAt({ x: 600, y: 400 }, 300, 100);
    expect(middle).toEqual({ x: 600, y: 270 });

    expect(bannerAt({ x: 20, y: 400 }, 300, 100).x).toBe(170);
    expect(bannerAt({ x: WORLD.width - 5, y: 400 }, 300, 100).x).toBe(WORLD.width - 170);
    expect(bannerAt({ x: 600, y: 50 }, 300, 100).y).toBe(70);
});
