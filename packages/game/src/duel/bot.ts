import type { CowboyState } from "../rules";

type Plan = { wait: number; stopAt: number };

const FEINT = [.15, .3];
const SNAP = [.9, .99];

/** A simple opponent for practice: waits, then feints, snaps off a shot or goes all the way. */
export function createBot(random: () => number = Math.random) {
    const between = ([low, high]: number[], roll = random()) => low + (high - low) * roll;

    const plan = (): Plan => {
        const kind = random();
        const stopAt = kind < .3 ? between(FEINT) : kind < .65 ? between(SNAP) : 2;
        return { wait: .3 + random() * 1.2, stopAt };
    };

    let current = plan();

    return (state: CowboyState, dt: number) => {
        // out of bullets he stays down until he has a few again
        if (state.ammo === 0 || (state.ammo < 3 && state.stand === 0 && current.wait <= 0 && random() < .5 * dt)) current.wait = 1.5;

        if (current.wait > 0)
        {
            current.wait -= dt;
            return false;
        }

        if (state.spent || state.stand >= current.stopAt)
        {
            current = plan();
            return false;
        }

        return true;
    };
}
