import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Cowboy } from "./cowboy/cowboy";
import type { Stage } from "./scene/fit";
import { AMMO, WORLD } from "./tuning";

const STEP = Math.PI * 2 / AMMO;
/** A fraction per 1/60 s, how fast the cylinder turns to its next chamber. */
const TURN = .22;

const CENTER = { x: WORLD.width / 2, y: 88 };
/** Everything below is in the old game's units, this makes it bigger. */
const SIZE = 1.5;
const OUTLINE = "#2a1a12";
const LINE = 4;
const STEEL = "#a9afb8";
const STEEL_SHINE = "#cfd4da";
const HOLE = "#4a4650";
const SCORE_GAP = 110;
const BRASS = "#ffd23f";
const BRASS_DARK = "#d99a1c";

/** The revolver at the top of the screen. */
export class Hud extends GameObject {
    private angle = 0;
    /** Hidden on the pole, and nothing else of the duel is there to look at. */
    hidden = false;
    /** Rounds won, yours first. Null when nothing is being counted. */
    score: (() => [number, number] | null) | null = null;

    constructor(private cowboy: Cowboy, private stage: Stage) {
        super();
    }

    override update(dt: number) {
        // the next bullet sits at the top, under the hammer
        const target = -(this.cowboy.state.ammo - 1) * STEP;
        this.angle += (target - this.angle) * (1 - (1 - TURN) ** (60 * dt));
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        // it's a thing on the map, so it stays out of the close up on a body
        if (this.hidden || this.stage.focus > .02) return;

        ctx.save();
        ctx.translate(0, Math.max(0, this.stage.top));
        const score = this.score?.();
        if (score) this.tally(ctx, score);
        if (this.cowboy.alive) this.cylinder(ctx);
        ctx.restore();
    }

    /** Rounds won, a number on each side of the cylinder. Under it they'd run into the pole on a wide phone. */
    private tally(ctx: CanvasRenderingContext2D, [yours, theirs]: [number, number]) {
        ctx.font = "44px Rye, Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = 7;
        ctx.strokeStyle = OUTLINE;
        ctx.fillStyle = BRASS;
        for (const [text, side] of [[yours, -1], [theirs, 1]] as const)
        {
            ctx.strokeText(String(text), CENTER.x + side * SCORE_GAP, CENTER.y);
            ctx.fillText(String(text), CENTER.x + side * SCORE_GAP, CENTER.y);
        }
    }

    /** The old game's cylinder, flat colours in one thick outline, like a cartoon. */
    private cylinder(ctx: CanvasRenderingContext2D) {
        const { ammo } = this.cowboy.state;

        ctx.save();
        ctx.translate(CENTER.x, CENTER.y);
        ctx.scale(SIZE, SIZE);
        ctx.rotate(this.angle);

        // the outline first, so the lobes and the middle read as one shape
        const shapes: [number, number, number][] = [[0, 0, 30]];
        for (let i = 0; i < AMMO; i++) shapes.push([...chamber(i, 29), 14.5]);
        for (const [x, y, radius] of shapes) circle(ctx, x, y, radius + LINE, OUTLINE);
        for (const [x, y, radius] of shapes) circle(ctx, x, y, radius, STEEL);

        for (let i = 0; i < AMMO; i++)
        {
            const [x, y] = chamber(i, 29);
            circle(ctx, x, y, 11, OUTLINE);
            circle(ctx, x, y, 8.5, i < ammo ? BRASS : HOLE);
            if (i < ammo) circle(ctx, x, y, 3.5, BRASS_DARK);
        }

        circle(ctx, 0, 0, 7, OUTLINE);
        circle(ctx, 0, 0, 4, STEEL_SHINE);
        ctx.restore();
    }
}

function chamber(index: number, distance: number): [number, number] {
    const turn = STEP * index - Math.PI / 2;
    return [Math.cos(turn) * distance, Math.sin(turn) * distance];
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}
