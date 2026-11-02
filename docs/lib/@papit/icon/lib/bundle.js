var x=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(f,a,t,e)=>{for(var r=e>1?void 0:e?v(a,t):a,i=f.length-1,n;i>=0;i--)(n=f[i])&&(r=(e?n(a,t,r):n(r))||r);return e&&r&&x(a,t,r),r};import{CustomElement as E,html as S,property as l,unsafeHTML as C}from"@papit/web-component";var u=new CSSStyleSheet;u.replaceSync(`:host {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    width: var(--space-6, 24px);
    height: var(--space-6, 24px);

    font-size: 1.5rem;
    color: var(--text);

    svg {
        fill: currentColor;
        width: inherit;
        height: inherit;
    }
}`);var w=u;var y={A:"\u{1F1E6}",B:"\u{1F1E7}",C:"\u{1F1E8}",D:"\u{1F1E9}",E:"\u{1F1EA}",F:"\u{1F1EB}",G:"\u{1F1EC}",H:"\u{1F1ED}",I:"\u{1F1EE}",J:"\u{1F1EF}",K:"\u{1F1F0}",L:"\u{1F1F1}",M:"\u{1F1F2}",N:"\u{1F1F3}",O:"\u{1F1F4}",P:"\u{1F1F5}",Q:"\u{1F1F6}",R:"\u{1F1F7}",S:"\u{1F1F8}",T:"\u{1F1F9}",U:"\u{1F1FA}",V:"\u{1F1FB}",W:"\u{1F1FC}",X:"\u{1F1FD}",Y:"\u{1F1FE}",Z:"\u{1F1FF}"};var s=class s extends E{constructor(){super(...arguments);this.viewBox="0 0 24 24";this.cache=!1;this.storage="papit-icon"}static{this.sheet=w}static{this.icons=new Map}static{this.parser=new DOMParser}static{this.pending=new Map}static async fetchSvg(t){try{let e=await fetch(t);if(!/svg/i.test(e.headers.get("Content-Type")??""))throw"fetched response is not svg";return await e.text()}catch(e){return console.error("[icon] error could not fetch url",t),console.error(e),null}}isUrl(t){return/^(http|\.?\/)/.test(t)}getName(t){let e=t;if(!e)return"";let r=t.match(/#(?<name>\w+(?:-\w+)*)/);if(r?.groups)return r.groups.name;if(this.isUrl(e)){let i=e.split("/").pop()?.split(".")?.at(0);return i||"missing-name"}return e}store(t,e){let r=t.id;if(r)e=r;else{let i=t.querySelector("title");i?.textContent&&(e=i.textContent)}t.setAttribute("part","svg"),t.setAttribute("xmlns","http://www.w3.org/2000/svg"),s.icons.set(e,t.outerHTML.replace(/^\<symbol/,"<svg").replace(/symbol\>$/,"svg>"))}render(){let t=!this.flag&&this.assignedName&&s.icons.get(this.assignedName);return S`
            <slot part="fallback"></slot>
            ${this.flag&&S`<span part="flag">${this.flag}</span>`}
            
            ${t&&C(t)}
        `}};c([l({type:Boolean})],s.prototype,"cache",2),c([l],s.prototype,"storage",2),c([l({rerender:!0,async after(t){if(!t){this.assignedName=void 0;return}let e=this.getName(t);if(s.icons.has(e)){this.assignedName=e;return}if(this.isUrl(t)||(t.startsWith("/")||(t="/"+t),t.endsWith(".svg")||(t+=".svg")),!this.isUrl(t)){console.log("[icon] not found in static icons and not URL, this icon can not exist");return}let r=t.split("#")?.at(0)??t,i=this.name,n=this.cache&&window.localStorage.getItem(this.storage+r);if(!n){let o=s.pending.get(r);o||(o=s.fetchSvg(r),s.pending.set(r,o)),n=await o,n?this.cache&&window.localStorage.setItem(this.storage+r,n):s.pending.delete(r)}if(this.name!==i)return;if(s.icons.has(e)){this.assignedName=e,this.requestUpdate();return}if(!n){console.error("[icon] no data found",t);return}let m=s.parser.parseFromString(n,"image/svg+xml"),d=m.querySelector("parsererror");if(d){console.error("[icon] parse error:",d.textContent);return}let g=m.querySelector("svg");if(!g){console.error("[icon] parsed data did not yield SVG element");return}let h=g.querySelectorAll("symbol");if(h.length>0)for(let o=0;o<h.length;o++)this.store(h[o],e+(o===0?"":o));else this.store(g,e);s.icons.has(e)&&(this.assignedName=e,this.requestUpdate())}})],s.prototype,"name",2),c([l({rerender:!0,set(t){let e="";for(let r of t.toUpperCase())e+=y[r];return e}})],s.prototype,"flag",2);var p=s;if(!window.customElements)throw new Error("Custom Elements not supported");window.customElements.get("pap-icon")||window.customElements.define("pap-icon",p);export{y as CountryEmojiSet,p as Icon};
