import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Cowboy } from "./cowboy/cowboy";
import { spreadFor } from "./rules";
import { AMMO, DRAW_LINE } from "./tuning";

const STEP = Math.PI * 2 / AMMO;
/** A fraction per 1/60 s, how fast the cylinder turns to its next chamber. */
const TURN = .22;
const CONE = 190;

/** The revolver in the corner, and a read on your own aim from the gun. */
export class Hud extends GameObject {
    private angle = 0;

    constructor(private cowboy: Cowboy) {
        super();
    }

    override update(dt: number) {
        const target = -this.cowboy.state.ammo * STEP;
        this.angle += (target - this.angle) * (1 - (1 - TURN) ** (60 * dt));
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        if (!this.cowboy.alive) return;

        this.aim(ctx);
        this.cylinder(ctx, 76, 76);
    }

    /** A cone that closes as he rises: dim under the draw line, where letting go is only a feint. */
    private aim(ctx: CanvasRenderingContext2D) {
        const { stand, recoil } = this.cowboy.state;
        if (stand === 0 || recoil > 0) return;

        const { x, y } = this.cowboy.muzzle;
        const aim = this.cowboy.aim;
        const drawn = stand >= DRAW_LINE;
        const half = spreadFor(stand);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(aim);

        ctx.globalAlpha = drawn ? .85 : .3;
        ctx.fillStyle = drawn ? "rgba(255, 196, 80, .35)" : "rgba(60, 30, 10, .3)";
        ctx.strokeStyle = drawn ? "#ffd27a" : "#5a3a20";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(half) * CONE, Math.sin(half) * CONE);
        ctx.lineTo(Math.cos(-half) * CONE, Math.sin(-half) * CONE);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    private cylinder(ctx: CanvasRenderingContext2D, x: number, y: number) {
        const { ammo } = this.cowboy.state;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(.74, .74);

        circle(ctx, 0, 0, 25, "#999");
        for (let i = 0; i < AMMO; i++) circle(ctx, ...chamber(this.angle, i, 32), 12.5, "#999");

        for (let i = 0; i < AMMO; i++)
        {
            const [cx, cy] = chamber(this.angle, i, 35);
            circle(ctx, cx, cy, 7.5, "#444");
            if (i < ammo)
            {
                circle(ctx, cx, cy, 7, "#ffd700");
                circle(ctx, cx, cy, 3, "#daa520");
            }
        }

        circle(ctx, 0, 0, 6.5, "#666");
        circle(ctx, 0, 0, 3.5, "#ddd");
        ctx.restore();
    }
}

function chamber(angle: number, index: number, distance: number): [number, number] {
    const turn = STEP * index + angle - Math.PI / 6;
    return [Math.cos(turn) * distance, Math.sin(turn) * distance];
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}
