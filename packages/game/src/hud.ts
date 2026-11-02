import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Cowboy } from "./cowboy/cowboy";
import { spreadFor } from "./rules";
import { AMMO, DRAW_LINE, WORLD } from "./tuning";

const STEP = Math.PI * 2 / AMMO;
/** A fraction per 1/60 s, how fast the cylinder turns to its next chamber. */
const TURN = .22;
const CONE = 190;

const CENTER = { x: WORLD.width / 2, y: 104 };
const RADIUS = 72;
/** Chambers sit this far out from the middle, as a share of the radius. */
const RING = .6;
const STEEL_LIGHT = "#d9dde3";
const STEEL = "#8d949e";
const STEEL_DARK = "#3c4149";
const OUTLINE = "#1d1410";

/** The revolver in the corner, and a read on your own aim from the gun. */
export class Hud extends GameObject {
    private angle = 0;

    constructor(private cowboy: Cowboy) {
        super();
    }

    override update(dt: number) {
        // the next bullet sits at the top, under the hammer
        const target = -(this.cowboy.state.ammo - 1) * STEP;
        this.angle += (target - this.angle) * (1 - (1 - TURN) ** (60 * dt));
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        if (!this.cowboy.alive) return;

        this.aim(ctx);
        this.cylinder(ctx);
    }

    /** A cone that closes as he rises: dim under the draw line, where letting go is only a feint. */
    private aim(ctx: CanvasRenderingContext2D) {
        const { stand, spent } = this.cowboy.state;
        if (stand === 0 || spent) return;

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

    /** The cylinder seen from behind: fluted steel with a brass cartridge per bullet left. */
    private cylinder(ctx: CanvasRenderingContext2D) {
        const { ammo } = this.cowboy.state;

        ctx.save();
        ctx.translate(CENTER.x, CENTER.y);

        // a dark plate, so it stands out against any sky
        ctx.shadowColor = "rgba(40, 20, 10, .5)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
        circle(ctx, 0, 0, RADIUS + 12, OUTLINE);
        ctx.shadowColor = "transparent";

        ctx.save();
        ctx.rotate(this.angle);
        this.steel(ctx);

        for (let i = 0; i < AMMO; i++)
        {
            const [x, y] = chamber(i, RADIUS * RING);
            circle(ctx, x, y, RADIUS * .25, OUTLINE);
            if (i < ammo) cartridge(ctx, x, y, RADIUS * .22);
            else circle(ctx, x, y, RADIUS * .17, "#0c0908");
        }

        circle(ctx, 0, 0, RADIUS * .17, STEEL_DARK);
        circle(ctx, 0, 0, RADIUS * .1, STEEL_LIGHT);
        ctx.restore();

        // the hammer, fixed while the cylinder turns under it
        ctx.fillStyle = "#e9b949";
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-11, -RADIUS - 15);
        ctx.lineTo(11, -RADIUS - 15);
        ctx.lineTo(0, -RADIUS + 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /** The body of the cylinder, round with a flute cut between each pair of chambers. */
    private steel(ctx: CanvasRenderingContext2D) {
        const shine = ctx.createLinearGradient(-RADIUS, -RADIUS, RADIUS, RADIUS);
        shine.addColorStop(0, STEEL_LIGHT);
        shine.addColorStop(.5, STEEL);
        shine.addColorStop(1, STEEL_DARK);

        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
        for (let i = 0; i < AMMO; i++)
        {
            const [x, y] = chamber(i + .5, RADIUS * 1.04);
            ctx.moveTo(x + RADIUS * .17, y);
            ctx.arc(x, y, RADIUS * .17, 0, Math.PI * 2);
        }
        ctx.fill("evenodd");
    }
}

function chamber(index: number, distance: number): [number, number] {
    const turn = STEP * index - Math.PI / 2;
    return [Math.cos(turn) * distance, Math.sin(turn) * distance];
}

function cartridge(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    const brass = ctx.createRadialGradient(x - radius * .3, y - radius * .3, radius * .1, x, y, radius);
    brass.addColorStop(0, "#ffe9a3");
    brass.addColorStop(1, "#c8921e");
    ctx.fillStyle = brass;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    circle(ctx, x, y, radius * .42, "#9a6c12");
    circle(ctx, x, y, radius * .28, "#e8c25e");
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}
