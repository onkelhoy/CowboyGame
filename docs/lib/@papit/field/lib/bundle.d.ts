import { CustomElementInternals } from '@papit/web-component';
import { ElementSetting } from '@papit/web-component';
import { TransalatorFn } from '@papit/translator';

/**
 * `Field` is an extensible base class for form field web components.
 *
 * It wraps a native `<input>`, `<textarea>`, or `<select>` (either in the
 * shadow root via `[data-target]` or assigned through the default slot) and
 * handles:
 *
 * - **Error state** — populated on the native `invalid` event, which fires
 *   when browser constraint validation fails (e.g. `required`, `minlength`,
 *   `pattern`, `setCustomValidity`).
 * - **Warning state** — populated on `change` when the field is *valid* but
 *   the consuming code has configured `warning` messages. Warnings are purely
 *   informational and never block form submission.
 * - **Translation fallback chain** — messages resolve in priority order:
 *   explicit prop → field-scoped translation → global translation → raw key.
 *
 * Both `errorState` and `warningState` are exposed as context properties so
 * descendant components can read them without prop-drilling.
 *
 * ### Extending
 * ```ts
 * class MyInput extends Field {
 *   render() {
 *     return html`
 *       <input data-target type="text" name="${this.name}" />
 *       ${this.renderStates()}
 *     `;
 *   }
 * }
 * ```
 *
 * ### Using as a wrapper
 * ```html
 * <pap-field>
 *   <input type="email" name="email" required />
 * </pap-field>
 * ```
 *
 * @element pap-field
 */
export declare class Field extends CustomElementInternals {
    static sheets: CSSStyleSheet[];
    private _arialabel?;
    private _ariadescription?;
    private _arialabelledby?;
    private _ariadescribedby?;
    hideStates: boolean;
    error: StateMap;
    warning: StateMap;
    errorState: State;
    warningState: State;
    t: TransalatorFn;
    private get fieldName();
    protected syncValidity(): void;
    private _target;
    protected get target(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    protected set target(value: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null);
    constructor(shadowRootInit?: Partial<ShadowRootInit> & Partial<ElementSetting>);
    disconnectedCallback(): void;
    customError(message: string | string[]): void;
    customWarning(message: string | string[]): void;
    private setState;
    private handleinvalid;
    private handlechange;
    private handleslotchange;
    private resolveMessage;
    private applyNaming;
    private isTarget;
    protected renderStates(): Node | null;
    render(): Node;
}

declare type State = Partial<Record<keyof ValidityState, Array<string>>>;

declare type StateMap = Partial<Record<(keyof ValidityState | (string & {})), string | string[] | (() => string | string[])>>;

export { }
