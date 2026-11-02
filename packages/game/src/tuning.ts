/** Everything tuned by playing, in seconds and world units. y is down. */
export const WORLD = { width: 1200, height: 600 } as const;
export const GROUND_Y = 560;

/** Where the cowboys stand, left and right. */
export const COWBOY_X = 170;

/** How much bigger a cowboy is than his rig units. */
export const COWBOY_SCALE = 1.05;

/** Seconds from fully down to fully up, slow enough for the other player to read. */
export const RISE_TIME = .25;
/** How far up the arm stops turning, above it only the body's lean still tips the gun. */
export const GUN_LEVEL = .75;
/** Seconds from fully up to fully down. */
export const DUCK_TIME = .18;

/** Below this part of the rise a release is only a feint. */
export const DRAW_LINE = .35;
/** Radians either way off the gun at the draw line, falling to 0 at the top. */
export const SPREAD = 3 * Math.PI / 180;
/** Seconds after a shot before a release can duck him. */
export const RECOIL = .25;
/** Seconds per bullet, only fully down. */
export const RELOAD = .67;
export const AMMO = 6;
/** How fast the kick of a shot fades, per second. */
export const KICK_FADE = 4;

/** World units per second, about 0.2 s across. */
export const BULLET_SPEED = 3900;
/** How much of the head a bullet can clip, out in front of the bone. */
export const HEAD_FORWARD = 10;

/** World units per second². */
export const GRAVITY = 720;
export const BOUNCE = .9;
/** Velocity kept per 1/60 s. */
export const FRICTION = .99;
/** How much of the bullet's speed goes into the body. */
export const BULLET_PUSH = .5;
