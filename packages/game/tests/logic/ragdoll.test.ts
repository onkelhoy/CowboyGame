import { expect, test } from "@playwright/test";

import { Ragdoll } from "../../src/cowboy/ragdoll";

const START = { a: { x: 0, y: -100 }, b: { x: 0, y: -60 }, c: { x: 20, y: -60 } };
const BOUNDS = { left: -500, right: 500, bottom: 0 };
const length = (doll: Ragdoll<"a" | "b" | "c">) => Math.hypot(doll.points.a.x - doll.points.b.x, doll.points.a.y - doll.points.b.y);

function create() {
    return new Ragdoll(START, [["a", "b"], ["b", "c"]], BOUNDS);
}

function run(doll: Ragdoll<"a" | "b" | "c">, seconds: number, dt = 1 / 60) {
    for (let time = 0; time < seconds; time += dt) doll.update(dt);
}

test("it falls to the ground and comes to rest there", () => {
    const doll = create();
    run(doll, 8);

    for (const point of Object.values(doll.points)) expect(point.y).toBeLessThanOrEqual(0);
    expect(doll.points.b.y).toBeGreaterThan(-45);

    const before = doll.points.b.y;
    run(doll, 1);
    expect(Math.abs(doll.points.b.y - before)).toBeLessThan(3);
});

test("sticks keep their length", () => {
    const doll = create();
    run(doll, 1);
    expect(length(doll)).toBeCloseTo(40, 0);
});

test("a push moves it the way the bullet went", () => {
    const doll = create();
    doll.push("a", 1000, 0);
    run(doll, .3);
    expect(doll.points.a.x).toBeGreaterThan(30);
});

test("it never leaves the room", () => {
    const doll = create();
    doll.push("a", 100000, 0);
    run(doll, 2);
    for (const point of Object.values(doll.points)) expect(point.x).toBeLessThanOrEqual(500);
});

test("smaller steps move it about as far in the same time", () => {
    const normal = create(), slowed = create();
    normal.push("a", 300, 0);
    slowed.push("a", 300, 0);

    run(normal, .2, 1 / 60);
    run(slowed, .2, 1 / 600);

    expect(Math.abs(slowed.points.a.x - normal.points.a.x)).toBeLessThan(30);
});
