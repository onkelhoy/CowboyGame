/** The colours of the land. Sky runs from the top down, each one a flat band. */
export type Palette = {
    sky: readonly string[];
    sun: readonly [disc: string, ring: string];
    cloud: string;
    far: readonly [lit: string, shade: string, cap: string];
    near: readonly [lit: string, shade: string, cap: string];
    ground: readonly [light: string, base: string, dark: string];
    ink: string;
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
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;

/** `?palette=sunset` tries another one, the art view uses it. */
export function currentPalette(search: string = location.search): Palette {
    const name = new URLSearchParams(search).get("palette");
    return name && name in PALETTES ? PALETTES[name as PaletteName] : PALETTES.noon;
}
