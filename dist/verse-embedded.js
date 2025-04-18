"use strict";(()=>{var l=()=>{let o=document.createElement("div");o.style.cssText=`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
  `;let t=document.createElement("div");t.style.cssText=`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;let e=document.createElement("style");return e.textContent=`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,document.head.appendChild(e),o.appendChild(t),o};var a=class{constructor(t={}){this.lastHeight=0;this.isFullScreenMode=!1;this.lastNormalHeight=0;this.baseUrl=t.baseUrl||"https://verse-webapp-git-feat-verse-embedded-poc-at-verse.vercel.app/artworks",this.minHeight=t.minHeight||400,this.handleMessage=this.handleMessage.bind(this)}handleFullScreenMessage(t,e){console.log("Received full screen message:",t),this.isFullScreenMode=t;let n=document.querySelectorAll("iframe"),i=Array.from(n).find(s=>s.contentWindow===e.source);if(i){let s=i.parentElement;s&&(t?(this.lastNormalHeight=this.lastHeight,s.style.position="fixed",s.style.top="0",s.style.left="0",s.style.width="100vw",s.style.height="100vh",s.style.zIndex="9999",s.style.backgroundColor="white"):(s.style.position="relative",s.style.top="",s.style.left="",s.style.width="100%",s.style.height=`${this.lastNormalHeight}px`,s.style.zIndex="",s.style.backgroundColor=""))}}handleMessage(t){if(t.origin===new URL(this.baseUrl).origin)try{let e=t.data;if(e.type==="resize"){if(this.isFullScreenMode)return;let n=document.querySelectorAll("iframe"),i=Array.from(n).find(s=>s.contentWindow===t.source);if(i){let s=i.parentElement;if(s){console.log("Received resize message:",e);let r=Math.max(e.bounds.height,this.minHeight);this.lastHeight!==r&&(console.log("Updating iframe height to:",r),this.lastHeight=r,this.lastNormalHeight=r,s.style.height=`${r}px`,i.style.height=`${r}px`)}}}else e.type==="fullScreenMode"&&typeof e.fullScreen=="boolean"&&this.handleFullScreenMessage(e.fullScreen,t)}catch(e){console.error("Error handling iframe message:",e)}}createIframe(t){let e=document.createElement("iframe");return e.src=`${this.baseUrl}/${t}?iframe=true`,e.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
      scrolling: no;
    `,e.setAttribute("scrolling","no"),e}async loadCustomStyles(t){try{let e=await fetch(t);if(!e.ok)throw new Error(`Failed to load styles: ${e.status}`);return await e.text()}catch(e){return console.error("Error loading custom styles:",e),""}}async initializeContainer(t){let e=t.getAttribute("verse-artwork-id");if(!e){console.error("Container missing verse-artwork-id attribute");return}t.style.cssText=`
      position: relative;
      width: 100%;
      min-height: ${this.minHeight}px;
      overflow: hidden;
    `;let n=l();t.appendChild(n);let i=this.createIframe(e),s=t.getAttribute("verse-custom-styles-path"),r="";s&&(r=await this.loadCustomStyles(s)),t.appendChild(i),await new Promise(d=>{i.onload=()=>{r&&i.contentWindow?.postMessage({type:"applyStyles",styles:r},new URL(this.baseUrl).origin),t.removeChild(n),d()}})}initialize(){window.addEventListener("message",this.handleMessage),document.querySelectorAll("[verse-artwork-id]").forEach(e=>this.initializeContainer(e))}},c=new a;c.initialize();})();
//# sourceMappingURL=verse-embedded.js.map
