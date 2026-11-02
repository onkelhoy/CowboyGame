import { MetaJson } from '@papit/meta-json';

/** `receiver` for messages meant for every peer in the network. */
export declare const BROADCAST = "*";

/** Structural subset of `RTCDataChannelInit`. `negotiated` and `id` are assigned by the peers. */
export declare type ChannelInit = {
    ordered?: boolean;
    maxRetransmits?: number;
    maxPacketLifeTime?: number;
    protocol?: string;
};

/** Relays a new message may take before it is dropped. */
export declare const DEFAULT_TTL = 16;

export declare enum HandshakeType {
    Offer = "handshake.offer",
    Answer = "handshake.answer",
    Candidate = "handshake.candidate"
}

/** Structural stand-in for `RTCIceCandidateInit`, so node can compile it. */
export declare type IceCandidate = {
    candidate?: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
};

/**
 * Checks an untrusted media plan: at most `MAX_MEDIA_ENTRIES` channels and streams, labels and names
 * 1..`MAX_ID_LENGTH` characters, no channel label starting with `_`, valid `ChannelInit` fields
 * (no `negotiated`/`id`, not both retransmit limits) and a stream `kind` of audio or video.
 */
export declare function isMediaPlan(x: unknown): x is MediaPlan;

/**
 * Checks an untrusted meta: every field's type, ids (and `type`) at most `MAX_ID_LENGTH` characters,
 * `ttl` an integer in 0..`MAX_TTL`, a finite `timestamp`, at most `MAX_HOPS` hops.
 */
export declare function isMeta(x: unknown): x is Meta;

/** Checks an untrusted, already parsed payload against the shape of a reserved `type`. False for unknown types. */
export declare function isPayload(type: string, x: unknown): boolean;

/** Checks an untrusted profile: a JSON object of at most `MAX_PROFILE_BYTES` UTF-8 bytes. */
export declare function isProfile(x: unknown): x is Profile;

/** True when `type` starts with a protocol prefix (`signal.`, `network.`, `handshake.`). */
export declare function isReserved(type: string): boolean;

/**
 * Checks an untrusted topology: a name of 1..`MAX_ID_LENGTH` characters, or a JSON object with such a
 * `name` of at most `MAX_TOPOLOGY_BYTES` UTF-8 bytes.
 */
export declare function isTopology(x: unknown): x is string | TopologyConfig;

/** Most entries `hops` may hold. With `MAX_TTL` a message can never exceed it. */
export declare const MAX_HOPS = 256;

/** Longest `id`, `type`, `sender`, `receiver`, `network` or hop entry. */
export declare const MAX_ID_LENGTH = 64;

/** Most channels, and most streams, a media plan may hold. */
export declare const MAX_MEDIA_ENTRIES = 16;

/** Largest encoded message `read` accepts by default. */
export declare const MAX_MESSAGE_BYTES: number;

/** Largest serialized (UTF-8 JSON) profile. */
export declare const MAX_PROFILE_BYTES = 1024;

/** Largest serialized (UTF-8 JSON) topology config. */
export declare const MAX_TOPOLOGY_BYTES = 1024;

/** Largest `ttl` a message may carry. */
export declare const MAX_TTL = 255;

/**
 * The data channels and media streams every link in a network carries, by label / name.
 * Channel labels starting with `_` are reserved.
 */
export declare type MediaPlan = {
    channels?: Record<string, ChannelInit>;
    streams?: Record<string, {
        kind: StreamKind;
    }>;
};

/**
 * A peer message: a `MetaJson` whose meta is the routing header `Meta`.
 * Payloads are JSON: an object (or a parsed payload) is `JSON.stringify`d on encode,
 * a string is taken as already encoded, binary is copied as-is.
 */
export declare class Message<Type extends string = string, Payload = any> extends MetaJson<Meta<Type>, Payload> {
    toBinary(force?: boolean): Uint8Array<ArrayBufferLike>;
    /**
     * Creates a message with defaults for every meta field not given:
     * a fresh `id`, `sender: ""`, `receiver: SERVER`, `timestamp: Date.now()`, `ttl: DEFAULT_TTL`
     * and `hops: [sender]` (empty without a sender).
     */
    static Create<This extends new (meta: any, payload: any) => MetaJson<any, any>, Type extends string = string, Payload = Object | string>(this: This, meta: Partial<Meta<Type>> & {
        type: Type;
    }, payload: Payload): InstanceType<This>;
    static Create<This extends new (meta: any, payload: any) => MetaJson<any, any>, M extends Object = object, Payload = Object | string>(this: This, meta: M, payload: Payload): InstanceType<This>;
}

/**
 * Routing header of every peer message.
 * `ttl` is the number of relays left; `hops` lists every node that handled the message, sender first.
 */
export declare type Meta<Type extends string = string> = {
    id: string;
    type: Type;
    sender: PeerId;
    receiver: PeerId;
    network?: string;
    timestamp: number;
    ttl: number;
    hops: PeerId[];
};

export declare type NetworkInfo = {
    id: string;
    name: string;
    host: PeerId;
    topology: string | TopologyConfig;
    private: boolean;
    size: number;
    meta?: Record<string, unknown>;
    media?: MediaPlan;
};

export declare enum NetworkType {
    Join = "network.join",
    Welcome = "network.welcome",
    Reject = "network.reject",
    Members = "network.members",
    Leave = "network.leave",
    Media = "network.media",
    Profile = "network.profile",
    Relay = "network.relay",
    Room = "network.room",
    Merge = "network.merge",
    MergeAccept = "network.merge-accept",
    MergeList = "network.merge-list",
    MergeView = "network.merge-view",
    Prune = "network.prune"
}

/** Payload shape per reserved `meta.type`. */
export declare type PayloadMap = {
    [SignalType.Register]: {
        name: string;
        topology: string | TopologyConfig;
        private?: boolean;
        password?: string;
        meta?: Record<string, unknown>;
        media?: MediaPlan;
    };
    [SignalType.Update]: {
        network: string;
        name?: string;
        private?: boolean;
        password?: string;
        meta?: Record<string, unknown>;
        media?: MediaPlan;
    };
    [SignalType.Unregister]: {
        network: string;
    };
    [SignalType.List]: {};
    [SignalType.Join]: {
        network: string;
        password?: string;
        profile?: Profile;
    };
    [SignalType.Leave]: {
        network: string;
    };
    /**
     * Asks the host of `network` to merge with `from`, the network the sender hosts. `size` is the real
     * member count, the server's only counts sockets. `peer` is the sender's peer id, when it isn't its socket id.
     */
    [SignalType.Merge]: {
        network: string;
        from: string;
        size: number;
        password?: string;
        peer?: PeerId;
    };
    /** Before closing a socket on purpose: with `draining` the server stops forwarding to it, without it the socket stays after all. */
    [SignalType.Drain]: {
        draining: boolean;
    };
    /** Nothing more is on its way to this socket, so closing it loses nothing. */
    [SignalType.Drained]: {};
    [SignalType.Welcome]: {
        id: PeerId;
    };
    [SignalType.Registered]: {
        network: NetworkInfo;
    };
    [SignalType.Updated]: {
        network: NetworkInfo;
    };
    [SignalType.Networks]: {
        networks: NetworkInfo[];
    };
    [SignalType.Host]: {
        network: NetworkInfo;
    };
    [SignalType.Unreachable]: {
        receiver: PeerId;
        ref: string;
    };
    [SignalType.Error]: {
        code: string;
        message: string;
        ref?: string;
    };
    [NetworkType.Join]: {
        password?: string;
        profile?: Profile;
    };
    [NetworkType.Welcome]: {
        network: NetworkInfo;
        members: PeerId[];
        connect: PeerId[];
        profiles?: Record<PeerId, Profile>;
    };
    [NetworkType.Reject]: {
        reason: string;
    };
    /** `serverId` is the id the server knows the network by, when the host registered it again. */
    [NetworkType.Members]: {
        members: PeerId[];
        host?: PeerId;
        profiles?: Record<PeerId, Profile>;
        serverId?: string;
    };
    [NetworkType.Leave]: {
        peer: PeerId;
    };
    [NetworkType.Media]: {
        media: MediaPlan;
    };
    [NetworkType.Profile]: {
        profile: Profile;
    };
    /** A signalling message (base64 of its bytes) for the host to pass on through its socket. */
    [NetworkType.Relay]: {
        message: string;
    };
    /** A message (base64 of its bytes) of a network opened over this one, for the receiver's `room`. */
    [NetworkType.Room]: {
        room: string;
        message: string;
    };
    /** A host asks to merge, passed on by the server. The receiving host checks `password` and answers with `network.merge-accept` or `network.reject`. */
    [NetworkType.Merge]: {
        network: NetworkInfo;
        size: number;
        password?: string;
        peer?: PeerId;
    };
    /** `peer` and `socket` are the accepting host's ids, the requester links to it through the server. */
    [NetworkType.MergeAccept]: {
        peer: PeerId;
        socket: PeerId;
        size: number;
    };
    /** A host's network, sent to the other host over their link. `password` is what the staying network keeps. */
    [NetworkType.MergeList]: {
        network: NetworkInfo;
        members: PeerId[];
        profiles?: Record<PeerId, Profile>;
        serverId?: string;
        password?: string;
    };
    /** Everyone's new network: `network.host` is the host, `members` is both groups. Sent by a member's current host. */
    [NetworkType.MergeView]: {
        network: NetworkInfo;
        members: PeerId[];
        profiles?: Record<PeerId, Profile>;
        serverId?: string;
        password?: string;
    };
    /**
     * `streams` maps transceiver `mid` → media plan stream name, for the streams the offer carries.
     * `session` names the sender's connection: a new one means its end of the old link is gone.
     */
    /** Asks a linked peer to close a link neither side wants any more. Neither side is leaving. */
    [NetworkType.Prune]: {};
    [HandshakeType.Offer]: {
        description: SessionDescription;
        streams?: Record<string, string>;
        session?: string;
    };
    [HandshakeType.Answer]: {
        description: SessionDescription;
        session?: string;
    };
    [HandshakeType.Candidate]: {
        candidate: IceCandidate;
    };
};

/** Payload of a reserved type; `unknown` for app types. */
export declare type PayloadOf<T extends string> = T extends keyof PayloadMap ? PayloadMap[T] : unknown;

export declare type PeerId = string;

/** What a peer says about itself, e.g. `{ name }`. JSON, at most `MAX_PROFILE_BYTES` serialized. */
export declare type Profile = Record<string, unknown>;

/**
 * Decodes and validates a message from the wire. Never throws.
 * Returns null when the input is not binary, larger than `maxBytes`, not decodable, has a bad meta,
 * or is a reserved type with a bad payload. Only reserved payloads are parsed; app payloads stay bytes.
 */
export declare function read(bytes: ArrayBuffer | ArrayBufferView, maxBytes?: number): Message | null;

/**
 * Decides what node `me` does with a message it received, and records the hop on `meta`.
 * Call it once per received message, before delivering or forwarding.
 *
 * - `me` already in `hops` → `"drop"` (loop)
 * - `receiver` is `me` → `"deliver"`
 * - otherwise one `ttl` is spent: a broadcast is `"both"` while `ttl` remains, else `"deliver"`;
 *   anything else is `"forward"` while `ttl` remains, else `"drop"`
 */
export declare function relay(meta: Meta, me: PeerId): RelayAction;

/** What a node does with a message it received, see `relay`. */
export declare type RelayAction = "deliver" | "forward" | "both" | "drop";

/** Channel labels starting with this are internal (e.g. `_system`). */
export declare const RESERVED_CHANNEL_PREFIX = "_";

/** `meta.type` prefixes owned by the protocol. Anything else is an app type. */
export declare const RESERVED_PREFIXES: readonly ["signal.", "network.", "handshake."];

export declare type ReservedType = SignalType | NetworkType | HandshakeType;

/** Bounded set of message ids for deduping broadcasts. Forgets the oldest id once `limit` is passed. */
export declare class Seen {
    private limit;
    private ids;
    constructor(limit?: number);
    /** True the first time an id is seen, false for a duplicate. */
    check(id: string): boolean;
}

/** `receiver` for messages meant for the signalling server. */
export declare const SERVER = "server";

/** Structural stand-in for `RTCSessionDescriptionInit`, so node can compile it. */
export declare type SessionDescription = {
    type: string;
    sdp?: string;
};

export declare enum SignalType {
    Register = "signal.register",
    Update = "signal.update",
    Unregister = "signal.unregister",
    List = "signal.list",
    Join = "signal.join",
    Leave = "signal.leave",
    Merge = "signal.merge",
    Drain = "signal.drain",
    Welcome = "signal.welcome",
    Registered = "signal.registered",
    Updated = "signal.updated",
    Networks = "signal.networks",
    Host = "signal.host",
    Drained = "signal.drained",
    Unreachable = "signal.unreachable",
    Error = "signal.error"
}

export declare type StreamKind = "audio" | "video";

/**
 * A shareable topology: a registered name plus JSON options for its factory, e.g. `{ name: "multicast", fanout: 5 }`.
 * At most `MAX_TOPOLOGY_BYTES` serialized. Only config travels; every peer registers the code itself.
 */
export declare type TopologyConfig = {
    name: string;
} & Record<string, unknown>;

export { }
