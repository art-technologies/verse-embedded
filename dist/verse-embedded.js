"use strict";(()=>{var l=()=>{let n=document.createElement("div");n.style.cssText=`
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
  `,document.head.appendChild(t),n.appendChild(e),n};var d=["allow-downloads","allow-forms","allow-modals","allow-orientation-lock","allow-pointer-lock","allow-popups","allow-popups-to-escape-sandbox","allow-presentation","allow-same-origin","allow-scripts","allow-storage-access-by-user-activation"],a=class{constructor(e={}){this.lastHeight=0;this.isFullScreenMode=!1;this.lastNormalHeight=0;if(!e.baseUrl)throw new Error("baseUrl is required");this.baseUrl=e.baseUrl,this.minHeight=e.minHeight||400,this.handleMessage=this.handleMessage.bind(this)}handleFullScreenMessage(e,t){this.isFullScreenMode=e;let i=document.querySelectorAll("iframe"),s=Array.from(i).find(r=>r.contentWindow===t.source);if(s){let r=s.parentElement;r&&(e?(this.lastNormalHeight=this.lastHeight,r.style.position="fixed",r.style.top="0",r.style.left="0",r.style.width="100vw",r.style.height="100vh",r.style.zIndex="9999",r.style.backgroundColor="white"):(r.style.position="relative",r.style.top="",r.style.left="",r.style.width="100%",r.style.height=`${this.lastNormalHeight}px`,r.style.zIndex="",r.style.backgroundColor=""))}}handleMessage(e){if(e.origin===new URL(this.baseUrl).origin)try{let t=e.data;if(t.type==="resize"){if(this.isFullScreenMode)return;let i=document.querySelectorAll("iframe"),s=Array.from(i).find(r=>r.contentWindow===e.source);if(s){let r=s.parentElement;if(r){let o=Math.max(t.bounds.height,this.minHeight);this.lastHeight!==o&&(this.lastHeight=o,this.lastNormalHeight=o,r.style.height=`${o}px`,s.style.height=`${o}px`)}}}else t.type==="fullScreenMode"&&typeof t.fullScreen=="boolean"&&this.handleFullScreenMessage(t.fullScreen,e)}catch(t){console.error("Error handling iframe message:",t)}}createIframe(e,t,i){let s=document.createElement("iframe");s.setAttribute("sandbox",d.join(" "));let r=t?`${this.baseUrl}/series/${t}?iframe=true&stylesPath=${i}`:`${this.baseUrl}/artworks/${e}?iframe=true&stylesPath=${i}`;return s.src=r,s.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
      scrolling: no;
    `,s.setAttribute("scrolling","no"),s}async loadCustomStyles(e){try{let t=await fetch(e);if(!t.ok)throw new Error(`Failed to load styles: ${t.status}`);return await t.text()}catch(t){return console.error("Error loading custom styles:",t),""}}async applyStyles(e){if(!this.iframe){console.error("No iframe found to apply styles to");return}this.iframe.contentWindow?.postMessage({type:"applyStyles",styles:e},new URL(this.baseUrl).origin)}async initializeContainer(e){let t=e.getAttribute("verse-artwork-id"),i=e.getAttribute("verse-series-slug");if(!t&&!i){console.error("Container missing required attributes: either verse-artwork-id or verse-series-slug must be provided");return}e.style.cssText=`
      position: relative;
      width: 100%;
      min-height: ${this.minHeight}px;
      overflow: hidden;
    `;let s=l();e.appendChild(s);let r=e.getAttribute("verse-custom-styles-path");this.iframe=this.createIframe(t||"",i||void 0,r||void 0),e.appendChild(this.iframe)}initialize(){window.addEventListener("message",this.handleMessage),[...Array.from(document.querySelectorAll("[verse-artwork-id]")),...Array.from(document.querySelectorAll("[verse-series-slug]"))].forEach(t=>this.initializeContainer(t))}forceRefreshMeasure(){this.iframe&&this.iframe.contentWindow?.postMessage({type:"forceRefreshMeasure"},new URL(this.baseUrl).origin)}};window.VerseEmbed=a;})();
//# sourceMappingURL=verse-embedded.js.map
