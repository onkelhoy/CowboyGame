import type { Button as Button_2 } from '@papit/button';
import type { HTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Ref } from 'react';

/** React wrapper for the `pap-button` element. */
export declare function Button({ ref, ...props }: ButtonProps): ReactElement;

export declare interface ButtonProps extends Omit<HTMLAttributes<Button_2>, "href" | "variant" | "size" | "color" | "type" | "readonly" | "disabled"> {
    href?: Button_2["href"];
    variant?: Button_2["variant"];
    size?: Button_2["size"];
    color?: Button_2["color"];
    /** Form behaviour on activation, like a native button's `type`. */
    type?: Button_2["type"];
    /** Blocks activation (click, Space, Enter) but keeps focus and the normal look. */
    readonly?: Button_2["readonly"];
    /**
     * Reactive disabled property.
     * - `rerender: false` → does not trigger a re-render when changed
     * - `type: Boolean` → coerces values to `true`/`false`
     * - `aria: 'aria-disabled'` → syncs to ARIA for accessibility
     * - `removeAttribute: true` → removes `disabled` attribute when false
     */
    disabled?: Button_2["disabled"];
    ref?: Ref<Button_2>;
    children?: ReactNode;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "pap-button": ButtonProps;
        }
    }
}

export { }
