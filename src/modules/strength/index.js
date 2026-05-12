// UI del módulo de fortaleza de contraseña.
// El analyzer pesado (zxcvbn-ts + diccionarios) se carga en el primer keystroke.

const SCORE_META = [
  { es: 'MUY_DÉBIL',  en: 'VERY_WEAK',   color: '#ff003c', pct: 10 },
  { es: 'DÉBIL',      en: 'WEAK',         color: '#ff6b2b', pct: 28 },
  { es: 'REGULAR',    en: 'FAIR',         color: '#ffd700', pct: 52 },
  { es: 'FUERTE',     en: 'STRONG',       color: '#8fb800', pct: 78 },
  { es: 'MUY_FUERTE', en: 'VERY_STRONG',  color: '#c4ff00', pct: 100 },
];

const AUTO_CLEAR_SECS = 30;

let _lang      = 'es';
let _strings   = {};
let _countId   = null;
let _remaining = AUTO_CLEAR_SECS;
let _analyzer  = null;        // se carga lazy en el primer keystroke
let _analyzing = false;       // evita análisis concurrentes mientras carga

function s(key, fallback) {
  return _strings[key] ?? fallback;
}

const SVG_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function buildTemplate() {
  return `
<div class="s1">
  <div class="s1-input-wrap">
    <input type="password"
           class="cyber-input s1-input"
           placeholder="${s('m1_placeholder', 'Ingresá tu contraseña...')}"
           autocomplete="new-password"
           spellcheck="false"
           aria-label="${s('m1_input_aria', 'Contraseña a analizar')}"
           aria-describedby="s1-live">
    <button type="button"
            class="s1-vis-btn"
            aria-label="${s('m1_show_pass', 'Mostrar contraseña')}">
      ${SVG_EYE}
    </button>
  </div>

  <p class="s1-hint">${s('m1_empty_hint', 'Escribí una contraseña para analizarla')}</p>

  <div class="s1-result hidden">
    <div class="s1-bar-track"
         role="progressbar"
         aria-valuemin="0"
         aria-valuemax="4"
         aria-valuenow="0"
         aria-label="${s('m1_strength_aria', 'Fortaleza de la contraseña')}">
      <div class="s1-bar-fill"></div>
    </div>

    <div class="s1-bar-footer">
      <span class="s1-score-label vt323" aria-live="polite">—</span>
      <div class="s1-stats">
        <span class="s1-stat">
          <span class="s1-stat-k s1-k-len">${s('m1_stat_len', 'LEN')}</span>
          <span class="s1-stat-v s1-stat-len">—</span>
        </span>
        <span class="s1-stat">
          <span class="s1-stat-k s1-k-ent">${s('m1_stat_ent', 'ENTROPY')}</span>
          <span class="s1-stat-v s1-stat-ent">—</span>
        </span>
        <span class="s1-stat">
          <span class="s1-stat-k">SCORE</span>
          <span class="s1-stat-v s1-stat-sc">—</span>
        </span>
      </div>
    </div>

    <div class="s1-feedback" id="s1-live" aria-live="polite">
      <div class="s1-warnings-block hidden">
        <p class="s1-fb-label s1-warn-lbl">${s('m1_warnings_label', '⚠ ADVERTENCIAS')}</p>
        <ul class="s1-warnings"></ul>
      </div>
      <div class="s1-suggestions-block hidden">
        <p class="s1-fb-label s1-sug-lbl">${s('m1_suggestions_label', '→ SUGERENCIAS')}</p>
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
      <button type="button" class="s1-ac-now">${s('m1_autoclear_now', 'borrar ahora')}</button>
    </div>
  </div>
</div>`;
}

function formatEntropy(guesses) {
  if (!guesses || guesses <= 1) return '~0 bits';
  return `~${Math.round(Math.log2(guesses))} bits`;
}

function updateResult(section, result, pw) {
  const score  = result.score;
  const meta   = SCORE_META[score];
  const label  = _lang === 'en' ? meta.en : meta.es;

  const bar        = section.querySelector('.s1-bar-fill');
  const barTrack   = section.querySelector('.s1-bar-track');
  const scoreLabel = section.querySelector('.s1-score-label');
  const statLen    = section.querySelector('.s1-stat-len');
  const statEnt    = section.querySelector('.s1-stat-ent');
  const statSc     = section.querySelector('.s1-stat-sc');
  const warnBlock  = section.querySelector('.s1-warnings-block');
  const warnList   = section.querySelector('.s1-warnings');
  const sugBlock   = section.querySelector('.s1-suggestions-block');
  const sugList    = section.querySelector('.s1-suggestions');

  section.querySelector('.s1-result').classList.remove('hidden');
  section.querySelector('.s1-hint').classList.add('hidden');

  bar.style.width      = `${meta.pct}%`;
  bar.style.background = meta.color;
  bar.style.boxShadow  = score >= 3 ? `0 0 14px ${meta.color}70` : 'none';
  barTrack.setAttribute('aria-valuenow', String(score));

  scoreLabel.textContent = label;
  scoreLabel.style.color = meta.color;
  statLen.textContent    = `${pw.length} chars`;
  statEnt.textContent    = formatEntropy(result.guesses);
  statSc.textContent     = `${score}/4`;

  warnList.innerHTML = '';
  if (result.feedback.warning) {
    const li = document.createElement('li');
    li.textContent = result.feedback.warning;
    warnList.appendChild(li);
    warnBlock.classList.remove('hidden');
  } else {
    warnBlock.classList.add('hidden');
  }

  sugList.innerHTML = '';
  const sugs = result.feedback.suggestions ?? [];
  if (sugs.length) {
    sugs.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      sugList.appendChild(li);
    });
    sugBlock.classList.remove('hidden');
  } else {
    sugBlock.classList.add('hidden');
  }

  // Módulo 4 puede escuchar este evento sin acoplamiento directo
  document.dispatchEvent(new CustomEvent('shield:strength-analyzed', {
    detail: { score, guesses: result.guesses, entropy: Math.round(Math.log2(result.guesses || 1)), password: pw },
  }));
}

function clearInput(section) {
  stopAutoClear(section);
  const input = section.querySelector('.s1-input');
  input.value = '';
  section.querySelector('.s1-result').classList.add('hidden');
  section.querySelector('.s1-hint').classList.remove('hidden');
  section.querySelector('.s1-bar-fill').style.width = '0';
}

function stopAutoClear(section) {
  clearInterval(_countId);
  _countId = null;
  section.querySelector('.s1-autoclear')?.classList.add('hidden');
}

function startAutoClear(section) {
  stopAutoClear(section);
  _remaining = AUTO_CLEAR_SECS;

  const acDiv  = section.querySelector('.s1-autoclear');
  const acFill = section.querySelector('.s1-ac-fill');
  const acMsg  = section.querySelector('.s1-ac-msg');

  acDiv.classList.remove('hidden');
  acFill.classList.remove('warning');
  acFill.style.width = '100%';

  function tick() {
    _remaining--;
    acFill.style.width = `${(_remaining / AUTO_CLEAR_SECS) * 100}%`;
    if (_remaining <= 10) acFill.classList.add('warning');
    acMsg.textContent = s('m1_autoclear_msg', 'Limpiando en {n}s').replace('{n}', _remaining);
    if (_remaining <= 0) clearInput(section);
  }

  acMsg.textContent = s('m1_autoclear_msg', 'Limpiando en {n}s').replace('{n}', _remaining);
  _countId = setInterval(tick, 1000);
}

function refreshStrings(section) {
  const q = sel => section.querySelector(sel);
  const input = q('.s1-input');
  if (input)    input.placeholder       = s('m1_placeholder', 'Ingresá tu contraseña...');
  if (q('.s1-hint'))    q('.s1-hint').textContent    = s('m1_empty_hint', 'Escribí una contraseña para analizarla');
  if (q('.s1-ac-now'))  q('.s1-ac-now').textContent  = s('m1_autoclear_now', 'borrar ahora');
  if (q('.s1-warn-lbl')) q('.s1-warn-lbl').textContent = s('m1_warnings_label', '⚠ ADVERTENCIAS');
  if (q('.s1-sug-lbl'))  q('.s1-sug-lbl').textContent  = s('m1_suggestions_label', '→ SUGERENCIAS');
  if (q('.s1-k-len'))   q('.s1-k-len').textContent   = s('m1_stat_len', 'LEN');
  if (q('.s1-k-ent'))   q('.s1-k-ent').textContent   = s('m1_stat_ent', 'ENTROPY');

  if (input) {
    const vis = q('.s1-vis-btn');
    if (vis) vis.setAttribute('aria-label',
      input.type === 'text' ? s('m1_hide_pass', 'Ocultar contraseña') : s('m1_show_pass', 'Mostrar contraseña'));
  }
}

async function ensureAnalyzer() {
  if (_analyzer) return;
  // Carga dinámica — el bundle pesado (~500 KB) se descarga solo la primera vez
  _analyzer = await import('./analyzer.js');
  _analyzer.configure(_lang);
}

export function init(section, { lang = 'es', strings = {} } = {}) {
  _lang    = lang;
  _strings = strings;

  const placeholder = section.querySelector('.module-placeholder');
  if (placeholder) {
    placeholder.outerHTML = buildTemplate();
  } else {
    section.insertAdjacentHTML('beforeend', buildTemplate());
  }

  const input = section.querySelector('.s1-input');
  const visBtn = section.querySelector('.s1-vis-btn');
  const acNow  = section.querySelector('.s1-ac-now');

  visBtn.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type       = isPass ? 'text' : 'password';
    visBtn.innerHTML = isPass ? SVG_EYE_OFF : SVG_EYE;
    visBtn.setAttribute('aria-label',
      isPass ? s('m1_hide_pass', 'Ocultar contraseña') : s('m1_show_pass', 'Mostrar contraseña'));
  });

  let debounceTimer = null;

  input.addEventListener('input', async () => {
    const pw = input.value;
    if (!pw) { clearInput(section); return; }

    startAutoClear(section);

    // Si el analyzer aún no cargó, esperar sin bloquear
    if (!_analyzer && !_analyzing) {
      _analyzing = true;
      await ensureAnalyzer();
      _analyzing = false;
    }

    if (!_analyzer) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const result = _analyzer.analyze(pw);
      updateResult(section, result, pw);
    }, 120);
  });

  acNow.addEventListener('click', () => clearInput(section));

  document.addEventListener('shield:langchange', async e => {
    _lang    = e.detail.lang;
    _strings = e.detail.strings;
    refreshStrings(section);

    // Reconfigurar zxcvbn si ya está cargado
    if (_analyzer) {
      _analyzer.configure(e.detail.lang);
      const pw = input.value;
      if (pw) updateResult(section, _analyzer.analyze(pw), pw);
    }
  });
}
