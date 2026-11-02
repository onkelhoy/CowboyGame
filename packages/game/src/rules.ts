import { AMMO, AUTO_FIRE, AUTO_SLOW, DRAW_LINE, DUCK_TIME, KICK_FADE, RECOIL, RELOAD, RISE_TIME, SPREAD } from "./tuning";

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
    /** Set by a shot: no rising until he has been fully down. */
    spent: boolean;
    /** He let go after a shot, and goes all the way down whatever is pressed now. */
    falling: boolean;
    /** Seconds he has been fully up and still holding. */
    aimed: number;
    /** The last shot went off by itself, so the way down is slower. */
    slow: boolean;
};

export type CowboyEvent =
    /** `wild` is 0 for dead on and 1 at the draw line. */
    | { type: "shot"; wild: number }
    /** He tried to fire with no bullets. */
    | { type: "click" }
    | { type: "reload" };

export function createCowboy(): CowboyState {
    return { stand: 0, kick: 0, ammo: AMMO, recoil: 0, reload: 0, drawing: false, spent: false, falling: false, aimed: 0, slow: false };
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

    if (state.spent)
    {
        // he stays up for as long as he holds, only a release ducks him
        if (!held) state.falling = true;
        if (!state.falling) return events;

        state.stand = Math.max(0, state.stand - dt / (DUCK_TIME * (state.slow ? AUTO_SLOW : 1)));
        if (state.stand === 0) state.spent = state.falling = state.slow = false;
        return events;
    }

    if (held)
    {
        state.drawing = true;
        state.reload = 0;
        state.stand = Math.min(1, state.stand + dt / RISE_TIME);

        // he can wait at the top, but not for long
        if (state.stand < 1) state.aimed = 0;
        else if ((state.aimed += dt) >= AUTO_FIRE)
        {
            fire(state, 0, events);
            state.slow = true;
        }
        return events;
    }

    state.aimed = 0;
    const released = state.drawing;
    state.drawing = false;
    if (released && state.stand >= DRAW_LINE)
    {
        fire(state, wildness(state.stand), events);
        return events;
    }

    state.stand = Math.max(0, state.stand - dt / DUCK_TIME);
    if (state.stand === 0) reload(state, dt, events);
    return events;
}

function fire(state: CowboyState, wild: number, events: CowboyEvent[]) {
    state.recoil = RECOIL;
    state.aimed = 0;
    state.slow = false;
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

/** How wild a shot is that leaves at `stand`, 0 for dead on and 1 at the draw line. */
export function wildness(stand: number) {
    return 1 - (stand - DRAW_LINE) / (1 - DRAW_LINE);
}

/** Turns a shot's `wild` and a roll from -1 to 1 into radians off the aim. */
export function spread(wild: number, roll: number) {
    return SPREAD * wild * roll;
}
