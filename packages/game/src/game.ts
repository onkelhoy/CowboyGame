import { Camera, GameEngine } from "@papit/game-engine";

import { fitWorld } from "./scene/fit";
import { createMap } from "./scene/map";

/** Boots the game on the page's canvas. */
export async function startGame() {
    const engine = new GameEngine({ name: "main", query: "canvas" });
    engine.defaultLayer.camera = new Camera({ controllers: [fitWorld()] });

    const map = await createMap();
    engine.add(map.back);
    engine.add(map.actors);
    engine.add(map.front);

    engine.start();
    return { engine, map };
}
