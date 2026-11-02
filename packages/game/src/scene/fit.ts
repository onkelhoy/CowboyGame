import type { Camera } from "@papit/game-engine";

import { WORLD } from "../tuning";

/**
 * Where the pole shot looks, and how much of the world it shows. `widest` keeps the cowboys off screen
 * on wide phones, and `top` keeps the signs in frame when that leaves the view short.
 */
const POLE = { x: WORLD.width / 2, y: 430, width: 560, height: 340, widest: 640, top: 260 };

const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * Keeps the camera on the world: all of it at any canvas size, or close on the pole. The pole shot
 * and the zoom out are the same camera, so `view` is 0 on the pole and 1 on the whole map.
 */
export class Stage {
    private from = 1;
    private goal = 1;
    private began = 0;
    private length = 0;

    constructor(start = 1) {
        this.from = this.goal = start;
    }

    get view() {
        const t = this.length ? Math.min(1, (performance.now() - this.began) / this.length) : 1;
        return this.from + (this.goal - this.from) * ease(t);
    }

    /** Moves to the pole (0) or the map (1) over `ms`. */
    go(view: 0 | 1, ms: number) {
        this.from = this.view;
        this.goal = view;
        this.began = performance.now();
        this.length = ms;
    }

    controller() {
        return {
            update: (camera: Camera) => {
                if (!camera.width || !camera.height) return;

                const view = this.view;
                const map = Math.min(camera.width / WORLD.width, camera.height / WORLD.height);
                const pole = Math.max(
                    Math.min(camera.width / POLE.width, camera.height / POLE.height),
                    camera.width / POLE.widest,
                );
                const poleY = Math.min(POLE.y, POLE.top + camera.height / pole / 2);

                camera.position.x = POLE.x + (WORLD.width / 2 - POLE.x) * view;
                camera.position.y = poleY + (WORLD.height / 2 - poleY) * view;
                camera.zoom = pole + (map - pole) * view;
            },
        };
    }
}
