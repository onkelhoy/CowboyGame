/**
 * @fileoverview `@bind` method decorator for permanently binding a class method's `this` context
 * to the instance on first access.
 *
 * @details
 * **Key Features:**
 * - Lazily binds the method the first time it is accessed.
 * - Replaces the original property with the bound version for subsequent calls.
 * - Ensures that `this` always refers to the instance, even when the method is passed around.
 * - Avoids re-binding on every call, improving performance.
 *
 * @example
 * ```ts
 * class ButtonHandler {
 *   @bind
 *   onClick() {
 *     console.log("Clicked!", this);
 *   }
 * }
 *
 * const handler = new ButtonHandler();
 * const fn = handler.onClick;
 * document.addEventListener("click", fn); // Still works with correct `this`
 * ```
 *
 * @remarks
 * This decorator is useful when:
 * - Passing methods as callbacks to event listeners.
 * - Working with APIs that lose context when storing a reference to a method.
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-11
 */
export declare function bind<T>(_target: Object, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;

export declare function context(settings: Partial<ContextDecoratorSetting>): PropertyDecorator;

export declare function context(target: Object, propertyKey: PropertyKey): void;

export declare type ContextDecoratorSetting = {
    query?: string | (() => string);
    name?: string;
    attribute?: string;
    applyattribute?: boolean;
    rerender?: boolean;
    verbose?: boolean;
    update?(value: any, old: any): void;
};

/**
 * @fileoverview DOM utility for calculating the cumulative offset of an element.
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-13
 */
/**
 * Calculates the cumulative `top` and `left` offset of an element relative
 * to the document's origin (top-left corner).
 *
 * @details
 * - Iteratively traverses the DOM tree using `offsetParent`, summing `offsetTop` and `offsetLeft`
 *   until it reaches the root.
 * - Does not account for scroll position.
 *
 * @param element - The HTML element to measure.
 * @returns An object containing the cumulative `top` and `left` offset values in pixels.
 *
 * @example
 * ```ts
 * const pos = CumulativeOffset(myElement);
 * console.log(pos.top, pos.left); // e.g., 120, 340
 * ```
 *
 * @remarks
 * - If you need scroll-aware positions, combine `getBoundingClientRect()` with
 *   `window.scrollX` and `window.scrollY`.
 * - Fixed-position elements may yield different results.
 */
export declare function CumulativeOffset(element: HTMLElement): {
    top: number;
    left: number;
};

/**
 * Base class for custom elements with declarative template rendering.
 * Uses a `TemplateInstance` for efficient updates without re-rendering the entire DOM.
 * Supports reactive attributes, property decorators, and query decorators.
 */
export declare class CustomElement extends HTMLElement {
    /**
     * List of attributes to observe for changes.
     * Should be populated by decorators or subclasses.
     */
    static get observedAttributes(): string[];
    /**
     * Style string(s)
     */
    static sheet: CSSStyleSheet;
    static sheets: CSSStyleSheet[];
    /**
     * Returns the root node into which content is rendered:
     * - If `templateInstance` exists, returns its root element
     * - Else, if the element has a shadow root, returns it
     * - Else, returns the element itself
     */
    get root(): HTMLElement | ShadowRoot;
    originalAttributes: Array<Attr>;
    /**
     * Creates a new custom element.
     * @param shadowRootInit Options for `attachShadow`, merged with defaults.
     *                       Can also include custom settings such as `requestUpdateTimeout`.
     */
    constructor(shadowRootInit?: Partial<ShadowRootInit> & Partial<ElementSetting>);
    /**
     * Lifecycle: called when element is added to the DOM.
     * Reflects queued `@property` defaults to attributes, then triggers the first update/render.
     */
    connectedCallback(): void;
    /**
     * Lifecycle: called when element is removed from the DOM.
     * Empty by default, but subclasses can override.
     */
    disconnectedCallback(): void;
    /**
     * Lifecycle: called when an observed attribute changes.
     * Forwards changes to any registered property update handlers.
     * @param name The attribute name
     * @param oldValue Previous attribute value
     * @param newValue New attribute value
     */
    attributeChangedCallback(name: string, oldValue: any, newValue: any): void;
    /**
     * Hook called after the first render completes.
     * Subclasses should call super.firstRender to get styling to work
     */
    firstRender(): void;
    /**
     * Renders (or updates) the component's DOM inside its root.
     *
     * **Behavior:**
     * - If `render()` returns a raw HTML string, it is parsed into a DOM `Element` via {@link html}.
     * - On first render:
     *   - Appends the rendered element to `this.root`.
     *   - Wraps it in a `TemplateInstance` for marker-based updates (if it came from a tagged template).
     *   - Calls `firstRender()` and dispatches the `"first-render"` event (on the very first update,
     *     even when it renders nothing, so `static sheet` is adopted for components styled only on `:host`).
     * - On subsequent renders:
     *   - If the render output was from a tagged template, retrieves its dynamic values with {@link getValues} and calls `TemplateInstance.update()` to patch the DOM.
     *   - If the render output was a string-based template, no diffing occurs (it’s treated as static DOM).
     * - `null`, `undefined` or `""` renders nothing (removing what was rendered); returning content again mounts it fresh.
     * - A different template than the mounted one (another `html` call site, or another string) replaces it.
     * - Always resolves any `@query`-decorated properties after rendering.
     */
    update(): undefined;
    /**
     * Requests an update to the DOM.
     * The update is debounced according to `requestUpdateTimeout`.
     */
    requestUpdate(): void;
    throttleUpdate(): void;
    shadowClosest<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
    shadowClosest<E extends Element = Element>(selector: string): E | null;
    shadowQuery<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
    shadowQuery<E extends Element = Element>(selector: string): E | null;
    /**
     * Returns the template to render.
     * Can return either:
     * - A string (will be converted to a template)
     * - An Element (template root)
     * @returns string|Element
     */
    render(): string | Node | null | undefined;
    private templateInstance;
    private templateKey;
    private mounted;
    private hasRendered;
    private firstUpdate;
    /** Removes the mounted render, so the next one starts fresh. */
    private unmount;
    private queryMeta?;
    /**
     * Resolves `@query`-decorated properties by querying the render root.
     * If a `load` callback exists, it is invoked with the found element.
     */
    private findQueries;
    /**
     * Calls getStyle and populates to the styleElement
     * it will create the element if null
     */
    /**
     * combines both the static style together with the styles to form one big style
     * @returns string
     */
    private propertyMeta?;
}

/**
 * **CustomElementInternals**
 *
 * Extends {@link CustomElement} with built-in support for the
 * [Form-associated custom elements API](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-face-example)
 * via `ElementInternals`. This enables:
 *
 * - Direct form association (`static formAssociated = true`)
 * - Native form validation methods (`checkValidity`, `reportValidity`, `setValidity`)
 * - Integration with lifecycle form callbacks (`formAssociatedCallback`, `formDisabledCallback`, `formStateRestoreCallback`)
 * - Auto-synced `disabled` state with `aria-disabled`
 *
 * **Usage Example:**
 * ```ts
 * class MyInput extends CustomElementInternals {
 *   render() {
 *     return html`<input ?disabled=${this.disabled}>`;
 *   }
 * }
 * customElements.define('my-input', MyInput);
 * ```
 *
 * @extends CustomElement
 */
export declare class CustomElementInternals extends CustomElement {
    /** Enables native form association for this element. */
    static formAssociated: boolean;
    /** Reference to the element's internal form state manager. */
    protected _internals: ElementInternals;
    /** Held so WebKit does not garbage-collect the `CustomStateSet` and drop its states. */
    protected _states: CustomStateSet;
    /**
     * Reactive disabled property.
     * - `rerender: false` → does not trigger a re-render when changed
     * - `type: Boolean` → coerces values to `true`/`false`
     * - `aria: 'aria-disabled'` → syncs to ARIA for accessibility
     * - `removeAttribute: true` → removes `disabled` attribute when false
     */
    disabled: boolean | undefined;
    constructor(shadowRootInit?: Partial<ShadowRootInit> & Partial<ElementSetting>);
    /** Called when the element’s `disabled` state changes via a form. */
    protected formDisabledCallback(disabled: boolean): void;
    /** Called when the element is associated with a form. */
    protected formAssociatedCallback(form: HTMLFormElement): void;
    /** Called when the browser restores the form's state (e.g., after page reload). */
    protected formStateRestoreCallback(state: any, mode: any): void;
    /** Returns `true` if the element's value satisfies validity constraints. */
    protected checkValidity(): boolean;
    /** Reports validity and displays any validation message to the user. */
    protected reportValidity(): boolean;
    /**
     * Sets the validity state of the element.
     * @param flags - Validity state flags object
     * @param message - Optional validation message
     * @param anchor - Optional element to associate with the error
     */
    protected setValidity(flags?: ValidityStateFlags | undefined, message?: string | undefined, anchor?: HTMLElement | undefined): void;
}

/**
 * Debounce a class method.
 *
 * @overload@overload
 * @returns Method decorator with standard delay.
 */
export declare function debounce(): MethodDecorator;

/**
 * @overload@overload
 * @param delay Delay in milliseconds before the method is invoked.
 */
export declare function debounce(delay: number): MethodDecorator;

/**
 * @overload@overload
 * @param name Alternative property name for the debounced function.
 */
export declare function debounce(name: string): MethodDecorator;

/**
 * @overload@overload
 * @param options Partial options object with `delay` and/or `name`.
 */
export declare function debounce(options: Partial<DebounceOptions>): MethodDecorator;

/**
 * @overload@overload
 * Standard method decorator signature.
 */
export declare function debounce(target: any, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void;

/**
 * @fileoverview Utility function `debounceFn` that delays the execution of a function
 * until a specified delay has passed since the last time it was invoked.
 *
 * @details
 * **Behavior:**
 * - Resets the timer on each call, ensuring that the wrapped function only executes
 *   after `delay` milliseconds have passed without another call.
 * - Preserves the original `this` context of the wrapped function.
 * - Clears the timer after execution to avoid memory leaks.
 *
 * @typeParam T - The function type being debounced.
 *
 * @param execute - The function to debounce.
 * @param delay - The wait time in milliseconds before executing `execute`.
 *   Defaults to `STANDARD_DELAY`.
 *
 * @returns A debounced version of the provided function.
 *
 * @example
 * ```ts
 * const log = debounceFn((msg: string) => console.log(msg), 300);
 * log("Hello");
 * log("World");
 * // Only "World" will be logged after 300ms
 * ```
 *
 * @remarks
 * This is the low-level function used by higher-level decorators such as `@debounce`.
 * Use this directly for cases where you don't need a decorator.
 *
 * @see {@link STANDARD_DELAY} for the default delay value.
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-11
 */
export declare function debounceFn<T extends (...args: any[]) => any>(execute: T, delay?: number): (...args: Parameters<T>) => void;

export declare type DebounceOptions = {
    name?: string | Symbol;
    delay: number;
};

export declare type ElementSetting = {
    requestUpdateTimeout: number;
    throttleUpdateTimeout: number;
    lightDOM: boolean;
};

/**
 * @fileoverview Utility function to recursively extract trimmed text values
 * from the leaf nodes of an HTML `<slot>` element.
 *
 * @example
 * ```ts
 * const slotValues = ExtractSlotValue(mySlot);
 * // Example output: ["Hello", "World"]
 * ```
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-13
 */
/**
 * Extracts all non-empty, trimmed text content from the leaf nodes of a slot.
 *
 * @param slot - The HTML slot element to read from.
 * @returns An array of text values found within the slot’s assigned nodes.
 */
export declare function ExtractSlotValue(slot: HTMLSlotElement): string[];

export declare function findTarget(element: HTMLElement, query: string | (() => string) | undefined, finder?: (target: HTMLElement) => HTMLElement | null): HTMLElement | null;

/**
 * @fileoverview Formats numbers into compact, human-readable strings with unit suffixes.
 *
 * @details
 * - Uses `Intl.NumberFormat` with default options from {@link STANDARD_OPTIONS}.
 * - Supports compact notation such as `"1.3K"`, `"2.3M"`, `"7.8B"`, `"1.2T"`.
 * - Caches formatters internally for better performance on repeated calls with the same
 *   locale and options.
 *
 * @remarks
 * This function caches `Intl.NumberFormat` instances based on the `locale` and `options`
 * combination. This improves performance but means:
 * - You will get the same formatter instance on subsequent calls with the same arguments.
 * - Changing `STANDARD_OPTIONS` at runtime will not affect already cached formatters.
 *
 *
 * @see {@link STANDARD_OPTIONS} for default compact number formatting settings.
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-13
 */
/**
 * Formats a number into a compact, human-readable string with unit suffixes.
 *
 * @param value - The number to format.
 * @param locale - BCP 47 language tag (default: `"en-US"`).
 * @param options - Optional `Intl.NumberFormatOptions` overrides.
 * @returns The formatted string.
 *
 * @example
 * ```ts
 * FormatNumber(1250);                 // "1.3K"
 * FormatNumber(1250, "sv-SE");        // "1,3 tn"
 * FormatNumber(2_300_000, "en-GB");   // "2.3M"
 * ```
 */
export declare function FormatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string;

/**
 * @fileoverview Generates a pseudo-random UUID (version 4).
 *
 * @details
 * - Produces a UUID in the format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.
 * - Uses both `Date.getTime()` and, if available, `performance.now()` for
 *   higher-precision seeding.
 * - Not guaranteed to be cryptographically secure — use the Web Crypto API
 *   for security-sensitive UUIDs.
 *
 * @returns A UUID v4–formatted string.
 *
 * @example
 * ```ts
 * const id = generateUUID();
 * console.log(id); // "3b12f1df-5232-4f85-aeb1-9b1e2b6c5f23"
 * ```
 *
 * @remarks
 * This implementation is designed for general application-level uniqueness.
 * For UUIDs that must meet strict RFC 4122 randomness requirements,
 * use `crypto.randomUUID()` (available in modern browsers and Node.js 19+).
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4122 RFC 4122}
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-13
 */
export declare function generateUUID(): string;

/**
 * @fileoverview Provides a lightweight `html` tagged template function for creating
 * and caching DOM elements from template literals, with support for dynamic values
 * and metadata tracking.
 *
 * @details
 * **Features:**
 * - **Compilation & Caching** — Templates are compiled into DOM once and reused on subsequent calls.
 * - **Dynamic Value Markers** — Injects comment markers to identify and update dynamic values.
 * - **Metadata Tracking** — Associates root elements with their latest set of dynamic values.
 * - **Root Normalization** — Ensures a single Element root is always returned, wrapping as needed.
 * - **Quoting Fixes** — Automatically adds missing attribute quotes for valid HTML output.
 *
 * **Usage Flow:**
 * 1. The `html` function compiles or retrieves a cached template root.
 * 2. A clone of the root element is created for each call.
 * 3. Dynamic values are stored in an internal `WeakMap` for later updates.
 *
 * @example
 * ```ts
 * const view = html`
 *   <div class="user">${username}</div>
 * `;
 * document.body.append(view);
 *
 * const values = getValues(view); // Retrieve dynamic values array
 * ```
 *
 * @see {@link getValues} — Retrieves the stored dynamic values for a root element.
 *
 * @internal
 * This is the low-level core for the template system; higher-level rendering functions
 * may build on this to perform DOM diffing and patching.
 *
 * @created 2025-08-11
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 */
/**
 * Parses a raw HTML string into a normalized DOM `Element`.
 *
 * @param template Raw HTML string to parse into DOM.
 * @returns Root `Element` created from the provided HTML string.
 *
 * @example
 * const el = html("<slot></slot>");
 * document.body.appendChild(el);
 */
export declare function html(template: string): Node;

/**
 * Creates a DOM `Element` from a tagged template literal, inserting dynamic values.
 *
 * @param templateStringArray Template literal strings array (static parts of the HTML).
 * @param values Dynamic values to insert between the static strings.
 * @returns Root `Element` representing the compiled template DOM.
 *
 * @example
 * const el = html`<div>${content}</div>`;
 * document.body.appendChild(el);
 */
export declare function html(templateStringArray: TemplateStringsArray, ...values: unknown[]): Node;

/**
 * @fileoverview Linear interpolation utilities for mapping values between ranges.
 *
 * @details
 * - `lerp(a, b, t)`: Computes a value between `a` and `b` given a normalized factor `t` in [0, 1].
 * - `lerpValue(value, min, max, newmin, newmax)`: Maps a value from one range to another
 *   using linear interpolation, clamping the result to the target range.
 *
 * @example
 * ```ts
 * lerp(0, 10, 0.5); // 5
 *
 * lerpValue(5, 0, 10, 0, 100);  // 50
 * lerpValue(15, 0, 10, 0, 100); // 100 (clamped)
 * ```
 *
 * @remarks
 * `lerpValue` will clamp results to `[newmin, newmax]` to avoid exceeding the target range.
 * If you need unclamped mapping, you can remove the `Math.min`/`Math.max` calls.
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-13
 */
/**
 * Performs a linear interpolation between two values.
 *
 * @param a - The starting value.
 * @param b - The ending value.
 * @param t - Interpolation factor, typically between `0` and `1`.
 * @returns The interpolated value between `a` and `b`.
 */
export declare function lerp(a: number, b: number, t: number): number;

/**
 * Maps a value from one range to another using linear interpolation.
 *
 * @param value - The value to map.
 * @param min - The lower bound of the original range.
 * @param max - The upper bound of the original range.
 * @param newmin - The lower bound of the target range.
 * @param newmax - The upper bound of the target range.
 * @returns The mapped value, clamped to `[newmin, newmax]`.
 */
export declare function lerpValue(value: number, min: number, max: number, newmin: number, newmax: number): number;

/**
 * @fileoverview DOM utility for retrieving the next parent of an element,
 * including Shadow DOM host support.
 *
 * @author
 * Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-13
 */
/**
 * Returns the parent element of a given DOM element.
 *
 * @details
 * - If `parentElement` exists, it is returned.
 * - If the element is inside a Shadow DOM, the shadow host is returned.
 * - Returns `null` if neither a parent nor a host is found.
 *
 * @typeParam T - The expected element type for the returned parent (default: `HTMLElement`).
 *
 * @param element - The DOM element whose parent is being retrieved.
 * @returns The parent element or shadow host, or `null` if none exists.
 *
 * @example
 * ```ts
 * const parent = nextParent(myElement);
 * if (parent) {
 *   console.log("Parent found:", parent.tagName);
 * }
 * ```
 *
 * @remarks
 * - Useful for navigating out of a Shadow DOM to the host element.
 * - If `T` is provided, you can get stronger type checks for the returned parent.
 */
export declare function nextParent<T = HTMLElement>(element: HTMLElement): HTMLElement | T | null;

/**
 * A property decorator for defining reactive properties on a custom element.
 *
 * Can be used in two forms:
 * - `@property` with no arguments → default settings applied.
 * - `@property({...})` → pass custom settings such as `attribute`, `type`, `before`, `after`, etc.
 *
 * @param settings Partial settings object controlling reflection, hooks, and behavior.
 */
export declare function property(settings: Partial<PropertyDecoratorSetting>): PropertyDecorator;

/**
 * Overload for decorator used without arguments.
 *
 * @param target The prototype of the class.
 * @param propertyKey The property name.
 */
export declare function property(target: Object, propertyKey: PropertyKey): void;

export declare type PropertyDecoratorSetting<T = any> = {
    /**
     * Enables verbose logging for this property — useful during development or debugging.
     */
    verbose: boolean;
    /**
     * Synchronize this property with a corresponding ARIA attribute.
     * Great for enhancing accessibility (e.g., aria-label, aria-pressed).
     */
    aria: string;
    /**
     * When true, triggers a re-render of the component when the property changes.
     * Essential for reactive UIs.
     */
    rerender: boolean;
    /**
     * Fires a custom event (e.g., `${property}-changed`) when the property changes.
     */
    notify: boolean;
    /**
     * Marks the property as part of the component's context system.
     * Useful for dependency injection or shared state.
     */
    context: boolean;
    /**
     * Sync this property with an HTML attribute.
     * - `true`: uses the same name as the property.
     * - `string`: uses the provided name as the attribute.
     */
    attribute: boolean | string;
    /**
     * If true, removes the attribute from the DOM when the property is falsy (e.g., `false`, `null`, `undefined`).
     * Especially useful for toggle-like attributes such as `disabled`, `hidden`, or `checked`.
     */
    removeAttribute: boolean;
    /**
     * Reflects property changes back to the attribute.
     * For example, changing a property programmatically updates the corresponding HTML attribute.
     */
    reflect: boolean;
    /**
     * A type function (e.g., `String`, `Number`, `Boolean`) used to coerce attribute values into the desired type.
     * For example, turns `"123"` into `123` if `type: Number`.
     */
    type: Function;
    /**
     * Makes the property read-only. Any external assignment will be ignored or throw in strict mode.
     */
    readonly: boolean;
    /**
     * Whether the property descriptor can be redefined later.
     * Part of the standard property descriptor behavior.
     */
    configurable: boolean;
    /**
     * Whether the property will show up in object property enumerations like `Object.keys()` or `for...in`.
     */
    enumerable: boolean;
    /**
     * If true, disables generation of accessors (getter/setter) and directly defines the property.
     * Useful for static or internal properties that don't need tracking.
     */
    noAccessor: boolean;
    /**
     * maxReqursiveSteps is for values that is deeply nested objects|arrays
     * Use this to increase the default (20) reqursive steps a value will try before throwing an error
     */
    maxReqursiveSteps: number;
    /**
     * Lifecycle hook triggered when the property changes.
     * Receives the new and previous values.
     */
    observer(newVal: T, oldVal: T): void;
    /**
     * Custom change detection function.
     * Return `true` to trigger an update; `false` to skip it (e.g., shallow or deep compare).
     */
    hasChanged(newVal: T, oldVal: T): boolean;
    /**
     * Custom setter logic.
     * ⚠️ Called every time a value is set, regardless of whether it changed. Use cautiously.
     */
    set(value: Resolvable<T>): Resolvable<T>;
    /**
     * Custom getter logic.
     * Used to transform the value when the property is accessed.
     */
    get(value: T): T;
    /**
     * Hook called just before the value is set.
     * Useful for validation, logging, or mutation.
     */
    before(value: T, old: T, initial: boolean, attributeUpdate: boolean): void;
    /**
     * Hook called immediately after the value is set.
     * Receives the new value and the previous value.
     * Useful for triggering side effects like re-renders or DOM updates.
     */
    after(value: T, old: T, initial: boolean, attributeUpdate: boolean): void;
};

/**
 * A property decorator that registers a DOM query for the decorated property.
 *
 * Can be used in two forms:
 * - `@query` with no arguments → property name is used as selector
 * - `@query('selector')` or `@query({ selector: '...', load: el => {} })`
 *
 * When the component updates, the matching element is assigned to the property.
 *
 * @template T The type of the element being queried (defaults to `HTMLElement`).
 * @param settings Either a selector string, a partial `Setting<T>`, or omitted.
 */
export declare function query<T extends Element = HTMLElement>(settings: string | Partial<QueryDecoratorSetting<T>>): PropertyDecorator;

/**
 * Overload for decorator used without arguments.
 * @param target The prototype of the class.
 * @param propertyKey The name of the property.
 */
export declare function query(target: Object, propertyKey: PropertyKey): void;

export declare type QueryDecoratorSetting<T extends Element> = {
    selector: string | (() => string);
    outside?: boolean;
    load(element: T): void;
    error(): void;
};

export declare type Resolvable<T> = Promise<T> | T | (() => (T | Promise<T>));

export declare function resolve<T>(value: Resolvable<T>): Promise<T>;

export declare const STANDARD_DELAY = 300;

export declare const STANDARD_OPTIONS: Intl.NumberFormatOptions;

export declare function throttle(): MethodDecorator;

export declare function throttle(delay: number): MethodDecorator;

export declare function throttle(name: string): MethodDecorator;

export declare function throttle(options: Partial<ThrottleOptions>): MethodDecorator;

export declare function throttle(target: any, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void;

export declare function throttleFn<T extends (...args: any[]) => any>(execute: T, delay?: number): (...args: Parameters<T>) => void;

export declare type ThrottleOptions = {
    name?: string | Symbol;
    delay: number;
};

declare class UnsafeHTML {
    readonly value: string;
    constructor(value: string);
}

export declare function unsafeHTML(html: string): UnsafeHTML;

export { }
