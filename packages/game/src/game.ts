import { Camera, GameEngine } from "@papit/game-engine";

import { Cowboy } from "./cowboy/cowboy";
import { loadParts, OUTFITS } from "./cowboy/outfit";
import { createBot } from "./duel/bot";
import { Duel } from "./duel/duel";
import { Hud } from "./hud";
import { Hold } from "./input";
import { Sound } from "./sound";
import { fitWorld } from "./scene/fit";
import { createMap } from "./scene/map";
import { COWBOY_X, WORLD } from "./tuning";

/** Boots the game on the page's canvas. */
export async function startGame() {
    const engine = new GameEngine({ name: "main", query: "canvas" });
    engine.defaultLayer.camera = new Camera({ controllers: [fitWorld()] });

    const [map, you, them] = await Promise.all([createMap(), loadParts(OUTFITS.you), loadParts(OUTFITS.them)]);
    const left = map.actors.add(new Cowboy(you, COWBOY_X, 1));
    const right = map.actors.add(new Cowboy(them, WORLD.width - COWBOY_X, -1));

    const hold = new Hold(engine.canvas);
    left.control = () => hold.held;

    const practice = new URLSearchParams(location.search).has("bot");
    if (practice)
    {
        const bot = createBot();
        right.control = () => bot(right.state, engine.deltaTime);
    }

    const sound = new Sound();
    sound.unlockOnFirstTap();

    const duel = new Duel(left, right, {
        action(_cowboy, event) {
            sound.play(event.type === "shot" ? "shot" : event.type === "click" ? "empty" : "reload");
        },
        flyby: () => sound.play("fly"),
        hit(_hit, _bullet, target) {
            sound.play("hit");

            // the round sequence comes with the kill, until then practice just starts over
            if (target && practice) setTimeout(() => [left, right].forEach(cowboy => cowboy.reset()), 3000);
        },
    });

    engine.add(map.back);
    engine.add(map.actors);
    engine.add(duel);
    engine.add(map.front);
    engine.add(new Hud(left));

    engine.start();
    return { engine, map, left, right, hold, duel, sound };
}
