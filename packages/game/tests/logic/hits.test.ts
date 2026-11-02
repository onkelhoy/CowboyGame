import { expect, test } from "@playwright/test";

import { firstHit, type Target } from "../../src/duel/hits";

const head: Target = { kind: "head", a: { x: 100, y: 0 }, b: { x: 100, y: 50 } };
const barrel: Target = { kind: "barrel", a: { x: 40, y: 0 }, b: { x: 40, y: 50 } };

test("a step across a line hits it", () => {
    expect(firstHit({ x: 90, y: 20 }, { x: 150, y: 20 }, [head])).toMatchObject({ kind: "head", x: 100, y: 20 });
});

test("a step that stops short misses", () => {
    expect(firstHit({ x: 0, y: 20 }, { x: 90, y: 20 }, [head])).toBeNull();
});

test("a step above the line misses", () => {
    expect(firstHit({ x: 90, y: -20 }, { x: 150, y: -20 }, [head])).toBeNull();
});

test("the nearest thing on the way wins, in any order", () => {
    expect(firstHit({ x: 0, y: 20 }, { x: 150, y: 20 }, [head, barrel])?.kind).toBe("barrel");
    expect(firstHit({ x: 150, y: 20 }, { x: 0, y: 20 }, [barrel, head])?.kind).toBe("head");
});
