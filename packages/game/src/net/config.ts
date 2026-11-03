export const APP = "cowboy";
export const LOBBY_NAME = "cowboy";
export const DEFAULT_SIGNAL = "wss://render-webrtc-signal-server.onrender.com";

/** STUN only, so a strict mobile or company network may not connect without TURN. */
export const RTC: RTCConfiguration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

/** The signal server drops messages that come less than 200 ms apart, so ours are spaced. */
export const SERVER_GAP = 1000;
/**
 * Milliseconds before a server call gives up. A lobby whose last player just left stays listed for a
 * while, and waiting out the default 15 s on it is the long wait for a link.
 */
export const CALL_TIMEOUT = 7000;
export const RACE_GUARD = 2000;
export const RESCAN = 20_000;
/** Milliseconds between the "here" every player sends into the lobby. */
export const HEARTBEAT = 30_000;
export const RETRY_MIN = 3000;
export const RETRY_MAX = 30_000;

/** `?signal=ws://localhost:3001` points a game at a local `npm run signal`. Invite links keep it. */
export function signalUrl(search: string = location.search) {
    return new URLSearchParams(search).get("signal") || DEFAULT_SIGNAL;
}
