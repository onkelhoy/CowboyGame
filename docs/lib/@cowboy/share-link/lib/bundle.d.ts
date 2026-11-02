import { CustomElement } from '@papit/web-component';
import { TransalatorFn } from '@papit/translator';

/**
 * Button that hands over an invite link: the share sheet on phones (so Messages is one tap away),
 * the clipboard elsewhere. It says "Copied" itself, because toasts sit behind modal dialogs. Without
 * a clipboard (plain http on a phone) a prompt shows the link.
 *
 * @element cw-share-link
 *
 * @property {string} link the link to share
 * @property {boolean} compact short "Invite" label on a clear button, for the header (reflected)
 */
export declare class ShareLink extends CustomElement {
    static sheet: CSSStyleSheet;
    t: TransalatorFn;
    link: string;
    compact: boolean;
    private copied;
    private timer;
    private get sheetted();
    private handleClick;
    disconnectedCallback(): void;
    private get label();
    render(): Node;
}

export { }
