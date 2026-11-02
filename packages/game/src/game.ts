import { Camera, GameEngine } from "@papit/game-engine";

import { Cowboy } from "./cowboy/cowboy";
import { loadParts, OUTFITS } from "./cowboy/outfit";
import { Duel } from "./duel/duel";
import { Hold } from "./input";
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

    const duel = new Duel(left, right, {
        action() { },
        hit(_hit, _bullet, target) {
            if (target) target.alive = false;
        },
    });

    engine.add(map.back);
    engine.add(map.actors);
    engine.add(duel);
    engine.add(map.front);

    engine.start();
    return { engine, map, left, right, hold, duel };
}
