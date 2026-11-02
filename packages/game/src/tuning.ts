/** Everything tuned by playing, in seconds and world units. y is down. */
export const WORLD = { width: 1200, height: 600 } as const;
export const GROUND_Y = 560;

/** Where the cowboys stand, left and right. */
export const COWBOY_X = 170;

/** How much bigger a cowboy is than his rig units. */
export const COWBOY_SCALE = 1.05;

/** Seconds from fully down to fully up, slow enough for the other player to read. */
export const RISE_TIME = .9;
/** Seconds from fully up to fully down. */
export const DUCK_TIME = .33;
