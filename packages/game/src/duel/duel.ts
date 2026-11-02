import { GameObject } from "@papit/game-engine";

import type { Cowboy } from "../cowboy/cowboy";
import { spread, type CowboyEvent } from "../rules";
import { BARREL_TOP, BARREL_X } from "../scene/map";
import { BULLET_PUSH, GROUND_Y, WORLD } from "../tuning";
import { Bullet } from "./bullet";
import { firstHit, type Hit, type Target } from "./hits";

export type DuelEvents = {
    /** Something a cowboy did, for sound and display. */
    action(cowboy: Cowboy, event: CowboyEvent): void;
    /** A bullet reached `target`, null for a barrel or the ground. */
    hit(hit: Hit, bullet: Bullet, target: Cowboy | null): void;
    /** A bullet passed the middle of the map. */
    flyby(): void;
};

const FLYBY = 100;

/** Runs both cowboys and everything in flight. */
export class Duel extends GameObject {
    private bullets = new Set<Bullet>();
    private barrels: Target[] = [BARREL_X, WORLD.width - BARREL_X].map(x => ({
        kind: "barrel",
        a: { x, y: BARREL_TOP },
        b: { x, y: GROUND_Y },
    }));

    constructor(readonly left: Cowboy, readonly right: Cowboy, private events: DuelEvents) {
        super();
        left.opponent = right;
        right.opponent = left;
        left.calibrate();
        right.calibrate();
    }

    override update(dt: number) {
        for (const cowboy of [this.left, this.right]) this.run(cowboy, dt);
    }

    /** After every bullet has moved. */
    override lateUpdate() {
        for (const bullet of this.bullets) this.test(bullet);
    }

    private run(cowboy: Cowboy, dt: number) {
        for (const event of cowboy.advance(dt))
        {
            if (event.type === "shot") this.shoot(cowboy, event.wild);
            this.events.action(cowboy, event);
        }
    }

    private shoot(cowboy: Cowboy, wild: number) {
        const muzzle = cowboy.muzzle;

        // mirrored so a roll means the same on both screens
        const angle = cowboy.aim + spread(wild, Math.random() * 2 - 1) * cowboy.side;
        const bullet = new Bullet(muzzle.x, muzzle.y, angle, cowboy.side);
        this.bullets.add(bullet);
        this.add(bullet);
    }

    private test(bullet: Bullet) {
        const target = bullet.shooter === 1 ? this.right : this.left;
        const hit = firstHit(bullet.from, bullet.to, [...target.hitLines, ...this.barrels]);

        if (hit)
        {
            this.remove(bullet);
            this.bullets.delete(bullet);
            const struck = hit.kind === "barrel" ? null : target;
            if (hit.kind !== "barrel") target.die(hit.kind, bullet.velocity.x * BULLET_PUSH, bullet.velocity.y * BULLET_PUSH);
            this.events.hit(hit, bullet, struck);
            return;
        }

        const { x, y } = bullet.position;
        if (!bullet.passed && Math.abs(x - WORLD.width / 2) < FLYBY)
        {
            bullet.passed = true;
            this.events.flyby();
        }

        if (x < -100 || x > WORLD.width + 100 || y < -WORLD.height || y > GROUND_Y)
        {
            this.remove(bullet);
            this.bullets.delete(bullet);
        }
    }
}
