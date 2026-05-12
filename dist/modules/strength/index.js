var R=[{es:"MUY_D\xC9BIL",en:"VERY_WEAK",color:"#ff003c",pct:10},{es:"D\xC9BIL",en:"WEAK",color:"#ff6b2b",pct:28},{es:"REGULAR",en:"FAIR",color:"#ffd700",pct:52},{es:"FUERTE",en:"STRONG",color:"#8fb800",pct:78},{es:"MUY_FUERTE",en:"VERY_STRONG",color:"#c4ff00",pct:100}],b=30,h="es",f={},m=null,c=b,i=null,g=!1;function t(s,e){return f[s]??e}var q='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',$='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';function C(){return`
<div class="s1">
  <div class="s1-input-wrap">
    <input type="password"
           class="cyber-input s1-input"
           placeholder="${t("m1_placeholder","Ingres\xE1 tu contrase\xF1a...")}"
           autocomplete="new-password"
           spellcheck="false"
           aria-label="${t("m1_input_aria","Contrase\xF1a a analizar")}"
           aria-describedby="s1-live">
    <button type="button"
            class="s1-vis-btn"
            aria-label="${t("m1_show_pass","Mostrar contrase\xF1a")}">
      ${q}
    </button>
  </div>

  <p class="s1-hint">${t("m1_empty_hint","Escrib\xED una contrase\xF1a para analizarla")}</p>

  <div class="s1-result hidden">
    <div class="s1-bar-track"
         role="progressbar"
         aria-valuemin="0"
         aria-valuemax="4"
         aria-valuenow="0"
         aria-label="${t("m1_strength_aria","Fortaleza de la contrase\xF1a")}">
      <div class="s1-bar-fill"></div>
    </div>

    <div class="s1-bar-footer">
      <span class="s1-score-label vt323" aria-live="polite">\u2014</span>
      <div class="s1-stats">
        <span class="s1-stat">
          <span class="s1-stat-k s1-k-len">${t("m1_stat_len","LEN")}</span>
          <span class="s1-stat-v s1-stat-len">\u2014</span>
        </span>
        <span class="s1-stat">
          <span class="s1-stat-k s1-k-ent">${t("m1_stat_ent","ENTROPY")}</span>
          <span class="s1-stat-v s1-stat-ent">\u2014</span>
        </span>
        <span class="s1-stat">
          <span class="s1-stat-k">SCORE</span>
          <span class="s1-stat-v s1-stat-sc">\u2014</span>
        </span>
      </div>
    </div>

    <div class="s1-feedback" id="s1-live" aria-live="polite">
      <div class="s1-warnings-block hidden">
        <p class="s1-fb-label s1-warn-lbl">${t("m1_warnings_label","\u26A0 ADVERTENCIAS")}</p>
        <ul class="s1-warnings"></ul>
      </div>
      <div class="s1-suggestions-block hidden">
        <p class="s1-fb-label s1-sug-lbl">${t("m1_suggestions_label","\u2192 SUGERENCIAS")}</p>
        <ul class="s1-suggestions"></ul>
      </div>
    </div>
  </div>

  <div class="s1-autoclear hidden">
    <div class="s1-ac-track" aria-hidden="true">
      <div class="s1-ac-fill"></div>
    </div>
    <div class="s1-ac-meta">
      <span class="s1-ac-msg" aria-live="assertive"></span>
      <button type="button" class="s1-ac-now">${t("m1_autoclear_now","borrar ahora")}</button>
    </div>
  </div>
</div>`}function I(s){return!s||s<=1?"~0 bits":`~${Math.round(Math.log2(s))} bits`}function x(s,e,n){let a=e.score,l=R[a],d=h==="en"?l.en:l.es,u=s.querySelector(".s1-bar-fill"),p=s.querySelector(".s1-bar-track"),r=s.querySelector(".s1-score-label"),o=s.querySelector(".s1-stat-len"),T=s.querySelector(".s1-stat-ent"),M=s.querySelector(".s1-stat-sc"),w=s.querySelector(".s1-warnings-block"),y=s.querySelector(".s1-warnings"),E=s.querySelector(".s1-suggestions-block"),S=s.querySelector(".s1-suggestions");if(s.querySelector(".s1-result").classList.remove("hidden"),s.querySelector(".s1-hint").classList.add("hidden"),u.style.width=`${l.pct}%`,u.style.background=l.color,u.style.boxShadow=a>=3?`0 0 14px ${l.color}70`:"none",p.setAttribute("aria-valuenow",String(a)),r.textContent=d,r.style.color=l.color,o.textContent=`${n.length} chars`,T.textContent=I(e.guesses),M.textContent=`${a}/4`,y.innerHTML="",e.feedback.warning){let v=document.createElement("li");v.textContent=e.feedback.warning,y.appendChild(v),w.classList.remove("hidden")}else w.classList.add("hidden");S.innerHTML="";let k=e.feedback.suggestions??[];k.length?(k.forEach(v=>{let L=document.createElement("li");L.textContent=v,S.appendChild(L)}),E.classList.remove("hidden")):E.classList.add("hidden"),document.dispatchEvent(new CustomEvent("shield:strength-analyzed",{detail:{score:a,guesses:e.guesses,entropy:Math.round(Math.log2(e.guesses||1)),password:n}}))}function _(s){A(s);let e=s.querySelector(".s1-input");e.value="",s.querySelector(".s1-result").classList.add("hidden"),s.querySelector(".s1-hint").classList.remove("hidden"),s.querySelector(".s1-bar-fill").style.width="0"}function A(s){clearInterval(m),m=null,s.querySelector(".s1-autoclear")?.classList.add("hidden")}function z(s){A(s),c=b;let e=s.querySelector(".s1-autoclear"),n=s.querySelector(".s1-ac-fill"),a=s.querySelector(".s1-ac-msg");e.classList.remove("hidden"),n.classList.remove("warning"),n.style.width="100%";function l(){c--,n.style.width=`${c/b*100}%`,c<=10&&n.classList.add("warning"),a.textContent=t("m1_autoclear_msg","Limpiando en {n}s").replace("{n}",c),c<=0&&_(s)}a.textContent=t("m1_autoclear_msg","Limpiando en {n}s").replace("{n}",c),m=setInterval(l,1e3)}function N(s){let e=a=>s.querySelector(a),n=e(".s1-input");if(n&&(n.placeholder=t("m1_placeholder","Ingres\xE1 tu contrase\xF1a...")),e(".s1-hint")&&(e(".s1-hint").textContent=t("m1_empty_hint","Escrib\xED una contrase\xF1a para analizarla")),e(".s1-ac-now")&&(e(".s1-ac-now").textContent=t("m1_autoclear_now","borrar ahora")),e(".s1-warn-lbl")&&(e(".s1-warn-lbl").textContent=t("m1_warnings_label","\u26A0 ADVERTENCIAS")),e(".s1-sug-lbl")&&(e(".s1-sug-lbl").textContent=t("m1_suggestions_label","\u2192 SUGERENCIAS")),e(".s1-k-len")&&(e(".s1-k-len").textContent=t("m1_stat_len","LEN")),e(".s1-k-ent")&&(e(".s1-k-ent").textContent=t("m1_stat_ent","ENTROPY")),n){let a=e(".s1-vis-btn");a&&a.setAttribute("aria-label",n.type==="text"?t("m1_hide_pass","Ocultar contrase\xF1a"):t("m1_show_pass","Mostrar contrase\xF1a"))}}async function O(){i||(i=await import("./analyzer-EEQHLLMY.js"),i.configure(h))}function U(s,{lang:e="es",strings:n={}}={}){h=e,f=n;let a=s.querySelector(".module-placeholder");a?a.outerHTML=C():s.insertAdjacentHTML("beforeend",C());let l=s.querySelector(".s1-input"),d=s.querySelector(".s1-vis-btn"),u=s.querySelector(".s1-ac-now");d.addEventListener("click",()=>{let r=l.type==="password";l.type=r?"text":"password",d.innerHTML=r?$:q,d.setAttribute("aria-label",r?t("m1_hide_pass","Ocultar contrase\xF1a"):t("m1_show_pass","Mostrar contrase\xF1a"))});let p=null;l.addEventListener("input",async()=>{let r=l.value;if(!r){_(s);return}z(s),!i&&!g&&(g=!0,await O(),g=!1),i&&(clearTimeout(p),p=setTimeout(()=>{let o=i.analyze(r);x(s,o,r)},120))}),u.addEventListener("click",()=>_(s)),document.addEventListener("shield:langchange",async r=>{if(h=r.detail.lang,f=r.detail.strings,N(s),i){i.configure(r.detail.lang);let o=l.value;o&&x(s,i.analyze(o),o)}})}export{U as init};
