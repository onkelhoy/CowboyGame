import { GameObject, type Layer2D } from "@papit/game-engine";

import { GROUND_Y, WORLD } from "../tuning";

const HEIGHT = 250;
const WOOD = "#7a4a26";
const WOOD_DARK = "#54301a";
const BOARD = "#c98f4e";

/** The pole at the middle of the map, an arrow sign per player, always showing their names. */
export class Pole extends GameObject {
    names: [string, string] = ["???", "???"];

    constructor() {
        super();
        this.position.x = WORLD.width / 2;
        this.position.y = GROUND_Y;
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;

        ctx.fillStyle = WOOD;
        ctx.strokeStyle = WOOD_DARK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-9, 2);
        ctx.lineTo(-7, -HEIGHT);
        ctx.lineTo(7, -HEIGHT - 4);
        ctx.lineTo(9, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        arrow(ctx, -1, -HEIGHT + 44, this.names[0], -.05);
        arrow(ctx, 1, -HEIGHT + 96, this.names[1], .04);
    }
}

/** An arrow shaped board reaching out from the pole, `side` is -1 for left. */
function arrow(ctx: CanvasRenderingContext2D, side: -1 | 1, y: number, name: string, tilt: number) {
    const reach = 150, tip = 26, half = 21;

    ctx.save();
    ctx.translate(0, y);
    ctx.rotate(tilt);

    ctx.beginPath();
    ctx.moveTo(side * -14, -half);
    ctx.lineTo(side * reach, -half);
    ctx.lineTo(side * (reach + tip), 0);
    ctx.lineTo(side * reach, half);
    ctx.lineTo(side * -14, half);
    ctx.closePath();
    ctx.fillStyle = BOARD;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = WOOD_DARK;
    ctx.stroke();

    ctx.fillStyle = WOOD_DARK;
    for (const x of [-8, reach - 8])
    {
        ctx.beginPath();
        ctx.arc(side * x, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.font = "20px Rye, Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#3a2010";
    ctx.fillText(name, side * (reach / 2 + 4), 1, reach - 24);
    ctx.restore();
}
