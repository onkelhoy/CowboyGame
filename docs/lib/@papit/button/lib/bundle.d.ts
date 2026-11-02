import { CustomElementInternals } from '@papit/web-component';

export declare class Button extends CustomElementInternals {
    static sheet: CSSStyleSheet;
    href?: string;
    variant: "outline" | "clear" | "filled";
    size: "small" | "medium" | "large" | "icon";
    color: ButtonColor;
    /** Form behaviour on activation, like a native button's `type`. */
    type?: "button" | "submit" | "reset";
    /** Blocks activation (click, Space, Enter) but keeps focus and the normal look. */
    readonly?: boolean;
    connectedCallback(): void;
    private handlekeydown;
    private handlekeyup;
    private handleclick;
    private handlefocusout;
    render(): string | Node;
}

/**
 * Theme color of a `pap-button`.
 * `"tiertery"` is a deprecated misspelling of `"tertiary"`, kept as an alias.
 */
export declare type ButtonColor = "primary" | "secondary" | "tertiary"
/** @deprecated use `"tertiary"` */
| "tiertery" | "success" | "warning" | "error" | "information";

export { }
