"use strict";(()=>{var l=()=>{let a=document.createElement("div");a.style.cssText=`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
  `;let e=document.createElement("div");e.style.cssText=`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;let t=document.createElement("style");return t.textContent=`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,document.head.appendChild(t),a.appendChild(e),a};var h=["allow-downloads","allow-forms","allow-modals","allow-orientation-lock","allow-pointer-lock","allow-popups","allow-popups-to-escape-sandbox","allow-presentation","allow-same-origin","allow-scripts","allow-storage-access-by-user-activation"],n=class{constructor(e={}){this.lastHeight=0;this.isFullScreenMode=!1;this.lastNormalHeight=0;if(!e.baseUrl)throw new Error("baseUrl is required");this.baseUrl=e.baseUrl,this.minHeight=e.minHeight||400,this.handleMessage=this.handleMessage.bind(this)}handleFullScreenMessage(e,t){this.isFullScreenMode=e;let r=document.querySelectorAll("iframe"),i=Array.from(r).find(s=>s.contentWindow===t.source);if(i){let s=i.parentElement;s&&(e?(this.lastNormalHeight=this.lastHeight,s.style.position="fixed",s.style.top="0",s.style.left="0",s.style.width="100vw",s.style.height="100vh",s.style.zIndex="9999",s.style.backgroundColor="white"):(s.style.position="relative",s.style.top="",s.style.left="",s.style.width="100%",s.style.height=`${this.lastNormalHeight}px`,s.style.zIndex="",s.style.backgroundColor=""))}}handleMessage(e){if(e.origin===new URL(this.baseUrl).origin)try{let t=e.data;if(t.type==="resize"){if(this.isFullScreenMode)return;let r=document.querySelectorAll("iframe"),i=Array.from(r).find(s=>s.contentWindow===e.source);if(i){let s=i.parentElement;if(s){let o=Math.max(t.bounds.height,this.minHeight);this.lastHeight!==o&&(this.lastHeight=o,this.lastNormalHeight=o,s.style.height=`${o}px`,i.style.height=`${o}px`)}}}else t.type==="fullScreenMode"&&typeof t.fullScreen=="boolean"&&this.handleFullScreenMessage(t.fullScreen,e)}catch(t){console.error("Error handling iframe message:",t)}}createIframe(e,t){let r=document.createElement("iframe");r.setAttribute("sandbox",h.join(" "));let i=t?`${this.baseUrl}/series/${t}?iframe=true`:`${this.baseUrl}/artworks/${e}?iframe=true`;return r.src=i,r.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
      scrolling: no;
    `,r.setAttribute("scrolling","no"),r}async loadCustomStyles(e){try{let t=await fetch(e);if(!t.ok)throw new Error(`Failed to load styles: ${t.status}`);return await t.text()}catch(t){return console.error("Error loading custom styles:",t),""}}async applyStyles(e){if(!this.iframe){console.error("No iframe found to apply styles to");return}this.iframe.contentWindow?.postMessage({type:"applyStyles",styles:e},new URL(this.baseUrl).origin)}async initializeContainer(e){let t=e.getAttribute("verse-artwork-id"),r=e.getAttribute("verse-series-slug");if(!t&&!r){console.error("Container missing required attributes: either verse-artwork-id or verse-series-slug must be provided");return}e.style.cssText=`
      position: relative;
      width: 100%;
      min-height: ${this.minHeight}px;
      overflow: hidden;
    `;let i=l();e.appendChild(i),this.iframe=this.createIframe(t||"",r||void 0);let s=e.getAttribute("verse-custom-styles-path"),o="";s&&(o=await this.loadCustomStyles(s)),e.appendChild(this.iframe),await new Promise(d=>{this.iframe&&(this.iframe.onload=async()=>{o&&await this.applyStyles(o),e.removeChild(i),d()})})}initialize(){window.addEventListener("message",this.handleMessage),[...Array.from(document.querySelectorAll("[verse-artwork-id]")),...Array.from(document.querySelectorAll("[verse-series-slug]"))].forEach(t=>this.initializeContainer(t))}forceRefreshMeasure(){this.iframe&&this.iframe.contentWindow?.postMessage({type:"forceRefreshMeasure"},new URL(this.baseUrl).origin)}};window.VerseEmbed=n;})();
//# sourceMappingURL=verse-embedded.js.map
