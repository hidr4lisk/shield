// Motor de i18n — carga JSON y aplica data-i18n attributes al DOM

const SUPPORTED = ['es', 'en'];
const DEFAULT   = 'es';
const STORE_KEY = 'shield_lang';

let currentLang    = DEFAULT;
let currentStrings = {};

function detectLang() {
  const stored = localStorage.getItem(STORE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;

  const browser = (navigator.language ?? 'es').split('-')[0].toLowerCase();
  return SUPPORTED.includes(browser) ? browser : DEFAULT;
}

async function fetchStrings(lang) {
  // Ruta relativa funciona tanto en local (con servidor) como en gh-pages
  const base = document.querySelector('base')?.href ?? location.href;
  const url  = new URL(`src/i18n/${lang}.json`, base);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`i18n: no se pudo cargar ${lang}.json (${resp.status})`);
  return resp.json();
}

function applyStrings(strings) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = strings[el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = strings[el.dataset.i18nHtml];
    if (v !== undefined) el.innerHTML = v;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = strings[el.dataset.i18nPlaceholder];
    if (v !== undefined) el.placeholder = v;
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const v = strings[el.dataset.i18nAria];
    if (v !== undefined) el.setAttribute('aria-label', v);
  });
}

function syncButtons(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  document.documentElement.lang = lang;
}

export async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  try {
    currentStrings = await fetchStrings(lang);
    currentLang    = lang;
    localStorage.setItem(STORE_KEY, lang);
    applyStrings(currentStrings);
    syncButtons(lang);
    document.dispatchEvent(new CustomEvent('shield:langchange', {
      detail: { lang, strings: currentStrings },
    }));
  } catch (err) {
    console.error('[shield/i18n]', err);
  }
}

// Acceso directo a un string desde JS
export function t(key) {
  return currentStrings[key] ?? key;
}

export function getLang() {
  return currentLang;
}

export function getStrings() {
  return currentStrings;
}

export async function initI18n() {
  currentLang = detectLang();
  await setLang(currentLang);
}
