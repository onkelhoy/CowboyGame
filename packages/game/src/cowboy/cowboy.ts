import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Point, Target } from "../duel/hits";
import { createCowboy, step, type CowboyEvent } from "../rules";
import { COWBOY_SCALE, DUCK_TIME, FLY_OFF, GROUND_Y, HEAD_FORWARD, KICK_FADE, LIFT, RISE_TIME, THROW, WORLD } from "../tuning";
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
    /** The other player's cowboy: he follows poses from the wire, and what hits him is decided over there. */
    remote = false;
    private seen = { stand: 0, dir: 0, at: 0 };
    /** The round is decided: nothing he does counts, and no bullet can hit him. */
    private locked = false;
    /** Bullets pass him, the win sign is up. */
    safe = false;
    /** Radians from the forearm to the barrel. */
    private tilt = 0;

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

        // a locked cowboy who fired stands tall, the rest go down
        const held = this.locked ? this.state.spent && !this.state.falling : this.control();
        if (this.remote) return this.follow(dt);

        const events = step(this.state, held, dt);

        // the kick shows from the next frame, a shot leaves the way the gun pointed before it
        const fired = events.some(event => event.type === "shot");
        this.body.pose(this.state.stand, fired ? 0 : this.state.kick);
        return events;
    }

    /** A pose from the other screen. `delay` is how old it is, in seconds. */
    receive(stand: number, dir: number, delay: number) {
        this.seen = { stand, dir, at: performance.now() / 1000 - delay };
    }

    /** He's moving the way the last pose said, moved forward by how long ago that was. */
    private follow(dt: number): CowboyEvent[] {
        const { stand, dir, at } = this.seen;
        const age = Math.max(0, performance.now() / 1000 - at);
        const speed = dir > 0 ? 1 / RISE_TIME : dir < 0 ? -1 / DUCK_TIME : 0;
        const target = Math.min(1, Math.max(0, stand + speed * age));

        // a blend, so a late or lost pose doesn't make him jump
        this.state.stand += (target - this.state.stand) * Math.min(1, 25 * dt);
        this.state.kick = Math.max(0, this.state.kick - KICK_FADE * dt);
        this.body.pose(this.state.stand, this.state.kick);
        return [];
    }

    /** His own gun went off over there. */
    kick() {
        this.state.kick = 1;
    }

    /** Takes the control away. Letting go mid draw shouldn't fire. */
    lock() {
        this.locked = true;
        this.state.drawing = false;
    }

    /** Goes down from a bullet, the velocity is in world units per second. */
    die(part: "head" | "body", x: number, y: number) {
        this.alive = false;

        const { x: px, y: py } = this.position;
        const size = this.scale.y;
        this.body.fall({
            left: (this.side === 1 ? -FLY_OFF - px : px - WORLD.width - FLY_OFF) / size,
            right: (this.side === 1 ? WORLD.width + FLY_OFF - px : px + FLY_OFF) / size,
            bottom: 0,
        }, part === "head" ? "top" : "neck", x / this.scale.x, y / size, Math.sign(x) * THROW / this.scale.x, -LIFT / size);
    }

    /** Back on his feet with a full gun. */
    reset() {
        this.alive = true;
        this.locked = false;
        this.safe = false;
        this.seen = { stand: 0, dir: 0, at: 0 };
        this.state = createCowboy();
        this.body = new Body(this.parts);
    }

    /** Where his torso is in the world, for what follows the body around. */
    get chest() {
        return this.toWorld(this.body.chest);
    }

    get muzzle() {
        return this.toWorld(this.body.muzzle);
    }

    /** The angle of a shot leaving now, before any spread: the way the gun points. */
    get aim() {
        const angle = this.body.gunAngle + this.tilt;
        return this.side === 1 ? angle : Math.PI - angle;
    }

    /** Lines the gun up, so that fully up it points right at the other cowboy's head. */
    calibrate() {
        this.body.pose(1, 0);
        const muzzle = this.muzzle;
        const { x, y } = this.opponent.standingHead;
        this.tilt = Math.atan2(y - muzzle.y, (x - muzzle.x) * this.side) - this.body.gunAngle;
        this.body.pose(0, 0);
    }

    get hitLines(): Target[] {
        return this.remote ? [] : this.bodyLines;
    }

    /** The same lines for a bullet that only has to stop, a remote body is judged on the other screen. */
    get bodyLines(): Target[] {
        if (!this.alive || this.safe) return [];

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
