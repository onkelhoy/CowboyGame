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

/**
 * Translate function bound to the current language, as `{ translate, t }`. With `scope`,
 * keys are prefixed with `scope.`.
 */
export declare function useTranslator(scope?: string): {
    translate: TransalatorFn;
    t: TransalatorFn;
};

export { }
