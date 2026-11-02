import { expect, test } from "@playwright/test";

import { inviteLink, parseInvite } from "../../src/link";

test("a link comes back as the same invite, also with odd names", () => {
    const invite = { game: "abc", host: "peer-1", by: "Åsa & Bo?" };
    const link = inviteLink("https://x.dev/cowboy/views/game/", invite);
    expect(parseInvite(new URL(link).search)).toEqual(invite);
});

test("a link without a game or a host is no invite", () => {
    expect(parseInvite("")).toBeNull();
    expect(parseInvite("?game=a")).toBeNull();
    expect(parseInvite("?host=a")).toBeNull();
});

test("no name is fine, and a long one can't blow up the sign", () => {
    expect(parseInvite("?game=a&host=b")?.by).toBe("");
    expect(parseInvite(`?game=a&host=b&by=${"x".repeat(99)}`)?.by).toHaveLength(32);
});

test("other parts of the address stay", () => {
    const link = inviteLink("http://localhost:3000/?signal=ws://a#x", { game: "g", host: "h", by: "b" });
    expect(new URL(link).searchParams.get("signal")).toBe("ws://a");
    expect(new URL(link).hash).toBe("");
});
