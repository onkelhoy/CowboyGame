import type { Camera } from "@papit/game-engine";

import { WORLD } from "../tuning";

/**
 * Where the pole shot looks, and how much of the world it shows. `widest` keeps the cowboys off screen
 * on wide phones, and `top` keeps the signs in frame when that leaves the view short.
 */
const POLE = { x: WORLD.width / 2, y: 430, width: 560, height: 340, widest: 640, top: 260 };

const ease = (t: number) => t * t * (3 - 2 * t);

/** How much closer than the map the camera goes on a body, and how long it takes to get there. */
const FOCUS_ZOOM = 1.9;
const FOCUS_MS = 500;
/** The body sits a little low in the shot, the win sign goes over it. */
const FOCUS_LIFT = 45;

/** How far past the edge of the map the camera follows a body that flew off. */
const FOCUS_PAST = 90;

type Point = { x: number; y: number };

/**
 * Keeps the camera on the world: the whole width of it at any canvas size, or close on the pole. The pole shot
 * and the zoom out are the same camera, so `view` is 0 on the pole and 1 on the whole map. The map
 * always fills the width, so a wide phone loses some sky rather than getting a gap past the houses.
 */
export class Stage {
    private from = 1;
    private goal = 1;
    private began = 0;
    private length = 0;
    private target: (() => Point) | null = null;
    private focusFrom = 0;
    private focusGoal = 0;
    private focusBegan = 0;
    /** The world's y at the top of the screen. */
    top = 0;

    constructor(start = 1) {
        this.from = this.goal = start;
    }

    get view() {
        const t = this.length ? Math.min(1, (performance.now() - this.began) / this.length) : 1;
        return this.from + (this.goal - this.from) * ease(t);
    }

    /** How close the camera is on a body, 0 to 1. */
    get focus() {
        const t = Math.min(1, (performance.now() - this.focusBegan) / FOCUS_MS);
        return this.focusFrom + (this.focusGoal - this.focusFrom) * ease(t);
    }

    /** Follows something on the map, null lets go. Runs on real time, it's for the slow motion. */
    follow(target: (() => Point) | null) {
        this.focusFrom = this.focus;
        this.focusGoal = target ? 1 : 0;
        this.focusBegan = performance.now();
        if (target) this.target = target;
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
                const map = camera.width / WORLD.width;
                const mapY = Math.max(WORLD.height / 2, WORLD.height - camera.height / map / 2);
                const pole = Math.max(
                    Math.min(camera.width / POLE.width, camera.height / POLE.height),
                    camera.width / POLE.widest,
                );
                const poleY = Math.min(POLE.y, POLE.top + camera.height / pole / 2);

                let x = POLE.x + (WORLD.width / 2 - POLE.x) * view;
                let y = poleY + (mapY - poleY) * view;
                let zoom = pole + (map - pole) * view;

                const focus = this.focus;
                if (focus > 0 && this.target)
                {
                    const close = map * FOCUS_ZOOM;
                    const halfWidth = camera.width / close / 2, halfHeight = camera.height / close / 2;
                    const { x: bodyX, y: bodyY } = this.target();
                    const atX = Math.min(WORLD.width + FOCUS_PAST - halfWidth, Math.max(halfWidth - FOCUS_PAST, bodyX));
                    const atY = Math.min(WORLD.height - halfHeight, bodyY - FOCUS_LIFT);

                    x += (atX - x) * focus;
                    y += (atY - y) * focus;
                    zoom += (close - zoom) * focus;
                }

                camera.position.x = x;
                camera.position.y = y;
                camera.zoom = zoom;
                this.top = y - camera.height / zoom / 2;
            },
        };
    }
}
