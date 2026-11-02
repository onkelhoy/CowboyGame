import { Field } from '@papit/field';

export declare type ClickEvent = {
    timestamp: number;
};

/**
 * Form-associated input with optional format masking, password visibility toggle, and clear button.
 * Enter submits the form. The host's `aria-label`, `aria-labelledby`, `aria-describedby`
 * and `<label for>` name the inner input.
 *
 * @example
 * ```html
 * <pap-input name="phone" format="(xxx) xxx-xxxx"></pap-input>
 * <pap-input type="password" name="secret"></pap-input>
 * <pap-input clear placeholder="Search..."></pap-input>
 * ```
 *
 * @slot prefix - Content before the input
 * @slot sufix - Content after the input
 *
 * @attr {string} type - Native input type (default: "text")
 * @attr {string} format - Mask pattern using `x` as a placeholder, e.g. "xxx-xxx-xxxx"
 * @attr {string | number | Date} value - Current value
 * @attr {string} defaultvalue - Value restored on form reset
 * @attr {boolean} clear - Show a clear button when the value is non-empty
 * @attr {boolean} required - Marks the field as required
 *
 * @fires change - Dispatched whenever the value changes
 *
 * @csspart wrapper - Outer container
 * @csspart input - Native `<input>` element
 * @csspart eye - Password visibility toggle button (only for `type="password"`)
 * @csspart clear - Clear value button (only when `clear` is set)
 */
export declare class Input extends Field {
    static sheet: CSSStyleSheet;
    private formatCount;
    private originalType;
    type: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" | "datetime";
    format?: string;
    private _cachedValue;
    value: string | number | Date | null;
    defaultValue?: string;
    maxlength?: number;
    minlength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    accept?: string;
    placeholder?: string;
    autocomplete: "on" | "off" | (string & {});
    name?: string;
    clear: boolean;
    required: boolean;
    inputElement: HTMLInputElement;
    constructor();
    protected formAssociatedCallback(form: HTMLFormElement): void;
    private handleFormReset;
    private handleInput;
    private handleKeydown;
    private handleClear;
    private handleEye;
    render(): Node;
    private label;
    private getFormat;
    private getRaw;
    private setValue;
}

export { }
