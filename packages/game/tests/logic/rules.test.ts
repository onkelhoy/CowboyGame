import { expect, test } from "@playwright/test";

import { createCowboy, spread, spreadFor, step, type CowboyEvent, type CowboyState } from "../../src/rules";
import { AMMO, DRAW_LINE, DUCK_TIME, RECOIL, RELOAD, RISE_TIME, SPREAD } from "../../src/tuning";

const DT = 1 / 120;

/** Runs for `seconds` and collects the events. */
function run(state: CowboyState, held: boolean, seconds: number) {
    const events: CowboyEvent[] = [];
    for (let time = 0; time < seconds - DT / 2; time += DT) events.push(...step(state, held, DT));
    return events;
}

const shots = (events: CowboyEvent[]) => events.filter(event => event.type === "shot");

test("holding rises at the rise speed", () => {
    const cowboy = createCowboy();
    run(cowboy, true, RISE_TIME / 2);
    expect(cowboy.stand).toBeCloseTo(.5, 1);
});

test("a release below the draw line is a feint", () => {
    const cowboy = createCowboy();
    run(cowboy, true, RISE_TIME * DRAW_LINE * .8);

    const events = run(cowboy, false, DUCK_TIME);
    expect(events).toEqual([]);
    expect(cowboy.stand).toBe(0);
    expect(cowboy.ammo).toBe(AMMO);
});

test("a release above the draw line fires at once, and the earlier the wilder", () => {
    const wild = (part: number) => {
        const cowboy = createCowboy();
        run(cowboy, true, RISE_TIME * part);
        const [shot] = step(cowboy, false, DT);
        return shot?.type === "shot" ? shot.wild : null;
    };

    expect(wild(.4)).toBeGreaterThan(wild(.8)!);
    expect(wild(.8)).toBeGreaterThan(0);
});

test("the top fires by itself, dead on, and only once", () => {
    const cowboy = createCowboy();
    const events = run(cowboy, true, RISE_TIME + .02);
    expect(shots(events)).toEqual([{ type: "shot", wild: 0 }]);
    expect(cowboy.ammo).toBe(AMMO - 1);

    expect(shots(run(cowboy, true, 2))).toEqual([]);
});

test("there is no position to wait in, a held cowboy ducks after his shot", () => {
    const cowboy = createCowboy();
    run(cowboy, true, RISE_TIME + RECOIL + DUCK_TIME + .05);
    expect(cowboy.stand).toBe(0);
});

test("recoil keeps him up even when he lets go", () => {
    const cowboy = createCowboy();
    run(cowboy, true, RISE_TIME + .02);
    run(cowboy, false, RECOIL / 2);
    expect(cowboy.stand).toBe(1);

    const events = run(cowboy, false, RECOIL / 2 + DUCK_TIME + .05);
    expect(cowboy.stand).toBe(0);
    expect(shots(events)).toEqual([]);
});

test("after a shot he has to let go and press again to rise", () => {
    const cowboy = createCowboy();
    run(cowboy, true, RISE_TIME + RECOIL + DUCK_TIME + .1);
    run(cowboy, true, .3);
    expect(cowboy.stand).toBe(0);

    run(cowboy, false, DT * 2);
    run(cowboy, true, .3);
    expect(cowboy.stand).toBeGreaterThan(0);
});

test("pressing again during the recoil doesn't count, or the top would fire on repeat", () => {
    const cowboy = createCowboy();
    run(cowboy, true, RISE_TIME + .02);
    run(cowboy, false, RECOIL / 3);

    const events = run(cowboy, true, RECOIL + DUCK_TIME + .05);
    expect(shots(events)).toEqual([]);
    expect(cowboy.stand).toBe(0);
});

test("bullets come back one at a time, only fully down", () => {
    const cowboy = createCowboy();
    cowboy.ammo = 3;

    expect(run(cowboy, false, RELOAD * .9)).toEqual([]);
    expect(run(cowboy, false, RELOAD * .2)).toEqual([{ type: "reload" }]);
    expect(cowboy.ammo).toBe(4);

    run(cowboy, false, RELOAD * 10);
    expect(cowboy.ammo).toBe(AMMO);
});

test("no reloading while up, and rising starts the bullet over", () => {
    const cowboy = createCowboy();
    cowboy.ammo = 0;

    run(cowboy, false, RELOAD * .9);
    run(cowboy, true, .1);
    run(cowboy, false, .1);
    expect(cowboy.ammo).toBe(0);
    expect(cowboy.reload).toBeLessThan(RELOAD * .9);
});

test("no ammo clicks, spends nothing and leaves him exposed through the recoil", () => {
    const cowboy = createCowboy();
    cowboy.ammo = 0;

    const events = run(cowboy, true, RISE_TIME + .02);
    expect(events).toEqual([{ type: "click" }]);
    expect(cowboy.stand).toBe(1);
    expect(cowboy.recoil).toBeGreaterThan(0);
});

test("spread falls to nothing at the top", () => {
    expect(spread(0, 1)).toBe(0);
    expect(spread(1, 1)).toBe(SPREAD);
    expect(spread(1, -1)).toBe(-SPREAD);
});

test("the shown spread matches what a release at that height would do", () => {
    expect(spreadFor(DRAW_LINE)).toBeCloseTo(SPREAD);
    expect(spreadFor(1)).toBeCloseTo(0);
    expect(spreadFor(0)).toBe(SPREAD);
});
