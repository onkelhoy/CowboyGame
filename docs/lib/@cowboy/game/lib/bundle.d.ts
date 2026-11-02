import { Armature } from '@papit/armature';
import { Bone } from '@papit/armature';
import type { Camera } from '@papit/game-engine';
import { GameEngine } from '@papit/game-engine';
import { GameObject } from '@papit/game-engine';
import { Layer2D } from '@papit/game-engine';

/** The win sign. It's in the world and tracks the dead body, it stays on screen. */
declare class Banner extends GameObject {
    private text;
    private age;
    private follow;
    show(text: string, follow: () => Point): void;
    hide(): void;
    get showing(): boolean;
    update(): void;
    render(layer: Layer2D | object): void;
}

/** The drops from a hit. They run on engine time, so they hang in the air in slow motion. */
declare class Blood extends GameObject {
    private drops;
    /** Sprays out of a hit, along the bullet's way and back up the wound. */
    spray(x: number, y: number, angle: number): void;
    clear(): void;
    update(dt: number): void;
    render(layer: Layer2D | object): void;
}

/** Spreads on the ground, drawn behind the cowboys so the body lies in it. */
declare class BloodPools extends GameObject {
    private pools;
    spread(body: () => Point): void;
    clear(): void;
    update(dt: number): void;
    render(layer: Layer2D | object): void;
}

declare class Body_2 {
    private parts;
    readonly rig: Armature;
    private ratio;
    private hips;
    private torso;
    private head;
    private rightThigh;
    private rightShin;
    private leftThigh;
    private leftShin;
    private rightUpper;
    private rightLower;
    private leftUpper;
    private leftLower;
    private hand;
    private elbowPole;
    private leftFoot;
    private kneePole;
    private limbs;
    private spine;
    private ragdoll;
    private chains;
    constructor(parts: Parts);
    /** Lets go of the pose. `hit` is the joint the bullet pushes, in units per second. */
    fall(bounds: RagdollBounds, hit: "top" | "neck", x: number, y: number): void;
    /** One step of a body that's falling. Draws through the rig, like any other pose. */
    tumble(dt: number): void;
    /** Where the torso is, for what follows the body around. */
    get chest(): {
        x: number;
        y: number;
    };
    /** `stand` and `shoot` from 0 to 1, the same two numbers that drove the old body. */
    pose(stand: number, shoot: number): void;
    /** The end of the barrel, in rig units. The pistol reaches past the bone. */
    get muzzle(): {
        x: number;
        y: number;
    };
    /** The way the gun points, in radians in rig units, along the forearm. */
    get gunAngle(): number;
    /** Lines a bullet can hit, in rig units. */
    get hitLines(): {
        head: Bone;
        body: Bone;
    };
    draw(ctx: CanvasRenderingContext2D): void;
    /** A picture on a bone is one `transform`, the bone's matrix already has its place and turn. */
    private limb;
    private joint;
    private foot;
}

/** One bullet in flight, `update` moves it and the duel tests the step it made. */
declare class Bullet extends GameObject {
    readonly angle: number;
    readonly shooter: 1 | -1;
    readonly from: Point;
    readonly velocity: Point;
    /** The fly-by sound played. */
    passed: boolean;
    private readonly origin;
    constructor(x: number, y: number, angle: number, shooter: 1 | -1);
    /** Moves it on by `seconds` in one go, for a bullet that was shot a moment ago over there. */
    catchUp(seconds: number): void;
    get to(): Point;
    update(dt: number): void;
    render(layer: Layer2D | object): void;
}

/** One cowboy on the map. `side` is 1 for the left one, who faces right. */
declare class Cowboy extends GameObject {
    private parts;
    readonly side: 1 | -1;
    body: Body_2;
    state: CowboyState;
    /** Where the other cowboy aims, his head when he stands tall. */
    readonly standingHead: Point;
    /** Who he duels. */
    opponent: Cowboy;
    /** Who's holding. */
    control: () => boolean;
    alive: boolean;
    /** The other player's cowboy: he follows poses from the wire, and what hits him is decided over there. */
    remote: boolean;
    private seen;
    /** The round is decided: nothing he does counts, and no bullet can hit him. */
    private locked;
    /** Bullets pass him, the win sign is up. */
    safe: boolean;
    /** Radians from the forearm to the barrel. */
    private tilt;
    constructor(parts: Parts, x: number, side: 1 | -1);
    /** Runs the rules for one step and sets the pose from them. */
    advance(dt: number): CowboyEvent[];
    /** A pose from the other screen. `delay` is how old it is, in seconds. */
    receive(stand: number, dir: number, delay: number): void;
    /** He's moving the way the last pose said, moved forward by how long ago that was. */
    private follow;
    /** His own gun went off over there. */
    kick(): void;
    /** Takes the control away. Letting go mid draw shouldn't fire. */
    lock(): void;
    /** Goes down from a bullet, the velocity is in world units per second. */
    die(part: "head" | "body", x: number, y: number): void;
    /** Back on his feet with a full gun. */
    reset(): void;
    /** Where his torso is in the world, for what follows the body around. */
    get chest(): Point;
    get muzzle(): Point;
    /** The angle of a shot leaving now, before any spread: the way the gun points. */
    get aim(): number;
    /** Lines the gun up, so that fully up it points right at the other cowboy's head. */
    calibrate(): void;
    get hitLines(): Target[];
    private toWorld;
    render(layer: Layer2D | object): void;
}

declare type CowboyEvent = 
/** `wild` is 0 for dead on and 1 at the draw line. */
    {
    type: "shot";
    wild: number;
}
/** He tried to fire with no bullets. */
| {
    type: "click";
} | {
    type: "reload";
};

/** What one cowboy is doing. Plain data, so a bot and the network can use it too. */
declare type CowboyState = {
    /** 0 is fully down, 1 fully up. */
    stand: number;
    /** The kick of a shot, 1 right after it. */
    kick: number;
    ammo: number;
    /** Seconds left of the recoil, he can't duck during it. */
    recoil: number;
    /** Seconds into the next bullet. */
    reload: number;
    /** He's rising, so letting go now fires or feints. */
    drawing: boolean;
    /** Set by a shot: no rising until he has been fully down. */
    spent: boolean;
    /** He let go after a shot, and goes all the way down whatever is pressed now. */
    falling: boolean;
};

/** Runs both cowboys and everything in flight. */
declare class Duel extends GameObject {
    readonly left: Cowboy;
    readonly right: Cowboy;
    private events;
    private bullets;
    private barrels;
    constructor(left: Cowboy, right: Cowboy, events: DuelEvents);
    update(dt: number): void;
    /** After every bullet has moved. */
    lateUpdate(): void;
    /** A bullet from the other screen, `age` seconds after it left the gun. */
    spawn(x: number, y: number, angle: number, age: number): void;
    /** Takes every bullet off the map. */
    clear(): void;
    private run;
    private shoot;
    private test;
}

declare type DuelEvents = {
    /** Something a cowboy did, for sound and display. */
    action(cowboy: Cowboy, event: CowboyEvent): void;
    /** A bullet reached `target`, null for a barrel or the ground. */
    hit(hit: Hit, bullet: Bullet, target: Cowboy | null): void;
    /** One of ours left the gun, with the angle it got. */
    fired?(angle: number, from: {
        x: number;
        y: number;
    }): void;
    /** A bullet passed the middle of the map. */
    flyby(): void;
};

declare const FILES: {
    shot: string[];
    hit: string[];
    reload: string[];
    empty: string[];
    fly: string[];
};

declare type Hit = {
    kind: HitKind;
    x: number;
    y: number;
};

declare type HitKind = "head" | "body" | "barrel";

/** The one control: mouse, touch and space all mean "hold". */
declare class Hold {
    private target;
    private pointer;
    private key;
    private pauses;
    get held(): boolean;
    constructor(target: HTMLElement);
    /** Something on top takes the control. A hold never survives that, so nothing fires after it. */
    pause(reason: string, paused: boolean): void;
    destroy(): void;
    private pointerdown;
    private pointerup;
    private keydown;
    private keyup;
    private release;
    private prevent;
}

/** The revolver at the top of the screen. */
declare class Hud extends GameObject {
    private cowboy;
    private angle;
    /** Hidden on the pole, and nothing else of the duel is there to look at. */
    hidden: boolean;
    /** Rounds won, yours first. Null when nothing is being counted. */
    score: (() => [number, number] | null) | null;
    constructor(cowboy: Cowboy);
    update(dt: number): void;
    render(layer: Layer2D | object): void;
    /** Rounds won, as two numbers under the cylinder. */
    private tally;
    /** The old game's cylinder, flat colours in one thick outline, like a cartoon. */
    private cylinder;
}

/** Assets load through `fetch`, the only way the static build finds them under its base. */
declare type Images<T extends string> = Record<T, HTMLImageElement>;

declare type Invite = {
    game: string;
    host: string;
    by: string;
};

/** From the hit to the round's end: slow motion, the sign, back to speed, the fall. */
declare class Kill extends GameObject {
    private parts;
    private began;
    private dead;
    private ramping;
    constructor(parts: KillParts);
    get active(): boolean;
    /** A cowboy was hit. A second hit in the slow motion turns this into a draw. */
    strike(target: Cowboy, hit: Hit, angle: number): void;
    update(): void;
    /** Clears up for the next round. */
    reset(): void;
}

declare type KillParts = {
    engine: GameEngine;
    cowboys: [Cowboy, Cowboy];
    sound: Sound;
    blood: Blood;
    pools: BloodPools;
    banner: Banner;
    /** What the win sign says, `winner` is null for a draw. It's asked once a round, when the sign goes up. */
    text(winner: Cowboy | null): string;
    /** The round is over. This is the place for a win celebration, before the rematch. */
    done(winner: Cowboy | null): void;
};

declare function loadImages<T extends string>(folder: string, names: readonly T[], recolour?: Recolour): Promise<Images<T>>;

/**
 * Two players, one duel. It runs the flow around the fight: the lobby, the room, the pole, ready, the
 * zoom out and countdown, then the rounds until someone has won enough of them.
 */
declare class Online {
    private parts;
    private ui;
    private lobby;
    private match;
    private phase;
    private ready;
    private score;
    private away;
    private interrupted;
    /** The kill is over and the next round is waiting for the host. */
    private settled;
    private pending;
    private timers;
    private posing;
    private hosting;
    private tries;
    private asHost;
    private shown;
    constructor(parts: OnlineParts);
    /** The host's way in: a link to send. */
    host(): Promise<void>;
    /** The guest's way in: the link they were sent. */
    join({ game, host }: Invite): Promise<void>;
    private open;
    private link;
    /** An old link only works through the host's current id, so a host who reconnected needs a new one. */
    private watch;
    private attach;
    /** The other player is here. */
    private met;
    /** They left, or their link broke. */
    private gone;
    private fresh;
    private fail;
    /** The signs, the buttons and the note. */
    private show;
    private status;
    private maybeStart;
    /** Everything is set for a round, then 3, 2, 1, GO! at `go` on the shared clock. */
    private begin;
    private live;
    private sendPose;
    /** One of our bullets left the gun. */
    shot(angle: number, from: {
        x: number;
        y: number;
    }): void;
    /** One of theirs hit us, the one who gets shot decides. */
    hit(hit: Hit, bullet: Bullet): void;
    /** They told us they were hit, in their own view of the map. */
    private theyAreHit;
    /** Called when the win sign goes up. Counts the round and says what's on it. */
    banner(winner: Cowboy | null): string;
    /** The win sign has had its time. The host decides what comes next. */
    roundDone(): void;
    private round;
    /** Someone has the wins: back to the pole, and a rematch is both pressing ready again. */
    private finish;
    private visibility;
    /** A player's tab went away or came back. A hidden one can't decide hits, so the round stops. */
    private leaves;
    /** Everything on the map back to the start. */
    private reset;
    private clearTimers;
    private pause;
}

declare type OnlineParts = {
    engine: GameEngine;
    stage: Stage;
    left: Cowboy;
    right: Cowboy;
    duel: Duel;
    kill: Kill;
    hud: Hud;
    pole: Pole;
    hold: Hold;
    sound: Sound;
    clear(): void;
};

declare const PARTS: readonly ["upper-arm", "lower-arm", "pistol-arm", "upper-leg", "lower-leg", "elbow", "knee", "foot", "torso", "head"];

declare type Parts = Awaited<ReturnType<typeof loadImages<(typeof PARTS)[number]>>>;

declare type Point = {
    x: number;
    y: number;
};

/** The pole at the middle of the map, an arrow sign per player, always showing their names. */
declare class Pole extends GameObject {
    names: [string, string];
    constructor();
    render(layer: Layer2D | object): void;
}

/** The room a body falls in, the ground is `bottom`. */
declare type RagdollBounds = {
    left: number;
    right: number;
    bottom: number;
};

/** Colours to swap in the SVG source, the way a cowboy gets his outfit. */
declare type Recolour = Record<string, string>;

declare type SongName = keyof typeof SONGS;

/** The owner's songs, in the root `asset/audio/song/`. A missing one means silence. */
declare const SONGS: {
    menu: string;
    duel: string;
};

/** Plain Web Audio, one gain for everything with one each for music and sounds under it. */
declare class Sound {
    readonly volumes: Volumes;
    private context;
    private master;
    private sounds;
    private music;
    private buffers;
    private muted;
    private dipped;
    private wanted;
    private playing;
    private songs;
    /** A browser only starts audio from a tap, so call this from one. */
    unlock(): void;
    /** Listens for the first tap or key, and takes itself away after it. */
    unlockOnFirstTap(): void;
    get running(): boolean;
    get mute(): boolean;
    set mute(value: boolean);
    setVolume(name: keyof Volumes, value: number): void;
    play(name: SoundName, rate?: number): void;
    /** Which song plays, null for none. Before the first tap it waits, then starts. */
    song(name: SongName | null): void;
    /** Fades the old song out and the wanted one in. */
    private mix;
    private fetchSong;
    /** The old hit sound, stretched for slow motion. */
    hitSlow(): void;
    /** A falling whoosh and a heartbeat. Made here, there's no file for it. */
    slowMotion(seconds: number): void;
    /** Pulls the music down for the slow motion, and lets it back up. */
    dip(value: boolean): void;
    private thump;
    private apply;
    private load;
    /** A missing or broken file means silence, not a crash. */
    private decode;
}

declare type SoundName = keyof typeof FILES;

/**
 * Keeps the camera on the world: all of it at any canvas size, or close on the pole. The pole shot
 * and the zoom out are the same camera, so `view` is 0 on the pole and 1 on the whole map.
 */
declare class Stage {
    private from;
    private goal;
    private began;
    private length;
    constructor(start?: number);
    get view(): number;
    /** Moves to the pole (0) or the map (1) over `ms`. */
    go(view: 0 | 1, ms: number): void;
    controller(): {
        update: (camera: Camera) => void;
    };
}

/** Boots the game on the page's canvas. `?bot` is a practice duel and `?stage` an empty map, both with no network. */
export declare function startGame(): Promise<{
    engine: GameEngine<readonly [{
        readonly name: "main";
        readonly query: "canvas";
    }]>;
    map: {
        back: GameObject;
        actors: GameObject;
        front: GameObject;
        pole: Pole;
    };
    left: Cowboy;
    right: Cowboy;
    hold: Hold;
    duel: Duel;
    sound: Sound;
    kill: Kill;
    banner: Banner;
    stage: Stage;
    online: () => Online | null;
}>;

declare type Target = {
    kind: HitKind;
    a: Point;
    b: Point;
};

declare type Volumes = {
    everything: number;
    music: number;
    sounds: number;
};

export { }
