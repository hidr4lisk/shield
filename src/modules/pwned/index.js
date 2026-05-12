// Verifica si una contraseña fue filtrada usando k-anonymity contra HIBP.
// La contraseña nunca sale del navegador — solo los primeros 5 chars del hash SHA-1.

const AUTO_CLEAR_SECS = 60;

let _lang      = 'es';
let _strings   = {};
let _countId   = null;
let _remaining = AUTO_CLEAR_SECS;
let _controller = null;

function s(key, fallback) {
  return _strings[key] ?? fallback;
}

// SHA-1 via Web Crypto API nativa — sin dependencias
async function sha1Hex(text) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

async function queryHIBP(password) {
  const hash   = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  if (_controller) _controller.abort();
  _controller = new AbortController();

  const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' }, // respuesta de tamaño uniforme — mejor privacidad
    signal: _controller.signal,
  });

  if (!resp.ok) throw Object.assign(new Error('api'), { status: resp.status });

  const lines = (await resp.text()).split('\r\n');
  for (const line of lines) {
    const [lineSuffix, count] = line.split(':');
    if (lineSuffix === suffix) return parseInt(count, 10);
  }
  return 0;
}

const SVG_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function buildTemplate() {
  return `
<div class="m2">

  <!-- Input + botón verificar -->
  <div class="m2-input-row">
    <div class="m2-input-wrap">
      <input type="password"
             class="cyber-input m2-input"
             placeholder="${s('m2_placeholder', 'Ingresá tu contraseña...')}"
             autocomplete="new-password"
             spellcheck="false"
             aria-label="${s('m2_input_aria', 'Contraseña para verificar brechas')}"
             aria-describedby="m2-live">
      <button type="button" class="s1-vis-btn m2-vis-btn"
              aria-label="${s('m2_show_pass', 'Mostrar contraseña')}">
        ${SVG_EYE}
      </button>
    </div>
    <button type="button" class="cta-primary m2-submit">
      <span class="m2-submit-label">${s('m2_submit_btn', 'VERIFICAR ▸')}</span>
    </button>
  </div>

  <p class="m2-hint">${s('m2_empty_hint', 'Escribí una contraseña para verificar si fue filtrada')}</p>

  <!-- Estado cargando -->
  <div class="m2-loading hidden" role="status" aria-live="polite">
    <span class="vt323 m2-loading-msg">${s('m2_checking', 'CONSULTANDO API...')}</span>
    <span class="cursor">_</span>
  </div>

  <!-- Resultado -->
  <div class="m2-result hidden" id="m2-live" aria-live="polite" aria-atomic="true"></div>

  <!-- Auto-clear -->
  <div class="m2-autoclear hidden">
    <div class="m2-ac-track" aria-hidden="true">
      <div class="m2-ac-fill"></div>
    </div>
    <div class="m2-ac-meta">
      <span class="m2-ac-msg" aria-live="assertive"></span>
      <button type="button" class="s1-ac-now m2-ac-now">${s('m2_autoclear_now', 'borrar ahora')}</button>
    </div>
  </div>

  <!-- Explicación k-anonymity — siempre presente, toggle para expandir -->
  <div class="m2-kanon">
    <button type="button" class="m2-kanon-toggle" aria-expanded="false" aria-controls="m2-kanon-body">
      <span class="m2-kanon-chevron" aria-hidden="true">▶</span>
      <span class="m2-kanon-question">${s('m2_kanon_toggle', '¿Cómo verificamos sin enviar tu contraseña?')}</span>
    </button>

    <div class="m2-kanon-body hidden" id="m2-kanon-body">

      <p class="m2-kanon-title">${s('m2_kanon_title', '// K-ANONYMITY — CÓMO FUNCIONA')}</p>

      <div class="m2-kanon-steps">

        <div class="m2-kanon-step">
          <span class="m2-step-num vt323">01</span>
          <div>
            <p class="m2-step-label m2-sl-1">${s('m2_step1_label', 'HASH LOCAL')}</p>
            <p class="m2-step-desc">${s('m2_step1_desc', 'Tu navegador calcula el hash SHA-1 de tu contraseña. El hash nunca sale de tu dispositivo.')}</p>
          </div>
        </div>

        <div class="m2-kanon-step">
          <span class="m2-step-num vt323">02</span>
          <div>
            <p class="m2-step-label m2-sl-2">${s('m2_step2_label', 'SOLO 5 CARACTERES')}</p>
            <p class="m2-step-desc">${s('m2_step2_desc', 'Se envían únicamente los primeros 5 chars del hash. No alcanza para reconstruir tu contraseña.')}</p>
          </div>
        </div>

        <div class="m2-kanon-step">
          <span class="m2-step-num vt323">03</span>
          <div>
            <p class="m2-step-label m2-sl-3">${s('m2_step3_label', 'RESPUESTA AMPLIA')}</p>
            <p class="m2-step-desc">${s('m2_step3_desc', 'La API devuelve ~500-1000 hashes que comparten ese prefijo. Tu contraseña es anónima entre cientos.')}</p>
          </div>
        </div>

        <div class="m2-kanon-step">
          <span class="m2-step-num vt323">04</span>
          <div>
            <p class="m2-step-label m2-sl-4">${s('m2_step4_label', 'COMPARACIÓN LOCAL')}</p>
            <p class="m2-step-desc">${s('m2_step4_desc', 'Tu navegador compara localmente. El servidor nunca supo cuál era tu contraseña.')}</p>
          </div>
        </div>

      </div>

      <!-- Diagrama terminal -->
      <div class="m2-kanon-diagram">
        <div class="terminal-header">
          <span class="btn close" aria-hidden="true"></span>
          <span class="btn min" aria-hidden="true"></span>
          <span class="btn max" aria-hidden="true"></span>
          <span class="title">k-anonymity — exchange</span>
        </div>
        <div class="m2-diag-body">
          <div class="m2-diag-col">
            <p class="m2-diag-label">${s('m2_diag_browser', 'TU NAVEGADOR')}</p>
            <p class="m2-diag-line"><span class="m2-diag-comment">&gt; SHA-1("••••••")</span></p>
            <p class="m2-diag-line m2-diag-hash"><span class="m2-hash-prefix">${s('m2_diag_prefix', 'AAAAA')}</span><span class="m2-hash-suffix">B1C2D3E4F5...</span></p>
            <p class="m2-diag-line m2-diag-arrow-right"><span class="m2-hash-prefix">${s('m2_diag_prefix', 'AAAAA')}</span> ─────────────▶</p>
            <p class="m2-diag-line"><span class="m2-diag-comment">&lt; recibida lista</span></p>
            <p class="m2-diag-line m2-diag-compare">${s('m2_diag_compare', '¿está AAAAAB1C2...?')}</p>
          </div>
          <div class="m2-diag-col m2-diag-col-right">
            <p class="m2-diag-label">${s('m2_diag_api', 'HIBP API')}</p>
            <p class="m2-diag-line m2-diag-comment">&nbsp;</p>
            <p class="m2-diag-line m2-diag-comment">&nbsp;</p>
            <p class="m2-diag-line m2-diag-comment">GET /range/<span class="m2-hash-prefix">${s('m2_diag_prefix', 'AAAAA')}</span></p>
            <p class="m2-diag-line m2-diag-arrow-left">◀─────────────────</p>
            <p class="m2-diag-line m2-diag-comment">${s('m2_diag_list', '~800 hashes')}</p>
          </div>
        </div>
      </div>

      <p class="m2-kanon-footer">
        <span class="m2-kanon-footer-label">${s('m2_kanon_footer', 'El servidor solo ve "AAAAA". Tu contraseña queda anónima entre cientos de hashes. Eso es k-anonymity.')}</span>
      </p>

    </div>
  </div>

</div>`;
}

// ── Resultado ─────────────────────────────────────────────────────────

function renderSafe(resultDiv) {
  resultDiv.innerHTML = `
<div class="m2-res m2-res-safe">
  <span class="m2-res-icon">✓</span>
  <div>
    <p class="m2-res-headline">${s('m2_result_safe', 'No encontrada en breaches conocidos')}</p>
    <p class="m2-res-detail">${s('m2_result_safe_detail', 'Esta contraseña no aparece en ninguna base de datos de credenciales comprometidas analizada por HaveIBeenPwned.')}</p>
  </div>
</div>`;
  resultDiv.classList.remove('hidden');
}

function renderFound(resultDiv, count) {
  const n = count.toLocaleString();
  const headline = s('m2_result_found', 'Encontrada {n} veces en breaches').replace('{n}', n);
  resultDiv.innerHTML = `
<div class="m2-res m2-res-found">
  <span class="m2-res-icon">✗</span>
  <div>
    <p class="m2-res-headline">${headline}</p>
    <p class="m2-res-detail">${s('m2_result_found_detail', 'Esta contraseña fue expuesta en filtraciones de datos conocidas. Si la usás en algún servicio, cambiala ahora.')}</p>
  </div>
</div>`;
  resultDiv.classList.remove('hidden');
}

function renderError(resultDiv, err) {
  let msg;
  if (err.status) {
    msg = s('m2_error_api', 'La API respondió con un error ({code}). Intentá de nuevo.').replace('{code}', err.status);
  } else {
    msg = s('m2_error_network', 'Error de red. Verificá tu conexión e intentá de nuevo.');
  }
  resultDiv.innerHTML = `
<div class="m2-res m2-res-error">
  <span class="m2-res-icon">!</span>
  <div>
    <p class="m2-res-headline">${msg}</p>
  </div>
</div>`;
  resultDiv.classList.remove('hidden');
}

// ── Auto-clear ────────────────────────────────────────────────────────

function stopAutoClear(section) {
  clearInterval(_countId);
  _countId = null;
  section.querySelector('.m2-autoclear')?.classList.add('hidden');
}

function startAutoClear(section) {
  stopAutoClear(section);
  _remaining = AUTO_CLEAR_SECS;

  const acDiv  = section.querySelector('.m2-autoclear');
  const acFill = section.querySelector('.m2-ac-fill');
  const acMsg  = section.querySelector('.m2-ac-msg');

  acDiv.classList.remove('hidden');
  acFill.classList.remove('warning');
  acFill.style.width = '100%';

  function tick() {
    _remaining--;
    acFill.style.width = `${(_remaining / AUTO_CLEAR_SECS) * 100}%`;
    if (_remaining <= 10) acFill.classList.add('warning');
    acMsg.textContent = s('m2_autoclear_msg', 'Limpiando en {n}s').replace('{n}', _remaining);
    if (_remaining <= 0) clearModule(section);
  }

  acMsg.textContent = s('m2_autoclear_msg', 'Limpiando en {n}s').replace('{n}', _remaining);
  _countId = setInterval(tick, 1000);
}

function clearModule(section) {
  stopAutoClear(section);
  if (_controller) { _controller.abort(); _controller = null; }

  const input     = section.querySelector('.m2-input');
  const resultDiv = section.querySelector('.m2-result');
  const loading   = section.querySelector('.m2-loading');
  const hint      = section.querySelector('.m2-hint');

  input.value = '';
  resultDiv.classList.add('hidden');
  loading.classList.add('hidden');
  hint.classList.remove('hidden');
}

// ── Strings ───────────────────────────────────────────────────────────

function refreshStrings(section) {
  const q = sel => section.querySelector(sel);
  if (q('.m2-input'))           q('.m2-input').placeholder          = s('m2_placeholder', 'Ingresá tu contraseña...');
  if (q('.m2-hint'))            q('.m2-hint').textContent           = s('m2_empty_hint', 'Escribí una contraseña para verificar si fue filtrada');
  if (q('.m2-submit-label'))    q('.m2-submit-label').textContent   = s('m2_submit_btn', 'VERIFICAR ▸');
  if (q('.m2-loading-msg'))     q('.m2-loading-msg').textContent    = s('m2_checking', 'CONSULTANDO API...');
  if (q('.m2-ac-now'))          q('.m2-ac-now').textContent         = s('m2_autoclear_now', 'borrar ahora');
  if (q('.m2-kanon-question'))  q('.m2-kanon-question').textContent = s('m2_kanon_toggle', '¿Cómo verificamos sin enviar tu contraseña?');
  if (q('.m2-kanon-title'))     q('.m2-kanon-title').textContent    = s('m2_kanon_title', '// K-ANONYMITY — CÓMO FUNCIONA');
  if (q('.m2-step-label.m2-sl-1')) q('.m2-step-label.m2-sl-1').textContent = s('m2_step1_label', 'HASH LOCAL');
  if (q('.m2-step-label.m2-sl-2')) q('.m2-step-label.m2-sl-2').textContent = s('m2_step2_label', 'SOLO 5 CARACTERES');
  if (q('.m2-step-label.m2-sl-3')) q('.m2-step-label.m2-sl-3').textContent = s('m2_step3_label', 'RESPUESTA AMPLIA');
  if (q('.m2-step-label.m2-sl-4')) q('.m2-step-label.m2-sl-4').textContent = s('m2_step4_label', 'COMPARACIÓN LOCAL');
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

  const input     = section.querySelector('.m2-input');
  const visBtn    = section.querySelector('.m2-vis-btn');
  const submitBtn = section.querySelector('.m2-submit');
  const resultDiv = section.querySelector('.m2-result');
  const loading   = section.querySelector('.m2-loading');
  const hint      = section.querySelector('.m2-hint');
  const acNow     = section.querySelector('.m2-ac-now');
  const kToggle   = section.querySelector('.m2-kanon-toggle');
  const kBody     = section.querySelector('.m2-kanon-body');
  const kChevron  = section.querySelector('.m2-kanon-chevron');

  // Toggle show/hide contraseña
  visBtn.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type       = isPass ? 'text' : 'password';
    visBtn.innerHTML = isPass ? SVG_EYE_OFF : SVG_EYE;
    visBtn.setAttribute('aria-label',
      isPass ? s('m2_hide_pass', 'Ocultar contraseña') : s('m2_show_pass', 'Mostrar contraseña'));
  });

  // Limpiar resultado al tipear (el usuario cambió la contraseña)
  input.addEventListener('input', () => {
    if (resultDiv && !resultDiv.classList.contains('hidden')) {
      resultDiv.classList.add('hidden');
    }
    if (!input.value) {
      clearModule(section);
    } else {
      startAutoClear(section);
    }
  });

  // Verificar al hacer Enter en el input
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBtn.click();
  });

  // Lógica principal de verificación
  submitBtn.addEventListener('click', async () => {
    const pw = input.value.trim();
    if (!pw) { input.focus(); return; }

    hint.classList.add('hidden');
    resultDiv.classList.add('hidden');
    loading.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
      const count = await queryHIBP(pw);
      loading.classList.add('hidden');
      if (count > 0) {
        renderFound(resultDiv, count);
      } else {
        renderSafe(resultDiv);
      }
      startAutoClear(section);
    } catch (err) {
      loading.classList.add('hidden');
      if (err.name !== 'AbortError') {
        renderError(resultDiv, err);
      }
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Borrar ahora
  acNow.addEventListener('click', () => clearModule(section));

  // Toggle k-anonymity explainer
  kToggle.addEventListener('click', () => {
    const isOpen = kBody.classList.toggle('hidden') === false;
    // classList.toggle retorna true si la clase fue AÑADIDA, false si fue eliminada.
    // Si la clase 'hidden' fue eliminada → el cuerpo está visible → isOpen = true... wait
    // classList.toggle('hidden') devuelve el nuevo estado (true = tiene la clase)
    // Entonces: si tiene 'hidden' → cerrado; si no → abierto
    const open = !kBody.classList.contains('hidden');
    kToggle.setAttribute('aria-expanded', String(open));
    kChevron.textContent = open ? '▼' : '▶';
  });

  // Actualizar strings al cambiar idioma
  document.addEventListener('shield:langchange', e => {
    _lang    = e.detail.lang;
    _strings = e.detail.strings;
    refreshStrings(section);
    // Si hay un resultado visible, re-renderizarlo en el nuevo idioma
    // (el resultado no tiene datos propios, se perdería el count — no re-renderizar)
  });
}
