import { ShareLink } from './component.js';

// export 
export * from "./component";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('cw-share-link')) {
  window.customElements.define('cw-share-link', ShareLink);
}
