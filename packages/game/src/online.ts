import type { GameEngine } from "@papit/game-engine";
import { effect } from "@papit/signals";

import type { Cowboy } from "./cowboy/cowboy";
import type { Bullet } from "./duel/bullet";
import type { Duel } from "./duel/duel";
import type { Hit } from "./duel/hits";
import type { Kill } from "./duel/kill";
import type { Hud } from "./hud";
import type { Hold } from "./input";
import { inviteLink, type Invite } from "./link";
import { Lobby, type Room } from "./net/lobby";
import { Match } from "./net/match";
import type { Pole } from "./scene/pole";
import type { Stage } from "./scene/fit";
import { settings } from "./settings";
import type { Sound } from "./sound";
import { t } from "./text";
import { BULLET_PUSH, NEXT_IN, POSE_EVERY, START_IN, WINS, WORLD } from "./tuning";
import { mountOverlay } from "./ui/overlay";

export type OnlineParts = {
    engine: GameEngine;
    stage: Stage;
    left: Cowboy;
    right: Cowboy;
    duel: Duel;
    kill: Kill;
    hud: Hud;
    pole: Pole;
    hold: Hold;
    sound: Sound;
    clear(): void;
};

type Phase = "connecting" | "pole" | "countdown" | "duel";
type Failure = "full" | "gone";
type RoundMessage = { go?: number; score: [number, number]; over?: boolean; restart?: boolean };

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const mirrorX = (x: number) => WORLD.width - x;
const mirrorAngle = (angle: number) => Math.PI - angle;

/**
 * Milliseconds to keep trying a link. A fresh player can sit in a lobby of their own for seconds before
 * the two merge, and someone coming back from a refresh can find their old self still in the room.
 */
const JOIN_FOR = 18_000;
const JOIN_GAP = 3000;

/** What went wrong with a link, from the words `joinRoom` gives. */
function failure(error: unknown): Failure {
    return /not accepted|rejected/i.test(String((error as Error)?.message ?? error)) ? "full" : "gone";
}

/**
 * Two players, one duel. It runs the flow around the fight: the lobby, the room, the pole, ready, the
 * zoom out and countdown, then the rounds until someone has won enough of them.
 */
export class Online {
    private ui;
    private lobby = new Lobby({ name: settings().name });
    private match: Match | null = null;
    private phase: Phase = "connecting";
    private ready: [boolean, boolean] = [false, false];
    private score: [number, number] = [0, 0];
    private away: [boolean, boolean] = [false, false];
    private interrupted = false;
    /** The kill is over and the next round is waiting for the host. */
    private settled = true;
    private pending: RoundMessage | null = null;
    private timers: ReturnType<typeof setTimeout>[] = [];
    private posing: ReturnType<typeof setInterval> | undefined;
    private hosting: { id: string | null } | null = null;
    private tries = 0;
    private asHost = false;
    private shown = "";
    private watcher: ReturnType<typeof setInterval> | undefined;

    constructor(private parts: OnlineParts) {
        this.ui = mountOverlay(parts.hold);
        parts.kill.clock = () => this.match?.shared ?? performance.now();
        parts.hud.score = () => this.phase === "pole" || this.phase === "connecting" ? null : this.score;

        this.ui.onReady(() => {
            this.ready[0] = true;
            this.match?.send("ready", { ready: true });
            this.show();
            this.maybeStart();
        });
        this.ui.onInvite(() => this.ui.invite.open());

        // the sign carries the names, and a new name reaches the other player too
        effect(() => {
            const { name } = settings();
            this.lobby.setName(name);
            this.match?.room.setProfile({ name });
            this.show();
        });

        document.addEventListener("visibilitychange", this.visibility);
        window.addEventListener("pagehide", () => this.match?.send("bye"));
        this.pause("stage", true);
        this.parts.sound.song("menu");
        this.parts.stage.go(0, 0);
        this.parts.hud.hidden = true;
    }

    /** The host's way in: a link to send. */
    async host() {
        this.asHost = true;
        effect(() => this.status(this.lobby.status()));
        this.ui.invite.text(t("status.connecting"));
        this.ui.invite.open();
        await this.lobby.start();
        await this.open();
        this.watching();
    }

    private watching() {
        this.watcher ??= setInterval(() => this.watch(), 3000);
    }

    /** Nobody's left to play with, so this player is the one with a link to send now. */
    private async rehost(words: string) {
        const old = this.match;
        this.match = null;
        old?.close();

        this.asHost = true;
        this.shown = "";
        history.replaceState(null, "", this.fresh());
        this.ui.note("");
        this.ui.invite.text(words);
        this.ui.invite.open();

        await this.open();
        this.ui.invite.text(words);
        this.watching();
    }

    /** The guest's way in: the link they were sent. */
    async join({ game, host }: Invite) {
        effect(() => this.status(this.lobby.status()));
        this.ui.note(t("status.joining"));
        await this.lobby.start();

        const until = performance.now() + JOIN_FOR;
        for (;;)
        {
            try
            {
                const room = await this.lobby.joinRoom(game, host);
                this.attach(room, false);
                room.setProfile({ name: settings().name });
                this.ui.note("");
                return;
            }
            catch (error)
            {
                console.warn("could not join", error);
                const reason = failure(error);
                if (performance.now() >= until) return reason === "full" ? this.full() : this.rehost(t("invite.ended"));
                await wait(JOIN_GAP);
            }
        }
    }

    // ------------------------------------------------------------------ rooms

    private async open() {
        const { name } = settings();
        const room = await this.lobby.room({
            name: "duel",
            // a third player is turned away, but someone who only refreshed is still counted for a while
            accept: () => !this.match?.peer,
            profile: { name },
            media: { channels: { pose: { ordered: false, maxRetransmits: 0 } } },
        });
        this.hosting = { id: this.lobby.id };
        this.attach(room, true);
        this.link(room);
    }

    private link(room: Room) {
        const { name } = settings();
        const link = inviteLink(location.href, { game: room.network!.id, host: room.host!, by: name });
        if (link === this.shown) return;

        this.shown = link;
        this.ui.invite.link(link);
        this.ui.invite.text(t("invite.send"));
        this.show();
    }

    /** An old link only works through the host's current id, so a host who reconnected needs a new one. */
    private watch() {
        const { match, hosting } = this;
        if (!match || !hosting || match.peer) return;

        const id = this.lobby.id;
        if (id && id !== hosting.id)
        {
            console.warn("host id changed, opening the game again");
            hosting.id = id;
            match.close();
            this.match = null;
            void this.open();
        }
        else if (match.room.host) this.link(match.room);
    }

    private attach(room: Room, host: boolean) {
        const match = this.match = new Match(room, host);

        match.onJoin(() => this.met());
        match.onLeave(() => this.gone(host));
        match.onPose(({ s, d }) => {
            if (this.phase === "duel" && this.parts.right.alive) this.parts.right.receive(s, d, match.rtt / 2000);
        });
        room.addEventListener("members", () => this.show());

        match.on("ready", ({ ready }) => {
            this.ready[1] = ready === true;
            this.show();
            this.maybeStart();
        });
        match.on("start", ({ go }) => this.begin(go, true));
        match.on("round", (message: RoundMessage) => this.round(message));
        match.on("shot", ({ x, y, a }) => {
            const { right, duel, sound } = this.parts;
            if (this.phase !== "duel" || !right.alive) return;
            right.kick();
            sound.play("shot");
            duel.spawn(mirrorX(x), y, mirrorAngle(a), match.rtt / 2000);
        });
        match.on("hit", message => this.theyAreHit(message));
        // a closing tab says goodbye, the connection only notices after a while
        match.on("bye", () => this.gone(host));
        match.on("away", () => this.leaves(1, true));
        match.on("back", () => this.leaves(1, false));

        if (match.peer) this.met();
    }

    /** The other player is here. */
    private met() {
        this.ui.invite.close();
        this.ui.note("");
        if (this.phase === "connecting") this.phase = "pole";
        this.ready = [false, false];
        this.show();
    }

    /** They left, or their link broke. */
    private gone(host: boolean) {
        if (!this.match) return;
        this.match.peer = null;
        this.reset();
        this.phase = "pole";
        this.ready = [false, false];
        this.score = [0, 0];
        this.parts.sound.song("menu");
        this.parts.stage.go(0, 900);
        this.show();

        if (host)
        {
            // the room is still open and the old link works, a friend can come in again
            this.ui.invite.text(t("invite.left"));
            this.ui.invite.open();
            return;
        }

        void this.rehost(t("invite.left"));
    }

    private fresh() {
        const url = new URL(location.href);
        for (const key of ["game", "host", "by"]) url.searchParams.delete(key);
        return url.toString();
    }

    private full() {
        this.ui.note("");
        this.ui.message(t("message.fullHeader"), t("message.fullText"), [
            { label: t("message.startNew"), run: () => location.assign(this.fresh()) },
        ]);
    }

    // ------------------------------------------------------------------ the pole

    /** The signs, the buttons and the note. */
    private show() {
        const { pole } = this.parts;
        const mine = settings().name || "???";
        const theirs = this.match?.peer ? this.match.name() || t("status.someone") : "???";
        pole.names[0] = this.ready[0] ? `${mine} ✓` : mine;
        pole.names[1] = this.ready[1] ? `${theirs} ✓` : theirs;

        if (this.phase === "connecting")
        {
            this.ui.actions({ ready: null, invite: !!this.hosting });
            return;
        }

        if (this.phase !== "pole")
        {
            this.ui.actions({ ready: null, invite: false });
            return;
        }

        const here = !!this.match?.peer;
        this.ui.actions({ ready: here ? this.ready[0] : null, waitingFor: theirs, invite: !here && !!this.hosting });
    }

    private status(status: string) {
        if (this.phase !== "connecting") return;

        if (status === "failed") this.tries++;
        const words = status === "waking" ? t("status.waking")
            : status === "failed" ? t(this.tries > 1 ? "status.failedMore" : "status.failed")
                : status === "ready" ? "" : t("status.connecting");

        if (!this.asHost) this.ui.note(words);
        else if (words) this.ui.invite.text(words);
    }

    // ------------------------------------------------------------------ rounds

    private maybeStart() {
        const { match, phase } = this;
        if (!match?.host || phase !== "pole" || !this.ready[0] || !this.ready[1]) return;

        const go = match.shared + START_IN;
        match.send("start", { go });
        this.begin(go, true);
    }

    /** Everything is set for a round, then 3, 2, 1, GO! at `go` on the shared clock. */
    private begin(go: number, fresh: boolean) {
        const { match, parts } = this;
        if (!match) return;

        this.reset();
        this.phase = "countdown";
        this.settled = false;
        this.interrupted = false;
        this.ready = [false, false];
        parts.hud.hidden = false;
        this.pause("stage", true);
        this.parts.sound.song("duel");
        this.show();

        if (fresh)
        {
            this.score = [0, 0];
            parts.stage.go(1, 1400);
            this.ui.bars(true);
        }

        const at = match.local(go);
        const after = (when: number, run: () => void) => {
            const delay = when - performance.now();
            if (delay >= -50) this.timers.push(setTimeout(run, Math.max(0, delay)));
        };
        for (const number of [3, 2, 1]) after(at - number * 1000, () => this.ui.count(String(number)));
        after(at, () => this.live());
    }

    private live() {
        this.phase = "duel";
        this.ui.count("GO!", 800);
        this.ui.bars(false);
        this.pause("stage", false);

        clearInterval(this.posing);
        this.posing = setInterval(() => this.sendPose(), POSE_EVERY * 1000);
    }

    private sendPose() {
        const { left } = this.parts;
        if (this.phase !== "duel" || !left.alive) return;

        const { state } = left;
        const dir = state.recoil > 0 ? 0 : state.spent ? (state.falling ? -1 : 0) : state.drawing ? 1 : state.stand > 0 ? -1 : 0;
        this.match?.sendPose(state.stand, dir);
    }

    /** One of our bullets left the gun. */
    shot(angle: number, from: { x: number; y: number }) {
        if (this.phase === "duel") this.match?.send("shot", { x: from.x, y: from.y, a: angle });
    }

    /** One of theirs hit us, the one who gets shot decides. */
    hit(hit: Hit, bullet: Bullet) {
        const at = this.parts.kill.clock();
        this.match?.send("hit", { kind: hit.kind, x: hit.x, y: hit.y, vx: bullet.velocity.x, vy: bullet.velocity.y, a: bullet.angle, at });
        this.parts.kill.strike(this.parts.left, hit, bullet.angle, at);
    }

    /** They told us they were hit, in their own view of the map. */
    private theyAreHit({ kind, x, y, vx, vy, a, at }: { kind: "head" | "body"; x: number; y: number; vx: number; vy: number; a: number; at: number }) {
        const { right, kill } = this.parts;
        if ((this.phase !== "duel" && !kill.active) || !right.alive || kill.closed(at)) return;

        right.die(kind, -vx * BULLET_PUSH, vy * BULLET_PUSH);
        kill.strike(right, { kind, x: mirrorX(x), y }, mirrorAngle(a), at);
    }

    /** Called when the win sign goes up. Counts the round and says what's on it. */
    banner(winner: Cowboy | null) {
        const { left, right } = this.parts;
        if (winner === left) this.score[0]++;
        else if (winner === right) this.score[1]++;

        const over = this.score.some(wins => wins >= WINS);
        if (!winner) return t("round.draw");
        if (winner === left) return t(over ? "round.winDuel" : "round.win");
        return t(over ? "round.loseDuel" : "round.lose");
    }

    /** The win sign has had its time. The host decides what comes next. */
    roundDone() {
        const { match } = this;
        this.settled = true;
        if (!match) return;

        if (match.host)
        {
            const over = this.score.some(wins => wins >= WINS);
            const message: RoundMessage = { score: this.score, over, go: over ? undefined : match.shared + NEXT_IN };
            match.send("round", message);
            this.round(message);
        }
        else if (this.pending)
        {
            const message = this.pending;
            this.pending = null;
            this.round(message);
        }
    }

    private round(message: RoundMessage) {
        const { match } = this;
        if (!match) return;

        // our kill can still be on the way to its end, a second or so behind the host's
        if (!this.settled && !message.restart)
        {
            this.pending = message;
            return;
        }

        // the host's score is the one that counts, and it's written from the host's side
        if (!match.host) this.score = [message.score[1], message.score[0]];

        if (message.over) this.finish();
        else if (message.go !== undefined) this.begin(message.go, false);
    }

    /** Someone has the wins: back to the pole, and a rematch is both pressing ready again. */
    private finish() {
        this.reset();
        this.phase = "pole";
        this.ready = [false, false];
        this.score = [0, 0];
        this.parts.stage.go(0, 1200);
        this.parts.hud.hidden = true;
        this.pause("stage", true);
        this.parts.sound.song("menu");
        this.show();
    }

    // ------------------------------------------------------------------ away and gone

    private visibility = () => {
        const hidden = document.hidden;
        this.match?.send(hidden ? "away" : "back");
        this.leaves(0, hidden);
    };

    /** A player's tab went away or came back. A hidden one can't decide hits, so the round stops. */
    private leaves(who: 0 | 1, away: boolean) {
        this.away[who] = away;
        const playing = this.phase === "duel" || this.phase === "countdown";

        if (away && playing && !this.parts.kill.active)
        {
            this.interrupted = true;
            this.clearTimers();
            this.ui.count("");
            this.pause("away", true);
            this.parts.engine.timeScale = 0;
            if (who === 1) this.ui.note(t("status.away", { name: this.match?.name() || t("invite.friend") }));
        }

        if (!away && !this.away[0] && !this.away[1])
        {
            this.ui.note("");
            this.pause("away", false);
            if (this.parts.engine.timeScale === 0) this.parts.engine.timeScale = 1;

            // the round starts over through the countdown, nothing is scored
            const { match } = this;
            if (this.interrupted && match?.host)
            {
                const message: RoundMessage = { score: this.score, restart: true, go: match.shared + NEXT_IN };
                match.send("round", message);
                this.round(message);
            }
        }
    }

    // ------------------------------------------------------------------ helpers

    /** Everything on the map back to the start. */
    private reset() {
        this.clearTimers();
        clearInterval(this.posing);
        this.ui.count("");
        this.ui.bars(false);
        this.ui.closeMessage();
        this.parts.clear();
        this.pending = null;
        this.interrupted = false;
        this.away = [false, false];
        this.pause("away", false);
        this.parts.engine.timeScale = 1;
    }

    private clearTimers() {
        for (const timer of this.timers) clearTimeout(timer);
        this.timers = [];
    }

    private pause(reason: string, paused: boolean) {
        this.parts.hold.pause(reason, paused);
    }
}
