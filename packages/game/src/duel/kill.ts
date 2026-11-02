import { GameObject, type GameEngine } from "@papit/game-engine";

import type { Cowboy } from "../cowboy/cowboy";
import type { Sound } from "../sound";
import { SLOW_TIME } from "../tuning";
import type { Banner } from "./banner";
import type { Blood, BloodPools } from "./blood";
import type { Hit } from "./hits";
import { killAt } from "./timeline";

export type KillParts = {
    engine: GameEngine;
    cowboys: [Cowboy, Cowboy];
    sound: Sound;
    blood: Blood;
    pools: BloodPools;
    banner: Banner;
    /** What the win sign says, `winner` is null for a draw. It's asked once a round, when the sign goes up. */
    text(winner: Cowboy | null): string;
    /** The round is over. This is the place for a win celebration, before the rematch. */
    done(winner: Cowboy | null): void;
};

/** From the hit to the round's end: slow motion, the sign, back to speed, the fall. */
export class Kill extends GameObject {
    private began: number | null = null;
    private dead: Cowboy[] = [];
    private ramping = false;

    constructor(private parts: KillParts) {
        super();
    }

    get active() {
        return this.began !== null;
    }

    /** A cowboy was hit. A second hit in the slow motion turns this into a draw. */
    strike(target: Cowboy, hit: Hit, angle: number) {
        const { sound, blood, cowboys } = this.parts;

        blood.spray(hit.x, hit.y, angle);
        this.dead.push(target);
        sound.hitSlow();

        if (this.began !== null) return;

        this.began = performance.now();
        this.parts.engine.timeScale = killAt(0).timeScale;
        for (const cowboy of cowboys) cowboy.lock();
        sound.slowMotion(SLOW_TIME);
    }

    override update() {
        if (this.began === null) return;

        const { engine, banner, pools, sound, cowboys } = this.parts;
        const { timeScale, banner: showBanner, done } = killAt((performance.now() - this.began) / 1000);
        engine.timeScale = timeScale;

        if (showBanner && !banner.showing)
        {
            for (const cowboy of cowboys) cowboy.safe = true;

            const winner = cowboys.find(cowboy => !this.dead.includes(cowboy)) ?? null;
            const anchor = this.dead[0];
            banner.show(this.parts.text(winner), () => anchor.chest);
        }

        if (showBanner && !this.ramping)
        {
            this.ramping = true;
            sound.dip(false);
            for (const cowboy of this.dead) pools.spread(() => cowboy.chest);
        }

        if (done)
        {
            this.began = null;
            this.parts.done(cowboys.find(cowboy => !this.dead.includes(cowboy)) ?? null);
        }
    }

    /** Clears up for the next round. */
    reset() {
        this.began = null;
        this.dead = [];
        this.ramping = false;
        this.parts.engine.timeScale = 1;
        this.parts.banner.hide();
        this.parts.blood.clear();
        this.parts.pools.clear();
    }
}
