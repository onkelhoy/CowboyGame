import { LINGER_TIME, RAMP_TIME, SLOW_SCALE, SLOW_TIME, WORLD } from "../tuning";

/**
 * The kill in real seconds after the hit. `timeScale` slows the engine's clock too,
 * so all of this runs on `performance.now()`.
 */
export function killAt(elapsed: number) {
    const ramp = Math.min(1, Math.max(0, (elapsed - SLOW_TIME) / RAMP_TIME));
    return {
        timeScale: SLOW_SCALE + (1 - SLOW_SCALE) * ramp * ramp * (3 - 2 * ramp),
        banner: elapsed >= SLOW_TIME,
        done: elapsed >= SLOW_TIME + RAMP_TIME + LINGER_TIME,
    };
}

const BANNER_GAP = 130;
const EDGE = 20;

/** Where the banner sits for a body at this point: over it, and always on screen. */
export function bannerAt(chest: { x: number; y: number }, width: number, height: number) {
    return {
        x: Math.min(WORLD.width - width / 2 - EDGE, Math.max(width / 2 + EDGE, chest.x)),
        y: Math.max(height / 2 + EDGE, chest.y - BANNER_GAP),
    };
}
