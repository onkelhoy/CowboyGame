import { CustomElement } from '@papit/web-component';

/**
 * Wrapper around native `<dialog>` with slots, close button, and backdrop click support.
 *
 * @example
 * ```html
 * <button commandfor="my-dialog" command="show-modal">Open</button>
 * <pap-dialog id="my-dialog" header="Confirm">
 *   <p>Are you sure?</p>
 *   <div slot="footer">
 *     <button commandfor="my-dialog" command="close">Cancel</button>
 *     <button>Confirm</button>
 *   </div>
 * </pap-dialog>
 * ```
 *
 * @slot - Main content
 * @slot header - Replaces header text
 * @slot footer - Action buttons (hidden when empty)
 *
 * @attr {string} header - Dialog title
 * @attr {boolean} open - Open state; opens modally when `modal` is set, non-modally otherwise
 * @attr {boolean} close-outside-click - Close on backdrop click
 * @attr {boolean} modal - Use showModal() for `open` and toggle() (default: true)
 *
 * @fires open - on the host whenever the dialog opens (not on the initial render)
 * @fires close - on the host whenever the dialog closes, including Escape and backdrop click
 *
 * @method show() - Open non-modal
 * @method showModal() - Open modal with backdrop
 * @method close() - Close dialog
 * @method toggle() - Toggle based on `modal` attr
 *
 * @csspart dialog - Native `<dialog>` element
 * @csspart header - Header bar
 * @csspart main - Content area
 * @csspart footer - Footer container
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ WAI-ARIA Dialog (Modal) Pattern}
 */
export declare class Dialog extends CustomElement {
    static sheet: CSSStyleSheet;
    private dialogElement;
    header?: string;
    open: boolean;
    protected closeoutsideclick: boolean;
    protected ismodal: boolean;
    private refs;
    private _internalopen;
    private hasslotheader;
    private hasslotfooter;
    private pointerdownoutside;
    connectedCallback(): void;
    disconnectedCallback(): void;
    show(): void;
    showModal(): void;
    /**
     * @warning
     * this is not tested yet and might throw.
     */
    showPopover(): void;
    close(): void;
    toggle(): void;
    private syncdialog;
    protected handleCommandRefClick(e: Event): void;
    protected handlePopoverRefClick(): void;
    protected handleheaderslot(e: Event): void;
    protected handlefooterslot(e: Event): void;
    protected handledialogpointerdown(e: PointerEvent): void;
    protected handledialogclick(e: MouseEvent): void;
    protected handledialogclose(): void;
    render(): Node;
}

export declare const FOCUSABLE = "[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"]), [data-focusable]";

export { }
