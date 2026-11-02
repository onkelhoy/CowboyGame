var u=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var r=(d,s,e,t)=>{for(var i=t>1?void 0:t?g(s,e):s,n=d.length-1,h;n>=0;n--)(h=d[n])&&(i=(t?h(s,e,i):h(i))||i);return t&&i&&u(s,e,i),i};import{bind as a,CustomElement as v,html as f,property as l,query as E}from"@papit/web-component";import"@papit/icon";var p=new CSSStyleSheet;p.replaceSync(`:host {
    dialog {
        padding-inline: var(--space-1, 0.25rem);
        padding-top: var(--space-1, 0.25rem);
        padding-bottom: var(--space-3, 0.75rem);
        border-radius: var(--space-2, 0.5rem);
        border: none;

        max-height: 90vh;

        &:open {
            display: grid;
            grid-template-rows: auto 1fr auto;
        }

        &::backdrop {
            background-color: color-mix(in oklab, var(--background-inverse, light-dark(oklch(17% 0 0), oklch(96% 0 0))), 95% transparent);
        }
    }

    header {
        display: flex;
        gap: var(--space-2, 0.5rem);
        padding-left: var(--space-2, 0.5rem);

        div {
            display: flex;
            flex: 1;
            align-items: center;
            padding-top: var(--space-1, 0.25rem);

            h1 {
                margin: 0;
            }
        }

        span {
            margin-left: auto;

            button {
                background: none;
                border: none;
                cursor: pointer;
                display: flex;
                padding: 0;
                padding: var(--space-2, 0.5rem);
                color: var(--foreground, light-dark(oklch(24% 0 0), oklch(86% 0 0)));

                pap-icon {
                    margin: auto;
                    color: inherit;
                    width: var(--space-3, 0.75rem);
                    height: var(--space-3, 0.75rem);
                }
            }
        }
    }

    main {
        padding-inline: var(--space-2, 0.5rem);
        overflow-y: auto;
    }

    footer {
        padding: var(--space-2, 0.5rem);
        padding-bottom: 0;
    }
}`);var m=p;var c='[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [data-focusable]';var o=class extends v{constructor(){super(...arguments);this.open=!1;this.closeoutsideclick=!1;this.ismodal=!0;this.refs=[];this._internalopen=!1;this.hasslotheader=!1;this.hasslotfooter=!1;this.pointerdownoutside=!1}static{this.sheet=m}connectedCallback(){super.connectedCallback();let e=this.getRootNode();this.refs=[],(e instanceof ShadowRoot||e instanceof Document)&&(e.querySelectorAll(`[commandfor="${this.id}"]`).forEach(t=>{t.addEventListener("click",this.handleCommandRefClick),t.hasAttribute("tabindex")||t.setAttribute("tabindex","0"),this.refs.push(t)}),e.querySelectorAll(`[popovertarget="${this.id}"]`).forEach(t=>{t.addEventListener("click",this.handlePopoverRefClick),this.refs.push(t)}))}disconnectedCallback(){super.disconnectedCallback(),this.refs.forEach(e=>{e.removeEventListener("click",this.handleCommandRefClick),e.removeEventListener("click",this.handlePopoverRefClick)})}show(){this._internalopen=!0,this.open=!0,this.dialogElement.show(),this.ismodal=!1}showModal(){this._internalopen=!0,this.open=!0,this.dialogElement.showModal(),this.ismodal=!0}showPopover(){this._internalopen=!0,this.open=!0,this.dialogElement.showPopover()}close(){this._internalopen=!0,this.open=!1,this.dialogElement.close()}toggle(){this.open?this.close():this.ismodal?this.showModal():this.show()}syncdialog(e){e?.isConnected&&(this.open?e.open||(this.ismodal?e.showModal():e.show()):e.open&&e.close())}handleCommandRefClick(e){let{currentTarget:t}=e;if(!(t instanceof HTMLElement))return;let i=t.getAttribute("command");i==="show-modal"?this.showModal():i==="show"?this.show():i==="toggle"?this.toggle():i==="close"&&this.close()}handlePopoverRefClick(){this.showPopover()}handleheaderslot(e){e.currentTarget instanceof HTMLSlotElement&&(e.currentTarget.assignedNodes().length>0&&(this.hasslotheader=!0),this.requestUpdate())}handlefooterslot(e){e.currentTarget instanceof HTMLSlotElement&&(e.currentTarget.assignedNodes().length>0&&(this.hasslotfooter=!0),this.requestUpdate())}handledialogpointerdown(e){let t=this.dialogElement.getBoundingClientRect();this.pointerdownoutside=e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom}handledialogclick(e){let t=this.pointerdownoutside;this.pointerdownoutside=!1,this.closeoutsideclick&&this.open&&e.target===this.dialogElement&&t&&this.close()}handledialogclose(){this.open&&(this.dialogElement.open||(this._internalopen=!0,this.open=!1))}render(){return f`
            <dialog 
                id="dialog" 
                part="dialog"
                aria-labelledby="title"
                @pointerdown="${this.handledialogpointerdown}"
                @click="${this.handledialogclick}"
                @close="${this.handledialogclose}"
            >
                <header part="header">
                    <div id="title">
                        <slot @slotchange="${this.handleheaderslot}" name="header"></slot>
                        ${!this.hasslotheader&&this.header&&f`<h1>${this.header}</h1>`}
                    </div>
                    <span>
                        <button aria-label="close" autofocus commandfor="dialog" command="close">
                            <pap-icon name="close"></pap-icon>
                        </button>
                    </span>
                </header>
                <main part="main">
                    <slot></slot>
                </main>
                <footer style="${!this.hasslotfooter&&"padding:0 !important;"}" part="footer">
                    <slot @slotchange="${this.handlefooterslot}" name="footer"></slot>
                </footer>
            </dialog>
        `}};r([E({selector:"dialog",load(e){e.setAttribute("aria-modal",String(this.ismodal)),this.syncdialog(e)}})],o.prototype,"dialogElement",2),r([l({rerender:!0})],o.prototype,"header",2),r([l({type:Boolean,after(e,t,i){if(i||this.dispatchEvent(new Event(this.open?"open":"close")),this.open){let n=this.root.querySelector(c);n||(n=this.querySelector(c)),n&&requestAnimationFrame(()=>requestAnimationFrame(()=>n.focus()))}if(this._internalopen){this._internalopen=!1;return}this.syncdialog(this.dialogElement)}})],o.prototype,"open",2),r([l({type:Boolean,attribute:"close-outside-click"})],o.prototype,"closeoutsideclick",2),r([l({attribute:"modal",type:Boolean,after(){this.dialogElement&&this.dialogElement.setAttribute("aria-modal",String(this.ismodal))}})],o.prototype,"ismodal",2),r([a],o.prototype,"handleCommandRefClick",1),r([a],o.prototype,"handlePopoverRefClick",1),r([a],o.prototype,"handleheaderslot",1),r([a],o.prototype,"handlefooterslot",1),r([a],o.prototype,"handledialogpointerdown",1),r([a],o.prototype,"handledialogclick",1),r([a],o.prototype,"handledialogclose",1);if(!window.customElements)throw new Error("Custom Elements not supported");window.customElements.get("pap-dialog")||window.customElements.define("pap-dialog",o);export{o as Dialog,c as FOCUSABLE};
