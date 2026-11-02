import { CustomElement } from '@papit/web-component';
import { TransalatorFn } from '@papit/translator';

/** The QR code of `text`, or null when it doesn't fit a version 40 code (2331 bytes). */
export declare function encodeQr(text: string): QrMatrix | null;

/**
 * A QR code of `value` as an SVG, with its quiet zone. It's generated here, nothing leaves the
 * browser. Too much data for a QR code shows a message instead.
 *
 * @element cw-qr-code
 *
 * @property {string} value the text to encode
 * @property {string} label what the code is, for screen readers
 *
 * @csspart code the element holding the SVG
 * @csspart error the message shown when `value` doesn't fit
 */
export declare class QrCode extends CustomElement {
    static sheet: CSSStyleSheet;
    t: TransalatorFn;
    value: string;
    label: string;
    private code?;
    private drawn;
    private fits;
    update(): undefined;
    private draw;
    render(): Node;
}

export declare type QrMatrix = {
    /** Modules per side, without the quiet zone. */
    size: number;
    /** `size * size` entries, row by row. True is dark. */
    modules: boolean[];
};

export { }
