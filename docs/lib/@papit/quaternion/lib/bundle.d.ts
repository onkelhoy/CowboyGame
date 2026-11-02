import { Vector } from '@papit/vector';

declare type Point = ArrayLike<number>;

/**
 * A 3D rotation stored as x, y, z, w, where a unit quaternion is
 * `axis * sin(angle / 2), cos(angle / 2)`.
 * Create one with `Quaternion.identity`, `fromAxisAngle` or `fromTo`.
 * `multiply` and `lerp` are still Vector's component-wise ones,
 * use `multiplyInto` to combine rotations and `nlerp` or `slerp` to blend them.
 */
export declare class Quaternion extends Vector {
    /** Sets this to no rotation. */
    identity(): this;
    /** Scales to length 1. A zero quaternion isn't a rotation, so it becomes the identity. */
    normalize(): this;
    /** Sets this to a turn of `angle` radians around an axis of any length. A zero axis gives the identity. */
    setAxisAngle(x: number, y: number, z: number, angle: number): this;
    /**
     * Sets this to the shortest rotation that turns direction `from` onto direction `to`.
     * A zero vector has no direction, so it gives the identity.
     */
    setFromTo(from: Point, to: Point): this;
    /** Flips this to its inverse, which undoes a unit quaternion. */
    conjugate(): this;
    /** Rotates a 3D point in place and returns it. This has to be a unit quaternion. */
    rotate<T extends Float32Array | number[]>(point: T): T;
    /** Moves this towards `target` the short way, normalized: 0 stays, 1 lands on it. Fast, a good fit for small steps. */
    nlerp(target: Quaternion, t: number): this;
    /** Moves this towards `target` the short way at a constant speed: 0 stays, 1 lands on it. */
    slerp(target: Quaternion, t: number): this;
    /** Writes this rotation and an optional position into a column-major 4x4 matrix. This has to be a unit quaternion. */
    writeMatrix<T extends Float32Array>(out: T, position?: Point): T;
    /**
     * A half turn around the axis `x, y, z` leans on the least, made perpendicular to `x, y, z`.
     * For a direction in a plane that's the plane's normal, so 2D stays 2D.
     */
    private setHalfTurn;
    /** Writes the Hamilton product `a * b`, which applies `b` first and then `a`. `out` can be `a` or `b`. */
    static multiplyInto<T extends Float32Array>(out: T, a: Float32Array, b: Float32Array): T;
    /** A turn of `angle` radians around an axis of any length. */
    static fromAxisAngle(axis: Point, angle: number): Quaternion;
    /** The shortest rotation that turns direction `from` onto direction `to`. */
    static fromTo(from: Point, to: Point): Quaternion;
    static get identity(): Quaternion;
}

export { }
