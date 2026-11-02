import { GameObject, type GameEngine } from "@papit/game-engine";

import type { Cowboy } from "../cowboy/cowboy";
import type { Sound } from "../sound";
import { DRAW_WINDOW, SLOW_TIME } from "../tuning";
import type { Banner } from "./banner";
import type { Blood, BloodPools } from "./blood";
import type { Hit, Point } from "./hits";
import { killAt } from "./timeline";

export type KillParts = {
    engine: GameEngine;
    cowboys: [Cowboy, Cowboy];
    sound: Sound;
    blood: Blood;
    pools: BloodPools;
    banner: Banner;
    /** Keeps the camera on a body, null lets go. */
    follow(target: (() => Point) | null): void;
    /** What the win sign says, `winner` is null for a draw. It's asked once a round, when the sign goes up. */
    text(winner: Cowboy | null): string;
    /** The round is over. This is the place for a win celebration, before the rematch. */
    done(winner: Cowboy | null): void;
};

/** Who won: the one who wasn't hit first, and nobody when both were hit within the draw window. */
export function winnerOf<T>(hits: readonly { target: T; at: number }[], cowboys: readonly T[]): T | null {
    const [first, second] = [...hits].sort((a, b) => a.at - b.at);
    if (second && second.target !== first.target && second.at - first.at <= DRAW_WINDOW) return null;
    return cowboys.find(cowboy => cowboy !== first.target) ?? null;
}

/** From the hit to the round's end: slow motion, the sign, back to speed, the fall. */
export class Kill extends GameObject {
    private began: number | null = null;
    private dead: Cowboy[] = [];
    private hits: { target: Cowboy; at: number }[] = [];
    /** The clock hits are timed on. Online that's the shared one, so both screens agree. */
    clock = () => performance.now();
    private ramping = false;

    constructor(private parts: KillParts) {
        super();
    }

    get active() {
        return this.began !== null;
    }

    /** The draw window is shut, whoever's still up stays up. */
    closed(at: number) {
        const [first] = this.hits;
        return first !== undefined && at - first.at > DRAW_WINDOW;
    }

    /** A cowboy was hit at `at` on the clock. */
    strike(target: Cowboy, hit: Hit, angle: number, at = this.clock()) {
        const { sound, blood, cowboys } = this.parts;

        this.hits.push({ target, at });
        blood.spray(hit.x, hit.y, angle);
        this.dead.push(target);
        sound.hitSlow();

        if (this.began !== null) return;

        this.began = performance.now();
        this.parts.engine.timeScale = killAt(0).timeScale;
        for (const cowboy of cowboys) cowboy.lock();
        this.parts.follow(() => target.chest);
        sound.slowMotion(SLOW_TIME);
    }

    override update() {
        if (this.began === null) return;

        const { engine, banner, pools, sound, cowboys } = this.parts;
        const { timeScale, banner: showBanner, done } = killAt((performance.now() - this.began) / 1000);
        engine.timeScale = timeScale;

        if (this.closed(this.clock())) for (const cowboy of cowboys) cowboy.safe = true;

        if (showBanner && !banner.showing)
        {
            const anchor = this.dead[0];
            banner.show(this.parts.text(winnerOf(this.hits, cowboys)), () => anchor.chest);
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
            this.parts.done(winnerOf(this.hits, cowboys));
        }
    }

    /** Clears up for the next round. */
    reset() {
        this.began = null;
        this.dead = [];
        this.hits = [];
        this.ramping = false;
        this.parts.follow(null);
        this.parts.engine.timeScale = 1;
        this.parts.banner.hide();
        this.parts.blood.clear();
        this.parts.pools.clear();
    }
}
