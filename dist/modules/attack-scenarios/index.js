var h={online:10,bcrypt:1e3,md5:1e11},O=17,g="es",A={},l=null,b=!1,_=null,p=60,L=null;function t(e,a){return A[e]??a}async function T(){l||(l=await import("./analyzer-EEQHLLMY.js"),l.configure(g))}function w(e){if(!isFinite(e)||e<=0)return"\u2014";if(e<1)return`< 1 ${t("m4_unit_sec","seg")}`;if(e<60)return`${Math.round(e)} ${t("m4_unit_sec","seg")}`;if(e<3600)return`${Math.round(e/60)} ${t("m4_unit_min","min")}`;if(e<86400)return`${Math.round(e/3600)} ${t("m4_unit_h","h")}`;if(e<31536e3)return`${Math.round(e/86400)} ${t("m4_unit_days","d\xEDas")}`;let a=e/31536e3;return a<1e3?`${Math.round(a)} ${t("m4_unit_years","a\xF1os")}`:a<1e6?`${(a/1e3).toFixed(1)}k ${t("m4_unit_years","a\xF1os")}`:a<1e9?`${(a/1e6).toFixed(1)}M ${t("m4_unit_years","a\xF1os")}`:a<1e12?`${(a/1e9).toFixed(1)}B ${t("m4_unit_years","a\xF1os")}`:t("m4_unit_universe","> edad del universo")}function y(e,a){return!e||e<=1?0:e/a}function B(e){return e<60?"var(--danger)":e<86400?"#ff8800":e<31536e3?"#ffd700":"var(--accent)"}function I(e){if(e<=0)return 0;let a=Math.log10(Math.max(e,1));return Math.min(a/O*100,100)}function R(){return`
<div class="m4">
  <div class="m4-input-wrap">
    <input type="password" class="cyber-input m4-input" autocomplete="off"
           autocapitalize="off" autocorrect="off" spellcheck="false"
           placeholder="${t("m4_placeholder","Ingres\xE1 una contrase\xF1a...")}"
           aria-label="${t("m4_input_aria","Contrase\xF1a para evaluar escenarios")}">
    <button type="button" class="m4-vis-btn"
            aria-label="${t("m4_show_pass","Mostrar contrase\xF1a")}" aria-pressed="false">
      <span class="m4-vis-icon" aria-hidden="true">\u25C9</span>
    </button>
  </div>

  <p class="m4-hint">${t("m4_hint","Escrib\xED una contrase\xF1a para ver cu\xE1nto tarda romperla seg\xFAn el backend de hashing.")}</p>

  <p class="m4-loading hidden vt323" role="status" aria-live="polite">
    ${t("m4_loading","CARGANDO_ANALIZADOR...")}<span class="cursor">_</span>
  </p>

  <div class="m4-result hidden" aria-live="polite" aria-atomic="true">

    <div class="m4-meta">
      <div class="m4-meta-cell">
        <span class="m4-meta-k">${t("m4_stat_len","LONGITUD")}</span>
        <span class="m4-meta-v m4-len">0</span>
      </div>
      <div class="m4-meta-cell">
        <span class="m4-meta-k">${t("m4_stat_ent","ENTROP\xCDA")}</span>
        <span class="m4-meta-v m4-ent">~0 bits</span>
      </div>
    </div>

    <div class="m4-scenarios">
      <p class="m4-sc-title">${t("m4_sc_title","// TIEMPO ESTIMADO PARA CRACKEAR")}</p>

      <div class="m4-scenario">
        <div class="m4-sc-head">
          <span class="m4-sc-label">${t("m4_sc_online_label","\u2192 ONLINE (10/s)")}</span>
          <span class="m4-sc-val m4-t-online">\u2014</span>
        </div>
        <div class="m4-sc-bar"><div class="m4-sc-fill m4-fill-online"></div></div>
        <p class="m4-sc-desc">${t("m4_sc_online_desc","Login web con rate limit. 10 intentos por segundo.")}</p>
      </div>

      <div class="m4-scenario">
        <div class="m4-sc-head">
          <span class="m4-sc-label">${t("m4_sc_bcrypt_label","\u2192 BCRYPT cost 12 (1K/s)")}</span>
          <span class="m4-sc-val m4-t-bcrypt">\u2014</span>
        </div>
        <div class="m4-sc-bar"><div class="m4-sc-fill m4-fill-bcrypt"></div></div>
        <p class="m4-sc-desc">${t("m4_sc_bcrypt_desc","Backend con hash moderno. GPU offline contra base de datos filtrada.")}</p>
      </div>

      <div class="m4-scenario">
        <div class="m4-sc-head">
          <span class="m4-sc-label">${t("m4_sc_md5_label","\u2192 MD5 sin salt (100B/s)")}</span>
          <span class="m4-sc-val m4-t-md5">\u2014</span>
        </div>
        <div class="m4-sc-bar"><div class="m4-sc-fill m4-fill-md5"></div></div>
        <p class="m4-sc-desc">${t("m4_sc_md5_desc","Backend con hash legacy. Rig de 8\xD7 RTX 4090 contra hashes filtrados.")}</p>
      </div>
    </div>

    <div class="m4-explainer">
      <p>${t("m4_explainer",'La estimaci\xF3n usa zxcvbn \u2014 modela ataques con diccionarios y patrones reales (palabras de diccionario + d\xEDgitos, sustituciones l33t, etc), no entrop\xEDa te\xF3rica. Por eso "Avion19" cae en horas contra bcrypt aunque "parezca" tener 40 bits.')}</p>
    </div>

    <div class="m4-autoclear" role="status" aria-live="polite">
      <span class="m4-autoclear-msg">${t("m4_autoclear_msg","Se borra en {n}s")}</span>
      <button type="button" class="m4-autoclear-btn">${t("m4_autoclear_btn","BORRAR YA")}</button>
    </div>

  </div>
</div>`}function S(e,a,r){let o=e.querySelector(".m4-result"),i=e.querySelector(".m4-hint");if(!r){o.classList.add("hidden"),i.classList.remove("hidden");return}let c=Math.max(a.guesses||1,1),u=Math.log2(c),m=y(c,h.online),d=y(c,h.bcrypt),n=y(c,h.md5);e.querySelector(".m4-len").textContent=r.length,e.querySelector(".m4-ent").textContent=`~${Math.round(u)} bits`;let s=(M,q,v)=>{e.querySelector(M).textContent=w(v);let C=e.querySelector(q);C.style.width=`${I(v)}%`,C.style.background=B(v)};s(".m4-t-online",".m4-fill-online",m),s(".m4-t-bcrypt",".m4-fill-bcrypt",d),s(".m4-t-md5",".m4-fill-md5",n),i.classList.add("hidden"),o.classList.remove("hidden")}function E(e){e.querySelector(".m4-result").classList.add("hidden"),e.querySelector(".m4-hint").classList.remove("hidden")}function x(e){let a=e.querySelector(".m4-input");a.value="",a.type="password";let r=e.querySelector(".m4-vis-btn");r.setAttribute("aria-pressed","false"),r.setAttribute("aria-label",t("m4_show_pass","Mostrar contrase\xF1a")),$(e),E(e)}function k(e){$(e),p=60,f(e),_=setInterval(()=>{p--,f(e),p<=0&&x(e)},1e3)}function $(e){_&&(clearInterval(_),_=null),p=60,f(e)}function f(e){let a=e.querySelector(".m4-autoclear-msg");if(!a)return;let r=t("m4_autoclear_msg","Se borra en {n}s");a.textContent=r.replace("{n}",p)}function N(e){let a=n=>e.querySelector(n);a(".m4-input")&&(a(".m4-input").placeholder=t("m4_placeholder","Ingres\xE1 una contrase\xF1a..."),a(".m4-input").setAttribute("aria-label",t("m4_input_aria","Contrase\xF1a para evaluar escenarios"))),a(".m4-hint")&&(a(".m4-hint").textContent=t("m4_hint","Escrib\xED una contrase\xF1a para ver cu\xE1nto tarda romperla seg\xFAn el backend de hashing.")),a(".m4-loading")&&(a(".m4-loading").firstChild.nodeValue=t("m4_loading","CARGANDO_ANALIZADOR...")),a(".m4-sc-title")&&(a(".m4-sc-title").textContent=t("m4_sc_title","// TIEMPO ESTIMADO PARA CRACKEAR")),a(".m4-autoclear-btn")&&(a(".m4-autoclear-btn").textContent=t("m4_autoclear_btn","BORRAR YA")),a(".m4-explainer p")&&(a(".m4-explainer p").textContent=t("m4_explainer","La estimaci\xF3n usa zxcvbn \u2014 modela ataques con diccionarios y patrones reales, no entrop\xEDa te\xF3rica."));let r=e.querySelectorAll(".m4-meta-k"),o=[t("m4_stat_len","LONGITUD"),t("m4_stat_ent","ENTROP\xCDA")];r.forEach((n,s)=>{n.textContent=o[s]});let i=e.querySelectorAll(".m4-sc-label"),c=[t("m4_sc_online_label","\u2192 ONLINE (10/s)"),t("m4_sc_bcrypt_label","\u2192 BCRYPT cost 12 (1K/s)"),t("m4_sc_md5_label","\u2192 MD5 sin salt (100B/s)")];i.forEach((n,s)=>{n.textContent=c[s]});let u=e.querySelectorAll(".m4-sc-desc"),m=[t("m4_sc_online_desc","Login web con rate limit. 10 intentos por segundo."),t("m4_sc_bcrypt_desc","Backend con hash moderno. GPU offline contra base de datos filtrada."),t("m4_sc_md5_desc","Backend con hash legacy. Rig de 8\xD7 RTX 4090 contra hashes filtrados.")];u.forEach((n,s)=>{n.textContent=m[s]}),f(e);let d=e.querySelector(".m4-input")?.value;d&&l&&S(e,l.analyze(d),d)}function D(e,{lang:a="es",strings:r={}}={}){g=a,A=r;let o=e.querySelector(".module-placeholder");o?o.outerHTML=R():e.insertAdjacentHTML("beforeend",R());let i=e.querySelector(".m4-input"),c=e.querySelector(".m4-vis-btn"),u=e.querySelector(".m4-autoclear-btn"),m=e.querySelector(".m4-loading"),d=e.querySelector(".m4-hint");i.addEventListener("input",async()=>{let n=i.value;if(!n){E(e),$(e);return}k(e),!l&&!b&&(b=!0,d.classList.add("hidden"),m.classList.remove("hidden"),await T(),m.classList.add("hidden"),b=!1),l&&(clearTimeout(L),L=setTimeout(()=>{let s=l.analyze(n);S(e,s,n)},120))}),c.addEventListener("click",()=>{let n=i.type==="text";i.type=n?"password":"text",c.setAttribute("aria-pressed",String(!n)),c.setAttribute("aria-label",n?t("m4_show_pass","Mostrar contrase\xF1a"):t("m4_hide_pass","Ocultar contrase\xF1a"))}),u.addEventListener("click",()=>x(e)),document.addEventListener("shield:langchange",async n=>{if(g=n.detail.lang,A=n.detail.strings,N(e),l){l.configure(n.detail.lang);let s=i.value;s&&S(e,l.analyze(s),s)}})}export{D as init};
