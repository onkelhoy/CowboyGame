import { GameObject, type Layer2D } from "@papit/game-engine";

import { BLOOD, GRAVITY, GROUND_Y } from "../tuning";
import type { Point } from "./hits";

const DROPS = 42;
const RED = "#8f1a14";
const DARK = "#5e0f0c";
/** World units per second, how fast a pool widens at the start. */
const POOL_SPEED = 46;
const POOL_SIZE = 92;

type Drop = { x: number; y: number; vx: number; vy: number; size: number; landed: boolean };
type Pool = { x: number; size: number; body: () => Point };

/** The drops from a hit. They run on engine time, so they hang in the air in slow motion. */
export class Blood extends GameObject {
    private drops: Drop[] = [];

    /** Sprays out of a hit, along the bullet's way and back up the wound. */
    spray(x: number, y: number, angle: number) {
        if (!BLOOD) return;

        for (let i = 0; i < DROPS; i++)
        {
            const back = Math.random() < .25 ? Math.PI : 0;
            const turn = angle + back + (Math.random() - .5) * 1.1;
            const speed = 90 + Math.random() * 380;
            this.drops.push({
                x, y,
                vx: Math.cos(turn) * speed,
                vy: Math.sin(turn) * speed - 90,
                size: 1.5 + Math.random() * 3,
                landed: false,
            });
        }
    }

    clear() {
        this.drops = [];
    }

    override update(dt: number) {
        for (const drop of this.drops)
        {
            if (drop.landed) continue;

            drop.vy += GRAVITY * dt;
            drop.x += drop.vx * dt;
            drop.y += drop.vy * dt;
            if (drop.y >= GROUND_Y)
            {
                drop.y = GROUND_Y + Math.random() * 6;
                drop.landed = true;
            }
        }
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;

        ctx.fillStyle = RED;
        for (const { x, y, vx, vy, size, landed } of this.drops)
        {
            ctx.beginPath();
            if (landed) ctx.ellipse(x, y, size * 1.8, size * .5, 0, 0, Math.PI * 2);
            else ctx.ellipse(x, y, size * 1.3, size * .8, Math.atan2(vy, vx), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/** Spreads on the ground, drawn behind the cowboys so the body lies in it. */
export class BloodPools extends GameObject {
    private pools: Pool[] = [];

    spread(body: () => Point) {
        if (BLOOD) this.pools.push({ x: body().x, size: 0, body });
    }

    clear() {
        this.pools = [];
    }

    override update(dt: number) {
        for (const pool of this.pools)
        {
            // the body can still slide while it settles
            pool.x += (pool.body().x - pool.x) * Math.min(1, 3 * dt);
            pool.size += POOL_SPEED * dt * (1 - pool.size / POOL_SIZE);
        }
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;

        for (const { x, size } of this.pools)
        {
            ellipse(ctx, x, GROUND_Y + 7, size + 3, size * .17 + 1, DARK);
            ellipse(ctx, x, GROUND_Y + 7, size, size * .17, RED);
        }
    }
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
}
