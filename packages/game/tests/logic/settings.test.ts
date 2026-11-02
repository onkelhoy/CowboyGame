import { expect, test } from "@playwright/test";

import { cleanName, DEFAULTS, parseSettings } from "../../src/settings";

test("nothing saved, or something broken, gives the defaults", () => {
    expect(parseSettings(null)).toEqual(DEFAULTS);
    expect(parseSettings("{nope")).toEqual(DEFAULTS);
    expect(parseSettings("12")).toEqual(DEFAULTS);
});

test("saved values come back", () => {
    const saved = { name: "Henry", mute: true, volumes: { everything: .5, music: 0, sounds: 1 } };
    expect(parseSettings(JSON.stringify(saved))).toEqual(saved);
});

test("bad values fall back one by one", () => {
    const saved = { name: 5, mute: "yes", volumes: { everything: 7, music: .2 } };
    expect(parseSettings(JSON.stringify(saved))).toEqual({
        ...DEFAULTS,
        volumes: { ...DEFAULTS.volumes, music: .2 },
    });
});

test("names are tidied and kept short", () => {
    expect(cleanName("  Billy   the Kid ")).toBe("Billy the Kid");
    expect(cleanName("x".repeat(40))).toHaveLength(16);
});
