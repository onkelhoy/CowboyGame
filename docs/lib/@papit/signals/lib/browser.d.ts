export declare function computed<T>(fn: () => T): readonly [() => T, () => void];

export declare function effect(fn: () => void): () => void;

export declare function signal<T>(initial: T): readonly [() => T, (next: T | ((prev: T) => T)) => void];

export { }
