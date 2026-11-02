import { Armature, type Bone, type IK } from "@papit/armature";

import type { Parts } from "./outfit";
import { Ragdoll, type RagdollBounds, type RagdollPoint } from "./ragdoll";

const MUZZLE = 18;

const STICKS = [
    ["top", "neck"], ["neck", "hips"], ["top", "hips"],
    ["neck", "left elbow"], ["left elbow", "left hand"],
    ["neck", "right elbow"], ["right elbow", "right hand"],
    ["hips", "left knee"], ["left knee", "left foot"],
    ["hips", "right knee"], ["right knee", "right foot"],
] as const;

type Joint = (typeof STICKS)[number][number];

/** The armature of one cowboy, in the old game's units with y down and him facing +x. */
const positionOf = ({ x, y }: RagdollPoint) => [x, y, 0];

export class Body {
    readonly rig = new Armature();
    private ratio: number;

    private hips: Bone;
    private torso: Bone;
    private head: Bone;
    private rightThigh: Bone;
    private rightShin: Bone;
    private leftThigh: Bone;
    private leftShin: Bone;
    private rightUpper: Bone;
    private rightLower: Bone;
    private leftUpper: Bone;
    private leftLower: Bone;

    private hand: [number, number] = [0, 0];
    private elbowPole: [number, number] = [0, 0];
    private leftFoot: [number, number] = [0, 0];
    private kneePole: [number, number] = [60, 0];

    private limbs: IK[];
    private spine: IK;
    private ragdoll: Ragdoll<Joint> | null = null;
    private chains: [IK, Joint[]][] = [];

    constructor(private parts: Parts) {
        const { rig } = this;
        this.ratio = 60 / parts.torso.height;

        this.hips = rig.add("hips");
        this.torso = rig.add("torso", { length: 60, parent: this.hips });
        this.head = rig.add("head", { length: parts.head.height * this.ratio, parent: this.torso });

        this.rightThigh = rig.add("right thigh", { length: 40, parent: this.hips });
        this.rightShin = rig.add("right shin", { length: 40, parent: this.rightThigh });
        this.leftThigh = rig.add("left thigh", { length: 40, parent: this.hips });
        this.leftShin = rig.add("left shin", { length: 40, parent: this.leftThigh });

        this.rightUpper = rig.add("right upper", { length: 38, parent: this.torso, attach: .8 });
        this.rightLower = rig.add("right lower", { length: 38, parent: this.rightUpper });
        this.leftUpper = rig.add("left upper", { length: 34, parent: this.torso, attach: .8, offset: [0, 4] });
        this.leftLower = rig.add("left lower", { length: 34, parent: this.leftUpper });

        this.limbs = [
            rig.ik(this.rightLower, { chain: 2, target: this.hand, pole: this.elbowPole }),
            rig.ik(this.leftLower, { chain: 2, target: this.hand, pole: this.elbowPole }),
            rig.ik(this.rightShin, { chain: 2, target: [0, 0], pole: this.kneePole }),
            rig.ik(this.leftShin, { chain: 2, target: this.leftFoot, pole: this.kneePole }),
        ];
        // without a target it only exists for `setPositions`
        this.spine = rig.ik(this.head, { chain: 2 });
    }

    /** Lets go of the pose. `hit` is the joint the bullet pushes, in units per second. */
    fall(bounds: RagdollBounds, hit: "top" | "neck", x: number, y: number) {
        const { head, torso, leftUpper, leftLower, rightUpper, rightLower, leftThigh, leftShin, rightThigh, rightShin } = this;

        this.ragdoll = new Ragdoll<Joint>({
            top: head.tail,
            neck: torso.tail,
            hips: torso.head,
            "left elbow": leftUpper.tail,
            "left hand": leftLower.tail,
            "right elbow": rightUpper.tail,
            "right hand": rightLower.tail,
            "left knee": leftThigh.tail,
            "left foot": leftShin.tail,
            "right knee": rightThigh.tail,
            "right foot": rightShin.tail,
        }, STICKS, bounds);
        this.ragdoll.push(hit, x, y);

        for (const limb of this.limbs) limb.weight = 0;
        this.chains = [
            [this.spine, ["hips", "neck", "top"]],
            [this.limbs[0], ["neck", "right elbow", "right hand"]],
            [this.limbs[1], ["neck", "left elbow", "left hand"]],
            [this.limbs[2], ["hips", "right knee", "right foot"]],
            [this.limbs[3], ["hips", "left knee", "left foot"]],
        ];
    }

    /** One step of a body that's falling. Draws through the rig, like any other pose. */
    tumble(dt: number) {
        if (!this.ragdoll) return;

        this.ragdoll.update(dt);
        const { points } = this.ragdoll;

        for (const [ik, joints] of this.chains)
        {
            ik.setPositions(joints.flatMap(joint => positionOf(points[joint])));
        }
        this.rig.update();
    }

    /** Where the torso is, for what follows the body around. */
    get chest() {
        const { head, tail } = this.torso;
        return { x: (head.x + tail.x) / 2, y: (head.y + tail.y) / 2 };
    }

    /** `stand` and `shoot` from 0 to 1, the same two numbers that drove the old body. */
    pose(stand: number, shoot: number) {
        const { hand, elbowPole, kneePole, leftFoot } = this;

        const hipsY = -(20 + 60 * stand);
        this.hips.offset.y = hipsY;

        const bend = -Math.PI / 2 + .3 - .25 * stand - shoot * .12;
        const reachX = Math.cos(bend) * (100 + 60 * stand);
        const reachY = Math.sin(bend) * (100 + 60 * stand);
        const lean = Math.atan2(reachY - hipsY, reachX);
        this.torso.angle = lean;

        const shoulderX = Math.cos(lean) * 48;
        const shoulderY = hipsY + Math.sin(lean) * 48;

        const aim = -Math.PI / 5 + Math.PI / 3.5 * stand - Math.PI / 3 * shoot;
        const reach = 50 + 20 * stand - 25 * shoot;
        hand[0] = shoulderX + Math.cos(aim) * reach;
        hand[1] = shoulderY + Math.sin(aim) * reach;

        const elbow = aim + Math.PI * 2 / 3;
        elbowPole[0] = hand[0] + Math.cos(elbow) * 30;
        elbowPole[1] = hand[1] + Math.sin(elbow) * 30;

        kneePole[1] = hipsY / 2;
        leftFoot[0] = 10 + (1 - stand) * 20;

        this.rig.update();
    }

    /** The end of the barrel, in rig units. The pistol reaches past the bone. */
    get muzzle() {
        const { head, tail } = this.rightLower;
        const along = 1 + MUZZLE / this.rightLower.length;
        return { x: head.x + (tail.x - head.x) * along, y: head.y + (tail.y - head.y) * along };
    }

    /** Lines a bullet can hit, in rig units. */
    get hitLines() {
        return { head: this.head, body: this.torso };
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { parts } = this;

        this.limb(ctx, this.leftThigh, parts["upper-leg"]);
        this.limb(ctx, this.leftShin, parts["lower-leg"]);
        this.joint(ctx, this.leftThigh, parts.knee);
        this.limb(ctx, this.leftUpper, parts["upper-arm"]);
        this.limb(ctx, this.leftLower, parts["lower-arm"]);
        this.joint(ctx, this.leftUpper, parts.elbow);
        this.limb(ctx, this.torso, parts.torso, true);
        this.limb(ctx, this.rightThigh, parts["upper-leg"]);
        this.limb(ctx, this.rightShin, parts["lower-leg"]);
        this.joint(ctx, this.rightThigh, parts.knee);
        this.limb(ctx, this.rightUpper, parts["upper-arm"]);
        this.limb(ctx, this.rightLower, parts["pistol-arm"]);
        this.joint(ctx, this.rightUpper, parts.elbow);
        this.limb(ctx, this.head, parts.head, true);
        this.foot(ctx, this.rightShin);
        this.foot(ctx, this.leftShin);
    }

    /** A picture on a bone is one `transform`, the bone's matrix already has its place and turn. */
    private limb(ctx: CanvasRenderingContext2D, bone: Bone, image: HTMLImageElement, fromTail = false) {
        const m = bone.worldMatrix;

        ctx.save();
        ctx.transform(m[0], m[1], m[4], m[5], m[12], m[13]);
        if (fromTail) ctx.translate(bone.length, 0);
        ctx.rotate(fromTail ? Math.PI / 2 : -Math.PI / 2);
        ctx.scale(this.ratio, this.ratio);
        ctx.drawImage(image, -image.width / 2, 0);
        ctx.restore();
    }

    private joint(ctx: CanvasRenderingContext2D, bone: Bone, image: HTMLImageElement) {
        const { ratio } = this;
        const { x, y } = bone.tail;
        ctx.drawImage(image, x - image.width * ratio / 2, y - image.height * ratio / 2, image.width * ratio, image.height * ratio);
    }

    private foot(ctx: CanvasRenderingContext2D, bone: Bone) {
        const { foot } = this.parts;
        const width = foot.width * this.ratio, height = foot.height * this.ratio;
        ctx.drawImage(foot, bone.tail.x, bone.tail.y - height, width, height);
    }
}
