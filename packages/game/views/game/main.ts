import { startGame } from "@cowboy/game";

const game = await startGame();

// a stand-in for the input of task 4, so both poses show
game.left.stand = 1;
game.right.stand = .3;
