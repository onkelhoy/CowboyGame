import { GameObject, type Layer2D } from "@papit/game-engine";

import type { Point } from "./hits";
import { bannerAt } from "./timeline";

const WIDTH = 330;
const HEIGHT = 96;
/** Seconds of the sign dropping into place. */
const DROP = .22;

const INK = "#3a2010";

/** The win sign. It's in the world and tracks the dead body, it stays on screen. */
export class Banner extends GameObject {
    private text = "";
    private age = 0;
    private follow: (() => Point) | null = null;

    constructor(private planks: [HTMLImageElement, HTMLImageElement]) {
        super();
    }

    show(text: string, follow: () => Point) {
        this.text = text;
        this.follow = follow;
        this.age = 0;
    }

    hide() {
        this.follow = null;
    }

    get showing() {
        return this.follow !== null;
    }

    override update() {
        if (!this.follow) return;

        const { x, y } = bannerAt(this.follow(), WIDTH, HEIGHT);
        this.position.x = x;
        this.position.y = y;
    }

    override render(layer: Layer2D | object) {
        if (!this.follow) return;

        const { ctx } = layer as Layer2D;
        this.age = Math.min(DROP, this.age + 1 / 60);
        const landing = 1 - this.age / DROP;

        ctx.save();
        ctx.translate(0, -60 * landing * landing);
        ctx.rotate(-.02);

        const [top, bottom] = this.planks;
        ctx.drawImage(top, -WIDTH / 2, -HEIGHT / 2 - 6, WIDTH, HEIGHT / 2 + 12);
        ctx.drawImage(bottom, -WIDTH / 2 + 8, -6, WIDTH, HEIGHT / 2 + 12);

        ctx.font = "40px Rye, Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = INK;
        ctx.fillText(this.text, 0, 2, WIDTH - 60);
        ctx.restore();
    }
}
