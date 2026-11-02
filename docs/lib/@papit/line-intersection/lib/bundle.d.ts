import { VectorValue } from '@papit/vector';

/**
 *
 * @param {VectorValue} p1
 * @param {VectorValue} p2
 * @param {VectorValue} p3
 * @param {VectorValue} p4
 * @returns false|Vector
 */
export declare function LineIntersection(p1: VectorValue, p2: VectorValue, p3: VectorValue, p4: VectorValue): false | {
    x: number;
    y: number;
    t: number;
    u: number;
};

/**
 *
 * @param {VectorValue} p1
 * @param {VectorValue} p2
 * @param {VectorValue} p3
 * @param {VectorValue} p4
 * @returns false|Vector
 */
export declare function SegmentIntersection(p1: VectorValue, p2: VectorValue, p3: VectorValue, p4: VectorValue): false | {
    x: number;
    y: number;
    t: number;
    u: number;
};

export { }
