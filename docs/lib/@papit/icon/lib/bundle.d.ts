import { CustomElement } from '@papit/web-component';

export declare const CountryEmojiSet: Record<string, string>;

/**
 * Renders an SVG icon inline from a URL, a spritesheet symbol (`url#id`) or a
 * name registered in `Icon.icons`, or a country flag emoji from `flag`.
 *
 * @element pap-icon
 * @slot - fallback content, rendered alongside the icon
 * @csspart svg - a fetched SVG
 * @csspart flag - the flag emoji wrapper
 * @csspart fallback - the default slot
 */
export declare class Icon extends CustomElement {
    static sheet: CSSStyleSheet;
    private viewBox;
    private assignedName?;
    /** SVG markup by name, shared by every instance. Fetched icons are added here; set your own to skip the fetch. */
    static icons: Map<string, string>;
    static parser: DOMParser;
    /** In-flight fetches by file URL, so a spritesheet is fetched once. */
    private static pending;
    private static fetchSvg;
    /** Keep fetched SVG text in localStorage under `storage` + URL. */
    cache: boolean;
    /** localStorage key prefix used when `cache` is on. */
    storage: string;
    /** Registered name, bare name (fetched as `/<name>.svg`), URL, or `url#symbol-id`. */
    name?: string;
    /** Two-letter country code rendered as a flag emoji; wins over `name`. */
    flag?: string;
    private isUrl;
    private getName;
    private store;
    render(): Node;
}

export { }
