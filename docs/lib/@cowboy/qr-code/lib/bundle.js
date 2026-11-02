var K=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var d=(e,t,n,r)=>{for(var s=r>1?void 0:r?P(t,n):t,o=e.length-1,l;o>=0;o--)(l=e[o])&&(s=(r?l(t,n,s):l(s))||s);return r&&s&&K(t,n,s),s};import{CustomElement as ae,html as $,property as q,query as ce}from"@papit/web-component";import{translate as ue,useTranslator as ie}from"@papit/translator";var g=new CSSStyleSheet;g.replaceSync(`:host {
    display: block;
    inline-size: min(100%, 20rem);
}

/* always black on white, in dark mode too: scanners don't all read an inverted code */
.code {
    background: white;
    color: black;
    border-radius: var(--radius-small, 0.25rem);
}

.code:empty {
    display: none;
}

.code svg {
    display: block;
    inline-size: 100%;
    block-size: auto;
}

.code path {
    fill: currentColor;
}

.error {
    margin: 0;
    color: var(--error);
}
`);var A=g;var L=[0,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],O=[0,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],B=40,U=0,D=1335,H=21522,Y=7973,Q=285,p=new Uint8Array(512),E=new Uint8Array(256);for(let e=0,t=1;e<255;e++)p[e]=p[e+255]=t,E[t]=e,t<<=1,t&256&&(t^=Q);var _=(e,t)=>e&&t?p[E[e]+E[t]]:0;function X(e){let t=[1];for(let n=0;n<e;n++){let r=new Array(t.length+1).fill(0);t.forEach((s,o)=>{r[o]^=s,r[o+1]^=_(s,p[n])}),t=r}return t.slice(1)}function Z(e,t){let n=new Array(t.length).fill(0);for(let r of e){let s=r^n.shift();n.push(0),t.forEach((o,l)=>{n[l]^=_(o,s)})}return n}function j(e){let t=(16*e+128)*e+64;if(e>=2){let n=Math.floor(e/7)+2;t-=(25*n-10)*n-55,e>=7&&(t-=36)}return t}var C=e=>Math.floor(j(e)/8),G=e=>C(e)-L[e]*O[e],v=e=>e*4+17,T=e=>e<10?8:16;function J(e){if(e===1)return[];let t=Math.floor(e/7)+2,n=Math.floor((e*8+t*3+5)/(t*4-4))*2,r=[6];for(let s=t-2,o=v(e)-7;s>=0;s--,o-=n)r.splice(1,0,o);return r}function W(e){for(let t=1;t<=B;t++)if(4+T(t)+e*8<=G(t)*8)return t;return null}function ee(e,t){let n=[],r=(l,a)=>{for(let c=a-1;c>=0;c--)n.push(l>>>c&1)};r(4,4),r(e.length,T(t));for(let l of e)r(l,8);let s=G(t)*8;r(0,Math.min(4,s-n.length)),r(0,-n.length&7);let o=[];for(let l=0;l<n.length;l+=8)o.push(n.slice(l,l+8).reduce((a,c)=>a<<1|c,0));for(let l=236;o.length<s/8;l^=253)o.push(l);return o}function te(e,t){let n=O[t],r=L[t],s=C(t),o=n-s%n,l=Math.floor(s/n)-r,a=X(r),c=[],h=[];for(let u=0,m=0;u<n;u++){let S=l+(u<o?0:1),z=e.slice(m,m+S);m+=S,c.push(z),h.push(Z(z,a))}let f=[];for(let u=0;u<=l;u++)for(let m of c)u<m.length&&f.push(m[u]);for(let u=0;u<r;u++)for(let m of h)f.push(m[u]);return f}var k=class{constructor(t){this.size=t;this.modules=new Array(t*t).fill(!1),this.fixed=new Array(t*t).fill(!1)}get(t,n){return this.modules[n*this.size+t]}isFixed(t,n){return this.fixed[n*this.size+t]}set(t,n,r){this.modules[n*this.size+t]=r}mark(t,n,r){t<0||n<0||t>=this.size||n>=this.size||(this.set(t,n,r),this.fixed[n*this.size+t]=!0)}},i=(e,t)=>(e>>>t&1)!==0;function R(e,t,n){let r=e;for(let s=0;s<n;s++)r=r<<1^(r>>>n-1)*t;return r}function M(e,t,n){for(let r=-4;r<=4;r++)for(let s=-4;s<=4;s++){let o=Math.max(Math.abs(s),Math.abs(r));e.mark(t+s,n+r,o!==2&&o!==4)}}function y(e,t){let n=U<<3|t,r=(n<<10|R(n,D,10))^H,s=e.size;for(let o=0;o<=5;o++)e.mark(8,o,i(r,o));e.mark(8,7,i(r,6)),e.mark(8,8,i(r,7)),e.mark(7,8,i(r,8));for(let o=9;o<15;o++)e.mark(14-o,8,i(r,o));for(let o=0;o<8;o++)e.mark(s-1-o,8,i(r,o));for(let o=8;o<15;o++)e.mark(8,s-15+o,i(r,o));e.mark(8,s-8,!0)}function ne(e,t){if(t<7)return;let n=t<<12|R(t,Y,12);for(let r=0;r<18;r++){let s=e.size-11+r%3,o=Math.floor(r/3);e.mark(s,o,i(n,r)),e.mark(o,s,i(n,r))}}function re(e,t){let n=e.size;for(let o=0;o<n;o++)e.mark(6,o,o%2===0),e.mark(o,6,o%2===0);M(e,3,3),M(e,n-4,3),M(e,3,n-4);let r=J(t),s=r.length-1;r.forEach((o,l)=>r.forEach((a,c)=>{if(!(l===0&&c===0||l===0&&c===s||l===s&&c===0))for(let f=-2;f<=2;f++)for(let u=-2;u<=2;u++)e.mark(a+u,o+f,Math.max(Math.abs(u),Math.abs(f))!==1)})),y(e,0),ne(e,t)}function oe(e,t){let n=e.size,r=0;for(let s=n-1;s>=1;s-=2){s===6&&(s=5);for(let o=0;o<n;o++)for(let l=0;l<2;l++){let a=s-l,h=(s+1&2)===0?n-1-o:o;e.isFixed(a,h)||r>=t.length*8||(e.set(a,h,i(t[r>>>3],7-(r&7))),r++)}}}var V=[(e,t)=>(e+t)%2===0,(e,t)=>t%2===0,e=>e%3===0,(e,t)=>(e+t)%3===0,(e,t)=>(Math.floor(e/3)+Math.floor(t/2))%2===0,(e,t)=>e*t%2+e*t%3===0,(e,t)=>(e*t%2+e*t%3)%2===0,(e,t)=>((e+t)%2+e*t%3)%2===0];function x(e,t){for(let n=0;n<e.size;n++)for(let r=0;r<e.size;r++)!e.isFixed(r,n)&&V[t](r,n)&&e.set(r,n,!e.get(r,n))}var se=[[!0,!1,!0,!0,!0,!1,!0,!1,!1,!1,!1],[!1,!1,!1,!1,!0,!1,!0,!0,!0,!1,!0]];function F(e){let t=0,n=0;return e.forEach((r,s)=>{n=s>0&&r===e[s-1]?n+1:1,n===5?t+=3:n>5&&(t+=1),se.some(o=>o.every((l,a)=>e[s+a]===l))&&(t+=40)}),t}function le(e){let t=e.size,n=0,r=0;for(let o=0;o<t;o++){let l=[],a=[];for(let c=0;c<t;c++)l.push(e.get(c,o)),a.push(e.get(o,c));n+=F(l)+F(a)}for(let o=0;o<t;o++)for(let l=0;l<t;l++){if(e.get(l,o)&&r++,l===t-1||o===t-1)continue;let a=e.get(l,o);a===e.get(l+1,o)&&a===e.get(l,o+1)&&a===e.get(l+1,o+1)&&(n+=3)}let s=r*100/(t*t);return n+Math.floor(Math.abs(s-50)/5)*10}function N(e){let t=new TextEncoder().encode(e),n=W(t.length);if(n===null)return null;let r=new k(v(n));re(r,n),oe(r,te(ee(t,n),n));let s=0,o=1/0;for(let l=0;l<V.length;l++){x(r,l),y(r,l);let a=le(r);a<o&&(o=a,s=l),x(r,l)}return x(r,s),y(r,s),{size:r.size,modules:r.modules}}var w=4,I="http://www.w3.org/2000/svg",b=class extends ae{constructor(){super(...arguments);this.t=ie("cw-qr-code");this.value="";this.label="";this.drawn=null;this.fits=!0}static{this.sheet=A}update(){let n=this.value===this.drawn?void 0:N(this.value);n!==void 0&&(this.fits=n!==null),super.update();let r=this.code??this.shadowRoot?.querySelector("[part='code']");n===void 0||!r||(this.drawn=this.value,r.replaceChildren(...n&&this.value?[this.draw(n.size,n.modules)]:[]))}draw(n,r){let s=document.createElementNS(I,"svg");s.setAttribute("viewBox",`0 0 ${n+w*2} ${n+w*2}`),s.setAttribute("shape-rendering","crispEdges");let o="";r.forEach((a,c)=>{a&&(o+=`M${c%n+w} ${Math.floor(c/n)+w}h1v1h-1z`)});let l=document.createElementNS(I,"path");return l.setAttribute("d",o),s.append(l),s}render(){return $`
            <div part="code" class="code" role="img" aria-label="${this.label||this.t("label")}"></div>
            ${this.fits?"":$`<p part="error" class="error" role="alert">${this.t("too-long")}</p>`}
        `}};d([ue],b.prototype,"t",2),d([q({type:String,rerender:!0})],b.prototype,"value",2),d([q({type:String,rerender:!0})],b.prototype,"label",2),d([ce("[part='code']")],b.prototype,"code",2);if(!window.customElements)throw new Error("Custom Elements not supported");window.customElements.get("cw-qr-code")||window.customElements.define("cw-qr-code",b);export{b as QrCode,N as encodeQr};
