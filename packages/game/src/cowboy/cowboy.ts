import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Point, Target } from "../duel/hits";
import { createCowboy, step, type CowboyEvent } from "../rules";
import { COWBOY_SCALE, GROUND_Y, HEAD_FORWARD, WORLD } from "../tuning";
import { Body } from "./body";
import type { Parts } from "./outfit";

/** One cowboy on the map. `side` is 1 for the left one, who faces right. */
export class Cowboy extends GameObject {
    body: Body;
    state = createCowboy();
    /** Where the other cowboy aims, his head when he stands tall. */
    readonly standingHead: Point;
    /** Who he duels. */
    opponent: Cowboy = this;
    /** Who's holding. */
    control: () => boolean = () => false;
    alive = true;

    constructor(private parts: Parts, x: number, readonly side: 1 | -1) {
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
    advance(dt: number): CowboyEvent[] {
        if (!this.alive)
        {
            this.body.tumble(dt);
            return [];
        }

        const events = step(this.state, this.control(), dt);
        this.body.pose(this.state.stand, this.state.kick);
        return events;
    }

    /** Goes down from a bullet, the velocity is in world units per second. */
    die(part: "head" | "body", x: number, y: number) {
        this.alive = false;

        const { x: px, y: py } = this.position;
        const size = this.scale.y;
        this.body.fall({
            left: (this.side === 1 ? 20 - px : px - WORLD.width + 20) / size,
            right: (this.side === 1 ? WORLD.width - 20 - px : px - 20) / size,
            bottom: 0,
        }, part === "head" ? "top" : "neck", x / this.scale.x, y / size);
    }

    /** Back on his feet with a full gun. */
    reset() {
        this.alive = true;
        this.state = createCowboy();
        this.body = new Body(this.parts);
    }

    get muzzle() {
        return this.toWorld(this.body.muzzle);
    }

    /** The angle of a shot leaving now, before any spread. */
    get aim() {
        const muzzle = this.muzzle;
        return Math.atan2(this.opponent.standingHead.y - muzzle.y, this.opponent.standingHead.x - muzzle.x);
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
