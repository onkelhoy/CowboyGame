import { startGame } from "@cowboy/game";

Object.assign(window, { cowboy: await startGame() });
