import { signal } from "@papit/signals";
import { Client } from "@papit/webrtc";

import { APP, CALL_TIMEOUT, LOBBY_NAME, RACE_GUARD, RESCAN, RETRY_MAX, RETRY_MIN, RTC, SERVER_GAP, signalUrl } from "./config";

type Info = Awaited<ReturnType<Client["list"]>>[number];
export type Room = Client;

/** `waking` is a free server that's booting, `failed` is a try that didn't work and will be made again. */
export type LobbyStatus = "connecting" | "waking" | "ready" | "failed";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const created = (info: Info) => typeof info.meta?.created === "number" ? info.meta.created : Infinity;
const topologyOf = (info: Info) => typeof info.topology === "string" ? info.topology : info.topology.name;

/** The oldest network is the real one, ties go to the smaller id. */
const compare = (a: Info, b: Info) => created(a) - created(b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * The one shared network every player is in, plumbing nobody sees. A game is a room inside it. There's
 * a lot to copy from papchat's lobby here, but no profiles, passwords or presence.
 */
export class Lobby {
    readonly status: () => LobbyStatus;
    private setStatus: (status: LobbyStatus) => void;
    private client: Client | null = null;
    private nextCall = 0;
    private closed = false;
    private guarding = false;
    private timer: ReturnType<typeof setInterval> | undefined;

    constructor(private profile: { name: string }) {
        [this.status, this.setStatus] = signal<LobbyStatus>("connecting");
    }

    /** The id this player has on the network. It changes when the socket reconnects and the host is lost. */
    get id() {
        return this.client?.id ?? null;
    }

    /** Resolves once we're in the shared network, however long that takes. */
    async start() {
        const client = this.client = new Client({
            url: signalUrl(),
            rtc: RTC,
            timeout: CALL_TIMEOUT,
            topology: "chord",
            profile: this.profile,
            // only the younger of two lobbies asks to merge, so the older one says yes
            acceptMerge: () => true,
        });
        client.addEventListener("status", this.sync);

        let delay = RETRY_MIN;
        while (!this.closed)
        {
            try
            {
                await this.enter(client);
                this.setStatus("ready");
                void this.guard(client);
                this.timer = setInterval(() => void this.guard(client), RESCAN);
                return;
            }
            catch (error)
            {
                if (this.closed) return;
                console.warn("lobby: trying again", error);
                this.setStatus("failed");
                await wait(delay);
                delay = Math.min(delay * 2, RETRY_MAX);
            }
        }
    }

    close() {
        this.closed = true;
        clearInterval(this.timer);
        this.client?.close();
    }

    async room(options: Parameters<Client["room"]>[0]) {
        return this.client!.room(options);
    }

    async joinRoom(id: string, host: string) {
        return this.client!.joinRoom(id, host);
    }

    setName(name: string) {
        if (name === this.profile.name) return;
        this.profile.name = name;
        if (this.client?.network) this.client.setProfile({ name });
    }

    private sync = () => {
        const client = this.client;
        if (!client || client.network) return;
        this.setStatus(client.status === "waking" ? "waking" : client.status === "closed" ? "failed" : "connecting");
    };

    /** Joins the most canonical lobby we can, or makes one. */
    private async enter(client: Client) {
        await client.ready;

        // a lobby that doesn't answer is most likely empty, a live one is merged with later by the guard
        const [lobby] = await this.lobbies(client);
        if (lobby)
        {
            try
            {
                await this.call(() => client.join(lobby.id));
            }
            catch (error)
            {
                console.warn("lobby: could not join", lobby.id, error);
            }
        }

        if (client.network) return;
        await this.call(() => client.create({
            name: LOBBY_NAME,
            meta: { app: APP, kind: "lobby", v: 1, created: Date.now() },
        }));
    }

    private async lobbies(client: Client) {
        const all = await this.call(() => client.list());
        return all.filter(info => info.meta?.app === APP && info.meta?.kind === "lobby").sort(compare);
    }

    /** Two people can make a lobby at once, then the younger one's host merges into the older. */
    private async guard(client: Client) {
        if (this.guarding || this.closed || !client.network || client.host !== client.id) return;
        this.guarding = true;

        try
        {
            await wait(RACE_GUARD);
            const lobbies = await this.lobbies(client);
            const mine = lobbies.find(info => info.id === client.serverId);
            if (!mine) return;

            for (const other of lobbies)
            {
                if (compare(other, mine) >= 0) break;
                if (topologyOf(other) !== topologyOf(mine)) continue;
                try
                {
                    await this.call(() => client.merge(other.id));
                    return;
                }
                catch (error)
                {
                    console.warn("lobby: merge refused", error);
                }
            }
        }
        catch (error)
        {
            console.warn("lobby: scan failed", error);
        }
        finally
        {
            this.guarding = false;
        }
    }

    private async call<T>(run: () => Promise<T>) {
        const now = Date.now();
        const at = Math.max(now, this.nextCall);
        this.nextCall = at + SERVER_GAP;
        if (at > now) await wait(at - now);
        return run();
    }
}
