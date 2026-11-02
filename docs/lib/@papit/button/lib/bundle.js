var p=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var o=(a,i,r,t)=>{for(var n=t>1?void 0:t?u(i,r):i,l=a.length-1,d;l>=0;l--)(d=a[l])&&(n=(t?d(i,r,n):d(n))||n);return t&&n&&p(i,r,n),n};import{bind as c,CustomElementInternals as m,property as s}from"@papit/web-component";var h=new CSSStyleSheet;h.replaceSync(`:host {
    /* the color token; every color rule below only sets this */
    --btn-accent: var(--button-primary, var(--primary));
    /* text on a filled button where contrast-color() is unsupported */
    --btn-text: var(--button-text, var(--text-inverse));

    --btn-background: var(--btn-accent);
    --btn-border: var(--btn-accent);
    --btn-hover: color-mix(in oklch, var(--btn-background), var(--shade-0) 5%);
    --btn-active: color-mix(in oklch, var(--btn-background), var(--shade-0) 10%);

    -webkit-user-select: none;
    /* Safari */
    -ms-user-select: none;
    /* IE 10 and IE 11 */
    user-select: none;
    /* Standard syntax */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding-inline: var(--space-2, 8px);

    border: 2px solid var(--btn-border);
    box-sizing: border-box;
    border-radius: var(--space-1, 4px);

    background-color: var(--btn-background);
    color: var(--btn-text);
}

@supports (color: contrast-color(red)) {
    :host {
        color: contrast-color(var(--btn-background));
    }
}

:host(:hover) {
    background-color: var(--btn-hover);
}

:host(:state(active)),
:host(:active) {
    background-color: var(--btn-active);
}

:host(:focus-visible) {
    outline: 2px solid var(--focus-color);
}

/* color */
:host([color="primary"]) {
    --btn-accent: var(--button-primary, var(--primary));
}

:host([color="secondary"]) {
    --btn-accent: var(--button-secondary, var(--secondary));
}

:host([color="tertiary"]),
:host([color="tiertery"]) /* deprecated alias */ {
    --btn-accent: var(--button-tertiary, var(--tertiary));
}

:host([color="success"]) {
    --btn-accent: var(--button-success, var(--success));
}

:host([color="information"]) {
    --btn-accent: var(--button-information, var(--info));
}

:host([color="error"]) {
    --btn-accent: var(--button-error, var(--error));
}

:host([color="warning"]) {
    --btn-accent: var(--button-warning, var(--warning));
}

/* variant */
:host([variant="filled"]) {
    --btn-border: transparent;
}

:host([variant="filled"]:hover) {
    color: var(--btn-text);
}

@supports (color: contrast-color(red)) {
    :host([variant="filled"]:hover) {
        color: contrast-color(var(--btn-hover));
    }
}

:host([variant="filled"]:state(active)),
:host([variant="filled"]:active) {
    color: var(--btn-text);
}

@supports (color: contrast-color(red)) {
    :host([variant="filled"]:state(active)),
    :host([variant="filled"]:active) {
        color: contrast-color(var(--btn-active));
    }
}

/* outline + clear sit on the page background, so the accent is the text color */
:host([variant="outline"]),
:host([variant="clear"]) {
    --btn-background: transparent;
    --btn-hover: color-mix(in oklch, var(--btn-accent) 12%, transparent);
    --btn-active: color-mix(in oklch, var(--btn-accent) 24%, transparent);
    color: var(--btn-accent);
}

:host([variant="clear"]) {
    --btn-border: transparent;
}

/* color + variant */
:host([variant="filled"][color="primary"]) {
    --btn-hover: color-mix(in oklch, var(--btn-background), var(--shade-1) 15%);
    --btn-active: color-mix(in oklch, var(--btn-background), var(--shade-1) 30%);
}

/* size */
:host([size="small"]) {
    height: var(--space-6, 24px);
}

:host([size="medium"]) {
    height: var(--space-8, 32px);
}

:host([size="large"]) {
    height: var(--space-10, 40px);
}

:host([size="icon"]) {
    width: var(--space-6, 24px);
    height: var(--space-6, 24px);
    aspect-ratio: 1;
    padding-inline: 0;
}

:host([disabled]) {
    cursor: not-allowed;
    outline: none;
}`);var v=h;var e=class extends m{constructor(){super(...arguments);this.variant="filled";this.size="medium";this.color="primary"}static{this.sheet=v}connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("click",this.handleclick,!0),this.addEventListener("keydown",this.handlekeydown),this.addEventListener("keyup",this.handlekeyup),this.addEventListener("focusout",this.handlefocusout)}handlekeydown(r){if(this.hasAttribute("disabled")||this.readonly)return;let t=b(r);t==="space"&&r.preventDefault(),(t==="space"||t==="enter"||t==="numpadenter")&&this._internals.states.add("active")}handlekeyup(r){if(this.hasAttribute("disabled")||this.readonly)return;let t=b(r);if(t==="space"||t==="enter"||t==="numpadenter"){if(!this._internals.states.has("active"))return;this._internals.states.delete("active"),this.click()}}handleclick(r){if(this.hasAttribute("disabled")||this.readonly){r.stopImmediatePropagation(),r.preventDefault();return}if(this.href)window.location.href=this.href;else{let t=this._internals.form??this.closest("form");if(!t)return;this.type==="submit"?t.requestSubmit():this.type==="reset"&&t.reset()}}handlefocusout(){this._internals.states.delete("active")}render(){return"<slot></slot>"}};o([s],e.prototype,"href",2),o([s],e.prototype,"variant",2),o([s],e.prototype,"size",2),o([s],e.prototype,"color",2),o([s],e.prototype,"type",2),o([s({type:Boolean})],e.prototype,"readonly",2),o([c],e.prototype,"handlekeydown",1),o([c],e.prototype,"handlekeyup",1),o([c],e.prototype,"handleclick",1),o([c],e.prototype,"handlefocusout",1);function b(a){return a.key===" "||a.code==="Space"?"space":(a.key||a.code).toLowerCase()}if(!window.customElements)throw new Error("Custom Elements not supported");window.customElements.get("pap-button")||window.customElements.define("pap-button",e);export{e as Button};
