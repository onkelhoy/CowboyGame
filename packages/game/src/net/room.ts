import { signal } from "@papit/signals";
import { Client } from "@papit/webrtc";

import { CALL_TIMEOUT, RETRY_MAX, RETRY_MIN, RTC, signalUrl } from "./config";

export type Room = Client;

/** `waking` is a free server that's booting, `failed` is a try that didn't work and will be made again. */
export type RoomStatus = "connecting" | "waking" | "ready" | "failed";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * One duel is one small network of its own, as in papchat: the host makes it and the invite link holds
 * its id, the guest joins it straight through the signal server. Only the host keeps a socket open once
 * the two are linked, so a game costs the server one connection.
 */
export class Connector {
    readonly status: () => RoomStatus;
    private setStatus: (status: RoomStatus) => void;
    private client: Client | null = null;
    private closed = false;

    constructor(private profile: { name: string }, private accept?: () => boolean) {
        [this.status, this.setStatus] = signal<RoomStatus>("connecting");
    }

    /** Makes the game and resolves once it exists, however long the server takes to wake. */
    async host(options: { name: string; media: Parameters<Client["create"]>[0]["media"] }) {
        let delay = RETRY_MIN;
        while (!this.closed)
        {
            const client = this.fresh();
            try
            {
                await client.ready;
                await client.create({ name: options.name, private: true, media: options.media, meta: { app: "cowboy" } });
                this.setStatus("ready");
                return client;
            }
            catch (error)
            {
                this.drop(client);
                if (this.closed) break;
                console.warn("room: could not make the game, trying again", error);
                this.setStatus("failed");
                await wait(delay);
                delay = Math.min(delay * 2, RETRY_MAX);
            }
        }
        throw new Error("closed");
    }

    /** One try at joining. A refusal or a game that's gone rejects, the caller decides whether to try again. */
    async join(id: string) {
        const client = this.fresh();
        try
        {
            await client.ready;
            await client.join(id);
            this.setStatus("ready");
            return client;
        }
        catch (error)
        {
            this.drop(client);
            this.setStatus("failed");
            throw error;
        }
    }

    close() {
        this.closed = true;
        this.drop(this.client);
    }

    private fresh() {
        this.drop(this.client);
        this.setStatus("connecting");
        const client = this.client = new Client({
            url: signalUrl(),
            rtc: RTC,
            topology: "mesh",
            timeout: CALL_TIMEOUT,
            profile: this.profile,
            accept: this.accept ? () => this.accept!() : undefined,
        });
        client.addEventListener("status", () => {
            if (this.client !== client || client.network) return;
            this.setStatus(client.status === "waking" ? "waking" : "connecting");
        });
        return client;
    }

    private drop(client: Client | null) {
        if (!client) return;
        if (this.client === client) this.client = null;
        try { client.close(); } catch { /* closing anyway */ }
    }
}
