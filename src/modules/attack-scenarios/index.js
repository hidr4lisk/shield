// Módulo 4: Attack Scenarios Visualizer
// Muestra cuánto tarda romper la misma password según el backend de hashing.
// Fórmula: tiempo = (2^entropía) / hashes_por_segundo / 2 (espacio promedio de búsqueda).

const AUTO_CLEAR_SECS = 60;

// Throughputs (intentos/segundo)
const SCENARIOS = {
  online: 10,    // rate-limited login web
  bcrypt: 1e3,   // bcrypt cost 12 en GPU moderna (rig dedicado)
  md5:    1e11,  // MD5 sin salt en rig 8x RTX 4090
};

// Para la barra: log10 del tiempo en segundos, normalizado.
// 0s = 0%, ~10^17s (edad del universo en segundos) = 100%
const MAX_LOG_SECS = 17;

let _lang      = 'es';
let _strings   = {};
let _countId   = null;
let _remaining = AUTO_CLEAR_SECS;

function s(key, fallback) {
  return _strings[key] ?? fallback;
}

// ── Entropía naive por charset ────────────────────────────────────────

function estimateEntropy(pw) {
  if (!pw) return 0;
  let charset = 0;
  if (/[a-z]/.test(pw)) charset += 26;
  if (/[A-Z]/.test(pw)) charset += 26;
  if (/[0-9]/.test(pw)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) charset += 32;
  if (charset === 0) return 0;
  return pw.length * Math.log2(charset);
}

// ── Formateo de tiempo ────────────────────────────────────────────────

function formatTime(secs) {
  if (!isFinite(secs) || secs <= 0) return '—';
  if (secs < 1)         return `< 1 ${s('m4_unit_sec', 'seg')}`;
  if (secs < 60)        return `${Math.round(secs)} ${s('m4_unit_sec', 'seg')}`;
  if (secs < 3600)      return `${Math.round(secs / 60)} ${s('m4_unit_min', 'min')}`;
  if (secs < 86400)     return `${Math.round(secs / 3600)} ${s('m4_unit_h', 'h')}`;
  if (secs < 31536000)  return `${Math.round(secs / 86400)} ${s('m4_unit_days', 'días')}`;
  const years = secs / 31536000;
  if (years < 1e3)      return `${Math.round(years)} ${s('m4_unit_years', 'años')}`;
  if (years < 1e6)      return `${(years / 1e3).toFixed(1)}k ${s('m4_unit_years', 'años')}`;
  if (years < 1e9)      return `${(years / 1e6).toFixed(1)}M ${s('m4_unit_years', 'años')}`;
  if (years < 1e12)     return `${(years / 1e9).toFixed(1)}B ${s('m4_unit_years', 'años')}`;
  return s('m4_unit_universe', '> edad del universo');
}

// Tiempo en segundos para crackear, dado entropía y throughput
function crackSecs(entropy, hps) {
  if (entropy <= 0) return 0;
  return Math.pow(2, entropy) / hps / 2;
}

// Color del bar según seguridad relativa (segundos)
function barColor(secs) {
  if (secs < 60)        return 'var(--danger)';
  if (secs < 86400)     return '#ff8800';
  if (secs < 31536000)  return '#ffd700';
  return 'var(--accent)';
}

// % del bar (log scale)
function barPct(secs) {
  if (secs <= 0) return 0;
  const logSecs = Math.log10(Math.max(secs, 1));
  return Math.min((logSecs / MAX_LOG_SECS) * 100, 100);
}

// ── Template ──────────────────────────────────────────────────────────

function buildTemplate() {
  return `
<div class="m4">
  <div class="m4-input-wrap">
    <input type="password" class="cyber-input m4-input" autocomplete="off"
           autocapitalize="off" autocorrect="off" spellcheck="false"
           placeholder="${s('m4_placeholder', 'Ingresá una contraseña...')}"
           aria-label="${s('m4_input_aria', 'Contraseña para evaluar escenarios')}">
    <button type="button" class="s1-vis-btn m4-vis-btn"
            aria-label="${s('m4_show_pass', 'Mostrar contraseña')}" aria-pressed="false">
      <span class="m4-vis-icon" aria-hidden="true">◉</span>
    </button>
  </div>

  <p class="m4-hint">${s('m4_hint', 'Escribí una contraseña para ver cuánto tarda romperla según el backend.')}</p>

  <div class="m4-result hidden" aria-live="polite" aria-atomic="true">

    <div class="m4-meta">
      <div class="m4-meta-cell">
        <span class="m4-meta-k">${s('m4_stat_len', 'LONGITUD')}</span>
        <span class="m4-meta-v m4-len">0</span>
      </div>
      <div class="m4-meta-cell">
        <span class="m4-meta-k">${s('m4_stat_ent', 'ENTROPÍA')}</span>
        <span class="m4-meta-v m4-ent">~0 bits</span>
      </div>
    </div>

    <div class="m4-scenarios">
      <p class="m4-sc-title">${s('m4_sc_title', '// TIEMPO ESTIMADO PARA CRACKEAR')}</p>

      <div class="m4-scenario">
        <div class="m4-sc-head">
          <span class="m4-sc-label">${s('m4_sc_online_label', '→ ONLINE (10/s)')}</span>
          <span class="m4-sc-val m4-t-online">—</span>
        </div>
        <div class="m4-sc-bar"><div class="m4-sc-fill m4-fill-online"></div></div>
        <p class="m4-sc-desc">${s('m4_sc_online_desc', 'Login web con rate limit. 10 intentos por segundo.')}</p>
      </div>

      <div class="m4-scenario">
        <div class="m4-sc-head">
          <span class="m4-sc-label">${s('m4_sc_bcrypt_label', '→ BCRYPT cost 12 (1K/s)')}</span>
          <span class="m4-sc-val m4-t-bcrypt">—</span>
        </div>
        <div class="m4-sc-bar"><div class="m4-sc-fill m4-fill-bcrypt"></div></div>
        <p class="m4-sc-desc">${s('m4_sc_bcrypt_desc', 'Backend con hash moderno. GPU offline contra base de datos filtrada.')}</p>
      </div>

      <div class="m4-scenario">
        <div class="m4-sc-head">
          <span class="m4-sc-label">${s('m4_sc_md5_label', '→ MD5 sin salt (100B/s)')}</span>
          <span class="m4-sc-val m4-t-md5">—</span>
        </div>
        <div class="m4-sc-bar"><div class="m4-sc-fill m4-fill-md5"></div></div>
        <p class="m4-sc-desc">${s('m4_sc_md5_desc', 'Backend con hash legacy. Rig de 8× RTX 4090 contra hashes filtrados.')}</p>
      </div>
    </div>

    <div class="m4-explainer">
      <p>${s('m4_explainer', 'La misma contraseña puede tardar siglos o minutos en romperse según cómo el servicio guarde tu hash. Por eso importa elegir servicios que usen bcrypt, scrypt o argon2 — no MD5 ni SHA-1 sin salt.')}</p>
    </div>

    <div class="m4-autoclear" role="status" aria-live="polite">
      <span class="m4-autoclear-msg">${s('m4_autoclear_msg', 'Se borra en {n}s')}</span>
      <button type="button" class="m4-autoclear-btn">${s('m4_autoclear_btn', 'BORRAR YA')}</button>
    </div>

  </div>
</div>`;
}

// ── Render ────────────────────────────────────────────────────────────

function renderResult(section, pw) {
  const result = section.querySelector('.m4-result');
  const hint   = section.querySelector('.m4-hint');

  if (!pw) {
    result.classList.add('hidden');
    hint.classList.remove('hidden');
    return;
  }

  const entropy = estimateEntropy(pw);
  const tOnline = crackSecs(entropy, SCENARIOS.online);
  const tBcrypt = crackSecs(entropy, SCENARIOS.bcrypt);
  const tMd5    = crackSecs(entropy, SCENARIOS.md5);

  section.querySelector('.m4-len').textContent = pw.length;
  section.querySelector('.m4-ent').textContent = `~${Math.round(entropy)} bits`;

  const setBar = (timeSel, fillSel, secs) => {
    section.querySelector(timeSel).textContent = formatTime(secs);
    const fill = section.querySelector(fillSel);
    fill.style.width  = `${barPct(secs)}%`;
    fill.style.background = barColor(secs);
  };

  setBar('.m4-t-online', '.m4-fill-online', tOnline);
  setBar('.m4-t-bcrypt', '.m4-fill-bcrypt', tBcrypt);
  setBar('.m4-t-md5',    '.m4-fill-md5',    tMd5);

  hint.classList.add('hidden');
  result.classList.remove('hidden');
}

// ── Auto-clear ────────────────────────────────────────────────────────

function clearModule(section) {
  const input = section.querySelector('.m4-input');
  input.value = '';
  input.type = 'password';
  const visBtn = section.querySelector('.m4-vis-btn');
  visBtn.setAttribute('aria-pressed', 'false');
  visBtn.setAttribute('aria-label', s('m4_show_pass', 'Mostrar contraseña'));
  stopCountdown(section);
  renderResult(section, '');
}

function startCountdown(section) {
  stopCountdown(section);
  _remaining = AUTO_CLEAR_SECS;
  updateAutoclearMsg(section);
  _countId = setInterval(() => {
    _remaining--;
    updateAutoclearMsg(section);
    if (_remaining <= 0) clearModule(section);
  }, 1000);
}

function stopCountdown(section) {
  if (_countId) {
    clearInterval(_countId);
    _countId = null;
  }
  _remaining = AUTO_CLEAR_SECS;
  updateAutoclearMsg(section);
}

function updateAutoclearMsg(section) {
  const msg = section.querySelector('.m4-autoclear-msg');
  if (!msg) return;
  const template = s('m4_autoclear_msg', 'Se borra en {n}s');
  msg.textContent = template.replace('{n}', _remaining);
}

// ── Refresh strings ───────────────────────────────────────────────────

function refreshStrings(section) {
  const q = sel => section.querySelector(sel);
  if (q('.m4-input'))         q('.m4-input').placeholder       = s('m4_placeholder', 'Ingresá una contraseña...');
  if (q('.m4-input'))         q('.m4-input').setAttribute('aria-label', s('m4_input_aria', 'Contraseña para evaluar escenarios'));
  if (q('.m4-hint'))          q('.m4-hint').textContent        = s('m4_hint', 'Escribí una contraseña para ver cuánto tarda romperla según el backend.');
  if (q('.m4-sc-title'))      q('.m4-sc-title').textContent    = s('m4_sc_title', '// TIEMPO ESTIMADO PARA CRACKEAR');
  if (q('.m4-autoclear-btn')) q('.m4-autoclear-btn').textContent = s('m4_autoclear_btn', 'BORRAR YA');
  if (q('.m4-explainer p'))   q('.m4-explainer p').textContent = s('m4_explainer', 'La misma contraseña puede tardar siglos o minutos en romperse según cómo el servicio guarde tu hash. Por eso importa elegir servicios que usen bcrypt, scrypt o argon2 — no MD5 ni SHA-1 sin salt.');

  const metaKeys = section.querySelectorAll('.m4-meta-k');
  const metaTexts = [s('m4_stat_len', 'LONGITUD'), s('m4_stat_ent', 'ENTROPÍA')];
  metaKeys.forEach((el, i) => { el.textContent = metaTexts[i]; });

  const scLabels = section.querySelectorAll('.m4-sc-label');
  const labelKeys = [
    s('m4_sc_online_label', '→ ONLINE (10/s)'),
    s('m4_sc_bcrypt_label', '→ BCRYPT cost 12 (1K/s)'),
    s('m4_sc_md5_label',    '→ MD5 sin salt (100B/s)'),
  ];
  scLabels.forEach((el, i) => { el.textContent = labelKeys[i]; });

  const scDescs = section.querySelectorAll('.m4-sc-desc');
  const descKeys = [
    s('m4_sc_online_desc', 'Login web con rate limit. 10 intentos por segundo.'),
    s('m4_sc_bcrypt_desc', 'Backend con hash moderno. GPU offline contra base de datos filtrada.'),
    s('m4_sc_md5_desc',    'Backend con hash legacy. Rig de 8× RTX 4090 contra hashes filtrados.'),
  ];
  scDescs.forEach((el, i) => { el.textContent = descKeys[i]; });

  updateAutoclearMsg(section);
  // Re-render con nuevas unidades si hay valor
  const pw = section.querySelector('.m4-input')?.value;
  if (pw) renderResult(section, pw);
}

// ── Init ──────────────────────────────────────────────────────────────

export function init(section, { lang = 'es', strings = {} } = {}) {
  _lang    = lang;
  _strings = strings;

  const placeholder = section.querySelector('.module-placeholder');
  if (placeholder) {
    placeholder.outerHTML = buildTemplate();
  } else {
    section.insertAdjacentHTML('beforeend', buildTemplate());
  }

  const input  = section.querySelector('.m4-input');
  const visBtn = section.querySelector('.m4-vis-btn');
  const acBtn  = section.querySelector('.m4-autoclear-btn');

  input.addEventListener('input', () => {
    const pw = input.value;
    renderResult(section, pw);
    if (pw) startCountdown(section);
    else    stopCountdown(section);
  });

  visBtn.addEventListener('click', () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    visBtn.setAttribute('aria-pressed', String(!showing));
    visBtn.setAttribute('aria-label',
      showing ? s('m4_show_pass', 'Mostrar contraseña') : s('m4_hide_pass', 'Ocultar contraseña'));
  });

  acBtn.addEventListener('click', () => clearModule(section));

  document.addEventListener('shield:langchange', e => {
    _lang    = e.detail.lang;
    _strings = e.detail.strings;
    refreshStrings(section);
  });
}
