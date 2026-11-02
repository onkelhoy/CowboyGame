import { GameObject, type Layer2D } from "@papit/game-engine";

import { GROUND_Y, WORLD } from "../tuning";

/** A tumbleweed rolling past now and then, as in the old game. */
export class Tumbleweed extends GameObject {
    private wait = 3 + Math.random() * 8;
    private speed = 0;
    private size = 1;

    constructor(private image: HTMLImageElement) {
        super();
        this.position.x = -200;
    }

    override update(dt: number) {
        if (this.speed === 0)
        {
            this.wait -= dt;
            if (this.wait > 0) return;

            const side = Math.random() < .5 ? -1 : 1;
            this.speed = -side * (120 + Math.random() * 150);
            this.size = .6 + Math.random() * .4;
            this.position.x = WORLD.width / 2 + side * (WORLD.width / 2 + 120);
        }

        this.position.x += this.speed * dt;
        this.position.y = GROUND_Y - Math.abs(Math.sin(this.position.x * .01)) * 45 - this.image.height * this.size / 2;
        this.rotation.z = this.position.x * .01;

        if (Math.abs(this.position.x - WORLD.width / 2) > WORLD.width / 2 + 140)
        {
            this.speed = 0;
            this.wait = 6 + Math.random() * 14;
            this.position.x = -200;
        }
    }

    override render(layer: Layer2D | object) {
        if (this.speed === 0) return;

        const { ctx } = layer as Layer2D;
        const width = this.image.width * this.size;
        const height = this.image.height * this.size;
        ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
    }
}
