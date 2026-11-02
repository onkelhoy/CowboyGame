import { GameObject, type Layer2D } from "@papit/game-engine";

import { GROUND_Y, WORLD } from "../tuning";

/** How far sky and ground run past the world, for wider and taller screens. */
const BEYOND = 4000;

const FOG_HEIGHT = 240;

const FAR = [[0, 0], [90, 0], [120, -52], [250, -60], [285, 0], [430, 0], [470, -96], [540, -104], [600, -92], [640, 0], [800, 0]] as const;
const NEAR = [[0, 0], [60, 0], [85, -34], [190, -40], [230, 0], [520, 0], [560, -66], [700, -74], [745, 0], [1000, 0]] as const;

/** Sky, sun, two rows of mesas and the ground, drawn rather than loaded. */
export class Backdrop extends GameObject {
    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;

        const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        sky.addColorStop(0, "#f2a65a");
        sky.addColorStop(.55, "#f7cf8e");
        sky.addColorStop(1, "#fbe6bd");
        ctx.fillStyle = sky;
        ctx.fillRect(-BEYOND, -BEYOND, WORLD.width + BEYOND * 2, GROUND_Y + BEYOND);

        ctx.fillStyle = "#fff4d6";
        ctx.beginPath();
        ctx.arc(WORLD.width * .68, 150, 62, 0, Math.PI * 2);
        ctx.fill();

        // the haze settles over each row, so the far one sinks furthest into the sky
        mesas(ctx, FAR, 800, -60, 1.5, "#d98a5b");
        fog(ctx, .8);
        mesas(ctx, NEAR, 1000, -320, 1.15, "#b9623f");
        fog(ctx, .5);

        ctx.fillStyle = "#c98a4e";
        ctx.fillRect(-BEYOND, GROUND_Y, WORLD.width + BEYOND * 2, BEYOND);

        ctx.fillStyle = "#6f4322";
        ctx.fillRect(-BEYOND, GROUND_Y, WORLD.width + BEYOND * 2, 3);
    }
}

function fog(ctx: CanvasRenderingContext2D, thickness: number) {
    const haze = ctx.createLinearGradient(0, GROUND_Y - FOG_HEIGHT, 0, GROUND_Y);
    haze.addColorStop(0, "rgba(251, 230, 189, 0)");
    haze.addColorStop(1, `rgba(251, 230, 189, ${thickness})`);
    ctx.fillStyle = haze;
    ctx.fillRect(-BEYOND, GROUND_Y - FOG_HEIGHT, WORLD.width + BEYOND * 2, FOG_HEIGHT);
}

function mesas(ctx: CanvasRenderingContext2D, shape: readonly (readonly [number, number])[], width: number, start: number, height: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-BEYOND, GROUND_Y);
    for (let x = start - width * 6; x < WORLD.width + BEYOND; x += width)
    {
        for (const [px, py] of shape) ctx.lineTo(x + px, GROUND_Y + py * height);
    }
    ctx.lineTo(WORLD.width + BEYOND, GROUND_Y);
    ctx.closePath();
    ctx.fill();
}
