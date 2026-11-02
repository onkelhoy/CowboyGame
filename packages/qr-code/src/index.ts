import { QrCode } from './component.js';

// export 
export * from "./component";
export * from "./qr";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('cw-qr-code')) {
  window.customElements.define('cw-qr-code', QrCode);
}
