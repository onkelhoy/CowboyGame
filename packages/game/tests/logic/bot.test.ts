import { expect, test } from "@playwright/test";

import { createBot } from "../../src/duel/bot";
import { createCowboy, step } from "../../src/rules";

const DT = 1 / 60;

function play(seconds: number) {
    const bot = createBot();
    const cowboy = createCowboy();
    let shots = 0, rises = 0, wasDown = true;

    for (let time = 0; time < seconds; time += DT)
    {
        const events = step(cowboy, bot(cowboy, DT), DT);
        shots += events.filter(event => event.type === "shot").length;
        if (wasDown && cowboy.stand > 0) rises++;
        wasDown = cowboy.stand === 0;
    }

    return { shots, rises };
}

test("the bot keeps rising and shooting and never gets stuck", () => {
    const { shots, rises } = play(120);
    expect(shots).toBeGreaterThan(10);
    expect(rises).toBeGreaterThan(shots);
});
