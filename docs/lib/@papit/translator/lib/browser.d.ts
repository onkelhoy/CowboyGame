declare type Language = string & {
    __brand: "language";
};

/**
 * A language entry. Give either `translations` inline or a `url` to a JSON file fetched on
 * first `change`. `meta.language` becomes `translator.locale`.
 */
export declare type LanguageJson = {
    meta?: {
        language: Language;
        region: string;
    };
    id: string;
} & ({
    url: string;
    translations?: {
        meta?: LanguageJson['meta'];
    } & Record<string, string>;
} | {
    url?: never;
    translations: {
        meta?: LanguageJson['meta'];
    } & Record<string, string>;
});

/** Signature of the function `useTranslator` returns. */
export declare type TransalatorFn = (key: string, variables?: Record<string, unknown>) => string;

/**
 * Field decorator that re-renders a component when the language changes. Subscribes on
 * `connectedCallback`, unsubscribes on `disconnectedCallback`, and calls `requestUpdate()`
 * plus the optional `update` hook on each change (and `update` on connect when a language is set).
 *
 * @example
 * class MyComponent extends CustomElement {
 *     @translate t = useTranslator();
 *     // or: @translate({ update(this: MyComponent) { this.updateLabels(); } })
 * }
 *
 * @author Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-11
 */
export declare function translate(target: Object, propertyKey: PropertyKey): void;

export declare function translate(settings: TranslateSetting): PropertyDecorator;

declare interface TranslateSetting {
    update?: UpdateFn;
}

/**
 * The shared translation store. `add` registers a language, `change` makes one current
 * (fetching its `url` on first use), and `subscribe` runs a callback on every later change.
 * `list`, `locale` and `current` are signal readers.
 */
export declare const translator: {
    list: () => LanguageJson[];
    add: (entry: LanguageJson) => void;
    change: (entry: string | LanguageJson) => Promise<({
        meta?: {
            language: Language;
            region: string;
        };
        id: string;
    } & {
        url?: never;
        translations: {
            meta?: LanguageJson["meta"];
        } & Record<string, string>;
    }) | ({
        meta?: {
            language: Language;
            region: string;
        };
        id: string;
    } & {
        url: string;
        translations?: {
            meta?: LanguageJson["meta"];
        } & Record<string, string>;
    } & {
        translations: NonNullable<LanguageJson["translations"]>;
    }) | null>;
    locale: () => Language | null;
    subscribe: (fn: () => void) => () => void;
    current: () => (LanguageJson & {
        translations: NonNullable<LanguageJson["translations"]>;
    }) | null;
};

declare type UpdateFn = (this: any) => void;

/**
 * Translate function bound to the current language. With `scope`, keys are prefixed with
 * `scope.`. Missing keys return the key; `{name}` placeholders are filled from `variables`.
 */
export declare function useTranslator(scope?: string): TransalatorFn;

export { }
