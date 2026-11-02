import { loadImages, type Recolour } from "../assets";

const PARTS = ["upper-arm", "lower-arm", "pistol-arm", "upper-leg", "lower-leg", "elbow", "knee", "foot", "torso", "head"] as const;

export type Parts = Awaited<ReturnType<typeof loadImages<(typeof PARTS)[number]>>>;

const SHIRT = "#c54a9a";
const HAT = ["#2c1441", "#2d0c48", "#3e1463"];

/** A shirt and hat colour, so the two cowboys read apart at a glance. */
export function outfit(shirt: string, hat: [light: string, dark: string]): Recolour {
    return { [SHIRT]: shirt, [HAT[0]]: hat[1], [HAT[1]]: hat[1], [HAT[2]]: hat[0] };
}

export const OUTFITS = {
    you: outfit("#2f7dbf", ["#1f5b8f", "#143d60"]),
    them: outfit("#c8452f", ["#7a2a1c", "#541b11"]),
};

export function loadParts(recolour: Recolour) {
    return loadImages("cowboy", PARTS, recolour) as Promise<Parts>;
}
