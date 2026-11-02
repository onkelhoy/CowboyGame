import { GameEngine } from "@papit/game-engine";

/** Boots the game on the page's canvas. */
export function startGame() {
    const engine = new GameEngine({ name: "main", query: "canvas" });
    engine.start();
    return engine;
}
