var w=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var a=(p,u,e,i)=>{for(var t=i>1?void 0:i?v(u,e):u,s=p.length-1,n;s>=0;s--)(n=p[s])&&(t=(i?n(u,e,t):n(t))||t);return i&&t&&w(u,e,t),t};import{bind as d,html as m,property as l,query as x}from"@papit/web-component";import{Field as y}from"@papit/field";import"@papit/icon";var g=new CSSStyleSheet;g.replaceSync(`:host {
    display: inline-block;
    color: var(--text);

    div[part="wrapper"] {
        padding: var(--space-1, 4px);
        background-color: var(--shade-1, light-dark(oklch(96% 0 0), oklch(17% 0 0)));
        border: 1px solid var(--background-dark, light-dark(oklch(90% 0 0), oklch(12% 0 0)));
        border-radius: 4px;
        display: flex;
        gap: var(--space-1, 4px);

        input {
            all: unset;
            flex: 1;
            background: none;
        }

        button {
            /* opacity: 0.5; */
            border-radius: 50%;

            border: none;
            background: none;
            padding-inline: 0;
            padding-block: 0;
            width: var(--space-4, 16px);
            height: var(--space-4, 16px);
            margin-block: auto;
            display: inline;

            cursor: pointer;

            pap-icon {
                width: 100%;
                height: 100%;
            }

            &[part="clear"] {
                width: 14px;
                height: 14px;
            }
        }
    }
}

:host(:focus-within) {
    div[part="wrapper"] {

        border-color: var(--focus-color, AccentColor);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--focus-color, AccentColor), 75% transparent);
    }
}`);var b=g;var r=class extends y{constructor(){super({delegatesFocus:!0});this.formatCount=0;this.type="text";this._cachedValue=void 0;this.value=null;this.autocomplete="on";this.clear=!1;this.required=!1}static{this.sheet=b}formAssociatedCallback(e){super.formAssociatedCallback(e),e?.addEventListener("reset",this.handleFormReset)}handleFormReset(){this.defaultValue?this.value=this.defaultValue:this.value="",this.syncValidity()}handleInput(e){let i=this.inputElement;if(!this.format||!["text","number","password"].includes(this.type)){this.setValue(i.value),this.clear&&this.requestUpdate();return}let t=i.selectionStart??i.value.length,s=e.inputType.startsWith("insert")&&e.data?.length===1?t-1:void 0,n=this.getRaw(i.value.slice(0,t),s).length,c=this.getRaw(i.value,s).slice(0,this.formatCount),o=this.getFormat(c);this.value=o;let h=0,f=0;for(;f<n&&h<o.length;)/x/i.test(this.format[h])&&f++,h++;requestAnimationFrame(()=>i.setSelectionRange(h,h)),this.clear&&this.requestUpdate()}handleKeydown(e){e.key!=="Enter"||e.isComposing||this._internals.form?.requestSubmit()}handleClear(){this.inputElement.value="",this.dispatchEvent(new Event("change")),this.requestUpdate()}handleEye(){this.type==="password"?this.type="text":this.type="password"}render(){let e=this.type!=="password";return m`
            <div part="wrapper">
                <slot name="prefix"></slot>
                <input 
                    minlength="${this.minlength??""}"
                    maxlength="${this.maxlength??""}"
                    min="${this.min??""}"
                    max="${this.max??""}"
                    placeholder="${this.placeholder??""}"
                    accept="${this.accept??""}"
                    pattern="${this.pattern??""}"
                    type="${this.type}"
                    name="${this.name??""}"
                    part="input"
                    @input="${this.handleInput}"
                    @keydown="${this.handleKeydown}"
                    autocomplete="${this.autocomplete==="off"?"new-password":this.autocomplete}"
                    ${this.disabled?"disabled":""}
                    ${this.required?"required":""}
                />
                <slot name="sufix"></slot>

                ${this.originalType==="password"&&m`
                    <button 
                        part="eye" 
                        aria-label="${this.label("aria.password","Show password")}" 
                        aria-pressed="${e?"true":"false"}" 
                        @click="${this.handleEye}"
                    >
                        <pap-icon name="${e?"eye-closed":"eye"}"></pap-icon>    
                    </button>
                `}

                ${this.clear&&String(this.value??"").length>0&&m`
                    <button part="clear" aria-label="${this.label("aria.clear","Clear")}" @click="${this.handleClear}">
                        <pap-icon name="clear-filled"></pap-icon>
                    </button>
                `}
            </div>
            ${this.renderStates()}
        `}label(e,i){let t=this.t(e);return t===e?i:t}getFormat(e){if(!e)return"";let i=this.getRaw(e);if(!this.format)return i;let t="",s=0;for(let n=0;n<this.format.length&&s<i.length;n++)t+=/x/i.test(this.format[n])?i[s++]:this.format[n];return t}getRaw(e,i){if(!this.format)return e;let t="",s=0;for(let n=0;n<e.length;n++){let c=e[n],o=this.format[s];if(!(n===i)&&s<this.format.length&&!/x/i.test(o)&&o===c){s++;continue}t+=c,s<this.format.length&&/x/i.test(o)&&s++}return t}setValue(e){this.value=e}};a([l({rerender:!0,after(e,i,t){t&&(this.originalType=e)}})],r.prototype,"type",2),a([l({after(){this.formatCount=this.format?.split(/x/i)?.length??0,this.maxlength=this.format?.length}})],r.prototype,"format",2),a([l({reflect:!1,after(e){this.dispatchEvent(new Event("change")),this._internals.setFormValue(e?this.getRaw(e):null),this.inputElement&&(this.inputElement.value=e??""),this._cachedValue=void 0},get(e){if(this._cachedValue!==void 0)return this._cachedValue;if(!e)return this._cachedValue=null,null;if(this.type==="number"){let t=this.inputElement.valueAsNumber;return this._cachedValue=t,t}if(["date","datetime"].includes(this.type)){let t=this.inputElement.valueAsDate;return this._cachedValue=t,t}let i=this.getRaw(e);return this._cachedValue=i,i}})],r.prototype,"value",2),a([l({attribute:"defaultvalue",after(e,i,t){(t||!this.value)&&(this.value=e),this.inputElement&&(this.inputElement.defaultValue=e)}})],r.prototype,"defaultValue",2),a([l({type:Number,rerender:!0,reflect:!1})],r.prototype,"maxlength",2),a([l({type:Number,rerender:!0,reflect:!1})],r.prototype,"minlength",2),a([l({type:Number,rerender:!0,reflect:!1})],r.prototype,"min",2),a([l({type:Number,rerender:!0,reflect:!1})],r.prototype,"max",2),a([l({rerender:!0,reflect:!1})],r.prototype,"pattern",2),a([l({rerender:!0,reflect:!1})],r.prototype,"accept",2),a([l({rerender:!0,reflect:!1})],r.prototype,"placeholder",2),a([l({rerender:!0,reflect:!1})],r.prototype,"autocomplete",2),a([l({rerender:!0})],r.prototype,"name",2),a([l({type:Boolean,rerender:!0,reflect:!1})],r.prototype,"clear",2),a([l({type:Boolean,rerender:!0,reflect:!1})],r.prototype,"required",2),a([x({selector:"input",load(e){this.target=e,this.value&&(this.target.value=this.getFormat(String(this.value))),this.defaultValue&&(this.target.defaultValue=this.defaultValue)}})],r.prototype,"inputElement",2),a([d],r.prototype,"handleFormReset",1),a([d],r.prototype,"handleInput",1),a([d],r.prototype,"handleKeydown",1),a([d],r.prototype,"handleClear",1),a([d],r.prototype,"handleEye",1);if(!window.customElements)throw new Error("Custom Elements not supported");window.customElements.get("pap-input")||window.customElements.define("pap-input",r);export{r as Input};
