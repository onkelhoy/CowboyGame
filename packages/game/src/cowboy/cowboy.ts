import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Point, Target } from "../duel/hits";
import { createCowboy, step } from "../rules";
import { COWBOY_SCALE, GROUND_Y, HEAD_FORWARD } from "../tuning";
import { Body } from "./body";
import type { Parts } from "./outfit";

/** One cowboy on the map. `side` is 1 for the left one, who faces right. */
export class Cowboy extends GameObject {
    readonly body: Body;
    readonly state = createCowboy();
    /** Where the other cowboy aims, his head when he stands tall. */
    readonly standingHead: Point;
    /** Who's holding. */
    control: () => boolean = () => false;
    alive = true;

    constructor(parts: Parts, x: number, readonly side: 1 | -1) {
        super();
        this.body = new Body(parts);
        this.position.x = x;
        this.position.y = GROUND_Y;
        this.scale.x = COWBOY_SCALE * side;
        this.scale.y = COWBOY_SCALE;

        this.body.pose(1, 0);
        const { head, tail } = this.body.hitLines.head;
        this.standingHead = this.toWorld({ x: (head.x + tail.x) / 2, y: (head.y + tail.y) / 2 });
        this.body.pose(0, 0);
    }

    /** Runs the rules for one step and sets the pose from them. */
    advance(dt: number) {
        const events = step(this.state, this.alive && this.control(), dt);
        this.body.pose(this.state.stand, this.state.kick);
        return this.alive ? events : [];
    }

    get muzzle() {
        return this.toWorld(this.body.muzzle);
    }

    get hitLines(): Target[] {
        if (!this.alive) return [];

        const { head, body } = this.body.hitLines;
        const forward = { x: HEAD_FORWARD, y: 0 };
        return [
            { kind: "head", a: this.toWorld(head.head, forward), b: this.toWorld(head.tail, forward) },
            { kind: "body", a: this.toWorld(body.head), b: this.toWorld(body.tail) },
        ];
    }

    private toWorld(point: Point, shift: Point = { x: 0, y: 0 }): Point {
        return {
            x: this.position.x + (point.x + shift.x) * this.scale.x,
            y: this.position.y + (point.y + shift.y) * this.scale.y,
        };
    }

    override render(layer: Layer2D | object) {
        this.body.draw((layer as Layer2D).ctx);
    }
}
