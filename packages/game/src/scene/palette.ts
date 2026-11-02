/** The colours of the land. Sky runs from the top down, each one a flat band. */
export type Palette = {
    sky: readonly string[];
    sun: readonly [disc: string, ring: string];
    cloud: string;
    far: readonly [lit: string, shade: string, cap: string];
    near: readonly [lit: string, shade: string, cap: string];
    ground: readonly [light: string, base: string, dark: string];
    ink: string;
    /** Multiplied into every picture as it loads, so the props sit in the light of the scene. */
    tint?: string;
    /** A moon, stars and lit lanterns. */
    night?: boolean;
};

export const PALETTES = {
    noon: {
        sky: ["#2f9fc7", "#4cb5cf", "#7fcdd3", "#b6e3d4"],
        sun: ["#fff6d8", "#d8f0d8"],
        cloud: "#f4fbf0",
        far: ["#eeb07e", "#d98c62", "#f7cfa0"],
        near: ["#d9613a", "#a53c28", "#f08a55"],
        ground: ["#f7cf85", "#ecb765", "#c98a3f"],
        ink: "#3a2010",
    },
    sunset: {
        sky: ["#352a70", "#8c3a80", "#e2604f", "#fdb45c"],
        sun: ["#ffe9a8", "#ff9a5c"],
        cloud: "#f7796b",
        far: ["#8e3b6b", "#6a2c63", "#b94f73"],
        near: ["#4a2152", "#31173f", "#7a2f5e"],
        ground: ["#f09a58", "#d9693f", "#9c3f33"],
        ink: "#2a1020",
    },
    gold: {
        sky: ["#f08a3c", "#f6ab5c", "#f9cd86", "#fdeabf"],
        sun: ["#fffbe8", "#fde2a6"],
        cloud: "#fff3d6",
        far: ["#e29a63", "#c97b4e", "#f2bf8a"],
        near: ["#b9472f", "#842e24", "#dc6e45"],
        ground: ["#fbdb9a", "#e8b873", "#b9803f"],
        ink: "#3a2010",
    },
    night: {
        sky: ["#0b1030", "#141a45", "#1f2a5e", "#33407a"],
        sun: ["#f4f1da", "#26316a"],
        cloud: "#2a3468",
        far: ["#2b3568", "#20295a", "#3a4580"],
        near: ["#1b2147", "#141836", "#283062"],
        ground: ["#6573ad", "#3f4a80", "#272f5c"],
        ink: "#10152e",
        tint: "#8c9ad8",
        night: true,
    },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;

/** The light at this hour of the player's own day. */
export function paletteAt(hour: number): PaletteName {
    if (hour < 6 || hour >= 20) return "night";
    if (hour < 10) return "gold";
    return hour < 17 ? "noon" : "sunset";
}

/** The sky follows the clock, `?palette=sunset` picks one by hand and the art view uses that. */
export function currentPalette(search: string = location.search, hour = new Date().getHours()): Palette {
    const name = new URLSearchParams(search).get("palette");
    return PALETTES[name && name in PALETTES ? name as PaletteName : paletteAt(hour)];
}

/** What stays bright when a scene is tinted: lit windows and lanterns. */
const LIT = ["#ffd66b", "#fff0b8"];

const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);

/** Multiplies every colour in an SVG's source by `tint`. */
export function tinted(svg: string, tint: string) {
    return svg.replace(/#[0-9a-f]{6}\b/gi, colour => {
        if (LIT.includes(colour.toLowerCase())) return colour;
        const mixed = [1, 3, 5].map(at => Math.round(channel(colour, at) * channel(tint, at) / 255));
        return `#${mixed.map(value => value.toString(16).padStart(2, "0")).join("")}`;
    });
}
