// Módulo 3: Diceware Generator
// Usa crypto.getRandomValues() para selección uniforme y segura del wordlist EFF (7776 palabras).
// El wordlist se importa dinámicamente en el primer click para no bloquear la carga inicial.

let _lang    = 'es';
let _strings = {};
let _wordlist = null;
let _lastWords  = [];
let _lastDice   = [];
let _wordCount  = 5;

const DICE_FACES  = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const ENT_PER_WORD = Math.log2(7776); // 12.924 bits

function s(key, fallback) {
  return _strings[key] ?? fallback;
}

// ── Utilidades de randomness ───────────────────────────────────────────

// Rejection sampling para distribución uniforme en [0, max)
function randomIndex(max) {
  const limit = 65536 - (65536 % max);
  const buf = new Uint16Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % max;
}

// Convierte índice 0-7775 a tirada de 5 dados (cada uno 1-6)
function indexToDice(idx) {
  const dice = [];
  for (let i = 0; i < 5; i++) {
    dice.unshift((idx % 6) + 1);
    idx = Math.floor(idx / 6);
  }
  return dice;
}

// ── Carga lazy del wordlist ────────────────────────────────────────────

async function ensureWordlist() {
  if (_wordlist) return;
  const { WORDLIST } = await import('./wordlist.js');
  _wordlist = WORDLIST;
}

// ── Generación ────────────────────────────────────────────────────────

function generatePassphrase(wordlist, count) {
  const words = [];
  const dice  = [];
  for (let i = 0; i < count; i++) {
    const idx = randomIndex(wordlist.length);
    words.push(wordlist[idx]);
    dice.push(indexToDice(idx));
  }
  return { words, dice };
}

// ── Formateo de tiempo ────────────────────────────────────────────────

function formatTime(entropy, guessesPerSec) {
  const secs = Math.pow(2, entropy) / guessesPerSec / 2;
  if (secs < 60)         return `< 1 ${s('m3_unit_min', 'min')}`;
  if (secs < 3600)       return `${Math.round(secs / 60)} ${s('m3_unit_min', 'min')}`;
  if (secs < 86400)      return `${Math.round(secs / 3600)} ${s('m3_unit_h', 'h')}`;
  if (secs < 31536000)   return `${Math.round(secs / 86400)} ${s('m3_unit_days', 'días')}`;
  const years = secs / 31536000;
  if (years < 1e3)       return `${Math.round(years)} ${s('m3_unit_years', 'años')}`;
  if (years < 1e6)       return `${(years / 1e3).toFixed(1)}k ${s('m3_unit_years', 'años')}`;
  if (years < 1e9)       return `${(years / 1e6).toFixed(1)}M ${s('m3_unit_years', 'años')}`;
  return `${(years / 1e9).toFixed(1)}B ${s('m3_unit_years', 'años')}`;
}

// ── Template ──────────────────────────────────────────────────────────

function buildTemplate() {
  return `
<div class="m3">

  <div class="m3-controls">
    <div class="m3-wordcount">
      <span class="m3-wc-label">${s('m3_wordcount_label', 'PALABRAS')}</span>
      <div class="m3-wc-pills" role="group" aria-label="${s('m3_wordcount_aria', 'Número de palabras')}">
        ${[4,5,6,7].map(n => `
        <button class="m3-wc-pill${n === _wordCount ? ' active' : ''}" data-count="${n}"
                aria-pressed="${n === _wordCount}">
          ${n}
        </button>`).join('')}
      </div>
    </div>
    <button class="cta-primary m3-generate" aria-describedby="m3-hint">
      <span class="m3-generate-label">${s('m3_generate_btn', 'GENERAR ▸')}</span>
    </button>
  </div>

  <p class="m3-hint" id="m3-hint">${s('m3_hint', 'Generá tu primera passphrase segura usando el método Diceware.')}</p>

  <div class="m3-loading hidden" role="status" aria-live="polite">
    <span class="vt323 m3-loading-msg">${s('m3_generating', 'GENERANDO...')}</span>
    <span class="cursor">_</span>
  </div>

  <div class="m3-result hidden" aria-live="polite" aria-atomic="true">

    <div class="m3-words" id="m3-words" role="list"
         aria-label="${s('m3_words_aria', 'Palabras de la passphrase')}">
    </div>

    <div class="m3-phrase-wrap">
      <p class="m3-phrase" id="m3-phrase" aria-label="${s('m3_phrase_aria', 'Passphrase completa')}"></p>
    </div>

    <div class="m3-actions">
      <button class="cta-primary m3-copy" aria-live="polite">
        <span class="m3-copy-icon" aria-hidden="true">⎘</span>
        <span class="m3-copy-label">${s('m3_copy_btn', 'COPIAR')}</span>
      </button>
      <button class="cta-secondary m3-regen">
        ↺ ${s('m3_regen_btn', 'REGENERAR')}
      </button>
    </div>

    <div class="m3-stats">
      <div class="m3-entropy-row">
        <span class="m3-stat-k">${s('m3_entropy_label', 'ENTROPÍA')}</span>
        <span class="m3-stat-v m3-entropy-val"></span>
        <div class="m3-entropy-bar-track" aria-hidden="true">
          <div class="m3-entropy-bar-fill"></div>
        </div>
      </div>
      <div class="m3-scenarios">
        <p class="m3-sc-title">${s('m3_time_title', '// TIEMPO ESTIMADO PARA ROMPERLA')}</p>
        <div class="m3-scenario">
          <span class="m3-sc-label">${s('m3_sc_online', '→ ONLINE (1K/s)')}</span>
          <span class="m3-sc-val m3-t-online">—</span>
        </div>
        <div class="m3-scenario">
          <span class="m3-sc-label">${s('m3_sc_gpu', '→ GPU OFFLINE (1B/s)')}</span>
          <span class="m3-sc-val m3-t-gpu">—</span>
        </div>
        <div class="m3-scenario">
          <span class="m3-sc-label">${s('m3_sc_nsa', '→ NIVEL NSA (1T/s)')}</span>
          <span class="m3-sc-val m3-t-nsa">—</span>
        </div>
      </div>
    </div>

  </div>
</div>`;
}

// ── Render ────────────────────────────────────────────────────────────

function renderWords(section, words, dice) {
  const wordsDiv = section.querySelector('#m3-words');
  wordsDiv.innerHTML = words.map((word, i) => `
<div class="m3-word-chip" role="listitem">
  <span class="m3-word-text">${word}</span>
  <div class="m3-dice" aria-hidden="true">
    ${dice[i].map(d => `<span class="m3-die">${DICE_FACES[d - 1]}</span>`).join('')}
  </div>
</div>`).join('');
}

function renderPhrase(section, words) {
  section.querySelector('#m3-phrase').textContent = words.join(' ');
}

function renderStats(section, numWords) {
  const entropy = numWords * ENT_PER_WORD;

  section.querySelector('.m3-entropy-val').textContent =
    `${entropy.toFixed(1)} bits`;

  // Barra: 0 bits = 0%, 128 bits = 100%
  const pct = Math.min((entropy / 128) * 100, 100);
  const fill = section.querySelector('.m3-entropy-bar-fill');
  fill.style.width = `${pct}%`;
  // Color según fortaleza
  fill.style.background = entropy >= 77 ? 'var(--accent)' :
                          entropy >= 51 ? '#ffd700' : 'var(--danger)';

  section.querySelector('.m3-t-online').textContent = formatTime(entropy, 1e3);
  section.querySelector('.m3-t-gpu').textContent    = formatTime(entropy, 1e9);
  section.querySelector('.m3-t-nsa').textContent    = formatTime(entropy, 1e12);
}

// ── Strings refresh (lang change) ─────────────────────────────────────

function refreshStrings(section) {
  const q = sel => section.querySelector(sel);
  if (q('.m3-wc-label'))      q('.m3-wc-label').textContent      = s('m3_wordcount_label', 'PALABRAS');
  if (q('.m3-generate-label')) q('.m3-generate-label').textContent = s('m3_generate_btn', 'GENERAR ▸');
  if (q('.m3-hint'))           q('.m3-hint').textContent           = s('m3_hint', 'Generá tu primera passphrase segura usando el método Diceware.');
  if (q('.m3-loading-msg'))    q('.m3-loading-msg').textContent    = s('m3_generating', 'GENERANDO...');
  if (q('.m3-copy-label'))     q('.m3-copy-label').textContent     = s('m3_copy_btn', 'COPIAR');
  if (q('.m3-regen'))          q('.m3-regen').textContent          = `↺ ${s('m3_regen_btn', 'REGENERAR')}`;
  if (q('.m3-stat-k'))         q('.m3-stat-k').textContent         = s('m3_entropy_label', 'ENTROPÍA');
  if (q('.m3-sc-title'))       q('.m3-sc-title').textContent       = s('m3_time_title', '// TIEMPO ESTIMADO PARA ROMPERLA');

  const labels = section.querySelectorAll('.m3-sc-label');
  const keys   = ['m3_sc_online', 'm3_sc_gpu', 'm3_sc_nsa'];
  const defs   = ['→ ONLINE (1K/s)', '→ GPU OFFLINE (1B/s)', '→ NIVEL NSA (1T/s)'];
  labels.forEach((el, i) => { el.textContent = s(keys[i], defs[i]); });

  // Re-calcular stats con nuevo idioma si hay un resultado
  if (_lastWords.length) renderStats(section, _lastWords.length);
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

  const hint      = section.querySelector('.m3-hint');
  const loading   = section.querySelector('.m3-loading');
  const result    = section.querySelector('.m3-result');
  const genBtn    = section.querySelector('.m3-generate');
  const regenBtn  = section.querySelector('.m3-regen');
  const copyBtn   = section.querySelector('.m3-copy');
  const copyLabel = section.querySelector('.m3-copy-label');
  const pills     = section.querySelectorAll('.m3-wc-pill');

  // Word count selector
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      _wordCount = parseInt(pill.dataset.count, 10);
      pills.forEach(p => {
        p.classList.toggle('active', p === pill);
        p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
      });
      // Si ya hay un resultado, actualizar stats sin regenerar
      if (_lastWords.length) renderStats(section, _wordCount);
    });
  });

  async function runGenerate() {
    hint.classList.add('hidden');
    result.classList.add('hidden');
    loading.classList.remove('hidden');
    genBtn.disabled = true;

    try {
      await ensureWordlist();
      const { words, dice } = generatePassphrase(_wordlist, _wordCount);
      _lastWords = words;
      _lastDice  = dice;

      loading.classList.add('hidden');
      renderWords(section, words, dice);
      renderPhrase(section, words);
      renderStats(section, words.length);
      result.classList.remove('hidden');
    } catch (err) {
      loading.classList.add('hidden');
      hint.classList.remove('hidden');
      console.error('[shield] diceware error:', err);
    } finally {
      genBtn.disabled = false;
    }
  }

  genBtn.addEventListener('click', runGenerate);
  regenBtn.addEventListener('click', runGenerate);

  // Copiar al portapapeles
  let copyResetTimer = null;
  copyBtn.addEventListener('click', async () => {
    const phrase = section.querySelector('#m3-phrase')?.textContent;
    if (!phrase) return;
    try {
      await navigator.clipboard.writeText(phrase);
      copyLabel.textContent = s('m3_copied', '¡COPIADO!');
      copyBtn.classList.add('m3-copy--done');
      clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => {
        copyLabel.textContent = s('m3_copy_btn', 'COPIAR');
        copyBtn.classList.remove('m3-copy--done');
      }, 2000);
    } catch {
      copyLabel.textContent = s('m3_copy_err', 'ERROR');
      setTimeout(() => { copyLabel.textContent = s('m3_copy_btn', 'COPIAR'); }, 2000);
    }
  });

  document.addEventListener('shield:langchange', e => {
    _lang    = e.detail.lang;
    _strings = e.detail.strings;
    refreshStrings(section);
  });
}
