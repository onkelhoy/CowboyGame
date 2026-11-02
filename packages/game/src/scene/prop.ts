import { GameObject, type Layer2D } from "@papit/game-engine";

/** A picture standing on the point it's placed at, its bottom centre on the ground. */
export class Prop extends GameObject {
    constructor(private image: HTMLImageElement, x: number, y: number, private size: number, mirror = false) {
        super();
        this.position.x = x;
        this.position.y = y;
        if (mirror) this.scale.x = -1;
    }

    override render(layer: Layer2D | object) {
        const { ctx } = layer as Layer2D;
        const width = this.image.width * this.size;
        const height = this.image.height * this.size;
        ctx.drawImage(this.image, -width / 2, -height, width, height);
    }
}
