import { Vector } from '@papit/vector';
import { VectorValue } from '@papit/vector';

declare type BasicData = number | Float32Array | number[];

declare type Col = {
    col: number;
} | {
    cols: number;
} | {
    column: number;
} | {
    columns: number;
};

export declare type Data = BasicData | number[][];

export declare class Matrix extends Float32Array {
    rows: number;
    cols: number;
    constructor(matrix: MatrixObject);
    constructor(size: number);
    constructor(size: number, identity: boolean);
    constructor(rows: number, cols: number);
    constructor(value: number, rows: number, cols: number);
    constructor(data: Float32Array | number[] | number[][]);
    constructor(data: Float32Array | number[], rows: number, cols: number);
    static create(a: Value, b?: number | boolean, c?: number): Matrix;
    protected getIndex(row: number, col: number): number;
    get(row: number, col?: number): number;
    getRow(row: number): Vector;
    getCol(col: number): Vector;
    add(value: Value): this;
    multiply(value: Value): this;
    transpose(): this;
    get clone(): this;
    slice(): Float32Array<ArrayBuffer>;
    slice(start: number, end: number): Float32Array<ArrayBuffer>;
    print(): void;
    static identity(size: 3): Matrix3;
    static identity(size: 4): Matrix4;
    static identity(size: number): MatrixN;
    static coerce<T extends Matrix = Matrix>(value: Value): {
        rows: number;
        cols: number;
        data: number[] | Float32Array;
    } | T;
    private static Coerced;
    static add<T extends typeof Matrix>(this: T, mat: T | Value, value: Value): InstanceType<T>;
    static multiply<T extends typeof Matrix>(this: T, mat: T | Value, value: Value): InstanceType<T>;
    static transpose<T extends typeof Matrix>(this: T, mat: T | Value): InstanceType<T>;
}

export declare class Matrix3 extends MatrixN {
    constructor();
    constructor(data: Float32Array);
    constructor(data: number[]);
    rotate(angle: number): this;
    static create(value?: number | number[] | Float32Array): Matrix3;
}

export declare class Matrix4 extends MatrixN {
    constructor();
    constructor(data: Float32Array);
    constructor(data: number[]);
    static create(value?: number | number[] | Float32Array): Matrix4;
    static rotationX(angle: number, handedness?: "right" | "left"): Matrix4;
    static rotationY(angle: number, handedness?: "right" | "left"): Matrix4;
    static rotationZ(angle: number, handedness?: "right" | "left"): Matrix4;
    rotateX(angle: number, handedness?: 'right' | 'left'): this;
    rotateY(angle: number, handedness?: 'right' | 'left'): this;
    rotateZ(angle: number, handedness?: 'right' | 'left'): this;
    /**
     * Creates a perspective projection matrix from explicit frustum bounds.
     *
     * @param {number} left  - Left plane of the frustum.
     * @param {number} right - Right plane of the frustum.
     * @param {number} bottom - Bottom plane of the frustum.
     * @param {number} top    - Top plane of the frustum.
     * @param {number} near   - Distance to the near clipping plane (must be > 0).
     * @param {number} far    - Distance to the far clipping plane (must be > near).
     * @returns {Matrix} A 4×4 projection matrix mapping the specified frustum
     *                   into clip space.
     *
     * @description
     * This is the low-level version of perspective projection.
     * `perspective(fov, aspect, near, far)` is just a convenience wrapper that
     * computes `left, right, top, bottom` and then calls `frustum(...)`.
     */
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number, handedness?: 'right' | 'left'): this;
    /**
     * Sets this matrix to a perspective projection.
     *
     * This is a wrapper around `frustum()` for symmetric frustums.
     *
     * @param {number} fovY - Vertical field of view in radians.
     * @param {number} aspect - Aspect ratio of the viewport (width / height).
     * @param {number} near - Distance to the near clipping plane (must be > 0).
     * @param {number} far - Distance to the far clipping plane (must be > near).
     * @returns {this} Returns this matrix for chaining.
     *
     * @example
     * ```
     * const m = new Matrix4();
     * m.perspective(Math.PI / 3, canvas.width / canvas.height, 0.1, 100);
     * ```
     */
    perspective(fovY: number, aspect: number, near: number, far: number): this;
    /**
     * Applies an orthographic projection to this matrix.
     *
     * Maps a rectangular box in 3D space to normalized device coordinates (NDC) [-1, 1].
     * This projection is linear (no perspective), so objects do not get smaller with distance.
     *
     * @param left   The minimum x-coordinate of the view box (left side of the box)
     * @param right  The maximum x-coordinate of the view box (right side of the box)
     * @param bottom The minimum y-coordinate of the view box (bottom side of the box)
     * @param top    The maximum y-coordinate of the view box (top side of the box)
     * @param near   The minimum z-coordinate of the view box (nearest plane to camera)
     * @param far    The maximum z-coordinate of the view box (farthest plane from camera)
     * @returns      A new Matrix4 that is this matrix multiplied by the orthographic projection
     *
     * Example:
     * ```
     * const m = Matrix.identity(4);
     * m.orthographic(-1, 1, -1, 1, 0, 10);
     * ```
     */
    orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): this;
    lookAt(eye: VectorValue, target: VectorValue, up: VectorValue, handedness?: 'right' | 'left'): this;
    static RodriguesRotation(angle: number, x?: number, y?: number, z?: number): Matrix4;
    static rotateX<T extends typeof Matrix4>(this: T, mat: T | Value, angle: number): InstanceType<T>;
    static rotateY<T extends typeof Matrix4>(this: T, mat: T | Value, angle: number): InstanceType<T>;
    static rotateZ<T extends typeof Matrix4>(this: T, mat: T | Value, angle: number): InstanceType<T>;
    static frustum<T extends typeof Matrix4>(this: T, mat: T | Value, left: number, right: number, bottom: number, top: number, near: number, far: number): InstanceType<T>;
    static perspective<T extends typeof Matrix4>(this: T, mat: T | Value, fovY: number, aspect: number, near: number, far: number): InstanceType<T>;
    static orthographic<T extends typeof Matrix4>(this: T, mat: T | Value, left: number, right: number, bottom: number, top: number, near: number, far: number): InstanceType<T>;
    static lookAt<T extends typeof Matrix4>(this: T, mat: T | Value, eye: VectorValue, target: VectorValue, up: VectorValue, handedness?: 'right' | 'left'): InstanceType<T>;
}

export declare class MatrixN extends Matrix {
    constructor(size: number);
    constructor(data: number[]);
    constructor(data: Float32Array);
    get size(): number;
    identity(): void;
    getTranslation(): Float32Array<ArrayBuffer>;
    getScale(): Float32Array;
    inverse(mode?: "TRS" | "GAUSSIAN"): this;
    inverseTRS(): this;
    translate(values: number[] | Float32Array): this;
    translate(...values: number[]): this;
    rotate(angle: number, axis?: number[], handedness?: 'right' | 'left'): this;
    scale(values: number[] | Float32Array): this;
    scale(...values: number[]): this;
    static inverse<T extends typeof MatrixN>(this: T, mat: T | Value, ...args: Parameters<InstanceType<T>['inverse']>): InstanceType<T>;
    static scale<T extends typeof MatrixN>(this: T, mat: T | Value, ...args: Parameters<InstanceType<T>['scale']>): InstanceType<T>;
    static translate<T extends typeof MatrixN>(this: T, mat: T | Value, ...args: Parameters<InstanceType<T>['translate']>): InstanceType<T>;
    static rotate<T extends typeof MatrixN>(this: T, mat: T | Value, angle: number, axis?: number[]): InstanceType<T>;
    static create(value: number | number[] | Float32Array): MatrixN;
}

export declare type MatrixObject = Pretify<Row & Col & {
    data: BasicData;
}>;

declare type Pretify<T> = {
    [K in keyof T]: T[K];
} & {};

declare type Row = {
    row: number;
} | {
    rows: number;
};

export declare type Value = Data | MatrixObject;

export { }
