import { GameObject, type Layer2D } from "@papit/game-engine";

import { GROUND_Y, WORLD } from "../tuning";
import { currentPalette, type Palette } from "./palette";

/** How far sky and ground run past the world, for wider and taller screens. */
const BEYOND = 4000;

type Mesa = readonly [x: number, width: number, height: number];

/** One screen of mesas, repeated along the horizon. */
const FAR: readonly Mesa[] = [[40, 300, 170], [420, 210, 120], [700, 340, 200], [1110, 240, 130]];
const NEAR: readonly Mesa[] = [[-40, 240, 92], [330, 170, 66], [880, 280, 108]];
const REPEAT = 1400;

const CLOUDS = [[150, 90, 150], [380, 44, 96], [980, 118, 180], [1320, 70, 120]] as const;

/** Sky, sun, clouds, two rows of mesas and the ground, every edge hard. */
export class Backdrop extends GameObject {
    private colours: Palette = currentPalette();

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        const c = this.colours;

        sky(ctx, c);
        sun(ctx, c);

        ctx.fillStyle = c.cloud;
        for (const [x, y, width] of CLOUDS) cloud(ctx, x, y, width);

        row(ctx, FAR, c.far);
        row(ctx, NEAR, c.near);
        ground(ctx, c);
    }
}

function sky(ctx: CanvasRenderingContext2D, c: Palette) {
    ctx.fillStyle = c.sky[0];
    ctx.fillRect(-BEYOND, -BEYOND, WORLD.width + BEYOND * 2, BEYOND + GROUND_Y);

    const band = GROUND_Y / c.sky.length;
    c.sky.forEach((colour, i) => {
        ctx.fillStyle = colour;
        ctx.fillRect(-BEYOND, band * i, WORLD.width + BEYOND * 2, GROUND_Y - band * i);
    });
}

function sun(ctx: CanvasRenderingContext2D, c: Palette) {
    const x = WORLD.width * .68, y = 170;
    for (const [radius, colour] of [[96, c.sun[1]], [70, c.sun[0]]] as const)
    {
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
    const height = width * .13;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, height / 2);
    ctx.roundRect(x + width * .2, y - height * .8, width * .5, height, height / 2);
    ctx.roundRect(x - width * .15, y + height * .8, width * .6, height, height / 2);
    ctx.fill();
}

function row(ctx: CanvasRenderingContext2D, mesas: readonly Mesa[], colours: Palette["far"]) {
    for (let start = -REPEAT * 3; start < WORLD.width + BEYOND; start += REPEAT)
    {
        for (const [x, width, height] of mesas) mesa(ctx, start + x, width, height, colours);
    }
}

/** A table of rock: lit face, a shaded side, a pale cap and a couple of cracks of strata. */
function mesa(ctx: CanvasRenderingContext2D, x: number, width: number, height: number, [lit, shade, cap]: Palette["far"]) {
    const y = GROUND_Y, top = y - height, inset = width * .16, edge = width * .68;

    ctx.fillStyle = lit;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + inset, top);
    ctx.lineTo(x + width - inset, top);
    ctx.lineTo(x + width, y);
    ctx.fill();

    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(x + edge, top);
    ctx.lineTo(x + width - inset, top);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + edge - width * .08, y);
    ctx.lineTo(x + edge + width * .03, y - height * .55);
    ctx.fill();

    for (const [from, to, level] of [[.22, .5, .36], [.1, .36, .64]] as const)
    {
        ctx.fillRect(x + width * from, y - height * level, width * (to - from), Math.max(3, height * .025));
    }

    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.moveTo(x + inset - 5, top + height * .08);
    ctx.lineTo(x + inset, top);
    ctx.lineTo(x + width - inset, top);
    ctx.lineTo(x + width - inset + 5, top + height * .08);
    ctx.fill();
}

function ground(ctx: CanvasRenderingContext2D, c: Palette) {
    const left = -BEYOND, width = WORLD.width + BEYOND * 2;

    ctx.fillStyle = c.ground[1];
    ctx.fillRect(left, GROUND_Y, width, BEYOND);

    ctx.fillStyle = c.ground[0];
    ctx.fillRect(left, GROUND_Y, width, 7);

    ctx.fillStyle = c.ground[2];
    ctx.fillRect(left, GROUND_Y + 30, width, BEYOND);

    // dashes of shadow and light, so the dirt doesn't read as a flat bar
    for (let x = -1400, i = 0; x < WORLD.width + 1400; x += 58, i++)
    {
        const length = 14 + (i * 37) % 40;
        ctx.fillStyle = i % 3 ? c.ground[2] : c.ground[0];
        ctx.fillRect(x, GROUND_Y + 12 + (i * 23) % 13, length, 3);
    }
}
