import { Matrix4 } from '@papit/matrix';
import { Quaternion } from '@papit/quaternion';
import { Vector3 } from '@papit/vector';

/**
 * A set of bones in one space. It has no position of its own, so put it inside
 * whatever moves it, such as a GameObject, and read `bone.worldMatrix` from there.
 */
export declare class Armature {
    readonly bones: Bone[];
    /** Run in this order by `update`, so add a parent's constraint before a child's. */
    readonly constraints: IK[];
    /** Takes bones made with `new Bone`, parents first. */
    constructor(bones?: Bone[]);
    /** Creates a bone and adds it. */
    add(name: string, options?: BoneOptions): Bone;
    find(name: string): Bone | null;
    /** Puts an IK constraint on a bone. */
    ik(bone: Bone, options?: IKOptions): IK;
    /** Takes a constraint off. */
    removeIK(constraint: IK): void;
    /** Runs forward kinematics, then every IK constraint. Call it once a frame, after changing a pose or a target. */
    update(): void;
    private register;
}

/**
 * One rigid segment, pointing along its own +X from `head` to `tail`.
 * `length`, `attach`, `offset` and `rotation` are the pose, the rest is derived from them
 * by `update`. All world values are in armature space, and they're the same objects on every read.
 */
export declare class Bone {
    readonly name: string;
    readonly parent: Bone | null;
    readonly children: Bone[];
    readonly offset: Vector3;
    /** The pose you set, relative to the parent. IK leaves it alone. */
    readonly rotation: Quaternion;
    /** The rotation in use: `rotation` until an IK constraint turns the bone. */
    readonly solved: Quaternion;
    readonly head: Vector3;
    readonly tail: Vector3;
    readonly worldRotation: Quaternion;
    /** At `head`, with X along the bone. Holds no length, so it's safe to draw a picture with. */
    readonly worldMatrix: Matrix4;
    length: number;
    attach: number;
    limit: BoneLimit | null;
    constructor(name: string, { parent, length, attach, offset, angle, limit }?: BoneOptions);
    /** Turn around Z in radians. Only meaningful while the bone rotates around Z, as it does in 2D. */
    get angle(): number;
    set angle(value: number);
    /** Forward kinematics: takes `rotation` as it is for this bone and everything under it. */
    update(): void;
    /** Recomputes the world values of this bone and everything under it, keeping `solved`. */
    refresh(): void;
    /** Recomputes this bone only. Its parent has to be current. */
    place(): void;
    /** Writes where `child`'s head sits, in this bone's own space. */
    attachPoint(child: Bone, out: Vector3): Vector3;
    /**
     * Sets `rotation` so `tail` points at a point in armature space, and updates everything under it.
     * The bone keeps its twist. The bone's head has to be current. A point on the head changes nothing.
     */
    pointAt(target: Point): void;
    /** Turns `solved` by the shortest rotation that takes direction `a` to direction `b`, both in armature space. */
    turn(a: Point, b: Point): void;
    /** Pulls `solved` back inside `limit`. IK calls this, the bone still needs a `place` after. */
    constrain(): void;
    /** Moves the head to a point in armature space by changing `offset`. */
    moveTo(point: Point): void;
    /** Keeps only the part of the rotation around the axis, then clamps its angle. */
    private constrainHinge;
    /** Splits the rotation into a swing off X and a twist around it, and shortens the swing. */
    private constrainCone;
}

/**
 * How far IK may turn a bone from its parent, in radians.
 * `hinge` only turns around one axis in the parent's space, Z for 2D. `cone` keeps the bone
 * within an angle of the parent's X.
 */
export declare type BoneLimit = {
    hinge: Point;
    min: number;
    max: number;
} | {
    cone: number;
};

export declare type BoneOptions = {
    /** The bone this one moves with. Must be added first. */
    parent?: Bone;
    /** Distance from head to tail, along the bone's own X. Default 0. */
    length?: number;
    /** Where on the parent the head sits: 0 is its head, 1 its tail. Default 1. */
    attach?: number;
    /** Added to the attach point, in the parent's space. A bone without a parent uses it as its position. */
    offset?: Point;
    /** Turn around Z in radians, the 2D way to set `rotation`. */
    angle?: number;
    /** Applied by IK, forward kinematics stays free. */
    limit?: BoneLimit;
};

/**
 * An IK constraint on a bone, like Blender's. It runs in `armature.update`, after forward kinematics,
 * and reaches `target` by turning `chain` bones counted up from `bone`. `target` and `pole` are read on
 * every update, and either can be a bone, so it moves with whatever that bone is parented to. Your `rotation`s stay as they are, the
 * result goes into each bone's `solved`, and `weight` blends between the two.
 */
export declare class IK {
    /** The bone that reaches, its tail goes to the target. */
    readonly bone: Bone;
    /** The bones this constraint turns, top first. */
    readonly bones: Bone[];
    target: Point | Bone | null;
    pole: Point | Bone | null;
    weight: number;
    iterations: number;
    tolerance: number;
    free: boolean;
    /** Head of each bone, then the tail of the last one, as x, y, z. */
    private points;
    /** Distance between neighbouring points. */
    private gaps;
    constructor(bone: Bone, { chain, target, pole, weight, iterations, tolerance, free }?: IKOptions);
    /** The tail of `bone`. */
    get tip(): Vector3;
    /** Runs the constraint. `armature.update` calls this, in the order the constraints were added. */
    solve(): void;
    /**
     * Poses the bones from points, x, y, z for every head and then the last tail, like the result of a
     * physics step. Directions are used, the bones keep their length. It's stored in their `rotation`.
     */
    setPositions(positions: ArrayLike<number>): void;
    /** Any number of bones: FABRIK. A target out of reach gets the chain pointing straight at it. */
    private fabrik;
    /** Two bones have an exact answer: the law of cosines. */
    private exact;
    /** A free chain: the tip lands on the target and the rest trails behind, root included. */
    private drag;
    /** Stores the result as the pose, a free chain trails from where it was last frame. */
    private keep;
    /** Copies the current joints into `points` and measures the gaps between them. */
    private read;
    /** Turns each bone towards its next point, then blends with the pose. */
    private write;
    /**
     * Writes the direction square to `dx, dy, dz` that a point `hx, hy, hz` from the root lies on.
     * A hint on the line says nothing, so that returns false.
     */
    private sideOf;
    /** Writes a direction square to `dx, dy, dz` that stays in the XY plane, so 2D stays 2D. */
    private anySide;
    private moveRoot;
    /** Moves point `index` next to point `anchor`, `gap` away in the direction it already has. */
    private pull;
    /** The FABRIK pass from the tip: put the tip on the target and let the rest follow. */
    private backward;
    /** A chain on the line to its target can only slide along it, so bend it first. */
    private unfold;
    /** Turns the inner joints as one around the line from root to tip, until their bend faces the pole. */
    private bendTowards;
}

export declare type IKOptions = {
    /** How many bones to turn, counted up from the constrained bone. 0 goes all the way to the root. Default 0. */
    chain?: number;
    /** The point to reach, or a bone to reach the head of. Without one the constraint does nothing. */
    target?: Point | Bone;
    /** A point or bone the joints bend towards, like a knee aiming at a spot in front of the leg. Use a bone to make it follow the rig. */
    pole?: Point | Bone;
    /** How much the result replaces the pose, 0 to 1. Default 1. */
    weight?: number;
    /** The most passes to run, for chains longer than 2. Default 10. */
    iterations?: number;
    /** How close the tip has to get to stop early. Default 0.01. */
    tolerance?: number;
    /** Lets the root move too, so the chain trails behind the target like a snake or a rope. Default false. */
    free?: boolean;
};

/** A 3D point or direction. A missing z counts as 0, so `[x, y]` works for 2D. */
export declare type Point = ArrayLike<number>;

export { }
