import { GameObject, type Layer2D } from "@papit/game-engine";

import { BULLET_SPEED } from "../tuning";
import type { Point } from "./hits";

const TRAIL = 400;

/** One bullet in flight, `update` moves it and the duel tests the step it made. */
export class Bullet extends GameObject {
    readonly from: Point = { x: 0, y: 0 };
    readonly velocity: Point;
    /** The fly-by sound played. */
    passed = false;
    private readonly origin: Point;

    constructor(x: number, y: number, readonly angle: number, readonly shooter: 1 | -1) {
        super();
        this.position.x = x;
        this.position.y = y;
        this.from.x = x;
        this.from.y = y;
        this.origin = { x, y };
        this.velocity = { x: Math.cos(angle) * BULLET_SPEED, y: Math.sin(angle) * BULLET_SPEED };
    }

    get to(): Point {
        return { x: this.position.x, y: this.position.y };
    }

    override update(dt: number) {
        this.from.x = this.position.x;
        this.from.y = this.position.y;
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        const travelled = Math.min(TRAIL, Math.hypot(this.position.x - this.origin.x, this.position.y - this.origin.y));

        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(60, 30, 10, .28)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-Math.cos(this.angle) * travelled, -Math.sin(this.angle) * travelled);
        ctx.stroke();

        ctx.fillStyle = "#ff9a1f";
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
