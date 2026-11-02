export type Invite = { game: string; host: string; by: string };

/** The invite in a page's query string, null when this isn't one. */
export function parseInvite(search: string): Invite | null {
    const query = new URLSearchParams(search);
    const game = query.get("game"), host = query.get("host");
    if (!game || !host) return null;
    return { game, host, by: (query.get("by") ?? "").slice(0, 32) };
}

/** The link a host hands out. Whatever else is in the address, like `?signal=`, stays in it. */
export function inviteLink(page: string, { game, host, by }: Invite) {
    const url = new URL(page);
    url.hash = "";
    url.searchParams.set("game", game);
    url.searchParams.set("host", host);
    url.searchParams.set("by", by);
    return url.toString();
}
