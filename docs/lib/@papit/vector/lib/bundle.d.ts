export declare class Vector extends Float32Array {
    constructor(dimension: number);
    constructor(record: VectorObject);
    constructor(values: number[] | Float32Array);
    constructor(...rest: number[]);
    constructor(value: VectorValue);
    get magnitude(): number;
    set magnitude(value: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    get r(): number;
    get g(): number;
    get b(): number;
    get a(): number;
    set x(value: number);
    set y(value: number);
    set z(value: number);
    set w(value: number);
    set r(value: number);
    set g(value: number);
    set b(value: number);
    set a(value: number);
    dot(value: VectorValue): number;
    add(...values: number[]): this;
    add(value: VectorValue): this;
    subtract(...values: number[]): this;
    subtract(value: VectorValue): this;
    multiply(...values: number[]): this;
    multiply(value: VectorValue): this;
    divide(...values: number[]): this;
    divide(value: VectorValue): this;
    /** Moves this vector towards `value`: 0 stays, 1 lands on it. */
    lerp(value: VectorValue, t: number): this;
    normalize(): this;
    get clone(): this;
    slice(): Float32Array<ArrayBuffer>;
    slice(start: number, end: number): Float32Array<ArrayBuffer>;
    map(callbackfn: (value: number, index: number, array: this) => number): this;
    mapThis(callbackfn: (value: number, index: number, array: this) => number): this;
    static distance(a: VectorValue, b: VectorValue): number;
    static coerce(value: VectorValue, ...rest: number[]): number[] | Float32Array<ArrayBufferLike>;
    static dot(a: VectorValue, b: VectorValue): number;
    static lerp<T extends typeof Vector>(this: T, a: VectorValue, b: VectorValue, t: number): InstanceType<T>;
    static create<T extends typeof Vector>(this: T, value: VectorValue): InstanceType<T>;
    static add<T extends typeof Vector>(this: T, a: VectorValue, b: VectorValue): InstanceType<T>;
    static subtract<T extends typeof Vector>(this: T, a: VectorValue, b: VectorValue): InstanceType<T>;
    static multiply<T extends typeof Vector>(this: T, a: VectorValue, b: VectorValue): InstanceType<T>;
    static divide<T extends typeof Vector>(this: T, a: VectorValue, b: VectorValue): InstanceType<T>;
}

export declare class Vector2 extends Vector {
    get angle(): number;
    set angle(value: number);
    /**
     * Returns a new Vector2 perpendicular to this one.
     * Defaults to (-y, x) — a 90° counter-clockwise rotation.
     * Pass `true` for clockwise: (y, -x).
     */
    perpendicular(clockwise?: boolean): Vector2;
    static perpendicular(a: VectorValue, b: VectorValue, windingorder?: "clockwise" | "counter-clockwise"): Vector2;
    static cross(a: VectorValue, b: VectorValue): number;
    static angle(a: VectorValue): number;
    static get zero(): Vector2;
}

export declare class Vector3 extends Vector {
    rotate(angle: number, plane: number[]): this;
    rotateX(angle: number): void;
    rotateY(angle: number): void;
    rotateZ(angle: number): void;
    cross(v: VectorValue): this;
    static cross(a: VectorValue, b: VectorValue): Vector3;
    static get zero(): Vector3;
}

export declare type VectorObject = {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
    order?: string[];
} & {
    [key: string]: number;
};

export declare type VectorValue = number | number[] | Float32Array | VectorObject;

export { }
