import { GameObject, type Layer2D } from "@papit/game-engine";

import { GROUND_Y, WORLD } from "../tuning";

const HEIGHT = 262;
const POST_WIDTH = 22;
const SKULL_WIDTH = 74;

/** How far the board runs past the post behind it, how far it reaches, and its point. */
const BACK = 38, REACH = 158, TIP = 28, HALF = 19;

type Art = Record<"post" | "plank1" | "plank2" | "skull", HTMLImageElement>;

/** The pole at the middle of the map, built from the planks of the wooden sign, an arrow per player. */
export class Pole extends GameObject {
    names: [string, string] = ["???", "???"];

    constructor(private art: Art) {
        super();
        this.position.x = WORLD.width / 2;
        this.position.y = GROUND_Y;
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        const { post, plank1, plank2, skull } = this.art;

        ctx.drawImage(post, -POST_WIDTH / 2, -HEIGHT, POST_WIDTH, HEIGHT + 3);

        arrow(ctx, plank1, -1, -HEIGHT + 62, this.names[0], -.05);
        arrow(ctx, plank2, 1, -HEIGHT + 112, this.names[1], .04);

        const height = SKULL_WIDTH * skull.height / skull.width;
        ctx.drawImage(skull, -SKULL_WIDTH / 2, -HEIGHT - 16, SKULL_WIDTH, height);
    }
}

/** A plank cut to a point, reaching out from the pole, `side` is -1 for left. */
function arrow(ctx: CanvasRenderingContext2D, plank: HTMLImageElement, side: -1 | 1, y: number, name: string, tilt: number) {
    const width = BACK + REACH + TIP + 8;
    const height = width * plank.height / plank.width;

    ctx.save();
    ctx.translate(0, y);

    // the board's shadow on the post
    ctx.fillStyle = "rgba(30, 15, 5, .35)";
    ctx.fillRect(-POST_WIDTH / 2, HALF - 3, POST_WIDTH, 9);

    ctx.rotate(tilt);
    ctx.scale(side, 1);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-BACK, -height);
    ctx.lineTo(REACH, -height);
    ctx.lineTo(REACH, -HALF);
    ctx.lineTo(REACH + TIP, 0);
    ctx.lineTo(REACH, HALF);
    ctx.lineTo(REACH, height);
    ctx.lineTo(-BACK, height);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(plank, -BACK, -height / 2, width, height);
    ctx.restore();

    ctx.scale(side, 1);
    ctx.font = "24px Rye, Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#3a2010";
    ctx.fillText(name, side * (REACH / 2 + 14), 1, REACH - 30);
    ctx.restore();
}
