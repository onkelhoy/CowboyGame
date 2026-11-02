var d=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var i=(n,r,s,o)=>{for(var t=o>1?void 0:o?m(r,s):r,a=n.length-1,l;a>=0;a--)(l=n[a])&&(t=(o?l(r,s,t):l(t))||t);return o&&t&&d(r,s,t),t};import{bind as u,CustomElement as f,html as w,property as c}from"@papit/web-component";import{translate as y,useTranslator as b}from"@papit/translator";import"@papit/button";var p=new CSSStyleSheet;p.replaceSync(`:host {
    display: inline-block;
}

:host([hidden]) {
    display: none;
}
`);var h=p;var g=2e3,e=class extends f{constructor(){super(...arguments);this.t=b("cw-share-link");this.link="";this.compact=!1;this.copied=!1}static{this.sheet=h}get sheetted(){return typeof navigator.share=="function"&&window.matchMedia("(pointer: coarse)").matches}async handleClick(){if(this.sheetted){await navigator.share({url:this.link}).catch(()=>{});return}try{await navigator.clipboard.writeText(this.link)}catch{window.prompt(this.t("copy"),this.link);return}this.copied=!0,clearTimeout(this.timer),this.timer=setTimeout(()=>{this.copied=!1},g)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timer)}get label(){return this.copied?this.t("copied"):this.compact?this.t("compact"):this.t(this.sheetted?"share":"copy")}render(){return w`
            <pap-button size="small" variant="${this.compact?"clear":"outline"}" type="button" @click="${this.handleClick}">${this.label}</pap-button>
        `}};i([y],e.prototype,"t",2),i([c({type:String,rerender:!0})],e.prototype,"link",2),i([c({type:Boolean,reflect:!0,rerender:!0})],e.prototype,"compact",2),i([c({type:Boolean,attribute:!1,rerender:!0})],e.prototype,"copied",2),i([u],e.prototype,"handleClick",1);if(!window.customElements)throw new Error("Custom Elements not supported");window.customElements.get("cw-share-link")||window.customElements.define("cw-share-link",e);export{e as ShareLink};
