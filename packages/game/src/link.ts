/** `game` is the id of the host's network. Older links also had a `host`, which is ignored now. */
export type Invite = { game: string; by: string };

/** The invite in a page's query string, null when this isn't one. */
export function parseInvite(search: string): Invite | null {
    const query = new URLSearchParams(search);
    const game = query.get("game");
    if (!game) return null;
    return { game, by: (query.get("by") ?? "").slice(0, 32) };
}

/** The link a host hands out. Whatever else is in the address, like `?signal=`, stays in it. */
export function inviteLink(page: string, { game, by }: Invite) {
    const url = new URL(page);
    url.hash = "";
    url.searchParams.set("game", game);
    url.searchParams.set("by", by);
    return url.toString();
}
