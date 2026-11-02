import { HandshakeType } from '@papit/peer-message';
import { MediaPlan } from '@papit/peer-message';
import { Message } from '@papit/peer-message';
import { Meta } from '@papit/peer-message';
import { NetworkInfo } from '@papit/peer-message';
import { PayloadMap } from '@papit/peer-message';
import { PeerId } from '@papit/peer-message';
import { Profile } from '@papit/peer-message';
import type { RelayAction } from '@papit/peer-message';
import { TopologyConfig } from '@papit/peer-message';

/**
 * Raw data channel by label, across every direct link. No peer-message framing: what one side
 * sends is what the other receives. Messages that arrive before `channel(label)` was called are dropped.
 *
 * @fires message - `CustomEvent<{ peer, data }>`
 */
export declare class Channel extends EventTarget {
    readonly label: string;
    private readonly media;
    constructor(label: string, media: Media);
    /** Peers with this channel open. */
    get peers(): PeerId[];
    /** Sends to one directly linked peer. False when that peer's channel isn't open. */
    send(peer: PeerId, data: ChannelData): boolean;
    /** Bytes queued on that peer's channel and not sent yet; 0 when it isn't open. */
    bufferedAmount(peer: PeerId): number;
    /**
     * Waits until at most `below` bytes are queued on that peer's channel, for pacing large sends.
     * Resolves true once drained, false when the channel isn't open or closes first.
     */
    drain(peer: PeerId, below?: number): Promise<boolean>;
    /** Sends to every directly linked peer with the channel open; returns how many. */
    broadcast(data: ChannelData): number;
}

/** Data a channel can send, as `RTCDataChannel.send` takes it. */
export declare type ChannelData = string | Blob | ArrayBuffer | ArrayBufferView<ArrayBuffer>;

export declare type ChannelDetail = {
    peer: PeerId;
    label: string;
};

export declare type ChannelMessage = {
    peer: PeerId;
    data: string | ArrayBuffer;
};

/**
 * Chord ring: ids hash onto 2^32 positions; each node links to its predecessor, its successor and
 * the successor of `hash + 2^i` for i = 0..31 (its fingers). Lookups take O(log n) hops.
 */
export declare const chord: Topology;

/**
 * Browser peer-to-peer client: talks to `@papit/signal-server`, creates or joins a network and keeps
 * the links its topology wants, over WebRTC data channels. App messages travel peer to peer and
 * fall back to the server while no peer route exists.
 *
 * @fires message - `CustomEvent<ClientMessage>`, an app message for this peer (or a broadcast)
 * @fires peer - `CustomEvent<PeerId>`, a direct link opened
 * @fires peer-left - `CustomEvent<PeerId>`, a direct link closed
 * @fires members - `CustomEvent<{ members: PeerId[], profiles: Record<PeerId, Profile> }>`, the members or their profiles changed
 * @fires status - `CustomEvent<ClientStatus>`, see `status`
 * @fires host - `CustomEvent<PeerId>`, the host changed
 * @fires server-id - `CustomEvent<string>`, the id the server knows the network by changed, see `serverId`
 * @fires merged - `CustomEvent<NetworkInfo>`, this peer's network merged with another and this is the result
 * @fires unreachable - `CustomEvent<{ receiver, ref }>`, a message could not be delivered
 * @fires drop - `CustomEvent<Message>`, a received message was dropped (loop, ttl, filter)
 * @fires error - `CustomEvent<EmitterEvent>`
 * @fires debug - `CustomEvent<EmitterEvent>`
 *
 * Media (streams, channels) lives on `client.media`, see `Media`.
 *
 * `client.room` opens a network over the peers this client already has, with no socket and nothing on
 * the server. The room is a `Client` of its own, with its own `RTCPeerConnection`s. It survives
 * `leave()` on its parent and closes with `close()`.
 */
export declare class Client extends Emitter {
    /** This peer's id, null until the server welcomes it. */
    id: PeerId | null;
    /** The network joined or created, null outside one. */
    network: NetworkInfo | null;
    /** Resolves with this peer's id once the server welcomes it. */
    readonly ready: Promise<PeerId>;
    /** The signalling socket, null for a room. */
    socket: SocketLink | null;
    private reassigned;
    private dropped;
    private draining;
    private serverNetwork;
    private password;
    /** The router, created on the first welcome. */
    router: Network | null;
    /** Media plan, captures, remote streams and plan channels. */
    readonly media: Media;
    private parent;
    private roomId;
    private rooms;
    private pending;
    private retries;
    private lost;
    private _status;
    private connectedOnce;
    private ownProfile;
    private profileMap;
    private wakingTimer;
    private wakeTimer;
    private requests;
    private registerTimer;
    private joining;
    private merging;
    private pace;
    private pruned;
    private tidyTimer;
    private closed;
    private readonly options;
    constructor(options: ClientOptions, parent?: {
        client: Client;
        room: string;
    });
    /**
     * `connecting` → (`waking` when the first connect keeps failing for a few seconds) → `connected`;
     * `reconnecting` after a drop; `closed` once it gives up or `close()` is called.
     */
    get status(): ClientStatus;
    /** The id the server knows the network by, null outside one. Differs from `network.id` once a new host registered it again: invites use this one. */
    get serverId(): string | null;
    /** Every known member profile by id (yours included while in a network). */
    get profiles(): Record<PeerId, Profile>;
    /** A member's profile, or yours without an id. */
    profile(peer?: PeerId): Profile | undefined;
    /**
     * Changes your profile. In a network the host learns it (`network.profile`) and shares it with
     * everyone in `network.members`. False, and an `"error"`, for a profile that isn't a JSON object up to 1 KB.
     */
    setProfile(profile: Profile): boolean;
    /** Current members, sorted, this peer included. */
    get members(): readonly PeerId[];
    private order;
    /** Peers with an open direct link. */
    get links(): readonly PeerId[];
    private openSocket;
    get host(): PeerId | null;
    /** Registers a new network on the server; this peer becomes its host. */
    create(options: {
        name: string;
        private?: boolean;
        password?: string;
        meta?: Record<string, unknown>;
        media?: MediaPlan;
    }): Promise<NetworkInfo>;
    /**
     * Changes the network (host only) with `signal.update`. A new `media` plan is also sent to every
     * member as `network.media` and applied to every link.
     */
    update(options: {
        name?: string;
        private?: boolean;
        password?: string;
        meta?: Record<string, unknown>;
        media?: MediaPlan;
    }): Promise<NetworkInfo>;
    /** Public networks on the server. */
    list(): Promise<NetworkInfo[]>;
    /**
     * Joins a network: the server passes the request to an entry peer, which welcomes (or rejects) us
     * and tells us whom to link to. Resolves on `network.welcome`; rejects on a server error, a reject,
     * an unreachable entry or a timeout.
     */
    join(network: string, password?: string): Promise<NetworkInfo>;
    private enterVia;
    /**
     * Merges this network with another (host only, both hosts need a socket). The other host must allow
     * it with `acceptMerge`, and both networks must use the same topology. The larger network stays, a
     * tie keeps the lower host id: everyone ends up in it, keeping the links its topology still wants.
     * Only the hosts use the server, the rest happens over peer links. Resolves with the merged network.
     */
    merge(network: string, password?: string): Promise<NetworkInfo>;
    private startMerge;
    private bridge;
    /** Ends the current merge: with `error` it's off, and the host link goes. */
    private endMerge;
    private sendMergeList;
    /**
     * Gives every peer the new list at once. Each works out for itself what changes, so nothing needs
     * coordinating from here on and a host dying later doesn't stop anything.
     */
    private unite;
    private startPace;
    private stopPace;
    /** Every wanted link is up, or the time is: the old links nobody wants go, and the merge is over for this peer. */
    private finishPace;
    private prune;
    private tidy;
    private wanted;
    private reopen;
    /**
     * Opens a network on top of this one, with no socket and nothing registered on the server. This peer
     * hosts it. Others join with `joinRoom(room.network.id, room.host)`, so send them those in a message.
     */
    room(options: RoomOptions): Promise<Client>;
    /** Joins a room through its `host`, over this network. Rejects on a reject or a timeout. */
    joinRoom(id: string, host: PeerId, password?: string): Promise<Client>;
    private openRoom;
    private assertOnServer;
    private carry;
    /** Sends an app message to one peer. Reserved types emit `"error"` instead. */
    send(receiver: PeerId, type: string, payload?: unknown): boolean;
    /** Sends an app message to every member. */
    broadcast(type: string, payload?: unknown): boolean;
    /** Leaves the network: tells the server and the peers, then closes every peer link. */
    leave(): void;
    private adopt;
    /** Leaves, closes the socket and any rooms, and rejects pending requests. */
    close(): void;
    private enter;
    private link;
    /** Tries a failed link again after a delay. Only the side that opens the link retries, unless forced; the other answers. */
    private retry;
    private clearRetry;
    /**
     * A link to a wanted member dropped without a `network.leave`: both may still be online, so the
     * member stays while the link is tried again. False when there's nothing to wait for.
     */
    private hold;
    private clearLost;
    /**
     * Exactly one side of a pair opens the link: the lower id, unless only one side wants it.
     * Avoiding glare on the first offer matters: rolling it back discards the data channels.
     */
    private initiates;
    /** Opens the links the topology wants that this side initiates. */
    private reconcile;
    private paceLinks;
    /**
     * Sends the member list to every other member, one by one: a peer this node has no route to yet
     * (a new star hub, say) still gets it through the server.
     */
    private broadcastMembers;
    private emitMembers;
    private setStatus;
    /** Pings `/health` while not connected, so a sleeping host starts booting. Errors are ignored. */
    private startWake;
    private stopWake;
    private recreate;
    /**
     * Registers the network again under a new server id (host only) and tells the members. Joins for it
     * are answered with the network's own id. A new host does this by itself, with retries; call it
     * after an `"error"` of type `"host"`. Resolves with the new `serverId`.
     */
    reregister(): Promise<string>;
    private register;
    private clearRegisterTimer;
    private setServerId;
    private serverField;
    private dropSocket;
    private socketDroppable;
    private sendReserved;
    private signal;
    private request;
    private settle;
    /** True when a pending request consumed the message. */
    private answer;
    private attachRouter;
    private detachRouter;
    private handleJoin;
    private handleMembers;
    private handleLeave;
    /** The host records a member's own profile and shares it. */
    private handleProfile;
    private handleMedia;
    private handleHost;
    private handleMerge;
    /** The other host's list: both groups' peers get the union, each from their own host. */
    private handleMergeList;
    private handleMergeView;
    /** The other side is done with this link. While still linking up it may be my route, so I send my own prune when I'm done. */
    private handlePrune;
    private handleRoom;
    /** A new session from a linked peer means its end of the link is gone: ours goes too, and the offer opens a new one. */
    private handleOffer;
    /** Drops a member that left or lost its link, then repairs the topology. */
    private forget;
    private handleWelcome;
    private handleMessage;
    private handleLink;
    private handleUnlink;
    private handleUnreachable;
    private handleDisconnect;
    private handleSocketOpen;
    private handleSocketClose;
    private handleForward;
}

/** Detail of the client's `"message"` event. */
export declare type ClientMessage<Payload = unknown> = {
    type: string;
    sender: PeerId;
    payload: Payload;
    meta: Meta;
};

export declare type ClientOptions = {
    /** The signal server, e.g. `ws://localhost:3000`. */
    url: string | URL;
    protocols?: string | string[];
    /** Passed to every `RTCPeerConnection`, e.g. `{ iceServers }`. */
    rtc?: RTCConfiguration;
    /**
     * Topology for networks you `create`: a registered name or a config, e.g. `{ name: "multicast", fanout: 5 }`.
     * Joined networks use the one they were created with. Default `"mesh"`.
     */
    topology?: string | TopologyConfig;
    /**
     * Keep the signalling socket once joined and linked. `"host"` keeps it on the host only: the others
     * drop theirs once linked, and their signalling (handshakes of newcomers) goes through the host.
     * False drops it everywhere. Default `"host"`.
     */
    keepSocket?: boolean | "host";
    /** Called on the entry peer for each newcomer; false rejects them. Default: accept everyone. */
    accept?(newcomer: PeerId, info: NetworkInfo): boolean;
    /** Called on the host when another network asks to merge, with its real size. Default: refuse, since a merge can move this whole network. */
    acceptMerge?(network: NetworkInfo, size: number): boolean;
    /** ms before `create`, `list` and `join` reject. */
    timeout?: number;
    /** ms a link may take to open, doubled when ICE connected in time. Default `HANDSHAKE_TIMEOUT`. */
    linkTimeout?: number;
    /** ms without a server connection before giving up for good (`ready` rejects). Default: keep trying. */
    connectTimeout?: number;
    /** While not connected, ping `<http url>/health` every few seconds so a sleeping host boots. Default true. */
    wake?: boolean;
    /** What this peer says about itself, e.g. `{ name }`. At most 1 KB as JSON. */
    profile?: Profile;
    /** Becoming host without a socket opens a new one and registers the network again, so others can still join. Default true. */
    recreate?: boolean;
};

/** Connection state of a `Client`, see `client.status`. */
export declare type ClientStatus = "connecting" | "waking" | "connected" | "reconnecting" | "closed";

export declare abstract class Emitter extends EventTarget {
    on(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    protected error(type: string, message: string, payload: any): void;
    protected debug(type: string, message: string, payload: any): void;
    protected emit<T = any>(type: string, detail: T): void;
}

export declare type EmitterEvent = {
    type: string;
    message: string;
    payload: any;
};

/** FNV-1a 32-bit hash of `id`'s UTF-16 code units: its position on the chord ring. */
export declare function fnv1a(id: string): number;

/**
 * Negotiates one `RTCPeerConnection` with `target` for the whole life of the link, exchanging
 * `handshake.*` messages through the `Network` (the server, or peers). `start()` resolves once the
 * system channel opens; after that it keeps renegotiating on `negotiationneeded` (new channels,
 * transceivers, direction changes) until `terminate()`.
 * Glare is resolved with perfect negotiation: the polite side (the lower id) rolls back, the other ignores.
 */
export declare class Handshake extends Emitter {
    readonly me: string;
    readonly target: string;
    readonly connection: RTCPeerConnection;
    readonly channel: RTCDataChannel;
    readonly network: Network;
    readonly polite: boolean;
    private readonly timeout;
    /** Media hooks, set by the media manager before `start()`. */
    hooks: HandshakeHooks;
    /** Names this connection in offers and answers, so the other side can tell a new one from a renegotiation. */
    readonly session: `${string}-${string}-${string}-${string}-${string}`;
    /** The other side's `session`, once known. */
    remoteSession: string | null;
    private pendingIceCandidates;
    private timer;
    private extended;
    private ignoreOffer;
    private makingOffer;
    private connected;
    private terminated;
    private settle;
    private localCandidates;
    private remoteCandidates;
    constructor(me: string, target: string, connection: RTCPeerConnection, channel: RTCDataChannel, network: Network, polite?: boolean, timeout?: number);
    /**
     * Starts negotiating: as the offerer without `offer`, as the answerer with the received `handshake.offer` payload.
     * Resolves once, when the system channel opens; rejects on failure, timeout or `terminate()` before that.
     */
    start(offer?: Offer): Promise<void>;
    /** Stops listening and clears the timer, for when the link closes. A pending `start()` rejects with `"terminated"`. */
    terminate(): void;
    private clearTimer;
    /** Before the channel opened this fails the handshake; afterwards a failed renegotiation is only reported. */
    private fail;
    /** Snapshot of the connection, attached to failures. No local "srflx"/"relay" candidates means no STUN/TURN was reachable. */
    state(): {
        signaling: RTCSignalingState;
        ice: RTCIceConnectionState;
        gathering: RTCIceGatheringState;
        connection: RTCPeerConnectionState;
        channel: RTCDataChannelState;
        localCandidates: {
            [x: string]: number;
        };
        remoteCandidates: number;
    };
    private createOffer;
    private flushPendingIceCandidates;
    private send;
    private handleTimeout;
    private handleNetworkMessage;
    private handleNegotiationNeeded;
    private handleIceCandidate;
    private handleIceCandidateError;
    private handleIceConnectionStateChange;
    private handleIceGatheringStateChange;
    private handleSignalingStateChange;
    private handleChannelOpen;
    private handleIncomingOffer;
    private handleIncomingAnswer;
    private handleIncomingCandidate;
}

/** How long the first negotiation may take before it fails. */
export declare const HANDSHAKE_TIMEOUT = 15000;

/** How the media manager plugs into negotiation. */
export declare type HandshakeHooks = {
    /** mid → stream name for the transceivers this side named; sent with every offer. */
    streams?(): Record<string, string>;
    /** A remote offer is about to be applied, with its stream map. */
    offer?(streams: Record<string, string>): void;
    /** The remote offer is applied; adjust transceivers before the answer is created. */
    answer?(): void;
};

/** Turns a `ws:`/`wss:` url into the matching `http:`/`https:` origin. */
export declare function httpUrl(url: string | URL): string;

/**
 * One direct, bidirectional byte channel to a remote node: a data channel, the signalling socket, or memory.
 * Fires `"open"`, `"close"` and `"message"` (a `CustomEvent` whose `detail` is the received `Uint8Array`).
 */
export declare interface Link extends EventTarget {
    /** The remote node's id, `SERVER` for the signalling socket. */
    readonly id: PeerId;
    readonly open: boolean;
    /** Sends the bytes as one message. False when the link is not open. */
    send(bytes: Uint8Array): boolean;
    /** Closes the link. Safe to call more than once. */
    close(): void;
}

/** How many times a link that failed to open is tried again. */
export declare const LINK_RETRIES = 3;

/** ms before the first retry of a link; each further retry waits this much longer. */
export declare const LINK_RETRY_DELAY = 2000;

/** ms a peer waits with every link up before it closes the ones the topology no longer wants. */
export declare const LINK_SETTLE = 3000;

/** Longest wait between two connection attempts. */
export declare const MAX_RECONNECT_DELAY = 5000;

/**
 * Media manager for a `Client` (`client.media`): the network's media plan, local captures, remote
 * streams and plan channels on every `PeerLink`. Each link gets its channels and empty transceiver
 * slots before its first offer, so nothing is captured or sent until `start()`.
 *
 * @fires stream - `CustomEvent<{ peer, name, stream }>`, a remote stream started arriving
 * @fires stream-ended - `CustomEvent<{ peer, name }>`, a remote stream stopped or its link closed
 * @fires capture - `CustomEvent<{ name, stream }>`, a local capture started
 * @fires capture-ended - `CustomEvent<{ name }>`, a local capture stopped (also when the user ends a screen share)
 * @fires channel-open - `CustomEvent<{ peer, label }>`
 * @fires channel-close - `CustomEvent<{ peer, label }>`
 */
export declare class Media extends Emitter {
    private readonly context;
    private _plan;
    private captures;
    private entries;
    private handles;
    constructor(context: MediaContext);
    /** The current plan. */
    get plan(): MediaPlan;
    /**
     * Replaces the plan and applies it to every link: new channels and stream slots are added
     * (renegotiating as needed), removed channels close, removed streams go inactive and their captures stop.
     */
    setPlan(plan: MediaPlan | undefined): void;
    /**
     * Captures a stream from the plan and sends it on every link that carries it.
     * Without a source it asks for the plan's kind with `getUserMedia`, or `getDisplayMedia` when
     * `display` is set or the stream is named `"screen"`.
     *
     * @throws when the name isn't in the plan, or the capture has no track of the plan's kind
     */
    start(name: string, source?: MediaSource_2): Promise<MediaStream>;
    /** Stops a local capture: its slots send nothing again and its tracks stop. */
    stop(name: string): void;
    /** Remote streams from `peer` by name, or the local captures without a peer. */
    streams(peer?: PeerId): Map<string, MediaStream>;
    /** The handle for a plan channel. Labels starting with `_` are reserved. */
    channel(label: string): Channel;
    /**
     * Adds the plan's channels and stream slots to a new link and hooks into its handshake.
     * Call before the link's first offer.
     */
    attach(link: PeerLink): void;
    /** Stops every capture and forgets every link. */
    close(): void;
    /** @internal */
    peersOn(label: string): string[];
    /**
     * Re-applies streams on every link after the view changed (members, host): a relay's source may have moved.
     * @internal
     */
    refresh(): void;
    /** @internal */
    channelOn(label: string, peer: PeerId): RTCDataChannel | undefined;
    /** @internal */
    sendOn(label: string, peer: PeerId, data: ChannelData): boolean;
    private apply;
    private applyChannels;
    private openChannel;
    private applyStreams;
    /** The non-owner names the transceivers a remote offer created, by mid. */
    private adopt;
    private allowed;
    private direction;
    /** The track to send for `name` on this link: the local capture, else the stream relayed from `topology.relay`. */
    private source;
    private nameOf;
    private handleTrack;
    private detach;
}

/** What the media manager reads from its owner. */
export declare type MediaContext = {
    view(): View | null;
    topology(): Topology | null;
};

/** What `Media.start` captures: a ready `MediaStream`, or constraints. `display: true` uses screen capture. */
declare type MediaSource_2 = MediaStream | (MediaStreamConstraints & {
    display?: boolean;
});
export { MediaSource_2 as MediaSource }

/**
 * In-memory `Link`, for tests and same-page networks. Delivery is async (one microtask per message),
 * in order, and copies the bytes. Create ends with `MemoryLink.pair`.
 */
export declare class MemoryLink extends EventTarget implements Link {
    readonly id: PeerId;
    private other;
    private _open;
    private constructor();
    /**
     * Creates both ends of a link between `aId` and `bId`. The first end belongs to `aId`
     * (so its `id` is `bId`), the second to `bId`. Both start open; `"open"` fires in a microtask.
     * Closing either end closes both.
     */
    static pair(aId: PeerId, bId: PeerId): [Link, Link];
    get open(): boolean;
    send(bytes: Uint8Array): boolean;
    close(): void;
}

/** ms after a merge a peer stops waiting for the links it still wants. */
export declare const MERGE_LIMIT = 60000;

/** Links a peer opens at once after a merge. */
export declare const MERGE_LINKS = 4;

/** ms per member in the window peers pick their start from after a merge, so they don't all signal at once. */
export declare const MERGE_PACE = 5;

/** How long a merge may take until both groups share the member list. */
export declare const MERGE_TIMEOUT = 30000;

/** Every member links to every other. Messages go straight to the receiver. */
export declare const mesh: Topology;

/** Multicast tree with the default fanout of 3. */
export declare const multicast: Topology;

export declare type MulticastOptions = {
    /** Children per node. @default 3 */
    fanout?: number;
};

/**
 * A k-ary tree rooted at the host: host first, then the other members in sorted order. Node `i > 0`
 * has parent `⌊(i - 1) / k⌋` and children `k·i + 1 .. k·i + k`. Built for one-to-many media: each
 * node forwards streams to its children only, so no node uploads more than `fanout` copies.
 *
 * @throws {RangeError} when `fanout` isn't an integer >= 1
 */
export declare function multicastTopology({ fanout }?: MulticastOptions): Topology;

/**
 * Transport-agnostic router for one node. Holds the node's links (plus an optional link to the
 * signalling server, the one with id `SERVER`), delivers what is addressed to it and forwards the
 * rest along its `Topology`. Never throws from a link callback; problems surface as events.
 *
 * @fires message - `CustomEvent<Message>`, a message delivered to this node (app payloads stay bytes until `parse()`)
 * @fires drop - `CustomEvent<Message>`, a received message dropped by relay rules or the topology filter
 * @fires unreachable - `CustomEvent<Message>`, a message with no route
 * @fires link - `CustomEvent<PeerId>`, a link was added
 * @fires unlink - `CustomEvent<PeerId>`, a link was removed or closed
 * @fires error - `CustomEvent<EmitterEvent>`, e.g. malformed bytes from a link
 */
export declare class Network extends Emitter {
    me: PeerId;
    /** The id the signal server knows this peer by; differs from `me` after a new socket. */
    socketId: PeerId;
    info?: NetworkInfo;
    topology: Topology;
    /** For a network opened over another: sends a message (base64) to a peer through that parent. False when it can't. */
    carrier?: (receiver: PeerId, message: string) => boolean;
    /**
     * After a merge, until the two groups are linked: the members of the other group and the peer that
     * reaches them, a host or, for a host, the other host. `led` marks one of the two hosts.
     */
    split: {
        gateway: PeerId;
        foreign: Set<PeerId>;
        led: boolean;
    } | null;
    private host;
    private members;
    private links;
    private server;
    private seen;
    private cached;
    private viaServer;
    private sockets;
    private bridged;
    constructor(options: NetworkOptions);
    /** The other host before a merge: a link outside the view, so no traffic crosses it by accident. */
    get bridge(): PeerId | null;
    set bridge(id: PeerId | null);
    /** What the topology sees: sorted members (with `me`) and the ids of open peer links. */
    get view(): View;
    /** The link to `id`, open or not. */
    link(id: PeerId): Link | undefined;
    /** Attaches a link; one with id `SERVER` becomes the server link. Replaces (and closes) an existing link with the same id. */
    addLink(link: Link): void;
    /** Detaches the link to `id`, removes its listeners and closes it. */
    removeLink(id: PeerId, only?: Link): void;
    /** Records the socket id of a peer the server knows by another id. */
    setSocket(peer: PeerId, socket: PeerId): void;
    /** Takes a new id for `me`, e.g. one the server assigned after a reconnect. */
    rename(id: PeerId): void;
    /** Replaces the member list (`me` is always kept) and, optionally, the host. */
    setMembers(members: Iterable<PeerId>, host?: PeerId): void;
    /** The members the topology wants `me` linked to that aren't linked yet. */
    desired(): string[];
    /**
     * Sends an outgoing message. Fills in an empty `sender` (and its first hop) with `me` and a missing
     * `network` with `info.id`. Tries, in order: a direct link to the receiver, `topology.route`, the
     * server link (own unicast messages only, the server forwards nothing else). False and `"unreachable"` otherwise.
     * `preferServer` tries the server link before the topology: for signalling (handshakes, welcomes) to a peer
     * the topology can't reach yet.
     */
    send(message: Message, options?: {
        preferServer?: boolean;
    }): boolean;
    /** Takes a message (base64) `sender` passed over the parent network. It must be `sender`'s own. */
    receive(encoded: string, sender: PeerId): void;
    /** Closes and removes every link, the server link included, and forgets the members. */
    close(): void;
    private dispatch;
    private route;
    private toServer;
    private wrap;
    private relayToHost;
    private handleRelay;
    private forged;
    private unchecked;
    private reroute;
    private sendTo;
    private decide;
    private handleLinkMessage;
    private take;
    private invalidate;
}

export declare type NetworkOptions = {
    /** This node's id. */
    me: PeerId;
    /** The network joined. Supplies the host, the id stamped on outgoing messages, and the topology by name. */
    info?: NetworkInfo;
    /** A resolved topology, or a name / config resolved through `topologies`. Defaults to `info.topology`, then `mesh`. */
    topology?: Topology | string | TopologyConfig;
};

/** A received `handshake.offer` payload. */
export declare type Offer = {
    description: RTCSessionDescriptionInit;
    streams?: PayloadMap[HandshakeType.Offer]["streams"];
    session?: string;
};

/**
 * `Link` to one remote peer over WebRTC. Owns its `RTCPeerConnection`, a negotiated data channel
 * (`SYSTEM_CHANNEL`, id 0, so neither side waits for `ondatachannel`) and the `Handshake` that sets it up.
 * Closes itself when the channel closes or the connection fails.
 */
export declare class PeerLink extends Emitter implements Link {
    readonly me: PeerId;
    readonly id: PeerId;
    readonly connection: RTCPeerConnection;
    readonly channel: RTCDataChannel;
    readonly handshake: Handshake;
    /** When this link was created, from `performance.now()`. */
    readonly opened: number;
    private closed;
    constructor(me: PeerId, id: PeerId, network: Network, options?: PeerOptions);
    get open(): boolean;
    /** Runs the handshake: as offerer without `offer`, as answerer with it. Closes the link if it fails. */
    connect(offer?: Offer): Promise<void>;
    send(bytes: Uint8Array): boolean;
    close(): void;
    private handleOpen;
    private handleClose;
    private handleMessage;
    private handleConnectionStateChange;
    private handleHandshakeEvent;
}

export declare type PeerOptions = {
    /** Passed to `RTCPeerConnection`, e.g. `iceServers`. */
    rtc?: RTCConfiguration;
    /** ms before a handshake fails. */
    timeout?: number;
};

/**
 * Adds a custom topology under `name`. Only its config is shared, never code, so every peer
 * must register the same factory under the same name.
 *
 * @throws {RangeError} for a built-in name (`mesh`, `star`, `chord`, `multicast`)
 */
export declare function registerTopology(name: string, factory: TopologyFactory): void;

/** How long `create`, `list` and `join` wait for the server or the entry peer. */
export declare const REQUEST_TIMEOUT = 15000;

/**
 * The topology a name or config describes. An unregistered name, or a factory that throws on the
 * config, falls back to `mesh` and reports the reason to `onError`. Deterministic, so every peer falls back alike.
 */
export declare function resolveTopology(topology: string | TopologyConfig, onError?: (error: Error) => void): Topology;

/**
 * Every member links to the ones before and after it in the host's member list, closing a circle.
 * Newcomers go at the end, so a join moves one link and merging two rings only moves the two seams.
 * The cheapest topology to hold, the slowest to cross: a message takes up to half the ring.
 */
export declare const ring: Topology;

/** What `client.room` opens. A room is always private: its id and host travel by invite. */
export declare type RoomOptions = {
    name: string;
    /** Checked by the room's host. It travels over lobby peers, which can read it. */
    password?: string;
    meta?: Record<string, unknown>;
    media?: MediaPlan;
    /** Default `"mesh"`, whatever the parent network uses. */
    topology?: string | TopologyConfig;
    /** Called on the room's host for each newcomer; false rejects them. Default: accept everyone. */
    accept?(newcomer: PeerId, info: NetworkInfo): boolean;
    /** Default: the parent client's profile. */
    profile?: Profile;
};

/**
 * `Link` to the signalling server over a WebSocket (`id` is `SERVER`). Keeps trying to connect, and to
 * reconnect, with a backoff capped at `MAX_RECONNECT_DELAY`, and queues what is sent meanwhile, in order.
 * `"close"` fires only once it gives up (`attempts`, `timeout`) or `close()` is called.
 *
 * @fires welcome - `CustomEvent<PeerId>`, the server assigned this client's id (again after every reconnect)
 * @fires open - connected (again)
 * @fires disconnect - the socket dropped, a reconnect is scheduled
 * @fires close - closed for good
 * @fires error - `type: "limit"` when `attempts` or `timeout` ran out
 */
export declare class SocketLink extends Emitter implements Link {
    private readonly url;
    private readonly options;
    readonly id = "server";
    /** The id the server assigned, null until `"welcome"`. */
    me: PeerId | null;
    private ws;
    private attempts;
    private timer;
    private deadline;
    private offline;
    private welcomed;
    private closed;
    private readonly maxAttempts;
    constructor(url: string | URL, options?: SocketOptions);
    get open(): boolean;
    /** Sends now, or queues until the server has welcomed the socket (again). False once closed for good. */
    send(bytes: Uint8Array): boolean;
    close(): void;
    private connect;
    private startDeadline;
    private clearDeadline;
    private detach;
    private flush;
    private handleOpen;
    private handleMessage;
    private handleError;
    private handleClose;
}

export declare type SocketOptions = {
    protocols?: string | string[];
    /** Reconnect attempts before giving up for good. Default: no limit. */
    attempts?: number;
    /** ms without a connection (from the start, or since it dropped) before giving up for good. Default: no limit. */
    timeout?: number;
};

/** Every member links to the host (the hub), which relays between leaves. */
export declare const star: Topology;

export declare type StreamDetail = {
    peer: PeerId;
    name: string;
    stream: MediaStream;
};

/** Label of the negotiated data channel (id 0) that carries every system and `Client.send` message. */
export declare const SYSTEM_CHANNEL = "_system";

/** Topology factories by name: what a `TopologyConfig` (`NetworkInfo.topology`) resolves through. Add to it with `registerTopology`. */
export declare const topologies: Record<string, TopologyFactory>;

/**
 * The shape of a network: which links a node should hold and where it sends a message next.
 * Pure functions of the `View`, so the same topology runs on every node.
 */
export declare interface Topology {
    readonly name: string;
    /**
     * True when nothing is ever relayed: a peer's message always comes straight from its sender, so an
     * app message with any other sender is dropped.
     */
    readonly direct?: boolean;
    /** The direct links `id` should hold, given `view.members`. */
    neighbors(view: View, id: PeerId): PeerId[];
    /**
     * Optional: the links of `id` that make routing work, opened first after a merge so the rest can follow
     * slowly. Defaults to treating every neighbor alike.
     */
    stitch?(view: View, id: PeerId): PeerId[];
    /** Optional: the `ttl` of a message this node sends, when crossing the network can take more than `DEFAULT_TTL` hops. */
    ttl?(view: View): number;
    /** Next hops for `meta`, drawn from `view.links`. `[]` when there is no peer route. */
    route(view: View, meta: Meta): PeerId[];
    /**
     * Optional override for a received message, checked before `relay`. Return an action to replace
     * relay's decision (`"drop"`, `"deliver"`), or undefined to keep it. It can't force a forward past a loop or a spent `ttl`.
     */
    filter?(view: View, meta: Meta): RelayAction | undefined;
    /**
     * Optional: narrows the media plan for the direct link to `peer`. Only `streams` is used: channels
     * always follow the full plan, since both ends must agree on channel ids. A stream left out isn't sent
     * on this link (its transceiver goes `recvonly`). Defaults to the full plan.
     */
    media?(view: View, peer: PeerId, plan: MediaPlan): MediaPlan;
    /**
     * Optional: the peer whose incoming stream `name` this node forwards on its links when it has no
     * capture of its own. null or omitted: nothing is relayed.
     */
    relay?(view: View, name: string): PeerId | null;
}

/** Builds a topology from its shared config. Throw to reject the config; the caller falls back to `mesh`. */
export declare type TopologyFactory = (config: TopologyConfig) => Topology;

/** What a topology sees of a node. `members` is sorted and includes `me`; `links` are the open direct links. */
export declare type View = {
    me: PeerId;
    host: PeerId;
    members: readonly PeerId[];
    links: readonly PeerId[];
    /** `members` in the host's list order, for a topology where order matters. Defaults to `members`. */
    order?: readonly PeerId[];
};

/** ms between `/health` pings while not connected. */
export declare const WAKE_INTERVAL = 4000;

/** How long the first connection may fail before the status turns `"waking"`. */
export declare const WAKING_AFTER = 3000;

export { }
