import type { Dialog as Dialog_2 } from '@papit/dialog';
import type { HTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Ref } from 'react';

/** React wrapper for the `pap-dialog` element. */
export declare function Dialog({ ref, onOpen, onClose, closeoutsideclick, modal, ...props }: DialogProps): ReactElement;

export declare interface DialogProps extends Omit<HTMLAttributes<Dialog_2>, "header" | "open" | "closeoutsideclick" | "modal" | "onOpen" | "onClose"> {
    header?: Dialog_2["header"];
    open?: Dialog_2["open"];
    closeoutsideclick?: boolean;
    modal?: boolean;
    /** on the host whenever the dialog opens (not on the initial render) */
    onOpen?: (event: Event) => void;
    /** on the host whenever the dialog closes, including Escape and backdrop click */
    onClose?: (event: Event) => void;
    ref?: Ref<Dialog_2>;
    children?: ReactNode;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "pap-dialog": Omit<DialogProps, "onOpen" | "onClose" | "closeoutsideclick" | "modal"> & {
                "close-outside-click"?: DialogProps["closeoutsideclick"];
                "modal"?: DialogProps["modal"] | "false";
            };
        }
    }
}

export { }
