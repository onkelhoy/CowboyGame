import { GameObject, type Layer2D } from "@papit/game-engine";

import { COWBOY_SCALE, GROUND_Y } from "../tuning";
import { Body } from "./body";
import type { Parts } from "./outfit";

/** One cowboy on the map. `side` is 1 for the left one, who faces right. */
export class Cowboy extends GameObject {
    readonly body: Body;
    stand = 0;
    shoot = 0;

    constructor(parts: Parts, x: number, readonly side: 1 | -1) {
        super();
        this.body = new Body(parts);
        this.position.x = x;
        this.position.y = GROUND_Y;
        this.scale.x = COWBOY_SCALE * side;
        this.scale.y = COWBOY_SCALE;
    }

    override update() {
        this.body.pose(this.stand, this.shoot);
    }

    override render(layer: Layer2D | object) {
        this.body.draw((layer as Layer2D).ctx);
    }
}
