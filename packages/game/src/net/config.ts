export const DEFAULT_SIGNAL = "wss://render-webrtc-signal-server.onrender.com";

/** STUN only, so a strict mobile or company network may not connect without TURN. */
export const RTC: RTCConfiguration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

/** Milliseconds before a server call (create, join) gives up and is tried again. */
export const CALL_TIMEOUT = 10_000;
export const RETRY_MIN = 3000;
export const RETRY_MAX = 30_000;

/** `?signal=ws://localhost:3001` points a game at a local `npm run signal`. Invite links keep it. */
export function signalUrl(search: string = location.search) {
    return new URLSearchParams(search).get("signal") || DEFAULT_SIGNAL;
}
