import type { HTMLAttributes } from 'react';
import type { Input as Input_2 } from '@papit/input';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Ref } from 'react';

/** React wrapper for the `pap-input` element. */
export declare function Input({ ref, onChange, hideStates, value, error, warning, errorState, warningState, ...props }: InputProps): ReactElement;

export declare interface InputProps extends Omit<HTMLAttributes<Input_2>, "type" | "format" | "value" | "defaultValue" | "maxlength" | "minlength" | "min" | "max" | "pattern" | "accept" | "placeholder" | "autocomplete" | "name" | "clear" | "required" | "hideStates" | "error" | "warning" | "errorState" | "warningState" | "disabled" | "onChange"> {
    type?: Input_2["type"];
    format?: Input_2["format"];
    value?: Input_2["value"];
    defaultValue?: Input_2["defaultValue"];
    maxlength?: Input_2["maxlength"];
    minlength?: Input_2["minlength"];
    min?: Input_2["min"];
    max?: Input_2["max"];
    pattern?: Input_2["pattern"];
    accept?: Input_2["accept"];
    placeholder?: Input_2["placeholder"];
    autocomplete?: Input_2["autocomplete"];
    name?: Input_2["name"];
    clear?: Input_2["clear"];
    required?: Input_2["required"];
    hideStates?: Input_2["hideStates"];
    error?: Input_2["error"];
    warning?: Input_2["warning"];
    errorState?: Input_2["errorState"];
    warningState?: Input_2["warningState"];
    /**
     * Reactive disabled property.
     * - `rerender: false` → does not trigger a re-render when changed
     * - `type: Boolean` → coerces values to `true`/`false`
     * - `aria: 'aria-disabled'` → syncs to ARIA for accessibility
     * - `removeAttribute: true` → removes `disabled` attribute when false
     */
    disabled?: Input_2["disabled"];
    /** Dispatched whenever the value changes */
    onChange?: (event: Event) => void;
    ref?: Ref<Input_2>;
    children?: ReactNode;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "pap-input": Omit<InputProps, "onChange" | "value" | "hideStates" | "error" | "warning" | "errorState" | "warningState"> & {
                "hide-states"?: InputProps["hideStates"];
            };
        }
    }
}

export { }
