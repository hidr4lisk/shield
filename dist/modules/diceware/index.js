var $="es",y={},v=null,u=[],w=[],d=5,L=["\u2680","\u2681","\u2682","\u2683","\u2684","\u2685"],S=Math.log2(7776);function s(e,t){return y[e]??t}function C(e){let t=65536-65536%e,a=new Uint16Array(1);do crypto.getRandomValues(a);while(a[0]>=t);return a[0]%e}function x(e){let t=[];for(let a=0;a<5;a++)t.unshift(e%6+1),e=Math.floor(e/6);return t}async function O(){if(v)return;let{WORDLIST:e}=await import("./wordlist-UGQCCCF4.js");v=e}function N(e,t){let a=[],n=[];for(let l=0;l<t;l++){let i=C(e.length);a.push(e[i]),n.push(x(i))}return{words:a,dice:n}}function h(e,t){let a=Math.pow(2,e)/t/2;if(a<60)return`< 1 ${s("m3_unit_min","min")}`;if(a<3600)return`${Math.round(a/60)} ${s("m3_unit_min","min")}`;if(a<86400)return`${Math.round(a/3600)} ${s("m3_unit_h","h")}`;if(a<31536e3)return`${Math.round(a/86400)} ${s("m3_unit_days","d\xEDas")}`;let n=a/31536e3;return n<1e3?`${Math.round(n)} ${s("m3_unit_years","a\xF1os")}`:n<1e6?`${(n/1e3).toFixed(1)}k ${s("m3_unit_years","a\xF1os")}`:n<1e9?`${(n/1e6).toFixed(1)}M ${s("m3_unit_years","a\xF1os")}`:`${(n/1e9).toFixed(1)}B ${s("m3_unit_years","a\xF1os")}`}function A(){return`
<div class="m3">

  <div class="m3-controls">
    <div class="m3-wordcount">
      <span class="m3-wc-label">${s("m3_wordcount_label","PALABRAS")}</span>
      <div class="m3-wc-pills" role="group" aria-label="${s("m3_wordcount_aria","N\xFAmero de palabras")}">
        ${[4,5,6,7].map(e=>`
        <button class="m3-wc-pill${e===d?" active":""}" data-count="${e}"
                aria-pressed="${e===d}">
          ${e}
        </button>`).join("")}
      </div>
    </div>
    <button class="cta-primary m3-generate" aria-describedby="m3-hint">
      <span class="m3-generate-label">${s("m3_generate_btn","GENERAR \u25B8")}</span>
    </button>
  </div>

  <p class="m3-hint" id="m3-hint">${s("m3_hint","Gener\xE1 tu primera passphrase segura usando el m\xE9todo Diceware.")}</p>

  <div class="m3-loading hidden" role="status" aria-live="polite">
    <span class="vt323 m3-loading-msg">${s("m3_generating","GENERANDO...")}</span>
    <span class="cursor">_</span>
  </div>

  <div class="m3-result hidden" aria-live="polite" aria-atomic="true">

    <div class="m3-words" id="m3-words" role="list"
         aria-label="${s("m3_words_aria","Palabras de la passphrase")}">
    </div>

    <div class="m3-phrase-wrap">
      <p class="m3-phrase" id="m3-phrase" aria-label="${s("m3_phrase_aria","Passphrase completa")}"></p>
    </div>

    <div class="m3-actions">
      <button class="cta-primary m3-copy" aria-live="polite">
        <span class="m3-copy-icon" aria-hidden="true">\u2398</span>
        <span class="m3-copy-label">${s("m3_copy_btn","COPIAR")}</span>
      </button>
      <button class="cta-secondary m3-regen">
        \u21BA ${s("m3_regen_btn","REGENERAR")}
      </button>
    </div>

    <div class="m3-stats">
      <div class="m3-entropy-row">
        <span class="m3-stat-k">${s("m3_entropy_label","ENTROP\xCDA")}</span>
        <span class="m3-stat-v m3-entropy-val"></span>
        <div class="m3-entropy-bar-track" aria-hidden="true">
          <div class="m3-entropy-bar-fill"></div>
        </div>
      </div>
      <div class="m3-scenarios">
        <p class="m3-sc-title">${s("m3_time_title","// TIEMPO ESTIMADO PARA ROMPERLA")}</p>
        <div class="m3-scenario">
          <span class="m3-sc-label">${s("m3_sc_online","\u2192 ONLINE (1K/s)")}</span>
          <span class="m3-sc-val m3-t-online">\u2014</span>
        </div>
        <div class="m3-scenario">
          <span class="m3-sc-label">${s("m3_sc_gpu","\u2192 GPU OFFLINE (1B/s)")}</span>
          <span class="m3-sc-val m3-t-gpu">\u2014</span>
        </div>
        <div class="m3-scenario">
          <span class="m3-sc-label">${s("m3_sc_nsa","\u2192 NIVEL NSA (1T/s)")}</span>
          <span class="m3-sc-val m3-t-nsa">\u2014</span>
        </div>
      </div>
    </div>

  </div>
</div>`}function P(e,t,a){let n=e.querySelector("#m3-words");n.innerHTML=t.map((l,i)=>`
<div class="m3-word-chip" role="listitem">
  <span class="m3-word-text">${l}</span>
  <div class="m3-dice" aria-hidden="true">
    ${a[i].map(o=>`<span class="m3-die">${L[o-1]}</span>`).join("")}
  </div>
</div>`).join("")}function T(e,t){e.querySelector("#m3-phrase").textContent=t.join(" ")}function b(e,t){let a=t*S;e.querySelector(".m3-entropy-val").textContent=`${a.toFixed(1)} bits`;let n=Math.min(a/128*100,100),l=e.querySelector(".m3-entropy-bar-fill");l.style.width=`${n}%`,l.style.background=a>=77?"var(--accent)":a>=51?"#ffd700":"var(--danger)",e.querySelector(".m3-t-online").textContent=h(a,1e3),e.querySelector(".m3-t-gpu").textContent=h(a,1e9),e.querySelector(".m3-t-nsa").textContent=h(a,1e12)}function q(e){let t=i=>e.querySelector(i);t(".m3-wc-label")&&(t(".m3-wc-label").textContent=s("m3_wordcount_label","PALABRAS")),t(".m3-generate-label")&&(t(".m3-generate-label").textContent=s("m3_generate_btn","GENERAR \u25B8")),t(".m3-hint")&&(t(".m3-hint").textContent=s("m3_hint","Gener\xE1 tu primera passphrase segura usando el m\xE9todo Diceware.")),t(".m3-loading-msg")&&(t(".m3-loading-msg").textContent=s("m3_generating","GENERANDO...")),t(".m3-copy-label")&&(t(".m3-copy-label").textContent=s("m3_copy_btn","COPIAR")),t(".m3-regen")&&(t(".m3-regen").textContent=`\u21BA ${s("m3_regen_btn","REGENERAR")}`),t(".m3-stat-k")&&(t(".m3-stat-k").textContent=s("m3_entropy_label","ENTROP\xCDA")),t(".m3-sc-title")&&(t(".m3-sc-title").textContent=s("m3_time_title","// TIEMPO ESTIMADO PARA ROMPERLA"));let a=e.querySelectorAll(".m3-sc-label"),n=["m3_sc_online","m3_sc_gpu","m3_sc_nsa"],l=["\u2192 ONLINE (1K/s)","\u2192 GPU OFFLINE (1B/s)","\u2192 NIVEL NSA (1T/s)"];a.forEach((i,o)=>{i.textContent=s(n[o],l[o])}),u.length&&b(e,u.length)}function I(e,{lang:t="es",strings:a={}}={}){$=t,y=a;let n=e.querySelector(".module-placeholder");n?n.outerHTML=A():e.insertAdjacentHTML("beforeend",A());let l=e.querySelector(".m3-hint"),i=e.querySelector(".m3-loading"),o=e.querySelector(".m3-result"),p=e.querySelector(".m3-generate"),R=e.querySelector(".m3-regen"),_=e.querySelector(".m3-copy"),m=e.querySelector(".m3-copy-label"),g=e.querySelectorAll(".m3-wc-pill");g.forEach(r=>{r.addEventListener("click",()=>{d=parseInt(r.dataset.count,10),g.forEach(c=>{c.classList.toggle("active",c===r),c.setAttribute("aria-pressed",c===r?"true":"false")}),u.length&&b(e,d)})});async function f(){l.classList.add("hidden"),o.classList.add("hidden"),i.classList.remove("hidden"),p.disabled=!0;try{await O();let{words:r,dice:c}=N(v,d);u=r,w=c,i.classList.add("hidden"),P(e,r,c),T(e,r),b(e,r.length),o.classList.remove("hidden")}catch(r){i.classList.add("hidden"),l.classList.remove("hidden"),console.error("[shield] diceware error:",r)}finally{p.disabled=!1}}p.addEventListener("click",f),R.addEventListener("click",f);let E=null;_.addEventListener("click",async()=>{let r=e.querySelector("#m3-phrase")?.textContent;if(r)try{await navigator.clipboard.writeText(r),m.textContent=s("m3_copied","\xA1COPIADO!"),_.classList.add("m3-copy--done"),clearTimeout(E),E=setTimeout(()=>{m.textContent=s("m3_copy_btn","COPIAR"),_.classList.remove("m3-copy--done")},2e3)}catch{m.textContent=s("m3_copy_err","ERROR"),setTimeout(()=>{m.textContent=s("m3_copy_btn","COPIAR")},2e3)}}),document.addEventListener("shield:langchange",r=>{$=r.detail.lang,y=r.detail.strings,q(e)})}export{I as init};
