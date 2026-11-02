import { Matrix4 } from '@papit/matrix';
import { Vector2 } from '@papit/vector';
import { Vector3 } from '@papit/vector';

export declare type BaseSetting = {
    /** Case-insensitive, `main` or `default` makes this the default layer. */
    name: string;
    query: string;
    global: boolean;
    width: number;
    height: number;
    callbacks: SettingCallback[];
    /** Follows the light and dark theme of the page. One layer with this on is enough. */
    theme: boolean;
    documentElement: Document | HTMLElement | ShadowRoot;
};

declare type ButtonState = "left" | "wheel" | "right";

/**
 * What a layer is seen through. Set it with `layer.camera = new Camera()`.
 * Its position is the point at the center of the view, and controllers do the moving.
 * The projection defaults to orthographic on a 2D layer and perspective on a 3D one.
 */
export declare class Camera extends GameObject {
    projection?: CameraProjection;
    zoom: number;
    /** Vertical field of view in radians, for perspective. */
    fov: number;
    near: number;
    far: number;
    /** The view stays inside this rectangle, orthographic only. */
    bounds?: CameraBounds;
    ease: Easing;
    controllers: CameraController[];
    /** How far `pan` moved away from what `follow` aims at. */
    readonly offset: {
        x: number;
        y: number;
        z: number;
    };
    /** The layer this camera reads its size from. */
    surface: Layer | null;
    private view;
    private projected;
    private viewVersion;
    private lastFrame;
    private shakeTime;
    private shakeMagnitude;
    private shakeX;
    private shakeY;
    constructor(setting?: CameraSetting);
    get width(): number;
    get height(): number;
    /** The inverse of the camera's world matrix, shake included. */
    get viewMatrix(): Matrix4;
    /** For a 3D layer, in clip space. Orthographic shows 2 units high at zoom 1. */
    get projectionMatrix(): Matrix4;
    /** Called when the camera is set on a layer. */
    attach(layer: Layer): void;
    /** Called when the camera is taken off a layer. */
    detach(): void;
    start(): void;
    lateUpdate(dt: number): void;
    destroy(): void;
    /** Shakes the view for `duration` seconds, `magnitude` is the size in canvas pixels. */
    shake(duration?: number, magnitude?: number): void;
    /** Pulls the view back inside `bounds`. A view larger than `bounds` is centered on them. */
    clamp(): void;
    private updateShake;
}

export declare type CameraBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

/** Moves a camera. Controllers stack, each runs in order after everything else has moved. */
export declare type CameraController = {
    start?(camera: Camera): void;
    update(camera: Camera, dt: number): void;
    /** Releases what `start` set up. */
    destroy?(): void;
};

export declare type CameraProjection = "orthographic" | "perspective";

export declare type CameraSetting = {
    projection?: CameraProjection;
    zoom?: number;
    fov?: number;
    near?: number;
    far?: number;
    bounds?: CameraBounds;
    /** Used by controllers without their own. Defaults to 1, no easing. */
    ease?: Easing;
    controllers?: CameraController[];
};

/** A game object, or anything else with a position. */
export declare type CameraTarget = {
    worldPosition: Point;
} | {
    position: Point;
};

export declare type ClickEvents = {
    target: Mouse | Touches;
};

export declare const DefaultMouseSettings: MouseSettings;

/** How far to move this frame. A number moves the same distance per second at any frame rate. */
export declare function easeFactor(ease: Easing, dt: number): number;

/** A fraction per 60 Hz frame, or a function from `dt` to the fraction to move this frame. */
export declare type Easing = number | ((dt: number) => number);

/** Small event emitter: `on`, `off`, `emit`. */
export declare class Emitter {
    private listeners;
    on(event: string, listener: Listener): this;
    off(event: string, listener: Listener): this;
    emit(event: string, ...args: unknown[]): this;
}

export declare type EngineLayers<T extends readonly LayerSelector[]> = {
    [S in T[number] as LayerName<S>]: LayerOf<S>;
} & {
    [position: `layer${number}`]: Layer2D | Layer3D;
};

export declare class ExtendedTouch {
    position: Vector2;
    movement: Vector2;
    start: number;
    end: null | number;
    identifier: number;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    radiusX: number;
    radiusY: number;
    rotationAngle: number;
    force: number;
    target: EventTarget;
    constructor(touch: Touch);
    get id(): number;
    update(touch: Touch): void;
    release(): this;
}

/** Keeps a target at the center of the view. The first frame lands on it. */
export declare function follow(target: CameraTarget, setting?: FollowSetting): CameraController;

export declare type FollowSetting = {
    ease?: Easing;
    /** How far the target can be from the center, per axis, before the camera moves. */
    deadzone?: {
        x?: number;
        y?: number;
        z?: number;
    };
    /** Added to the target, like `{ z: 10 }` to stay behind it in 3D. */
    offset?: {
        x?: number;
        y?: number;
        z?: number;
    };
};

/** Looks with the mouse once the canvas is clicked and walks with WASD or the arrow keys. */
export declare function fps(setting?: FpsSetting): CameraController;

export declare type FpsSetting = {
    /** Units per second. */
    speed?: number;
    /** Radians per mouse pixel. */
    sensitivity?: number;
};

export declare class GameEngine<const T extends readonly LayerSelector[] = readonly LayerSelector[]> extends Emitter {
    static instance: GameEngine | null;
    /** Every layer by lowercase name. An unnamed layer is `layer0`, `layer1`, … by position. */
    readonly layers: EngineLayers<T>;
    /** The first layer named `main` or `default`, otherwise the first layer. */
    readonly defaultLayer: Layer2D | Layer3D;
    /** The root of the object tree. */
    readonly world: World;
    state: "running" | "paused";
    /** The theme of the page while a layer has `theme: true`, otherwise always `"light"`. */
    theme: Theme;
    /** Scales `deltaTime`: 0.5 is slow motion and 0 freezes the game. */
    timeScale: number;
    /** Seconds the game has run, `timeScale` included. */
    time: number;
    /** Seconds since the last frame, `timeScale` included. 0 on the first frame after a start. */
    deltaTime: number;
    /** Seconds per fixed step. */
    readonly fixedDeltaTime: number;
    /** Frames drawn so far. */
    frame: number;
    private list;
    private callback;
    private previous;
    private accumulator;
    private timer;
    private inputEvents;
    /**
     * @param selectors a query, or the settings of a layer. Defaults to `"canvas"`.
     */
    constructor(...selectors: T);
    /** Adds an object to the world. */
    add<O extends GameObject>(object: O): O;
    /** Removes an object from the world. */
    remove(object: GameObject): void;
    /** Keyboard, mouse and touch on the default layer, created on first use. */
    get input(): InputEvents;
    /** A layer by name in any case, for names only known at runtime. Without a name, the default layer. */
    layer(name?: string): Layer3D | Layer2D | undefined;
    /** The colour that stands out on the current theme, for lines and text. */
    get foreground(): "white" | "black";
    get canvas(): HTMLCanvasElement;
    get element(): HTMLCanvasElement;
    get setting(): Setting;
    get context(): CanvasRenderingContext2D;
    get ctx(): CanvasRenderingContext2D;
    static get ctx(): CanvasRenderingContext2D | undefined;
    get gl(): WebGL2RenderingContext;
    get gl1(): WebGLRenderingContext;
    get width(): number;
    get height(): number;
    getSetting(index: number): Setting;
    getContext<T = CanvasRenderingContext2D>(index: number): T;
    getElement(index: number): HTMLCanvasElement;
    getCanvas(index: number): HTMLCanvasElement;
    /** Starts the loop with a callback that runs every frame. */
    loop(callback: SettingCallback): void;
    /** Runs the first frame right away, the next ones on animation frames. */
    start(): void;
    stop(): void;
    private handletheme;
    private handleframe;
    private fixedSteps;
}

/**
 * A thing in the game. Extend it and override the lifecycle methods you need,
 * `add` it to the engine or to another object, and children move with their parent.
 * It emits `start` and `destroy`.
 */
export declare class GameObject extends Emitter {
    readonly transform: Transform;
    readonly children: GameObject[];
    name: string;
    /** Layer name to draw on, inherited by children. Without one, the default layer. */
    layer?: string;
    /** Set once the object is in a world. */
    engine: GameEngine | null;
    parent: GameObject | null;
    protected started: boolean;
    private worldPoint;
    get position(): Vector3;
    get rotation(): Vector3;
    get scale(): Vector3;
    get worldMatrix(): Matrix4;
    /** Where the object is after its parents, the same object on every read. */
    get worldPosition(): {
        x: number;
        y: number;
        z: number;
    };
    /** Runs once, before the object's first update. */
    start(): void;
    /** Runs at a fixed rate, `dt` is always the same. Use it for physics. */
    fixedUpdate(dt: number): void;
    /** Runs every frame, `dt` is the seconds since the last one. */
    update(dt: number): void;
    /** Runs every frame after every `update`, so a camera can follow what moved. */
    lateUpdate(dt: number): void;
    /** Draws the object. The context of a 2D layer is already placed at this object. */
    render(layer: Layer2D | Layer3D): void;
    /** Runs when the object leaves the world. */
    destroy(): void;
    /** Adds a child, moving it from its current parent if it has one. */
    add<T extends GameObject>(child: T): T;
    /** Removes a child, then runs `destroy` on it and everything under it. */
    remove(child: GameObject): void;
    /** The first object under this one with this name, or matching this check. */
    find(match: string | ((object: GameObject) => boolean)): GameObject | null;
    /** Runs one phase on this object, then on its children. The engine calls this. */
    step(phase: Phase, dt: number): void;
    /** Draws this object, then its children. The engine calls this. */
    draw(): void;
    private layerName;
    private join;
    private leave;
}

export declare class InputEvents extends EventTarget {
    static instance: InputEvents | null;
    settings: Settings;
    mouse: Mouse;
    touch: Touches;
    keyboard: Keyboard;
    position: Vector2;
    movement: Vector2;
    pressing: boolean;
    constructor(canvas: HTMLCanvasElement, settings?: Partial<Settings>);
    set verbose(value: boolean);
    handledown: (e: Event) => void;
    handleup: (e: Event) => void;
    handlemove: (e: Event) => void;
    key(name: string): Partial<KeyInfo>;
    onkey(eventname: string, callback: EventListenerOrEventListenerObject | null): void;
    on(eventname: string, callback: EventListenerOrEventListenerObject | null): void;
}

export declare class Keyboard extends EventTarget {
    keys: Record<string, Partial<KeyInfo>>;
    verbose: boolean;
    constructor();
    on(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    key(name: string): Partial<KeyInfo>;
    handlekeydown: (e: KeyboardEvent) => void;
    handlekeyup: (e: KeyboardEvent) => void;
}

export declare type KeyboardEventListener = (event: CustomEvent<KeyInfo>) => void;

export declare type KeyboardEventMap = {
    [key: string]: CustomEvent<KeyInfo>;
};

export declare type KeyInfo = {
    pressed: boolean;
    start: null | number;
    stop: null | number;
};

/**
 * One canvas of the scene. Sizes itself on creation and follows its element after that:
 * the observer records the new size, and `resize()` applies it.
 */
export declare abstract class Layer<Context extends RenderingContext = RenderingContext> {
    readonly name: string;
    readonly setting: Setting;
    readonly element: HTMLCanvasElement;
    readonly context: Context;
    /** Set by the engine while its loop runs, a running layer resizes before it draws. */
    running: boolean;
    /** Set by the engine that owns this layer. */
    engine: GameEngine | null;
    private currentCamera;
    private preparedFrame;
    private displayWidth;
    private displayHeight;
    private observer;
    constructor(setting: Setting, name: string);
    /** What this layer is seen through. Without one, world units are canvas pixels. */
    get camera(): Camera | null;
    set camera(value: Camera | null);
    get canvas(): HTMLCanvasElement;
    get width(): number;
    get height(): number;
    /**
     * Readies this layer for an object to draw on. The first object of a frame also clears it,
     * a layer nothing draws on keeps what was painted by hand.
     */
    place(matrix: Float32Array, frame: number): void;
    /** Resets what `place` changed, so a loop callback draws on a plain canvas. */
    finish(): void;
    protected abstract prepare(): void;
    /**
     * Applies the size of the element to the canvas, a width or height from the settings stays as it is.
     * Setting a canvas size clears it, so a running loop calls this before it draws.
     * @returns whether the size changed
     */
    resize(): boolean;
    private handleresize;
}

/** One 2D canvas. */
export declare class Layer2D extends Layer<CanvasRenderingContext2D> {
    private view;
    private placed;
    constructor(setting: StandardSetting, name: string);
    get ctx(): CanvasRenderingContext2D;
    place(matrix: Float32Array, frame: number): void;
    finish(): void;
    protected prepare(): void;
    /** `center of the canvas * zoom * camera view`. */
    private updateView;
}

/** One WebGL canvas, with helpers for its shader programs. */
export declare class Layer3D extends Layer<WebGLRenderingContext | WebGL2RenderingContext> {
    programs: Map<string, WebGLProgram>;
    constructor(setting: WebGLSetting | WebGL2Setting, name: string);
    get gl(): WebGL2RenderingContext;
    get gl1(): WebGLRenderingContext;
    protected prepare(): void;
    /**
     * This function will remove a selected program from the gl-context, errors are logged and null is returned
     * @param name string - used to locate program
     * @returns true
     */
    deleteProgram(name: string): boolean;
    /**
     * This function will remove a selected program from the gl-context, errors are logged and null is returned
     * @param name string - used to locate program
     * @returns true | null
     */
    deleteProgramSafe(name: string): boolean | null;
    /**
     * This functions creates a program by accepting a vertex and a fragment shader, if error it throws a Error
     * @param name string name of the program
     * @param vertex ShaderSource
     * @param fragment ShaderSource
     * @returns WebGLProgram
     */
    createProgram(name: string, vertex: ShaderSource, fragment: ShaderSource): Promise<WebGLProgram>;
    /**
     * This functions creates a program by accepting a vertex and a fragment shader, if error it logs and returns null
     * @param name string name of the program
     * @param vertex ShaderSource
     * @param fragment ShaderSource
     * @returns WebGLProgram | null
     */
    createProgramSafe(name: string, vertex: ShaderSource, fragment: ShaderSource): Promise<WebGLProgram | null>;
    /**
     * This function creates a shader from a source, if error it throws a Error
     * @param type vertext | fragment
     * @param source ShaderSource
     * @param gl WebGLRenderingContext | WebGL2RenderingContext
     * @returns Promise WebGLShader
     */
    createShader(type: "vertex" | "fragment", source: ShaderSource, gl: WebGLRenderingContext | WebGL2RenderingContext): Promise<WebGLShader>;
    /**
     * This function creates a shader from a source, if error it logs and returns null
     * @param type vertext | fragment
     * @param source ShaderSource
     * @param gl WebGLRenderingContext | WebGL2RenderingContext
     * @returns Promise WebGLShader | null
     */
    createShaderSafe(type: "vertex" | "fragment", source: ShaderSource, gl: WebGLRenderingContext | WebGL2RenderingContext): Promise<WebGLShader | null>;
    /**
     * sets the current program to context, if error it throws Error
     * @param name string name of the program
     */
    useProgram(name: string): void;
    /**
     * sets the current program to context, if error it logs and return false
     * @param name string name of the program
     * @returns boolean state if success (true) or error
     */
    useProgramSafe(name: string): boolean;
}

declare type LayerName<S> = S extends {
    name: infer Name extends string;
} ? Lowercase<Name> : never;

declare type LayerOf<S> = S extends {
    type: "webgl" | "webgl2";
} ? Layer3D : Layer2D;

export declare type LayerSelector = Partial<Setting> | string;

declare type Listener = (...args: any[]) => void;

export declare function logscreen(...strings: any[]): void;

export declare class Mouse extends EventTarget {
    position: Vector2;
    movement: Vector2;
    setting: MouseSettings;
    lastpointerlock: number;
    clicked: boolean;
    verbose: boolean;
    click: {
        start: null | number;
        end: null | number;
        button: null | ButtonState;
    };
    pointerlocktimer: NodeJS.Timeout | null;
    private canvas;
    constructor(canvas: HTMLCanvasElement, setting: MouseSettings);
    on<K extends keyof MouseEventMap>(type: K, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener<K extends keyof MouseEventMap>(type: K, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    handlemousemove: (e: MouseEvent) => void;
    handlemousedown: (e: MouseEvent) => void;
    handlemouseup: (e: MouseEvent) => void;
    draw(ctx: CanvasRenderingContext2D, strokecolor?: string, fillcolor?: string, thickness?: number): void;
    handlepointersetup: (e: MouseEvent) => void;
    handlepointerlockchange: (e: Event) => void;
    handlepointerlockerror: (e: Event) => void;
}

declare type MouseEventMap = {
    move: Event;
    down: Event;
    up: Event;
};

export declare type MouseSettings = {
    pointerlock?: PointerLockOptions;
};

/** Circles a target: drag to turn around it, the wheel to change the distance. */
export declare function orbit(setting?: OrbitSetting): CameraController;

export declare type OrbitSetting = {
    /** What to circle. Defaults to the origin. */
    target?: CameraTarget;
    distance?: number;
    min?: number;
    max?: number;
    /** Radians around the target, 0 is on its +z side. */
    yaw?: number;
    /** Radians above the target. */
    pitch?: number;
    /** Radians per dragged pixel. */
    sensitivity?: number;
    /** Distance change per wheel pixel, as a fraction. */
    speed?: number;
};

/** Drags the view. On top of `follow`, it stays offset from the target. */
export declare function pan(setting?: PanSetting): CameraController;

export declare type PanSetting = {
    /** The pointer button that drags, 0 is the main one. */
    button?: number;
};

declare type Phase = "fixedUpdate" | "update" | "lateUpdate";

declare type Point = {
    x: number;
    y: number;
    z?: number;
};

export declare type Setting = StandardSetting | WebGLSetting | WebGL2Setting;

export declare type SettingCallback = (deltaTimeInMilliseconds: number, deltaTimeInSeconds: number) => void;

export declare type Settings = {
    mouse: MouseSettings;
    touch: undefined;
    keyboard: undefined;
    global: boolean;
    verbose: boolean;
};

export declare type ShaderSource = string | {
    url: string;
};

export declare type StandardSetting = BaseSetting & {
    type: "2d";
    contextSetting?: CanvasRenderingContext2DSettings;
};

export declare type Theme = "light" | "dark";

export declare class Touches extends EventTarget {
    mouse: ExtendedTouch | null;
    position: Vector2;
    movement: Vector2;
    touches: Record<number, ExtendedTouch>;
    changedTouches: ExtendedTouch[];
    verbose: boolean;
    constructor(canvas: HTMLCanvasElement);
    on<K extends keyof TouchesEventMap>(type: K, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener<K extends keyof TouchesEventMap>(type: K, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    handletouchstart: (e: TouchEvent) => void;
    handletouchend: (e: TouchEvent) => void;
    handletouchmove: (e: TouchEvent) => void;
    handletouchcancel: (e: TouchEvent) => void;
    touchChange(touch: Touch): ExtendedTouch;
}

export declare interface TouchesEventMap {
    "last-down": Event;
    "down": Event;
    "last-up": Event;
    "up": Event;
    "last-move": Event;
    "move": Event;
    "cancel": Event;
}

/**
 * Position, rotation and scale are the source of truth, the matrices are derived from them.
 * A vector can't report a change, so reading a matrix compares against the last values used.
 * Rotation is Euler angles in radians, applied Z, then X, then Y.
 */
export declare class Transform {
    readonly position: Vector3;
    readonly rotation: Vector3;
    readonly scale: Vector3;
    readonly children: Transform[];
    /** Goes up every time `worldMatrix` changes, so a reader can tell it needs to redo its work. */
    worldVersion: number;
    private currentParent;
    private local;
    private world;
    private localVersion;
    private lastValues;
    private lastLocalVersion;
    private lastParent;
    private lastParentVersion;
    get parent(): Transform | null;
    set parent(value: Transform | null);
    /** `translate * rotate * scale`. */
    get localMatrix(): Matrix4;
    /** `parent.worldMatrix * localMatrix`, or the local matrix without a parent. */
    get worldMatrix(): Matrix4;
    private changed;
    private composeLocal;
}

export declare type WebGL2Setting = BaseSetting & {
    type: "webgl2";
    contextSetting?: WebGLContextAttributes;
};

export declare type WebGLSetting = BaseSetting & {
    type: "webgl";
    contextSetting?: WebGLContextAttributes;
};

/** The root of the object tree. Every game object lives under it. */
export declare class World extends GameObject {
    constructor(engine: GameEngine);
}

/** Zooms with the wheel. */
export declare function zoom(setting?: ZoomSetting): CameraController;

export declare type ZoomSetting = {
    min?: number;
    max?: number;
    /** Zoom change per wheel pixel. */
    speed?: number;
    ease?: Easing;
};

export { }
