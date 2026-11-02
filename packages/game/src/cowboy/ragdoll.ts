import { BOUNCE, FRICTION, GRAVITY } from "../tuning";

export type RagdollPoint = { x: number; y: number; oldx: number; oldy: number };
type Stick = { a: RagdollPoint; b: RagdollPoint; length: number };

/** The room a body falls in, the ground is `bottom`. */
export type RagdollBounds = { left: number; right: number; bottom: number };

const PASSES = 4;
/** Steps smaller than this would blow up the velocity they're divided by. */
const SMALLEST_STEP = 1e-5;

/**
 * Verlet points and sticks, ported from the old `Ragdoll.js` to use `dt`. It knows nothing about
 * bones: it takes points and pairs, and whoever draws reads the points back. So papit's ragdoll can
 * replace this later.
 */
export class Ragdoll<Name extends string> {
    readonly points: Record<Name, RagdollPoint>;
    private sticks: Stick[];
    private lastStep = 1 / 60;

    constructor(start: Record<Name, { x: number; y: number }>, sticks: readonly (readonly [Name, Name])[], private bounds: RagdollBounds) {
        const points = {} as Record<Name, RagdollPoint>;
        for (const name of Object.keys(start) as Name[])
        {
            const { x, y } = start[name];
            points[name] = { x, y, oldx: x, oldy: y };
        }

        this.points = points;
        this.sticks = sticks.map(([from, to]) => {
            const a = points[from], b = points[to];
            return { a, b, length: Math.hypot(a.x - b.x, a.y - b.y) };
        });
    }

    /** Adds velocity to one point, in units per second. */
    push(name: Name, x: number, y: number) {
        const point = this.points[name];
        point.oldx -= x * this.lastStep;
        point.oldy -= y * this.lastStep;
    }

    update(dt: number) {
        if (dt < SMALLEST_STEP) return;

        // the steps change size in slow motion, and Verlet keeps its velocity per step
        const change = dt / this.lastStep;
        const friction = FRICTION ** (60 * dt);
        this.lastStep = dt;

        for (const name in this.points) this.move(this.points[name], change, friction, dt);
        for (let pass = 0; pass < PASSES; pass++)
        {
            for (const stick of this.sticks) this.pull(stick);
            for (const name in this.points) this.keepInside(this.points[name]);
        }
    }

    private move(point: RagdollPoint, change: number, friction: number, dt: number) {
        const vx = (point.x - point.oldx) * change * friction;
        const vy = (point.y - point.oldy) * change * friction;

        point.oldx = point.x;
        point.oldy = point.y;
        point.x += vx;
        point.y += vy + GRAVITY * dt * dt;

        const { left, right, bottom } = this.bounds;
        if (point.x < left || point.x > right)
        {
            point.x = Math.min(right, Math.max(left, point.x));
            point.oldx = point.x + vx * BOUNCE;
        }
        if (point.y > bottom)
        {
            point.y = bottom;
            point.oldy = point.y + vy * BOUNCE * BOUNCE;
            // resting on the ground, it drags
            point.oldx = point.x - vx * .6;
        }
    }

    private pull({ a, b, length }: Stick) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance === 0) return;

        const part = (length - distance) / distance / 2;
        a.x -= dx * part;
        a.y -= dy * part;
        b.x += dx * part;
        b.y += dy * part;
    }

    private keepInside(point: RagdollPoint) {
        const { left, right, bottom } = this.bounds;
        point.x = Math.min(right, Math.max(left, point.x));
        point.y = Math.min(bottom, point.y);
    }
}
