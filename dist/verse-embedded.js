"use strict";(()=>{var d=()=>{let s=document.createElement("div");s.style.cssText=`
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
  `,document.head.appendChild(e),s.appendChild(t),s};var o=class{constructor(t={}){this.lastHeight=0;this.baseUrl=t.baseUrl||"https://verse-webapp-git-feat-verse-embedded-poc-at-verse.vercel.app/artworks",this.minHeight=t.minHeight||400,this.handleMessage=this.handleMessage.bind(this)}handleMessage(t){if(t.origin===new URL(this.baseUrl).origin)try{let e=t.data;if(e.type==="resize"&&typeof e.height=="number"){console.log("Received height update:",e.height);let n=document.querySelectorAll("iframe"),i=Array.from(n).find(a=>a.contentWindow===t.source);if(i){let a=i.parentElement;if(a){let r=Math.max(e.height,this.minHeight);this.lastHeight!==r&&(console.log("Updating iframe height to:",r),this.lastHeight=r,a.style.height=`${r}px`,i.style.height=`${r}px`)}}}}catch(e){console.error("Error handling iframe message:",e)}}createIframe(t){let e=document.createElement("iframe");return e.src=`${this.baseUrl}/${t}`,e.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
      scrolling: no;
    `,e.setAttribute("scrolling","no"),e}initializeContainer(t){let e=t.getAttribute("verse-artwork-id");if(!e){console.error("Container missing verse-artwork-id attribute");return}t.style.cssText=`
      position: relative;
      width: 100%;
      min-height: ${this.minHeight}px;
      overflow: hidden;
    `;let n=d();t.appendChild(n);let i=this.createIframe(e);i.onload=()=>{t.removeChild(n)},t.appendChild(i)}initialize(){window.addEventListener("message",this.handleMessage),document.querySelectorAll("[verse-artwork-id]").forEach(e=>this.initializeContainer(e))}},l=new o;l.initialize();})();
//# sourceMappingURL=verse-embedded.js.map
