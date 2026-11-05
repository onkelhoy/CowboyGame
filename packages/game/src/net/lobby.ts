import { signal } from "@papit/signals";
import { Client, ParentBootstrap, type Network } from "@papit/webrtc";

/** A network as `GET /networks` and `network.invite()` give it. */
export type Info = NonNullable<ReturnType<Network["invite"]>>;

/** `waking` is a free server that's booting, `failed` is a try that didn't work and will be made again. */
export type LobbyStatus = "connecting" | "waking" | "ready" | "failed";

export type LobbyOptions = {
    /** The signal server, `ws://` or `wss://`. */
    url: string;
    /** Its HTTP side, for `/health` and `/networks`. */
    http: string;
    /** Every lobby of this app has this name, that's how they find each other. */
    name: string;
    meta?: Record<string, unknown>;
    rtc?: RTCConfiguration;
    anchors?: number;
    beacon?: number;
    handshakeTimeout?: number;
    /** ms between an anchor's looks for a lobby to merge into. */
    rescan?: number;
    retryMin?: number;
    retryMax?: number;
};

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const byId = (a: Info, b: Info) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/**
 * The one public chord network of an app, plumbing nobody sees. It knows nothing about the game, so other
 * games can use it as it is.
 *
 * - Found with `GET /networks`, the lowest id wins. None, or a join that fails: create one at once. It
 *   never waits for a part that drifted off to come back.
 * - A drifted part re-anchors on its own after missing three beacons, then two lobbies are listed. The
 *   anchor of each looks now and then and merges into the lower id, so everyone can meet again.
 * - A game is a network carried by this one (`carry`), which the server never sees.
 */
export class Lobby {
    readonly status: () => LobbyStatus;
    readonly client: Client;
    network: Network | null = null;
    private setStatus: (status: LobbyStatus) => void;
    private closed = false;
    private merging = false;
    private timer: ReturnType<typeof setInterval> | undefined;

    constructor(private options: LobbyOptions) {
        [this.status, this.setStatus] = signal<LobbyStatus>("connecting");
        this.client = new Client({ url: options.url, rtc: options.rtc, handshakeTimeout: options.handshakeTimeout });
    }

    /** The lobby's id now. It changes when this lobby merges into another. */
    get id() {
        return this.network?.info?.id ?? null;
    }

    /** Resolves once we're in a lobby. `prefer` is the one an invite names, tried first when it's listed. */
    async start(prefer?: string) {
        let delay = this.options.retryMin ?? 3000;
        while (!this.closed)
        {
            try
            {
                const network = await this.enter(prefer);
                this.network = network;
                this.setStatus("ready");
                network.addEventListener("close", () => this.lost(network));
                clearInterval(this.timer);
                this.timer = setInterval(() => void this.mergeCheck(), this.options.rescan ?? 20_000);
                return network;
            }
            catch (error)
            {
                if (this.closed) break;
                console.warn("lobby: trying again", error);
                this.setStatus("failed");
                await wait(delay);
                delay = Math.min(delay * 2, this.options.retryMax ?? 30_000);
            }
        }
        throw new Error("closed");
    }

    /** A network carried by the lobby, made here. */
    create(draft: Parameters<Client["create"]>[0], setup: Omit<NonNullable<Parameters<Client["create"]>[1]>, "bootstrap"> = {}) {
        const id = crypto.randomUUID();
        return this.client.create(draft, { ...setup, bootstrap: new ParentBootstrap(this.need(), id) });
    }

    /** A network carried by the lobby, joined by its invite. */
    join(invite: Info, request: Parameters<Client["join"]>[1] = {}, setup: Omit<NonNullable<Parameters<Client["join"]>[2]>, "bootstrap"> = {}) {
        return this.client.join(invite, request, { ...setup, bootstrap: new ParentBootstrap(this.need(), invite.id) });
    }

    /** Is our lobby still listed? If not, become its anchor now, so an invite naming it still works. */
    async keepListed() {
        const network = this.network;
        if (!network || network.anchored || this.closed) return;
        const listed = await this.list().catch(() => null);
        if (!listed || listed.some(info => info.id === network.info?.id)) return;

        console.info("lobby: ours isn't listed, anchoring it again");
        // papit 0.1.0 gap: `network.anchor()` from a peer with no socket rejects with "no socket". The
        // Client only opens the socket for an `anchor-request`, so we ask ourselves. Drop this when fixed.
        network.dispatchEvent(new CustomEvent("anchor-request", { detail: { from: network.me } }));
    }

    close() {
        this.closed = true;
        clearInterval(this.timer);
        this.network?.leave();
        this.client.close();
    }

    private need() {
        if (!this.network || this.network.closed) throw new Error("not in the lobby");
        return this.network;
    }

    private async enter(prefer?: string) {
        await this.wake();
        const { name, meta, anchors, beacon } = this.options;
        const acceptMerge = (info: Info) => info.name === name;

        const listed = (await this.list()).filter(info => info.name === name).sort(byId);
        const first = listed.find(info => info.id === prefer) ?? listed[0];
        console.info("lobby: found", listed.map(info => info.id.slice(0, 8)));

        if (first)
        {
            try
            {
                const network = await this.client.join(first.id, {}, { acceptMerge });
                console.info("lobby: joined", first.id.slice(0, 8));
                return network;
            }
            catch (error)
            {
                // a lobby we can't get into is as good as none, we don't wait for it
                console.warn("lobby: could not join, making a new one", first.id, error);
            }
        }

        const network = await this.client.create({ name, topology: "chord", meta, anchors, beacon }, { acceptMerge });
        console.info("lobby: created", network.info?.id.slice(0, 8));
        return network;
    }

    /** A sleeping free server boots on any request, `/health` is the cheap one. */
    private async wake() {
        for (let i = 0; !this.closed; i++)
        {
            try
            {
                const response = await fetch(`${this.options.http}/health`, { signal: AbortSignal.timeout(10_000) });
                if (response.ok) return;
            }
            catch { /* asleep, or not there */ }
            this.setStatus("waking");
            await wait(Math.min(2000 * (i + 1), 10_000));
        }
    }

    private async list(): Promise<Info[]> {
        const response = await fetch(`${this.options.http}/networks`, { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error(`/networks answered ${response.status}`);
        const all = await response.json();
        return Array.isArray(all) ? all : [];
    }

    /** Only an anchor can merge. Two lobbies of this app: the higher id goes into the lower. */
    private async mergeCheck() {
        const network = this.network;
        if (this.merging || this.closed || !network?.anchored || !network.info) return;
        this.merging = true;

        try
        {
            const mine = network.info.id;
            const lower = (await this.list())
                .filter(info => info.name === this.options.name && info.id < mine)
                .sort(byId)[0];
            if (!lower) return;

            console.info("lobby: merging into", lower.id.slice(0, 8));
            await network.merge(lower.id);
        }
        catch (error)
        {
            console.warn("lobby: merge failed", error);
        }
        finally
        {
            this.merging = false;
        }
    }

    /** The lobby closed under us, so find or make one again. */
    private lost(network: Network) {
        if (this.closed || this.network !== network) return;
        this.network = null;
        this.setStatus("connecting");
        void this.start();
    }
}
