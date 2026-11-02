import { AMMO, DRAW_LINE, DUCK_TIME, KICK_FADE, RECOIL, RELOAD, RISE_TIME, SPREAD } from "./tuning";

/** What one cowboy is doing. Plain data, so a bot and the network can use it too. */
export type CowboyState = {
    /** 0 is fully down, 1 fully up. */
    stand: number;
    /** The kick of a shot, 1 right after it. */
    kick: number;
    ammo: number;
    /** Seconds left of the recoil, he can't duck during it. */
    recoil: number;
    /** Seconds into the next bullet. */
    reload: number;
    /** He's rising, so letting go now fires or feints. */
    drawing: boolean;
    /** Set by a shot: he has to let go after the recoil and press again to rise. */
    spent: boolean;
};

export type CowboyEvent =
    /** `wild` is 0 for dead on and 1 at the draw line. */
    | { type: "shot"; wild: number }
    /** He tried to fire with no bullets. */
    | { type: "click" }
    | { type: "reload" };

export function createCowboy(): CowboyState {
    return { stand: 0, kick: 0, ammo: AMMO, recoil: 0, reload: 0, drawing: false, spent: false };
}

/** One step of a cowboy. `held` is the one control. Changes `state`, returns what happened. */
export function step(state: CowboyState, held: boolean, dt: number): CowboyEvent[] {
    const events: CowboyEvent[] = [];

    state.kick = Math.max(0, state.kick - KICK_FADE * dt);

    if (state.recoil > 0)
    {
        state.recoil = Math.max(0, state.recoil - dt);
        return events;
    }

    if (!held) state.spent = false;

    if (held && !state.spent)
    {
        state.drawing = true;
        state.reload = 0;
        state.stand = Math.min(1, state.stand + dt / RISE_TIME);
        if (state.stand === 1) fire(state, 0, events);
        return events;
    }

    const released = state.drawing;
    state.drawing = false;
    if (released && state.stand >= DRAW_LINE)
    {
        fire(state, 1 - (state.stand - DRAW_LINE) / (1 - DRAW_LINE), events);
        return events;
    }

    state.stand = Math.max(0, state.stand - dt / DUCK_TIME);
    if (state.stand === 0) reload(state, dt, events);
    return events;
}

function fire(state: CowboyState, wild: number, events: CowboyEvent[]) {
    state.recoil = RECOIL;
    state.drawing = false;
    state.spent = true;

    if (state.ammo === 0)
    {
        events.push({ type: "click" });
        return;
    }

    state.ammo--;
    state.kick = 1;
    events.push({ type: "shot", wild });
}

function reload(state: CowboyState, dt: number, events: CowboyEvent[]) {
    if (state.ammo >= AMMO)
    {
        state.reload = 0;
        return;
    }

    state.reload += dt;
    if (state.reload < RELOAD) return;

    state.reload -= RELOAD;
    state.ammo++;
    events.push({ type: "reload" });
}

/** Turns a shot's `wild` and a roll from -1 to 1 into radians off the aim. */
export function spread(wild: number, roll: number) {
    return SPREAD * wild * roll;
}
