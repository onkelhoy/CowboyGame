import type { Camera } from "@papit/game-engine";

import { WORLD } from "../tuning";

/** Keeps the whole world in view at any canvas size. */
export function fitWorld() {
    return {
        update(camera: Camera) {
            if (!camera.width || !camera.height) return;
            camera.position.x = WORLD.width / 2;
            camera.position.y = WORLD.height / 2;
            camera.zoom = Math.min(camera.width / WORLD.width, camera.height / WORLD.height);
        },
    };
}
