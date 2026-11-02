import { SegmentIntersection } from "@papit/line-intersection";

export type Point = { x: number; y: number };
export type HitKind = "head" | "body" | "barrel";
export type Target = { kind: HitKind; a: Point; b: Point };
export type Hit = { kind: HitKind; x: number; y: number };

/** The first thing on the way from `from` to `to`, or null. */
export function firstHit(from: Point, to: Point, targets: Target[]): Hit | null {
    let best: Hit | null = null;
    let nearest = Infinity;

    for (const { kind, a, b } of targets)
    {
        const crossing = SegmentIntersection(from, to, a, b);
        if (crossing && crossing.t < nearest)
        {
            nearest = crossing.t;
            best = { kind, x: crossing.x, y: crossing.y };
        }
    }

    return best;
}
