import type { HTMLAttributes } from 'react';
import type { Icon as Icon_2 } from '@papit/icon';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Ref } from 'react';

/** React wrapper for the `pap-icon` element. */
export declare function Icon({ ref, ...props }: IconProps): ReactElement;

export declare interface IconProps extends Omit<HTMLAttributes<Icon_2>, "cache" | "storage" | "name" | "flag"> {
    /** Keep fetched SVG text in localStorage under `storage` + URL. */
    cache?: Icon_2["cache"];
    /** localStorage key prefix used when `cache` is on. */
    storage?: Icon_2["storage"];
    /** Registered name, bare name (fetched as `/<name>.svg`), URL, or `url#symbol-id`. */
    name?: Icon_2["name"];
    /** Two-letter country code rendered as a flag emoji; wins over `name`. */
    flag?: Icon_2["flag"];
    ref?: Ref<Icon_2>;
    children?: ReactNode;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "pap-icon": IconProps;
        }
    }
}

export { }
