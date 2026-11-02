import { Camera, GameEngine, GameObject } from "@papit/game-engine";

import { Cowboy } from "./cowboy/cowboy";
import { loadParts, OUTFITS } from "./cowboy/outfit";
import { Hold } from "./input";
import { fitWorld } from "./scene/fit";
import { createMap } from "./scene/map";
import { COWBOY_X, DUCK_TIME, RISE_TIME, WORLD } from "./tuning";

/** Boots the game on the page's canvas. */
export async function startGame() {
    const engine = new GameEngine({ name: "main", query: "canvas" });
    engine.defaultLayer.camera = new Camera({ controllers: [fitWorld()] });

    const [map, you, them] = await Promise.all([createMap(), loadParts(OUTFITS.you), loadParts(OUTFITS.them)]);
    const left = map.actors.add(new Cowboy(you, COWBOY_X, 1));
    const right = map.actors.add(new Cowboy(them, WORLD.width - COWBOY_X, -1));

    engine.add(map.back);
    engine.add(map.actors);
    engine.add(map.front);

    const hold = new Hold(engine.canvas);
    engine.add(new class extends GameObject {
        override update(dt: number) {
            const change = hold.held ? dt / RISE_TIME : -dt / DUCK_TIME;
            left.stand = Math.min(1, Math.max(0, left.stand + change));
        }
    }());

    engine.start();
    return { engine, map, left, right, hold };
}
