import type { Room } from "./room";

const PINGS = 5;
const PING_GAP = 150;

type Handler = (payload: any, sender: string) => void;

/** How the other player's pose is written on the wire, small and often. */
export type PoseMessage = { n: number; s: number; d: -1 | 0 | 1 };

/**
 * The two of us in one room. Reliable messages by name, a pose channel that may lose some, and a clock
 * we share: the host's `performance.now()`, found with a few pings.
 */
export class Match {
    /** The other player's id, once they're here. */
    peer: string | null = null;
    /** Milliseconds for a message to go there and back, the lowest we've seen. */
    rtt = 100;
    private offset = 0;
    private handlers = new Map<string, Handler[]>();
    private joined: (() => void)[] = [];
    private left: (() => void)[] = [];
    private poses: ((pose: PoseMessage) => void)[] = [];
    private best = Infinity;
    private pose;
    private sequence = 0;
    private newest = -1;

    constructor(readonly room: Room, readonly host: boolean) {
        // messages before the first `channel()` call are dropped, so it's asked for right away
        this.pose = room.media.channel("pose");
        this.pose.addEventListener("message", event => this.read((event as CustomEvent).detail.data));

        room.addEventListener("message", event => {
            const { type, sender, payload } = (event as CustomEvent).detail;
            for (const handler of this.handlers.get(type) ?? []) handler(payload, sender);
        });
        room.addEventListener("peer", event => this.arrived((event as CustomEvent).detail as string));
        room.addEventListener("peer-left", event => {
            if ((event as CustomEvent).detail !== this.peer) return;
            this.peer = null;
            for (const handler of this.left) handler();
        });

        this.on("ping", (payload, sender) => this.send("pong", { ...payload, th: performance.now() }, sender));
        this.on("pong", ({ t0, th }) => {
            const now = performance.now();
            const rtt = now - t0;
            if (rtt >= this.best) return;
            this.best = this.rtt = rtt;
            // the host is the reference, so only the guest has an offset
            if (!this.host) this.offset = th + rtt / 2 - now;
        });

        const [other] = room.members.filter(member => member !== room.id);
        if (other) this.arrived(other);
    }

    /** The host's clock. */
    get shared() {
        return performance.now() + this.offset;
    }

    /** When a shared time is on our own clock. */
    local(shared: number) {
        return shared - this.offset;
    }

    onJoin(handler: () => void) {
        this.joined.push(handler);
    }

    onLeave(handler: () => void) {
        this.left.push(handler);
    }

    onPose(handler: (pose: PoseMessage) => void) {
        this.poses.push(handler);
    }

    on(type: string, handler: Handler) {
        this.handlers.set(type, [...(this.handlers.get(type) ?? []), handler]);
    }

    /** Reliable. */
    send(type: string, payload: unknown = {}, to: string | null = this.peer) {
        return to ? this.room.send(to, type, payload) : false;
    }

    /** Unreliable and unordered, the newest pose is the only one that counts. */
    sendPose(stand: number, dir: -1 | 0 | 1) {
        if (!this.peer) return;
        const pose: PoseMessage = { n: ++this.sequence, s: Math.round(stand * 1000) / 1000, d: dir };
        this.pose.send(this.peer, JSON.stringify(pose));
    }

    name(): string {
        return this.peer ? String(this.room.profile(this.peer)?.name ?? "") : "";
    }

    close() {
        this.room.close();
    }

    private async arrived(peer: string) {
        if (peer === this.peer) return;
        this.peer = peer;
        for (const handler of this.joined) handler();

        this.best = Infinity;
        for (let i = 0; i < PINGS; i++)
        {
            this.send("ping", { t0: performance.now() });
            await new Promise(resolve => setTimeout(resolve, PING_GAP));
        }
    }

    private read(data: unknown) {
        if (typeof data !== "string") return;
        try
        {
            const pose = JSON.parse(data) as PoseMessage;
            if (typeof pose.s !== "number" || pose.n <= this.newest) return;
            this.newest = pose.n;
            for (const handler of this.poses) handler(pose);
        }
        catch { /* a broken message is lost like any other */ }
    }
}
