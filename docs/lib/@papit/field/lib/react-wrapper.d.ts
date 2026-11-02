import type { Field as Field_2 } from '@papit/field';
import type { HTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Ref } from 'react';

/** React wrapper for the `pap-field` element. */
export declare function Field({ ref, hideStates, error, warning, errorState, warningState, ...props }: FieldProps): ReactElement;

export declare interface FieldProps extends Omit<HTMLAttributes<Field_2>, "hideStates" | "error" | "warning" | "errorState" | "warningState" | "disabled"> {
    hideStates?: Field_2["hideStates"];
    error?: Field_2["error"];
    warning?: Field_2["warning"];
    errorState?: Field_2["errorState"];
    warningState?: Field_2["warningState"];
    /**
     * Reactive disabled property.
     * - `rerender: false` → does not trigger a re-render when changed
     * - `type: Boolean` → coerces values to `true`/`false`
     * - `aria: 'aria-disabled'` → syncs to ARIA for accessibility
     * - `removeAttribute: true` → removes `disabled` attribute when false
     */
    disabled?: Field_2["disabled"];
    ref?: Ref<Field_2>;
    children?: ReactNode;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "pap-field": Omit<FieldProps, "hideStates" | "error" | "warning" | "errorState" | "warningState"> & {
                "hide-states"?: FieldProps["hideStates"];
            };
        }
    }
}

export { }
